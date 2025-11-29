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
        </div>

        {/* Create/Join Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 w-full h-12 rounded-lg font-semibold shadow-lg transition-all">
                <Plus className="w-5 h-5 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create a New Group</DialogTitle>
                <DialogDescription>
                  Create a study group and invite your friends to compete
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName" className="font-semibold">Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="e.g., NEET Preparation"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="mt-2 rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="groupDescription" className="font-semibold">Description</Label>
                  <Textarea
                    id="groupDescription"
                    placeholder="What's this group about?"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={3}
                    className="mt-2 rounded-lg"
                  />
                </div>
                <Button
                  onClick={handleCreateGroup}
                  disabled={creating}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 h-11 rounded-lg font-semibold"
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-12 rounded-lg font-semibold border-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                <ArrowRight className="w-5 h-5 mr-2" />
                Join Group
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Join a Group</DialogTitle>
                <DialogDescription>
                  Enter an invite code to join a study group
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inviteCode" className="font-semibold">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="e.g., GRP-ABCDEF123"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="mt-2 rounded-lg font-mono text-center"
                  />
                </div>
                <Button
                  onClick={handleJoinGroup}
                  disabled={joining}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-11 rounded-lg font-semibold"
                >
                  {joining ? 'Joining...' : 'Join Group'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Groups List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Your Groups
            </h2>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {groups.length}
            </Badge>
          </div>

          {loading ? (
            <Card className="p-12 text-center border border-gray-200 dark:border-gray-800 rounded-xl">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading groups...</p>
            </Card>
          ) : groups.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No groups yet</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create one or join a friend's group to get started!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {groups.map((group, idx) => (
                <Card
                  key={group.id}
                  className="p-5 hover:shadow-lg hover:border-purple-500/50 transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-800 rounded-lg group/card overflow-hidden relative"
                  onClick={() => setSelectedGroup(group)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover/card:from-purple-500/5 group-hover/card:to-blue-500/5 transition-all duration-300" />
                  
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover/card:text-purple-600 dark:group-hover/card:text-purple-400 transition-colors truncate">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {group.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Badge variant="secondary" className="rounded-full">
                          👥 {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                        </Badge>
                        {group.creatorId === userId && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full">
                            👑 Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover/card:text-purple-600 group-hover/card:translate-x-1 transition-all flex-shrink-0 ml-4" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Friends Manager Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Friends
            </h2>
          </div>
          <Card className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-gradient-to-br from-card to-card/50">
            <FriendsManager userId={userId} />
          </Card>
        </div>
      </div>
    </div>
  );
}
