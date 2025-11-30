import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, Check, X, Flame, Clock } from 'lucide-react';
import { 
  sendFriendRequest, 
  getPendingRequests, 
  acceptFriendRequest, 
  rejectFriendRequest,
  getUserFriends,
  getFriendProfileDetails,
  Friend,
} from '@/lib/friends';
import { auth } from '@/integrations/firebase/client';
import { toast } from '@/hooks/use-toast';

interface FriendsManagerProps {
  userId: string;
}

export function FriendsManager({ userId }: FriendsManagerProps) {
  const [studentCode, setStudentCode] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendDetails, setFriendDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const friendsList = await getUserFriends(userId);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
    setLoading(false);
  };

  const loadPendingRequests = async () => {
    try {
      const requests = await getPendingRequests(userId);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, [userId]);

  const handleViewFriendProfile = async (friend: Friend) => {
    setSelectedFriend(friend);
    setLoadingDetails(true);
    try {
      const details = await getFriendProfileDetails(friend.friendUserId);
      setFriendDetails(details);
    } catch (error) {
      console.error('Error loading friend details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load friend profile',
        variant: 'destructive',
      });
      setSelectedFriend(null);
    }
    setLoadingDetails(false);
  };

  const handleAddFriend = async () => {
    if (!studentCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a student code',
        variant: 'destructive',
      });
      return;
    }

    setSearching(true);
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');

      await sendFriendRequest(userId, auth.currentUser.displayName || 'Unknown', studentCode.trim());
      toast({
        title: 'Success',
        description: 'Friend request sent!',
      });
      setStudentCode('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send friend request',
        variant: 'destructive',
      });
    }
    setSearching(false);
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      toast({
        title: 'Success',
        description: 'Friend request accepted!',
      });
      await loadPendingRequests();
      await loadFriends();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept friend request',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      toast({
        title: 'Success',
        description: 'Friend request rejected',
      });
      await loadPendingRequests();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject friend request',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friends">
            Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Add Friend Section */}
        <Card className="p-4 mt-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex gap-2">
            <Input
              placeholder="Enter student code..."
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
              className="flex-1"
            />
            <Button
              onClick={handleAddFriend}
              disabled={searching}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {searching ? 'Adding...' : 'Add Friend'}
            </Button>
          </div>
        </Card>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-3 mt-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading friends...</div>
          ) : friends.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              <p>No friends yet. Add someone using their student code!</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <Card
                  key={friend.id}
                  className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors md-elevate cursor-pointer"
                  onClick={() => handleViewFriendProfile(friend)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.friendProfilePicture} />
                      <AvatarFallback>
                        {friend.friendName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {friend.friendName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        @{friend.friendStudentCode}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    Friend
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-3 mt-4">
          {pendingRequests.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              <p>No pending friend requests</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <Card
                  key={request.id}
                  className="p-3 flex items-center justify-between hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors md-elevate"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.friendProfilePicture} />
                      <AvatarFallback>
                        {request.friendName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {request.friendName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        @{request.friendStudentCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAccept(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReject(request.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Friend Profile Modal */}
      <Dialog open={!!selectedFriend} onOpenChange={(open) => !open && setSelectedFriend(null)}>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>Friend Profile</DialogTitle>
            <DialogDescription>
              View your friend's profile and stats
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : selectedFriend && friendDetails ? (
            <div className="space-y-4">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={friendDetails.profilePicture} />
                  <AvatarFallback className="text-2xl">
                    {friendDetails.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name and Student Code */}
              <div className="text-center">
                <h2 className="text-xl font-bold">{friendDetails.name}</h2>
                <p className="text-sm text-gray-500">@{friendDetails.studentCode}</p>
              </div>

              {/* Bio */}
              {friendDetails.bio && (
                <Card className="p-3 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {friendDetails.bio}
                  </p>
                </Card>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {/* Streak */}
                <Card className="p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Streak
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {friendDetails.currentStreak}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {friendDetails.currentStreak === 1 ? 'day' : 'days'}
                  </p>
                </Card>

                {/* Today's Study Time */}
                <Card className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Today
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {friendDetails.totalTodayMinutes}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    minutes
                  </p>
                </Card>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
