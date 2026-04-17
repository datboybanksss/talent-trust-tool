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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_manager_profiles: {
        Row: {
          company_name: string
          created_at: string
          id: string
          phone: string | null
          registration_number: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          phone?: string | null
          registration_number?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          phone?: string | null
          registration_number?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      artist_projects: {
        Row: {
          budget: number | null
          collaborators: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          notes: string | null
          platform: string | null
          project_type: string
          release_date: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          collaborators?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          platform?: string | null
          project_type?: string
          release_date?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          collaborators?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          platform?: string | null
          project_type?: string
          release_date?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      artist_royalties: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          period_end: string | null
          period_start: string
          reference_number: string | null
          source_name: string
          source_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          period_end?: string | null
          period_start: string
          reference_number?: string | null
          source_name: string
          source_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          period_end?: string | null
          period_start?: string
          reference_number?: string | null
          source_name?: string
          source_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_contracts: {
        Row: {
          contract_type: string
          counterparty: string
          created_at: string
          currency: string
          end_date: string | null
          file_name: string | null
          file_url: string | null
          id: string
          notes: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          contract_type?: string
          counterparty: string
          created_at?: string
          currency?: string
          end_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          contract_type?: string
          counterparty?: string
          created_at?: string
          currency?: string
          end_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      athlete_endorsements: {
        Row: {
          annual_value: number | null
          brand_name: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          currency: string
          deal_type: string
          deliverables: string | null
          end_date: string | null
          id: string
          notes: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_value?: number | null
          brand_name: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          currency?: string
          deal_type?: string
          deliverables?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_value?: number | null
          brand_name?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          currency?: string
          deal_type?: string
          deliverables?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      beneficiaries: {
        Row: {
          allocation_percentage: number | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          notes: string | null
          phone: string | null
          relationship: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allocation_percentage?: number | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          notes?: string | null
          phone?: string | null
          relationship: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allocation_percentage?: number | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          notes?: string | null
          phone?: string | null
          relationship?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_invitations: {
        Row: {
          activated_at: string | null
          activated_user_id: string | null
          agent_id: string
          client_email: string
          client_name: string
          client_phone: string | null
          client_type: string
          created_at: string
          id: string
          invitation_token: string
          pre_populated_data: Json | null
          status: string
        }
        Insert: {
          activated_at?: string | null
          activated_user_id?: string | null
          agent_id: string
          client_email: string
          client_name: string
          client_phone?: string | null
          client_type: string
          created_at?: string
          id?: string
          invitation_token?: string
          pre_populated_data?: Json | null
          status?: string
        }
        Update: {
          activated_at?: string | null
          activated_user_id?: string | null
          agent_id?: string
          client_email?: string
          client_name?: string
          client_phone?: string | null
          client_type?: string
          created_at?: string
          id?: string
          invitation_token?: string
          pre_populated_data?: Json | null
          status?: string
        }
        Relationships: []
      }
      compliance_reminders: {
        Row: {
          category: string
          created_at: string
          description: string | null
          due_date: string
          due_time: string | null
          id: string
          priority: string
          recurring: boolean | null
          recurring_interval: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          due_date: string
          due_time?: string | null
          id?: string
          priority?: string
          recurring?: boolean | null
          recurring_interval?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string
          due_time?: string | null
          id?: string
          priority?: string
          recurring?: boolean | null
          recurring_interval?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          enquiry_type: string
          honeypot: string | null
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          enquiry_type: string
          honeypot?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          enquiry_type?: string
          honeypot?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      cron_job_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_name: string
          result: Json | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_name: string
          result?: Json | null
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_name?: string
          result?: Json | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          opened_at: string | null
          recipient_email: string
          reminder_id: string | null
          sent_at: string | null
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_email: string
          reminder_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_email?: string
          reminder_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "compliance_reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string
          priority: number
          relationship: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          priority?: number
          relationship: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          priority?: number
          relationship?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_integrations_waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          notes: string | null
          preferred_bank: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          preferred_bank?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          preferred_bank?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      life_file_assets: {
        Row: {
          amount: number | null
          asset_category: string
          asset_type: string
          beneficiary_allocation: string | null
          beneficiary_names: string | null
          created_at: string
          currency: string
          description: string | null
          file_name: string | null
          file_url: string | null
          id: string
          institution: string
          maturity_or_expiry_date: string | null
          notes: string | null
          policy_or_account_number: string | null
          premium_frequency: string | null
          premium_or_contribution: number | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          asset_category?: string
          asset_type: string
          beneficiary_allocation?: string | null
          beneficiary_names?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          institution: string
          maturity_or_expiry_date?: string | null
          notes?: string | null
          policy_or_account_number?: string | null
          premium_frequency?: string | null
          premium_or_contribution?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          asset_category?: string
          asset_type?: string
          beneficiary_allocation?: string | null
          beneficiary_names?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          institution?: string
          maturity_or_expiry_date?: string | null
          notes?: string | null
          policy_or_account_number?: string | null
          premium_frequency?: string | null
          premium_or_contribution?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      life_file_documents: {
        Row: {
          created_at: string
          document_type: string
          expiry_date: string | null
          file_name: string | null
          file_url: string | null
          id: string
          is_expired: boolean
          last_reviewed_at: string | null
          notes: string | null
          notify_email: string | null
          reminder_1_year: boolean
          reminder_30_days: boolean
          reminder_6_months: boolean
          reminder_60_days: boolean
          reminder_90_days: boolean
          reminder_sent_at: Json | null
          status: string
          title: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          document_type: string
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_expired?: boolean
          last_reviewed_at?: string | null
          notes?: string | null
          notify_email?: string | null
          reminder_1_year?: boolean
          reminder_30_days?: boolean
          reminder_6_months?: boolean
          reminder_60_days?: boolean
          reminder_90_days?: boolean
          reminder_sent_at?: Json | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          document_type?: string
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_expired?: boolean
          last_reviewed_at?: string | null
          notes?: string | null
          notify_email?: string | null
          reminder_1_year?: boolean
          reminder_30_days?: boolean
          reminder_6_months?: boolean
          reminder_60_days?: boolean
          reminder_90_days?: boolean
          reminder_sent_at?: Json | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      life_file_shares: {
        Row: {
          accepted_at: string | null
          access_level: string
          created_at: string
          document_type_allowlist: string[] | null
          expires_at: string | null
          id: string
          message: string | null
          owner_id: string
          relationship: string
          sections: string[] | null
          shared_with_email: string
          shared_with_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          access_level?: string
          created_at?: string
          document_type_allowlist?: string[] | null
          expires_at?: string | null
          id?: string
          message?: string | null
          owner_id: string
          relationship: string
          sections?: string[] | null
          shared_with_email: string
          shared_with_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          access_level?: string
          created_at?: string
          document_type_allowlist?: string[] | null
          expires_at?: string | null
          id?: string
          message?: string | null
          owner_id?: string
          relationship?: string
          sections?: string[] | null
          shared_with_email?: string
          shared_with_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      payslip_tax_documents: {
        Row: {
          category: string
          created_at: string
          document_type: string
          expiry_date: string | null
          file_name: string | null
          file_url: string | null
          id: string
          notes: string | null
          status: string
          tax_year: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          document_type?: string
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          status?: string
          tax_year?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          document_type?: string
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          status?: string
          tax_year?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portal_staff_access: {
        Row: {
          agent_id: string
          confidentiality_accepted_at: string | null
          created_at: string
          id: string
          role: string
          role_label: string
          sections: string[]
          staff_email: string
          staff_name: string
          staff_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          confidentiality_accepted_at?: string | null
          created_at?: string
          id?: string
          role?: string
          role_label?: string
          sections?: string[]
          staff_email: string
          staff_name: string
          staff_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          confidentiality_accepted_at?: string | null
          created_at?: string
          id?: string
          role?: string
          role_label?: string
          sections?: string[]
          staff_email?: string
          staff_name?: string
          staff_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          client_type: string | null
          created_at: string
          display_name: string | null
          id: string
          is_demo: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          client_type?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_demo?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          client_type?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_demo?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_access: {
        Row: {
          access_type: string
          created_at: string
          id: string
          owner_id: string
          relationship: string
          shared_with_email: string
          shared_with_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          access_type?: string
          created_at?: string
          id?: string
          owner_id: string
          relationship?: string
          shared_with_email: string
          shared_with_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          access_type?: string
          created_at?: string
          id?: string
          owner_id?: string
          relationship?: string
          shared_with_email?: string
          shared_with_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_meetings: {
        Row: {
          attendee_user_ids: string[]
          created_at: string
          created_by: string
          ends_at: string
          id: string
          meeting_type: string
          notes: string | null
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          attendee_user_ids?: string[]
          created_at?: string
          created_by: string
          ends_at: string
          id?: string
          meeting_type?: string
          notes?: string | null
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          attendee_user_ids?: string[]
          created_at?: string
          created_by?: string
          ends_at?: string
          id?: string
          meeting_type?: string
          notes?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_media_accounts: {
        Row: {
          account_status: string | null
          created_at: string
          email: string | null
          follower_count: number | null
          handle: string
          id: string
          notes: string | null
          platform: string
          recovery_email: string | null
          recovery_phone: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          account_status?: string | null
          created_at?: string
          email?: string | null
          follower_count?: number | null
          handle: string
          id?: string
          notes?: string | null
          platform: string
          recovery_email?: string | null
          recovery_phone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          account_status?: string | null
          created_at?: string
          email?: string | null
          follower_count?: number | null
          handle?: string
          id?: string
          notes?: string | null
          platform?: string
          recovery_email?: string | null
          recovery_phone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      system_announcements: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          is_active: boolean
          message: string
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          id: string
          started_at: string
          status: string
          tier_name: string
          tier_type: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          started_at?: string
          status?: string
          tier_name?: string
          tier_type?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          started_at?: string
          status?: string
          tier_name?: string
          tier_type?: string
          trial_ends_at?: string | null
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
