
import React, { useMemo } from 'react';
import * as math from 'mathjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Message } from '@/types/message';

interface MathFunctionChartProps {
  params: NonNullable<Message['graphParams']>;
  height?: number;
}

export function MathFunctionChart({ params, height = 400 }: MathFunctionChartProps) {
  const { functions, xRange, yRange, xLabel = 'x', yLabel = 'y', title = 'Fonction Mathématique' } = params;
  
  const chartData = useMemo(() => {
    const [xMin, xMax] = xRange;
    const points = 200; // Nombre de points pour le tracé
    const step = (xMax - xMin) / points;
    
    // Créer un tableau de valeurs x
    const xValues = Array.from({ length: points + 1 }, (_, i) => xMin + i * step);
    
    // Calculer les valeurs y pour chaque fonction
    return xValues.map(x => {
      const point: { x: number, [key: string]: number } = { x };
      
      functions.forEach(({ fn, label }) => {
        try {
          // Utiliser mathjs pour évaluer la fonction en toute sécurité
          const scope = { x };
          const result = math.evaluate(fn, scope);
          
          // Vérifier si le résultat est un nombre valide (pas NaN ou Infinity)
          if (Number.isFinite(result)) {
            point[label] = result;
          }
        } catch (error) {
          // En cas d'erreur d'évaluation, ne pas ajouter de point
          console.error(`Erreur d'évaluation pour ${fn} à x=${x}:`, error);
        }
      });
      
      return point;
    });
  }, [functions, xRange]);

  // Configuration des couleurs pour les fonctions
  const chartConfig = useMemo(() => {
    return Object.fromEntries(
      functions.map(({ label, color }) => [label, { color }])
    );
  }, [functions]);

  return (
    <Card className="border rounded-xl shadow-sm overflow-hidden bg-background">
      <CardHeader className="bg-muted/40 pb-2">
        <CardTitle className="text-lg font-medium text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-0 px-1">
        <ChartContainer 
          config={chartConfig} 
          className="aspect-[16/9] h-full w-full"
        >
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="x" 
              domain={xRange} 
              type="number" 
              tickCount={10} 
              label={{ value: xLabel, position: 'insideBottom', offset: -10 }} 
            />
            <YAxis 
              domain={yRange || ['auto', 'auto']} 
              label={{ value: yLabel, angle: -90, position: 'insideLeft' }} 
            />
            <ReferenceLine x={0} stroke="#888" strokeWidth={1} />
            <ReferenceLine y={0} stroke="#888" strokeWidth={1} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend verticalAlign="top" height={36} />
            
            {functions.map(({ label, color }) => (
              <Line
                key={label}
                type="monotone"
                dataKey={label}
                stroke={color}
                dot={false}
                activeDot={{ r: 8 }}
                strokeWidth={2}
                isAnimationActive={true}
                animationDuration={1000}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
