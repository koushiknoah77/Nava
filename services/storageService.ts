
import { UserProfile, ProjectHistory, PlanData } from '../types';

const USER_KEY = 'nava_user_profile';
const HISTORY_KEY = 'nava_project_history';

export const storageService = {
  // User Management
  saveUser: (user: UserProfile): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): UserProfile | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  // Project History
  saveProject: (plan: PlanData, thumbnail: string): ProjectHistory => {
    const history = storageService.getHistory();
    
    const newProject: ProjectHistory = {
      id: Date.now().toString(),
      title: plan.title,
      date: new Date().toISOString(),
      thumbnail: thumbnail, // We save the base64 thumbnail for the history view
      status: 'In Progress',
      difficulty: plan.difficulty
    };

    const updatedHistory = [newProject, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return newProject;
  },

  markProjectComplete: (projectId: string): void => {
    const history = storageService.getHistory();
    const updated = history.map(p => 
      p.id === projectId ? { ...p, status: 'Completed' as const } : p
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  },

  getHistory: (): ProjectHistory[] => {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  }
};
