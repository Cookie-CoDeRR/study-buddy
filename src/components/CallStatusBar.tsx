import { Button } from '@/components/ui/button';
import { Phone, PhoneOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CallStatusBarProps {
  isActive: boolean;
  callDuration: number;
  recipientName?: string;
  memberCount: number;
  members?: Array<{
    userId: string;
    name: string;
    profilePicture?: string;
  }>;
  onShowPanel: () => void;
  onEndCall: () => void;
}

export function CallStatusBar({
  isActive,
  callDuration,
  recipientName = 'Someone',
  memberCount = 1,
  members = [],
  onShowPanel,
  onEndCall,
}: CallStatusBarProps) {
  if (!isActive) {
    return null;
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Green Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Status Info */}
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-semibold text-sm">
              {recipientName} - Call in progress
            </span>
            <Badge className="bg-white/20 text-white text-xs font-bold">
              {formatDuration(callDuration)}
            </Badge>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onShowPanel}
              className="bg-white/20 hover:bg-white/30 text-white h-9"
              size="sm"
            >
              <span className="text-sm font-semibold">View Call</span>
            </Button>
            <Button
              onClick={onEndCall}
              className="bg-red-600 hover:bg-red-700 text-white h-9 w-9 p-0"
              size="sm"
              title="End call"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-14" />
    </>
  );
}
