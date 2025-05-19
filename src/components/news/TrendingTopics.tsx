
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const trendingTopics = [
  { id: 1, name: 'Intelligence Artificielle', count: 128 },
  { id: 2, name: 'Blockchain', count: 92 },
  { id: 3, name: 'Changement Climatique', count: 87 },
  { id: 4, name: 'Spatial', count: 76 },
  { id: 5, name: 'Cybersécurité', count: 65 },
];

const TrendingTopics: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sujets tendances</CardTitle>
        <CardDescription>Les sujets les plus discutés aujourd'hui</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trendingTopics.map((topic) => (
            <div key={topic.id} className="flex justify-between items-center">
              <span className="font-medium">{topic.name}</span>
              <Badge variant="secondary">{topic.count} articles</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingTopics;
