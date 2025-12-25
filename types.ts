export type ConnectionStatus = 'idle' | 'searching' | 'connected' | 'disconnected' | 'partner_disconnected';

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'stranger' | 'system';
  timestamp: number;
}

export interface SignalData {
  type: 'offer' | 'answer' | 'ice-candidate';
  payload: any;
}

export interface ServerToClientEvents {
  matched: (data: { partnerId: string; commonInterests?: string[] }) => void;
  message: (data: { text: string }) => void;
  partner_disconnected: () => void;
  partner_typing: (isTyping: boolean) => void;
  online_count: (count: number) => void;
  signal: (data: SignalData) => void;
}

export interface ClientToServerEvents {
  join_queue: (data: { interests: string[] }) => void;
  leave_queue: () => void;
  send_message: (data: { text: string }) => void;
  typing: (isTyping: boolean) => void;
  disconnect_chat: () => void;
  next_partner: (data: { interests: string[] }) => void;
  signal: (data: { target: string; signal: SignalData }) => void;
}