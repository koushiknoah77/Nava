
import React from 'react';
import { UserProfile, ProjectHistory } from '../types';
import { ArrowLeft, Award, FolderOpen, Calendar, LogOut, MapPin, Mail, ChevronRight, Star, TrendingUp, Sparkles, LayoutGrid } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  history: ProjectHistory[];
  onBack: () => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, history, onBack, onLogout }) => {
  const completedCount = history.filter(h => h.status === 'Completed').length;
  
  return (
    <div className="min-h-screen bg-[#F0F4F9] text-[#1F1F1F] font-sans relative overflow-x-hidden">
      
      {/* Ambient Backgrounds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-gradient-to-br from-[#E8F0FE]/60 to-transparent rounded-full blur-[120px]"></div>
         <div className="absolute top-[20%] -left-[10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-[#FCE8E6]/40 to-transparent rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
         <div className="absolute inset-0 bg-[#F0F4F9]/80 backdrop-blur-xl border-b border-white/50"></div>
         
         <div className="relative z-10 flex items-center gap-4">
            <button 
                onClick={onBack} 
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E3E3E3] hover:scale-105 transition-transform group"
            >
                <ArrowLeft size={20} className="text-[#5E5E5E] group-hover:text-[#1F1F1F]" />
            </button>
            <span className="font-display font-medium text-lg text-[#1F1F1F]/80">Profile</span>
         </div>

         <button 
            onClick={onLogout} 
            className="relative z-10 w-12 h-12 bg-white/50 rounded-full flex items-center justify-center border border-transparent hover:bg-white hover:border-[#E3E3E3] hover:shadow-sm text-[#5E5E5E] hover:text-[#EA4335] transition-all" 
            title="Sign out"
         >
            <LogOut size={18} />
         </button>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8 relative z-10 pb-32">
         
         {/* Top Section: Profile & Stats (Bento Grid) */}
         <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12 animate-fade-up">
            
            {/* User Card - Large (Span 8) */}
            <div className="md:col-span-8 bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-[#E3E3E3] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                    <Star size={200} fill="currentColor" />
                </div>
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 h-full">
                    <div className="relative">
                        <div className={`w-32 h-32 rounded-3xl ${user.color} flex items-center justify-center text-white text-5xl font-display font-medium shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-500`}>
                            {user.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-3 -right-3 bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md border border-[#E3E3E3] flex items-center gap-1 text-[#1F1F1F]">
                            <Sparkles size={10} className="text-[#FBBC04]" fill="currentColor" />
                            {user.skillLevel}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full pt-2">
                        <h1 className="text-4xl md:text-5xl font-display font-medium text-[#1F1F1F] mb-3 tracking-tight">
                            {user.name}
                        </h1>
                        <div className="space-y-2 text-[#5E5E5E]">
                             <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                                <Mail size={14} className="opacity-50" />
                                <span>{user.email}</span>
                             </div>
                             <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                                <MapPin size={14} className="opacity-50" />
                                <span>{user.country}</span>
                             </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                           <span className="px-3 py-1 bg-[#F0F4F9] rounded-full text-xs font-medium text-[#444746] border border-[#E3E3E3]">Builder</span>
                           <span className="px-3 py-1 bg-[#F0F4F9] rounded-full text-xs font-medium text-[#444746] border border-[#E3E3E3]">Visionary</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Column (Span 4) */}
            <div className="md:col-span-4 flex flex-col gap-6">
                
                {/* Progress Card */}
                <div className="flex-1 bg-white rounded-[32px] p-6 shadow-sm border border-[#E3E3E3] flex flex-col justify-center relative overflow-hidden group hover:border-[#D3E3FD] transition-colors">
                    <div className="flex items-center justify-between mb-2 relative z-10">
                        <span className="text-[10px] font-bold text-[#5E5E5E] uppercase tracking-widest">Total Projects</span>
                        <FolderOpen size={18} className="text-[#1A73E8]" />
                    </div>
                    <div className="text-5xl font-display font-medium text-[#1F1F1F] mb-4 relative z-10 tracking-tighter">
                        {String(history.length).padStart(2, '0')}
                    </div>
                    <div className="w-full h-1.5 bg-[#F1F3F4] rounded-full overflow-hidden relative z-10">
                        <div className="h-full bg-[#1A73E8] rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(5, history.length * 10))}%` }}></div>
                    </div>
                </div>

                {/* Achievements Card - Dark Theme Contrast */}
                <div className="flex-1 bg-[#1F1F1F] text-white rounded-[32px] p-6 shadow-md border border-white/10 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-2 relative z-10">
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Completed</span>
                        <Award size={18} className="text-[#FBBC04]" />
                    </div>
                    <div className="text-5xl font-display font-medium text-white mb-1 relative z-10 tracking-tighter">
                        {String(completedCount).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-white/50 font-mono mt-2">
                        Mastery Level {Math.floor(completedCount / 3) + 1}
                    </div>
                </div>
            </div>

         </div>

         {/* History Section */}
         <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl font-display font-medium text-[#1F1F1F] flex items-center gap-3">
                   Activity
                </h2>
                
                <div className="hidden md:flex bg-white p-1 rounded-full border border-[#E3E3E3]">
                    <button className="px-4 py-1.5 rounded-full bg-[#1F1F1F] text-white text-xs font-bold uppercase tracking-wider shadow-sm">All</button>
                    <button className="px-4 py-1.5 rounded-full bg-transparent text-[#5E5E5E] text-xs font-bold uppercase tracking-wider hover:bg-[#F0F4F9]">Saved</button>
                </div>
            </div>

            {history.length === 0 ? (
               <div className="bg-white rounded-[32px] p-20 text-center border border-dashed border-[#E3E3E3] flex flex-col items-center justify-center h-[400px]">
                  <div className="w-20 h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mb-6 text-[#BDC1C6] animate-pulse-slow">
                     <LayoutGrid size={32} />
                  </div>
                  <h3 className="text-2xl font-display font-medium text-[#1F1F1F] mb-3">Your canvas is empty</h3>
                  <p className="text-[#5E5E5E] max-w-sm mx-auto mb-8 leading-relaxed">
                     Ready to build something amazing? Use the camera to start your first project.
                  </p>
                  <button onClick={onBack} className="bg-[#1A73E8] text-white px-8 py-3 rounded-full text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all">
                      Create New Project
                  </button>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((project, i) => (
                     <div 
                        key={project.id} 
                        className="group bg-white rounded-[28px] overflow-hidden border border-[#E3E3E3] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative"
                     >
                        {/* Image Area */}
                        <div className="aspect-[4/3] bg-[#F1F3F4] relative overflow-hidden">
                           {project.thumbnail ? (
                              <img 
                                src={project.thumbnail} 
                                alt={project.title} 
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#BDC1C6] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"><FolderOpen size={32}/></div>
                           )}
                           
                           {/* Overlay Gradient */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                           
                           {/* Status Badge */}
                           <div className="absolute top-4 left-4">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/20 ${
                                   project.status === 'Completed' ? 'bg-[#34A853]/90 text-white' : 'bg-white/90 text-[#1F1F1F]'
                               }`}>
                                   {project.status}
                               </span>
                           </div>
                        </div>
                        
                        {/* Content Area */}
                        <div className="p-6 flex-1 flex flex-col">
                           <div className="flex justify-between items-start mb-2">
                               <h3 className="text-xl font-bold text-[#1F1F1F] line-clamp-1 group-hover:text-[#1A73E8] transition-colors">
                                   {project.title}
                               </h3>
                           </div>
                           
                           <div className="flex items-center gap-2 text-xs text-[#5E5E5E] mb-4">
                                <Calendar size={12} />
                                {new Date(project.date).toLocaleDateString()}
                           </div>
                           
                           <div className="mt-auto pt-4 border-t border-[#F1F3F4] flex items-center justify-between">
                               <div className="flex items-center gap-2 text-xs font-bold text-[#5E5E5E] uppercase tracking-wider">
                                   <TrendingUp size={14} className={project.difficulty === 'Hard' ? 'text-[#EA4335]' : project.difficulty === 'Medium' ? 'text-[#FBBC04]' : 'text-[#34A853]'} />
                                   {project.difficulty}
                               </div>
                               <button className="w-8 h-8 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#1F1F1F] group-hover:bg-[#1A73E8] group-hover:text-white transition-colors">
                                   <ChevronRight size={16} />
                               </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

      </main>
    </div>
  );
};
