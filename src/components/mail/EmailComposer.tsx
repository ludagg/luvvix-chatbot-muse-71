
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  accountId?: string;
  replyTo?: any;
}

const EmailComposer: React.FC<EmailComposerProps> = ({ 
  isOpen, 
  onClose, 
  accountId,
  replyTo 
}) => {
  const [formData, setFormData] = useState({
    to: replyTo ? [replyTo.sender_email] : [],
    cc: [],
    bcc: [],
    subject: replyTo ? `Re: ${replyTo.subject}` : '',
    body: replyTo ? `\n\n--- Message original ---\n${replyTo.body_text}` : ''
  });
  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const addRecipient = (email: string, field: 'to' | 'cc' | 'bcc') => {
    if (email && !formData[field].includes(email)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], email]
      }));
    }
  };

  const removeRecipient = (email: string, field: 'to' | 'cc' | 'bcc') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(e => e !== email)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, input: string, field: 'to' | 'cc' | 'bcc', setInput: (value: string) => void) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim() && input.includes('@')) {
        addRecipient(input.trim(), field);
        setInput('');
      }
    }
  };

  const handleSend = async () => {
    if (!accountId || formData.to.length === 0 || !formData.subject.trim()) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir les destinataires et l'objet"
      });
      return;
    }

    setIsSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session non trouvée');
      }

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          accountId,
          to: formData.to,
          cc: formData.cc,
          bcc: formData.bcc,
          subject: formData.subject,
          body: formData.body
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: "Votre message a été envoyé avec succès"
      });

      onClose();
      
      // Réinitialiser le formulaire
      setFormData({
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        body: ''
      });

    } catch (error) {
      console.error('Erreur envoi:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer l'email"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Nouveau message</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {/* Destinataires */}
          <div>
            <label className="text-sm font-medium">À :</label>
            <div className="flex flex-wrap gap-1 mt-1 p-2 border rounded-md min-h-[40px]">
              {formData.to.map((email) => (
                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeRecipient(email, 'to')}
                  />
                </Badge>
              ))}
              <Input
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, toInput, 'to', setToInput)}
                placeholder="Ajouter un destinataire..."
                className="border-none p-0 h-auto flex-1 min-w-[200px]"
              />
            </div>
          </div>

          {/* CC */}
          <div>
            <label className="text-sm font-medium">Cc :</label>
            <div className="flex flex-wrap gap-1 mt-1 p-2 border rounded-md min-h-[40px]">
              {formData.cc.map((email) => (
                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeRecipient(email, 'cc')}
                  />
                </Badge>
              ))}
              <Input
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, ccInput, 'cc', setCcInput)}
                placeholder="Ajouter en copie..."
                className="border-none p-0 h-auto flex-1 min-w-[200px]"
              />
            </div>
          </div>

          {/* Objet */}
          <div>
            <label className="text-sm font-medium">Objet :</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Objet du message"
              className="mt-1"
            />
          </div>

          {/* Corps du message */}
          <div className="flex-1">
            <label className="text-sm font-medium">Message :</label>
            <Textarea
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Rédigez votre message..."
              className="mt-1 min-h-[300px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Paperclip className="w-4 h-4 mr-1" />
                Joindre
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                onClick={handleSend}
                disabled={isSending || formData.to.length === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Envoi...' : 'Envoyer'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EmailComposer;
