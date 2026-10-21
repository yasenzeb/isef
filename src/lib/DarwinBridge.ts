/**
 * DarwinBridge.tsx
 * ─────────────────────────────────────────────────────────────────
 * الجسر الحقيقي بين منصة ساينكسا ووكيل داروين (Fish Audio / LiveKit).
 *
 * يفعل ثلاثة أشياء بالتوازي:
 *   1. يستمع لـ scinexa:context events من المختبرات
 *      → يرسلها لداروين عبر LiveKit publishData
 *   2. يستمع لأوامر داروين عبر LiveKit DataReceived
 *      → ينفذها مباشرة: navigate / explain / alert
 *   3. يُظهر transcript حي لما يقوله / يسمعه داروين
 * ─────────────────────────────────────────────────────────────────
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  RoomOptions,
  ConnectionState,
  LocalAudioTrack,
  createLocalAudioTrack,
  DataPacket_Kind,
} from 'livekit-client';

// ─── Types ───────────────────────────────────────────────────────

export interface DarwinBridgeOptions {
  /** Called when Darwin sends a navigate command */
  onNavigate?: (tab: string) => void;
  /** Called when Darwin sends a custom platform command */
  onCommand?: (cmd: DarwinCommand) => void;
  /** Called whenever a transcript message arrives */
  onTranscript?: (msg: TranscriptMessage) => void;
  /** Current lab tab — sent as context on connect & on change */
  currentTab?: string;
  /** Student profile telemetry */
  userProfile?: any;
}

export interface DarwinCommand {
  type: 'navigate' | 'explain' | 'alert' | 'highlight' | 'custom';
  payload: Record<string, any>;
}

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export type DarwinConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

// ─── Context Payload Types sent via publishData ───────────────────

interface LabContextPayload {
  type: 'lab_context';
  event: string;      // e.g. 'structure_selected' | 'circuit_update' | 'element_selected' | 'tab_changed'
  lab: string;        // 'anatomy' | 'physics' | 'chemistry' | 'biology' | 'geology' | 'astronomy'
  title: string;      // Human readable item name (Arabic preferred)
  desc?: string;      // Short description
  timestamp: number;
}

interface PlatformStatePayload {
  type: 'platform_state';
  currentTab: string;
  timestamp: number;
}

interface StudentProfilePayload {
  type: 'student_profile';
  profile: any;
  timestamp: number;
}

type OutboundPayload = LabContextPayload | PlatformStatePayload | StudentProfilePayload;

// ─── DarwinBridge Hook ────────────────────────────────────────────

