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
      applications: {
        Row: {
          applicant_address: string | null
          applicant_name: string | null
          applicant_type: string | null
          application_name: string | null
          attorney_id: string | null
          city: string | null
          class: string[] | null
          client_id: string
          created_at: string
          current_stage: number
          folder_number: string
          id: string
          is_complete: boolean
          last_operation_date: string | null
          logo_url: string | null
          mark_description: string | null
          service_type: string
          sub_status: string | null
          trademark_number: string | null
          trading_as: string | null
          updated_at: string
        }
        Insert: {
          applicant_address?: string | null
          applicant_name?: string | null
          applicant_type?: string | null
          application_name?: string | null
          attorney_id?: string | null
          city?: string | null
          class?: string[] | null
          client_id: string
          created_at?: string
          current_stage?: number
          folder_number: string
          id?: string
          is_complete?: boolean
          last_operation_date?: string | null
          logo_url?: string | null
          mark_description?: string | null
          service_type?: string
          sub_status?: string | null
          trademark_number?: string | null
          trading_as?: string | null
          updated_at?: string
        }
        Update: {
          applicant_address?: string | null
          applicant_name?: string | null
          applicant_type?: string | null
          application_name?: string | null
          attorney_id?: string | null
          city?: string | null
          class?: string[] | null
          client_id?: string
          created_at?: string
          current_stage?: number
          folder_number?: string
          id?: string
          is_complete?: boolean
          last_operation_date?: string | null
          logo_url?: string | null
          mark_description?: string | null
          service_type?: string
          sub_status?: string | null
          trademark_number?: string | null
          trading_as?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "attorneys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          agent_name: string
          application_id: string
          assigned_date: string
          city: string | null
          created_at: string
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_name: string
          application_id: string
          assigned_date?: string
          city?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_name?: string
          application_id?: string
          assigned_date?: string
          city?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      attorneys: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          client_code: number
          client_name: string
          client_prefix: string
          created_at: string
          id: string
          trading_as: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_code: number
          client_name: string
          client_prefix?: string
          created_at?: string
          id?: string
          trading_as?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          client_code?: number
          client_name?: string
          client_prefix?: string
          created_at?: string
          id?: string
          trading_as?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ipo_entries: {
        Row: {
          application_name: string | null
          class: string | null
          created_at: string
          entry_date: string | null
          id: string
          notes: string | null
          status: string | null
          trademark_number: string | null
          updated_at: string
        }
        Insert: {
          application_name?: string | null
          class?: string | null
          created_at?: string
          entry_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          trademark_number?: string | null
          updated_at?: string
        }
        Update: {
          application_name?: string | null
          class?: string | null
          created_at?: string
          entry_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          trademark_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          application_name: string | null
          class: string | null
          created_at: string
          id: string
          journal_date: string | null
          journal_no: string | null
          notes: string | null
          trademark_number: string | null
          updated_at: string
        }
        Insert: {
          application_name?: string | null
          class?: string | null
          created_at?: string
          id?: string
          journal_date?: string | null
          journal_no?: string | null
          notes?: string | null
          trademark_number?: string | null
          updated_at?: string
        }
        Update: {
          application_name?: string | null
          class?: string | null
          created_at?: string
          id?: string
          journal_date?: string | null
          journal_no?: string | null
          notes?: string | null
          trademark_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stage_payments: {
        Row: {
          amount: number | null
          application_id: string
          created_at: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_status: string
          stage: number
          updated_at: string
        }
        Insert: {
          amount?: number | null
          application_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_status?: string
          stage: number
          updated_at?: string
        }
        Update: {
          amount?: number | null
          application_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_status?: string
          stage?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_updates: {
        Row: {
          application_id: string
          created_at: string
          created_by: string | null
          file_url: string | null
          hearing_date: string | null
          id: string
          journal_no: string | null
          notes: string | null
          stage: number
          status: string
          tcs_tracking: string | null
          update_date: string
        }
        Insert: {
          application_id: string
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          hearing_date?: string | null
          id?: string
          journal_no?: string | null
          notes?: string | null
          stage: number
          status: string
          tcs_tracking?: string | null
          update_date?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          hearing_date?: string | null
          id?: string
          journal_no?: string | null
          notes?: string | null
          stage?: number
          status?: string
          tcs_tracking?: string | null
          update_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_updates_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
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
      generate_folder_number: { Args: { p_client_id: string }; Returns: string }
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
