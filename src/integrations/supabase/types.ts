export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          agent_name: string
          created_at: string
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          agent_name: string
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          agent_name?: string
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          agent_id: string
          assigned_date: string
          case_id: string
          completion_date: string | null
          created_at: string
          id: string
          remarks: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          assigned_date?: string
          case_id: string
          completion_date?: string | null
          created_at?: string
          id?: string
          remarks?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          assigned_date?: string
          case_id?: string
          completion_date?: string | null
          created_at?: string
          id?: string
          remarks?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_phases: {
        Row: {
          case_id: string
          completed_at: string | null
          id: string
          payment_clear: boolean
          phase_number: number
          phase_status: string
          remarks: string | null
          started_at: string
          updated_at: string
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          id?: string
          payment_clear?: boolean
          phase_number: number
          phase_status?: string
          remarks?: string | null
          started_at?: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          id?: string
          payment_clear?: boolean
          phase_number?: number
          phase_status?: string
          remarks?: string | null
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_phases_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_number: string
          case_type: Database["public"]["Enums"]["case_type"]
          client_id: string
          created_at: string
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          case_number: string
          case_type: Database["public"]["Enums"]["case_type"]
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          case_number?: string
          case_type?: Database["public"]["Enums"]["case_type"]
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          client_code: string
          client_name: string
          created_at: string
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          client_code: string
          client_name: string
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          client_code?: string
          client_name?: string
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_details: {
        Row: {
          case_id: string
          company_name: string | null
          created_at: string
          directors: string | null
          id: string
          incorporation_date: string | null
          incorporation_number: string | null
          registered_address: string | null
          remarks: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          company_name?: string | null
          created_at?: string
          directors?: string | null
          id?: string
          incorporation_date?: string | null
          incorporation_number?: string | null
          registered_address?: string | null
          remarks?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          company_name?: string | null
          created_at?: string
          directors?: string | null
          id?: string
          incorporation_date?: string | null
          incorporation_number?: string | null
          registered_address?: string | null
          remarks?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_details_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      copyright_details: {
        Row: {
          author_name: string | null
          case_id: string
          created_at: string
          id: string
          publication_date: string | null
          registration_number: string | null
          remarks: string | null
          updated_at: string
          work_title: string | null
          work_type: string | null
        }
        Insert: {
          author_name?: string | null
          case_id: string
          created_at?: string
          id?: string
          publication_date?: string | null
          registration_number?: string | null
          remarks?: string | null
          updated_at?: string
          work_title?: string | null
          work_type?: string | null
        }
        Update: {
          author_name?: string | null
          case_id?: string
          created_at?: string
          id?: string
          publication_date?: string | null
          registration_number?: string | null
          remarks?: string | null
          updated_at?: string
          work_title?: string | null
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "copyright_details_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_folders: {
        Row: {
          case_id: string | null
          client_id: string | null
          created_at: string
          folder_name: string
          folder_number: string | null
          google_drive_folder_id: string
          google_drive_link: string | null
          id: string
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          folder_name: string
          folder_number?: string | null
          google_drive_folder_id: string
          google_drive_link?: string | null
          id?: string
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          folder_name?: string
          folder_number?: string | null
          google_drive_folder_id?: string
          google_drive_link?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drive_folders_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drive_folders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ntn_details: {
        Row: {
          business_address: string | null
          business_type: string | null
          case_id: string
          created_at: string
          filing_date: string | null
          id: string
          ntn_number: string | null
          registration_name: string | null
          remarks: string | null
          updated_at: string
        }
        Insert: {
          business_address?: string | null
          business_type?: string | null
          case_id: string
          created_at?: string
          filing_date?: string | null
          id?: string
          ntn_number?: string | null
          registration_name?: string | null
          remarks?: string | null
          updated_at?: string
        }
        Update: {
          business_address?: string | null
          business_type?: string | null
          case_id?: string
          created_at?: string
          filing_date?: string | null
          id?: string
          ntn_number?: string | null
          registration_name?: string | null
          remarks?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ntn_details_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          case_id: string
          created_at: string
          id: string
          payment_clear: boolean
          payment_date: string | null
          payment_required: boolean
          phase_number: number
          remarks: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          case_id: string
          created_at?: string
          id?: string
          payment_clear?: boolean
          payment_date?: string | null
          payment_required?: boolean
          phase_number: number
          remarks?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          case_id?: string
          created_at?: string
          id?: string
          payment_clear?: boolean
          payment_date?: string | null
          payment_required?: boolean
          phase_number?: number
          remarks?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      trademarks: {
        Row: {
          applicant_address: string | null
          applicant_name: string | null
          application_address: string | null
          application_class: string | null
          application_name: string | null
          assigning_type: string | null
          case_id: string
          created_at: string
          current_phase: number
          folder_number: string | null
          google_drive_link: string | null
          id: string
          trademark_number: string | null
          trading_as: string | null
          updated_at: string
        }
        Insert: {
          applicant_address?: string | null
          applicant_name?: string | null
          application_address?: string | null
          application_class?: string | null
          application_name?: string | null
          assigning_type?: string | null
          case_id: string
          created_at?: string
          current_phase?: number
          folder_number?: string | null
          google_drive_link?: string | null
          id?: string
          trademark_number?: string | null
          trading_as?: string | null
          updated_at?: string
        }
        Update: {
          applicant_address?: string | null
          applicant_name?: string | null
          application_address?: string | null
          application_class?: string | null
          application_name?: string | null
          assigning_type?: string | null
          case_id?: string
          created_at?: string
          current_phase?: number
          folder_number?: string | null
          google_drive_link?: string | null
          id?: string
          trademark_number?: string | null
          trading_as?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trademarks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_drive_connections: {
        Row: {
          connection_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_client_code: { Args: never; Returns: string }
    }
    Enums: {
      case_type: "trademark" | "ntn" | "copyright" | "company"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      case_type: ["trademark", "ntn", "copyright", "company"],
    },
  },
} as const
