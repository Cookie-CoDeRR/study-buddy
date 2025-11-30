import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, FileUp, Plus, Home, Users as UsersIcon } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase/client';
import { ChatRoom } from '@/components/ChatRoom';
import { FileSharing } from '@/components/FileSharing';
import { StudyGroup } from '@/lib/friends';
import { toast } from '@/hooks/use-toast';
import { getUserStudyGroups, createStudyGroup, joinStudyGroup, findGroupByInviteCode, getUserFriends, Friend, sendFriendRequest } from '@/lib/friends';
import { sendChatMessage } from '@/lib/group-chat';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';

export function GroupChat() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid || '';
  const userName = auth.currentUser?.displayName || 'User';
  const userEmail = auth.currentUser?.email;

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [friendStudentCode, setFriendStudentCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Load groups list when no groupId
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Load user profile
        const profileRef = doc(db, 'profiles', userId);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setUserProfile(profileSnap.data());
        }

        // Load groups
        if (!groupId) {
          const userGroups = await getUserStudyGroups(userId);
          setGroups(userGroups);

          // Load friends
          const userFriends = await getUserFriends(userId);
          setFriends(userFriends);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      }
      setLoading(false);
    };

    if (!groupId) {
      loadData();
    }
  }, [userId, groupId]);

  // Load specific group when groupId changes
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
          navigate('/chat');
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
          navigate('/chat');
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

    if (groupId) {
      loadGroupAndProfile();
    }
  }, [groupId, userId, navigate]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a group name',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const newGroupId = await createStudyGroup(
        userId,
        userName,
        groupName.trim(),
        groupDescription.trim()
      );

      toast({
        title: 'Success',
        description: 'Group created!',
      });

      setGroupName('');
      setGroupDescription('');
      setShowCreateDialog(false);
      
      // Load updated groups list
      const userGroups = await getUserStudyGroups(userId);
      setGroups(userGroups);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create group',
        variant: 'destructive',
      });
    }
    setCreating(false);
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an invite code',
        variant: 'destructive',
      });
      return;
    }

    setJoining(true);
    try {
      const groupToJoin = await findGroupByInviteCode(inviteCode.trim());
      
      if (!groupToJoin) {
        throw new Error('Invite code not found');
      }

      await joinStudyGroup(groupToJoin.id, userId);

      toast({
        title: 'Success',
        description: 'You joined the group!',
      });

      setInviteCode('');
      setShowJoinDialog(false);
      
      // Load updated groups list
      const userGroups = await getUserStudyGroups(userId);
      setGroups(userGroups);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to join group',
        variant: 'destructive',
      });
    }
    setJoining(false);
  };

  const handleAddFriend = async () => {
    if (!friendStudentCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a student code',
        variant: 'destructive',
      });
      return;
    }

    setAddingFriend(true);
    try {
      await sendFriendRequest(userId, userName, friendStudentCode.trim().toUpperCase());

      toast({
        title: 'Success',
        description: 'Friend request sent!',
      });

      setFriendStudentCode('');
      setShowAddFriendDialog(false);

      // Load updated friends list
      const userFriends = await getUserFriends(userId);
      setFriends(userFriends);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add friend',
        variant: 'destructive',
      });
    }
    setAddingFriend(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !groupId) return;

    setSendingMessage(true);
    try {
      await sendChatMessage(groupId, userId, userName, userProfile?.profile_picture_url, inputValue);
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
    setSendingMessage(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show group chat view if groupId is selected
  if (group && groupId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-2 pb-6 md:pb-2">
        <div className="space-y-2 px-1 lg:px-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/chat`)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {group.name}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {group.memberCount} members
                </p>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <Card className="p-0 bg-white dark:bg-gray-800 overflow-hidden" style={{ minHeight: 'calc(100vh - 300px)' }}>
            <Tabs defaultValue="chat" className="w-full h-full flex flex-col">
              <TabsList className="w-full rounded-none border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 justify-start">
                <TabsTrigger value="chat" className="flex items-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2 text-sm">
                  <FileUp className="w-4 h-4" />
                  Files
                </TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent
                value="chat"
                className="flex-1 m-0 min-h-[calc(100vh-180px)] bg-white dark:bg-gray-800"
              >
                <ChatRoom
                  groupId={groupId!}
                  userId={userId}
                  userName={userName}
                  userAvatar={userProfile?.profile_picture_url}
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  onSendMessage={handleSendMessage}
                  sending={sendingMessage}
                />
              </TabsContent>

              {/* Files Tab */}
              <TabsContent
                value="files"
                className="flex-1 m-0 min-h-[calc(100vh-180px)] p-2 bg-white dark:bg-gray-800 overflow-y-auto"
              >
                <FileSharing
                  groupId={groupId!}
                  userId={userId}
                  userName={userName}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    );
  }

  // Show groups list if no groupId is selected
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header with Icon */}
        <div className="flex justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                Study Groups
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-0 md:ml-12">
              Create groups and compete with friends
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="border-border/50 gap-2"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Start a new study group to collaborate with friends
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                      id="groupName"
                      placeholder="Enter group name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="groupDesc">Description</Label>
                    <Textarea
                      id="groupDesc"
                      placeholder="Enter group description"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      disabled={creating}
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={creating || !groupName.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {creating ? 'Creating...' : 'Create Group'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-border/50">
                  <Plus className="w-4 h-4 mr-2" />
                  Join Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Study Group</DialogTitle>
                  <DialogDescription>
                    Enter the invite code to join an existing group
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inviteCode">Invite Code *</Label>
                    <Input
                      id="inviteCode"
                      placeholder="Enter invite code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      disabled={joining}
                    />
                  </div>
                  <Button
                    onClick={handleJoinGroup}
                    disabled={joining || !inviteCode.trim()}
                    className="w-full"
                  >
                    {joining ? 'Joining...' : 'Join Group'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddFriendDialog} onOpenChange={setShowAddFriendDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-border/50 gap-2">
                  <UsersIcon className="w-4 h-4" />
                  Add Friend
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Friend</DialogTitle>
                  <DialogDescription>
                    Enter their student code to send a friend request
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="friendCode">Student Code *</Label>
                    <Input
                      id="friendCode"
                      placeholder="Enter friend's student code"
                      value={friendStudentCode}
                      onChange={(e) => setFriendStudentCode(e.target.value.toUpperCase())}
                      disabled={addingFriend}
                    />
                  </div>
                  <Button
                    onClick={handleAddFriend}
                    disabled={addingFriend || !friendStudentCode.trim()}
                    className="w-full"
                  >
                    {addingFriend ? 'Adding...' : 'Add Friend'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <Card className="p-8 text-center border-border/50 bg-gradient-to-br from-card/50 to-card/30">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-4">No groups yet</p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Create Your First Group
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((grp) => (
              <Card
                key={grp.id}
                className="p-4 border-border/50 bg-gradient-to-br from-card/50 to-card/30 hover:border-primary/50 cursor-pointer transition-all group overflow-hidden relative"
                onClick={() => navigate(`/chat/${grp.id}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all" />
                <div className="relative space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                        {grp.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {grp.memberCount} members
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                      {grp.memberCount}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {grp.description || 'No description'}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Created by {grp.creatorName}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
