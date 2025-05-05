import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MathFunctionChart } from '@/components/MathFunctionChart';
import { Trash, Plus, Equal } from 'lucide-react';
import { Message } from '@/types/message';
import { nanoid } from 'nanoid';

const DEFAULT_COLORS = [
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#0EA5E9', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#EC4899', // Pink
];

export function MathFunctionCreator({ onSubmit }: { onSubmit: (message: Message) => void }) {
  const [title, setTitle] = useState('Fonction mathématique');
  const [xLabel, setXLabel] = useState('x');
  const [yLabel, setYLabel] = useState('y');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(undefined);
  const [yMax, setYMax] = useState(undefined);
  const [autoScale, setAutoScale] = useState(true);
  const [functions, setFunctions] = useState([
    { id: nanoid(), fn: 'sin(x)', label: 'sin(x)', color: DEFAULT_COLORS[0] }
  ]);

  const handleAddFunction = () => {
    const newColor = DEFAULT_COLORS[functions.length % DEFAULT_COLORS.length];
    setFunctions([...functions, { 
      id: nanoid(), 
      fn: 'cos(x)', 
      label: `f${functions.length + 1}(x)`, 
      color: newColor 
    }]);
  };

  const handleRemoveFunction = (id: string) => {
    if (functions.length > 1) {
      setFunctions(functions.filter(f => f.id !== id));
    }
  };

  const handleUpdateFunction = (id: string, key: keyof typeof functions[0], value: string) => {
    setFunctions(functions.map(f => 
      f.id === id ? { ...f, [key]: value } : f
    ));
  };

  const handleCreateGraph = () => {
    const graphMessage: Message = {
      id: nanoid(),
      role: 'assistant',
      content: `Voici le graphique des fonctions mathématiques suivantes:\n${functions.map(f => `- ${f.label}: ${f.fn}`).join('\n')}`,
      timestamp: new Date(),
      hasGraph: true,
      graphType: 'function',
      graphParams: {
        functions: functions.map(({ fn, label, color }) => ({ fn, label, color })),
        xRange: [xMin, xMax] as [number, number], // Explicit type assertion
        yRange: autoScale ? undefined : (yMin !== undefined && yMax !== undefined ? [yMin, yMax] as [number, number] : undefined),
        xLabel,
        yLabel,
        title,
      }
    };
    
    onSubmit(graphMessage);
  };

  const exampleFunctions = [
    { text: 'Fonction linéaire', fn: '2*x + 1' },
    { text: 'Fonction quadratique', fn: 'x^2 - 2*x - 3' },
    { text: 'Fonction cubique', fn: 'x^3' },
    { text: 'Sinus', fn: 'sin(x)' },
    { text: 'Cosinus', fn: 'cos(x)' },
    { text: 'Tangente', fn: 'tan(x)' },
    { text: 'Exponentielle', fn: 'exp(x)' },
    { text: 'Logarithme', fn: 'log(x)' },
    { text: 'Valeur absolue', fn: 'abs(x)' },
    { text: 'Racine carrée', fn: 'sqrt(x)' },
  ];

  const functionPreview = {
    functions: functions.map(({ fn, label, color }) => ({ fn, label, color })),
    xRange: [xMin, xMax] as [number, number], // Explicit type assertion
    yRange: autoScale ? undefined : (yMin !== undefined && yMax !== undefined ? [yMin, yMax] as [number, number] : undefined),
    xLabel,
    yLabel,
    title,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Créateur de fonctions mathématiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration du graphique */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre du graphique</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="x-label">Étiquette axe X</Label>
                <Input 
                  id="x-label" 
                  value={xLabel} 
                  onChange={(e) => setXLabel(e.target.value)} 
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="y-label">Étiquette axe Y</Label>
                <Input 
                  id="y-label" 
                  value={yLabel} 
                  onChange={(e) => setYLabel(e.target.value)} 
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Plage axe X</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="x-min" className="text-xs text-muted-foreground">Minimum</Label>
                  <Input 
                    id="x-min" 
                    type="number" 
                    value={xMin} 
                    onChange={(e) => setXMin(Number(e.target.value))} 
                  />
                </div>
                <div>
                  <Label htmlFor="x-max" className="text-xs text-muted-foreground">Maximum</Label>
                  <Input 
                    id="x-max" 
                    type="number" 
                    value={xMax} 
                    onChange={(e) => setXMax(Number(e.target.value))} 
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-scale"
                checked={autoScale}
                onCheckedChange={setAutoScale}
              />
              <Label htmlFor="auto-scale">Échelle Y automatique</Label>
            </div>
            
            {!autoScale && (
              <div className="space-y-2">
                <Label>Plage axe Y</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="y-min" className="text-xs text-muted-foreground">Minimum</Label>
                    <Input 
                      id="y-min" 
                      type="number" 
                      value={yMin ?? ''} 
                      onChange={(e) => setYMin(e.target.value ? Number(e.target.value) : undefined)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="y-max" className="text-xs text-muted-foreground">Maximum</Label>
                    <Input 
                      id="y-max" 
                      type="number" 
                      value={yMax ?? ''} 
                      onChange={(e) => setYMax(e.target.value ? Number(e.target.value) : undefined)} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Liste des fonctions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Fonctions</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddFunction}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>
            
            {functions.map((func, index) => (
              <div key={func.id} className="space-y-3 p-3 border rounded-md bg-muted/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: func.color }}
                    />
                    Fonction {index + 1}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFunction(func.id)}
                    disabled={functions.length <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`function-${func.id}`} className="text-xs text-muted-foreground">Expression</Label>
                    <Input
                      id={`function-${func.id}`}
                      value={func.fn}
                      onChange={(e) => handleUpdateFunction(func.id, 'fn', e.target.value)}
                      placeholder="ex: sin(x)"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`label-${func.id}`} className="text-xs text-muted-foreground">Étiquette</Label>
                    <Input
                      id={`label-${func.id}`}
                      value={func.label}
                      onChange={(e) => handleUpdateFunction(func.id, 'label', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`color-${func.id}`} className="text-xs text-muted-foreground">Couleur</Label>
                    <Input
                      id={`color-${func.id}`}
                      type="color"
                      value={func.color}
                      onChange={(e) => handleUpdateFunction(func.id, 'color', e.target.value)}
                      className="h-9 p-1 cursor-pointer"
                    />
                  </div>
                </div>
                
                {index === 0 && (
                  <div className="mt-2">
                    <Label className="text-xs text-muted-foreground mb-1 block">Fonctions prédéfinies</Label>
                    <div className="flex flex-wrap gap-1">
                      {exampleFunctions.map((example) => (
                        <Button
                          key={example.fn}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleUpdateFunction(func.id, 'fn', example.fn)}
                        >
                          {example.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <div className="w-full">
            <MathFunctionChart params={functionPreview} />
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleCreateGraph}
          >
            Créer le graphique
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
