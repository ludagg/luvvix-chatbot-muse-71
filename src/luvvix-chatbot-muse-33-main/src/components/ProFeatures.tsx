
import { Check } from 'lucide-react';

export function ProFeatures() {
  const features = [
    "Conversations illimitées",
    "Accès prioritaire aux nouveaux modèles",
    "Upload d'images et analyse de contenu",
    "Réponses plus rapides",
    "Support dédié",
  ];

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <div className="mr-2 mt-0.5 bg-amber-100 dark:bg-amber-900/30 rounded-full p-0.5">
              <Check className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProFeatures;
