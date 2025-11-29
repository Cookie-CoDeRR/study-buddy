import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, PhoneOff, GripHorizontal, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AudioCallProps {
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  groupMembers?: Array<{
    userId: string;
    name: string;
    profilePicture?: string;
    isActive?: boolean;
  }>;
  onEnd: () => void;
}

export function AudioCall({
  callerId,
  callerName,
  callerAvatar,
  recipientId,
  recipientName,
  recipientAvatar,
  groupMembers = [],
  onEnd,
}: AudioCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [activeMembers, setActiveMembers] = useState<string[]>([recipientId]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Timer for call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? 'Microphone on' : 'Microphone off',
      description: isMuted ? 'Your mic is now active' : 'You are muted',
    });
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
        width: isMinimized ? '300px' : '400px',
        height: isMinimized ? '60px' : '500px',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-sm">{recipientName}</span>
          <Badge className="bg-white/20 text-white text-xs">{formatDuration(callDuration)}</Badge>
        </div>

        <div className="flex items-center gap-2">
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
            onClick={onEnd}
            className="h-6 w-6 p-0 text-red-300 hover:bg-red-600/30"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content - Hidden when minimized */}
      {!isMinimized && (
        <>
          {/* Main Content - Members Display */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8 px-4 bg-gray-900">
            {/* Caller */}
            <div className="text-center">
              <Avatar className="h-20 w-20 border-4 border-green-500 mx-auto mb-2">
                <AvatarImage src={callerAvatar} />
                <AvatarFallback className="bg-green-600 text-white text-lg">
                  {callerName?.charAt(0).toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold text-white">{callerName}</p>
              <p className="text-xs text-green-400 flex items-center justify-center gap-1 mt-1">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full" />
                Connected
              </p>
            </div>

            {/* Divider */}
            <div className="text-gray-600 text-xs">↔</div>

            {/* Recipient */}
            <div className="text-center">
              <Avatar className="h-20 w-20 border-4 border-green-500 mx-auto mb-2">
                <AvatarImage src={recipientAvatar} />
                <AvatarFallback className="bg-green-600 text-white text-lg">
                  {recipientName?.charAt(0).toUpperCase() || 'R'}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold text-white">{recipientName}</p>
              <p className="text-xs text-green-400 flex items-center justify-center gap-1 mt-1">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full" />
                Connected
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex items-center justify-center gap-3" data-no-drag>
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
              variant="destructive"
              onClick={onEnd}
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
