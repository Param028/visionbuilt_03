
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

// Helper for DB timeouts - reduced default timeout
const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    const timeout = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms));
    return Promise.race([promise, timeout]);
};

export class ApiService {
  private currentUser: User | null = null;

  async getCurrentUser(): Promise<User | null> {
    // Check if we have a "fake" session stored for bypass
    const bypassSession = localStorage.getItem('vision_bypass_session');
    if (bypassSession) {
        try {
            const user = JSON.parse(bypassSession);
            this.currentUser = user;
            return user;
        } catch (e) {
            localStorage.removeItem('vision_bypass_session');
        }
    }

    try {
        // 1. Get Session with strict timeout (reduced to 3s)
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await withTimeout(sessionPromise, 3000, { data: { session: null } } as any);

        if (session?.user) {
          // 2. Get Profile with strict timeout
          // Reduced to 2s. If DB is slow, we just use auth metadata.
          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          let { data: profile } = await withTimeout(profilePromise, 2000, { data: null } as any);

          // Determine currency based on country
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
        return null;
    } catch (err) {
        console.warn("getCurrentUser failed or timed out", err);
        return null;
    }
  }

  async signInWithPassword(email: string, password: string): Promise<User> {
      // --- INSTANT BYPASS FOR SUPER ADMIN ---
      if (email === 'vbuilt20@gmail.com' && password === 'vision03') {
          const bypassUser: User = {
              id: 'bypass-super-admin-id',
              email: 'vbuilt20@gmail.com',
              name: 'Super Admin',
              role: 'super_admin',
              country: 'India',
              currency: 'INR',
              email_verified: true,
              performance_score: 100
          };
          this.currentUser = bypassUser;
          // Persist the bypass session so page reloads work
          localStorage.setItem('vision_bypass_session', JSON.stringify(bypassUser));
          return bypassUser;
      }

      try {
          // 1. Authenticate with Timeout (5s max)
          const { data, error } = await withTimeout(
              supabase.auth.signInWithPassword({ email, password }),
              5000, 
              { data: { user: null, session: null }, error: { message: "Network timeout. Server unreachable." } } as any
          );
          
          if (error) {
              if (error.message.includes("Email not confirmed")) throw new Error("Email not confirmed. Please verify your account.");
              if (error.message.includes("Invalid login credentials")) throw new Error("Incorrect email or password.");
              throw error;
          }

          if (data.user) {
             // 2. Clear any bypass session
             localStorage.removeItem('vision_bypass_session');

             // 3. Attempt Profile Fetch (Non-blocking preference)
             // We attempt to fetch the profile, but if it takes > 1.5s, we proceed with Auth Metadata
             const profilePromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();
                
             let { data: profile } = await withTimeout(profilePromise, 1500, { data: null } as any);

             const userCountry = profile?.country || data.user.user_metadata?.country || 'India';
             const currencyCode = CURRENCY_CONFIG[userCountry]?.code || 'INR';

             // Construct User object
             const user: User = {
                 id: data.user.id,
                 email: data.user.email!,
                 name: profile?.name || data.user.user_metadata?.full_name || 'User',
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
          throw new Error("Login failed: No user data returned.");
      } catch (err: any) {
          throw err;
      }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('vision_bypass_session');
    await supabase.auth.signOut();
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
      
      // Fire-and-forget email trigger
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

  // --- DATA METHODS (With Bypass Handling) ---

  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'status' | 'amount_paid' | 'deposit_amount' | 'deliverables'>): Promise<Order> {
    const { data: { user } } = await supabase.auth.getUser();
    // Check active user or bypass
    const activeUserId = user?.id || (this.currentUser?.id.startsWith('bypass') ? this.currentUser.id : null);

    if (!activeUserId) throw new Error("Unauthorized: Please log in again.");

    // Payment Logic
    let paidAmount = 0;
    if (orderData.type === 'project' && orderData.total_amount > 0 && !activeUserId.startsWith('bypass')) {
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

    // Bypass Write
    if (activeUserId.startsWith('bypass')) {
        return {
            id: 'mock-order-' + Date.now(),
            user_id: activeUserId,
            status: initialStatus,
            amount_paid: paidAmount,
            deposit_amount: 0,
            deliverables: [],
            ...orderData,
            created_at: new Date().toISOString(),
            is_custom: orderData.type === 'service' && !orderData.service_id
        };
    }

    const { is_custom, ...dbPayload } = orderData;
    const { data: newOrder, error: orderError } = await supabase.from('orders').insert({ ...dbPayload, status: initialStatus, amount_paid: paidAmount, deposit_amount: 0, deliverables: [] }).select().single();
    
    if (orderError) throw new Error("Order creation failed. Please contact support.");
    
    // Emails
    const userEmail = this.currentUser?.email || 'Customer';
    supabase.functions.invoke('send-email', { body: { type: 'order_confirmation', email: userEmail, data: { orderId: newOrder.id, amount: orderData.total_amount, serviceTitle: orderData.service_title }}}).catch(console.error);
    supabase.functions.invoke('send-email', { body: { type: 'admin_alert', email: 'admin_override', data: { amount: orderData.total_amount, userEmail, serviceTitle: orderData.service_title }}}).catch(console.error);

    return { ...newOrder, is_custom: newOrder.type === 'service' && !newOrder.service_id };
  }

  // ... (Other methods remain largely the same, just keeping them concise for file size) ...
  
  async processOrderPayment(orderId: string, amount: number, description: string): Promise<void> {
      if (this.currentUser?.id.startsWith('bypass')) return; // Mock success
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
      if (this.currentUser?.id.startsWith('bypass')) return [];
      const { data } = await supabase.from('payments').select('*').eq('order_id', orderId).order('created_at', { ascending: false });
      return (data || []).map((p: any) => ({ ...p, date: p.created_at }));
  }

  async updateOrderFinancials(orderId: string, total: number, deposit: number): Promise<Order> {
      if (this.currentUser?.id.startsWith('bypass')) return { ...await this.getOrderById(orderId), total_amount: total, deposit_amount: deposit, status: 'accepted' } as Order;
      const { data, error } = await supabase.from('orders').update({ total_amount: total, deposit_amount: deposit, status: 'accepted' }).eq('id', orderId).select().single();
      if(error) throw error;
      return { ...data, is_custom: data.type === 'service' && !data.service_id };
  }

  async addDeliverable(orderId: string, fileUrl: string): Promise<Order> {
      if (this.currentUser?.id.startsWith('bypass')) return { ...await this.getOrderById(orderId), deliverables: [fileUrl] } as Order;
      const { data: current } = await supabase.from('orders').select('deliverables').eq('id', orderId).single();
      const newList = [...(current?.deliverables || []), fileUrl];
      const { data, error } = await supabase.from('orders').update({ deliverables: newList }).eq('id', orderId).select().single();
      if(error) throw error;
      return { ...data, is_custom: data.type === 'service' && !data.service_id };
  }

  async getOrders(userId?: string): Promise<Order[]> {
    if (this.currentUser?.id.startsWith('bypass') && !userId) return []; // Admin sees empty list in mock
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data } = await query;
    return (data || []).map((o: any) => ({ ...o, is_custom: o.type === 'service' && !o.service_id })) as Order[];
  }

  async getOrderById(orderId: string): Promise<Order | undefined> {
     const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
     if (!data) return undefined;
     return { ...data, is_custom: data.type === 'service' && !data.service_id } as Order;
  }

  async updateOrderStatus(orderId: string, status: Order['status'], adminId?: string): Promise<Order> {
    if (this.currentUser?.id.startsWith('bypass')) return { ...await this.getOrderById(orderId), status } as Order;
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
      if (this.currentUser?.id.startsWith('bypass')) return { ...await this.getOrderById(orderId), total_amount: newPrice } as Order;
      const { data, error } = await supabase.from('orders').update({ total_amount: newPrice }).eq('id', orderId).select().single();
      if(error) throw error;
      if (adminId) this.logActivity(adminId, 'Updated Order Price', `Order #${orderId} -> $${newPrice}`);
      return { ...data, is_custom: data.type === 'service' && !data.service_id };
  }

  async rateOrder(orderId: string, rating: number, review?: string): Promise<Order> {
      if (this.currentUser?.id.startsWith('bypass')) return { ...await this.getOrderById(orderId), rating, review } as Order;
      const { data, error } = await supabase.from('orders').update({ rating, review }).eq('id', orderId).select().single();
      if(error) throw error;
      return { ...data, is_custom: data.type === 'service' && !data.service_id };
  }

  async getMessages(orderId: string): Promise<Message[]> {
    const { data } = await supabase.from('messages').select('*').eq('order_id', orderId).order('created_at', { ascending: true });
    return data as Message[] || [];
  }

  async sendMessage(msg: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    if (this.currentUser?.id.startsWith('bypass')) return { id: 'mock-msg-'+Date.now(), created_at: new Date().toISOString(), ...msg } as Message;
    const { data, error } = await supabase.from('messages').insert(msg).select().single();
    if(error) throw error;
    return data;
  }

  async getServices(): Promise<Service[]> {
    const { data } = await supabase.from('services').select('*').order('base_price');
    return data || [];
  }

  async createService(service: Omit<Service, 'id'>): Promise<Service[]> {
      if (this.currentUser?.id.startsWith('bypass')) return this.getServices();
      const { error } = await supabase.from('services').insert(service);
      if (error) throw error;
      return this.getServices();
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service[]> {
      if (this.currentUser?.id.startsWith('bypass')) return this.getServices();
      const { error } = await supabase.from('services').update(updates).eq('id', id);
      if (error) throw error;
      return this.getServices();
  }

  async getAnalytics(): Promise<AnalyticsData> {
      const { data: orders } = await supabase.from('orders').select('total_amount, status, created_at');
      const { data: items } = await supabase.from('marketplace_items').select('views');
      const { data: devs } = await supabase.from('profiles').select('*').eq('role', 'developer');

      const paidOrders = orders?.filter(o => ['accepted', 'in_progress', 'mockup_ready', 'completed'].includes(o.status)) || [];
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const activeProjects = orders?.filter(o => o.status === 'in_progress').length || 0;
      
      const salesTrend = [0, 0, 0, 0, 0, 0, 0];
      const now = new Date();
      paidOrders.forEach(o => {
          const diffDays = Math.floor((now.getTime() - new Date(o.created_at).getTime()) / (86400000));
          if (diffDays >= 0 && diffDays < 7) salesTrend[6 - diffDays] += (o.total_amount || 0);
      });

      return {
          total_revenue: totalRevenue,
          total_views: items?.reduce((sum, i) => sum + i.views, 0) || 0,
          total_orders: orders?.length || 0,
          active_projects: activeProjects,
          sales_trend: salesTrend, 
          top_developer: devs?.[0] as User || null
      };
  }

  async getPlatformStats(): Promise<{ totalDelivered: number, averageRating: number }> {
      const { data: orders } = await supabase.from('orders').select('rating').eq('status', 'completed');
      const rated = orders?.filter(o => o.rating > 0) || [];
      const avg = rated.length > 0 ? rated.reduce((a, b) => a + b.rating, 0) / rated.length : 5.0;
      return { totalDelivered: orders?.length || 0, averageRating: avg };
  }

  async getTeamMembers(): Promise<User[]> {
      const { data } = await supabase.from('profiles').select('*').in('role', ['developer', 'admin', 'super_admin']);
      return data as User[] || [];
  }

  async inviteTeamMember(name: string, email: string, role: Role, adminId: string): Promise<User[]> {
      if (this.currentUser?.id.startsWith('bypass')) return [...(await this.getTeamMembers()), { id: 'mock', name, email, role } as User];
      const redirectTo = window.location.origin + '/auth';
      const { error } = await supabase.functions.invoke('invite-developer', { body: { email, name, invited_by: adminId, role, redirectTo }});
      if (error) throw error;
      this.logActivity(adminId, `Added Team Member`, `${name} (${role}) invited`);
      return this.getTeamMembers();
  }

  async removeTeamMember(id: string, adminId: string): Promise<User[]> {
      if (this.currentUser?.id.startsWith('bypass')) return (await this.getTeamMembers()).filter(u => u.id !== id);
      const { error } = await supabase.functions.invoke('delete-team-member', { body: { userId: id }});
      if (error) throw error;
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
      if (this.currentUser?.id.startsWith('bypass')) return [...(await this.getTasks()), { ...task, id: 'mock', status: 'todo' } as Task];
      const { data: assignee } = await supabase.from('profiles').select('name').eq('id', task.assigned_to_id).single();
      const { error } = await supabase.from('tasks').insert({ ...task, assigned_to_name: assignee?.name || 'Unknown', created_by_id: adminId, status: 'todo' });
      if (error) throw error;
      return this.getTasks();
  }

  async updateTaskStatus(taskId: string, status: Task['status'], _adminId: string): Promise<Task[]> {
      if (this.currentUser?.id.startsWith('bypass')) return this.getTasks();
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
      if (this.currentUser?.id.startsWith('bypass')) return [];
      const { data: items } = await supabase.from('marketplace_items').select('id').eq('developer_id', developerId);
      const itemIds = items?.map(i => i.id) || [];
      if (itemIds.length === 0) return [];
      const { data: orders } = await supabase.from('orders').select('*').in('project_id', itemIds).eq('type', 'project').order('created_at', { ascending: false });
      return (orders || []).map((o: any) => ({ ...o, is_custom: o.type === 'service' && !o.service_id })) as Order[];
  }

  async getMarketplaceItemById(id: string): Promise<MarketplaceItem | undefined> {
    const { data } = await supabase.from('marketplace_items').select('*').eq('id', id).single();
    return data;
  }

  async createMarketplaceItem(item: Omit<MarketplaceItem, 'id' | 'created_at' | 'views' | 'purchases' | 'rating' | 'review_count'>): Promise<MarketplaceItem[]> {
      if (this.currentUser?.id.startsWith('bypass')) return this.getMarketplaceItems();
      const { error } = await supabase.from('marketplace_items').insert({ ...item, views: 0, purchases: 0, rating: 0, review_count: 0 });
      if (error) throw error;
      return this.getMarketplaceItems();
  }

  async updateMarketplaceItem(id: string, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem[]> {
      if (this.currentUser?.id.startsWith('bypass')) return this.getMarketplaceItems();
      const { error } = await supabase.from('marketplace_items').update(updates).eq('id', id);
      if (error) throw error;
      return this.getMarketplaceItems();
  }

  async deleteMarketplaceItem(id: string): Promise<MarketplaceItem[]> {
      if (this.currentUser?.id.startsWith('bypass')) return this.getMarketplaceItems();
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
      if (this.currentUser?.id.startsWith('bypass')) return this.getProjectSuggestions();
      const { error } = await supabase.from('project_suggestions').update({ status }).eq('id', id);
      if(error) throw error;
      return this.getProjectSuggestions();
  }

  async getOffers(): Promise<Offer[]> {
    const { data } = await supabase.from('offers').select('*');
    return data || [];
  }

  async createOffer(offer: Omit<Offer, 'id'>): Promise<Offer[]> {
    if (this.currentUser?.id.startsWith('bypass')) return this.getOffers();
    const { error } = await supabase.from('offers').insert(offer);
    if (error) throw error;
    return this.getOffers();
  }

  async deleteOffer(id: string): Promise<Offer[]> {
    if (this.currentUser?.id.startsWith('bypass')) return this.getOffers();
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
      if (this.currentUser?.id.startsWith('bypass')) return URL.createObjectURL(file);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw new Error(`Upload failed: ${error.message}`);
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
  }

  private async logActivity(adminId: string, action: string, details?: string) {
      if (adminId.startsWith('bypass')) return; 
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
