
import React, { useState } from 'react';
import { ArrowLeft, Plus, Phone, Mail, Search, Edit, Trash2 } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
}

interface MobileContactsProps {
  onBack: () => void;
}

const MobileContacts = ({ onBack }: MobileContactsProps) => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Alice Martin', phone: '+33 6 12 34 56 78', email: 'alice@example.com', avatar: '/placeholder.svg' },
    { id: '2', name: 'Bob Dupont', phone: '+33 6 87 65 43 21', email: 'bob@example.com', avatar: '/placeholder.svg' },
    { id: '3', name: 'Claire Dubois', phone: '+33 6 11 22 33 44', email: 'claire@example.com', avatar: '/placeholder.svg' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addContact = () => {
    if (newContact.name.trim()) {
      const contact: Contact = {
        id: Date.now().toString(),
        ...newContact,
        avatar: '/placeholder.svg'
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: '', phone: '', email: '' });
      setShowAddForm(false);
    }
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  if (showAddForm) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => setShowAddForm(false)} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Nouveau contact</h1>
          <button
            onClick={addContact}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
          >
            Sauver
          </button>
        </div>
        
        <div className="flex-1 p-4 space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="Nom du contact"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="email@exemple.com"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Contacts</h1>
        <button onClick={() => setShowAddForm(true)} className="p-2 bg-blue-500 rounded-lg">
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>
      
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <div key={contact.id} className="flex items-center p-4 border-b border-gray-100">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{contact.name}</h3>
              <p className="text-sm text-gray-600">{contact.phone}</p>
              <p className="text-sm text-gray-600">{contact.email}</p>
            </div>
            
            <div className="flex space-x-2">
              <button className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </button>
              <button className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </button>
              <button
                onClick={() => deleteContact(contact.id)}
                className="p-2 bg-red-100 rounded-lg"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        ))}
        
        {filteredContacts.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contact trouvé</h3>
            <p className="text-gray-600">Ajoutez votre premier contact</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileContacts;
