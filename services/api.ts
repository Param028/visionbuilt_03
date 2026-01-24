
import { supabase } from '../lib/supabase';
import { User, Service, Order, Message, ContactInfo, Offer, MarketplaceItem, AdminActivity, Task, AnalyticsData, Role, ProjectSuggestion, Payment } from '../types';
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

// Helper for DB timeouts
const withTimeout = <T>(promise: PromiseLike<T>, ms: number, fallback: T): Promise<T> => {
    const timeout = new Promise<T>((resolve) => 
        setTimeout(() => {
            console.warn(`Operation timed out after ${ms}ms`);
            resolve(fallback); 
        }, ms)
    );
    return Promise.race([Promise.resolve(promise), timeout]);
};

export class ApiService {
  private currentUser: User | null = null;

  async getCurrentUser(): Promise<User | null> {
    try {
        // Attempt to get session
        const { data: { session }, error: sessionError } = await withTimeout(
            supabase.auth.getSession(),
            10000, 
            { data: { session: null }, error: null } as any
        );

        if (sessionError) {
             // If specific error, might be corruption. Clear storage to be safe.
             if (sessionError.message.includes("JSON")) {
                 console.warn("Detected corrupted session. Clearing storage.");
                 localStorage.clear();
             }
             throw sessionError;
        }

        if (session?.user) {
          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          let { data: profile } = await withTimeout(profilePromise, 15000, { data: null } as any);

          const userCountry = profile?.country || session.user.user_metadata?.country || 'India';
          const currencyCode = CURRENCY_CONFIG[userCountry]?.code || 'INR';

          this.currentUser = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.full_name || 'User',
            role: profile?.role || 'client',
            country: userCountry,
            currency: currencyCode,
            email_verified: session.user.aud === 'authenticated',
            avatar_url: profile?.avatar_url,
            performance_score: profile?.performance_score
          };
          return this.currentUser;
        }
    } catch (err: any) {
        console.warn("getCurrentUser failed (Session invalid or network issue)", err);
        // Do not throw here. Return null to allow App to load as Guest.
        // This fixes the "Stuck on loading" issue if the DB is unreachable.
        return null;
    }

