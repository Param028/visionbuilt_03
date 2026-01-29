
export type Role = 'client' | 'developer' | 'super_admin' | 'admin';

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'mockup_ready' | 'completed' | 'cancelled';

export type OrderType = 'service' | 'project';

export type ProjectCategory = 'Websites' | 'UI/UX Design' | 'Free Projects';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  country?: string; 
  currency?: string; 
  email_verified: boolean;
  avatar_url?: string;
  performance_score?: number; // 0-100
}

export interface Service {
  id: string;
  title: string;
  description: string;
  base_price: number;
  is_enabled: boolean;
  features: string[];
  icon: string; // Lucide icon name
  allow_domain: boolean;
  domain_price: number;
  allow_business_email: boolean;
  business_email_price: number;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  category: ProjectCategory; // New restricted category
  short_description: string;
  full_description: string;
  price: number;
  tags: string[];
  features: string[];
  image_url?: string;
  preview_images?: string[]; 
  demo_url?: string;
  download_url?: string; 
  developer_id: string;
  developer_name: string;
  views: number;
  purchases: number;
  rating: number;
  review_count: number;
  created_at: string;
  free_until?: string | null;
  is_featured?: boolean;
}

export interface ProjectSuggestion {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  description: string;
  votes: number;
  status: 'open' | 'planned' | 'completed';
  created_at: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discountPercentage: number;
  validUntil?: string; 
}

export interface OrderRequirements {
  business_name: string;
  business_category: string;
  address_or_online: string;
  requirements_text: string;
  reference_links: string;
  // Custom project fields
  client_name?: string;
  client_email?: string;
  client_phone?: string; 
  // removed client_budget
}

export interface Order {
  id: string;
  user_id: string;
  type: OrderType; 
  service_id?: string;
  service_title: string; 
  project_id?: string;
  is_custom?: boolean;
  
  status: OrderStatus;
  domain_requested: boolean;
  business_email_requested: boolean;
  
  // Financials
  total_amount: number; 
  deposit_amount: number; 
  amount_paid: number; 
  currency?: string; 
  
  requirements: OrderRequirements; 
  reference_project_ids?: string[]; // IDs of selected marketplace items as reference
  
  created_at: string;
  
  deliverables?: string[]; 

  rating?: number; 
  review?: string;
  applied_offer_code?: string;
  discount_amount?: number;
}

export interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: Role;
  content: string;
  attachment_url?: string;
  created_at: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  instagram: string;
  whatsapp: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  date: string;
  razorpay_id: string;
}

export interface AdminActivity {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string; 
  details?: string; 
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to_id: string; 
  assigned_to_name: string;
  created_by_id: string; 
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
}

export interface AnalyticsData {
  total_revenue: number;
  total_views: number;
  total_orders: number;
  active_projects: number;
  sales_trend: number[]; 
  top_developer: User | null;
}
