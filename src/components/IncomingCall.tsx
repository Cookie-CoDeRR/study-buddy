import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff } from 'lucide-react';

interface IncomingCallProps {
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  groupName: string;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCall({
  callerId,
  callerName,
  callerAvatar,
  groupName,
  onAccept,
  onReject,
}: IncomingCallProps) {
  const [ringSound] = useState(
    new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAAA=')
  );

  useEffect(() => {
    // Play ring sound
    ringSound.loop = true;
    ringSound.play().catch((err) => console.log('Could not play ring sound:', err));

    return () => {
      ringSound.pause();
      ringSound.currentTime = 0;
    };
  }, [ringSound]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9998] p-4">
      <Card className="w-full max-w-sm p-8 bg-gradient-to-br from-card to-card/50 border-2 border-primary/50 space-y-6 animate-pulse">
        {/* Caller Avatar */}
        <div className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary">
            <AvatarImage src={callerAvatar} />
            <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-white">
              {callerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Caller Info */}
          <h2 className="text-2xl font-bold text-foreground">{callerName}</h2>
          <p className="text-sm text-muted-foreground mt-1">is calling in {groupName}</p>
          <p className="text-xs text-muted-foreground mt-2 animate-bounce">Incoming call...</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {/* Reject */}
          <Button
            size="lg"
            variant="destructive"
            onClick={onReject}
            className="rounded-full h-14 w-14 p-0"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          {/* Accept */}
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 rounded-full h-14 w-14 p-0"
            onClick={onAccept}
          >
            <Phone className="w-6 h-6" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
