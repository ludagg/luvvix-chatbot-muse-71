
import { jsPDF } from "jspdf"; // Utiliser l'import avec accolades
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

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
    throw error; // Remonter l'erreur pour la gestion dans les composants
  }
}

/**
 * Crée un document Word à partir d'un élément HTML
 * @param element L'élément HTML à convertir en Word
 * @param messageId L'ID du message pour nommer le fichier
 * @param timestamp La date du message pour inclure dans le document
 */
export async function createWordDoc(
  element: HTMLElement,
  messageId: string,
  timestamp: Date
): Promise<void> {
  try {
    // Extraire le texte et la structure de l'élément HTML
    const textContent = extractStructuredContent(element);
    
    // Créer un nouveau document Word
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // En-tête
          new Paragraph({
            text: "LuvviX AI",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          
          // Information de date
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`,
                size: 18,
                color: "808080",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Message original du ${timestamp.toLocaleDateString()} à ${timestamp.toLocaleTimeString()}`,
                size: 18,
                color: "808080",
              }),
            ],
          }),
          
          new Paragraph({ text: "" }), // Ligne vide pour espacement
          
          // Contenu principal
          ...textContent,
          
          new Paragraph({ text: "" }), // Ligne vide pour espacement
          
          // Pied de page
          new Paragraph({
            text: "Document généré par LuvviX AI - www.luvvix.com",
            alignment: AlignmentType.CENTER,
            thematicBreak: true, // Ajoute une ligne horizontale au-dessus
          }),
        ],
      }],
    });
    
    // Générer le document et le sauvegarder
    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `LuvviX_AI_Response_${messageId.substring(0, 8)}.docx`);
    
    console.log("Document Word généré avec succès!");
    
  } catch (error) {
    console.error("Erreur lors de la génération du document Word:", error);
    throw error;
  }
}

/**
 * Extrait le contenu structuré d'un élément HTML
 * @param element L'élément HTML dont on extrait le contenu
 * @returns Tableau de paragraphes et tables pour le document Word
 */
function extractStructuredContent(element: HTMLElement): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [];
  
  // Récupérer tous les nœuds enfants
  const childNodes = Array.from(element.childNodes);
  
  childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      // Texte simple
      result.push(
        new Paragraph({
          text: node.textContent.trim(),
        })
      );
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as HTMLElement;
      
      // Traiter différents types d'éléments
      if (elem.nodeName === 'P') {
        result.push(
          new Paragraph({
            text: elem.textContent || '',
          })
        );
      } else if (elem.nodeName === 'H1') {
        result.push(
          new Paragraph({
            text: elem.textContent || '',
            heading: HeadingLevel.HEADING_1,
          })
        );
      } else if (elem.nodeName === 'H2') {
        result.push(
          new Paragraph({
            text: elem.textContent || '',
            heading: HeadingLevel.HEADING_2,
          })
        );
      } else if (elem.nodeName === 'H3') {
        result.push(
          new Paragraph({
            text: elem.textContent || '',
            heading: HeadingLevel.HEADING_3,
          })
        );
      } else if (elem.nodeName === 'UL' || elem.nodeName === 'OL') {
        // Traiter les listes
        const listItems = Array.from(elem.children);
        listItems.forEach((item, index) => {
          result.push(
            new Paragraph({
              text: `${elem.nodeName === 'OL' ? (index + 1) + '.' : '•'} ${item.textContent || ''}`,
              indent: { left: 720 }, // Indentation pour les listes (720 = 0.5 pouce)
            })
          );
        });
      } else if (elem.nodeName === 'TABLE') {
        // Traiter les tableaux
        try {
          const table = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: extractTableRows(elem as HTMLTableElement),
          });
          result.push(table);
        } catch (e) {
          console.error("Erreur lors de l'extraction du tableau:", e);
          // Fallback - ajouter un texte simple à la place
          result.push(new Paragraph({ text: elem.textContent || '' }));
        }
      } else if (elem.nodeName === 'PRE' || elem.nodeName === 'CODE') {
        // Traiter le code
        result.push(
          new Paragraph({
            text: elem.textContent || '',
            spacing: { before: 200, after: 200 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          })
        );
      } else if (elem.children.length > 0) {
        // Traiter les éléments composés récursivement
        result.push(...extractStructuredContent(elem));
      } else if (elem.textContent?.trim()) {
        // Autres éléments avec du texte
        result.push(
          new Paragraph({
            text: elem.textContent.trim(),
          })
        );
      }
    }
  });
  
  return result;
}

/**
 * Extrait les lignes d'un tableau HTML
 * @param tableElement L'élément table HTML
 * @returns Tableau de lignes pour le document Word
 */
function extractTableRows(tableElement: HTMLTableElement): TableRow[] {
  const rows: TableRow[] = [];
  
  // Traiter l'en-tête du tableau si présent
  if (tableElement.tHead) {
    const headerRow = new TableRow({
      tableHeader: true,
      children: Array.from(tableElement.tHead.rows[0]?.cells || []).map(
        cell => new TableCell({
          children: [new Paragraph({ text: cell.textContent || '' })],
          shading: { color: "EEEEEE" },
        })
      ),
    });
    rows.push(headerRow);
  }
  
  // Traiter le corps du tableau
  if (tableElement.tBodies.length > 0) {
    for (const row of Array.from(tableElement.tBodies[0].rows)) {
      const tableRow = new TableRow({
        children: Array.from(row.cells).map(
          cell => new TableCell({
            children: [new Paragraph({ text: cell.textContent || '' })],
          })
        ),
      });
      rows.push(tableRow);
    }
  }
  
  return rows;
}
