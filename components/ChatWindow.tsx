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
  };
  onlineCount?: number;
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
  video,
  onlineCount
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
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto md:glass-panel md:rounded-3xl overflow-hidden shadow-2xl animate-fade-in relative border-0 md:border border-white/10 bg-black/20 backdrop-blur-sm">

      {/* Error Toast */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-50 animate-slide-up flex justify-center">
          <div className="bg-red-500/90 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between border border-red-400/50 max-w-sm w-full">
            <div className="flex items-center gap-3">
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
          <div className="relative flex-1 w-full overflow-hidden bg-zinc-900">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!video.remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm">
                <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,77,109,0.3)]">
                    <Video className="text-romantic-primary" size={32} />
                  </div>
                  <span className="text-white/70 text-sm font-display tracking-widest uppercase">Waiting for partner...</span>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (PiP) - Repositioned to Bottom Right for Mobile Ergonomics */}
          <div className="absolute bottom-24 right-4 w-28 h-40 md:top-4 md:right-4 md:w-48 md:h-64 bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/20 transition-all hover:scale-105 z-20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror-mode"
            />
            {!video.localStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800/90 backdrop-blur-sm cursor-pointer hover:bg-zinc-700 transition-colors group" onClick={video.startVideo}>
                <Camera className="text-white/50 mb-2 group-hover:text-romantic-primary transition-colors" size={24} />
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider group-hover:text-white transition-colors">Join</span>
              </div>
            )}
            <div className="absolute bottom-2 right-2 flex gap-1">
              <div className={`w-2 h-2 rounded-full ${video.isAudioEnabled ? 'bg-green-500' : 'bg-red-500'} shadow-sm`}></div>
            </div>
          </div>

          {/* Floating Video Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl z-30 transition-transform hover:scale-105">
            <button onClick={video.toggleMic} className={`p-3 rounded-full transition-all ${!video.isAudioEnabled ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              {video.isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button onClick={video.stopVideo} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all active:scale-95">
              <VideoOff size={18} />
              <span className="uppercase tracking-wider text-xs">End</span>
            </button>
            <button onClick={video.toggleCamera} className={`p-3 rounded-full transition-all ${!video.isVideoEnabled ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <Camera size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Header - Glassmorphism */}
      <div className="shrink-0 px-4 md:px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-default">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 shadow-[0_0_10px_currentColor] ${status === 'connected' ? 'bg-green-400 text-green-400' :
              status === 'partner_disconnected' ? 'bg-red-400 text-red-400' : 'bg-amber-400 text-amber-400 animate-pulse'
              }`} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-display font-bold text-white tracking-wide flex items-center gap-2">
              {status === 'connected' ? 'Connected' :
                status === 'partner_disconnected' ? 'Disconnected' : 'Searching...'}
            </h2>
            <p className="text-[10px] text-white/40 font-body flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
              {onlineCount || 0} online
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Action Buttons */}
          <Button variant="ghost" size="sm" onClick={onStop} className="!p-2.5 bg-white/5 hover:bg-white/10 rounded-xl hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </Button>
          <Button variant="secondary" size="sm" onClick={onNext} className="!px-5 !py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/10 hover:bg-white/20 shadow-lg hover:shadow-romantic-primary/20 transition-all">
            Next
            <SkipForward size={14} className="ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Common Interests Bar */}
      {status === 'connected' && commonInterests.length > 0 && (
        <div className="shrink-0 bg-romantic-primary/10 border-b border-white/5 px-4 py-2 flex items-center gap-3 overflow-x-auto scrollbar-hide backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-[10px] text-romantic-primary font-bold uppercase tracking-wider shrink-0">
            <Heart size={10} className="fill-current" />
            Match
          </div>
          <div className="flex gap-1.5">
            {commonInterests.map((tag, i) => (
              <span key={i} className="text-[10px] bg-romantic-primary/20 text-white px-2 py-0.5 rounded-md font-medium border border-romantic-primary/20 whitespace-nowrap">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-4 bg-transparent relative scroll-smooth overscroll-contain">

        {/* Searching Overlay */}
        {status === 'searching' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center animate-fade-in pointer-events-none">
            <div className="absolute inset-0 bg-romantic-bg/50 backdrop-blur-[2px]"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 border-t-2 border-romantic-primary rounded-full animate-spin"></div>
                <div className="absolute inset-3 border-r-2 border-purple-500 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="text-romantic-primary animate-heartbeat" size={28} fill="currentColor" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2 tracking-wide drop-shadow-md">Finding a Match</h3>
              <p className="text-white/60 text-sm font-body">Connecting you to someone special...</p>
            </div>
          </div>
        )}

        {status === 'partner_disconnected' && (
          <div className="flex justify-center my-8 animate-fade-in px-4">
            <div className="glass-panel px-8 py-6 rounded-3xl flex flex-col items-center gap-4 max-w-xs text-center border-white/10">
              <div className="p-4 bg-white/5 rounded-full text-white/50 border border-white/10">
                <AlertCircle size={32} />
              </div>
              <div>
                <p className="font-bold font-display text-lg text-white">Partner Disconnected</p>
                <p className="text-xs text-white/50 font-body mb-5 mt-1">The chat has ended.</p>
                <Button onClick={onNext} variant="primary" fullWidth size="md" className="rounded-xl shadow-lg shadow-romantic-primary/20">Find Next Match</Button>
              </div>
            </div>
          </div>
        )}

        {/* Start Chat Prompt */}
        {messages.length === 0 && status === 'connected' && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-80 p-8 animate-pop">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-romantic-primary/20 to-romantic-secondary/10 flex items-center justify-center mb-6 border border-romantic-primary/20 shadow-[0_0_40px_rgba(255,77,109,0.15)]">
              <Heart size={48} className="text-romantic-primary animate-pulse" />
            </div>
            <p className="font-display text-white text-3xl mb-3 font-bold tracking-tight">System Matched!</p>
            <p className="font-body text-sm text-white/60 max-w-[200px] leading-relaxed mb-6">
              Say hello! Be polite, safe, and charming.
            </p>
            {!video?.isActive && (
              <Button onClick={video?.startVideo} variant="secondary" size="sm" className="rounded-full bg-white/10 hover:bg-white/20 border-white/10 text-xs font-bold px-6" icon={<Video size={16} />}>
                Start Video Call
              </Button>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {partnerTyping && (
          <div className="animate-slide-up pl-2 mt-2">
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-3 md:p-5 bg-black/40 border-t border-white/5 backdrop-blur-xl z-20">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-3 max-w-3xl mx-auto"
        >
          <div className="flex-1 relative group">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={status === 'connected' ? "Type a message..." : "Waiting..."}
              disabled={status !== 'connected'}
              className="w-full bg-white/5 text-white placeholder-white/30 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-romantic-primary/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(255,77,109,0.1)] transition-all font-body text-sm md:text-base disabled:opacity-50"
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            disabled={!inputValue.trim() || status !== 'connected'}
            variant="primary"
            className="aspect-square p-0 w-12 h-12 flex items-center justify-center rounded-2xl !shadow-lg hover:rotate-6 transition-transform"
          >
            <Send size={20} className={inputValue.trim() ? "ml-0.5" : ""} />
          </Button>
        </form>
      </div>
    </div>
  );
};