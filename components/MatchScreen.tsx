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
    <div className="flex flex-col h-full items-center justify-center p-4 relative z-10 animate-fade-in w-full max-w-lg mx-auto">

      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-romantic-primary/20 blur-[60px] rounded-full animate-pulse-slow"></div>
        <div className="relative z-10">
          <div className="mb-4 inline-block p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(255,77,109,0.2)] animate-float">
            <Sparkles className="text-romantic-primary animate-pulse" size={48} />
          </div>
          <h1 className="font-display font-bold text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-romantic-secondary to-white drop-shadow-sm mb-2 tracking-tight">
            Amour
          </h1>
          <p className="text-romantic-secondary/80 text-lg md:text-xl font-light tracking-wide">
            Where strangers become soulmates.
          </p>
        </div>
      </div>

      {/* Interest Input - Glassmorphism */}
      <div className="w-full space-y-4 mb-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-romantic-primary/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-xl transition-all group-focus-within:border-romantic-primary/50 group-focus-within:shadow-[0_0_20px_rgba(255,77,109,0.15)]">
            <Tag className="text-white/40 ml-3 shrink-0" size={20} />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleAddInterest}
              placeholder="Add interests (music, movies, love)..."
              className="flex-1 bg-transparent border-none text-white placeholder-white/30 px-3 py-3 focus:outline-none font-body text-base md:text-lg"
            />
            <button
              onClick={() => {
                if (inputValue.trim()) {
                  // Mimic keydown logic for button click
                  if (interests.length < 10 && !interests.includes(inputValue.trim().toLowerCase())) {
                    setInterests([...interests, inputValue.trim().toLowerCase()]);
                    setInputValue('');
                  }
                }
              }}
              disabled={!inputValue.trim()}
              className="p-2 bg-white/10 hover:bg-romantic-primary/80 disabled:opacity-30 disabled:hover:bg-white/10 rounded-xl transition-all text-white shadow-lg"
            >
              <Sparkles size={20} />
            </button>
          </div>
        </div>

        {/* Tags Display */}
        <div className="flex flex-wrap gap-2 justify-center min-h-[30px] transition-all">
          {interests.map((interest, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white/90 flex items-center gap-1.5 animate-pop hover:bg-white/10 transition-colors cursor-default"
            >
              {interest}
              <button
                onClick={() => removeInterest(interest)}
                className="hover:text-romantic-primary transition-colors p-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {interests.length === 0 && (
            <span className="text-white/20 text-sm italic font-light animate-pulse">Try adding typical interests...</span>
          )}
        </div>
      </div>

      {/* Main Action Button - Neon Glow */}
      <div className="relative group mb-16 w-full max-w-sm mx-auto z-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-romantic-primary via-purple-500 to-romantic-accent rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse-glow"></div>
        <Button
          size="lg"
          fullWidth
          onClick={() => onFindMatch(interests, 'text')} /* Default to unified entry */
          className="relative h-16 text-xl rounded-full shadow-2xl tracking-wide bg-black/50 backdrop-blur-xl border border-white/20 hover:bg-white/10 active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_2s_infinite]"></div>
          <span className="relative flex items-center justify-center gap-2 font-display font-bold">
            <Heart className="fill-romantic-primary text-romantic-primary animate-heartbeat" size={24} />
            Start Chatting
          </span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors group">
          <Users className="text-romantic-primary mb-1 group-hover:scale-110 transition-transform" size={24} />
          <span className="text-2xl font-bold font-display text-white">
            <AnimatedCount end={onlineCount || 0} />
          </span>
          <span className="text-xs text-romantic-secondary uppercase tracking-wider font-bold">Online</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors group">
          <Sparkles className="text-cyan-400 mb-1 group-hover:scale-110 transition-transform" size={24} />
          <span className="text-2xl font-bold font-display text-white">
            <AnimatedCount end={(onlineCount || 0) * 12 + 450} />
          </span>
          <span className="text-xs text-cyan-200/70 uppercase tracking-wider font-bold">Matches</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 flex gap-6 text-white/30">
        <a href="#" className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Github size={20} /></a>
        <a href="#" className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Coffee size={20} /></a>
      </div>
    </div>
  );
};