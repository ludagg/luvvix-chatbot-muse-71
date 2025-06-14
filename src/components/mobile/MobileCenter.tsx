
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Heart, MessageCircle, Share, MoreVertical, Send, Camera, Image as ImageIcon, MapPin, Users, Bell, Play, UserPlus, UserCheck, Video, Grid3X3, List, Filter, Bookmark, BookmarkCheck, Flag, Smile, ThumbsUp, Laugh, Frown, AngryIcon, Feather, TrendingUp, Hash, Home, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TwitterPost from './TwitterPost';
import TwitterComposer from './TwitterComposer';
import TwitterSidebar from './TwitterSidebar';

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
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    email?: string; // Ajout si besoin
  };
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profiles?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    email?: string; // Ajout si besoin
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
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [contentFilter, setContentFilter] = useState<'recent' | 'popular' | 'friends'>('recent');
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [postReactions, setPostReactions] = useState<{[key: string]: {[key: string]: number}}>({});
  const [userReactions, setUserReactions] = useState<{[key: string]: string}>({});
  const [showComposer, setShowComposer] = useState(false);

  const reactions = [
    { emoji: '❤️', name: 'love', color: 'text-red-500' },
    { emoji: '👍', name: 'like', color: 'text-blue-500' },
    { emoji: '😂', name: 'laugh', color: 'text-yellow-500' },
    { emoji: '😮', name: 'wow', color: 'text-orange-500' },
    { emoji: '😢', name: 'sad', color: 'text-blue-400' },
    { emoji: '😡', name: 'angry', color: 'text-red-600' }
  ];

  // Stories State
  const [stories, setStories] = useState<{ 
    id: string, 
    user: UserProfile, 
    media_url: string, 
    created_at: string 
  }[]>([]);
  const [myStoryUpload, setMyStoryUpload] = useState<File | null>(null);
  const [uploadingStory, setUploadingStory] = useState(false);

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
          user_profiles: user_id (
            id,
            full_name,
            username,
            avatar_url,
            email
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

  // -------- STORY LOGIC -----------
  // Mock for now: fetch all stories from current user and others (real: should use supabase)
  useEffect(() => {
    // Simule stories (à customiser backend plus tard)
    setStories([
      ...(myStoryUpload
        ? [{
          id: 'me',
          user: {
            id: user?.id ?? "me",
            username: user?.user_metadata?.username ?? "Moi",
            full_name: user?.user_metadata?.full_name ?? user?.email ?? "Moi",
            avatar_url: "",
          },
          media_url: URL.createObjectURL(myStoryUpload),
          created_at: new Date().toISOString()
        }]
        : []),
      // Mock story d'un autre user
      {
        id: 'u2',
        user: {
          id: "u2",
          username: "dev_jane",
          full_name: "Jane Dev",
          avatar_url: "",
        },
        media_url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
        created_at: new Date(Date.now() - 3600 * 1000).toISOString()
      }
    ]);
  }, [myStoryUpload, user]);

  // Upload d'une story
  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingStory(true);
    try {
      // Upload to supabase storage 
      const { error, data } = await supabase.storage
        .from('center-media')
        .upload(`stories/${user.id}_${Date.now()}_${file.name}`, file, {
          upsert: true,
        });
      if (error) throw error;

      // L'URL publique
      const publicUrl = supabase.storage.from('center-media').getPublicUrl(data?.path ?? "").data.publicUrl;
      setMyStoryUpload(file); // sets local preview/mock
      setStories(prev => [
        {
          id: 'me_' + Date.now(),
          user: {
            id: user.id,
            username: user.user_metadata?.username ?? user.email?.split('@')[0] ?? "Moi",
            full_name: user.user_metadata?.full_name ?? user.email ?? "Moi",
            avatar_url: "",
          },
          media_url: publicUrl,
          created_at: new Date().toISOString()
        },
        ...prev.filter(s => s.user.id !== user.id)
      ]);
      toast({
        title: "Story publiée !",
        description: "Votre story est visible pendant 24h."
      });
    } catch (error) {
      toast({
        title: "Erreur story",
        description: "Échec de l'upload.",
        variant: "destructive"
      });
    } finally {
      setUploadingStory(false);
    }
  };

  // Efface sa propre story (mock/local)
  const removeMyStory = () => setMyStoryUpload(null);

  // --------- FOLLOW ---------
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

  // --------- GROUPES ---------
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

  // --------- POSTS ---------
  // Fix création post/loading
  const [posting, setPosting] = useState(false);

  const createPost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    try {
      const postData: any = {
        user_id: user.id,
        content: newPost.trim(),
        media_urls: [],
      };

      // Upload image...
      if (selectedImages.length > 0) {
        // upload all images (demo: loop; prod: Promise.all)
        const uploadResults = await Promise.all(selectedImages.map(async (img, index) => {
          const { data, error } = await supabase.storage
            .from('center-media')
            .upload(`posts/${user.id}_${Date.now()}_${index}_${img.name}`, img, { upsert: true });
          if (error) throw error;
          return supabase.storage.from('center-media').getPublicUrl(data.path).data.publicUrl;
        }));
        postData.media_urls = uploadResults;
      }

      if (selectedVideo) {
        const { data, error } = await supabase.storage
          .from('center-media')
          .upload(`posts/${user.id}_${Date.now()}_video_${selectedVideo.name}`, selectedVideo, { upsert: true });
        if (error) throw error;
        postData.video_url = supabase.storage.from('center-media').getPublicUrl(data.path).data.publicUrl;
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
      toast({
        title: "Erreur",
        description: "Impossible de publier le post",
        variant: "destructive"
      });
    } finally {
      setPosting(false);
    }
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
          user_profiles: user_id (
            id,
            full_name,
            username,
            avatar_url,
            email
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

  const fetchSavedPosts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('center_saved_posts')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setSavedPosts(new Set(data?.map(save => save.post_id) || []));
    } catch (error) {
      console.error('Erreur chargement posts sauvegardés:', error);
    }
  };

  const fetchPostReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('center_reactions')
        .select('post_id, reaction_type, user_id')
        .in('post_id', posts.map(p => p.id));

      if (error) throw error;

      const reactionsMap: {[key: string]: {[key: string]: number}} = {};
      const userReactionsMap: {[key: string]: string} = {};

      data?.forEach(reaction => {
        if (!reactionsMap[reaction.post_id]) {
          reactionsMap[reaction.post_id] = {};
        }
        reactionsMap[reaction.post_id][reaction.reaction_type] = 
          (reactionsMap[reaction.post_id][reaction.reaction_type] || 0) + 1;

        if (reaction.user_id === user?.id) {
          userReactionsMap[reaction.post_id] = reaction.reaction_type;
        }
      });

      setPostReactions(reactionsMap);
      setUserReactions(userReactionsMap);
    } catch (error) {
      console.error('Erreur chargement réactions:', error);
    }
  };

  useEffect(() => {
    if (posts.length > 0) {
      fetchPostReactions();
    }
    fetchSavedPosts();
  }, [posts, user]);

  const addReaction = async (postId: string, reactionType: string) => {
    if (!user) return;

    try {
      // Supprimer l'ancienne réaction si elle existe
      if (userReactions[postId]) {
        await supabase
          .from('center_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      }

      // Ajouter la nouvelle réaction
      const { error } = await supabase
        .from('center_reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType
        });

      if (error) throw error;

      setUserReactions(prev => ({ ...prev, [postId]: reactionType }));
      setShowReactionPicker(null);
      fetchPostReactions();
    } catch (error) {
      console.error('Erreur ajout réaction:', error);
    }
  };

  const toggleSavePost = async (postId: string) => {
    if (!user) return;

    const isSaved = savedPosts.has(postId);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('center_saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setSavedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        toast({ title: "Post retiré des favoris" });
      } else {
        const { error } = await supabase
          .from('center_saved_posts')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
        setSavedPosts(prev => new Set([...prev, postId]));
        toast({ title: "Post sauvegardé" });
      }
    } catch (error) {
      console.error('Erreur sauvegarde post:', error);
    }
  };

  const reportPost = async (postId: string, reason: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('center_reports')
        .insert({
          post_id: postId,
          user_id: user.id,
          reason,
          status: 'pending'
        });

      if (error) throw error;
      toast({ 
        title: "Signalement envoyé", 
        description: "Notre équipe va examiner ce contenu." 
      });
    } catch (error) {
      console.error('Erreur signalement:', error);
    }
  };

  const processPostContent = (content: string) => {
    // Traitement des mentions (@username)
    const mentionRegex = /@(\w+)/g;
    const hashtagRegex = /#(\w+)/g;

    return content
      .replace(mentionRegex, '<span class="text-blue-500 font-medium cursor-pointer">@$1</span>')
      .replace(hashtagRegex, '<span class="text-green-500 font-medium cursor-pointer">#$1</span>');
  };

  const filterPosts = () => {
    let filtered = [...posts];
    
    switch (contentFilter) {
      case 'popular':
        return filtered.sort((a, b) => (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count));
      case 'friends':
        // Mock: filter posts from followed users
        return filtered.filter(post => Math.random() > 0.3);
      default:
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <TwitterSidebar 
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as any)}
          onCompose={() => setShowComposer(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header Twitter Style */}
        <div className="sticky top-0 bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-200 z-40">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {activeTab === 'feed' ? 'Accueil' : 
                   activeTab === 'explore' ? 'Explorer' : 
                   activeTab === 'notifications' ? 'Notifications' : 'Groupes'}
                </h1>
                {activeTab === 'feed' && (
                  <p className="text-sm text-gray-500">{posts.length} Tweets</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full lg:hidden">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={() => setShowComposer(true)}
                className="lg:hidden p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                <Feather className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs pour mobile */}
          <div className="flex lg:hidden border-t border-gray-200">
            {[
              { id: 'feed', label: 'Pour vous' },
              { id: 'explore', label: 'Abonnements' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Bar */}
        <div className="flex items-center bg-white border-b border-gray-200 p-4 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 min-w-max">
            {/* Ajout story */}
            <label
              htmlFor="story-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <span className="text-xs mt-1 text-gray-600">Votre story</span>
              <input type="file" accept="image/*,video/*" id="story-upload" className="hidden" onChange={handleStoryUpload} disabled={uploadingStory} />
            </label>

            {/* Stories existantes */}
            {stories.map((story, idx) => (
              <div key={story.id + idx} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5">
                  <img 
                    src={story.media_url} 
                    className="w-full h-full rounded-full object-cover" 
                    alt={story.user.full_name} 
                  />
                </div>
                <span className="text-xs mt-1 text-gray-600 truncate w-16 text-center">
                  {story.user.username}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="pb-20 lg:pb-4">
          {activeTab === 'feed' && (
            <div>
              {/* Quick compose sur desktop */}
              <div className="hidden lg:block border-b border-gray-200 p-4">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowComposer(true)}
                    className="flex-1 text-left text-xl text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-full px-4 py-3 transition-colors"
                  >
                    Quoi de neuf ?
                  </button>
                </div>
              </div>

              {/* Posts Feed */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Feather className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bienvenue sur LuvviX !</h3>
                  <p className="text-gray-500 mb-4">Votre timeline est vide. Commencez à suivre des personnes pour voir leurs tweets.</p>
                  <button 
                    onClick={() => setActiveTab('explore')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors"
                  >
                    Découvrir des personnes
                  </button>
                </div>
              ) : (
                <div>
                  {filterPosts().map((post) => (
                    <TwitterPost
                      key={post.id}
                      post={post}
                      isLiked={likedPosts.has(post.id)}
                      isSaved={savedPosts.has(post.id)}
                      userReaction={userReactions[post.id]}
                      postReactions={postReactions[post.id]}
                      onLike={() => toggleLike(post.id)}
                      onComment={() => {
                        setShowComments(showComments === post.id ? null : post.id);
                        if (showComments !== post.id) {
                          fetchComments(post.id);
                        }
                      }}
                      onRetweet={() => {}}
                      onShare={() => sharePost(post.id)}
                      onSave={() => toggleSavePost(post.id)}
                      onShowReactions={() => setShowReactionPicker(showReactionPicker === post.id ? null : post.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'explore' && (
            <div className="p-4">
              {/* Trending */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Tendances pour vous
                </h2>
                <div className="space-y-3">
                  {['#LuvviXDev', '#JavaScript', '#React', '#TypeScript', '#WebDev'].map((tag, index) => (
                    <div key={index} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span className="font-bold text-blue-600">{tag}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{Math.floor(Math.random() * 1000) + 100} Tweets</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Users */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Suggestions pour vous
                </h2>
                <div className="space-y-3">
                  {suggestedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{user.full_name}</h4>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFollow(user.id)}
                        className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Suivre
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Groupes</h3>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                  onClick={() => setShowCreateGroup(true)}
                >
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
                          <p className="text-xs text-gray-500">{group.members_count} membre{group.members_count > 1 ? 's' : ''}</p>
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

              {/* Modale de création de groupe */}
              {showCreateGroup && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs mx-auto space-y-4">
                    <h4 className="text-lg font-semibold mb-2">Créer un groupe</h4>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg mb-2 text-sm"
                      placeholder="Nom du groupe"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      maxLength={30}
                    />
                    <textarea
                      className="w-full p-2 border rounded-lg mb-2 text-sm resize-none"
                      placeholder="Description"
                      rows={2}
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      maxLength={80}
                    />
                    <div className="flex justify-end space-x-3">
                      <button
                        className="px-4 py-1 bg-gray-200 rounded-lg text-gray-700"
                        onClick={() => setShowCreateGroup(false)}
                        type="button"
                      >
                        Annuler
                      </button>
                      <button
                        className="px-4 py-1 bg-blue-500 text-white rounded-lg"
                        onClick={handleCreateGroup}
                        type="button"
                      >
                        Créer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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

      {/* Right Sidebar Desktop */}
      <div className="hidden xl:block w-80 p-4 border-l border-gray-200">
        <div className="sticky top-20">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher sur LuvviX"
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Trending Widget */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <h3 className="text-xl font-bold mb-3">Tendances pour vous</h3>
            <div className="space-y-3">
              {['#LuvviXDev', '#JavaScript', '#React'].map((tag, index) => (
                <div key={index} className="hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition-colors">
                  <p className="font-bold text-blue-600">{tag}</p>
                  <p className="text-sm text-gray-500">{Math.floor(Math.random() * 100) + 10}K Tweets</p>
                </div>
              ))}
            </div>
          </div>

          {/* Qui suivre Widget */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="text-xl font-bold mb-3">Qui suivre</h3>
            <div className="space-y-3">
              {suggestedUsers.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user.full_name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollow(user.id)}
                    className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-colors"
                  >
                    Suivre
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'feed', icon: Home },
            { id: 'explore', icon: Search },
            { id: 'notifications', icon: Bell },
            { id: 'messages', icon: Mail }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-3 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-500'}`}
            >
              <tab.icon className="w-6 h-6" />
            </button>
          ))}
        </div>
      </div>

      {/* Twitter Composer Modal */}
      {showComposer && (
        <TwitterComposer
          onClose={() => setShowComposer(false)}
          onPost={async (content: string, images: File[]) => {
            await createPost();
          }}
          isSubmitting={posting}
        />
      )}
    </div>
  );

  // Nouvelle action pour partager un post (copie le lien et toast)
  async function sharePost(postId: string) {
    const fakeUrl = `${window.location.origin}/center/post/${postId}`;
    try {
      await navigator.clipboard.writeText(fakeUrl);
      toast({
        title: "Lien copié",
        description: "Le lien du post a été copié dans le presse-papier !",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  }

  // Gestion création groupe
  function handleCreateGroup() {
    if (!groupName.trim() || !groupDescription.trim()) {
      toast({
        title: "Champs requis",
        description: "Merci d'entrer un nom et une description",
        variant: "destructive"
      });
      return;
    }
    // Ajoute le nouveau groupe en début de liste (local uniquement)
    setGroups(prev => [
      {
        id: String(Date.now()),
        name: groupName.trim(),
        description: groupDescription.trim(),
        members_count: 1,
        is_member: true
      },
      ...prev
    ]);
    setShowCreateGroup(false);
    setGroupName('');
    setGroupDescription('');
    toast({
      title: "Groupe créé",
      description: "Votre groupe a bien été créé !"
    });
  }
};

export default MobileCenter;
