import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 p-3 bg-romantic-panel rounded-2xl rounded-bl-none w-fit border border-romantic-primary/10">
      <div className="w-2 h-2 bg-romantic-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-romantic-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-romantic-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      <span className="ml-2 text-xs text-romantic-secondary/70 font-body tracking-wider">typing...</span>
    </div>
  );
};