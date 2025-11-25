-- Make phone field optional in profiles table
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;

-- Update the trigger function to not require phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, student_code, full_name)
  VALUES (
    NEW.id,
    generate_student_code(),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;