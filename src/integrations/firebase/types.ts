// Firebase collection types for the Study Buddy app

export interface Profile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  student_code: string;
  created_at: number;
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
