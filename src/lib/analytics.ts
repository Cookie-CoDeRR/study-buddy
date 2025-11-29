import { db } from '@/integrations/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, subDays } from 'date-fns';

export interface SubjectStat {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  totalMinutes: number;
  sessionCount: number;
  averageSessionDuration: number;
}

export interface DailyStats {
  date: string;
  studyMinutes: number;
  breakMinutes: number;
  sessionCount: number;
}

export interface WeeklyComparison {
  currentWeekMinutes: number;
  previousWeekMinutes: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'equal';
}

/**
 * Get statistics for all subjects
 */
export async function getSubjectAnalytics(userId: string): Promise<SubjectStat[]> {
  try {
    // Fetch all study sessions for the user
    const q = query(
      collection(db, 'study_sessions'),
      where('user_id', '==', userId),
      where('session_type', '==', 'study')
    );
    const snapshot = await getDocs(q);

    // Group by subject
    const subjectMap = new Map<string, SubjectStat>();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const subjectId = data.subject_id || 'general';
      const subjectName = data.subject_name || 'General Study';
      const subjectColor = data.subject_color || '#3B82F6';
      const durationMinutes = data.duration_minutes || 0;

      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          subjectId,
          subjectName,
          subjectColor,
          totalMinutes: 0,
          sessionCount: 0,
          averageSessionDuration: 0,
        });
      }

      const stat = subjectMap.get(subjectId)!;
      stat.totalMinutes += durationMinutes;
      stat.sessionCount += 1;
    });

    // Calculate averages
    const stats = Array.from(subjectMap.values()).map((stat) => ({
      ...stat,
      averageSessionDuration: stat.sessionCount > 0 
        ? Math.round(stat.totalMinutes / stat.sessionCount)
        : 0,
    }));

    // Sort by total minutes descending
    return stats.sort((a, b) => b.totalMinutes - a.totalMinutes);
  } catch (error) {
    console.error('Error getting subject analytics:', error);
    throw error;
  }
}

/**
 * Get daily study statistics for the last N days
 */
export async function getDailyStats(userId: string, days: number = 7): Promise<DailyStats[]> {
  try {
    const q = query(
      collection(db, 'study_sessions'),
      where('user_id', '==', userId)
    );
    const snapshot = await getDocs(q);

    // Create a map for each day
    const dailyMap = new Map<string, DailyStats>();

    // Initialize last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, {
        date: dateStr,
        studyMinutes: 0,
        breakMinutes: 0,
        sessionCount: 0,
      });
    }

    // Populate with session data
    snapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.date;

      if (dailyMap.has(date)) {
        const daily = dailyMap.get(date)!;
        if (data.session_type === 'study') {
          daily.studyMinutes += data.duration_minutes || 0;
        } else if (data.session_type === 'break') {
          daily.breakMinutes += data.duration_minutes || 0;
        }
        daily.sessionCount += 1;
      }
    });

    // Return sorted by date
    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error getting daily stats:', error);
    throw error;
  }
}

/**
 * Compare current week to previous week
 */
export async function getWeeklyComparison(userId: string): Promise<WeeklyComparison> {
  try {
    const now = new Date();
    
    // Current week
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 });
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 0 });
    
    // Previous week
    const prevWeekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 0 });
    const prevWeekEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 0 });

    const q = query(
      collection(db, 'study_sessions'),
      where('user_id', '==', userId),
      where('session_type', '==', 'study')
    );
    const snapshot = await getDocs(q);

    let currentWeekMinutes = 0;
    let previousWeekMinutes = 0;

    const currentWeekStartStr = currentWeekStart.toISOString().split('T')[0];
    const currentWeekEndStr = currentWeekEnd.toISOString().split('T')[0];
    const prevWeekStartStr = prevWeekStart.toISOString().split('T')[0];
    const prevWeekEndStr = prevWeekEnd.toISOString().split('T')[0];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.date;
      const minutes = data.duration_minutes || 0;

      if (date >= currentWeekStartStr && date <= currentWeekEndStr) {
        currentWeekMinutes += minutes;
      } else if (date >= prevWeekStartStr && date <= prevWeekEndStr) {
        previousWeekMinutes += minutes;
      }
    });

    const change = currentWeekMinutes - previousWeekMinutes;
    const percentageChange = previousWeekMinutes > 0 
      ? Math.round((change / previousWeekMinutes) * 100)
      : 100;

    return {
      currentWeekMinutes,
      previousWeekMinutes,
      percentageChange,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'equal',
    };
  } catch (error) {
    console.error('Error getting weekly comparison:', error);
    throw error;
  }
}

/**
 * Get total statistics for user
 */
export async function getUserTotalStats(userId: string) {
  try {
    const q = query(
      collection(db, 'study_sessions'),
      where('user_id', '==', userId)
    );
    const snapshot = await getDocs(q);

    let totalStudyMinutes = 0;
    let totalBreakMinutes = 0;
    let totalSessions = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.session_type === 'study') {
        totalStudyMinutes += data.duration_minutes || 0;
      } else if (data.session_type === 'break') {
        totalBreakMinutes += data.duration_minutes || 0;
      }
      totalSessions += 1;
    });

    return {
      totalStudyMinutes,
      totalBreakMinutes,
      totalSessions,
      averageSessionDuration: totalSessions > 0 
        ? Math.round(totalStudyMinutes / totalSessions)
        : 0,
    };
  } catch (error) {
    console.error('Error getting total stats:', error);
    throw error;
  }
}
