import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Plus, LogOut, ArrowRight } from 'lucide-react';
import { 
  getUserStudyGroups, 
  createStudyGroup, 
  joinStudyGroup,
  leaveStudyGroup,
  findGroupByInviteCode,
  StudyGroup,
} from '@/lib/friends';
import { StudyGroupView } from '@/components/StudyGroup';
import { FriendsManager } from '@/components/FriendsManager';
import { auth, db } from '@/integrations/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export function Groups() {
  const userId = auth.currentUser?.uid || '';
  const userName = auth.currentUser?.displayName || 'User';

  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    loadGroupsAndProfile();
  }, [userId]);

  const loadGroupsAndProfile = async () => {
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
      const userGroups = await getUserStudyGroups(userId);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load groups',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

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
      const groupId = await createStudyGroup(
        userId,
        userName,
        groupName.trim(),
        groupDescription.trim()
      );

      toast({
        title: 'Success',
        description: 'Group created!',
      });

      // Clear form
      setGroupName('');
      setGroupDescription('');

      // Reload groups
      await loadGroupsAndProfile();
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
      // Find group by invite code from all groups
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
      await loadGroupsAndProfile();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to join group',
        variant: 'destructive',
      });
    }
    setJoining(false);
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;

    try {
      await leaveStudyGroup(selectedGroup.id, userId);
      toast({
        title: 'Success',
        description: 'You left the group',
      });
      setSelectedGroup(null);
      await loadGroupsAndProfile();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to leave group',
        variant: 'destructive',
      });
    }
  };

  if (selectedGroup) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <StudyGroupView
          group={selectedGroup}
          userId={userId}
          userProfile={userProfile}
          onLeave={() => {
            setSelectedGroup(null);
            loadGroupsAndProfile();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Study Groups
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create groups and compete with friends
            </p>
          </div>
          <Users className="w-8 h-8 text-purple-600" />
        </div>

        {/* Create/Join Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Group</DialogTitle>
                <DialogDescription>
                  Create a study group and invite your friends to compete
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="e.g., NEET Preparation"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="groupDescription">Description</Label>
                  <Textarea
                    id="groupDescription"
                    placeholder="What's this group about?"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateGroup}
                  disabled={creating}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                Join Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Group</DialogTitle>
                <DialogDescription>
                  Enter an invite code to join a study group
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="e.g., GRP-ABCDEF123"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  />
                </div>
                <Button
                  onClick={handleJoinGroup}
                  disabled={joining}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {joining ? 'Joining...' : 'Join Group'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Groups List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your Groups ({groups.length})
          </h2>

          {loading ? (
            <Card className="p-8 text-center text-gray-500">
              <p>Loading groups...</p>
            </Card>
          ) : groups.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No groups yet. Create one or join a friend's group!</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer md-elevate"
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {group.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {group.memberCount} members
                        </Badge>
                        {group.creatorId === userId && (
                          <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 mt-1" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Friends Manager Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Friends
          </h2>
          <FriendsManager userId={userId} />
        </div>
      </div>
    </div>
  );
}
