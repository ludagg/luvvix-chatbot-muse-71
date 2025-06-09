
import OAuthHandler from "@/components/OAuthHandler";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OAuth = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-10 flex items-center justify-center">
        <OAuthHandler />
      </div>
      <Footer />
    </div>
  );
};

export default OAuth;
