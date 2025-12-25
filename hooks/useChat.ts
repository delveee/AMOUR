import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, ConnectionStatus, ClientToServerEvents, ServerToClientEvents, SignalData } from '../types';

// reliable production check based on hostname
const getSocketUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001';

  const { hostname, origin } = window.location;

  // If explicitly provided in env (e.g. for separating front/back)
  if (import.meta.env?.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // If we are NOT running locally, assume production
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return origin;
  }

  // Fallback for local development
  return 'http://localhost:3001';
};

const SOCKET_URL = getSocketUrl();
console.log('[AmourChat] Initializing Socket with URL:', SOCKET_URL);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const useChat = () => {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [currentInterests, setCurrentInterests] = useState<string[]>([]);
  const [commonInterests, setCommonInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Video Chat State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoActive, setIsVideoActive] = useState(false);

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const partnerIdRef = useRef<string | null>(null);

  // Initialize WebRTC Peer Connection
  const createPeerConnection = () => {
    try {
      if (peerConnection.current) return;

      console.log("[AmourChat Debug] Creating RTCPeerConnection");
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnection.current = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate && partnerIdRef.current && socketRef.current) {
          socketRef.current.emit('signal', {
            target: partnerIdRef.current,
            signal: { type: 'ice-candidate', payload: event.candidate }
          });
        }
      };

      pc.ontrack = (event) => {
        console.log("[AmourChat Debug] Received remote track", event.streams[0]);
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`[AmourChat Debug] Connection State: ${pc.connectionState}`);
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[AmourChat Debug] ICE Connection State: ${pc.iceConnectionState}`);
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          setError("Video connection unstable.");
        }
      };

      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }
    } catch (err: any) {
      console.error("[AmourChat Error] Failed to create PeerConnection:", err);
      setError(`Connection Error: ${err.message}`);
    }
  };

  const startVideo = async () => {
    try {
      console.log("[AmourChat Debug] Requesting User Media");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // Prefer front camera on mobile
        audio: true
      });

      console.log("[AmourChat Debug] Media Stream Acquired", stream.id);
      setLocalStream(stream);
      setIsVideoActive(true);
      setError(null);

      // If we are already connected, let's try to upgrade to video
      if (peerConnection.current) {
        stream.getTracks().forEach(track => {
          // Check if track already exists to avoid duplication errors
          const senders = peerConnection.current?.getSenders();
          const trackExists = senders?.some(sender => sender.track?.kind === track.kind);

          if (!trackExists) {
            peerConnection.current?.addTrack(track, stream);
          }
        });

        // Initiate offer
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        if (partnerIdRef.current && socketRef.current) {
          socketRef.current.emit('signal', {
            target: partnerIdRef.current,
            signal: { type: 'offer', payload: offer }
          });
        }
      }
    } catch (err: any) {
      console.error("[AmourChat Error] Error accessing media devices:", err);
      if (err.name === 'NotAllowedError') {
        setError("Camera/Microphone permission denied. Please enable them in settings.");
      } else if (err.name === 'NotFoundError') {
        setError("No camera or microphone found on this device.");
      } else {
        setError(`Could not start video: ${err.message}`);
      }
    }
  };

  const stopVideo = () => {
    console.log("[AmourChat Debug] Stopping Video");
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`[AmourChat Debug] Stopped track: ${track.kind}`);
      });
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsVideoActive(false);

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      autoConnect: false
    });

    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      console.error("[AmourChat Error] Socket Connection Error:", err.message);
      // Don't show UI error for socket connect unless persistent, strictly debug
    });

    socket.on('matched', async (data) => {
      setStatus('connected');
      setError(null);
      partnerIdRef.current = data.partnerId;
      setCommonInterests(data.commonInterests || []);
      setMessages([{
        id: 'system-start',
        text: data.commonInterests && data.commonInterests.length > 0
          ? `Connected with stranger who likes: ${data.commonInterests.join(', ')}`
          : 'You are now connected with a stranger.',
        sender: 'system',
        timestamp: Date.now()
      }]);
      setPartnerTyping(false);

      createPeerConnection();
    });

    socket.on('message', (data) => {
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + Math.random(),
        text: data.text,
        sender: 'stranger',
        timestamp: Date.now()
      }]);
      setPartnerTyping(false);
    });

    socket.on('signal', async (data: SignalData) => {
      if (!peerConnection.current) createPeerConnection();
      const pc = peerConnection.current!;

      try {
        if (data.type === 'offer') {
          console.log("[AmourChat Debug] Received Offer");
          setIsVideoActive(true); // Auto show UI
          await pc.setRemoteDescription(new RTCSessionDescription(data.payload));

          if (!localStream) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
              setLocalStream(stream);
              stream.getTracks().forEach(track => pc.addTrack(track, stream));
            } catch (e) {
              console.log("[AmourChat Warn] Auto-accepting video without local media (view only)");
            }
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          if (partnerIdRef.current && socketRef.current) {
            socketRef.current.emit('signal', {
              target: partnerIdRef.current,
              signal: { type: 'answer', payload: answer }
            });
          }
        } else if (data.type === 'answer') {
          console.log("[AmourChat Debug] Received Answer");
          await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
        } else if (data.type === 'ice-candidate') {
          if (data.payload) {
            await pc.addIceCandidate(new RTCIceCandidate(data.payload));
          }
        }
      } catch (err: any) {
        console.error("[AmourChat Error] Signaling Error:", err);
        setError("Failed to establish video connection.");
      }
    });

    socket.on('partner_typing', (isTyping) => {
      setPartnerTyping(isTyping);
    });

    socket.on('partner_disconnected', () => {
      setStatus('partner_disconnected');
      setPartnerTyping(false);
      partnerIdRef.current = null;
      stopVideo();
      setMessages((prev) => [...prev, {
        id: 'system-end-' + Date.now(),
        text: 'Stranger has disconnected.',
        sender: 'system',
        timestamp: Date.now()
      }]);
    });

    socket.on('online_count', (count) => {
      setOnlineCount(count);
    });

    return () => {
      stopVideo();
      socket.disconnect();
    };
  }, []);

  const joinQueue = useCallback((interests: string[] = []) => {
    if (!socketRef.current) return;

    if (!socketRef.current.connected) {
      socketRef.current.connect();
    }

    setCurrentInterests(interests);
    setStatus('searching');
    setMessages([]);
    setCommonInterests([]);
    setError(null);
    socketRef.current.emit('join_queue', { interests });
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!socketRef.current || status !== 'connected') return;

    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      text,
      sender: 'me',
      timestamp: Date.now()
    }]);

    socketRef.current.emit('send_message', { text });
  }, [status]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || status !== 'connected') return;
    socketRef.current.emit('typing', isTyping);
  }, [status]);

  const nextPartner = useCallback(() => {
    if (!socketRef.current) return;

    stopVideo();
    socketRef.current.emit('next_partner', { interests: currentInterests });

    setStatus('searching');
    setMessages([]);
    setPartnerTyping(false);
    setCommonInterests([]);
    setError(null);
    partnerIdRef.current = null;
  }, [currentInterests]);

  const leaveChat = useCallback(() => {
    if (!socketRef.current) return;
    stopVideo();
    socketRef.current.emit('leave_queue');
    socketRef.current.disconnect();
    setStatus('idle');
    setMessages([]);
    setPartnerTyping(false);
    setCommonInterests([]);
    setCurrentInterests([]);
    setError(null);
    partnerIdRef.current = null;
  }, []);

  return {
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
    error,
    setError, // Expose setter to clear errors from UI
    video: {
      localStream,
      remoteStream,
      startVideo,
      stopVideo,
      toggleCamera,
      toggleMic,
      isActive: isVideoActive,
      isAudioEnabled,
      isVideoEnabled
    }
  };
};