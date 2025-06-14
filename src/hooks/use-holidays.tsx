
import { useState, useEffect } from 'react';

interface Holiday {
  date: string;
  name: string;
  type: 'public' | 'religious' | 'observance';
  country: string;
}

export const useHolidays = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHolidays = async (year: number, country: string = 'FR') => {
    setLoading(true);
    try {
      // Jours fériés français pour l'année en cours
      const frenchHolidays: Holiday[] = [
        { date: `${year}-01-01`, name: 'Nouvel An', type: 'public', country: 'FR' },
        { date: `${year}-05-01`, name: 'Fête du Travail', type: 'public', country: 'FR' },
        { date: `${year}-05-08`, name: 'Fête de la Victoire', type: 'public', country: 'FR' },
        { date: `${year}-07-14`, name: 'Fête Nationale', type: 'public', country: 'FR' },
        { date: `${year}-08-15`, name: 'Assomption', type: 'religious', country: 'FR' },
        { date: `${year}-11-01`, name: 'Toussaint', type: 'religious', country: 'FR' },
        { date: `${year}-11-11`, name: 'Armistice', type: 'public', country: 'FR' },
        { date: `${year}-12-25`, name: 'Noël', type: 'religious', country: 'FR' },
      ];

      // Calcul des dates variables (Pâques, etc.)
      const easter = getEasterDate(year);
      const easterMonday = new Date(easter);
      easterMonday.setDate(easter.getDate() + 1);
      const ascension = new Date(easter);
      ascension.setDate(easter.getDate() + 39);
      const whitMonday = new Date(easter);
      whitMonday.setDate(easter.getDate() + 50);

      const variableHolidays: Holiday[] = [
        { date: formatDate(easter), name: 'Pâques', type: 'religious', country: 'FR' },
        { date: formatDate(easterMonday), name: 'Lundi de Pâques', type: 'religious', country: 'FR' },
        { date: formatDate(ascension), name: 'Ascension', type: 'religious', country: 'FR' },
        { date: formatDate(whitMonday), name: 'Lundi de Pentecôte', type: 'religious', country: 'FR' },
      ];

      setHolidays([...frenchHolidays, ...variableHolidays]);
    } catch (error) {
      console.error('Erreur lors du chargement des jours fériés:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEasterDate = (year: number): Date => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isHoliday = (date: Date): Holiday | null => {
    const dateStr = formatDate(date);
    return holidays.find(holiday => holiday.date === dateStr) || null;
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    fetchHolidays(currentYear);
  }, []);

  return {
    holidays,
    loading,
    fetchHolidays,
    isHoliday,
  };
};
