
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, User, BarChart2, FileBarChart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import formsService, { FormSubmission, FormQuestion } from "@/services/forms-service";
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface FormResponsesStatsProps {
  formId: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

const FormResponsesStats = ({ formId }: FormResponsesStatsProps) => {
  const [activeTab, setActiveTab] = useState("summary");
  
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ["formResponses", formId],
    queryFn: () => formsService.getFormResponses(formId),
    enabled: !!formId,
  });

  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["formQuestions", formId],
    queryFn: () => formsService.getFormQuestions(formId),
    enabled: !!formId,
  });

  // Préparation des données pour les graphiques
  const prepareChartData = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return [];
    
    const answerCounts: Record<string, number> = {};
    
    responses.forEach(response => {
      const answer = response.answers[questionId];
      
      if (Array.isArray(answer)) {
        // Pour les cases à cocher où réponse multiple
        answer.forEach(option => {
          answerCounts[option] = (answerCounts[option] || 0) + 1;
        });
      } else if (answer) {
        // Pour les choix uniques ou texte
        answerCounts[answer] = (answerCounts[answer] || 0) + 1;
      }
    });
    
    return Object.keys(answerCounts).map(key => ({
      name: key,
      value: answerCounts[key]
    }));
  };

  // Export des données en CSV
  const exportToCsv = () => {
    if (!responses.length || !questions.length) return;
    
    const headers = ['Timestamp', 'Email', ...questions.map(q => q.question_text)];
    
    const rows = responses.map(response => {
      const row = [
        new Date(response.submitted_at).toLocaleString(),
        response.responder_email || 'Anonymous'
      ];
      
      questions.forEach(question => {
        const answer = response.answers[question.id];
        if (Array.isArray(answer)) {
          row.push(answer.join(', '));
        } else {
          row.push(answer || '');
        }
      });
      
      return row;
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `form-responses-${formId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoadingResponses || isLoadingQuestions) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!responses.length) {
    return (
      <Card className="p-8 text-center">
        <FileBarChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Aucune réponse</h3>
        <p className="text-gray-500">
          Ce formulaire n'a pas encore reçu de réponses. Partagez-le pour commencer à collecter des données.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Réponses au formulaire</h2>
          <p className="text-gray-500">{responses.length} {responses.length === 1 ? 'réponse' : 'réponses'} collectée{responses.length === 1 ? '' : 's'}</p>
        </div>
        <Button variant="outline" onClick={exportToCsv}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Résumé
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Réponses individuelles
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-8">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Statistiques générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">Total des réponses</p>
                <p className="text-3xl font-bold">{responses.length}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Taux de complétion</p>
                <p className="text-3xl font-bold">100%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Dernière réponse</p>
                <p className="text-lg font-bold">
                  {new Date(responses[0]?.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
          
          {questions.filter(q => q.question_type !== "text").map((question) => {
            const chartData = prepareChartData(question.id);
            if (!chartData.length) return null;
            
            return (
              <Card key={question.id} className="p-6">
                <h3 className="text-lg font-medium mb-4">{question.question_text}</h3>
                
                <div className="h-80">
                  {question.question_type === "multipleChoice" || question.question_type === "dropdown" ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                
                <div className="mt-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2">Option</th>
                        <th className="pb-2">Réponses</th>
                        <th className="pb-2">Pourcentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2">{item.value}</td>
                          <td className="py-2">
                            {((item.value / responses.length) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
          
          {questions.filter(q => q.question_type === "text").map((question) => (
            <Card key={question.id} className="p-6">
              <h3 className="text-lg font-medium mb-4">{question.question_text}</h3>
              <div className="space-y-3">
                {responses
                  .filter(r => r.answers[question.id])
                  .map((response, index) => (
                    <div key={index} className="border-l-4 border-gray-300 pl-4 py-1">
                      <p className="text-gray-800">{response.answers[question.id]}</p>
                      {response.responder_email && (
                        <p className="text-xs text-gray-500 mt-1">{response.responder_email}</p>
                      )}
                    </div>
                ))}
                
                {!responses.filter(r => r.answers[question.id]).length && (
                  <p className="text-gray-500 italic">Aucune réponse textuelle</p>
                )}
              </div>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="individual">
          {responses.map((response, index) => (
            <Card key={index} className="p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">
                    Réponse #{responses.length - index}
                    {response.responder_email && (
                      <span className="text-gray-500 ml-2">({response.responder_email})</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Soumise le {new Date(response.submitted_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mt-4">
                {questions.map((question) => {
                  const answer = response.answers[question.id];
                  
                  if (!answer && answer !== 0) return null;
                  
                  return (
                    <div key={question.id}>
                      <h4 className="text-sm font-medium text-gray-700">{question.question_text}</h4>
                      <div className="mt-1 text-gray-800">
                        {Array.isArray(answer) ? (
                          <ul className="list-disc list-inside">
                            {answer.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{answer}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormResponsesStats;
