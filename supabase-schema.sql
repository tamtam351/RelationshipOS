-- Relationship OS Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RELATIONSHIPS
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Us',
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RELATIONSHIP_MEMBERS
CREATE TABLE IF NOT EXISTS relationship_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(relationship_id, user_id)
);

-- MEMORIES
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  memory_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTES
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LORE
CREATE TABLE IF NOT EXISTS lore (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'stories',
  date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GAMES
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GAME_RESPONSES
CREATE TABLE IF NOT EXISTS game_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT,
  answer TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- TIMELINE_EVENTS
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAILY_PROMPTS
CREATE TABLE IF NOT EXISTS daily_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROMPT_RESPONSES
CREATE TABLE IF NOT EXISTS prompt_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES daily_prompts(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(relationship_id, user_id, prompt_id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WRAPPED_STATS
CREATE TABLE IF NOT EXISTS wrapped_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  stats_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_relationship_members_user ON relationship_members(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_members_rel ON relationship_members(relationship_id);
CREATE INDEX IF NOT EXISTS idx_memories_rel ON memories(relationship_id);
CREATE INDEX IF NOT EXISTS idx_notes_rel ON notes(relationship_id);
CREATE INDEX IF NOT EXISTS idx_lore_rel ON lore(relationship_id);
CREATE INDEX IF NOT EXISTS idx_games_rel ON games(relationship_id);
CREATE INDEX IF NOT EXISTS idx_timeline_rel ON timeline_events(relationship_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_responses_rel ON prompt_responses(relationship_id);

-- Helper function: check if user is member of relationship
CREATE OR REPLACE FUNCTION is_relationship_member(rel_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM relationship_members
    WHERE relationship_id = rel_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrapped_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Members can view partner profile" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM relationship_members rm1
    JOIN relationship_members rm2 ON rm1.relationship_id = rm2.relationship_id
    WHERE rm1.user_id = auth.uid() AND rm2.user_id = profiles.id
  )
);

-- RELATIONSHIPS policies
CREATE POLICY "Members can view relationship" ON relationships FOR SELECT USING (is_relationship_member(id));
CREATE POLICY "Authenticated can create relationship" ON relationships FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creator can update relationship" ON relationships FOR UPDATE USING (auth.uid() = creator_id);

-- RELATIONSHIP_MEMBERS policies
CREATE POLICY "Members can view members" ON relationship_members FOR SELECT USING (is_relationship_member(relationship_id));
CREATE POLICY "Users can join via invite" ON relationship_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave" ON relationship_members FOR DELETE USING (auth.uid() = user_id);

-- MEMORIES policies
CREATE POLICY "Members can view memories" ON memories FOR SELECT USING (is_relationship_member(relationship_id));
CREATE POLICY "Members can create memories" ON memories FOR INSERT WITH CHECK (is_relationship_member(relationship_id) AND auth.uid() = created_by);
CREATE POLICY "Creators can update memories" ON memories FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete memories" ON memories FOR DELETE USING (auth.uid() = created_by);

-- NOTES policies
CREATE POLICY "Members can view notes" ON notes FOR SELECT USING (is_relationship_member(relationship_id));
CREATE POLICY "Members can create notes" ON notes FOR INSERT WITH CHECK (is_relationship_member(relationship_id) AND auth.uid() = created_by);
CREATE POLICY "Creators can update notes" ON notes FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete notes" ON notes FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Recipient can mark read" ON notes FOR UPDATE USING (is_relationship_member(relationship_id));

-- LORE policies
CREATE POLICY "Members can view lore" ON lore FOR SELECT USING (is_relationship_member(relationship_id));
CREATE POLICY "Members can create lore" ON lore FOR INSERT WITH CHECK (is_relationship_member(relationship_id) AND auth.uid() = created_by);
CREATE POLICY "Creators can update lore" ON lore FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete lore" ON lore FOR DELETE USING (auth.uid() = created_by);

-- GAMES policies
CREATE POLICY "Members can view games" ON games FOR SELECT USING (is_relationship_member(relationship_id));
CREATE POLICY "Members can create games" ON games FOR INSERT WITH CHECK (is_relationship_member(relationship_id) AND auth.uid() = created_by);
CREATE POLICY "Members can update games" ON games FOR UPDATE USING (is_relationship_member(relationship_id));

-- GAME_RESPONSES policies
CREATE POLICY "Members can view responses" ON game_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM games g WHERE g.id = game_id AND is_relationship_member(g.relationship_id))
);
CREATE POLICY "Users can insert own response" ON game_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own response" ON game_responses FOR UPDATE USING (auth.uid() = user_id);

-- TIMELINE policies
CREATE POLICY "Members can view timeline" ON timeline_events FOR SELECT USING (is_relationship_member(relationship_id));
CREATE POLICY "Members can create timeline" ON timeline_events FOR INSERT WITH CHECK (is_relationship_member(relationship_id) AND auth.uid() = created_by);
CREATE POLICY "Creators can update timeline" ON timeline_events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete timeline" ON timeline_events FOR DELETE USING (auth.uid() = created_by);

-- DAILY_PROMPTS (public read)
CREATE POLICY "Anyone can read prompts" ON daily_prompts FOR SELECT USING (true);

-- PROMPT_RESPONSES
CREATE POLICY "Members can view prompt responses" ON prompt_responses FOR SELECT USING (is_relationship_member(relationship_id));
CREATE POLICY "Users can insert own response" ON prompt_responses FOR INSERT WITH CHECK (auth.uid() = user_id AND is_relationship_member(relationship_id));

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- WRAPPED_STATS
CREATE POLICY "Members can view wrapped" ON wrapped_stats FOR SELECT USING (is_relationship_member(relationship_id));

-- SETTINGS
CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger for profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', lower(replace(split_part(NEW.email, '@', 1), '.', '_')) || substr(NEW.id::text, 1, 4)),
    NEW.email
  );
  INSERT INTO settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER relationships_updated_at BEFORE UPDATE ON relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER memories_updated_at BEFORE UPDATE ON memories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lore_updated_at BEFORE UPDATE ON lore FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed daily prompts
INSERT INTO daily_prompts (prompt, category) VALUES
  ('What is one tiny thing about them that always makes you smile?', 'appreciation'),
  ('What is a memory you randomly think about?', 'memories'),
  ('What would you two do if you had a completely free day?', 'future'),
  ('What is something they do that you find oddly endearing?', 'appreciation'),
  ('If you could relive one day together, which would it be?', 'memories'),
  ('What is a small way they make your life better?', 'appreciation'),
  ('What inside joke still makes you laugh?', 'fun'),
  ('What is something you want to try together this month?', 'future'),
  ('What is your favorite version of them?', 'appreciation'),
  ('What song reminds you of them?', 'fun')
ON CONFLICT DO NOTHING;

-- Storage bucket for avatars and memories (run in Storage or via dashboard)
-- Create buckets: avatars, memories
-- Policies: authenticated users can upload to their own folder, members can read relationship images

-- ACTIVITIES (Do Something results — shared across both devices)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT,
  emoji TEXT,
  mood TEXT,
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_rel ON activities(relationship_id);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view activities" ON activities FOR SELECT USING (is_relationship_member(relationship_id));
CREATE POLICY "Members can create activities" ON activities FOR INSERT WITH CHECK (is_relationship_member(relationship_id) AND auth.uid() = created_by);
CREATE POLICY "Members can update activities" ON activities FOR UPDATE USING (is_relationship_member(relationship_id));
CREATE POLICY "Creators can delete activities" ON activities FOR DELETE USING (auth.uid() = created_by);
