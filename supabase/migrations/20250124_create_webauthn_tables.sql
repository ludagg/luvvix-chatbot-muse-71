
-- Create webauthn_challenges table
CREATE TABLE IF NOT EXISTS webauthn_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_webauthn_credentials table
CREATE TABLE IF NOT EXISTS user_webauthn_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key BYTEA NOT NULL,
    sign_count BIGINT NOT NULL DEFAULT 0,
    transports TEXT[] DEFAULT '{}',
    friendly_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user_id ON webauthn_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_challenge ON webauthn_challenges(challenge);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_expires_at ON webauthn_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_webauthn_credentials_user_id ON user_webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_webauthn_credentials_credential_id ON user_webauthn_credentials(credential_id);

-- Enable RLS (Row Level Security)
ALTER TABLE webauthn_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for webauthn_challenges
CREATE POLICY "Users can access their own challenges" ON webauthn_challenges
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for user_webauthn_credentials
CREATE POLICY "Users can access their own credentials" ON user_webauthn_credentials
    FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON webauthn_challenges TO authenticated;
GRANT ALL ON user_webauthn_credentials TO authenticated;
GRANT ALL ON webauthn_challenges TO service_role;
GRANT ALL ON user_webauthn_credentials TO service_role;
