import React, { useState, useEffect, useMemo } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, PieChart, Pie, 
  ScatterChart, Scatter, Cell, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { evaluate } from "mathjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FunctionSquare, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon
} from "lucide-react";

// Types pour les différents types de graphiques
type FunctionPlotConfig = {
  expression: string;
  range: [number, number];
  steps?: number;
  color?: string;
  label?: string;
};

type DataVisualizationConfig = {
  type: 'bar' | 'pie' | 'line' | 'scatter' | 'area';
  data: Record<string, any>[];
  xKey: string;
  yKey: string | string[];
  title?: string;
  description?: string;
  colors?: string[];
};

export type VisualizationConfig = {
  type: 'function' | 'data';
  config: FunctionPlotConfig | DataVisualizationConfig;
};

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", 
  "#8884d8", "#82ca9d", "#ffc658", "#FF5733", 
  "#C70039", "#900C3F", "#581845", "#2E4053"
];

// Fonction pour évaluer les expressions mathématiques
const evaluateExpression = (expression: string, x: number): number => {
  try {
    // Remplacer x dans l'expression
    return evaluate(expression, { x });
  } catch (error) {
    console.error("Error evaluating expression:", error);
    return NaN;
  }
};

// Composant pour tracer des fonctions mathématiques
const FunctionPlot = ({ config }: { config: FunctionPlotConfig }) => {
  const { expression, range, steps = 100, color = "#0088FE", label = "f(x)" } = config;
  
  const data = useMemo(() => {
    const [min, max] = range;
    const step = (max - min) / steps;
    
    return Array(steps + 1).fill(0).map((_, i) => {
      const x = min + i * step;
      try {
        const y = evaluateExpression(expression, x);
        return { x, y: isFinite(y) ? y : null };
      } catch (e) {
        return { x, y: null };
      }
    }).filter(point => point.y !== null);
  }, [expression, range, steps]);

  if (data.length === 0) {
    return <div className="text-center p-4 text-red-500">Impossible de tracer cette fonction avec la plage fournie.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x" 
          type="number" 
          label={{ value: 'x', position: 'insideBottomRight', offset: -5 }}
          domain={['dataMin', 'dataMax']}
        />
        <YAxis 
          label={{ value: 'y', angle: -90, position: 'insideLeft' }}
          domain={['auto', 'auto']}
        />
        <Tooltip 
          formatter={(value: any) => [parseFloat(value).toFixed(4), 'f(x)']}
          labelFormatter={(label) => `x = ${parseFloat(label).toFixed(4)}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="y" 
          name={label}
          stroke={color} 
          dot={false}
          activeDot={{ r: 5 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Composant pour les visualisations de données
const DataVisualization = ({ config }: { config: DataVisualizationConfig }) => {
  const { type, data, xKey, yKey, title, description, colors = COLORS } = config;

  // Si yKey est un tableau, on l'utilise, sinon on le transforme en tableau
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yKeys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={colors[index % colors.length]} 
                  name={key}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        const dataKey = yKeys[0]; // Pour les graphiques circulaires, on n'utilise qu'un seul y
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={xKey}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, yKeys[0]]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yKeys.map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={colors[index % colors.length]} 
                  activeDot={{ r: 8 }}
                  name={key}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey={xKey} name={xKey} />
              <YAxis type="number" dataKey={yKeys[0]} name={yKeys[0]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter 
                name={yKeys[0]} 
                data={data} 
                fill={colors[0]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yKeys.map((key, index) => (
                <Area 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stackId="1"
                  stroke={colors[index % colors.length]} 
                  fill={colors[index % colors.length]} 
                  name={key}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Type de graphique non pris en charge</div>;
    }
  };

  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export const MathVisualization = ({ config }: { config: VisualizationConfig }) => {
  if (config.type === 'function') {
    return <FunctionPlot config={config.config as FunctionPlotConfig} />;
  } else {
    return <DataVisualization config={config.config as DataVisualizationConfig} />;
  }
};

// Exemples de configurations pour montrer comment utiliser ce composant
export const visualizationExamples = {
  functionPlot: {
    type: 'function',
    config: {
      expression: 'sin(x)',
      range: [-Math.PI * 2, Math.PI * 2],
      steps: 100,
      color: "#0088FE",
      label: "sin(x)"
    }
  } as VisualizationConfig,
  
  barChart: {
    type: 'data',
    config: {
      type: 'bar',
      title: "Ventes par mois",
      description: "Comparaison des ventes sur l'année précédente",
      data: [
        { month: 'Jan', ventes2022: 4000, ventes2023: 2400 },
        { month: 'Fév', ventes2022: 3000, ventes2023: 1398 },
        { month: 'Mar', ventes2022: 2000, ventes2023: 9800 },
        { month: 'Avr', ventes2022: 2780, ventes2023: 3908 },
        { month: 'Mai', ventes2022: 1890, ventes2023: 4800 },
        { month: 'Juin', ventes2022: 2390, ventes2023: 3800 }
      ],
      xKey: 'month',
      yKey: ['ventes2022', 'ventes2023']
    }
  } as VisualizationConfig,
  
  pieChart: {
    type: 'data',
    config: {
      type: 'pie',
      title: "Répartition des revenues",
      data: [
        { name: 'Produit A', value: 400 },
        { name: 'Produit B', value: 300 },
        { name: 'Produit C', value: 300 },
        { name: 'Produit D', value: 200 }
      ],
      xKey: 'name',
      yKey: 'value'
    }
  } as VisualizationConfig
};

// Composant pour démonstrer différents types de visualisations
export const VisualizationDemo = () => {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold">Visualisations Mathématiques et Données</h1>
      <Separator />
      
      <Tabs defaultValue="function" className="w-full">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="function" className="flex items-center gap-2">
            <FunctionSquare /> Fonctions
          </TabsTrigger>
          <TabsTrigger value="bar" className="flex items-center gap-2">
            <BarChartIcon /> Histogrammes
          </TabsTrigger>
          <TabsTrigger value="pie" className="flex items-center gap-2">
            <PieChartIcon /> Secteurs
          </TabsTrigger>
          <TabsTrigger value="line" className="flex items-center gap-2">
            <LineChartIcon /> Linéaires
          </TabsTrigger>
          <TabsTrigger value="scatter" className="flex items-center gap-2">
            <ScatterChart /> Nuage de points
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="function" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tracer des fonctions mathématiques</CardTitle>
              <CardDescription>
                Visualisez des fonctions mathématiques comme sin(x), cos(x), x², etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MathVisualization config={visualizationExamples.functionPlot} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bar" className="mt-4">
          <MathVisualization config={visualizationExamples.barChart} />
        </TabsContent>
        
        <TabsContent value="pie" className="mt-4">
          <MathVisualization config={visualizationExamples.pieChart} />
        </TabsContent>
        
        <TabsContent value="line" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Graphique Linéaire</CardTitle>
              <CardDescription>
                Visualisez l'évolution de données au fil du temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MathVisualization 
                config={{
                  type: 'data',
                  config: {
                    type: 'line',
                    title: "Évolution des températures",
                    data: [
                      { mois: 'Jan', Paris: 5, Lyon: 4, Marseille: 9 },
                      { mois: 'Fév', Paris: 7, Lyon: 6, Marseille: 10 },
                      { mois: 'Mar', Paris: 10, Lyon: 9, Marseille: 13 },
                      { mois: 'Avr', Paris: 14, Lyon: 13, Marseille: 16 },
                      { mois: 'Mai', Paris: 18, Lyon: 18, Marseille: 21 },
                      { mois: 'Juin', Paris: 21, Lyon: 22, Marseille: 25 }
                    ],
                    xKey: 'mois',
                    yKey: ['Paris', 'Lyon', 'Marseille']
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scatter" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Nuage de Points</CardTitle>
              <CardDescription>
                Visualisez la corrélation entre deux variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MathVisualization 
                config={{
                  type: 'data',
                  config: {
                    type: 'scatter',
                    title: "Corrélation Taille/Poids",
                    data: [
                      { taille: 160, poids: 65 },
                      { taille: 170, poids: 72 },
                      { taille: 180, poids: 78 },
                      { taille: 175, poids: 76 },
                      { taille: 165, poids: 68 },
                      { taille: 155, poids: 60 },
                      { taille: 182, poids: 85 },
                      { taille: 172, poids: 70 }
                    ],
                    xKey: 'taille',
                    yKey: ['poids']
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
