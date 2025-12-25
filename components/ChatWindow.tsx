import React, { useState, useEffect, useRef } from 'react';
import { Message, ConnectionStatus } from '../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Button } from './Button';
import { Send, LogOut, SkipForward, AlertCircle, Heart, Video, VideoOff, Mic, MicOff, Camera, XCircle } from 'lucide-react';

interface ChatWindowProps {
  status: ConnectionStatus;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  partnerTyping: boolean;
  onNext: () => void;
  onStop: () => void;
  commonInterests: string[];
  error?: string | null;
  onErrorDismiss?: () => void;
  video?: {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    startVideo: () => void;
    stopVideo: () => void;
    toggleCamera: () => void;
    toggleMic: () => void;
    isActive: boolean;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
  }
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  status,
  messages,
  onSendMessage,
  onTyping,
  partnerTyping,
  onNext,
  onStop,
  commonInterests,
  error,
  onErrorDismiss,
  video
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Auto-scroll to bottom logic
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const behavior = messages.length <= 1 ? 'auto' : 'smooth';
    scrollToBottom(behavior);
  }, [messages, partnerTyping, status]);

  // Handle Video Stream Attachments - IMPORTANT for Mobile:
  // We must re-assign srcObject if the stream changes or component re-renders
  useEffect(() => {
    const attachLocal = () => {
      if (localVideoRef.current && video?.localStream) {
        if (localVideoRef.current.srcObject !== video.localStream) {
          localVideoRef.current.srcObject = video.localStream;
          // Explicit play for mobile compliance
          localVideoRef.current.play().catch(e => console.error("Local play error", e));
        }
      }
    };
    attachLocal();
  }, [video?.localStream, video?.isActive]);

  useEffect(() => {
    const attachRemote = () => {
      if (remoteVideoRef.current && video?.remoteStream) {
         if (remoteVideoRef.current.srcObject !== video.remoteStream) {
           remoteVideoRef.current.srcObject = video.remoteStream;
           // Explicit play for mobile compliance
           remoteVideoRef.current.play().catch(e => console.error("Remote play error", e));
         }
      }
    };
    attachRemote();
  }, [video?.remoteStream, video?.isActive]);

  // Auto-focus logic
  useEffect(() => {
    if (status === 'connected') {
      setTimeout(() => inputRef.current?.focus(), 100); 
    }
  }, [status]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && status === 'connected') {
      onSendMessage(inputValue.trim());
      setInputValue('');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      onStop();
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto md:glass-panel md:rounded-3xl overflow-hidden shadow-2xl animate-fade-in relative border-0 md:border border-romantic-primary/20 bg-transparent">
      
      {/* Error Toast */}
      {error && (
        <div className="absolute top-16 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-red-500/90 text-white p-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between border border-red-400/50">
             <div className="flex items-center gap-2">
               <AlertCircle size={20} className="shrink-0" />
               <span className="text-sm font-bold">{error}</span>
             </div>
             {onErrorDismiss && (
               <button onClick={onErrorDismiss} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                 <XCircle size={18} />
               </button>
             )}
          </div>
        </div>
      )}

      {/* Video Overlay Layer (Visible when active) */}
      {video?.isActive && (
        <div className="absolute inset-0 z-10 bg-black flex flex-col transition-all duration-500">
          {/* Remote Video (Main) */}
          <div className="relative flex-1 w-full overflow-hidden bg-black">
            <video 
              ref={remoteVideoRef}
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
              // Adding muted temporarily might help autoplay on some restrictive browsers until user interaction
            />
            {!video.remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-romantic-primary/20 flex items-center justify-center">
                       <Video className="text-romantic-primary" />
                    </div>
                    <span className="text-white/50 text-sm font-body">Waiting for partner video...</span>
                 </div>
              </div>
            )}
          </div>

          {/* Local Video (PiP) */}
          <div className="absolute top-20 right-4 w-24 h-36 md:top-4 md:right-4 md:w-40 md:h-56 bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-white/20">
             <video 
               ref={localVideoRef}
               autoPlay 
               playsInline 
               muted // CRITICAL: Muted is required for autoplay on many mobile devices and prevents feedback
               className="w-full h-full object-cover mirror-mode"
             />
             {!video.localStream && (
               <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                 <Camera className="text-white/20" size={24} />
               </div>
             )}
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-24 md:bottom-20 left-0 right-0 flex justify-center gap-6 p-4 pointer-events-auto">
             <Button variant="secondary" onClick={video.toggleMic} className={`rounded-full !p-4 aspect-square shadow-lg backdrop-blur-xl ${!video.isAudioEnabled ? 'bg-red-500/80 text-white border-red-500' : 'bg-white/20 border-white/20'}`}>
                {video.isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
             </Button>
             <Button variant="danger" onClick={video.stopVideo} className="rounded-full !p-4 aspect-square shadow-lg scale-110">
                <VideoOff size={24} />
             </Button>
             <Button variant="secondary" onClick={video.toggleCamera} className={`rounded-full !p-4 aspect-square shadow-lg backdrop-blur-xl ${!video.isVideoEnabled ? 'bg-red-500/80 text-white border-red-500' : 'bg-white/20 border-white/20'}`}>
                 <Camera size={24} />
             </Button>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="shrink-0 px-4 md:px-6 py-3 border-b border-romantic-primary/10 flex justify-between items-center bg-romantic-panel/90 backdrop-blur-xl z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
              status === 'connected' ? 'bg-green-400 shadow-[0_0_12px_#4ade80]' : 
              status === 'partner_disconnected' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'
            }`} />
            {status === 'connected' && <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-50"></div>}
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-display font-bold text-white tracking-wide flex items-center gap-2">
              {status === 'connected' ? 'Connected' : 
               status === 'partner_disconnected' ? 'Disconnected' : 'Searching...'}
               {status === 'connected' && <Heart size={12} className="text-romantic-primary fill-romantic-primary animate-heartbeat" />}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Start Video Button */}
          {status === 'connected' && !video?.isActive && video && (
            <Button variant="primary" size="sm" onClick={video.startVideo} className="!px-3 !py-1.5 rounded-full mr-2 hidden md:flex">
              <Video size={16} className="mr-1" />
              Video
            </Button>
          )}
          {status === 'connected' && !video?.isActive && video && (
             <button onClick={video.startVideo} className="md:hidden p-2 bg-romantic-primary rounded-full text-white shadow-lg animate-pop mr-2">
                <Video size={16} />
             </button>
          )}

          <Button variant="ghost" size="sm" onClick={onStop} className="!px-3 !py-1.5 bg-white/5 hover:bg-white/10 rounded-full">
            <LogOut size={16} />
          </Button>
          <Button variant="secondary" size="sm" onClick={onNext} className="!px-4 !py-1.5 rounded-full text-xs font-bold border-none bg-white/10 hover:bg-white/20">
            Next
            <SkipForward size={14} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Common Interests Bar (Conditional) */}
      {status === 'connected' && commonInterests.length > 0 && (
        <div className="shrink-0 bg-romantic-primary/5 border-b border-romantic-primary/5 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide backdrop-blur-sm relative z-0">
           <Heart size={12} className="text-romantic-primary shrink-0 fill-current" />
           <span className="text-[10px] text-romantic-primary/90 font-display italic shrink-0">Match:</span>
           <div className="flex gap-1.5">
             {commonInterests.map((tag, i) => (
               <span key={i} className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-body border border-white/10 whitespace-nowrap">
                 {tag}
               </span>
             ))}
           </div>
        </div>
      )}

      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-4 bg-transparent relative scroll-smooth overscroll-contain">
        
        {/* Connection Status Overlay (Searching) */}
        {status === 'searching' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-romantic-bg/60 backdrop-blur-md p-4 text-center animate-fade-in">
             <div className="w-24 h-24 relative mb-6">
                <div className="absolute inset-0 border-4 border-romantic-primary/20 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-2 border-4 border-t-romantic-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="text-romantic-primary animate-heartbeat drop-shadow-[0_0_10px_rgba(255,77,109,0.5)]" size={32} fill="currentColor" />
                </div>
             </div>
             <h3 className="text-xl font-display font-bold text-white mb-2 tracking-wide">Looking for Love...</h3>
             <p className="text-romantic-secondary/80 text-sm font-body">Connecting you to a stranger.</p>
          </div>
        )}

        {status === 'partner_disconnected' && (
           <div className="flex justify-center my-6 animate-fade-in px-4">
             <div className="bg-white/5 border border-white/10 text-romantic-text px-6 py-5 rounded-3xl flex flex-col items-center gap-3 max-w-xs backdrop-blur-xl text-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
               <div className="p-3 bg-red-500/20 rounded-full text-red-300 shadow-inner">
                 <AlertCircle size={28} />
               </div>
               <div>
                 <p className="font-bold font-display text-lg">Partner Left</p>
                 <p className="text-xs opacity-70 font-body mb-4">Don't worry, plenty of fish in the sea.</p>
                 <Button onClick={onNext} variant="primary" fullWidth size="sm" className="rounded-xl">Find New Match</Button>
               </div>
             </div>
           </div>
        )}

        {messages.length === 0 && status === 'connected' && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-70 p-8 animate-pop">
             <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-romantic-primary/20 to-romantic-accent/20 flex items-center justify-center mb-4 text-romantic-primary shadow-[0_0_30px_rgba(255,77,109,0.2)]">
                <Heart size={40} className="animate-pulse" />
             </div>
             <p className="font-display text-white text-2xl mb-2 font-bold">It's a Match!</p>
             <p className="font-body text-sm text-romantic-secondary max-w-xs leading-relaxed">
               You are now connected. Be kind, be charming, be yourself.
             </p>
             {!video?.isActive && (
               <div className="flex gap-2 mt-4">
                 <Button onClick={video?.startVideo} variant="secondary" size="sm" className="rounded-full" icon={<Video size={16} />}>
                   Video Call
                 </Button>
               </div>
             )}
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {partnerTyping && (
          <div className="animate-slide-up ml-2">
            <TypingIndicator />
          </div>
        )}
        
        {/* Invisible anchor for scrolling */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-3 md:p-4 bg-romantic-panel/95 border-t border-white/5 backdrop-blur-xl z-20 relative">
        <form 
          onSubmit={handleSend}
          className="flex items-center gap-2 md:gap-3 max-w-3xl mx-auto" 
        >
          <div className="flex-1 relative group">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={status === 'connected' ? "Type something sweet..." : "Waiting for connection..."}
              disabled={status !== 'connected'}
              className="w-full bg-white/5 text-white placeholder-white/30 border border-white/10 rounded-full px-5 py-3 md:py-3.5 focus:outline-none focus:border-romantic-primary/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(255,77,109,0.1)] transition-all font-body text-sm md:text-base disabled:opacity-50"
              autoComplete="off"
              enterKeyHint="send"
            />
          </div>
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || status !== 'connected'}
            variant="primary"
            className="aspect-square p-0 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full !shadow-lg"
          >
            <Send size={20} className={inputValue.trim() ? "ml-0.5" : ""} />
          </Button>
        </form>
      </div>
    </div>
  );
};