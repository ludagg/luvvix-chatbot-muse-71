
import { VisualizationConfig } from "@/components/MathVisualization";
import { evaluate } from "mathjs";

interface ParsedFunction {
  expression: string;
  range: [number, number];
  label?: string;
  color?: string;
}

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", 
  "#8884d8", "#82ca9d", "#ffc658", "#FF5733"
];

/**
 * Parse a math function request from natural language
 * Examples:
 * - "Trace la fonction f(x) = sin(x) sur [-π, π]"
 * - "Montre-moi le graphe de y = x^2 - 2x + 1 de -10 à 10"
 */
export function parseMathFunctionRequest(text: string): VisualizationConfig | null {
  const functionPatterns = [
    // f(x) = expression sur/de [a, b]
    /(?:tracer?|trac(?:é|e)|montre(?:r|z)?|affiche(?:r|z)?|dessiner?|graphe(?:r|z)?)(?:\s+la\s+)?(?:fonction|courbe|graphe|graphique)?(?:\s+de)?\s+(?:f\(x\)|y)\s*=\s*([^,;\n]+?)(?:\s+(?:sur|pour|de|entre|avec)\s+(?:l'intervalle|x)?\s*(?:∈|dans|compris entre|entre|allant de)?\s*\[?\s*(-?\d*\.?\d*|[-+]?π|[-+]?pi)(?:\s*,\s*|\s+(?:à|et|jusqu'à|jusqu'a)\s+)(-?\d*\.?\d*|[-+]?π|[-+]?pi)\s*\]?)?/i,
    
    // Graphique de expression
    /(?:tracer?|trac(?:é|e)|montre(?:r|z)?|affiche(?:r|z)?|dessiner?|graphe(?:r|z)?)(?:\s+le\s+)?(?:graphique|graphe|courbe)(?:\s+de)?\s+([^,;\n]+?)(?:\s+(?:sur|pour|de|entre|avec)\s+(?:l'intervalle|x)?\s*(?:∈|dans|compris entre|entre|allant de)?\s*\[?\s*(-?\d*\.?\d*|[-+]?π|[-+]?pi)(?:\s*,\s*|\s+(?:à|et|jusqu'à|jusqu'a)\s+)(-?\d*\.?\d*|[-+]?π|[-+]?pi)\s*\]?)?/i
  ];
  
  let matchedFunction: ParsedFunction | null = null;
  
  functionPatterns.forEach(pattern => {
    if (matchedFunction) return;
    
    const match = text.match(pattern);
    if (match) {
      const [_, expressionRaw, minRaw, maxRaw] = match;
      
      // Nettoyer l'expression
      let expression = expressionRaw.trim()
        .replace(/\^/g, '**') // Remplacer ^ par ** pour mathjs
        .replace(/\bx\*\*2\b/g, 'x**2') // Fix pour les puissances
        .replace(/\bsin\b/gi, 'sin')
        .replace(/\bcos\b/gi, 'cos')
        .replace(/\btan\b/gi, 'tan')
        .replace(/\blog\b/gi, 'log')
        .replace(/\bln\b/gi, 'ln')
        .replace(/\bexp\b/gi, 'exp');
      
      // Gestion des valeurs min/max
      let min = -10, max = 10; // Valeurs par défaut
      
      if (minRaw) {
        if (minRaw.includes('π') || minRaw.includes('pi')) {
          min = minRaw.includes('-') 
            ? -Math.PI 
            : (minRaw.includes('+') ? Math.PI : Math.PI);
        } else {
          min = parseFloat(minRaw) || -10;
        }
      }
      
      if (maxRaw) {
        if (maxRaw.includes('π') || maxRaw.includes('pi')) {
          max = maxRaw.includes('-') 
            ? -Math.PI 
            : (maxRaw.includes('+') ? Math.PI : Math.PI);
        } else {
          max = parseFloat(maxRaw) || 10;
        }
      }
      
      matchedFunction = {
        expression,
        range: [min, max],
        label: `f(x) = ${expressionRaw.trim()}`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      };
    }
  });
  
  if (matchedFunction) {
    return {
      type: 'function',
      config: {
        expression: matchedFunction.expression,
        range: matchedFunction.range,
        steps: 200,
        color: matchedFunction.color,
        label: matchedFunction.label
      }
    };
  }
  
  return null;
}

/**
 * Parse a data visualization request from natural language and data
 * Examples:
 * - "Montre un diagramme en barres des ventes mensuelles"
 * - "Crée un camembert de la répartition des dépenses"
 */
export function parseDataVisualizationRequest(
  text: string, 
  data: Record<string, any>[]
): VisualizationConfig | null {
  if (!data || data.length === 0) return null;
  
  // Déterminer le type de graphique demandé
  const barPatterns = [
    /(?:diagramme|graphique|graphe)?\s+(?:en\s+)?(?:barre|colonne)s?/i,
    /histogramme/i,
    /bar\s*chart/i
  ];
  
  const piePatterns = [
    /(?:diagramme|graphique|graphe)?\s+(?:en\s+)?camembert/i,
    /(?:diagramme|graphique|graphe)?\s+(?:en\s+)?secteurs?/i,
    /pie\s*chart/i
  ];
  
  const linePatterns = [
    /(?:diagramme|graphique|graphe|courbe)?\s+(?:en\s+)?ligne/i,
    /(?:évolution|tendance)/i,
    /line\s*chart/i
  ];
  
  const scatterPatterns = [
    /nuage\s+de\s+points/i,
    /scatter\s*plot/i,
    /dispersion/i
  ];
  
  const areaPatterns = [
    /(?:diagramme|graphique|graphe)?\s+(?:en\s+)?aire/i,
    /area\s*chart/i
  ];
  
  let chartType: 'bar' | 'pie' | 'line' | 'scatter' | 'area' | null = null;
  
  for (const pattern of barPatterns) {
    if (pattern.test(text)) {
      chartType = 'bar';
      break;
    }
  }
  
  if (!chartType) {
    for (const pattern of piePatterns) {
      if (pattern.test(text)) {
        chartType = 'pie';
        break;
      }
    }
  }
  
  if (!chartType) {
    for (const pattern of linePatterns) {
      if (pattern.test(text)) {
        chartType = 'line';
        break;
      }
    }
  }
  
  if (!chartType) {
    for (const pattern of scatterPatterns) {
      if (pattern.test(text)) {
        chartType = 'scatter';
        break;
      }
    }
  }
  
  if (!chartType) {
    for (const pattern of areaPatterns) {
      if (pattern.test(text)) {
        chartType = 'area';
        break;
      }
    }
  }
  
  // Si aucun type n'est spécifié, tenter de deviner en fonction des données
  if (!chartType) {
    const firstItem = data[0];
    const keys = Object.keys(firstItem);
    
    if (keys.length === 2) {
      const values = Object.values(firstItem);
      if (typeof values[0] === 'string' && typeof values[1] === 'number') {
        chartType = 'pie'; // Si on a des paires nom/valeur, probablement un camembert
      } else if (typeof values[0] === 'number' && typeof values[1] === 'number') {
        chartType = 'scatter'; // Si deux nombres, probablement un nuage de points
      } else {
        chartType = 'bar'; // Par défaut, faire un histogramme
      }
    } else if (keys.length > 2) {
      // Si on a un champ qui pourrait être une date ou catégorie et plusieurs valeurs,
      // faire un graphique en ligne
      chartType = 'line';
    } else {
      chartType = 'bar'; // Par défaut
    }
  }
  
  // Identifier les colonnes pour les axes X et Y
  const firstItem = data[0];
  const keys = Object.keys(firstItem);
  
  let xKey = '';
  let yKeys: string[] = [];
  
  // Déterminer xKey (généralement un nom, une date ou une catégorie)
  for (const key of keys) {
    const value = firstItem[key];
    if (typeof value === 'string' || key.toLowerCase().includes('date') || key.toLowerCase().includes('mois') || key.toLowerCase().includes('année') || key.toLowerCase().includes('label')) {
      xKey = key;
      break;
    }
  }
  
  if (!xKey && keys.length > 0) {
    xKey = keys[0]; // Prendre la première colonne par défaut
  }
  
  // Déterminer yKeys (valeurs numériques)
  yKeys = keys.filter(key => key !== xKey && typeof firstItem[key] === 'number');
  
  if (yKeys.length === 0) {
    // Si aucune colonne numérique trouvée, prendre toutes les colonnes sauf xKey
    yKeys = keys.filter(key => key !== xKey);
  }
  
  // Extraire un titre potentiel de la demande
  let title = '';
  const titleMatch = text.match(/(?:crée|créer|montre|montrer|affiche|afficher|génère|générer|faire)\s+(?:un|une)?\s+(?:graphique|graphe|diagramme|visualisation|représentation)\s+(?:de|des|du|pour|sur)\s+(?:la|les|le)?\s+([^,.?!]+)/i);
  
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
    // Mettre en majuscule la première lettre
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  
  return {
    type: 'data',
    config: {
      type: chartType,
      title: title || "Visualisation de données",
      description: `Graphique créé à partir de ${data.length} entrées`,
      data,
      xKey,
      yKey: yKeys,
      colors: COLORS.slice(0, yKeys.length)
    }
  };
}

/**
 * Génère des données à partir d'une description textuelle
 * 
 * Exemples:
 * - "Ventes mensuelles: janvier 100, février 150, mars 200"
 * - "Répartition du budget: loyer 30%, nourriture 20%, loisirs 15%, épargne 35%"
 */
export function generateDataFromText(text: string): Record<string, any>[] | null {
  // Pattern pour les données de type série temporelle (mois, trimestre, etc.)
  const timeSeriesPattern = /(?:janvier|jan|fév|février|mar|mars|avr|avril|mai|juin|juil|juillet|août|aout|sep|septembre|oct|octobre|nov|novembre|déc|décembre|q1|q2|q3|q4|t1|t2|t3|t4|semaine \d+|mois \d+|trimestre \d+)\s+\d+[.,]?\d*/gi;
  
  // Pattern pour les données de type catégorie-valeur
  const categoryValuePattern = /([\wéèêëàâäôöùûüçÉÈÊËÀÂÄÔÖÙÛÜÇ\s]+)\s+(\d+[.,]?\d*%?)/gi;
  
  let match;
  let data: Record<string, any>[] = [];
  
  // Détecter le type de données par la présence de mois ou trimestres
  const hasTimeData = /(?:janvier|jan|fév|février|mar|mars|avr|avril|mai|juin|juil|juillet|août|aout|sep|septembre|oct|octobre|nov|novembre|déc|décembre|q1|q2|q3|q4|t1|t2|t3|t4|trimestre)/i.test(text);
  
  if (hasTimeData) {
    // La structure sera {période: valeur}
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const monthsAbr = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
    
    // Préparation des objets pour chaque période
    const timeData: Record<string, number> = {};
    
    while ((match = timeSeriesPattern.exec(text)) !== null) {
      let [fullMatch] = match;
      const periodMatch = fullMatch.match(/(\D+)/);
      const valueMatch = fullMatch.match(/(\d+[.,]?\d*)/);
      
      if (periodMatch && valueMatch) {
        let period = periodMatch[0].trim().toLowerCase();
        const value = parseFloat(valueMatch[0].replace(',', '.'));
        
        // Normaliser le nom du mois
        if (monthsAbr.includes(period) || months.includes(period)) {
          const monthIndex = monthsAbr.includes(period) ? 
            monthsAbr.indexOf(period) : months.indexOf(period);
          period = months[monthIndex];
        }
        
        timeData[period] = value;
      }
    }
    
    // Convertir en tableau d'objets pour recharts
    const entries = Object.entries(timeData);
    
    if (entries.length > 0) {
      // Déterminer le libellé principal
      let mainLabel = "valeur";
      const labelMatch = text.match(/(?:données|statistiques|chiffres|valeurs)\s+(?:de|des|du)\s+(?:la|les|le)?\s+([^,.:;]+)/i);
      if (labelMatch && labelMatch[1]) {
        mainLabel = labelMatch[1].trim().toLowerCase();
      }
      
      // Créer un objet pour chaque période
      entries.forEach(([period, value]) => {
        const dataPoint: Record<string, any> = { 
          periode: period 
        };
        dataPoint[mainLabel] = value;
        data.push(dataPoint);
      });
    }
  } else {
    // Essayer le pattern catégorie-valeur
    let categories: Record<string, number> = {};
    
    while ((match = categoryValuePattern.exec(text)) !== null) {
      if (match.length >= 3) {
        const category = match[1].trim();
        const valueStr = match[2].trim();
        
        let value: number;
        if (valueStr.endsWith('%')) {
          // Convertir pourcentage en valeur décimale
          value = parseFloat(valueStr.replace('%', '').replace(',', '.')) / 100;
        } else {
          value = parseFloat(valueStr.replace(',', '.'));
        }
        
        categories[category] = value;
      }
    }
    
    // Convertir en tableau d'objets pour recharts
    Object.entries(categories).forEach(([category, value]) => {
      data.push({
        name: category,
        value: value
      });
    });
  }
  
  return data.length > 0 ? data : null;
}

/**
 * Fonction principale pour analyser une demande de visualisation
 */
export function parseVisualizationRequest(text: string): VisualizationConfig | null {
  // D'abord essayer de parser comme une fonction mathématique
  const functionConfig = parseMathFunctionRequest(text);
  if (functionConfig) return functionConfig;
  
  // Ensuite essayer de parser comme une demande de visualisation avec données
  const generatedData = generateDataFromText(text);
  if (generatedData) {
    return parseDataVisualizationRequest(text, generatedData);
  }
  
  return null;
}

/**
 * Vérifie si un texte contient une demande de visualisation
 */
export function containsVisualizationRequest(text: string): boolean {
  const visualizationKeywords = [
    /(?:trace|montre|affiche|dessine|génère)(?:r|z)?\s+(?:la\s+)?(?:fonction|courbe|graphe|graphique)/i,
    /(?:fonction|courbe|graphe|graphique)\s+de\s+f\(x\)\s*=\s*/i,
    /(?:fonction|courbe|graphe|graphique)\s+de\s+y\s*=\s*/i,
    /(?:diagramme|graphique|graphe)\s+(?:en\s+)?(?:barre|colonne)s?/i,
    /(?:diagramme|graphique|graphe)\s+(?:en\s+)?camembert/i,
    /(?:diagramme|graphique|graphe)\s+(?:en\s+)?secteurs?/i,
    /(?:diagramme|graphique|graphe|courbe)\s+(?:en\s+)?ligne/i,
    /nuage\s+de\s+points/i,
    /(?:diagramme|graphique|graphe)\s+(?:en\s+)?aire/i,
    /visualise(?:r|z)?\s+les\s+données/i,
    /crée(?:r|z)?\s+un\s+graphique/i,
    /représente(?:r|z)?\s+(?:graphiquement|visuellement)/i
  ];
  
  return visualizationKeywords.some(pattern => pattern.test(text));
}
