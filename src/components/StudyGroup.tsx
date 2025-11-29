import { useState, useEffect } from 'react';
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
import { toast } from '@/hooks/use-toast';

interface StudyGroupViewProps {
  group: StudyGroup;
  userId: string;
  userProfile?: any;
  onLeave: () => void;
}

export function StudyGroupView({ group, userId, userProfile, onLeave }: StudyGroupViewProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'chat'>('overview');

  useEffect(() => {
    loadMembers();
  }, [group.id]);

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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

  const isCreator = group.creatorId === userId;

  // If in chat mode, show WhatsApp-style interface
  if (viewMode === 'chat') {
    return (
      <div className="w-full h-screen">
        <GroupChatInterface
          group={group}
          userId={userId}
          userName={userProfile?.full_name || 'User'}
          userAvatar={userProfile?.profile_picture_url}
          onClose={() => setViewMode('overview')}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex justify-between items-start">
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
  );
}
