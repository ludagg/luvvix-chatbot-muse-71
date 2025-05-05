
import * as math from 'mathjs';

/**
 * Évalue une fonction mathématique pour une plage de valeurs x donnée
 * @param expression Expression mathématique (ex: "x^2 + 2*x - 1")
 * @param xMin Valeur minimale de x
 * @param xMax Valeur maximale de x
 * @param points Nombre de points à calculer
 * @returns Tableau de coordonnées {x, y}
 */
export function evaluateFunction(
  expression: string, 
  xMin: number = -10, 
  xMax: number = 10, 
  points: number = 100
): Array<{x: number, y: number}> {
  try {
    // Compiler l'expression pour de meilleures performances
    const compiledExpression = math.compile(expression);
    
    const result: Array<{x: number, y: number}> = [];
    const step = (xMax - xMin) / (points - 1);
    
    for (let i = 0; i < points; i++) {
      const x = xMin + step * i;
      try {
        const y = compiledExpression.evaluate({ x });
        
        // Vérifier que y est un nombre valide
        if (!isNaN(y) && isFinite(y)) {
          result.push({ x, y });
        }
      } catch (error) {
        console.warn(`Erreur d'évaluation pour x=${x}:`, error);
      }
    }
    
    return result;
  } catch (error) {
    console.error("Erreur lors de l'analyse de l'expression:", error);
    return [];
  }
}

/**
 * Génère des données pour un graphique à barres simple
 * @param labels Étiquettes pour chaque barre
 * @param values Valeurs pour chaque barre
 * @returns Données formatées pour un graphique à barres
 */
export function generateBarChartData(
  labels: string[], 
  values: number[]
): Array<{name: string, value: number}> {
  if (labels.length !== values.length) {
    throw new Error("Les tableaux d'étiquettes et de valeurs doivent avoir la même longueur");
  }
  
  return labels.map((label, index) => ({
    name: label,
    value: values[index]
  }));
}

/**
 * Génère des données pour un graphique en camembert
 * @param labels Étiquettes pour chaque segment
 * @param values Valeurs pour chaque segment
 * @returns Données formatées pour un graphique en camembert
 */
export function generatePieChartData(
  labels: string[], 
  values: number[]
): Array<{name: string, value: number}> {
  return generateBarChartData(labels, values);
}

/**
 * Génère des données pour un nuage de points
 * @param points Tableau de coordonnées {x, y}
 * @returns Données formatées pour un nuage de points
 */
export function generateScatterData(
  points: Array<{x: number, y: number}>
): Array<{x: number, y: number}> {
  return points;
}

/**
 * Analyse une chaîne de texte pour déterminer le type de graphique et les paramètres
 * @param input Texte d'entrée
 * @returns Informations sur le graphique à générer
 */
export function parseGraphRequest(input: string): {
  type: 'function' | 'bar' | 'pie' | 'line' | 'scatter' | null;
  params: any;
} {
  input = input.toLowerCase();
  
  // Détecter une demande de tracé de fonction
  const functionMatch = input.match(/trac(?:er|é)?\s+(?:la\s+)?(?:courbe|fonction|graphe|graphique)?\s*(?:de|d'|du)?\s*[f\(]?\s*(?:x\s*)?[=:]?\s*([^,;.]+)/i);
  if (functionMatch) {
    return {
      type: 'function',
      params: {
        expression: functionMatch[1].trim(),
        xMin: -10,
        xMax: 10
      }
    };
  }
  
  // Détecter une demande de diagramme à barres
  if (input.includes('diagramme à barre') || input.includes('graphique à barre') || 
      input.includes('histogramme') || input.includes('barchart')) {
    return {
      type: 'bar',
      params: {
        demo: true
      }
    };
  }
  
  // Détecter une demande de diagramme en camembert
  if (input.includes('camembert') || input.includes('diagramme circulaire') || 
      input.includes('pie chart') || input.includes('piechart')) {
    return {
      type: 'pie',
      params: {
        demo: true
      }
    };
  }
  
  // Détecter une demande de courbe
  if (input.includes('courbe') || input.includes('linechart') || 
      input.includes('line chart') || input.includes('graphique linéaire')) {
    return {
      type: 'line',
      params: {
        demo: true
      }
    };
  }
  
  // Détecter une demande de nuage de points
  if (input.includes('nuage de points') || input.includes('scatter') || 
      input.includes('points') || input.includes('dispersion')) {
    return {
      type: 'scatter',
      params: {
        demo: true
      }
    };
  }
  
  return {
    type: null,
    params: {}
  };
}
