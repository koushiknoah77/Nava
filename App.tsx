
import React, { useState, useEffect } from 'react';
import { AppView, PlanData, GuideData, UserProfile, ProjectHistory } from './types';
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
  
  const { showToast } = useToast();

  useEffect(() => {
    // Load User and History on Mount
    const loadedUser = storageService.getUser();
    if (loadedUser) {
      setUser(loadedUser);
    }
    setHistory(storageService.getHistory());
  }, []);

  const changeView = (newView: AppView) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(newView);
  };

  const handleAuthComplete = (newUser: UserProfile) => {
    storageService.saveUser(newUser);
    setUser(newUser);
    // Redirect to Landing Page so user can choose between Camera or Upload
    changeView(AppView.LANDING);
    showToast(`Welcome, ${newUser.name}!`, 'success');
  };

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
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
    // Ensure user is logged in before capturing (double check logic)
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
      
      // Save to History
      const project = storageService.saveProject(plan, capturedImage);
      setCurrentProjectId(project.id);
      setHistory(storageService.getHistory()); // Update local history state

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
          <Auth onComplete={handleAuthComplete} />
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