export function useDarwinBridge(options: DarwinBridgeOptions = {}) {
  const { onNavigate, onCommand, onTranscript, currentTab, userProfile } = options;

  const roomRef = useRef<Room | null>(null);
  const audioTrackRef = useRef<LocalAudioTrack | null>(null);
  const encoderRef = useRef(new TextEncoder());
  const decoderRef = useRef(new TextDecoder());
  const isMountedRef = useRef(true);

  const [status, setStatus] = useState<DarwinConnectionStatus>('idle');
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  // ── Publish lab context to Darwin ────────────────────────────────
  const publishContext = useCallback((payload: OutboundPayload) => {
    const room = roomRef.current;
    if (!room || room.state !== ConnectionState.Connected) return;
    try {
      const data = encoderRef.current.encode(JSON.stringify(payload));
      room.localParticipant.publishData(data, {
        reliable: true,
        topic: 'lab-context',
      });
    } catch (e) {
      console.warn('[DarwinBridge] publishContext error:', e);
    }
  }, []);

  // ── Handle incoming data from Darwin ─────────────────────────────
  const handleDataReceived = useCallback(
    (rawData: Uint8Array, _participant: any, _kind: any, topic?: string) => {
      try {
        const text = decoderRef.current.decode(rawData);
        const msg = JSON.parse(text);

        // Transcript messages
        if (topic === 'transcript' || msg.type === 'transcript') {
          const tmsg: TranscriptMessage = {
            role: msg.role || 'assistant',
            text: msg.text || msg.content || '',
            timestamp: Date.now(),
          };
          if (isMountedRef.current) {
            setTranscript(prev => [...prev.slice(-50), tmsg]);
          }
          onTranscript?.(tmsg);
          return;
        }

        // Platform command from Darwin
        if (msg.type === 'navigate' && msg.tab) {
          onNavigate?.(msg.tab);
          return;
        }
        if (msg.type === 'command') {
          onCommand?.(msg as DarwinCommand);
          return;
        }
      } catch (_) {
        // Ignore non-JSON data packets
      }
    },
    [onNavigate, onCommand, onTranscript]
  );

  // ── Connect to Fish Audio LiveKit session ─────────────────────────
  const connect = useCallback(async () => {
    if (roomRef.current?.state === ConnectionState.Connected) return;
    if (!isMountedRef.current) return;

    setStatus('connecting');

    try {
      // 1. Get session credentials from our backend
      const res = await fetch('/api/darwin-session', { method: 'POST' });
      if (!res.ok) throw new Error(`Session API error: ${res.status}`);
      const { livekit_url, token } = await res.json();

      if (!livekit_url || !token) throw new Error('Missing livekit_url or token in session response');

      // 2. Build LiveKit room
      const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };
      const room = new Room(roomOptions);
      roomRef.current = room;

      // 3. Register event handlers
      room.on(RoomEvent.DataReceived, handleDataReceived);

      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (!isMountedRef.current) return;
        if (state === ConnectionState.Connected) setStatus('connected');
        else if (state === ConnectionState.Reconnecting) setStatus('reconnecting');
        else if (state === ConnectionState.Disconnected) setStatus('disconnected');
      });

      room.on(RoomEvent.Disconnected, () => {
        if (isMountedRef.current) setStatus('disconnected');
      });

      // 4. Connect
      await room.connect(livekit_url, token);

      // 5. Publish microphone track
      const audioTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      audioTrackRef.current = audioTrack;
      await room.localParticipant.publishTrack(audioTrack);

      // 6. Send initial platform state so Darwin knows the current context
      publishContext({
        type: 'platform_state',
        currentTab: currentTab || 'home',
        timestamp: Date.now(),
      });

      if (isMountedRef.current) setStatus('connected');
    } catch (e: any) {
      console.error('[DarwinBridge] connect error:', e);
      if (isMountedRef.current) setStatus('error');
    }
  }, [currentTab, handleDataReceived, publishContext]);

  // ── Disconnect ────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    try {
      audioTrackRef.current?.stop();
      await roomRef.current?.disconnect();
    } catch (_) {}
    roomRef.current = null;
    audioTrackRef.current = null;
    if (isMountedRef.current) setStatus('disconnected');
  }, []);

  // ── Toggle Mute ───────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const track = audioTrackRef.current;
    if (!track) return;
    if (isMuted) {
      track.unmute();
      setIsMuted(false);
    } else {
      track.mute();
      setIsMuted(true);
    }
  }, [isMuted]);

  // ── Send text message (for text chat with Darwin) ─────────────────
  const sendTextMessage = useCallback((text: string) => {
    const room = roomRef.current;
    if (!room || room.state !== ConnectionState.Connected) return;
    try {
      const payload = JSON.stringify({ type: 'user_message', text, timestamp: Date.now() });
      const data = encoderRef.current.encode(payload);
      room.localParticipant.publishData(data, { reliable: true, topic: 'user-message' });
      // Add to local transcript immediately
      setTranscript(prev => [
        ...prev.slice(-50),
        { role: 'user', text, timestamp: Date.now() },
      ]);
    } catch (e) {
      console.warn('[DarwinBridge] sendTextMessage error:', e);
    }
  }, []);

  // ── Listen to scinexa:context events from labs ────────────────────
  useEffect(() => {
    const handleLabContext = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      publishContext({
        type: 'lab_context',
        event: detail.type || 'interaction',
        lab: detail.lab || 'unknown',
        title: detail.title || '',
        desc: detail.desc || '',
        timestamp: Date.now(),
      });
    };

    window.addEventListener('scinexa:context', handleLabContext);
    return () => window.removeEventListener('scinexa:context', handleLabContext);
  }, [publishContext]);

  // ── Send tab change to Darwin when currentTab changes ─────────────
  useEffect(() => {
    if (!currentTab) return;
    if (roomRef.current?.state === ConnectionState.Connected) {
      publishContext({
        type: 'platform_state',
        currentTab,
        timestamp: Date.now(),
      });
    }
  }, [currentTab, publishContext]);

  // ── Send student profile to Darwin when connected or profile updates ─
  useEffect(() => {
    if (!userProfile) return;
    if (roomRef.current?.state === ConnectionState.Connected) {
      publishContext({
        type: 'student_profile',
        profile: userProfile,
        timestamp: Date.now(),
      });
    }
  }, [userProfile, publishContext, status]);

  // ── Cleanup on unmount ────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      audioTrackRef.current?.stop();
      roomRef.current?.disconnect();
    };
  }, []);

  return {
    status,
    transcript,
    isMuted,
    connect,
    disconnect,
    toggleMute,
    sendTextMessage,
    publishContext,
  };
}
