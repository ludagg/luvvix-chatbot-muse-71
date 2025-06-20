
import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Save } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface MobileNotesProps {
  onBack: () => void;
}

const MobileNotes = ({ onBack }: MobileNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: 'Ma première note', content: 'Contenu de la note...', createdAt: new Date() }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const createNote = () => {
    if (title.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date()
      };
      setNotes([newNote, ...notes]);
      setTitle('');
      setContent('');
      setIsCreating(false);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  if (isCreating || editingNote) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => { setIsCreating(false); setEditingNote(null); }} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">{editingNote ? 'Modifier' : 'Nouvelle note'}</h1>
          <button onClick={createNote} className="p-2 bg-blue-500 rounded-lg">
            <Save className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <div className="flex-1 p-4 space-y-4">
          <input
            type="text"
            placeholder="Titre de la note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg text-lg font-medium"
          />
          <textarea
            placeholder="Contenu de votre note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full flex-1 p-3 border rounded-lg resize-none"
            rows={15}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Notes</h1>
        <button onClick={() => setIsCreating(true)} className="p-2 bg-blue-500 rounded-lg">
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex-1">{note.title}</h3>
              <div className="flex space-x-2">
                <button onClick={() => { setEditingNote(note); setTitle(note.title); setContent(note.content); }} className="p-1">
                  <Edit className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => deleteNote(note.id)} className="p-1">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-2">{note.content.substring(0, 100)}...</p>
            <p className="text-xs text-gray-400">{note.createdAt.toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileNotes;
