
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MentionAutocompleteProps {
  query: string;
  onSelect: (user: { id: string; username: string; full_name?: string }) => void;
  position?: { top: number; left: number };
  excludeList?: string[];
}

const MentionAutocomplete: React.FC<MentionAutocompleteProps> = ({
  query,
  onSelect,
  position,
  excludeList = [],
}) => {
  const [results, setResults] = useState<{ id: string; username: string; full_name?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchUsers() {
      setLoading(true);
      if (!query) return setResults([]);
      // Recherche de profils commençant par la query (username ou nom)
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, username, full_name")
        .ilike("username", query + "%");
      if (!mounted) return;
      if (error) {
        setResults([]);
      } else {
        setResults((data ?? []).filter(u => !excludeList.includes(u.id)));
      }
      setLoading(false);
    }
    fetchUsers();
    return () => { mounted = false; };
  }, [query, excludeList]);

  if (!query || results.length === 0) return null;

  return (
    <div
      className="absolute bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto"
      style={position ? { ...position } : { top: "100%", left: 0 }}
    >
      {loading && (
        <div className="px-4 py-2 text-gray-500 text-sm">Recherche...</div>
      )}
      {!loading && results.map((user) => (
        <button
          key={user.id}
          className="block w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-100 cursor-pointer"
          onMouseDown={e => { e.preventDefault(); onSelect(user); }}
        >
          <span className="font-bold text-blue-600">@{user.username}</span>
          {user.full_name && (
            <span className="text-gray-500 ml-1">{user.full_name}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MentionAutocomplete;
