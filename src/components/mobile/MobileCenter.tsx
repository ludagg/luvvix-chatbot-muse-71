import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Heart, MessageCircle, Share, MoreVertical, Send, Camera, Image as ImageIcon, MapPin, Users, Bell, Play, UserPlus, UserCheck, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MobileCenterProps {
  onBack: () => void;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  video_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_profiles?: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profiles?: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members_count: number;
  avatar_url?: string;
  is_member: boolean;
}

const MobileCenter = ({ onBack }: MobileCenterProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'groups' | 'notifications'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchLikedPosts();
    fetchSuggestedUsers();
    fetchGroups();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('center_posts')
        .select(`
          *,
          user_profiles!inner(
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erreur chargement posts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('center_profiles')
        .select('*')
        .neq('id', user?.id)
        .limit(5);

      if (error) throw error;
      setSuggestedUsers(data || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const mockGroups: Group[] = [
        {
          id: '1',
          name: 'Développeurs JavaScript',
          description: 'Communauté de développeurs passionnés',
          members_count: 1247,
          is_member: false
        },
        {
          id: '2',
          name: 'Design UI/UX',
          description: 'Partage et discussions sur le design',
          members_count: 892,
          is_member: true
        },
        {
          id: '3',
          name: 'LuvviX Supporters',
          description: 'Groupe officiel des utilisateurs LuvviX',
          members_count: 3456,
          is_member: false
        }
      ];
      setGroups(mockGroups);
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
    }
  };

  const fetchLikedPosts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('center_likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setLikedPosts(new Set(data?.map(like => like.post_id) || []));
    } catch (error) {
      console.error('Erreur chargement likes:', error);
    }
  };

  const createPost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      const postData: any = {
        user_id: user.id,
        content: newPost.trim(),
        media_urls: [],
      };

      // Simuler upload d'images (pour correspondre au backend actuel)
      if (selectedImages.length > 0) {
        postData.media_urls = selectedImages.map((_, index) =>
          `https://example.com/images/${Date.now()}_${index}.jpg`
        );
      }

      if (selectedVideo) {
        postData.video_url = `https://example.com/videos/${Date.now()}.mp4`;
      }

      const { error } = await supabase
        .from('center_posts')
        .insert(postData);

      if (error) throw error;

      setNewPost('');
      setSelectedVideo(null);
      setSelectedImages([]);
      setShowVideoUpload(false);
      fetchPosts();
      toast({
        title: "Post publié",
        description: "Votre post a été publié avec succès"
      });
    } catch (error) {
      console.error('Erreur création post:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier le post",
        variant: "destructive"
      });
    }
  };

  const toggleFollow = async (userId: string) => {
    if (!user) return;

    try {
      // Vérifier si on suit déjà
      const { data: existingFollow, error: checkError } = await supabase
        .from('center_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingFollow) {
        // Unfollow
        const { error } = await supabase
          .from('center_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
        toast({ title: "Utilisateur non suivi" });
      } else {
        // Follow
        const { error } = await supabase
          .from('center_follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) throw error;
        toast({ title: "Utilisateur suivi" });
      }

      fetchSuggestedUsers();
    } catch (error) {
      console.error('Erreur toggle follow:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le suivi",
        variant: "destructive"
      });
    }
  };

  const joinGroup = async (groupId: string) => {
    // Simuler rejoindre un groupe
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, is_member: !group.is_member, members_count: group.is_member ? group.members_count - 1 : group.members_count + 1 }
        : group
    ));
    
    toast({
      title: groups.find(g => g.id === groupId)?.is_member ? "Groupe quitté" : "Groupe rejoint",
      description: "Action effectuée avec succès"
    });
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const isLiked = likedPosts.has(postId);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('center_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('center_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
        setLikedPosts(prev => new Set([...prev, postId]));
      }

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + (isLiked ? -1 : 1) }
          : post
      ));
    } catch (error) {
      console.error('Erreur toggle like:', error);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('center_comments')
        .select(`
          *,
          user_profiles!inner(
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
    }
  };

  const addComment = async (postId: string) => {
    if (!newComment.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('center_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment
        });

      if (error) throw error;

      setNewComment('');
      fetchComments(postId);
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ));
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
    }
  };

  const renderPost = (post: Post) => (
    <div key={post.id} className="bg-white border-b border-gray-200 p-4">
      {/* Header du post */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {post.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{post.user_profiles?.full_name || 'Utilisateur'}</h4>
            <p className="text-xs text-gray-500">@{post.user_profiles?.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {format(new Date(post.created_at), 'dd MMM HH:mm', { locale: fr })}
          </span>
          <button className="p-1 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Contenu du post */}
      <div className="mb-3">
        <p className="text-gray-900 leading-relaxed">{post.content}</p>
        
        {/* Vidéo si présente */}
        {post.video_url && (
          <div className="mt-3 relative bg-black rounded-lg overflow-hidden">
            <div className="aspect-video flex items-center justify-center">
              <button className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                <Play className="w-8 h-8 text-gray-800 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => toggleLike(post.id)}
            className={`flex items-center space-x-2 transition-colors ${
              likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{post.likes_count}</span>
          </button>
          
          <button
            onClick={() => {
              setShowComments(showComments === post.id ? null : post.id);
              if (showComments !== post.id) {
                fetchComments(post.id);
              }
            }}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.comments_count}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Section commentaires */}
      {showComments === post.id && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {/* Nouveau commentaire */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
              />
              <button
                onClick={() => addComment(post.id)}
                disabled={!newComment.trim()}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Liste des commentaires */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {comment.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl px-3 py-2">
                    <h5 className="font-semibold text-sm text-gray-900">
                      {comment.user_profiles?.full_name || 'Utilisateur'}
                    </h5>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-3 mt-1">
                    {format(new Date(comment.created_at), 'dd MMM HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderExploreTab = () => (
    <div className="p-4 space-y-6">
      {/* Utilisateurs suggérés */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisateurs suggérés</h3>
        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{user.full_name}</h4>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Suivre</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tendances */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendances</h3>
        <div className="space-y-2">
          {['#LuvviXDev', '#JavaScript', '#React', '#TypeScript', '#WebDev'].map((tag, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="font-semibold text-blue-600">{tag}</p>
              <p className="text-sm text-gray-500">{Math.floor(Math.random() * 1000) + 100} posts</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGroupsTab = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Groupes</h3>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
          Créer un groupe
        </button>
      </div>

      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.id} className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{group.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">{group.description}</p>
                  <p className="text-xs text-gray-500">{group.members_count} membres</p>
                </div>
              </div>
              <button
                onClick={() => joinGroup(group.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  group.is_member
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {group.is_member ? 'Membre' : 'Rejoindre'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Nouvelle fonction de gestion d'upload d'images
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedImages.length > 4) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez ajouter que 4 images maximum",
        variant: "destructive"
      });
      return;
    }
    setSelectedImages(prev => [...prev, ...files]);
  };

  // Pour retirer une image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">LuvviX Center</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex bg-white border-b border-gray-200">
        {[
          { id: 'feed', label: 'Fil' },
          { id: 'explore', label: 'Explorer' },
          { id: 'groups', label: 'Groupes' },
          { id: 'notifications', label: 'Notifications' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'feed' && (
          <div>
            {/* Créateur de post */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-start space-x-3">
                {/* ... avatar ... */}
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Quoi de neuf ?"
                    className="w-full p-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />

                  {/* Preview des images sélectionnées */}
                  {selectedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedImages.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Aperçu ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-opacity-90"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview vidéo reste inchangée */}
                  {selectedVideo && (
                    <div className="mt-3 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Video className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-700">{selectedVideo.name}</span>
                      </div>
                      <button
                        onClick={() => setSelectedVideo(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-3">
                      {/* Ajout uploader image */}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="image-upload-mobile"
                        onChange={handleImageUpload}
                        disabled={!!selectedVideo}
                      />
                      <label
                        htmlFor="image-upload-mobile"
                        className={`p-2 ${selectedVideo ? 'text-gray-400 cursor-not-allowed' : 'text-green-500 hover:bg-green-50'} rounded-full transition-colors cursor-pointer`}
                      >
                        <ImageIcon className="w-5 h-5" />
                      </label>

                      {/* Uploader vidéo existant */}
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)}
                        className="hidden"
                        id="video-upload"
                        disabled={selectedImages.length > 0}
                      />
                      <label
                        htmlFor="video-upload"
                        className={`p-2 ${selectedImages.length > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-purple-500 hover:bg-purple-50'} rounded-full transition-colors cursor-pointer`}
                      >
                        <Video className="w-5 h-5" />
                      </label>

                      {/* Boutons caméra & map (conservés) */}
                      <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                        <Camera className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={createPost}
                      disabled={!newPost.trim() || isNaN(user?.id)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Publier
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des posts */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun post à afficher</p>
                <p className="text-gray-400 text-sm">Soyez le premier à publier !</p>
              </div>
            ) : (
              posts.map(renderPost)
            )}
          </div>
        )}

        {activeTab === 'explore' && renderExploreTab()}
        {activeTab === 'groups' && renderGroupsTab()}

        {activeTab === 'notifications' && (
          <div className="p-4">
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Notifications</h3>
              <p className="text-gray-500">Aucune notification pour le moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCenter;
