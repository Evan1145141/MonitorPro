/*
  # Create Feedback Table

  ## Overview
  Creates a feedback table for users to submit feedback and suggestions.

  ## New Tables
  
  ### feedback
  - id (uuid, primary key)
  - user_id (uuid, references auth.users) - User who submitted feedback
  - email (text) - Optional contact email
  - content (text) - Required feedback content
  - status (text) - Feedback status (pending, reviewed, resolved)
  - created_at (timestamptz) - Submission timestamp

  ## Security
  - RLS enabled
  - Users can view their own feedback
  - Users can insert their own feedback
  - Only authenticated users can submit feedback
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text DEFAULT '',
  content text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
