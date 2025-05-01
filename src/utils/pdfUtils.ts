
import { jsPDF } from "jspdf"; // Updated import syntax
import html2canvas from "html2canvas";

/**
 * Crée un PDF à partir d'un élément HTML
 * @param element L'élément HTML à convertir en PDF
 * @param messageId L'ID du message pour nommer le fichier
 * @param timestamp La date du message pour inclure dans le PDF
 */
export async function createPDF(
  element: HTMLElement, 
  messageId: string, 
  timestamp: Date
): Promise<void> {
  try {
    // Créer une copie de l'élément pour la manipulation
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Ajout d'un en-tête avec logo et date
    const header = document.createElement('div');
    header.style.padding = '20px';
    header.style.marginBottom = '20px';
    header.style.borderBottom = '1px solid #e2e8f0';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    
    // Logo et titre
    const logoTitle = document.createElement('div');
    logoTitle.style.fontSize = '24px';
    logoTitle.style.fontWeight = 'bold';
    logoTitle.innerHTML = 'LuvviX AI';
    
    // Date de génération
    const dateInfo = document.createElement('div');
    dateInfo.style.fontSize = '12px';
    dateInfo.style.color = '#64748b';
    dateInfo.innerHTML = `Généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}<br>Message original du ${timestamp.toLocaleDateString()} à ${timestamp.toLocaleTimeString()}`;
    
    header.appendChild(logoTitle);
    header.appendChild(dateInfo);
    
    // Créer un pied de page
    const footer = document.createElement('div');
    footer.style.padding = '20px';
    footer.style.marginTop = '20px';
    footer.style.borderTop = '1px solid #e2e8f0';
    footer.style.fontSize = '12px';
    footer.style.color = '#64748b';
    footer.style.textAlign = 'center';
    footer.innerHTML = 'Document généré par LuvviX AI - www.luvvix.com';
    
    // Créer un conteneur pour tout
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.backgroundColor = '#ffffff';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';
    container.style.fontFamily = 'Arial, sans-serif';
    
    container.appendChild(header);
    
    // Ajouter le contenu cloné
    const content = document.createElement('div');
    content.style.padding = '20px';
    content.appendChild(clonedElement);
    container.appendChild(content);
    
    container.appendChild(footer);
    
    // Ajouter temporairement au document pour le rendu
    document.body.appendChild(container);
    
    // Convertir en canvas
    const canvas = await html2canvas(container, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Supprimer l'élément temporaire
    document.body.removeChild(container);
    
    // Créer le PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
    
    // Télécharger le PDF
    pdf.save(`LuvviX_AI_Response_${messageId.substring(0, 8)}.pdf`);
    
    console.log("PDF généré avec succès!");
    
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
  }
}
