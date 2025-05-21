
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LuvvixAI = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow">
        <iframe
          src="/luvvix-ai"
          className="w-full h-full min-h-[calc(100vh-64px-64px)]" // 64px for navbar & footer
          style={{ border: "none" }}
          title="Luvvix AI Studio"
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default LuvvixAI;
