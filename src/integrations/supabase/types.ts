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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
