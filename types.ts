

export type Role = 'client' | 'developer' | 'super_admin' | 'admin';

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'mockup_ready' | 'completed' | 'cancelled';

export type OrderType = 'service' | 'project';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  country?: string; // New field
  currency?: string; // New field
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
}

export interface MarketplaceItem {
  id: string;
  title: string;
  short_description: string;
  full_description: string;
  price: number;
  tags: string[];
  features: string[];
  image_url?: string;
  preview_images?: string[]; // New field for gallery
  demo_url?: string;
  download_url?: string; // Only available after purchase
  developer_id: string;
  developer_name: string;
  views: number;
  purchases: number;
  rating: number;
  review_count: number;
  created_at: string;
  free_until?: string | null; // ISO Date string for limited time free availability
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
  validUntil?: string; // ISO date string YYYY-MM-DD
}

export interface OrderRequirements {
  business_name: string;
  business_category: string;
  address_or_online: string;
  requirements_text: string;
  reference_links: string;
}

export interface Order {
  id: string;
  user_id: string;
  type: OrderType; // New field to distinguish
  // For Services
  service_id?: string;
  service_title: string; // Used as display title for both services and projects
  // For Projects
  project_id?: string;
  
  status: OrderStatus;
  domain_requested: boolean;
  business_email_requested: boolean;
  total_amount: number;
  currency?: string; // New field
  requirements: OrderRequirements; // Can be empty/partial for projects
  created_at: string;
  
  rating?: number; // 1-5
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
  action: string; // e.g., "Updated Order Status", "Disabled Service"
  details?: string; // e.g., "Order #o1 to completed", "Service ID s2"
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to_id: string; // Developer ID
  assigned_to_name: string;
  created_by_id: string; // Super Admin ID
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
}

export interface AnalyticsData {
  total_revenue: number;
  total_views: number;
  total_orders: number;
  active_projects: number;
  sales_trend: number[]; // Simple array for graph
  top_developer: User | null;
}