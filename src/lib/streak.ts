import { format, parseISO, subDays } from 'date-fns';
import { StudySession } from '@/integrations/firebase/types';

/**
 * Calculate study streak based on study sessions
 * A streak is consecutive days with at least one study session
 */
export function calculateStreak(sessions: StudySession[]): {
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
} {
  if (sessions.length === 0) {
    return {
      current_streak: 0,
      longest_streak: 0,
      last_study_date: null,
    };
  }

  // Filter only study sessions (not breaks)
  const studySessions = sessions.filter((s) => s.session_type === 'study');

  if (studySessions.length === 0) {
    return {
      current_streak: 0,
      longest_streak: 0,
      last_study_date: null,
    };
  }

  // Get unique study dates sorted in descending order
  const uniqueDates = [...new Set(studySessions.map((s) => s.date))].sort().reverse();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Check if today or yesterday has a study session
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    currentStreak = 1;
  }

  // Calculate streaks
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = parseISO(uniqueDates[i]);
    const nextDate = parseISO(uniqueDates[i + 1]);
    const dayDiff = Math.floor(
      (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 1) {
      tempStreak++;
      if (uniqueDates[i + 1] === today || uniqueDates[i + 1] === yesterday) {
        currentStreak = tempStreak;
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_study_date: uniqueDates[0] || null,
  };
}

/**
 * Update streak data in profile based on current session
 * Called after recording a new study session
 */
export function updateStreakForNewSession(
  currentProfile: {
    current_streak: number;
    longest_streak: number;
    last_study_date: string | null;
  },
  newSessionDate: string
): {
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
} {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // If new session is from today
  if (newSessionDate === today) {
    // If there was already a session today, streak stays same
    if (currentProfile.last_study_date === today) {
      return currentProfile;
    }

    // If last session was yesterday, increment streak
    if (currentProfile.last_study_date === yesterday) {
      const newStreak = currentProfile.current_streak + 1;
      return {
        current_streak: newStreak,
        longest_streak: Math.max(currentProfile.longest_streak, newStreak),
        last_study_date: today,
      };
    }

    // Otherwise, start new streak
    return {
      current_streak: 1,
      longest_streak: currentProfile.longest_streak,
      last_study_date: today,
    };
  }

  return currentProfile;
}
