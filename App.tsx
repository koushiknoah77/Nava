
import React, { useState, useEffect } from 'react';
import { AppView, PlanData, GuideData, UserProfile, ProjectHistory, SkillLevel } from './types';
import { LandingPage } from './components/LandingPage';
import { CameraScan } from './components/CameraScan';
import { IntentSelection } from './components/IntentSelection';
import { BuildOverview } from './components/BuildOverview';
import { GuideSystem } from './components/GuideSystem';
import { AIThinking } from './components/AIThinking';
import { CursorTrail } from './components/CursorTrail';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { ToastProvider, useToast } from './components/Toast';
import { identifyObject, generateCustomPlan } from './services/geminiService';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { auth } from './services/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

const AppContent: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<ProjectHistory[]>([]);
  
  // App Logic State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [objectName, setObjectName] = useState<string>('');
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  const { showToast } = useToast();

  useEffect(() => {
    // This listener handles the initial page load and any auth changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // We do NOT set setIsAuthChecking(true) here. 
        // Setting it to true would cause the App to render the loading spinner, 
        // unmounting the Auth component while the user is trying to log in.
        
        if (firebaseUser) {
          // If logged in, verify email status
          if (firebaseUser.emailVerified) {
             // 1. Try to fetch rich profile from Firestore
             const profile = await authService.getUserProfile(firebaseUser.uid);
             
             if (profile) {
               setUser(profile);
               storageService.saveUser(profile);
             } else {
               // 2. Fallback: Create a profile from Auth data if Firestore failed/empty
               const fallbackProfile: UserProfile = {
                  id: firebaseUser.uid,
                  name: firebaseUser.displayName || 'Builder',
                  email: firebaseUser.email,
                  country: 'Unknown',
                  skillLevel: SkillLevel.BEGINNER,
                  joinedDate: new Date().toISOString(),
                  color: 'bg-blue-600'
               };
               setUser(fallbackProfile);
               storageService.saveUser(fallbackProfile);
             }
          } else {
             // Email NOT verified yet
             // We keep user as null so they see the Landing Page / Login button
             // The Auth component will handle the "Please verify" messaging if they try to log in
             setUser(null);
          }
        } else {
          // User is signed out
          setUser(null);
          storageService.logout();
        }
        
        setHistory(storageService.getHistory());

      } catch (error) {
        console.error("Auth State Sync Error", error);
        setUser(null);
      } finally {
        // CRITICAL: This ensures the loading spinner ALWAYS disappears
        setIsAuthChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const changeView = (newView: AppView) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(newView);
  };

  const handleAuthComplete = (newUser: UserProfile) => {
    setUser(newUser);
    changeView(AppView.LANDING);
    showToast(`Welcome, ${newUser.name}!`, 'success');
  };

  const handleLogout = async () => {
    await authService.logout();
    changeView(AppView.LANDING);
    showToast('Logged out successfully', 'info');
  };

  const handleStart = () => {
    if (user) {
      changeView(AppView.CAMERA);
    } else {
      changeView(AppView.AUTH);
    }
  };

  const handleCapture = async (imageSrc: string) => {
    if (!user) {
        changeView(AppView.AUTH);
        return;
    }

    setCapturedImage(imageSrc);
    setLoadingMsg('Looking at your object...');
    changeView(AppView.ANALYZING);

    try {
      const detectedName = await identifyObject(imageSrc);
      setObjectName(detectedName);
      changeView(AppView.INTENT_SELECT);
    } catch (error) {
      console.error(error);
      showToast("Something went wrong. Please try again.", 'error');
      changeView(AppView.CAMERA);
    }
  };

  const handleAnalyzePlan = async (userCommand: string, referenceImage?: string) => {
    if (!capturedImage) return;

    setLoadingMsg('Creating your plan...');
    changeView(AppView.ANALYZING);

    try {
      const plan = await generateCustomPlan(capturedImage, userCommand, referenceImage);
      setPlanData(plan);
      
      const project = storageService.saveProject(plan, capturedImage);
      setCurrentProjectId(project.id);
      setHistory(storageService.getHistory());

      changeView(AppView.BUILD_OVERVIEW);
      showToast("Plan created!", 'success');
    } catch (error) {
      console.error(error);
      showToast("Could not create plan. Please try a different goal.", 'error');
      changeView(AppView.INTENT_SELECT);
    }
  };

  const handleStartGuide = () => {
    if (!planData) return;
    
    const guide: GuideData = {
        projectName: planData.title,
        steps: planData.steps.map((s, i) => ({
            stepNumber: i + 1,
            title: s.title,
            instruction: s.description,
            visualDescription: s.verificationCriteria || "Check your work before continuing.",
            youtubeQuery: `${planData.title} ${s.title} how to tutorial`
        }))
    };
    
    setGuideData(guide);
    changeView(AppView.GUIDE);
  };

  const handleGuideComplete = () => {
    if (currentProjectId) {
      storageService.markProjectComplete(currentProjectId);
      setHistory(storageService.getHistory());
      showToast("Project completed!", 'success');
    }
    changeView(AppView.BUILD_OVERVIEW);
  };

  if (isAuthChecking) {
     return (
       <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <div className="w-10 h-10 border-4 border-[#1A73E8] border-t-transparent rounded-full animate-spin"></div>
             <div className="text-sm font-medium text-gray-500 animate-pulse">Connecting...</div>
          </div>
       </div>
     );
  }

  return (
    <div className="antialiased text-[#1F1F1F] bg-white min-h-screen font-sans selection:bg-[#4285F4]/10 selection:text-[#0B57D0]">
      <CursorTrail />
      <main className="relative z-10">
        
        {view === AppView.LANDING && (
          <LandingPage 
            onStart={handleStart} 
            onUpload={(img) => {
               if (user) handleCapture(img);
               else changeView(AppView.AUTH);
            }} 
            user={user}
            onProfileClick={() => changeView(AppView.PROFILE)}
          />
        )}

        {view === AppView.AUTH && (
          <Auth 
            onComplete={handleAuthComplete} 
            onBack={() => changeView(AppView.LANDING)}
          />
        )}

        {view === AppView.PROFILE && user && (
          <Profile 
            user={user} 
            history={history} 
            onBack={() => changeView(AppView.LANDING)}
            onLogout={handleLogout}
          />
        )}
        
        {view === AppView.CAMERA && (
          <CameraScan 
            onCapture={handleCapture} 
            onCancel={() => changeView(AppView.LANDING)} 
          />
        )}
        
        {view === AppView.ANALYZING && (
           <AIThinking message={loadingMsg} imageSrc={capturedImage || undefined} />
        )}
        
        {view === AppView.INTENT_SELECT && capturedImage && (
          <IntentSelection 
             objectName={objectName}
             imageSrc={capturedImage}
             onAnalyze={handleAnalyzePlan}
             onBack={() => changeView(AppView.CAMERA)}
          />
        )}
        
        {view === AppView.BUILD_OVERVIEW && planData && capturedImage && (
          <BuildOverview 
            plan={planData}
            imageSrc={capturedImage}
            onBack={() => changeView(AppView.INTENT_SELECT)}
            onStartGuide={handleStartGuide}
          />
        )}

        {view === AppView.GUIDE && guideData && capturedImage && (
           <GuideSystem 
              data={guideData}
              originalImage={capturedImage}
              onClose={handleGuideComplete}
              onImprove={() => {}} 
           />
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
}

export default App;
