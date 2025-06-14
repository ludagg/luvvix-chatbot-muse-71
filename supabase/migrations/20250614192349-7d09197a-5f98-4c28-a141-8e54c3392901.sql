
-- Create a new ENUM type for friendship status
CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');

-- Create the center_friendships table
CREATE TABLE public.center_friendships (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    addressee_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status public.friendship_status NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
);

-- Add comments to the table and columns
COMMENT ON TABLE public.center_friendships IS 'Stores friendship requests and statuses between users.';
COMMENT ON COLUMN public.center_friendships.requester_id IS 'The user who sent the friend request.';
COMMENT ON COLUMN public.center_friendships.addressee_id IS 'The user who received the friend request.';
COMMENT ON COLUMN public.center_friendships.status IS 'The current status of the friendship (pending, accepted, etc.).';

-- Enable Row Level Security
ALTER TABLE public.center_friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own friendships"
ON public.center_friendships FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can insert their own friendship requests"
ON public.center_friendships FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own friendship status"
ON public.center_friendships FOR UPDATE
USING (auth.uid() = addressee_id)
WITH CHECK (auth.uid() = addressee_id);

CREATE POLICY "Users can cancel their sent requests or remove friends"
ON public.center_friendships FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Trigger to update the 'updated_at' timestamp on update
CREATE TRIGGER set_center_friendships_updated_at
BEFORE UPDATE ON public.center_friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
