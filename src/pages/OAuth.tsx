
import OAuthCallback from "@/components/OAuthCallback";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OAuth = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <OAuthCallback />
      </div>
      <Footer />
    </div>
  );
};

export default OAuth;
