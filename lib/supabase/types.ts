export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nisab_preference: 'gold' | 'silver' | 'both' | null
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          nisab_preference?: 'gold' | 'silver' | 'both' | null
          display_name?: string | null
          created_at?: string
        }
        Update: {
          nisab_preference?: 'gold' | 'silver' | 'both' | null
          display_name?: string | null
        }
      }
      zakat_sessions: {
        Row: {
          id: string
          user_id: string
          status: 'in_progress' | 'complete'
          current_step: number
          answers: Json
          nisab_preference: 'gold' | 'silver' | 'both' | null
          zakat_amount: number | null
          result_json: Json | null
          is_official: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'in_progress' | 'complete'
          current_step?: number
          answers?: Json
          nisab_preference?: 'gold' | 'silver' | 'both' | null
          zakat_amount?: number | null
          result_json?: Json | null
          is_official?: boolean | null
        }
        Update: {
          status?: 'in_progress' | 'complete'
          current_step?: number
          answers?: Json
          nisab_preference?: 'gold' | 'silver' | 'both' | null
          zakat_amount?: number | null
          result_json?: Json | null
          is_official?: boolean | null
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: 'active' | 'cancelled' | 'past_due'
          created_at: string
          renewed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'active' | 'cancelled' | 'past_due'
          renewed_at?: string | null
        }
        Update: {
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'active' | 'cancelled' | 'past_due'
          renewed_at?: string | null
        }
      }
    }
  }
}

export type ZakatSession = Database['public']['Tables']['zakat_sessions']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type UserProfile = Database['public']['Tables']['users']['Row']
