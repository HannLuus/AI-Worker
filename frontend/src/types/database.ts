export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          agent_id: string
          error_message: string | null
          finished_at: string | null
          id: string
          model_used: string | null
          output: string | null
          owner_id: string
          started_at: string
          status: Database["public"]["Enums"]["run_status"]
          tokens_used: number
        }
        Insert: {
          agent_id: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          model_used?: string | null
          output?: string | null
          owner_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["run_status"]
          tokens_used?: number
        }
        Update: {
          agent_id?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          model_used?: string | null
          output?: string | null
          owner_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["run_status"]
          tokens_used?: number
        }
        Relationships: []
      }
      agents: {
        Row: {
          created_at: string
          cron_job_id: number | null
          description: string | null
          id: string
          last_run_at: string | null
          model: string
          name: string
          next_run_at: string | null
          owner_id: string
          prompt_config: Json
          schedule_cron: string
          status: Database["public"]["Enums"]["agent_status"]
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cron_job_id?: number | null
          description?: string | null
          id?: string
          last_run_at?: string | null
          model?: string
          name: string
          next_run_at?: string | null
          owner_id: string
          prompt_config?: Json
          schedule_cron?: string
          status?: Database["public"]["Enums"]["agent_status"]
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cron_job_id?: number | null
          description?: string | null
          id?: string
          last_run_at?: string | null
          model?: string
          name?: string
          next_run_at?: string | null
          owner_id?: string
          prompt_config?: Json
          schedule_cron?: string
          status?: Database["public"]["Enums"]["agent_status"]
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          agent_run_id: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          error_message: string | null
          id: string
          owner_id: string
          recipient: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
        }
        Insert: {
          agent_run_id: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          id?: string
          owner_id: string
          recipient: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
        }
        Update: {
          agent_run_id?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          id?: string
          owner_id?: string
          recipient?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
        }
        Relationships: []
      }
      inboxes: {
        Row: {
          id: string
          owner_id: string
          address: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          address: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          address?: string
          created_at?: string
        }
        Relationships: []
      }
      received_emails: {
        Row: {
          id: string
          owner_id: string
          inbox_id: string
          from_address: string
          from_name: string | null
          subject: string
          body_text: string | null
          body_html: string | null
          received_at: string
          processed: boolean
        }
        Insert: {
          id?: string
          owner_id: string
          inbox_id: string
          from_address: string
          from_name?: string | null
          subject?: string
          body_text?: string | null
          body_html?: string | null
          received_at?: string
          processed?: boolean
        }
        Update: {
          id?: string
          owner_id?: string
          inbox_id?: string
          from_address?: string
          from_name?: string | null
          subject?: string
          body_text?: string | null
          body_html?: string | null
          received_at?: string
          processed?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          billing_cycle_start: string
          created_at: string
          email: string
          full_name: string | null
          id: string
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          token_budget_monthly: number
          tokens_used_this_month: number
          updated_at: string
        }
        Insert: {
          billing_cycle_start?: string
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          token_budget_monthly?: number
          tokens_used_this_month?: number
          updated_at?: string
        }
        Update: {
          billing_cycle_start?: string
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          token_budget_monthly?: number
          tokens_used_this_month?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_plan_min_interval_minutes: {
        Args: { tier: Database["public"]["Enums"]["plan_tier"] }
        Returns: number
      }
      get_plan_token_budget: {
        Args: { tier: Database["public"]["Enums"]["plan_tier"] }
        Returns: number
      }
    }
    Enums: {
      agent_status: "active" | "paused" | "draft" | "error"
      notification_channel: "email" | "telegram" | "webhook"
      notification_status: "pending" | "sent" | "failed"
      plan_tier: "free" | "daily" | "active" | "frequent" | "custom"
      run_status: "pending" | "running" | "success" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]

export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]
