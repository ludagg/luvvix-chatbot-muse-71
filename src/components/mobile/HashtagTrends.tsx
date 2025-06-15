
import React from 'react';
import { TrendingUp, Hash } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface Hashtag {
  tag: string;
  posts_count: number;
  // Ajout : vrai usage 24h
  count_24h?: number;
  trend_direction: 'up' | 'down' | 'stable';
  change_percentage?: number;
}

interface HashtagTrendsProps {
  onHashtagClick: (hashtag: string) => void;
  selectedHashtag?: string | null;
}

const HashtagTrends = ({ onHashtagClick, selectedHashtag }: HashtagTrendsProps) => {
  const [trends, setTrends] = React.useState<Hashtag[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Top hashtags sur 24h
    (async () => {
      setLoading(true);
      // Récupérer les hashtags utilisés sur les dernières 24h et le compteur total
      const { data, error } = await supabase.rpc('get_trending_hashtags_24h'); // nouvelle RPC
      if (data) {
        setTrends(
          data.map((d: any) => ({
            tag: d.tag,
            posts_count: d.total_count,
            count_24h: d.count_24h,
            trend_direction: 'up', // simplifié, à affiner
            change_percentage: undefined,
          }))
        );
      }
      setLoading(false);
    })();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold text-gray-900">Tendances actuelles</h3>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm animate-pulse">Chargement des tendances...</div>
      ) : (
        <div className="space-y-3">
          {trends.slice(0, 6).map((hashtag, index) => (
            <button
              key={hashtag.tag}
              onClick={() => onHashtagClick(hashtag.tag)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedHashtag === hashtag.tag
                  ? "bg-blue-50 border border-blue-400"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-medium">
                      #{index + 1} Tendance
                    </span>
                    {/* Trend direction possible */}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Hash className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-gray-900">
                      {hashtag.tag}
                    </span>
                    {hashtag.count_24h !== undefined && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-600 text-xs font-semibold">
                        {formatNumber(hashtag.count_24h)}/24h
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Total : {formatNumber(hashtag.posts_count)} posts
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      <button className="w-full text-blue-500 text-sm font-medium text-center mt-3 p-2 hover:bg-blue-50 rounded-lg transition-colors">
        Voir plus de tendances
      </button>
    </div>
  );
};

export default HashtagTrends;
