import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage, 
    autoRefreshToken: true,
  },
});

// Types for our database tables
export interface Customer {
  id: string
  name: string | null
  mobile_no: string | null
  whatsapp_no: string | null
  address: string | null
  id_proof: string | null
  photo_url: string | null
  audio_url: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Loan {
  id: string
  loan_no: string | null
  customer_id: string | null
  date: string | null
  amount: number | null
  interest_rate: number | null
  validity_months: number | null
  interest_taken: boolean | null
  payment_method: string | null
  processing_fee: number | null
  estimated_amount: number | null
  status: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Jewel {
  id: string | null
  loan_id: string | null
  type: string | null
  quality: string | null
  description: string | null
  pieces: number | null
  weight: number | null
  stone_weight: number | null
  net_weight: number | null
  faults: string | null
  image_url: string | null
  created_at: string | null
  updated_at: string | null
}

export interface PledgeData {
  customer: Customer
  loan: Loan
  jewels: Jewel[]
}

export interface Calculation {
  id: string
  loan_id: string
  end_date: string
  additional_reduction_amount: number | null
  calculation_method: string
  total_months: string
  final_interest_rate: string
  total_interest: number
  interest_reduction: number | null
  total_amount: number
  created_at: string | null
}

//newly added interfaces for new tables


export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string | null
          mobile_no: string | null
          whatsapp_no: string | null
          address: string | null
          id_proof: string | null
          photo_url: string | null
          audio_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          mobile_no?: string | null
          whatsapp_no?: string | null
          address?: string | null
          id_proof?: string | null
          photo_url?: string | null
          audio_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          mobile_no?: string | null
          whatsapp_no?: string | null
          address?: string | null
          id_proof?: string | null
          photo_url?: string | null
          audio_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      loans: {
        Row: {
          id: string
          loan_no: string | null
          customer_id: string | null
          date: string | null
          amount: number | null
          interest_rate: number | null
          validity_months: number | null
          interest_taken: boolean | null
          payment_method: string | null
          processing_fee: number | null
          estimated_amount: number | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          loan_no?: string | null
          customer_id?: string | null
          date?: string | null
          amount?: number | null
          interest_rate?: number | null
          validity_months?: number | null
          interest_taken?: boolean | null
          payment_method?: string | null
          processing_fee?: number | null
          estimated_amount?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          loan_no?: string | null
          customer_id?: string | null
          date?: string | null
          amount?: number | null
          interest_rate?: number | null
          validity_months?: number | null
          interest_taken?: boolean | null
          payment_method?: string | null
          processing_fee?: number | null
          estimated_amount?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      jewels: {
        Row: {
          id: string | null
          loan_id: string | null
          type: string | null
          quality: string | null
          description: string | null
          pieces: number | null
          weight: number | null
          stone_weight: number | null
          net_weight: number | null
          faults: string | null
          image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          loan_id?: string | null
          type?: string | null
          quality?: string | null
          description?: string | null
          pieces?: number | null
          weight?: number | null
          stone_weight?: number | null
          net_weight?: number | null
          faults?: string | null
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          loan_id?: string | null
          type?: string | null
          quality?: string | null
          description?: string | null
          pieces?: number | null
          weight?: number | null
          stone_weight?: number | null
          net_weight?: number | null
          faults?: string | null
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}


//Re pledge

// export interface Loan {
//   id: string;
//   loan_no: string;
//   customer_id: string;
//   date: string;
//   amount: number;
//   interest_rate: number;
//   validity_months: number;
//   interest_taken: boolean;
//   payment_method: string;
//   processing_fee: number;
//   estimated_amount: number;
//   status: string;
//   created_at: string;
//   updated_at: string;
//   duedate: string;
//   metal_rate: number;
// }

// export interface Jewel {
//   id: string;
//   loan_id: string;
//   type: string;
//   quality: string;
//   description: string;
//   pieces: number;
//   weight: number;
//   stone_weight: number;
//   net_weight: number;
//   faults: string;
//   image_url: string;
//   created_at: string;
//   updated_at: string;
// }

export interface RepledgeEntry {
  id: string;
  loan_id: string;
  loan_no: string;
  re_no: string;
  net_weight: number;
  gross_weight: number;
  stone_weight: number;
  amount: number;
  processing_fee: number;
  bank_id: string;  // <-- use bank_id instead of bank_name
  interest_percent: number;
  validity_period: number;
  after_interest_percent: number;
  payment_method: string;
  due_date: string;
  created_at: string;
  updated_at: string;

  // Optional: if you want to show bank details directly after join
  bank?: {
    id: string;
    name: string;
  };
}


