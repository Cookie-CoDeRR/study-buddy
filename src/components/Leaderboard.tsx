import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Medal, Flame } from 'lucide-react';
import { GroupMember } from '@/lib/friends';

interface LeaderboardProps {
  members: GroupMember[];
}

export function Leaderboard({ members }: LeaderboardProps) {
  const calculateGlowClass = (minutes: number): string => {
    if (minutes >= 480) return 'glow-fire'; // 8+ hours
    if (minutes >= 300) return 'glow-bright'; // 5-8 hours
    if (minutes >= 120) return 'glow-moderate'; // 2-5 hours
    if (minutes > 0) return 'glow-subtle'; // 0-2 hours
    return '';
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Medal className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getIntensityLabel = (minutes: number): string => {
    if (minutes >= 480) return 'On FIRE! 🔥';
    if (minutes >= 300) return 'Burning bright! 🌟';
    if (minutes >= 120) return 'Good pace';
    if (minutes > 0) return 'Just started';
    return 'No sessions';
  };

  const sortedMembers = [...members].sort((a, b) => b.totalTodayMinutes - a.totalTodayMinutes);

  return (
    <div className="w-full space-y-3">
      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-2">
        Today's Leaderboard
      </div>

      {sortedMembers.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <p>No group members yet</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedMembers.map((member, index) => {
            const glowClass = calculateGlowClass(member.totalTodayMinutes);
            const intensityLabel = getIntensityLabel(member.totalTodayMinutes);

            return (
              <Card
                key={member.userId}
                className={`p-3 flex items-center justify-between transition-all ${glowClass} ${
                  glowClass ? 'border-0' : 'border'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
                    {getMedalIcon(index) || (
                      <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={member.profilePicture} />
                    <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* Name and streak */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      Streak: {member.currentStreak} days
                    </p>
                  </div>
                </div>

                {/* Time and intensity */}
                <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200">
                    {member.totalTodayMinutes}m
                  </Badge>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {intensityLabel}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
