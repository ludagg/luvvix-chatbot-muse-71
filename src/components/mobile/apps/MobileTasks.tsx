
import React, { useState } from 'react';
import { ArrowLeft, Plus, Check, Trash2, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

interface MobileTasksProps {
  onBack: () => void;
}

const MobileTasks = ({ onBack }: MobileTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Faire les courses', completed: false, priority: 'medium' },
    { id: '2', title: 'Appeler le médecin', completed: true, priority: 'high' },
    { id: '3', title: 'Lire un livre', completed: false, priority: 'low' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        priority: 'medium'
      };
      setTasks([task, ...tasks]);
      setNewTask('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredTasks = showCompleted ? tasks : tasks.filter(task => !task.completed);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Tâches</h1>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="text-sm text-blue-500"
        >
          {showCompleted ? 'Masquer' : 'Afficher'} terminées
        </button>
      </div>
      
      <div className="p-4 bg-white border-b">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Nouvelle tâche..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="flex-1 p-3 border rounded-lg"
          />
          <button
            onClick={addTask}
            className="p-3 bg-blue-500 text-white rounded-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white rounded-lg p-4 border-l-4 ${getPriorityColor(task.priority)} shadow-sm`}
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  task.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {task.completed && <Check className="w-4 h-4 text-white" />}
              </button>
              
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority === 'high' ? 'Urgent' : task.priority === 'medium' ? 'Normal' : 'Faible'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche</h3>
            <p className="text-gray-600">Ajoutez une nouvelle tâche pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileTasks;
