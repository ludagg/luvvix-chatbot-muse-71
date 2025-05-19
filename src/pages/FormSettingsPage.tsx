
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormSettings from "@/components/forms/FormSettings";

const FormSettingsPage = () => {
  const { formId } = useParams();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* Ajout d'un div spacer pour compenser la hauteur de la navbar fixed */}
      <div className="pt-20"></div>
      <main className="flex-grow">
        <FormSettings formId={formId} />
      </main>
      <Footer />
    </div>
  );
};

export default FormSettingsPage;
