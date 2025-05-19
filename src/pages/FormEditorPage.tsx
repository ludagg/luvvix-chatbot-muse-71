
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormEditor from "@/components/forms/FormEditor";

const FormEditorPage = () => {
  const { formId } = useParams();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* Ajout d'un div spacer pour compenser la hauteur de la navbar fixed */}
      <div className="pt-20"></div>
      <main className="flex-grow">
        <FormEditor formId={formId} />
      </main>
      <Footer />
    </div>
  );
};

export default FormEditorPage;
