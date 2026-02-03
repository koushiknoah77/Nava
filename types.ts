
export enum AppView {
  LANDING = 'LANDING',
  AUTH = 'AUTH',                   // New: Sign up screen
  PROFILE = 'PROFILE',             // New: User history
  CAMERA = 'CAMERA',
  ANALYZING = 'ANALYZING',
  INTENT_SELECT = 'INTENT_SELECT', // Command Center
  BUILD_HUB = 'BUILD_HUB',         // List of options (Optional path)
  BUILD_OVERVIEW = 'BUILD_OVERVIEW', // Detailed Plan View
  GUIDE = 'GUIDE',                 // Step-by-step
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export enum SkillLevel {
  BEGINNER = 'Beginner',
  STUDENT = 'Student',
  MAKER = 'Maker',
}

export enum AnalysisType {
  DIAGNOSE = 'DIAGNOSE',
  SAFETY = 'SAFETY',
  AUDIT = 'AUDIT',
  REPAIR = 'REPAIR',
  AUGMENT = 'AUGMENT',
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;     // Added
  country: string;   // Added
  skillLevel: SkillLevel;
  joinedDate: string;
  color: string;
}

export interface ProjectHistory {
  id: string;
  title: string;
  date: string;
  thumbnail?: string;
  status: 'In Progress' | 'Completed';
  difficulty: string;
}

export interface Directive {
  id: AnalysisType;
  title: string;
  subtitle: string;
  question: string;
  icon: string;
  color: string;
}

export interface PlanData {
  title: string;
  description: string;
  analysis: string; // "What's Wrong or Missing?"
  feasibility: {
    status: 'Yes' | 'Partially' | 'Not Safe' | 'No';
    explanation: string; // "Can This Be Done?" short reason
  };
  changes: {
    add: string[];
    remove: string[];
    modify: string[];
  };
  steps: {
    title: string;
    description: string;
    verificationCriteria: string; // New field for advanced verification logic
  }[];
  safetyWarning: string[];
  alternatives: string[];
  estimatedTime: string;
  difficulty: Difficulty;
}

// Keeping BuildOption for backward compatibility or generic lists if needed
export interface BuildOption extends PlanData {
  id: string;
  materialsNeeded: string[]; // Mapped from changes.add
  toolsNeeded: string[];
}

export interface GuideStep {
  stepNumber: number;
  title: string;
  instruction: string;
  visualDescription: string;
  youtubeQuery: string;
}

export interface GuideData {
  projectName: string;
  steps: GuideStep[];
}

export interface AnalysisResult {
  detectedObject: string;
  context: string;
  safetyRating?: string;
  advice?: string;
  steps?: string[];
}

export interface AppState {
  view: AppView;
  capturedImage?: string; // The "What you have"
  referenceImage?: string; // The "What you want" (Optional)
  userCommand?: string;    // The "Goal"
  objectName?: string;
  planData?: PlanData | null;
  guideData?: GuideData | null;
  user?: UserProfile | null;
}
