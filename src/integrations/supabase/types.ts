export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      case_outcomes: {
        Row: {
          amount_recovered: number | null
          case_id: string
          closed_at: string
          id: string
          recovered: boolean
          recovery_days: number | null
        }
        Insert: {
          amount_recovered?: number | null
          case_id: string
          closed_at?: string
          id?: string
          recovered?: boolean
          recovery_days?: number | null
        }
        Update: {
          amount_recovered?: number | null
          case_id?: string
          closed_at?: string
          id?: string
          recovered?: boolean
          recovery_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "case_outcomes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          amount: number
          assigned_dca_id: string | null
          created_at: string
          days_overdue: number
          debtor_email: string | null
          debtor_name: string
          debtor_phone: string | null
          id: string
          priority: string | null
          reference_number: string
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          assigned_dca_id?: string | null
          created_at?: string
          days_overdue?: number
          debtor_email?: string | null
          debtor_name: string
          debtor_phone?: string | null
          id?: string
          priority?: string | null
          reference_number?: string
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          assigned_dca_id?: string | null
          created_at?: string
          days_overdue?: number
          debtor_email?: string | null
          debtor_name?: string
          debtor_phone?: string | null
          id?: string
          priority?: string | null
          reference_number?: string
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_dca_id_fkey"
            columns: ["assigned_dca_id"]
            isOneToOne: false
            referencedRelation: "dcas"
            referencedColumns: ["id"]
          },
        ]
      }
      dca_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"]
          case_id: string
          completed_at: string | null
          created_at: string
          dca_id: string
          id: string
          notes: string | null
          sla_breached: boolean | null
          sla_deadline: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type"]
          case_id: string
          completed_at?: string | null
          created_at?: string
          dca_id: string
          id?: string
          notes?: string | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"]
          case_id?: string
          completed_at?: string | null
          created_at?: string
          dca_id?: string
          id?: string
          notes?: string | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dca_actions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dca_actions_dca_id_fkey"
            columns: ["dca_id"]
            isOneToOne: false
            referencedRelation: "dcas"
            referencedColumns: ["id"]
          },
        ]
      }
      dcas: {
        Row: {
          created_at: string
          escalation_count: number | null
          id: string
          is_active: boolean | null
          name: string
          recovery_success_rate: number | null
          sla_compliance_rate: number | null
          total_cases_handled: number | null
          trust_score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          escalation_count?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          recovery_success_rate?: number | null
          sla_compliance_rate?: number | null
          total_cases_handled?: number | null
          trust_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          escalation_count?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          recovery_success_rate?: number | null
          sla_compliance_rate?: number | null
          total_cases_handled?: number | null
          trust_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      ml_predictions: {
        Row: {
          case_id: string
          created_at: string
          id: string
          model_version: string | null
          recovery_probability: number
          risk_score: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          model_version?: string | null
          recovery_probability: number
          risk_score?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          model_version?: string | null
          recovery_probability?: number
          risk_score?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_predictions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_metrics: {
        Row: {
          avg_dca_trust_score: number | null
          resolved_cases: number | null
          total_cases: number | null
          total_debt_amount: number | null
          total_recovered: number | null
          total_sla_breaches: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      action_type:
        | "call"
        | "email"
        | "sms"
        | "letter"
        | "payment_plan"
        | "escalation"
        | "legal_notice"
      app_role: "admin" | "enterprise_user" | "dca_user"
      case_status:
        | "new"
        | "assigned"
        | "in_progress"
        | "escalated"
        | "resolved"
        | "closed"
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
      action_type: [
        "call",
        "email",
        "sms",
        "letter",
        "payment_plan",
        "escalation",
        "legal_notice",
      ],
      app_role: ["admin", "enterprise_user", "dca_user"],
      case_status: [
        "new",
        "assigned",
        "in_progress",
        "escalated",
        "resolved",
        "closed",
      ],
    },
  },
} as const
