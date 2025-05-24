-- SQL for webauthn_challenges table
CREATE TABLE IF NOT EXISTS webauthn_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Can be REFERENCES auth.users(id) ON DELETE CASCADE if desired, though not strictly necessary if user_id is just for association here
    challenge TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL -- Challenges should have a short lifespan
);

-- Add comments to the columns
COMMENT ON COLUMN webauthn_challenges.id IS 'Unique identifier for the challenge';
COMMENT ON COLUMN webauthn_challenges.user_id IS 'Identifier of the user for whom the challenge was generated';
COMMENT ON COLUMN webauthn_challenges.challenge IS 'The unique challenge string sent to the client';
COMMENT ON COLUMN webauthn_challenges.created_at IS 'Timestamp of when the challenge was created';
COMMENT ON COLUMN webauthn_challenges.expires_at IS 'Timestamp of when the challenge will expire';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user_id ON webauthn_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_challenge ON webauthn_challenges(challenge); -- Already unique, but explicit index can be useful
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_expires_at ON webauthn_challenges(expires_at); -- For cleaning up expired challenges

-- Enable Row Level Security
ALTER TABLE webauthn_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Allow service_role to perform any action (used by the Supabase function).
-- Supabase functions with the service_role key bypass RLS by default, but explicit policies are good practice if that changes.
CREATE POLICY "Allow service role full access to challenges"
ON webauthn_challenges FOR ALL
USING (true) -- Or check for specific role: (auth.role() = 'service_role')
WITH CHECK (true);

-- Policy: Allow users to insert challenges for themselves.
-- This is necessary if the challenge generation is initiated by a request using the user's JWT.
CREATE POLICY "Users can create their own challenges"
ON webauthn_challenges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own challenges (optional, depends on usage patterns).
-- Generally not needed as challenges are short-lived and handled server-side.
-- CREATE POLICY "Users can read their own challenges"
-- ON webauthn_challenges FOR SELECT
-- USING (auth.uid() = user_id);

-- Note: Deletion of challenges is handled by the service_role (function)
-- either after successful use or by a cleanup process for expired challenges.

SELECT 'webauthn_challenges table setup complete.';
