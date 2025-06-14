
import React from 'react';
import { TrendingUp, Hash } from 'lucide-react';

interface Hashtag {
  tag: string;
  posts_count: number;
  trend_direction: 'up' | 'down' | 'stable';
  change_percentage?: number;
}

interface HashtagTrendsProps {
  hashtags: Hashtag[];
  onHashtagClick: (hashtag: string) => void;
}

const HashtagTrends = ({ hashtags, onHashtagClick }: HashtagTrendsProps) => {
  if (hashtags.length === 0) return null;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold text-gray-900">Tendances pour vous</h3>
      </div>
      
      <div className="space-y-3">
        {hashtags.slice(0, 6).map((hashtag, index) => (
          <button
            key={hashtag.tag}
            onClick={() => onHashtagClick(hashtag.tag)}
            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 font-medium">
                    #{index + 1} Tendance
                  </span>
                  {hashtag.trend_direction === 'up' && (
                    <div className="flex items-center space-x-1 text-green-500">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        +{hashtag.change_percentage}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <Hash className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-gray-900">
                    {hashtag.tag}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(hashtag.posts_count)} posts
                </p>
              </div>
              
              <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded opacity-20">
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <button className="w-full text-blue-500 text-sm font-medium text-center mt-3 p-2 hover:bg-blue-50 rounded-lg transition-colors">
        Voir plus de tendances
      </button>
    </div>
  );
};

export default HashtagTrends;
