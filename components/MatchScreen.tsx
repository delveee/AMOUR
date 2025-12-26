import React, { useState } from 'react';
import { Button } from './Button';
import { Heart, Users, Sparkles, User, Tag, X, Github, Coffee, Video } from 'lucide-react';
import { AnimatedCount } from './AnimatedCount';

interface MatchScreenProps {
  onFindMatch: (interests: string[], mode: 'text' | 'video') => void;
  onlineCount?: number;
}

export const MatchScreen: React.FC<MatchScreenProps> = ({ onFindMatch, onlineCount = 0 }) => {
  const [interests, setInterests] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleAddInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (interests.length < 10 && !interests.includes(inputValue.trim().toLowerCase())) {
        setInterests([...interests, inputValue.trim().toLowerCase()]);
        setInputValue('');
      }
    }
  };

  const removeInterest = (tag: string) => {
    setInterests(interests.filter(i => i !== tag));
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto text-center animate-fade-in overflow-y-auto custom-scrollbar overflow-x-hidden relative scroll-smooth">

      {/* Main Scrollable Content Area */}
      {/* Added larger padding-bottom (pb-12) and mb-8 to ensure gap before footer */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] w-full p-4 md:p-6 pb-12">

        {/* Hero Section */}
        <div className="mb-10 relative px-4 w-full">
          {/* Animated Glow Behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gradient-to-tr from-romantic-primary/20 via-purple-500/10 to-romantic-accent/20 blur-[60px] rounded-full animate-pulse-slow pointer-events-none" />

          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 bg-white/5 rounded-full backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors cursor-default">
            <Heart className="text-romantic-primary fill-romantic-primary mr-2 animate-heartbeat" size={16} />
            <span className="text-romantic-secondary text-xs font-bold tracking-widest uppercase">Anonymous Dating</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-display font-medium mb-6 text-white tracking-tight relative z-10 drop-shadow-2xl break-words">
            Amour<span className="text-romantic-primary">.</span>
          </h1>
          <p className="text-base md:text-xl text-romantic-text/80 font-body max-w-lg mx-auto leading-relaxed relative z-10">
            The world's most romantic way to meet strangers. <br className="hidden md:block" />
            <span className="text-romantic-secondary italic">Safe. Encrypted. Serendipitous.</span>
          </p>
        </div>

        {/* Interest Filter Section */}
        <div className="w-full max-w-md mb-8 relative z-10 px-4">
          <div className="glass-panel p-1.5 rounded-[2rem] border border-white/20 flex flex-wrap items-center gap-2 min-h-[60px] bg-white/5 focus-within:bg-white/10 focus-within:border-romantic-primary/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-romantic-primary/5">
            <div className="pl-3 pr-1 text-romantic-primary/70 shrink-0">
              <Tag size={18} />
            </div>

            {interests.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-gradient-to-r from-romantic-primary to-romantic-accent text-white text-xs px-3 py-1.5 rounded-full font-bold border border-white/10 animate-pop shadow-md max-w-full truncate">
                <span className="truncate max-w-[100px]">{tag}</span>
                <button onClick={() => removeInterest(tag)} className="hover:text-white/70 transition-colors ml-0.5 p-0.5 shrink-0">
                  <X size={12} />
                </button>
              </span>
            ))}

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleAddInterest}
              placeholder={interests.length === 0 ? "Add interests (e.g. books)..." : "Add..."}
              className="flex-1 bg-transparent border-none outline-none text-white text-sm px-2 py-2 placeholder-white/30 font-body min-w-[80px]"
              maxLength={25}
            />
          </div>
          <div className="text-xs text-romantic-secondary/50 mt-4 font-body tracking-wide">
            {interests.length === 0 ? "TAP BUTTON FOR RANDOM MATCH" : `LOOKING FOR: ${interests.join(', ').toUpperCase()}`}
          </div>
        </div>

        {/* Main Action Button */}
        <div className="relative group mb-16 w-full max-w-xs mx-auto z-10 px-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-romantic-primary via-purple-500 to-romantic-accent rounded-full blur opacity-50 group-hover:opacity-80 transition duration-500 group-hover:duration-200 animate-pulse-slow"></div>
          <Button
            size="lg"
            fullWidth
            onClick={() => onFindMatch(interests, 'text')}
            className="relative h-16 text-xl rounded-full shadow-2xl tracking-wide"
            icon={<Heart className="animate-pulse fill-white/30" size={24} />}
          >
            {interests.length > 0 ? "Find Soulmate" : "Start Chatting"}
          </Button>
        </div>

        {/* Stats Grid - Increased bottom margin significantly */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-3xl z-10 px-4 mb-12">
          <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
            <p className="text-xl md:text-2xl font-bold text-white font-display mb-1">
              <AnimatedCount value={onlineCount || 1} />
            </p>
            <p className="text-[9px] md:text-[10px] text-romantic-secondary/60 uppercase tracking-widest font-bold">Online</p>
          </div>
          <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
            <p className="text-xl md:text-2xl font-bold text-white font-display mb-1">~24ms</p>
            <p className="text-[9px] md:text-[10px] text-romantic-secondary/60 uppercase tracking-widest font-bold">Latency</p>
          </div>
          <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
            <p className="text-xl md:text-2xl font-bold text-white font-display mb-1">100%</p>
            <p className="text-[9px] md:text-[10px] text-romantic-secondary/60 uppercase tracking-widest font-bold">Privacy</p>
          </div>
        </div>
      </div>

      {/* Footer - shrink-0 prevents collapse, z-20 puts it above, solid semi-transparent background */}
      <footer className="mt-auto shrink-0 w-full max-w-4xl mx-auto border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/30 font-body gap-4 py-6 px-6 relative z-20 bg-romantic-bg/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span>&copy; 2024 AMOUR CHAT</span>
          <span>&bull;</span>
          <span>v3.0.0</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-romantic-primary transition-colors flex items-center gap-1">
            <Github size={12} /> Open Source
          </a>
          <a href="#" className="hover:text-romantic-primary transition-colors flex items-center gap-1">
            <Coffee size={12} /> Donate
          </a>
          <a href="#" className="hover:text-romantic-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-romantic-primary transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
};