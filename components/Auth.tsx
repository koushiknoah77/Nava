
import React, { useState } from 'react';
import { UserProfile, SkillLevel } from '../types';
import { Sparkles, User, Hammer, Lightbulb, ArrowRight, Check, MapPin, Mail, Shield, Zap } from 'lucide-react';

interface AuthProps {
  onComplete: (user: UserProfile) => void;
}

const COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-violet-600',
  'bg-slate-700'
];

// Ultra-clean input component
const InputField = ({ 
  label, 
  value, 
  onChange, 
  id, 
  type = 'text', 
  autoFocus = false,
  onEnter,
  placeholder,
  error,
  icon: Icon
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  id: string, 
  type?: string,
  autoFocus?: boolean,
  onEnter?: () => void,
  placeholder?: string,
  error?: boolean,
  icon?: React.ElementType
}) => (
  <div className="group relative transition-all duration-300">
    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#1F1F1F]'}`}>
        {Icon && <Icon size={20} />}
    </div>
    <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter && onEnter()}
        className={`
          w-full pl-12 pr-4 py-4 bg-white/50 border rounded-2xl text-[#1F1F1F] font-medium outline-none transition-all duration-300
          placeholder:text-gray-400/70
          ${error 
            ? 'border-red-200 bg-red-50/50 focus:border-red-500' 
            : 'border-white/60 hover:border-white focus:bg-white focus:border-white focus:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-gray-100/50'
          }
        `}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
    />
    <label 
        htmlFor={id} 
        className={`absolute left-12 transition-all duration-300 pointer-events-none font-medium ${
            value ? '-top-6 text-xs text-gray-500' : 'top-1/2 -translate-y-1/2 text-transparent'
        }`}
    >
        {label}
    </label>
  </div>
);

