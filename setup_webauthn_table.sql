-- Create the user_webauthn_credentials table
CREATE TABLE user_webauthn_credentials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key BYTEA NOT NULL,
    sign_count BIGINT NOT NULL DEFAULT 0,
    transports TEXT[],
    friendly_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ
);

-- Add comments to the columns
COMMENT ON COLUMN user_webauthn_credentials.id IS 'Unique identifier for the credential';
COMMENT ON COLUMN user_webauthn_credentials.user_id IS 'Identifier of the user associated with this credential';
COMMENT ON COLUMN user_webauthn_credentials.credential_id IS 'The globally unique ID of the authenticator';
COMMENT ON COLUMN user_webauthn_credentials.public_key IS 'The public key of the authenticator';
COMMENT ON COLUMN user_webauthn_credentials.sign_count IS 'The number of times this authenticator has been used';
COMMENT ON COLUMN user_webauthn_credentials.transports IS 'How the authenticator can be connected to (e.g., usb, nfc, ble)';
COMMENT ON COLUMN user_webauthn_credentials.friendly_name IS 'A user-friendly name for the authenticator (e.g., "My Yubikey")';
COMMENT ON COLUMN user_webauthn_credentials.created_at IS 'Timestamp of when the credential was created';
COMMENT ON COLUMN user_webauthn_credentials.last_used_at IS 'Timestamp of when the credential was last used';

-- Create indexes for faster lookups
CREATE INDEX idx_user_webauthn_credentials_credential_id ON user_webauthn_credentials(credential_id);
CREATE INDEX idx_user_webauthn_credentials_user_id ON user_webauthn_credentials(user_id);

-- Enable Row Level Security
ALTER TABLE user_webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can view their own credentials
CREATE POLICY "Allow users to view their own credentials"
ON user_webauthn_credentials
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own credentials
CREATE POLICY "Allow users to insert their own credentials"
ON user_webauthn_credentials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own credentials
CREATE POLICY "Allow users to update their own credentials"
ON user_webauthn_credentials
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own credentials
CREATE POLICY "Allow users to delete their own credentials"
ON user_webauthn_credentials
FOR DELETE
USING (auth.uid() = user_id);

-- Grant usage on the schema to the authenticated role if not already granted
-- This might be needed if the table is in a schema other than 'public' and 'auth'
-- For example, if the table is in a 'public' schema and accessed by 'authenticated' role:
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT ALL ON TABLE user_webauthn_credentials TO authenticated;

-- Note: The supabase_auth_admin role (service_role) bypasses RLS.
-- Ensure your application uses user-specific roles (e.g., anon, authenticated) for API access.

SELECT 'WebAuthn table setup complete.';
