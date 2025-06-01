export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_tokens: {
        Row: {
          created_at: string
          description: string | null
          token: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          token: string
        }
        Update: {
          created_at?: string
          description?: string | null
          token?: string
        }
        Relationships: []
      }
      ai_admin_config: {
        Row: {
          api_key: string
          endpoint_url: string
          id: string
          max_tokens: number | null
          model_name: string
          quota_per_user: number | null
          updated_at: string
        }
        Insert: {
          api_key: string
          endpoint_url: string
          id?: string
          max_tokens?: number | null
          model_name: string
          quota_per_user?: number | null
          updated_at?: string
        }
        Update: {
          api_key?: string
          endpoint_url?: string
          id?: string
          max_tokens?: number | null
          model_name?: string
          quota_per_user?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_agent_context: {
        Row: {
          agent_id: string
          content: string | null
          content_type: string
          created_at: string
          file_path: string | null
          id: string
          url: string | null
        }
        Insert: {
          agent_id: string
          content?: string | null
          content_type: string
          created_at?: string
          file_path?: string | null
          id?: string
          url?: string | null
        }
        Update: {
          agent_id?: string
          content?: string | null
          content_type?: string
          created_at?: string
          file_path?: string | null
          id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_context_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_reviews: {
        Row: {
          agent_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          agent_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          agent_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          api_key: string | null
          avatar_style: string
          created_at: string
          id: string
          is_paid: boolean
          is_public: boolean
          name: string
          objective: string
          parameters: Json | null
          personality: string
          price: number | null
          rating: number | null
          slug: string | null
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          api_key?: string | null
          avatar_style: string
          created_at?: string
          id?: string
          is_paid?: boolean
          is_public?: boolean
          name: string
          objective: string
          parameters?: Json | null
          personality: string
          price?: number | null
          rating?: number | null
          slug?: string | null
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          api_key?: string | null
          avatar_style?: string
          created_at?: string
          id?: string
          is_paid?: boolean
          is_public?: boolean
          name?: string
          objective?: string
          parameters?: Json | null
          personality?: string
          price?: number | null
          rating?: number | null
          slug?: string | null
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_guest: boolean
          session_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_guest?: boolean
          session_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_guest?: boolean
          session_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_course_modifications: {
        Row: {
          ai_confidence_score: number | null
          applied_at: string | null
          course_id: string | null
          id: string
          modification_type: string
          new_data: Json
          old_data: Json | null
          reasoning: string
        }
        Insert: {
          ai_confidence_score?: number | null
          applied_at?: string | null
          course_id?: string | null
          id?: string
          modification_type: string
          new_data: Json
          old_data?: Json | null
          reasoning: string
        }
        Update: {
          ai_confidence_score?: number | null
          applied_at?: string | null
          course_id?: string | null
          id?: string
          modification_type?: string
          new_data?: Json
          old_data?: Json | null
          reasoning?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_course_modifications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_favorites: {
        Row: {
          added_at: string
          agent_id: string
          id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          agent_id: string
          id?: string
          user_id: string
        }
        Update: {
          added_at?: string
          agent_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_favorites_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_follows: {
        Row: {
          creator_id: string
          followed_at: string
          follower_id: string
          id: string
        }
        Insert: {
          creator_id: string
          followed_at?: string
          follower_id: string
          id?: string
        }
        Update: {
          creator_id?: string
          followed_at?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      appconnection: {
        Row: {
          applicationid: string
          createdat: string | null
          id: string
          lastused: string | null
          scopes: string[] | null
          userid: string
        }
        Insert: {
          applicationid: string
          createdat?: string | null
          id?: string
          lastused?: string | null
          scopes?: string[] | null
          userid: string
        }
        Update: {
          applicationid?: string
          createdat?: string | null
          id?: string
          lastused?: string | null
          scopes?: string[] | null
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "appconnection_applicationid_fkey"
            columns: ["applicationid"]
            isOneToOne: false
            referencedRelation: "application"
            referencedColumns: ["id"]
          },
        ]
      }
      AppConnection: {
        Row: {
          applicationId: string
          createdAt: string
          id: string
          lastUsed: string
          scopes: string[] | null
          userId: string
        }
        Insert: {
          applicationId: string
          createdAt?: string
          id: string
          lastUsed?: string
          scopes?: string[] | null
          userId: string
        }
        Update: {
          applicationId?: string
          createdAt?: string
          id?: string
          lastUsed?: string
          scopes?: string[] | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "AppConnection_applicationId_fkey"
            columns: ["applicationId"]
            isOneToOne: false
            referencedRelation: "Application"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AppConnection_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      application: {
        Row: {
          clientid: string
          clientsecret: string
          createdat: string | null
          description: string | null
          id: string
          name: string
          redirecturis: string[] | null
          updatedat: string | null
        }
        Insert: {
          clientid?: string
          clientsecret?: string
          createdat?: string | null
          description?: string | null
          id?: string
          name: string
          redirecturis?: string[] | null
          updatedat?: string | null
        }
        Update: {
          clientid?: string
          clientsecret?: string
          createdat?: string | null
          description?: string | null
          id?: string
          name?: string
          redirecturis?: string[] | null
          updatedat?: string | null
        }
        Relationships: []
      }
      Application: {
        Row: {
          clientId: string
          clientSecret: string
          createdAt: string
          description: string | null
          id: string
          name: string
          redirectUris: string[] | null
          updatedAt: string
        }
        Insert: {
          clientId: string
          clientSecret: string
          createdAt?: string
          description?: string | null
          id: string
          name: string
          redirectUris?: string[] | null
          updatedAt: string
        }
        Update: {
          clientId?: string
          clientSecret?: string
          createdAt?: string
          description?: string | null
          id?: string
          name?: string
          redirectUris?: string[] | null
          updatedAt?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author_id: string
          chapters_count: number | null
          comments_count: number | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          genres: string[] | null
          id: string
          ipfs_cid: string | null
          is_paid: boolean | null
          language: string | null
          likes_count: number | null
          price: number | null
          status: string | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id: string
          chapters_count?: number | null
          comments_count?: number | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          genres?: string[] | null
          id?: string
          ipfs_cid?: string | null
          is_paid?: boolean | null
          language?: string | null
          likes_count?: number | null
          price?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string
          chapters_count?: number | null
          comments_count?: number | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          genres?: string[] | null
          id?: string
          ipfs_cid?: string | null
          is_paid?: boolean | null
          language?: string | null
          likes_count?: number | null
          price?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      center_chat_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_deleted: boolean | null
          media_url: string | null
          metadata: Json | null
          room_id: string
          sender_id: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          media_url?: string | null
          metadata?: Json | null
          room_id: string
          sender_id: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          media_url?: string | null
          metadata?: Json | null
          room_id?: string
          sender_id?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "center_chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      center_chat_participants: {
        Row: {
          joined_at: string | null
          last_read_at: string | null
          role: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "center_chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      center_chat_rooms: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_group: boolean | null
          metadata: Json | null
          name: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          metadata?: Json | null
          name?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          metadata?: Json | null
          name?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      center_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "center_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      center_conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "center_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      center_conversations: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      center_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      center_game_participants: {
        Row: {
          joined_at: string | null
          room_id: string
          score: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          room_id: string
          score?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          joined_at?: string | null
          room_id?: string
          score?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_game_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "center_game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      center_game_rooms: {
        Row: {
          created_at: string | null
          created_by: string
          current_players: number
          ended_at: string | null
          game_id: string
          id: string
          max_players: number
          settings: Json | null
          started_at: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_players?: number
          ended_at?: string | null
          game_id: string
          id?: string
          max_players?: number
          settings?: Json | null
          started_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_players?: number
          ended_at?: string | null
          game_id?: string
          id?: string
          max_players?: number
          settings?: Json | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_game_rooms_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "center_games"
            referencedColumns: ["id"]
          },
        ]
      }
      center_game_scores: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          metadata: Json | null
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          metadata?: Json | null
          score: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          metadata?: Json | null
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_game_scores_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "center_games"
            referencedColumns: ["id"]
          },
        ]
      }
      center_game_states: {
        Row: {
          current_state: Json
          last_action: Json | null
          last_updated: string | null
          room_id: string
        }
        Insert: {
          current_state?: Json
          last_action?: Json | null
          last_updated?: string | null
          room_id: string
        }
        Update: {
          current_state?: Json
          last_action?: Json | null
          last_updated?: string | null
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_game_states_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "center_game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      center_games: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      center_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "center_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      center_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          media_url: string | null
          read_at: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          media_url?: string | null
          read_at?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          media_url?: string | null
          read_at?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "center_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      center_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          media_urls: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      center_profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_data: Json
          course_id: string | null
          id: string
          issued_at: string | null
          user_id: string | null
          verification_code: string
        }
        Insert: {
          certificate_data: Json
          course_id?: string | null
          id?: string
          issued_at?: string | null
          user_id?: string | null
          verification_code?: string
        }
        Update: {
          certificate_data?: Json
          course_id?: string | null
          id?: string
          issued_at?: string | null
          user_id?: string | null
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          book_id: string
          content: string
          created_at: string | null
          id: string
          ipfs_cid: string | null
          order: number
          title: string
          updated_at: string | null
        }
        Insert: {
          book_id: string
          content: string
          created_at?: string | null
          id?: string
          ipfs_cid?: string | null
          order: number
          title: string
          updated_at?: string | null
        }
        Update: {
          book_id?: string
          content?: string
          created_at?: string | null
          id?: string
          ipfs_cid?: string | null
          order?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          anime: string
          created_at: string
          id: string
          image: string
          name: string
          prompt_template: string
          updated_at: string
        }
        Insert: {
          anime: string
          created_at?: string
          id: string
          image: string
          name: string
          prompt_template: string
          updated_at?: string
        }
        Update: {
          anime?: string
          created_at?: string
          id?: string
          image?: string
          name?: string
          prompt_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      cloud_files: {
        Row: {
          created_at: string
          encryption_algorithm: string | null
          encryption_key: string | null
          id: string
          ipfs_cid: string | null
          is_deleted: boolean
          is_ldsp: boolean
          modified_at: string
          name: string
          parent_folder_id: string | null
          size: number
          starred: boolean
          tags: string[]
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encryption_algorithm?: string | null
          encryption_key?: string | null
          id?: string
          ipfs_cid?: string | null
          is_deleted?: boolean
          is_ldsp?: boolean
          modified_at?: string
          name: string
          parent_folder_id?: string | null
          size: number
          starred?: boolean
          tags?: string[]
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          encryption_algorithm?: string | null
          encryption_key?: string | null
          id?: string
          ipfs_cid?: string | null
          is_deleted?: boolean
          is_ldsp?: boolean
          modified_at?: string
          name?: string
          parent_folder_id?: string | null
          size?: number
          starred?: boolean
          tags?: string[]
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_parent_folder"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "cloud_files"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          book_id: string | null
          chapter_id: string | null
          content: string
          created_at: string | null
          id: string
        }
        Insert: {
          author_id: string
          book_id?: string | null
          chapter_id?: string | null
          content: string
          created_at?: string | null
          id?: string
        }
        Update: {
          author_id?: string
          book_id?: string | null
          chapter_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          character_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          ai_generated: boolean | null
          ai_last_update: string | null
          category: string
          created_at: string | null
          description: string | null
          difficulty_level: string
          duration_minutes: number | null
          id: string
          learning_objectives: string[] | null
          prerequisites: string[] | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_last_update?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          difficulty_level: string
          duration_minutes?: number | null
          id?: string
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_last_update?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ecosystem_interactions: {
        Row: {
          created_at: string
          data: Json
          id: string
          interaction_type: string
          metadata: Json | null
          processed_at: string | null
          source_app: string
          status: string
          target_app: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          interaction_type: string
          metadata?: Json | null
          processed_at?: string | null
          source_app: string
          status?: string
          target_app?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          interaction_type?: string
          metadata?: Json | null
          processed_at?: string | null
          source_app?: string
          status?: string
          target_app?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          ai_recommendations: Json | null
          completed_at: string | null
          course_id: string | null
          current_lesson_id: string | null
          enrolled_at: string | null
          id: string
          progress_percentage: number | null
          user_id: string | null
        }
        Insert: {
          ai_recommendations?: Json | null
          completed_at?: string | null
          course_id?: string | null
          current_lesson_id?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          ai_recommendations?: Json | null
          completed_at?: string | null
          course_id?: string | null
          current_lesson_id?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_current_lesson_id_fkey"
            columns: ["current_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      file_versions: {
        Row: {
          created_at: string
          encryption_key: string | null
          file_id: string
          id: string
          ipfs_cid: string
          size: number
          version_number: number
        }
        Insert: {
          created_at?: string
          encryption_key?: string | null
          file_id: string
          id?: string
          ipfs_cid: string
          size: number
          version_number: number
        }
        Update: {
          created_at?: string
          encryption_key?: string | null
          file_id?: string
          id?: string
          ipfs_cid?: string
          size?: number
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "file_versions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "cloud_files"
            referencedColumns: ["id"]
          },
        ]
      }
      form_questions: {
        Row: {
          created_at: string
          description: string | null
          form_id: string
          id: string
          options: Json | null
          position: number
          question_text: string
          question_type: string
          required: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          form_id: string
          id?: string
          options?: Json | null
          position: number
          question_text: string
          question_type: string
          required?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          form_id?: string
          id?: string
          options?: Json | null
          position?: number
          question_text?: string
          question_type?: string
          required?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_questions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          answers: Json
          form_id: string
          id: string
          responder_email: string | null
          responder_id: string | null
          submitted_at: string
        }
        Insert: {
          answers: Json
          form_id: string
          id?: string
          responder_email?: string | null
          responder_id?: string | null
          submitted_at?: string
        }
        Update: {
          answers?: Json
          form_id?: string
          id?: string
          responder_email?: string | null
          responder_id?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          published: boolean
          settings: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          settings?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          settings?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_analytics: {
        Row: {
          action_type: string
          course_id: string | null
          id: string
          lesson_id: string | null
          session_data: Json | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          course_id?: string | null
          id?: string
          lesson_id?: string | null
          session_data?: Json | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          course_id?: string | null
          id?: string
          lesson_id?: string | null
          session_data?: Json | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_analytics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_analytics_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          ai_personalization: Json | null
          course_sequence: string[] | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_personalization?: Json | null
          course_sequence?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_personalization?: Json | null
          course_sequence?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          ai_content: Json | null
          content: string
          course_id: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          lesson_order: number
          lesson_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_content?: Json | null
          content: string
          course_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          lesson_order: number
          lesson_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_content?: Json | null
          content?: string
          course_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          lesson_order?: number
          lesson_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          role: string
          timestamp: string
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          role: string
          timestamp?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          role?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      news_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          preferences: Json | null
          topics: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          preferences?: Json | null
          topics?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          preferences?: Json | null
          topics?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          answers: Json
          attempt_number: number | null
          completed_at: string | null
          id: string
          quiz_id: string | null
          score: number
          user_id: string | null
        }
        Insert: {
          answers: Json
          attempt_number?: number | null
          completed_at?: string | null
          id?: string
          quiz_id?: string | null
          score: number
          user_id?: string | null
        }
        Update: {
          answers?: Json
          attempt_number?: number | null
          completed_at?: string | null
          id?: string
          quiz_id?: string | null
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          max_attempts: number | null
          passing_score: number | null
          questions: Json
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number | null
          questions: Json
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number | null
          questions?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_progress: {
        Row: {
          book_id: string
          chapters_read: number | null
          id: string
          last_chapter_id: string | null
          last_read_at: string | null
          progress: number | null
          user_id: string
        }
        Insert: {
          book_id: string
          chapters_read?: number | null
          id?: string
          last_chapter_id?: string | null
          last_read_at?: string | null
          progress?: number | null
          user_id: string
        }
        Update: {
          book_id?: string
          chapters_read?: number | null
          id?: string
          last_chapter_id?: string | null
          last_read_at?: string | null
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_last_chapter_id_fkey"
            columns: ["last_chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      session: {
        Row: {
          createdat: string | null
          deviceinfo: string | null
          id: string
          lastactive: string | null
          userid: string
        }
        Insert: {
          createdat?: string | null
          deviceinfo?: string | null
          id?: string
          lastactive?: string | null
          userid: string
        }
        Update: {
          createdat?: string | null
          deviceinfo?: string | null
          id?: string
          lastactive?: string | null
          userid?: string
        }
        Relationships: []
      }
      Session: {
        Row: {
          createdAt: string
          deviceInfo: string | null
          id: string
          lastActive: string
          userId: string
        }
        Insert: {
          createdAt?: string
          deviceInfo?: string | null
          id: string
          lastActive?: string
          userId: string
        }
        Update: {
          createdAt?: string
          deviceInfo?: string | null
          id?: string
          lastActive?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_links: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          file_id: string
          id: string
          link_token: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          file_id: string
          id?: string
          link_token: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          file_id?: string
          id?: string
          link_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_links_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "cloud_files"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          country: string | null
          createdAt: string
          dateOfBirth: string | null
          email: string
          firstName: string | null
          gender: string | null
          id: string
          lastName: string | null
          profileImage: string | null
          updatedAt: string
        }
        Insert: {
          country?: string | null
          createdAt?: string
          dateOfBirth?: string | null
          email: string
          firstName?: string | null
          gender?: string | null
          id: string
          lastName?: string | null
          profileImage?: string | null
          updatedAt: string
        }
        Update: {
          country?: string | null
          createdAt?: string
          dateOfBirth?: string | null
          email?: string
          firstName?: string | null
          gender?: string | null
          id?: string
          lastName?: string | null
          profileImage?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          book_id: string
          chapter_id: string | null
          content: string
          created_at: string | null
          id: string
          position: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          position?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          position?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          font_family: string | null
          font_size: string | null
          id: string
          line_spacing: string | null
          notifications_enabled: boolean | null
          preferred_genres: string[] | null
          preferred_languages: string[] | null
          reading_mode: string | null
          text_alignment: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          font_family?: string | null
          font_size?: string | null
          id?: string
          line_spacing?: string | null
          notifications_enabled?: boolean | null
          preferred_genres?: string[] | null
          preferred_languages?: string[] | null
          reading_mode?: string | null
          text_alignment?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          font_family?: string | null
          font_size?: string | null
          id?: string
          line_spacing?: string | null
          notifications_enabled?: boolean | null
          preferred_genres?: string[] | null
          preferred_languages?: string[] | null
          reading_mode?: string | null
          text_alignment?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_webauthn_credentials: {
        Row: {
          created_at: string | null
          credential_id: string
          friendly_name: string | null
          id: string
          last_used_at: string | null
          public_key: string
          sign_count: number
          transports: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credential_id: string
          friendly_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          sign_count?: number
          transports?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credential_id?: string
          friendly_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          sign_count?: number
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      webauthn_challenges: {
        Row: {
          challenge: string
          created_at: string | null
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          challenge: string
          created_at?: string | null
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          challenge?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_course_progress: {
        Args: { user_uuid: string; course_uuid: string }
        Returns: number
      }
      get_complete_schema: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
