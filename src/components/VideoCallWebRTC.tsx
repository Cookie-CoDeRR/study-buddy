import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, PhoneOff, GripHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { WebRTCService } from '@/lib/webrtc-service';

interface VideoCallWebRTCProps {
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  isInitiator: boolean;
  onOffer?: (offer: RTCSessionDescriptionInit) => void;
  onAnswer?: (answer: RTCSessionDescriptionInit) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onRemoteOffer?: (offer: RTCSessionDescriptionInit) => void;
  onRemoteAnswer?: (answer: RTCSessionDescriptionInit) => void;
  onRemoteIceCandidate?: (candidate: RTCIceCandidate) => void;
  onEnd: () => void;
}

export function VideoCallWebRTC({
  callerId,
  callerName,
  callerAvatar,
  recipientId,
  recipientName,
  recipientAvatar,
  isInitiator,
  onOffer,
  onAnswer,
  onIceCandidate,
  onRemoteOffer,
  onRemoteAnswer,
  onRemoteIceCandidate,
  onEnd,
}: VideoCallWebRTCProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionState, setConnectionState] = useState('connecting');
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Initialize WebRTC service
  useEffect(() => {
    const initWebRTC = async () => {
      try {
        const service = new WebRTCService();

        service.setCallbacks({
          onLocalStream: (stream) => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          },
          onRemoteStream: (stream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
            }
          },
          onIceCandidate: (candidate) => {
            if (onIceCandidate) {
              onIceCandidate(candidate);
            }
          },
          onConnectionStateChange: (state) => {
            setConnectionState(state);
            if (state === 'connected') {
              toast({
                title: 'Connected',
                description: 'Call connected successfully',
              });
            }
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          },
        });

        // Start call
        await service.startCall(isVideoEnabled);
        webrtcServiceRef.current = service;

        // If initiator, create and send offer
        if (isInitiator) {
          const offer = await service.createOffer();
          if (offer && onOffer) {
            onOffer(offer);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to initialize call';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    };

    initWebRTC();

    return () => {
      webrtcServiceRef.current?.endCall();
    };
  }, [isInitiator, isVideoEnabled, onOffer, onIceCandidate]);

  // Handle remote offer
  useEffect(() => {
    const handleRemoteOffer = async (offer: RTCSessionDescriptionInit) => {
      if (webrtcServiceRef.current && !isInitiator) {
        try {
          const answer = await webrtcServiceRef.current.handleOffer(offer);
          if (answer && onAnswer) {
            onAnswer(answer);
          }
        } catch (error) {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to handle offer',
            variant: 'destructive',
          });
        }
      }
    };

    if (onRemoteOffer) {
      // In real implementation, this would be called from parent when offer is received
    }
  }, [isInitiator, onAnswer, onRemoteOffer]);

  // Track call duration
  useEffect(() => {
    if (connectionState === 'connected') {
      const timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [connectionState]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    webrtcServiceRef.current?.toggleAudio(!isMuted);
    toast({
      title: isMuted ? 'Microphone on' : 'Microphone off',
      description: isMuted ? 'Your mic is now active' : 'You are muted',
    });
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    webrtcServiceRef.current?.toggleVideo(!isVideoEnabled);
    toast({
      title: !isVideoEnabled ? 'Camera on' : 'Camera off',
      description: !isVideoEnabled ? 'Your camera is now active' : 'Your camera is off',
    });
  };

  const handleEndCall = () => {
    webrtcServiceRef.current?.endCall();
    onEnd();
  };

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={windowRef}
      className="fixed z-[9998] bg-black border-2 border-green-600 shadow-2xl overflow-hidden flex flex-col transition-all"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? '350px' : '500px',
        height: isMinimized ? '60px' : '600px',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2 flex-1">
          <GripHorizontal className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-sm">{recipientName}</span>
          <Badge className="bg-white/20 text-white text-xs">{formatDuration(callDuration)}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={connectionState === 'connected' ? 'default' : 'secondary'}
            className={`text-xs ${connectionState === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}
          >
            {connectionState}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
          >
            {isMinimized ? '▼' : '▲'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEndCall}
            className="h-6 w-6 p-0 text-red-300 hover:bg-red-600/30"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content - Hidden when minimized */}
      {!isMinimized && (
        <>
          {/* Video Container */}
          <div className="flex-1 flex overflow-hidden bg-black relative">
            {/* Remote Video - Full Screen */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Local Video - Picture in Picture */}
            <div className="absolute bottom-3 right-3 w-24 h-24 bg-gray-900 rounded-lg border-2 border-gray-700 overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-900 border-t border-gray-700 px-4 py-3 flex items-center justify-center gap-3" data-no-drag>
            <Button
              size="sm"
              variant={isMuted ? 'destructive' : 'secondary'}
              onClick={handleToggleMute}
              className="rounded-full h-10 w-10 p-0"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            <Button
              size="sm"
              variant={!isVideoEnabled ? 'destructive' : 'secondary'}
              onClick={handleToggleVideo}
              className="rounded-full h-10 w-10 p-0"
              title={!isVideoEnabled ? 'Start camera' : 'Stop camera'}
            >
              {!isVideoEnabled ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={handleEndCall}
              className="rounded-full h-10 w-10 p-0"
              title="End call"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
