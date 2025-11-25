// Firebase collection types for the Study Buddy app

export interface Profile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  student_code: string;
  created_at: number;
  // Streak tracking
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null; // YYYY-MM-DD format
  // Profile picture
  profile_picture_url?: string | null;
  // Study goals
  daily_goal_minutes?: number;
  weekly_goal_minutes?: number;
  // Theme preference
  theme?: 'light' | 'dark' | 'system';
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: number;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  session_type: 'study' | 'break';
  date: string;
  notes?: string | null;
  created_at: number;
}

export interface Goal {
  id: string;
  user_id: string;
  subject_id: string | null;
  goal_type: 'daily' | 'weekly' | 'monthly';
  target_minutes: number;
  created_at: number;
  updated_at: number;
}
