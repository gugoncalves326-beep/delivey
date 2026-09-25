/**
 * Tipos do banco de dados. Escritos à mão a partir de
 * supabase/schema.sql. Numa etapa futura, gerar via
 * `supabase gen types typescript` e substituir este arquivo.
 */

export type UserRole = "adm_supremo" | "dono_da_loja" | "cliente";
export type CompanyStatus = "active" | "suspended";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "completed"
  | "cancelled";
export type CommissionType = "fixed" | "percentage";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: UserRole; full_name: string | null; created_at: string };
        Insert: { id: string; role?: UserRole; full_name?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: CompanyStatus;
          logo_url: string | null;
          banner_url: string | null;
          primary_color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: CompanyStatus;
          logo_url?: string | null;
          banner_url?: string | null;
          primary_color?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      company_users: {
        Row: { id: string; company_id: string; profile_id: string; created_at: string };
        Insert: { id?: string; company_id: string; profile_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["company_users"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          position?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          company_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          is_available?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      customers: {
        Row: {
          id: string;
          company_id: string;
          auth_user_id: string | null;
          full_name: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          auth_user_id?: string | null;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      addresses: {
        Row: {
          id: string;
          company_id: string;
          customer_id: string;
          street: string;
          number: string | null;
          neighborhood: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          complement: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          customer_id: string;
          street: string;
          number?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          complement?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          company_id: string;
          customer_id: string;
          address_id: string | null;
          status: OrderStatus;
          total: number;
          commission_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          customer_id: string;
          address_id?: string | null;
          status?: OrderStatus;
          total?: number;
          commission_amount?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          company_id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          unit_price: number;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          unit_price: number;
          quantity?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          company_id: string;
          order_id: string;
          status: PaymentStatus;
          amount: number;
          provider: string | null;
          provider_payment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          order_id: string;
          status?: PaymentStatus;
          amount: number;
          provider?: string | null;
          provider_payment_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      store_settings: {
        Row: {
          id: string;
          company_id: string;
          is_open: boolean;
          min_order_value: number;
          delivery_fee: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          is_open?: boolean;
          min_order_value?: number;
          delivery_fee?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["store_settings"]["Insert"]>;
      };
      platform_settings: {
        Row: {
          id: string;
          commission_type: CommissionType;
          commission_value: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          commission_type?: CommissionType;
          commission_value?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["platform_settings"]["Insert"]>;
      };
    };
  };
}
