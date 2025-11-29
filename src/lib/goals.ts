import { db } from '@/integrations/firebase/client';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { startOfWeek, endOfWeek } from 'date-fns';

export interface Goal {
  id: string;
  user_id: string;
  subject_id?: string | null;
  subject_name?: string;
  daily_target_minutes: number;
  weekly_target_minutes: number;
  created_at: number;
  updated_at: number;
}

export interface GoalProgress {
  goal: Goal;
  current_week_minutes: number;
  weekly_progress_percent: number;
  is_met: boolean;
}

/**
 * Fetch user's goals
 */
export async function fetchUserGoals(userId: string): Promise<Goal[]> {
  try {
    const q = query(collection(db, 'goals'), where('user_id', '==', userId));
    const snapshot = await getDocs(q);
    const goals: Goal[] = [];

    snapshot.forEach((doc) => {
      goals.push({
        id: doc.id,
        ...doc.data(),
      } as Goal);
    });

    return goals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
}

/**
 * Create or update a goal
 */
export async function saveGoal(
  userId: string,
  subjectId: string | null,
  subjectName: string | null,
  dailyTargetMinutes: number,
  weeklyTargetMinutes: number
): Promise<string> {
  try {
    const now = new Date().getTime();

    // Check if goal already exists for this subject
    const q = query(
      collection(db, 'goals'),
      where('user_id', '==', userId),
      where('subject_id', '==', subjectId || null)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Update existing goal
      const goalDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'goals', goalDoc.id), {
        daily_target_minutes: dailyTargetMinutes,
        weekly_target_minutes: weeklyTargetMinutes,
        updated_at: now,
      });
      return goalDoc.id;
    } else {
      // Create new goal
      const docRef = await addDoc(collection(db, 'goals'), {
        user_id: userId,
        subject_id: subjectId || null,
        subject_name: subjectName || null,
        daily_target_minutes: dailyTargetMinutes,
        weekly_target_minutes: weeklyTargetMinutes,
        created_at: now,
        updated_at: now,
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving goal:', error);
    throw error;
  }
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'goals', goalId));
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
}

/**
 * Calculate weekly study minutes for a user or subject
 */
export async function calculateWeeklyStudyMinutes(
  userId: string,
  subjectId?: string | null
): Promise<number> {
  try {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 }); // Saturday

    const startISOString = weekStart.toISOString().split('T')[0];
    const endISOString = weekEnd.toISOString().split('T')[0];

    let q;
    if (subjectId) {
      q = query(
        collection(db, 'study_sessions'),
        where('user_id', '==', userId),
        where('subject_id', '==', subjectId),
        where('session_type', '==', 'study')
      );
    } else {
      q = query(
        collection(db, 'study_sessions'),
        where('user_id', '==', userId),
        where('session_type', '==', 'study')
      );
    }

    const snapshot = await getDocs(q);
    let totalMinutes = 0;

    snapshot.forEach((doc) => {
      const data = doc.data() as any;
      const sessionDate = data.date;

      // Filter by week
      if (sessionDate >= startISOString && sessionDate <= endISOString) {
        totalMinutes += data.duration_minutes || 0;
      }
    });

    return totalMinutes;
  } catch (error) {
    console.error('Error calculating weekly study minutes:', error);
    throw error;
  }
}

/**
 * Get goal progress for all user's goals
 */
export async function getUserGoalProgress(userId: string): Promise<GoalProgress[]> {
  try {
    const goals = await fetchUserGoals(userId);
    const progress: GoalProgress[] = [];

    for (const goal of goals) {
      const currentWeekMinutes = await calculateWeeklyStudyMinutes(userId, goal.subject_id);
      const weeklyProgress = Math.round((currentWeekMinutes / goal.weekly_target_minutes) * 100);
      const isMet = currentWeekMinutes >= goal.weekly_target_minutes;

      progress.push({
        goal,
        current_week_minutes: currentWeekMinutes,
        weekly_progress_percent: Math.min(weeklyProgress, 100),
        is_met: isMet,
      });
    }

    return progress;
  } catch (error) {
    console.error('Error getting goal progress:', error);
    throw error;
  }
}

/**
 * Calculate daily study minutes for today
 */
export async function calculateTodayStudyMinutes(userId: string): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const q = query(
      collection(db, 'study_sessions'),
      where('user_id', '==', userId),
      where('date', '==', today),
      where('session_type', '==', 'study')
    );

    const snapshot = await getDocs(q);
    let totalMinutes = 0;

    snapshot.forEach((doc) => {
      totalMinutes += doc.data().duration_minutes || 0;
    });

    return totalMinutes;
  } catch (error) {
    console.error('Error calculating today study minutes:', error);
    throw error;
  }
}
