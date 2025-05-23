
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormSettings from "@/components/forms/FormSettings";

const FormSettingsPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = `Form Settings | LuvviX ID`;
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="pt-24"></div> {/* Adding more padding to account for the fixed navbar */}
      <main className="flex-grow">
        <FormSettings formId={formId} />
      </main>
      <Footer />
    </div>
  );
};

export default FormSettingsPage;
