/*
  # Initial Gaming Portal Schema

  1. Tables
    - games
      - id (uuid, primary key)
      - title (text)
      - slug (text, unique)
      - description (text)
      - thumbnail (text)
      - iframe_url (text)
      - category (text)
      - created_at (timestamp)
    
    - categories
      - id (uuid, primary key)
      - name (text)
      - slug (text, unique)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  thumbnail text NOT NULL,
  iframe_url text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for games
CREATE POLICY "Allow public read access on games"
  ON games
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for categories
CREATE POLICY "Allow public read access on categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample data
INSERT INTO categories (name, slug) VALUES
  ('Action', 'action'),
  ('Adventure', 'adventure'),
  ('Puzzle', 'puzzle'),
  ('Racing', 'racing'),
  ('Sports', 'sports');

INSERT INTO games (title, slug, description, thumbnail, iframe_url, category) VALUES
  (
    'Space Explorer',
    'space-explorer',
    'Explore the vast universe in this exciting space adventure game.',
    'https://images.unsplash.com/photo-1614728263952-84ea256f9679',
    'https://example.com/games/space-explorer',
    'Adventure'
  ),
  (
    'Speed Racer',
    'speed-racer',
    'Race through challenging tracks in this high-speed racing game.',
    'https://images.unsplash.com/photo-1511994298241-608e28f14fde',
    'https://example.com/games/speed-racer',
    'Racing'
  ),
  (
    'Mind Puzzle',
    'mind-puzzle',
    'Test your brain with challenging puzzles and riddles.',
    'https://images.unsplash.com/photo-1612521564730-95144928de4c',
    'https://example.com/games/mind-puzzle',
    'Puzzle'
  );
