import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isMe = message.sender === 'me';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 animate-fade-in">
        <span className="px-4 py-1.5 text-xs text-romantic-secondary/80 border border-romantic-primary/20 rounded-full bg-romantic-primary/5 font-body tracking-wide">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-4 animate-slide-up ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          max-w-[85%] md:max-w-[70%] px-5 py-3.5 break-words relative shadow-md
          ${isMe 
            ? 'bg-gradient-to-br from-romantic-primary to-romantic-accent text-white rounded-[20px] rounded-br-sm' 
            : 'bg-white/10 backdrop-blur-sm text-romantic-text border border-white/10 rounded-[20px] rounded-bl-sm'
          }
        `}
      >
        <p className="text-sm md:text-base font-body leading-relaxed">{message.text}</p>
        <div className={`text-[10px] mt-1.5 ${isMe ? 'text-white/70' : 'text-romantic-secondary/60'} text-right font-body`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};