export const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    skill: SkillLevel.BEGINNER,
    color: COLORS[0]
  });
  
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.country.trim()) {
        setError('Please complete all fields.');
        return;
      }
      if (!formData.email.includes('@')) {
        setError('Invalid email address.');
        return;
      }
      setError('');
      setIsExiting(true);
      setTimeout(() => {
          setStep(2);
          setIsExiting(false);
      }, 300);
    } else {
      const newUser: UserProfile = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        country: formData.country.trim(),
        skillLevel: formData.skill,
        joinedDate: new Date().toISOString(),
        color: formData.color
      };
      onComplete(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-black/5 selection:text-black">
        
        {/* Clean Wow Background: Subtle Organic Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] animate-blob mix-blend-multiply"></div>
            <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-pink-100/40 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply"></div>
        </div>

        <div className="w-full max-w-[500px] relative z-10 perspective-[1000px]">
            
            {/* Minimalist Header */}
            <div className={`text-center mb-12 transition-all duration-500 ease-out transform ${isExiting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-[24px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] mb-8 border border-white/50">
                    <Sparkles size={24} className="text-[#1F1F1F]" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-display font-medium text-[#1F1F1F] mb-3 tracking-tight">
                    {step === 1 ? 'Welcome' : 'Your Persona'}
                </h1>
                <p className="text-[#5E5E5E] text-lg font-light tracking-wide">
                   {step === 1 ? 'Start your journey with NAVA.' : 'Customize your builder profile.'}
                </p>
            </div>

            {/* Premium Glass Card */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-[40px] p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-white/80 ring-1 ring-white/50 relative overflow-hidden transition-all duration-500">
                
                <div className={`transition-all duration-500 ${isExiting ? 'opacity-0 scale-95 translate-x-[-10px]' : 'opacity-100 scale-100 translate-x-0'}`}>
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <InputField
                                    id="name"
                                    label="Full Name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={(v) => setFormData(p => ({...p, name: v}))}
                                    autoFocus
                                    error={!!error && !formData.name}
                                    icon={User}
                                />
                                <InputField
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={(v) => setFormData(p => ({...p, email: v}))}
                                    error={!!error && !formData.email}
                                    icon={Mail}
                                />
                                <InputField
                                    id="country"
                                    label="Location"
                                    placeholder="Location"
                                    value={formData.country}
                                    onChange={(v) => setFormData(p => ({...p, country: v}))}
                                    onEnter={handleNext}
                                    error={!!error && !formData.country}
                                    icon={MapPin}
                                />
                            </div>
                            
                            {error && (
                                <div className="text-red-500 text-sm font-medium bg-red-50/50 p-4 rounded-2xl flex items-center gap-3 animate-shake border border-red-100">
                                    <Shield size={16} />
                                    {error}
                                </div>
                            )}

                            <button 
                                onClick={handleNext}
                                className="w-full h-16 mt-6 bg-[#1F1F1F] text-white rounded-[20px] font-bold text-lg hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3 group"
                            >
                                Continue
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform opacity-70 group-hover:opacity-100" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            
                            {/* Skills Section */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Builder Type</label>
                                <div className="grid gap-3">
                                    {[
                                        { id: SkillLevel.BEGINNER, icon: Sparkles, label: 'Beginner', text: 'Step-by-step guidance' },
                                        { id: SkillLevel.STUDENT, icon: Lightbulb, label: 'Learner', text: 'Explain the details' },
                                        { id: SkillLevel.MAKER, icon: Hammer, label: 'Pro Maker', text: 'Just the plans' },
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setFormData(p => ({...p, skill: option.id}))}
                                            className={`group relative flex items-center gap-5 p-4 rounded-[24px] border transition-all duration-300 text-left ${
                                                formData.skill === option.id 
                                                ? 'border-blue-100 bg-blue-50/50 shadow-sm' 
                                                : 'border-transparent bg-white/50 hover:bg-white hover:shadow-sm'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                                formData.skill === option.id ? 'bg-[#1A73E8] text-white shadow-md rotate-3' : 'bg-white text-gray-400'
                                            }`}>
                                                <option.icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-base font-bold transition-colors ${formData.skill === option.id ? 'text-[#1A73E8]' : 'text-[#1F1F1F]'}`}>
                                                    {option.label}
                                                </div>
                                                <div className="text-sm text-[#5E5E5E] font-medium opacity-70">
                                                    {option.text}
                                                </div>
                                            </div>
                                            {formData.skill === option.id && (
                                                <div className="text-[#1A73E8] bg-white rounded-full p-1.5 shadow-sm animate-scale-in">
                                                    <Check size={14} strokeWidth={4} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selection */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Signature Color</label>
                                <div className="flex justify-between items-center bg-white/40 p-5 rounded-[24px] border border-white/40">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setFormData(p => ({...p, color}))}
                                            className={`w-10 h-10 rounded-full transition-all duration-300 relative ${color} ${
                                                formData.color === color ? 'ring-4 ring-offset-4 ring-white scale-110 shadow-lg' : 'hover:scale-110 opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            {formData.color === color && (
                                                <span className="absolute inset-0 flex items-center justify-center text-white animate-scale-in">
                                                    <Check size={14} strokeWidth={3} />
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                 <button 
                                    onClick={() => {
                                        setIsExiting(true);
                                        setTimeout(() => { setStep(1); setIsExiting(false); }, 300);
                                    }}
                                    className="h-16 w-16 rounded-[20px] bg-white/50 hover:bg-white text-[#1F1F1F] flex items-center justify-center transition-all border border-transparent hover:border-gray-100 hover:shadow-sm"
                                >
                                    <ArrowRight className="rotate-180" size={24} />
                                </button>
                                <button 
                                    onClick={handleNext}
                                    className="flex-1 h-16 bg-[#1F1F1F] text-white rounded-[20px] font-bold text-lg hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3"
                                >
                                    Complete Profile
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>
            
            <div className={`mt-10 text-center transition-all duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-pulse"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Secure Environment
                    </span>
                 </div>
            </div>

        </div>
    </div>
  );
};
