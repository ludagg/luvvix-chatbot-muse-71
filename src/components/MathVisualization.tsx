
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FunctionSquare as FunctionIcon, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  ScatterChart as ScatterChartIcon,
} from "lucide-react";
import {
  evaluateFunction,
  generateBarChartData,
  generatePieChartData,
  generateScatterData,
} from "@/utils/mathUtils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#D53E4F", "#66C2A5"];

interface MathVisualizationProps {
  initialExpression?: string;
  initialType?: "function" | "bar" | "pie" | "line" | "scatter";
  initialParams?: any;
}

export const MathVisualization: React.FC<MathVisualizationProps> = ({
  initialExpression = "x^2",
  initialType = "function",
  initialParams = {},
}) => {
  const [activeTab, setActiveTab] = useState(initialType);
  const [expression, setExpression] = useState(initialExpression);
  const [xMin, setXMin] = useState(initialParams.xMin || -10);
  const [xMax, setXMax] = useState(initialParams.xMax || 10);
  const [points, setPoints] = useState(100);
  const [data, setData] = useState<Array<any>>([]);
  const [barData, setBarData] = useState<Array<any>>([
    { name: "Groupe A", value: 400 },
    { name: "Groupe B", value: 300 },
    { name: "Groupe C", value: 300 },
    { name: "Groupe D", value: 200 },
  ]);
  const [pieData, setPieData] = useState<Array<any>>([
    { name: "Groupe A", value: 400 },
    { name: "Groupe B", value: 300 },
    { name: "Groupe C", value: 300 },
    { name: "Groupe D", value: 200 },
  ]);
  const [lineData, setLineData] = useState<Array<any>>([
    { name: "Jan", value: 400 },
    { name: "Fév", value: 300 },
    { name: "Mar", value: 600 },
    { name: "Avr", value: 800 },
    { name: "Mai", value: 500 },
    { name: "Juin", value: 900 },
  ]);
  const [scatterData, setScatterData] = useState<Array<any>>([
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 },
  ]);

  const updateFunctionData = () => {
    try {
      const newData = evaluateFunction(expression, xMin, xMax, points);
      setData(newData);
    } catch (error) {
      console.error("Erreur lors de l'évaluation de la fonction:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "function") {
      updateFunctionData();
    }
  }, [expression, xMin, xMax, points, activeTab]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Visualisation mathématique</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="function" className="flex items-center gap-2">
              <FunctionIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Fonction</span>
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex items-center gap-2">
              <BarChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Barres</span>
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Camembert</span>
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-2">
              <LineChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Courbe</span>
            </TabsTrigger>
            <TabsTrigger value="scatter" className="flex items-center gap-2">
              <ScatterChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Points</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="function" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Input
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="ex: x^2 + 2*x - 1"
                  className="flex-1"
                />
                <Button onClick={updateFunctionData}>Tracer</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">X min: {xMin}</span>
                  <Slider
                    value={[xMin]}
                    min={-50}
                    max={50}
                    step={1}
                    onValueChange={(values) => setXMin(values[0])}
                    className="mt-1"
                  />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">X max: {xMax}</span>
                  <Slider
                    value={[xMax]}
                    min={-50}
                    max={50}
                    step={1}
                    onValueChange={(values) => setXMax(values[0])}
                    className="mt-1"
                  />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Points: {points}</span>
                  <Slider
                    value={[points]}
                    min={10}
                    max={500}
                    step={10}
                    onValueChange={(values) => setPoints(values[0])}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ChartContainer
                config={{
                  function: {
                    label: "Fonction",
                    theme: {
                      light: "#0088FE",
                      dark: "#0088FE",
                    },
                  },
                }}
              >
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    label={{ value: "x", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    dataKey="y"
                    type="number"
                    domain={["auto", "auto"]}
                    label={{ value: "f(x)", angle: -90, position: "insideLeft" }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => `x: ${value}`}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke="var(--color-function)"
                    dot={false}
                    activeDot={{ r: 6 }}
                    name="f(x)"
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="bar" className="space-y-4 mt-4">
            <div className="h-80 w-full">
              <ChartContainer
                config={barData.reduce((acc, item, index) => {
                  acc[item.name] = {
                    label: item.name,
                    theme: {
                      light: COLORS[index % COLORS.length],
                      dark: COLORS[index % COLORS.length],
                    },
                  };
                  return acc;
                }, {})}
              >
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent labelFormatter={(value) => value} />
                    }
                  />
                  <Legend />
                  {barData.map((entry, index) => (
                    <Bar
                      key={`bar-${index}`}
                      dataKey="value"
                      fill={`var(--color-${entry.name})`}
                      name={entry.name}
                    />
                  ))}
                </BarChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="pie" className="space-y-4 mt-4">
            <div className="h-80 w-full">
              <ChartContainer config={{}}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => entry.name}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent labelFormatter={(value) => value} />
                    }
                  />
                </PieChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="line" className="space-y-4 mt-4">
            <div className="h-80 w-full">
              <ChartContainer
                config={{
                  line: {
                    label: "Valeur",
                    theme: {
                      light: "#0088FE",
                      dark: "#0088FE",
                    },
                  },
                }}
              >
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent labelFormatter={(value) => value} />
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-line)"
                    activeDot={{ r: 8 }}
                    name="Valeur"
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="scatter" className="space-y-4 mt-4">
            <div className="h-80 w-full">
              <ChartContainer
                config={{
                  scatter: {
                    label: "Points",
                    theme: {
                      light: "#0088FE",
                      dark: "#0088FE",
                    },
                  },
                }}
              >
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    name="x"
                    domain={["auto", "auto"]}
                  />
                  <YAxis
                    dataKey="y"
                    type="number"
                    name="y"
                    domain={["auto", "auto"]}
                  />
                  <ChartTooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => `Point`}
                      />
                    }
                  />
                  <Scatter
                    name="Points"
                    data={scatterData}
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
