-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT CHECK(user_type IN ('student', 'teacher')) NOT NULL,
  school TEXT,
  class TEXT,
  dob DATE,
  subjects TEXT,
  experience TEXT,
  unique_id TEXT UNIQUE,
  coins INTEGER DEFAULT 0,
  badges INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Create policy for subjects (publicly readable)
CREATE POLICY "Subjects are viewable by everyone" 
ON public.subjects 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can manage subjects" 
ON public.subjects 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'teacher'
  )
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id),
  title TEXT NOT NULL,
  description TEXT,
  class_level TEXT NOT NULL,
  difficulty_level TEXT CHECK(difficulty_level IN ('easy', 'medium', 'hard')),
  created_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Create policies for quizzes
CREATE POLICY "Quizzes are viewable by everyone" 
ON public.quizzes 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Teachers can manage their quizzes" 
ON public.quizzes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'teacher'
  )
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policies for questions
CREATE POLICY "Questions are viewable by everyone" 
ON public.questions 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can manage questions" 
ON public.questions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.quizzes q ON q.created_by = p.id
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'teacher'
    AND q.id = quiz_id
  )
);

-- Create quiz_results table
CREATE TABLE public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id),
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  coins_earned INTEGER NOT NULL,
  badge TEXT NOT NULL,
  time_taken INTEGER, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz results
CREATE POLICY "Students can view their own results" 
ON public.quiz_results 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND id = student_id
  )
);

CREATE POLICY "Teachers can view all results" 
ON public.quiz_results 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'teacher'
  )
);

CREATE POLICY "Students can insert their own results" 
ON public.quiz_results 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND id = student_id
  )
);

-- Create games table
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id),
  game_type TEXT CHECK(game_type IN ('memory', 'puzzle', 'word', 'math', 'science')),
  difficulty_level TEXT CHECK(difficulty_level IN ('easy', 'medium', 'hard')),
  class_level TEXT,
  game_data JSONB, -- Store game configuration
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Create policy for games
CREATE POLICY "Games are viewable by everyone" 
ON public.games 
FOR SELECT 
USING (is_active = true);

-- Create reading_materials table
CREATE TABLE public.reading_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  class_level TEXT NOT NULL,
  material_type TEXT CHECK(material_type IN ('story', 'article', 'lesson', 'experiment')),
  difficulty_level TEXT CHECK(difficulty_level IN ('easy', 'medium', 'hard')),
  estimated_time INTEGER, -- reading time in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reading_materials ENABLE ROW LEVEL SECURITY;

-- Create policy for reading materials
CREATE POLICY "Reading materials are viewable by everyone" 
ON public.reading_materials 
FOR SELECT 
USING (is_active = true);

-- Insert default subjects
INSERT INTO public.subjects (name, description, icon, color) VALUES
('Science', 'Physics, Chemistry, Biology fundamentals', 'BookOpen', 'from-blue-500 to-blue-600'),
('Mathematics', 'Algebra, Geometry, Statistics', 'Calculator', 'from-green-500 to-green-600'),
('Technology', 'Computer Science, Digital Skills', 'Cpu', 'from-purple-500 to-purple-600'),
('Engineering', 'Problem Solving, Design Thinking', 'Cog', 'from-orange-500 to-orange-600'),
('English', 'Language and Communication Skills', 'BookOpen', 'from-red-500 to-red-600');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();