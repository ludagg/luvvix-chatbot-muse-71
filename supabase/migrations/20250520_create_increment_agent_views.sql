
-- Create a function to increment agent views
CREATE OR REPLACE FUNCTION increment_agent_views(agent_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.ai_agents
  SET views = views + 1
  WHERE id = agent_id;
END;
$$ LANGUAGE plpgsql;
