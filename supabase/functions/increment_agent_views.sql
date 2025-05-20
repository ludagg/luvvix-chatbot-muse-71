
-- Create a stored procedure to increment agent views
CREATE OR REPLACE FUNCTION increment_agent_views(agent_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ai_agents
  SET views = views + 1
  WHERE id = agent_id;
END;
$$;
