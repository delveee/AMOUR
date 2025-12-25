import React from 'react';
import { MatchScreen } from './components/MatchScreen';
import { ChatWindow } from './components/ChatWindow';
import { useChat } from './hooks/useChat';
import { Heart } from 'lucide-react';

const App: React.FC = () => {
  const { 
    status, 
    messages, 
    partnerTyping, 
    onlineCount,
    commonInterests,
    joinQueue, 
    sendMessage, 
    sendTyping, 
    nextPartner, 
    leaveChat,
    video,
    error,
    setError
  } = useChat();

  return (
    // Main container uses 100dvh for mobile browsers
    <div className="h-[100dvh] w-full bg-romantic-bg text-romantic-text font-body selection:bg-romantic-primary/30 selection:text-white overflow-hidden flex flex-col relative overscroll-none">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#2d1b24_0%,_#0f0508_80%)]" />
        {/* Animated Orbs */}
        <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] bg-romantic-primary/5 rounded-full blur-[80px] animate-float opacity-60" />
        <div className="absolute bottom-[10%] right-[5%] w-[50vw] h-[50vw] bg-romantic-accent/10 rounded-full blur-[100px] animate-float opacity-50" style={{ animationDelay: '3s' }} />
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col w-full max-w-7xl mx-auto h-full overflow-hidden">
        
        {/* Conditional Header for Large Screens (Home only) */}
        {status === 'idle' && (
          <header className="absolute top-0 left-0 p-6 z-50 pointer-events-none hidden md:block">
             <div className="flex items-center gap-2 pointer-events-auto opacity-80 hover:opacity-100 transition-opacity">
               <div className="p-1.5 bg-romantic-primary/20 rounded-lg">
                 <Heart className="text-romantic-primary fill-romantic-primary" size={20} />
               </div>
               <span className="font-display font-bold text-lg text-white tracking-wide">Amour</span>
             </div>
          </header>
        )}

        <div className="flex-1 flex flex-col h-full md:p-6 lg:p-8 overflow-hidden">
          {status === 'idle' ? (
            <MatchScreen onFindMatch={joinQueue} onlineCount={onlineCount} />
          ) : (
            <ChatWindow 
              status={status}
              messages={messages}
              onSendMessage={sendMessage}
              onTyping={sendTyping}
              partnerTyping={partnerTyping}
              onNext={nextPartner}
              onStop={leaveChat}
              commonInterests={commonInterests}
              video={video}
              error={error}
              onErrorDismiss={() => setError(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;