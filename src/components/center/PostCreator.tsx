
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Image, Video, FileText, Smile } from 'lucide-react';

interface PostCreatorProps {
  onPostCreated: (postData: any) => void;
}

const PostCreator = ({ onPostCreated }: PostCreatorProps) => {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPosting(true);
    
    try {
      await onPostCreated({
        content: content.trim(),
        media_url: null,
        media_type: null
      });
      
      setContent('');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Quoi de neuf ?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-none p-0 text-lg placeholder:text-gray-500 focus-visible:ring-0"
                maxLength={500}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button type="button" variant="ghost" size="sm">
                    <Image className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    <FileText className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {content.length}/500
                  </span>
                  <Button
                    type="submit"
                    disabled={!content.trim() || isPosting}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isPosting ? 'Publication...' : 'Publier'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostCreator;
