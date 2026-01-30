
import React, { useState } from 'react';
import { AppView, PlanData, GuideData } from './types';
import { LandingPage } from './components/LandingPage';
import { CameraScan } from './components/CameraScan';
import { IntentSelection } from './components/IntentSelection';
import { BuildOverview } from './components/BuildOverview';
import { GuideSystem } from './components/GuideSystem';
import { AIThinking } from './components/AIThinking';
import { CursorTrail } from './components/CursorTrail';
import { identifyObject, generateCustomPlan } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [objectName, setObjectName] = useState<string>('');
  
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>('');

  const changeView = (newView: AppView) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(newView);
  };

  const handleStart = () => changeView(AppView.CAMERA);

  const handleCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setLoadingMsg('Looking at your object...');
    changeView(AppView.ANALYZING);

    try {
      const detectedName = await identifyObject(imageSrc);
      setObjectName(detectedName);
      changeView(AppView.INTENT_SELECT);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
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
      changeView(AppView.BUILD_OVERVIEW);
    } catch (error) {
      console.error(error);
      alert("Could not create plan. Please try a different goal.");
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
            // Precise query generation
            youtubeQuery: `${planData.title} ${s.title} how to tutorial`
        }))
    };
    
    setGuideData(guide);
    changeView(AppView.GUIDE);
  };

  return (
    <div className="antialiased text-[#1F1F1F] bg-white min-h-screen font-sans selection:bg-[#4285F4]/10 selection:text-[#0B57D0]">
      <CursorTrail />
      <main className="relative z-10">
        {view === AppView.LANDING && (
          <LandingPage onStart={handleStart} onUpload={handleCapture} />
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
              onClose={() => changeView(AppView.BUILD_OVERVIEW)}
              onImprove={() => {}} 
           />
        )}
      </main>
    </div>
  );
};

export default App;
