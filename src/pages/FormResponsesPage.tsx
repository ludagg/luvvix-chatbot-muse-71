
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormResponsesView from "@/components/forms/FormResponsesView";

const FormResponsesPage = () => {
  const { formId } = useParams();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <FormResponsesView formId={formId} />
      </main>
      <Footer />
    </div>
  );
};

export default FormResponsesPage;
