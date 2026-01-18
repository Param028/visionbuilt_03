
import { supabase } from '../lib/supabase';
import { User, Service, Order, Message, ContactInfo, Offer, MarketplaceItem, AdminActivity, Task, AnalyticsData, Role, ProjectSuggestion } from '../types';
import { INITIAL_CONTACT_INFO, CURRENCY_CONFIG } from '../constants';

// Helper to open Razorpay
const loadRazorpay = (src: string) => {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
        resolve(true);
        return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Safe env access helper
const getEnvVar = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // @ts-ignore
    return process.env[key];
  }
  return '';
};

export class ApiService {
  private currentUser: User | null = null;

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
          const newProfile = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              role: 'client',
              country: session.user.user_metadata?.country || 'India'
          };
          const { error } = await supabase.from('profiles').insert(newProfile);
          if (!error) {
              profile = newProfile;
          } else {
              // If insert fails (e.g. race condition), try select again
              const { data: retryProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
              profile = retryProfile || newProfile;
          }
      }

      this.currentUser = {
        id: session.user.id,
        email: session.user.email!,
        name: profile?.name || session.user.user_metadata?.full_name || 'User',
        role: profile?.role || 'client',
        country: profile?.country || 'India',
        email_verified: session.user.aud === 'authenticated',
        avatar_url: profile?.avatar_url,
        performance_score: profile?.performance_score
      };
      return this.currentUser;
    }
    return null;
  }

  async signInWithPassword(email: string, password: string): Promise<User> {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
         return this.getCurrentUser() as Promise<User>;
      }
      throw new Error("Login failed");
  }

  async signInWithGithub(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/auth'
      }
    });
    if (error) throw error;
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth'
      }
    });
    if (error) throw error;
  }

  async signUp(email: string, password: string, fullName: string, country: string): Promise<void> {
      const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
              data: {
                  full_name: fullName,
                  country: country,
                  role: 'client' 
              }
          }
      });
      if (error) throw error;
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    this.currentUser = null;
  }

  async sendPasswordResetOtp(email: string): Promise<void> {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth?mode=reset_password'
      });
      if (error) throw error;
  }

  async verifyRecoveryOtp(email: string, token: string): Promise<void> {
      const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'recovery'
      });
      if (error) throw error;
  }

  async updateUserPassword(password: string): Promise<void> {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
  }

  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'status' | 'amount_paid' | 'deposit_amount' | 'deliverables'>): Promise<Order> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: Please log in again.");

    // MODIFIED: Only process payment immediately if it's a 'project' (Marketplace Instant Buy)
    // Services now go through a Request -> Quote -> Deposit flow.
    let paidAmount = 0;
    
    if (orderData.type === 'project' && orderData.total_amount > 0) {
        const receiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        try {
            await this.handleRazorpayPayment(
                orderData.total_amount, 
                orderData.service_title, 
                receiptId
            );
            paidAmount = orderData.total_amount;
        } catch (paymentError: any) {
            console.error("Payment failed", paymentError);
            throw paymentError;
        }
    }

    // 2. INSERT ORDER INTO DB
    let initialStatus: Order['status'] = 'pending';
    
    // Instant buy projects are completed immediately
    if (orderData.type === 'project' && paidAmount >= orderData.total_amount) {
        initialStatus = 'completed';
    }

    const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
            ...orderData,
            status: initialStatus,
            amount_paid: paidAmount,
            deposit_amount: 0, // Default 0 for services until dev sets it
            deliverables: []
        })
        .select()
        .single();
    
    if (orderError) {
        console.error("CRITICAL: DB insert failed", orderError);
        throw new Error("Order creation failed. Please contact support.");
    }
        
    // 3. SEND NOTIFICATIONS (Non-blocking)
    const userEmail = user.email || 'Customer';
    
    supabase.functions.invoke('send-order-confirmation', { 
        body: { 
            orderId: newOrder.id, 
            email: userEmail,
            type: orderData.type,
            amount: orderData.total_amount
        } 
    }).then(({ data, error }) => {
        if (error) console.error("Edge Function Invocation Error:", error);
    });

    return newOrder;
  }

  // --- Financial & Deliverable Management ---

  async processOrderPayment(orderId: string, amount: number, description: string): Promise<void> {
      const receiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      await this.handleRazorpayPayment(amount, description, receiptId);
      
      // Update amount_paid in DB
      const { data: currentOrder } = await supabase.from('orders').select('amount_paid, total_amount').eq('id', orderId).single();
      const newPaid = (currentOrder?.amount_paid || 0) + amount;
      
      const updates: any = { amount_paid: newPaid };
      
      // Auto-update status based on payment
      if (newPaid >= (currentOrder?.total_amount || 0) && (currentOrder?.total_amount || 0) > 0) {
          // If fully paid, usually moves to completion or next stage depending on workflow
          // Keeping status manual for dev, but tracking money here.
      } else {
          updates.status = 'in_progress'; // Deposit paid = in progress
      }

      await supabase.from('orders').update(updates).eq('id', orderId);
  }

  async updateOrderFinancials(orderId: string, total: number, deposit: number): Promise<Order> {
      const { data, error } = await supabase
          .from('orders')
          .update({ total_amount: total, deposit_amount: deposit, status: 'accepted' }) // Move to accepted so user sees the quote
          .eq('id', orderId)
          .select()
          .single();
      if(error) throw error;
      return data;
  }

  async addDeliverable(orderId: string, fileUrl: string): Promise<Order> {
      const { data: current } = await supabase.from('orders').select('deliverables').eq('id', orderId).single();
      const currentList = current?.deliverables || [];
      const newList = [...currentList, fileUrl];
      
      const { data, error } = await supabase
          .from('orders')
          .update({ deliverables: newList })
          .eq('id', orderId)
          .select()
          .single();
      if(error) throw error;
      return data;
  }

  // ------------------------------------------

  async getOrders(userId?: string): Promise<Order[]> {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data } = await query;
    return data as Order[] || [];
  }

  async getOrderById(orderId: string): Promise<Order | undefined> {
     const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
     return data;
  }

  async updateOrderStatus(orderId: string, status: Order['status'], adminId?: string): Promise<Order> {
    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
    if(error) throw error;
    if (adminId) this.logActivity(adminId, 'Updated Order Status', `Order #${orderId} -> ${status}`);
    return data;
  }

  async updateOrderPrice(orderId: string, newPrice: number, adminId?: string): Promise<Order> {
      const { data, error } = await supabase
          .from('orders')
          .update({ total_amount: newPrice })
          .eq('id', orderId)
          .select()
          .single();
      if(error) throw error;
      if (adminId) this.logActivity(adminId, 'Updated Order Price', `Order #${orderId} -> $${newPrice}`);
      return data;
  }

  async rateOrder(orderId: string, rating: number, review?: string): Promise<Order> {
      const { data, error } = await supabase
          .from('orders')
          .update({ rating, review })
          .eq('id', orderId)
          .select()
          .single();
      if(error) throw error;
      return data;
  }

  async getMessages(orderId: string): Promise<Message[]> {
    const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
    return data as Message[] || [];
  }

  async sendMessage(msg: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const { data, error } = await supabase
        .from('messages')
        .insert(msg)
        .select()
        .single();
    if(error) throw error;
    return data;
  }

  async getServices(): Promise<Service[]> {
    const { data } = await supabase.from('services').select('*').order('base_price');
    return data || [];
  }

  async createService(service: Omit<Service, 'id'>): Promise<Service[]> {
      const { error } = await supabase.from('services').insert(service);
      if (error) throw error;
      return this.getServices();
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service[]> {
      const { error } = await supabase.from('services').update(updates).eq('id', id);
      if (error) throw error;
      return this.getServices();
  }

  async getAnalytics(): Promise<AnalyticsData> {
      const { data: orders } = await supabase.from('orders').select('total_amount, status, created_at, type');
      const { data: items } = await supabase.from('marketplace_items').select('price, purchases, views');
      const { data: devs } = await supabase.from('profiles').select('*').eq('role', 'developer');

      const paidStatuses = ['accepted', 'in_progress', 'mockup_ready', 'completed'];
      
      const paidOrders = orders?.filter(o => {
          if (o.status === 'pending' || o.status === 'cancelled') return false;
          return paidStatuses.includes(o.status);
      }) || [];

      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const totalViews = items?.reduce((sum, i) => sum + i.views, 0) || 0;
      const activeProjects = orders?.filter(o => o.status === 'in_progress').length || 0;
      const topDev = devs?.sort((a,b) => (b.performance_score || 0) - (a.performance_score || 0))[0] as User || null;

      const salesTrend = [0, 0, 0, 0, 0, 0, 0];
      const now = new Date();
      
      paidOrders.forEach(o => {
          const orderDate = new Date(o.created_at);
          const diffTime = now.getTime() - orderDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays < 7) {
              const index = 6 - diffDays;
              if (index >= 0 && index < 7) {
                  salesTrend[index] += (o.total_amount || 0);
              }
          }
      });

      return {
          total_revenue: totalRevenue,
          total_views: totalViews,
          total_orders: orders?.length || 0,
          active_projects: activeProjects,
          sales_trend: salesTrend, 
          top_developer: topDev
      };
  }

  async getPlatformStats(): Promise<{ totalDelivered: number, averageRating: number }> {
      const { data: orders } = await supabase
          .from('orders')
          .select('rating, status')
          .eq('status', 'completed');
      
      const total = orders?.length || 0;
      const ratedOrders = orders?.filter(o => o.rating && o.rating > 0) || [];
      const sum = ratedOrders.reduce((acc, curr) => acc + (curr.rating || 0), 0);
      const avg = ratedOrders.length > 0 ? (sum / ratedOrders.length) : 5.0; // Default to 5.0 if no ratings yet

      return { totalDelivered: total, averageRating: avg };
  }

  async getTeamMembers(): Promise<User[]> {
      const { data } = await supabase.from('profiles').select('*').in('role', ['developer', 'admin', 'super_admin']);
      return data as User[] || [];
  }

  async inviteTeamMember(name: string, email: string, role: Role, adminId: string): Promise<User[]> {
      let { data: { session } } = await supabase.auth.getSession();
      const now = Math.floor(Date.now() / 1000);
      const isExpired = session?.expires_at && session.expires_at < (now + 60);

      if (!session?.access_token || isExpired) {
           const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
           if (refreshError || !refreshData.session) {
               throw new Error("You must be logged in to invite team members.");
           }
           session = refreshData.session;
      }

      const redirectTo = window.location.origin + '/auth';
      
      const { data, error } = await supabase.functions.invoke('invite-developer', {
          body: { email, name, invited_by: adminId, role, redirectTo }
      });

      if (error) {
          console.error("Invite Function Error:", error);
          throw new Error(error.message || "Failed to invoke invite function.");
      }
      if (data && data.error) throw new Error(data.error);

      this.logActivity(adminId, `Added Team Member`, `${name} (${role}) invited`);
      return this.getTeamMembers();
  }

  async removeTeamMember(id: string, adminId: string): Promise<User[]> {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      this.logActivity(adminId, 'Removed Team Member', `ID: ${id}`);
      return this.getTeamMembers();
  }

  async getDevelopers(): Promise<User[]> { return this.getTeamMembers().then(m => m.filter(u => u.role === 'developer')); }
  async addDeveloper(name: string, email: string, adminId: string): Promise<User[]> { return this.inviteTeamMember(name, email, 'developer', adminId); }
  async removeDeveloper(id: string, adminId: string): Promise<User[]> { return this.removeTeamMember(id, adminId); }

  async getTasks(userId?: string, role?: Role): Promise<Task[]> {
      let query = supabase.from('tasks').select('*').order('due_date', { ascending: true });
      if (role === 'developer' && userId) query = query.eq('assigned_to_id', userId);
      const { data } = await query;
      return data as Task[] || [];
  }

  async addTask(task: Omit<Task, 'id' | 'assigned_to_name' | 'status' | 'created_by_id'>, adminId: string): Promise<Task[]> {
      const { data: assignee } = await supabase.from('profiles').select('name').eq('id', task.assigned_to_id).single();
      const { error } = await supabase.from('tasks').insert({
          ...task,
          assigned_to_name: assignee?.name || 'Unknown',
          created_by_id: adminId,
          status: 'todo'
      });
      if (error) throw error;
      return this.getTasks();
  }

  async updateTaskStatus(taskId: string, status: Task['status'], adminId: string): Promise<Task[]> {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
      if (error) throw error;
      return this.getTasks();
  }

  async getMarketplaceItems(developerId?: string): Promise<MarketplaceItem[]> {
    let query = supabase.from('marketplace_items').select('*');
    if (developerId) query = query.eq('developer_id', developerId);
    const { data } = await query;
    return data || [];
  }

  async getMarketplaceSales(developerId: string): Promise<Order[]> {
      // Get orders where project_id exists and that project is owned by developerId
      const { data: items } = await supabase.from('marketplace_items').select('id').eq('developer_id', developerId);
      const itemIds = items?.map(i => i.id) || [];
      
      if (itemIds.length === 0) return [];

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .in('project_id', itemIds)
        .eq('type', 'project')
        .order('created_at', { ascending: false });
      
      return orders || [];
  }

  async getMarketplaceItemById(id: string): Promise<MarketplaceItem | undefined> {
    const { data } = await supabase.from('marketplace_items').select('*').eq('id', id).single();
    return data;
  }

  async createMarketplaceItem(item: Omit<MarketplaceItem, 'id' | 'created_at' | 'views' | 'purchases' | 'rating' | 'review_count'>): Promise<MarketplaceItem[]> {
      const { error } = await supabase.from('marketplace_items').insert({
          ...item,
          views: 0,
          purchases: 0,
          rating: 0,
          review_count: 0
      });
      if (error) throw error;
      return this.getMarketplaceItems();
  }

  async updateMarketplaceItem(id: string, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem[]> {
      const { error } = await supabase.from('marketplace_items').update(updates).eq('id', id);
      if (error) throw error;
      return this.getMarketplaceItems();
  }

  async deleteMarketplaceItem(id: string, adminId?: string): Promise<MarketplaceItem[]> {
      const { error } = await supabase.from('marketplace_items').delete().eq('id', id);
      if (error) {
          if (error.code === '23503') {
              throw new Error("Cannot delete this item because it has existing orders. Archiving is recommended.");
          }
          throw error;
      }
      return this.getMarketplaceItems();
  }

  async getProjectSuggestions(): Promise<ProjectSuggestion[]> {
      const { data } = await supabase.from('project_suggestions').select('*').order('votes', { ascending: false });
      return data as ProjectSuggestion[] || [];
  }

  async createProjectSuggestion(suggestion: Omit<ProjectSuggestion, 'id' | 'created_at' | 'votes' | 'status'>): Promise<ProjectSuggestion[]> {
      const { error } = await supabase.from('project_suggestions').insert({
          ...suggestion,
          votes: 0,
          status: 'open'
      });
      if (error) throw error;
      return this.getProjectSuggestions();
  }

  async voteProjectSuggestion(id: string): Promise<ProjectSuggestion[]> {
      const { data: current } = await supabase.from('project_suggestions').select('votes').eq('id', id).single();
      if(current) {
          await supabase.from('project_suggestions').update({ votes: (current.votes || 0) + 1 }).eq('id', id);
      }
      return this.getProjectSuggestions();
  }

  async updateProjectSuggestionStatus(id: string, status: ProjectSuggestion['status']): Promise<ProjectSuggestion[]> {
      const { error } = await supabase.from('project_suggestions').update({ status }).eq('id', id);
      if(error) throw error;
      return this.getProjectSuggestions();
  }

  async getOffers(): Promise<Offer[]> {
    const { data } = await supabase.from('offers').select('*');
    return data || [];
  }

  async createOffer(offer: Omit<Offer, 'id'>): Promise<Offer[]> {
    const { error } = await supabase.from('offers').insert(offer);
    if (error) throw error;
    return this.getOffers();
  }

  async deleteOffer(id: string): Promise<Offer[]> {
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) throw error;
    return this.getOffers();
  }

  async validateOffer(code: string): Promise<Offer | null> {
    const { data } = await supabase.from('offers').select('*').eq('code', code).single();
    if (!data) return null;
    if (data.validUntil && new Date(data.validUntil) < new Date()) return null;
    return data;
  }

  async uploadFile(file: File, bucket: string = 'public'): Promise<string> {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

      if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`Upload failed: ${uploadError.message}. Ensure '${bucket}' bucket exists.`);
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
  }

  private async logActivity(adminId: string, action: string, details?: string) {
      supabase.from('admin_activity').insert({
          admin_id: adminId,
          action,
          details,
          timestamp: new Date().toISOString()
      }).then();
  }

  async getAdminActivity(): Promise<AdminActivity[]> {
      const { data } = await supabase.from('admin_activity').select('*').order('timestamp', { ascending: false }).limit(50);
      return data || [];
  }

  async getContactInfo(): Promise<ContactInfo> {
      return INITIAL_CONTACT_INFO;
  }

  private async handleRazorpayPayment(amount: number, description: string, receiptId: string): Promise<void> {
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          throw new Error("Payment Security Error: Transactions require a secure HTTPS connection.");
      }

      const key = getEnvVar('VITE_RAZORPAY_KEY_ID') || getEnvVar('REACT_APP_RAZORPAY_KEY_ID');
      if (!key) {
          throw new Error("Payment Configuration Missing.");
      }

      const res = await loadRazorpay('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) throw new Error('Razorpay SDK failed to load.');

      let { data: { session } } = await supabase.auth.getSession();
      const now = Math.floor(Date.now() / 1000);
      
      if (!session?.access_token || (session.expires_at && session.expires_at < (now + 60))) {
           const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
           if (refreshError || !refreshData.session) {
               throw new Error("Authentication failed.");
           }
           session = refreshData.session;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || '';
      const userName = user?.user_metadata?.full_name || '';

      const rate = CURRENCY_CONFIG['India'].rate;
      const amountInINR = Math.round(amount * rate);

      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-razorpay-order', {
            body: { amount: amountInINR, currency: 'INR', receipt: receiptId }
        });
        
        if (edgeError) {
          throw new Error("Unable to initiate payment connection.");
        }
        
        if (edgeData && edgeData.error) {
             throw new Error(edgeData.error);
        }

        const orderIdToUse = edgeData?.razorpayOrderId;

        return new Promise((resolve, reject) => {
            const options = {
                key: key, 
                amount: amountInINR * 100, 
                currency: 'INR',
                name: 'Vision Built',
                description: description,
                order_id: orderIdToUse, 
                handler: function (response: any) {
                    resolve();
                },
                prefill: {
                    name: userName,
                    email: userEmail,
                },
                theme: {
                    color: '#06b6d4'
                },
                modal: {
                    ondismiss: function() {
                        reject(new Error("Payment Cancelled by user"));
                    }
                }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                reject(new Error(response.error.description || "Payment Failed"));
            });
            rzp.open();
        });
      } catch (err: any) {
        throw err;
      }
  }
}

export const api = new ApiService();