    return null;
  }

  async signInWithPassword(email: string, password: string): Promise<User> {
      let authError: any = null;
      let authData: any = null;
      let isNetworkError = false;

      try {
          const result = await Promise.race([
              supabase.auth.signInWithPassword({ email, password }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_ERROR')), 60000))
          ]) as any;
          
          authData = result.data;
          authError = result.error;
      } catch (e: any) {
          authError = e;
          if (e.message === 'TIMEOUT_ERROR' || e.message.includes('fetch') || e.message.includes('network') || e.name === 'TypeError') {
              isNetworkError = true;
          }
      }

      if (authError || !authData?.user) {
          console.error("Auth Error Detail:", authError);

          if (isNetworkError) {
                // More specific error for the user
                throw new Error("Connection failed. Check for VPNs, AdBlockers, or Firewalls that might be blocking database access.");
          }
          
          if (authError) {
              if (authError.message.includes("Invalid login credentials")) throw new Error("Incorrect email or password.");
              if (authError.message.includes("Email not confirmed")) throw new Error("Email not confirmed. Please check your inbox.");
              throw authError;
          }
          throw new Error("Login failed: Unknown error.");
      }

      if (authData.user) {
         const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();
            
         let { data: profile } = await withTimeout(profilePromise, 20000, { data: null } as any);

         const userCountry = profile?.country || authData.user.user_metadata?.country || 'India';
         const currencyCode = CURRENCY_CONFIG[userCountry]?.code || 'INR';

         const user: User = {
             id: authData.user.id,
             email: authData.user.email!,
             name: profile?.name || authData.user.user_metadata?.full_name || 'User',
             role: profile?.role || 'client',
             country: userCountry,
             currency: currencyCode,
             email_verified: true,
             avatar_url: profile?.avatar_url,
             performance_score: profile?.performance_score
         };
         
         this.currentUser = user;
         return user;
      }
      throw new Error("Login failed: Unknown error.");
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.clear(); // Ensure clean state on logout
    this.currentUser = null;
  }

  // --- STANDARD AUTH METHODS ---

  async resendConfirmationEmail(email: string): Promise<void> {
      const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin }});
      if (error) throw error;
  }

  async signInWithGithub(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin + '/auth' }});
    if (error) throw error;
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth' }});
    if (error) throw error;
  }

  async signUp(email: string, password: string, fullName: string, country: string): Promise<{ user: any, session: any }> {
      const currency = CURRENCY_CONFIG[country]?.code || 'INR';
      const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
              data: { full_name: fullName, country, currency, role: 'client' },
              emailRedirectTo: window.location.origin
          }
      });
      if (error) throw error;
      
      supabase.functions.invoke('send-email', {
          body: { type: 'welcome', email, data: { name: fullName, uniqueId: Date.now() }}
      }).catch(err => console.warn("Welcome email trigger failed:", err));

      return { user: data.user, session: data.session };
  }

  async sendPasswordResetOtp(email: string): Promise<void> {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth?mode=reset_password' });
      if (error) throw error;
  }

  async verifyRecoveryOtp(email: string, token: string): Promise<void> {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
      if (error) throw error;
  }

  async updateUserPassword(password: string): Promise<void> {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
  }

  async updateProfile(userId: string, updates: { name?: string, country?: string }): Promise<User | null> {
      const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
      if (error) throw error;
      return this.getCurrentUser(); 
  }

  // --- DATA METHODS ---

  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'status' | 'amount_paid' | 'deposit_amount' | 'deliverables'>): Promise<Order> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Unauthorized: Please log in again.");

    let paidAmount = 0;
    if (orderData.type === 'project' && orderData.total_amount > 0) {
        const receiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        try {
            await this.handleRazorpayPayment(orderData.total_amount, orderData.service_title, receiptId);
            paidAmount = orderData.total_amount;
        } catch (paymentError: any) {
            console.error("Payment failed", paymentError);
            throw paymentError;
        }
    }

    let initialStatus: Order['status'] = 'pending';
    if (orderData.type === 'project' && paidAmount >= orderData.total_amount) initialStatus = 'completed';

    const { is_custom, ...dbPayload } = orderData;
    const { data: newOrder, error: orderError } = await supabase.from('orders').insert({ ...dbPayload, status: initialStatus, amount_paid: paidAmount, deposit_amount: 0, deliverables: [] }).select().single();
    
    if (orderError) throw new Error("Order creation failed: " + orderError.message);
    
    const userEmail = this.currentUser?.email || 'Customer';
    supabase.functions.invoke('send-email', { body: { type: 'order_confirmation', email: userEmail, data: { orderId: newOrder.id, amount: orderData.total_amount, serviceTitle: orderData.service_title }}}).catch(console.error);
    supabase.functions.invoke('send-email', { body: { type: 'admin_alert', email: 'admin_override', data: { amount: orderData.total_amount, userEmail, serviceTitle: orderData.service_title }}}).catch(console.error);

    return { ...newOrder, is_custom: newOrder.type === 'service' && !newOrder.service_id };
  }

  async processOrderPayment(orderId: string, amount: number, description: string): Promise<void> {
      const receiptId = `rcpt_${Date.now()}`;
      const paymentResponse: any = await this.handleRazorpayPayment(amount, description, receiptId);
      const { data: currentOrder } = await supabase.from('orders').select('amount_paid, total_amount').eq('id', orderId).single();
      const newPaid = (currentOrder?.amount_paid || 0) + amount;
      const updates: any = { amount_paid: newPaid };
      if (newPaid < (currentOrder?.total_amount || 0)) updates.status = 'in_progress';
      await supabase.from('orders').update(updates).eq('id', orderId);
      await supabase.from('payments').insert({ order_id: orderId, amount: amount, status: 'success', razorpay_id: paymentResponse?.razorpay_payment_id || 'manual', created_at: new Date().toISOString() });
  }

  async getOrderPayments(orderId: string): Promise<Payment[]> {
      const { data } = await supabase.from('payments').select('*').eq('order_id', orderId).order('created_at', { ascending: false });
      return (data || []).map((p: any) => ({ ...p, date: p.created_at }));
  }

  async updateOrderFinancials(orderId: string, total: number, deposit: number): Promise<Order> {
      const { data, error } = await supabase.from('orders').update({ total_amount: total, deposit_amount: deposit, status: 'accepted' }).eq('id', orderId).select().single();
      if(error) throw error;
      return { ...data, is_custom: data.type === 'service' && !data.service_id };
  }

  async addDeliverable(orderId: string, fileUrl: string): Promise<Order> {
      const { data: current, error: fetchError } = await supabase.from('orders').select('deliverables').eq('id', orderId).single();
      if (fetchError) throw fetchError;

      const newList = [...(current?.deliverables || []), fileUrl];
      const { data, error } = await supabase.from('orders').update({ deliverables: newList }).eq('id', orderId).select().single();
      
      if(error) throw error;
      return { ...data, is_custom: data.type === 'service' && !data.service_id };
  }

  async deleteOrder(orderId: string): Promise<Order[]> {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw error;
    return this.getOrders();
  }

  async getOrders(userId?: string): Promise<Order[]> {
    try {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data } = await query;
        return (data || []).map((o: any) => ({ ...o, is_custom: o.type === 'service' && !o.service_id })) as Order[];
    } catch (e) {
        console.error("Failed to get orders", e);
        return [];
    }
  }

  async getOrderById(orderId: string): Promise<Order | undefined> {
     const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
     if (!data) return undefined;
     return { ...data, is_custom: data.type === 'service' && !data.service_id } as Order;
  }

  async updateOrderStatus(orderId: string, status: Order['status'], adminId?: string): Promise<Order> {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select().single();
    if(error) throw error;
    if (adminId) {
        this.logActivity(adminId, 'Updated Order Status', `Order #${orderId} -> ${status}`);
        const { data: userData } = await supabase.from('profiles').select('email').eq('id', data.user_id).single();
        if (userData?.email) supabase.functions.invoke('send-email', { body: { type: 'order_update', email: userData.email, data: { orderId, status, serviceTitle: data.service_title }}}).catch(console.error);
    }
    return { ...data, is_custom: data.type === 'service' && !data.service_id };
  }

  async updateOrderPrice(orderId: string, newPrice: number, adminId?: string): Promise<Order> {
      const { data, error } = await supabase.from('orders').update({ total_amount: newPrice }).eq('id', orderId).select().single();
      if(error) throw error;
      if (adminId) this.logActivity(adminId, 'Updated Order Price', `Order #${orderId} -> $${newPrice}`);
      return { ...data, is_custom: data.type === 'service' && !data.service_id };
  }

  async rateOrder(orderId: string, rating: number, review?: string): Promise<Order> {
      const { data, error } = await supabase.from('orders').update({ rating, review }).eq('id', orderId).select().single();
      if(error) throw error;
      return { ...data, is_custom: data.type === 'service' && !data.service_id };
  }

  async getMessages(orderId: string): Promise<Message[]> {
    const { data } = await supabase.from('messages').select('*').eq('order_id', orderId).order('created_at', { ascending: true });
    return data as Message[] || [];
  }

  async sendMessage(msg: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const { data, error } = await supabase.from('messages').insert(msg).select().single();
    if(error) throw error;
    return data;
  }

  async getServices(): Promise<Service[]> {
    try {
        const { data } = await supabase.from('services').select('*').order('base_price');
        return data || [];
    } catch (e) {
        console.error("Failed to load services", e);
        return [];
    }
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
      try {
          const { data: orders } = await supabase.from('orders').select('amount_paid, status, created_at');
          const { data: items } = await supabase.from('marketplace_items').select('views');
          const { data: devs } = await supabase.from('profiles').select('*').eq('role', 'developer');

          const totalRevenue = orders?.reduce((sum, o) => sum + (o.amount_paid || 0), 0) || 0;
          const activeProjects = orders?.filter(o => o.status === 'in_progress').length || 0;
          const salesTrend = [0, 0, 0, 0, 0, 0, 0];
          const now = new Date();
          orders?.forEach(o => {
              if (o.amount_paid > 0) {
                  const diffDays = Math.floor((now.getTime() - new Date(o.created_at).getTime()) / (86400000));
                  if (diffDays >= 0 && diffDays < 7) salesTrend[6 - diffDays] += (o.amount_paid || 0);
              }
          });

          return {
              total_revenue: totalRevenue,
              total_views: items?.reduce((sum, i) => sum + i.views, 0) || 0,
              total_orders: orders?.length || 0,
              active_projects: activeProjects,
              sales_trend: salesTrend, 
              top_developer: devs?.[0] as User || null
          };
      } catch (e) {
          console.error("Analytics load failed (Returning empty):", e);
          return {
              total_revenue: 0, total_views: 0, total_orders: 0, active_projects: 0, sales_trend: [], top_developer: null
          };
      }
  }

  async getPlatformStats(): Promise<{ totalDelivered: number, averageRating: number }> {
      const { data: orders } = await supabase.from('orders').select('rating').eq('status', 'completed');
      const rated = orders?.filter(o => o.rating > 0) || [];
      const avg = rated.length > 0 ? rated.reduce((a, b) => a + b.rating, 0) / rated.length : 5.0;
      return { totalDelivered: orders?.length || 0, averageRating: avg };
  }

  async getTeamMembers(): Promise<User[]> {
      try {
          const { data, error } = await supabase.from('profiles').select('*').in('role', ['developer', 'admin', 'super_admin']);
          if (error) throw error;
          return data as User[] || [];
      } catch (e) {
          console.error("Failed to load team members:", e);
          return [];
      }
  }

  async inviteTeamMember(name: string, email: string, role: Role, adminId: string, password?: string): Promise<User[]> {
      const redirectTo = window.location.origin + '/auth';
      const { data, error } = await supabase.functions.invoke('invite-developer', { body: { email, name, invited_by: adminId, role, redirectTo, password }});
      
      if (error || (data && data.error)) {
          throw new Error(error?.message || data?.error || "Failed to invite member");
      }
      
      this.logActivity(adminId, `Added Team Member`, `${name} (${role}) invited`);
      return this.getTeamMembers();
  }

  async removeTeamMember(id: string, adminId: string): Promise<User[]> {
      const { error } = await supabase.functions.invoke('delete-team-member', { body: { userId: id }});
      if (error) throw error;
      this.logActivity(adminId, 'Removed Team Member', `ID: ${id}`);
      return this.getTeamMembers();
  }

  async getDevelopers(): Promise<User[]> { return this.getTeamMembers().then(m => m.filter(u => u.role === 'developer')); }
  async addDeveloper(name: string, email: string, adminId: string): Promise<User[]> { return this.inviteTeamMember(name, email, 'developer', adminId); }
  async removeDeveloper(id: string, adminId: string): Promise<User[]> { return this.removeTeamMember(id, adminId); }

  async getTasks(userId?: string, role?: Role): Promise<Task[]> {
      try {
        let query = supabase.from('tasks').select('*').order('due_date', { ascending: true });
        if (role === 'developer' && userId) query = query.eq('assigned_to_id', userId);
        const { data } = await query;
        return data as Task[] || [];
      } catch (e) {
          return [];
      }
  }

  async addTask(task: Omit<Task, 'id' | 'assigned_to_name' | 'status' | 'created_by_id'>, adminId: string): Promise<Task[]> {
      const { data: assignee } = await supabase.from('profiles').select('name').eq('id', task.assigned_to_id).single();
      const { error } = await supabase.from('tasks').insert({ ...task, assigned_to_name: assignee?.name || 'Unknown', created_by_id: adminId, status: 'todo' });
      if (error) throw error;
      return this.getTasks();
  }

  async updateTaskStatus(taskId: string, status: Task['status'], _adminId: string): Promise<Task[]> {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
      if (error) throw error;
      return this.getTasks();
  }

  async getMarketplaceItems(developerId?: string): Promise<MarketplaceItem[]> {
    try {
        let query = supabase.from('marketplace_items').select('*');
        if (developerId) query = query.eq('developer_id', developerId);
        const { data } = await query;
        return data || [];
    } catch (e) {
        return [];
    }
  }

  async getMarketplaceSales(developerId: string): Promise<Order[]> {
      try {
          const { data: items } = await supabase.from('marketplace_items').select('id').eq('developer_id', developerId);
          const itemIds = items?.map(i => i.id) || [];
          if (itemIds.length === 0) return [];
          const { data: orders } = await supabase.from('orders').select('*').in('project_id', itemIds).eq('type', 'project').order('created_at', { ascending: false });
          return (orders || []).map((o: any) => ({ ...o, is_custom: o.type === 'service' && !o.service_id })) as Order[];
      } catch (e) {
          return [];
      }
  }

  async getMarketplaceItemById(id: string): Promise<MarketplaceItem | undefined> {
    const { data } = await supabase.from('marketplace_items').select('*').eq('id', id).single();
    return data;
  }

  async createMarketplaceItem(item: Omit<MarketplaceItem, 'id' | 'created_at' | 'views' | 'purchases' | 'rating' | 'review_count'>): Promise<MarketplaceItem[]> {
      const { error } = await supabase.from('marketplace_items').insert({ ...item, views: 0, purchases: 0, rating: 0, review_count: 0, is_featured: item.is_featured || false });
      if (error) throw error;
      return this.getMarketplaceItems();
  }

  async updateMarketplaceItem(id: string, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem[]> {
      const { error } = await supabase.from('marketplace_items').update(updates).eq('id', id);
      if (error) throw error;
      return this.getMarketplaceItems();
  }

  async deleteMarketplaceItem(id: string): Promise<MarketplaceItem[]> {
      const { error } = await supabase.from('marketplace_items').delete().eq('id', id);
      if (error) throw error;
      return this.getMarketplaceItems();
  }

  async getProjectSuggestions(): Promise<ProjectSuggestion[]> {
      const { data } = await supabase.from('project_suggestions').select('*').order('votes', { ascending: false });
      return data as ProjectSuggestion[] || [];
  }

  async createProjectSuggestion(suggestion: Omit<ProjectSuggestion, 'id' | 'created_at' | 'votes' | 'status'>): Promise<ProjectSuggestion[]> {
      const { error } = await supabase.from('project_suggestions').insert({ ...suggestion, votes: 0, status: 'open' });
      if (error) throw error;
      return this.getProjectSuggestions();
  }

  async voteProjectSuggestion(id: string): Promise<ProjectSuggestion[]> {
      const { data: current } = await supabase.from('project_suggestions').select('votes').eq('id', id).single();
      if(current) await supabase.from('project_suggestions').update({ votes: (current.votes || 0) + 1 }).eq('id', id);
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
      const { error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw new Error(`Upload failed: ${error.message}`);
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
  }

  private async logActivity(adminId: string, action: string, details?: string) {
      supabase.from('admin_activity').insert({ admin_id: adminId, action, details, timestamp: new Date().toISOString() }).then();
  }

  async getAdminActivity(): Promise<AdminActivity[]> {
      const { data } = await supabase.from('admin_activity').select('*').order('timestamp', { ascending: false }).limit(50);
      return data || [];
  }

  async getContactInfo(): Promise<ContactInfo> {
      return INITIAL_CONTACT_INFO;
  }

  private async handleRazorpayPayment(amount: number, description: string, receiptId: string): Promise<any> {
      const key = getEnvVar('VITE_RAZORPAY_KEY_ID') || getEnvVar('REACT_APP_RAZORPAY_KEY_ID');
      if (!key) throw new Error("Payment Configuration Missing.");

      await loadRazorpay('https://checkout.razorpay.com/v1/checkout.js');
      
      const { data: { user } } = await supabase.auth.getUser();
      const amountInINR = Math.round(amount * CURRENCY_CONFIG['India'].rate);

      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-razorpay-order', {
            body: { amount: amountInINR, currency: 'INR', receipt: receiptId }
        });
        
        if (edgeError || (edgeData && edgeData.error)) throw new Error(edgeError?.message || edgeData?.error || "Payment initialization failed");

        return new Promise((resolve, reject) => {
            const options = {
                key: key, 
                amount: amountInINR * 100, 
                currency: 'INR',
                name: 'Vision Built',
                description: description,
                order_id: edgeData.razorpayOrderId, 
                handler: function (response: any) { resolve(response); },
                prefill: { name: user?.user_metadata?.full_name, email: user?.email },
                theme: { color: '#06b6d4' },
                modal: { ondismiss: function() { reject(new Error("Payment Cancelled by user")); } }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) { reject(new Error(response.error.description || "Payment Failed")); });
            rzp.open();
        });
      } catch (err: any) {
        throw err;
      }
  }
}

export const api = new ApiService();
