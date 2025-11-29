import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Phone, Video, Search, X, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ChatRoom } from '@/components/ChatRoom';
import { FileSharing } from '@/components/FileSharing';
import { getGroupMemberStats } from '@/lib/friends';
import { StudyGroup } from '@/lib/friends';

interface GroupChatInterfaceProps {
  group: StudyGroup;
  userId: string;
  userName: string;
  userAvatar?: string;
  onClose?: () => void;
}

export function GroupChatInterface({
  group,
  userId,
  userName,
  userAvatar,
  onClose,
}: GroupChatInterfaceProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMember, setSearchMember] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadMembers();
  }, [group.id]);

  const loadMembers = async () => {
    try {
      const memberStats = await getGroupMemberStats(group.id);
      setMembers(memberStats);
    } catch (error) {
      console.error('Error loading members:', error);
    }
    setLoading(false);
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Left Sidebar - Members (Hidden on mobile by default) */}
        <div className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 overflow-hidden md:w-80`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {group.name}
              </h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowInfo(!showInfo)}
                className="h-8 w-8"
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>

            {/* Group Info Collapsed */}
            {!showInfo && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p>{group.memberCount} members</p>
                <p className="truncate">{group.description}</p>
              </div>
            )}

            {/* Group Info Expanded */}
            {showInfo && (
              <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 text-xs space-y-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {group.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {group.description}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">{group.memberCount} members</Badge>
                  <Badge variant="outline">
                    Created by {group.creatorName}
                  </Badge>
                </div>
              </Card>
            )}

            {/* Search Members */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Loading members...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No members found</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredMembers.map((member) => {
                  const isCurrentUser = member.userId === userId;
                  return (
                    <div
                      key={member.userId}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isCurrentUser
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Online Indicator */}
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.profilePicture} />
                            <AvatarFallback>
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {member.totalTodayMinutes > 0 && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {member.name}
                            {isCurrentUser && (
                              <span className="text-xs text-gray-500 ml-1">
                                (You)
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {member.totalTodayMinutes}m
                            </span>
                            {member.currentStreak > 0 && (
                              <span className="text-xs text-orange-500">
                                🔥 {member.currentStreak}d
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'} online
            </p>
          </div>
        </div>

        {/* Right Side - Chat & Files */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {onClose && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden flex-shrink-0"
                title="Toggle members list"
              >
                <UsersIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                  {group.name}
                </h1>
                <p className="text-xs text-gray-500 truncate">
                  {group.memberCount} members • {members.filter(m => m.totalTodayMinutes > 0).length} active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <Button size="icon" variant="ghost" className="h-10 w-10 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Start call">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </Button>
              <Button size="icon" variant="ghost" className="h-10 w-10 hover:bg-purple-100 dark:hover:bg-purple-900/30" title="Start video call">
                <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </Button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none justify-start border-b border-gray-200 dark:border-gray-700 bg-transparent px-4 md:px-6">
                <TabsTrigger value="chat" className="text-sm md:text-base">Chat</TabsTrigger>
                <TabsTrigger value="files" className="text-sm md:text-base">Files</TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent
                value="chat"
                className="flex-1 m-0 min-h-0 flex flex-col"
              >
                <ChatRoom
                  groupId={group.id}
                  userId={userId}
                  userName={userName}
                  userAvatar={userAvatar}
                />
              </TabsContent>

              {/* Files Tab */}
              <TabsContent
                value="files"
                className="flex-1 m-0 min-h-0 overflow-y-auto p-4"
              >
                <FileSharing
                  groupId={group.id}
                  userId={userId}
                  userName={userName}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
