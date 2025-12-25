import React, { useState, useRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

interface Particle {
  id: number;
  x: number;
  color: string;
  tx: string; // transform x trajectory
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  icon,
  className = '',
  onClick,
  disabled,
  ...props 
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseStyles = "relative overflow-visible font-body font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-lg hover:shadow-xl active:scale-95 no-select";
  
  const variants = {
    primary: "bg-gradient-to-r from-romantic-primary to-romantic-accent text-white border border-transparent shadow-[0_4px_15px_rgba(255,77,109,0.3)] hover:shadow-[0_6px_20px_rgba(255,77,109,0.5)]",
    secondary: "bg-white/10 text-romantic-secondary border border-romantic-secondary/30 hover:bg-white/15 hover:border-romantic-secondary/60 backdrop-blur-sm",
    danger: "bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 hover:border-red-400 backdrop-blur-sm",
    ghost: "bg-transparent text-romantic-secondary/70 hover:text-white hover:bg-white/5 border border-transparent shadow-none hover:shadow-none",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-8 py-3.5 text-sm",
    lg: "px-10 py-5 text-lg",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // 1. Green Click Animation
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);

    // 2. Spawn Particles
    const newParticles: Particle[] = [];
    const colors = ['#10b981', '#ff4d6d', '#ffffff', '#fbbf24']; // Green, Pink, White, Gold
    
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * 100, // percentage across button width
        color: colors[Math.floor(Math.random() * colors.length)],
        tx: `${(Math.random() - 0.5) * 100}px` // random spread
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    
    // Cleanup particles
    setTimeout(() => {
      setParticles(prev => prev.slice(12));
    }, 1000);

    if (onClick) onClick(e);
  };

  const clickClass = isClicked 
    ? "!bg-romantic-success !border-romantic-success !text-white !shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-95" 
    : "";

  return (
    <button 
      ref={buttonRef}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''}
        ${clickClass}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 pointer-events-none">
        {icon}
        {children}
      </span>
      
      {/* Soft shine effect overlay on hover */}
      {!isClicked && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
      )}

      {/* Particles Container (Absolute relative to button, but visible overflow) */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-0 w-1.5 h-1.5 rounded-full pointer-events-none animate-particle-fall"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            '--tx': p.tx,
            zIndex: 0
          } as React.CSSProperties}
        />
      ))}
    </button>
  );
};