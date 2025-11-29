import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, LogOut, Copy, Check, MessageCircle } from 'lucide-react';
import { getGroupMemberStats, leaveStudyGroup, StudyGroup } from '@/lib/friends';
import { Leaderboard } from '@/components/Leaderboard';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';
import { GroupChatInterface } from '@/components/GroupChatInterface';
import { AudioCall } from '@/components/AudioCall';
import { CallStatusBar } from '@/components/CallStatusBar';
import { IncomingCall } from '@/components/IncomingCall';
import { toast } from '@/hooks/use-toast';
import { initiateGroupCall, subscribeToGroupCalls, addCallParticipant, subscribeToCallParticipants } from '@/lib/group-chat';

// Helper function to play a notification sound
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a pleasant bell-like sound
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};

interface StudyGroupViewProps {
  group: StudyGroup;
  userId: string;
  userProfile?: any;
  onLeave: () => void;
}

export function StudyGroupView({ group, userId, userProfile, onLeave }: StudyGroupViewProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'chat' | 'call'>('overview');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [missedCalls, setMissedCalls] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showCallPanel, setShowCallPanel] = useState(false);
  const [callInitiatedByMe, setCallInitiatedByMe] = useState(false);
  const [callParticipants, setCallParticipants] = useState<string[]>([]);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const unsubscribeCallsRef = useRef<(() => void) | null>(null);
  const unsubscribeParticipantsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    loadMembers();
  }, [group.id]);

  // Subscribe to active calls in the group
  useEffect(() => {
    const unsubscribe = subscribeToGroupCalls(group.id, (calls) => {
      setActiveCalls(calls);
      
      // If there's an active call and I'm not in one yet
      if (calls.length > 0 && !incomingCall && viewMode !== 'call') {
        const activeCall = calls[0];
        // If I'm not the caller, show incoming call
        if (activeCall.callerId !== userId) {
          setIncomingCall({
            callId: activeCall.id,
            callerId: activeCall.callerId,
            callerName: activeCall.callerName,
            callerAvatar: activeCall.callerName,
          });
        }
      }
    });

    unsubscribeCallsRef.current = unsubscribe;
    return () => {
      unsubscribe();
      unsubscribeCallsRef.current = null;
    };
  }, [group.id, userId, incomingCall, viewMode]);

  // Subscribe to participants for active call
  useEffect(() => {
    if (activeCallId) {
      const unsubscribe = subscribeToCallParticipants(activeCallId, (participants) => {
        const participantIds = participants.map(p => p.userId);
        const previousCount = callParticipants.length;
        
        setCallParticipants(participantIds);
        
        // Play sound when new participant joins
        if (participantIds.length > previousCount && participantIds.length > 1) {
          const newParticipant = participantIds.find(id => !callParticipants.includes(id));
          const participantName = members.find(m => m.userId === newParticipant)?.name || 'Someone';
          
          // Play notification sound
          playNotificationSound();
          
          toast({
            title: 'Participant Joined',
            description: `${participantName} joined the call`,
          });
        }
      });

      unsubscribeParticipantsRef.current = unsubscribe;
      return () => {
        unsubscribe();
        unsubscribeParticipantsRef.current = null;
      };
    }
  }, [activeCallId, callParticipants, members]);

  // Simulate receiving incoming calls instantly when members are loaded
  // In real app, this would use Firebase listeners
  // ONLY show incoming calls when NOT already in a call and you DIDN'T just hang up
  useEffect(() => {
    if (members.length > 0 && viewMode === 'overview' && !incomingCall && !callInitiatedByMe && activeCalls.length === 0) {
      // Simulate receiving a call from a random member after 2 seconds
      const timeout = setTimeout(() => {
        const randomMember = members[Math.floor(Math.random() * members.length)];
        // Only show call if: member is not you AND 50% chance
        if (randomMember.userId !== userId && Math.random() < 0.5) {
          setIncomingCall({
            callerId: randomMember.userId,
            callerName: randomMember.name,
            callerAvatar: randomMember.profilePicture,
          });
        }
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [members, userId, viewMode, incomingCall, callInitiatedByMe, activeCalls]);

  // When YOU start a call, simulate OTHER members getting notified
  // In real app, this would send via Firebase/Socket
  useEffect(() => {
    if (callInitiatedByMe && viewMode === 'call' && selectedMember) {
      // Simulate other members receiving your call notification
      // Show toast to indicate call is being propagated
      toast({
        title: 'Call Started',
        description: `Call notification sent to ${selectedMember.name}`,
      });
    }
  }, [callInitiatedByMe, viewMode, selectedMember]);

  // Track call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewMode === 'call' && selectedMember) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [viewMode, selectedMember]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const memberStats = await getGroupMemberStats(group.id);
      setMembers(memberStats);
    } catch (error) {
      console.error('Error loading members:', error);
    }
    setLoading(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopiedCode(true);
    toast({
      title: 'Copied!',
      description: 'Invite code copied to clipboard',
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLeave = async () => {
    try {
      await leaveStudyGroup(group.id, userId);
      toast({
        title: 'Success',
        description: 'You left the group',
      });
      onLeave();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to leave group',
        variant: 'destructive',
      });
    }
  };

  const handleStartCall = async () => {
    if (members.length <= 1) {
      toast({
        title: 'Info',
        description: 'You need at least 2 members to start a call',
        variant: 'default',
      });
      return;
    }
    // Start call with first available member (not yourself)
    const otherMembers = members.filter(m => m.userId !== userId);
    if (otherMembers.length === 0) {
      toast({
        title: 'Info',
        description: 'No other members available to call',
        variant: 'default',
      });
      return;
    }
    
    try {
      // Create call in Firestore
      const callId = await initiateGroupCall(
        group.id,
        userId,
        userProfile?.full_name || 'Unknown',
        'audio'
      );
      
      // Add self as first participant
      await addCallParticipant(callId, userId);
      
      setActiveCallId(callId);
      setCallParticipants([userId]);
      setSelectedMember(otherMembers[0]);
      setViewMode('call');
      setCallInitiatedByMe(true); // Mark that I started this call
      toast({
        title: 'Calling...',
        description: `Calling ${otherMembers[0].name}`,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: 'Error',
        description: 'Failed to start call',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptIncomingCall = async () => {
    if (incomingCall) {
      try {
        // Add self as participant to the call
        if (incomingCall.callId) {
          await addCallParticipant(incomingCall.callId, userId);
          setActiveCallId(incomingCall.callId);
        }
        
        setSelectedMember({
          userId: incomingCall.callerId,
          name: incomingCall.callerName,
          profilePicture: incomingCall.callerAvatar,
        });
        setViewMode('call');
        setIncomingCall(null);
        toast({
          title: 'Call accepted',
          description: `Connected with ${incomingCall.callerName}`,
        });
      } catch (error) {
        console.error('Error accepting call:', error);
        toast({
          title: 'Error',
          description: 'Failed to accept call',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRejectIncomingCall = () => {
    if (incomingCall) {
      // Add to missed calls so they can pick it up later
      setMissedCalls([...missedCalls, incomingCall]);
      toast({
        title: 'Call rejected',
        description: `You rejected the call from ${incomingCall.callerName}`,
      });
      setIncomingCall(null);
    }
  };

  const handlePickupMissedCall = (missedCall: any) => {
    // Don't call yourself
    if (missedCall.callerId === userId) {
      // Find the actual recipient from members
      const otherMembers = members.filter(m => m.userId !== userId);
      if (otherMembers.length === 0) {
        toast({
          title: 'Error',
          description: 'No other members to call',
          variant: 'destructive',
        });
        return;
      }
      setSelectedMember(otherMembers[0]);
    } else {
      setSelectedMember({
        userId: missedCall.callerId,
        name: missedCall.callerName,
        profilePicture: missedCall.callerAvatar,
      });
    }
    setViewMode('call');
    // Remove from missed calls
    setMissedCalls(missedCalls.filter((call) => call.callerId !== missedCall.callerId));
    toast({
      title: 'Call picked up',
      description: `Calling ${missedCall.callerName}`,
    });
  };

  const isCreator = group.creatorId === userId;

  // Call is overlayed on the existing view
  const callUI = viewMode === 'call' && selectedMember ? (
    <AudioCall
      callerId={userId}
      callerName={userProfile?.full_name || 'You'}
      callerAvatar={userProfile?.profile_picture_url}
      recipientId={selectedMember.userId}
      recipientName={selectedMember.name}
      recipientAvatar={selectedMember.profilePicture}
      groupMembers={members}
      onEnd={() => {
        setViewMode('overview');
        setSelectedMember(null);
        setShowCallPanel(false);
        setCallInitiatedByMe(false); // Reset call flag when ending
      }}
    />
  ) : null;

  // Call status bar - persistent green bar at top when in call
  const callStatusBar = viewMode === 'call' && selectedMember ? (
    <CallStatusBar
      isActive={true}
      callDuration={callDuration}
      recipientName={selectedMember.name}
      memberCount={members.length}
      members={members}
      onShowPanel={() => setShowCallPanel(!showCallPanel)}
      onEndCall={() => {
        setViewMode('overview');
        setSelectedMember(null);
        setShowCallPanel(false);
        setCallInitiatedByMe(false); // Reset call flag when ending
      }}
    />
  ) : null;

  // Chat is overlayed on the existing view
  const chatUI = viewMode === 'chat' ? (
    <div className="fixed inset-0 z-[9990] bg-black/10 backdrop-blur-sm flex items-start justify-end">
      <div className="w-full h-full bg-white dark:bg-gray-900 shadow-2xl">
        <GroupChatInterface
          group={group}
          userId={userId}
          userName={userProfile?.full_name || 'User'}
          userAvatar={userProfile?.profile_picture_url}
          onClose={() => setViewMode('overview')}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Call Status Bar - Green bar at top when in active call */}
      {callStatusBar}

      {/* Incoming Call Notification */}
      {incomingCall && (
        <IncomingCall
          callerId={incomingCall.callerId}
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          groupName={group.name}
          onAccept={handleAcceptIncomingCall}
          onReject={handleRejectIncomingCall}
        />
      )}
      
      {/* Call Overlay */}
      {callUI}

      {/* Chat Overlay */}
      {chatUI}
      <div className="w-full space-y-4">
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {group.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {group.description}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary">Created by {group.creatorName}</Badge>
              <Badge variant="outline">{group.memberCount} members</Badge>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewMode('chat')}
              disabled={viewMode === 'call'}
              className="gap-2"
              title={viewMode === 'call' ? 'End call to access chat' : 'Open group chat'}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleLeave}
              disabled={viewMode === 'call'}
              className="gap-2"
              title={viewMode === 'call' ? 'End call first' : 'Leave the group'}
            >
              <LogOut className="w-4 h-4" />
              Leave
            </Button>
          </div>
        </div>
      </Card>

      {/* Invite Code */}
      <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
              Invite Code
            </p>
            <p className="text-sm font-mono font-bold text-blue-900 dark:text-blue-100">
              {group.inviteCode}
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleCopyCode}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {copiedCode ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="mt-4">
          <Leaderboard members={members} />
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-4 space-y-2">
          {members.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              <p>Loading members...</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <Card
                  key={member.userId}
                  className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors md-elevate"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profilePicture} />
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        Streak: {member.currentStreak} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Badge variant="secondary">
                      {member.totalTodayMinutes}m
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-4">
          <CalendarHeatmap userId={userId} />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => setViewMode('chat')}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Open Chat
        </Button>
        {!isCreator && (
          <Button
            onClick={handleLeave}
            variant="destructive"
            className="flex-1"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Group
          </Button>
        )}
      </div>
    </div>
    </>
  );
}
