-- Users Table
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  syscoin_wallet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scoring Questions Table
CREATE TABLE public.scoring_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  order_num INTEGER NOT NULL
);

-- User Responses Table
CREATE TABLE public.user_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.scoring_questions(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert their own data and read questions
CREATE POLICY "Allow public insert to users" ON public.users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public select on users" ON public.users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public select on scoring_questions" ON public.scoring_questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert to user_responses" ON public.user_responses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public select on user_responses" ON public.user_responses FOR SELECT TO anon, authenticated USING (true);
