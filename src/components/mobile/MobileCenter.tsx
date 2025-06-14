import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Heart, MessageCircle, Share, MoreVertical, Send, Camera, Image as ImageIcon, MapPin, Users, Bell, Play, UserPlus, UserCheck, Video, Grid3X3, List, Filter, Bookmark, BookmarkCheck, Flag, Smile, ThumbsUp, Laugh, Frown, AngryIcon } from 'lucide-react';
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
      // Mock story d’un autre user
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
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header avec filtres */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">LuvviX Center</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Filtre de contenu */}
          <select
            value={contentFilter}
            onChange={(e) => setContentFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1"
          >
            <option value="recent">Récent</option>
            <option value="popular">Populaire</option>
            <option value="friends">Amis</option>
          </select>

          {/* Mode d'affichage */}
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            {viewMode === 'list' ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>

          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stories Bar */}
      <div className="flex items-center bg-white border-b border-gray-200 p-3 overflow-x-auto no-scrollbar gap-4">
        {/* Ajout story */}
        <label
          htmlFor="story-upload"
          className="flex flex-col items-center justify-center cursor-pointer w-14 h-14 rounded-full bg-gradient-to-tr from-green-400 to-blue-400 text-white font-bold relative"
        >
          <span className="text-xl">+</span>
          <input type="file" accept="image/*,video/*" id="story-upload" className="hidden" onChange={handleStoryUpload} disabled={uploadingStory} />
          <span className="absolute bottom-0 left-0 text-[10px] px-1 bg-white bg-opacity-60 text-gray-700 rounded">
            Story
          </span>
        </label>

        {/* Ma propre story */}
        {myStoryUpload && (
          <div className="relative flex flex-col items-center">
            <img src={URL.createObjectURL(myStoryUpload)} className="w-14 h-14 rounded-full object-cover border-2 border-blue-400" alt="ma story" />
            <button onClick={removeMyStory} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs">×</button>
            <span className="text-xs mt-1">Moi</span>
          </div>
        )}
        {/* Autres stories */}
        {stories.filter(s => s.user.id !== user?.id).map((s, idx) => (
          <div key={s.id+idx} className="flex flex-col items-center">
            <img src={s.media_url} className="w-14 h-14 rounded-full object-cover border-2 border-gray-300" alt={s.user.full_name} />
            <span className="text-xs mt-1">{s.user.username}</span>
          </div>
        ))}
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Quoi de neuf ?"
                    className="w-full p-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    disabled={posting}
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

                  {/* Preview vidéo */}
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
                        disabled={!!selectedVideo || posting}
                      />
                      <label
                        htmlFor="image-upload-mobile"
                        className={`p-2 ${selectedVideo ? 'text-gray-400 cursor-not-allowed' : 'text-green-500 hover:bg-green-50'} rounded-full transition-colors cursor-pointer`}
                      >
                        <ImageIcon className="w-5 h-5" />
                      </label>

                      {/* Uploader vidéo */}
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)}
                        className="hidden"
                        id="video-upload"
                        disabled={selectedImages.length > 0 || posting}
                      />
                      <label
                        htmlFor="video-upload"
                        className={`p-2 ${selectedImages.length > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-purple-500 hover:bg-purple-50'} rounded-full transition-colors cursor-pointer`}
                      >
                        <Video className="w-5 h-5" />
                      </label>

                      {/* Boutons caméra & map */}
                      <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors" disabled={posting}>
                        <Camera className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" disabled={posting}>
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={createPost}
                      disabled={!newPost.trim() || !user?.id || posting}
                      className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {posting ? 'Publication...' : 'Publier'}
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
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2 p-2' : ''}>
                {filterPosts().map((post) => (
                  <div key={post.id} className={`bg-white border-b border-gray-200 ${viewMode === 'grid' ? 'rounded-lg overflow-hidden' : 'p-4'}`}>
                    {/* Header du post */}
                    <div className={`flex items-center justify-between ${viewMode === 'grid' ? 'p-3 pb-2' : 'mb-3'}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {post.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {post.user_profiles?.full_name || 'Utilisateur inconnu'}
                          </h4>
                          <p className="text-xs text-gray-500">@{post.user_profiles?.username || "anonyme"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {format(new Date(post.created_at), 'dd MMM HH:mm', { locale: fr })}
                        </span>
                        
                        {/* Menu actions */}
                        <div className="relative">
                          <button className="p-1 hover:bg-gray-100 rounded-full">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          {/* Dropdown menu (simplified for demo) */}
                        </div>
                      </div>
                    </div>

                    {/* Contenu du post avec mentions et hashtags */}
                    <div className={`${viewMode === 'grid' ? 'px-3 pb-2' : 'mb-3'}`}>
                      <div 
                        className="text-gray-900 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: processPostContent(post.content) }}
                      />
                      
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

                      {/* Images en grille si présentes */}
                      {post.media_urls && post.media_urls.length > 0 && (
                        <div className={`mt-3 grid gap-2 rounded-lg overflow-hidden ${
                          post.media_urls.length === 1 ? 'grid-cols-1' :
                          post.media_urls.length === 2 ? 'grid-cols-2' :
                          post.media_urls.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
                        }`}>
                          {post.media_urls.slice(0, 4).map((url, index) => (
                            <div key={index} className={`relative ${
                              post.media_urls.length === 3 && index === 0 ? 'row-span-2' : ''
                            }`}>
                              <img 
                                src={url} 
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {post.media_urls.length > 4 && index === 3 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">+{post.media_urls.length - 4}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions avec réactions avancées */}
                    <div className={`flex items-center justify-between pt-3 border-t border-gray-100 ${viewMode === 'grid' ? 'px-3 pb-3' : ''}`}>
                      <div className="flex items-center space-x-4">
                        {/* Réactions */}
                        <div className="relative">
                          <button
                            onClick={() => setShowReactionPicker(showReactionPicker === post.id ? null : post.id)}
                            className={`flex items-center space-x-2 transition-colors ${
                              userReactions[post.id] ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            {userReactions[post.id] ? (
                              <span className="text-lg">{reactions.find(r => r.name === userReactions[post.id])?.emoji}</span>
                            ) : (
                              <Heart className="w-5 h-5" />
                            )}
                            <span className="text-sm font-medium">
                              {Object.values(postReactions[post.id] || {}).reduce((a, b) => a + b, 0) || post.likes_count}
                            </span>
                          </button>

                          {/* Picker de réactions */}
                          {showReactionPicker === post.id && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-full shadow-lg p-2 flex space-x-1 z-10">
                              {reactions.map((reaction) => (
                                <button
                                  key={reaction.name}
                                  onClick={() => addReaction(post.id, reaction.name)}
                                  className="text-2xl hover:scale-125 transition-transform p-1"
                                >
                                  {reaction.emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
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
                        
                        <button
                          onClick={() => sharePost(post.id)}
                          className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
                        >
                          <Share className="w-5 h-5" />
                          <span className="text-sm font-medium">Partager</span>
                        </button>

                        {/* Sauvegarde */}
                        <button
                          onClick={() => toggleSavePost(post.id)}
                          className={`transition-colors ${
                            savedPosts.has(post.id) ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
                          }`}
                        >
                          {savedPosts.has(post.id) ? (
                            <BookmarkCheck className="w-5 h-5" />
                          ) : (
                            <Bookmark className="w-5 h-5" />
                          )}
                        </button>

                        {/* Signalement */}
                        <button
                          onClick={() => reportPost(post.id, 'inappropriate')}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Affichage des réactions populaires */}
                    {postReactions[post.id] && Object.keys(postReactions[post.id]).length > 0 && (
                      <div className={`flex items-center space-x-1 text-sm text-gray-500 ${viewMode === 'grid' ? 'px-3 pb-2' : 'mt-2'}`}>
                        {Object.entries(postReactions[post.id])
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([reactionType, count]) => {
                            const reaction = reactions.find(r => r.name === reactionType);
                            return (
                              <span key={reactionType} className="flex items-center space-x-1">
                                <span>{reaction?.emoji}</span>
                                <span>{count}</span>
                              </span>
                            );
                          })}
                      </div>
                    )}

                    {/* Section commentaires */}
                    {showComments === post.id && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        {/* Nouveau commentaire */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
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
                                    {comment.user_profiles?.full_name || 'Utilisateur inconnu'}
                                  </h5>
                                  <p className="text-sm text-gray-700">{comment.content}</p>
                                  {comment.user_profiles?.email && (
                                    <p className="text-xs text-gray-400">{comment.user_profiles.email}</p>
                                  )}
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
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'explore' && (
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
