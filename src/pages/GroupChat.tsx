import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, FileUp } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase/client';
import { ChatRoom } from '@/components/ChatRoom';
import { FileSharing } from '@/components/FileSharing';
import { StudyGroup } from '@/lib/friends';
import { toast } from '@/hooks/use-toast';

export function GroupChat() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid || '';
  const userName = auth.currentUser?.displayName || 'User';
  const userEmail = auth.currentUser?.email;

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroupAndProfile = async () => {
      if (!groupId || !userId) return;

      setLoading(true);
      try {
        // Load group
        const groupRef = doc(db, 'study_groups', groupId);
        const groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) {
          toast({
            title: 'Error',
            description: 'Group not found',
            variant: 'destructive',
          });
          navigate('/groups');
          return;
        }

        const groupData = groupSnap.data() as StudyGroup;
        groupData.id = groupId;

        // Check if user is member
        if (!groupData.members.includes(userId)) {
          toast({
            title: 'Error',
            description: 'You are not a member of this group',
            variant: 'destructive',
          });
          navigate('/groups');
          return;
        }

        setGroup(groupData);

        // Load user profile
        const profileRef = doc(db, 'profiles', userId);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setUserProfile(profileSnap.data());
        }
      } catch (error) {
        console.error('Error loading group:', error);
        toast({
          title: 'Error',
          description: 'Failed to load group',
          variant: 'destructive',
        });
      }
      setLoading(false);
    };

    loadGroupAndProfile();
  }, [groupId, userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Group not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/groups`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {group.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {group.memberCount} members
              </p>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <Card className="p-0 bg-white dark:bg-gray-800 overflow-hidden">
          <Tabs defaultValue="chat" className="w-full h-full flex flex-col">
            <TabsList className="w-full rounded-none border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 justify-start">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileUp className="w-4 h-4" />
                Files
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent
              value="chat"
              className="flex-1 m-0 min-h-[600px] bg-white dark:bg-gray-800"
            >
              <ChatRoom
                groupId={groupId!}
                userId={userId}
                userName={userName}
                userAvatar={userProfile?.profile_picture_url}
              />
            </TabsContent>

            {/* Files Tab */}
            <TabsContent
              value="files"
              className="flex-1 m-0 min-h-[600px] p-4 bg-white dark:bg-gray-800 overflow-y-auto"
            >
              <FileSharing
                groupId={groupId!}
                userId={userId}
                userName={userName}
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Group Info Footer */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Group: {group.name}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Created by {group.creatorName}
              </p>
            </div>
            <Badge variant="secondary">
              {group.description}
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
