
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { FormQuestion, FormSubmission } from "@/services/forms-service";

interface FormResponsesTableProps {
  responses: FormSubmission[];
  questions: FormQuestion[];
  formId: string;
}

const FormResponsesTable = ({ 
  responses, 
  questions, 
  formId 
}: FormResponsesTableProps) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
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
  
  if (!responses.length) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-medium text-gray-700 mb-2">Aucune réponse</h3>
        <p className="text-gray-500">
          Ce formulaire n'a pas encore reçu de réponses.
        </p>
      </Card>
    );
  }
  
  // Paginate responses
  const totalPages = Math.ceil(responses.length / itemsPerPage);
  const paginatedResponses = responses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Toutes les réponses ({responses.length})</h3>
        <Button variant="outline" onClick={exportToCsv}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Email</TableHead>
                {questions.map(question => (
                  <TableHead key={question.id}>{question.question_text}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(response.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{response.responder_email || 'Anonyme'}</TableCell>
                  {questions.map(question => (
                    <TableCell key={question.id}>
                      {Array.isArray(response.answers[question.id])
                        ? response.answers[question.id].join(', ')
                        : response.answers[question.id] || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <div className="flex items-center px-2">
              Page {page} sur {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormResponsesTable;
