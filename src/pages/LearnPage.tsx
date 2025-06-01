
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LearnPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers la nouvelle page LuvviX Learn
    navigate('/luvvix-learn', { replace: true });
  }, [navigate]);

  return null;
};

export default LearnPage;
