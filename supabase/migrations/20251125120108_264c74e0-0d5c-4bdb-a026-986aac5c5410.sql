-- Create profiles table for student information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  student_code TEXT NOT NULL UNIQUE,
  phone TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Subjects policies
CREATE POLICY "Users can view own subjects"
  ON public.subjects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subjects"
  ON public.subjects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subjects"
  ON public.subjects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjects"
  ON public.subjects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create study sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  session_type TEXT NOT NULL CHECK (session_type IN ('study', 'break')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Study sessions policies
CREATE POLICY "Users can view own sessions"
  ON public.study_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.study_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.study_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.study_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to generate unique student code
CREATE OR REPLACE FUNCTION public.generate_student_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character random code
    new_code := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE student_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, student_code, phone, full_name)
  VALUES (
    NEW.id,
    generate_student_code(),
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();