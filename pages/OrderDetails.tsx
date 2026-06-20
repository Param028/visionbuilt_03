import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Paperclip, Download, ChevronLeft, FileText, CheckCircle2, Star, Box, ExternalLink, X, Loader2, MessageSquarePlus, Receipt, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Order, Message, User, MarketplaceItem, Payment } from '../types';
import { Badge } from '../components/ui/Components';
import { formatPrice } from '../constants';
import { useToast } from '../components/ui/Toast';

const OrderDetails: React.FC<{ user: User }> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const orderIdParam = id;
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [_project, setProject] = useState<MarketplaceItem | null>(null);
  
  // File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Rating State
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Payment Processing State
  const [isPaying, setIsPaying] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const fetchOrderData = () => {
      if (orderIdParam) {
          api.getOrderById(orderIdParam).then(o => {
              setOrder(o || null);
              if (o?.rating) setRating(o.rating);
              if (o?.review) setReview(o.review);
              
              if (o?.type === 'project' && o.project_id) {
                  api.getMarketplaceItemById(o.project_id).then(p => setProject(p || null));
              }
          });
          api.getMessages(orderIdParam).then(setMessages);
          api.getOrderPayments(orderIdParam).then(setPayments);
      }
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderIdParam]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) {
              toast.error("File size too large (max 5MB)");
              return;
          }
          setSelectedFile(file);
          if (file.type.startsWith('image/')) {
              setFilePreview(URL.createObjectURL(file));
          }
      }
  };

  const removeFile = () => {
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !orderIdParam) return;
    setSending(true);

    try {
        let attachmentUrl = undefined;
        if (selectedFile) {
            attachmentUrl = await api.uploadFile(selectedFile);
        }

        const msg = await api.sendMessage({
            order_id: orderIdParam,
            sender_id: user.id,
            sender_name: user.name,
            sender_role: user.role,
            content: newMessage || (selectedFile?.type.startsWith('image/') ? '📷 Shared a photo' : '📎 Shared a file'),
            attachment_url: attachmentUrl
        });

        setMessages([...messages, msg]);
        setNewMessage('');
        removeFile();
    } catch (err: any) {
        toast.error("Failed to send message: " + err.message);
    } finally {
        setSending(false);
    }
  };

  const handleSubmitRating = async () => {
      if(!order || rating === 0) return;
      setIsRatingSubmitting(true);
      const updatedOrder = await api.rateOrder(order.id, rating, review);
      setOrder(updatedOrder);
      setIsRatingSubmitting(false);
  };

  const handlePayment = async (amount: number, label: string) => {
      if (!order) return;
      setIsPaying(true);
      try {
          await api.processOrderPayment(order.id, amount, `${label} for Order #${order.id}`);
          toast.success("Payment Successful!");
          fetchOrderData(); // Refresh to update paid status
      } catch (e: any) {
          if (!e.message.includes("Cancelled")) {
              toast.error("Payment Failed: " + e.message);
          }
      } finally {
          setIsPaying(false);
      }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'mockup_ready': return 'warning';
      case 'accepted': return 'info';
      default: return 'default';
    }
  };

  if (!order) return <div className="p-20 text-center text-foreground/30 font-satoshi">Loading Order Profile...</div>;

  const totalAmount = order.total_amount || 0;
  const amountPaid = order.amount_paid || 0;
  const depositAmount = order.deposit_amount || 0;
  const remainingBalance = Math.max(0, totalAmount - amountPaid);
  
  const isPendingQuote = order.status === 'pending';
  const showDepositPay = !isPendingQuote && totalAmount > 0 && amountPaid < depositAmount;
  const showBalancePay = !isPendingQuote && !showDepositPay && totalAmount > 0 && amountPaid < totalAmount;
  const isFullyPaid = totalAmount > 0 && amountPaid >= totalAmount;

  return (
    <div className="min-h-screen relative overflow-hidden py-10">
      {/* Ambient backgrounds */}
      <div
        className="absolute top-0 right-1/4 pointer-events-none"
        aria-hidden="true"
        style={{
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,143,161,0.02) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="container-vb relative z-10">
        <Link 
          to={user.role === 'admin' || user.role === 'super_admin' || user.role === 'developer' ? '/admin' : '/dashboard'} 
          className="inline-flex items-center text-foreground/40 hover:text-foreground mb-6 transition-colors font-satoshi text-xs uppercase tracking-widest gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* 2-Column Split: Info / Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Info/Details Panel */}
          <div className="lg:col-span-4 space-y-5">
            <div className="glass-card p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground mb-1">
                    Order #{order.id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-xs text-foreground/45 font-satoshi">
                    Received: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={getStatusColor(order.status)} className="uppercase text-[9px] font-mono py-0.5 px-2">
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="space-y-4 pt-5 border-t border-black/10 font-satoshi text-sm">
                <div>
                  <span className="text-[10px] text-foreground/30 uppercase tracking-widest font-mono block mb-1">
                    Requested Work
                  </span>
                  <p className="text-foreground font-semibold flex items-center gap-1.5">
                    {order.service_title}
                    {order.type === 'project' && <Box size={14} className="text-foreground/45" />}
                  </p>
                </div>
                
                {order.type === 'service' ? (
                  <>
                    <div>
                      <span className="text-[10px] text-foreground/30 uppercase tracking-widest font-mono block mb-1">
                        Company Name
                      </span>
                      <p className="text-foreground/80">{order.requirements.business_name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-foreground/30 uppercase tracking-widest font-mono block mb-1">
                        Brief / Details
                      </span>
                      <p className="text-foreground/50 text-xs leading-relaxed">{order.requirements.requirements_text}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="text-[10px] text-foreground/30 uppercase tracking-widest font-mono block mb-1">
                      License Type
                    </span>
                    <p className="text-foreground/80">Developer Commercial License</p>
                  </div>
                )}
              </div>

              {/* Financial Breakdown */}
              <div className="pt-5 border-t border-black/10 space-y-3 text-xs font-satoshi">
                <div className="flex justify-between">
                  <span className="text-foreground/40">Total Quote Budget</span>
                  <span className="font-semibold text-foreground">
                    {totalAmount > 0 && !isPendingQuote ? formatPrice(totalAmount, user.country) : 'Pending Review'}
                  </span>
                </div>
                {depositAmount > 0 && !isPendingQuote && (
                  <div className="flex justify-between text-foreground/30">
                    <span>Initial Deposit</span>
                    <span>{formatPrice(depositAmount, user.country)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-semibold text-foreground pt-3 border-t border-white/10">
                  <span>Paid Balance</span>
                  <span className="text-emerald-400 font-mono">{formatPrice(amountPaid, user.country)}</span>
                </div>
              </div>

              {/* Payment Actions */}
              {user.role === 'client' && (
                <div className="pt-5 border-t border-white/10">
                  {isPendingQuote && (
                    <div className="bg-white/4 border border-white/10 p-4 rounded-lg text-center space-y-2">
                      <Clock className="w-6 h-6 text-foreground/30 mx-auto" />
                      <p className="text-[10px] text-foreground/75 font-display font-semibold uppercase tracking-widest">
                        Quote Under Review
                      </p>
                      <p className="text-[10px] text-foreground/40 leading-relaxed font-satoshi">
                        Our developers are reviewing your brief. We will email you once payment options are available.
                      </p>
                    </div>
                  )}

                  {showDepositPay && (
                    <div className="space-y-2.5">
                      <p className="text-[9px] text-[var(--vb-accent)] uppercase tracking-wider font-mono">
                        Step 1: Deposit Action Required
                      </p>
                      <button 
                        onClick={() => handlePayment(depositAmount - amountPaid, 'Initial Deposit')}
                        disabled={isPaying}
                        className="w-full btn-primary h-10 text-xs tracking-wider flex items-center justify-center font-semibold"
                      >
                        {isPaying ? <Loader2 size={14} className="animate-spin" /> : `Pay Deposit ${formatPrice(depositAmount - amountPaid, user.country)}`}
                      </button>
                    </div>
                  )}
                  
                  {showBalancePay && (
                    <div className="space-y-2.5">
                      <p className="text-[9px] text-[var(--vb-accent)] uppercase tracking-wider font-mono">
                        Step 2: Remaining Balance Action
                      </p>
                      <button 
                        onClick={() => handlePayment(remainingBalance, 'Final Balance')}
                        disabled={isPaying}
                        className="w-full btn-primary h-10 text-xs tracking-wider flex items-center justify-center font-semibold"
                      >
                        {isPaying ? <Loader2 size={14} className="animate-spin" /> : `Pay Balance ${formatPrice(remainingBalance, user.country)}`}
                      </button>
                    </div>
                  )}

                  {isFullyPaid && totalAmount > 0 && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 font-semibold text-xs uppercase tracking-widest font-mono">
                      <CheckCircle2 size={14} /> Account Settled
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payments History log */}
            {payments.length > 0 && (
              <div className="glass-card p-6 md:p-8 space-y-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-widest flex items-center gap-2">
                  <Receipt size={14} className="text-foreground/45" /> Payment Ledger
                </h3>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 rounded-lg bg-white/4 border border-white/10 text-xs font-satoshi">
                      <div>
                        <div className="text-foreground/80 font-bold">{formatPrice(payment.amount, user.country)}</div>
                        <div className="text-[10px] text-foreground/40 mt-0.5">{new Date(payment.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
                          Cleared
                        </span>
                        <div className="text-[9px] text-foreground/30 font-mono mt-1 select-all">{payment.razorpay_id.slice(-10)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Box */}
            {order.status === 'completed' && user.role === 'client' && (
              <div className="glass-card p-6 md:p-8 space-y-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-widest">
                  Review & Feedback
                </h3>
                {!order.rating ? (
                  <div className="space-y-4">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="text-foreground/20 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star 
                            size={24} 
                            fill={(hoverRating || rating) >= star ? "var(--vb-accent)" : "none"} 
                            className={(hoverRating || rating) >= star ? "text-[var(--vb-accent)]" : "text-black/10"}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Share details of your experience..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full bg-white/70 border border-black/10 rounded-lg p-3 text-xs text-foreground focus:outline-none focus:border-black/20 resize-none h-20"
                    />
                    <button 
                      onClick={handleSubmitRating} 
                      disabled={rating === 0 || isRatingSubmitting}
                      className="w-full btn-primary h-9 text-xs font-semibold"
                    >
                      {isRatingSubmitting ? 'Posting...' : 'Submit Evaluation'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2 space-y-2">
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                         <Star 
                           key={star}
                           size={16} 
                           fill={rating >= star ? "var(--vb-accent)" : "none"} 
                           className={rating >= star ? "text-[var(--vb-accent)]" : "text-black/10"}
                         />
                      ))}
                    </div>
                    <p className="text-xs text-foreground/60 italic font-satoshi">"{order.review || 'Excellent Delivery'}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Chat Stream Panel */}
          <div className="lg:col-span-8">
            <div className="glass-card flex flex-col h-[650px] relative overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-white/4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[var(--vb-accent)]">
                    <MessageSquarePlus size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                       {order.type === 'project' ? 'Project Stream' : 'Development Stream'}
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </h3>
                    <p className="text-[9px] text-[#6C757D] uppercase tracking-widest font-mono mt-0.5">
                      Client-Developer Encrypted Channel
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-grow overflow-y-auto p-6 space-y-5 bg-white/[0.02]" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-foreground/30 space-y-2.5">
                    <MessageSquarePlus size={36} className="text-black/10" />
                    <p className="font-display text-sm tracking-wider uppercase">Initialize Stream Connection</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    const isAdmin = msg.sender_role === 'admin' || msg.sender_role === 'super_admin';
                    const isDev = msg.sender_role === 'developer';
                    
                    const isImage = msg.attachment_url && (
                        msg.attachment_url.toLowerCase().endsWith('.jpg') || 
                        msg.attachment_url.toLowerCase().endsWith('.jpeg') || 
                        msg.attachment_url.toLowerCase().endsWith('.png') || 
                        msg.attachment_url.toLowerCase().endsWith('.webp') ||
                        msg.attachment_url.includes('image')
                    );

                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-[70%] rounded-xl p-4 border ${
                          isMe 
                            ? 'bg-[rgba(52,58,64,0.68)] border-[rgba(255,255,255,0.08)] text-[#F8F9FA]' 
                            : 'bg-[rgba(33,37,41,0.4)] border-[rgba(255,255,255,0.05)] text-[rgba(248,249,250,0.78)]'
                        }`}>
                           <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-[rgba(255,255,255,0.08)]">
                               <span className="text-[9px] font-display font-semibold uppercase tracking-wider text-[rgba(248,249,250,0.78)]">
                                  {isMe ? 'You' : msg.sender_name} 
                                  <span className="ml-1 opacity-50 font-mono text-[8px]">
                                      {isAdmin ? '(Admin)' : isDev ? '(Developer)' : '(Client)'}
                                  </span>
                                </span>
                               <span className="text-[8px] text-[rgba(248,249,250,0.56)] font-mono">
                                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </span>
                           </div>
                           
                           {isImage && (
                               <div className="mb-3 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)] cursor-pointer relative aspect-video" onClick={() => window.open(msg.attachment_url, '_blank')}>
                                   <img src={msg.attachment_url} alt="Attachment" className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                       <ExternalLink size={16} className="text-white" />
                                   </div>
                               </div>
                           )}
  
                           <p className="text-xs leading-relaxed font-satoshi text-[rgba(248,249,250,0.78)] whitespace-pre-wrap">{msg.content}</p>
                           
                           {!isImage && msg.attachment_url && (
                               <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="mt-3 p-2.5 bg-black/20 rounded border border-[rgba(255,255,255,0.08)] flex items-center hover:border-[rgba(255,255,255,0.14)] transition-colors">
                                   <FileText className="w-3.5 h-3.5 text-[rgba(248,249,250,0.56)] mr-2" />
                                   <span className="text-[10px] text-[rgba(248,249,250,0.78)] truncate max-w-[150px] font-mono">Download Attachment</span>
                                   <Download className="w-3 h-3 ml-auto text-[rgba(248,249,250,0.4)]" />
                                </a>
                           )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Upload Previews */}
              {filePreview && (
                  <div className="p-4 bg-white/6 border-t border-white/10 flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded overflow-hidden border border-white/10">
                          <img src={filePreview} className="w-full h-full object-cover" alt="Preview" />
                          <button onClick={removeFile} className="absolute top-0 right-0 p-0.5 bg-black/60 text-white/70 hover:text-red-400">
                              <X size={10} />
                          </button>
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-foreground font-semibold truncate">{selectedFile?.name}</p>
                          <p className="text-[9px] text-foreground/45 mt-0.5 font-mono">{(selectedFile!.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                  </div>
              )}

              {/* Input Control Area */}
              <div className="p-4 border-t border-white/10 bg-white/4 z-10">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*,.pdf,.zip"
                   />
                   <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                      className="btn-ghost p-0 h-10 w-10 shrink-0 border-black/10 rounded-lg flex items-center justify-center text-foreground/40 hover:text-foreground"
                   >
                       <Paperclip className="w-4 h-4" />
                   </button>
                   <div className="flex-grow">
                      <textarea 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type brief or message..."
                          className="w-full bg-white/70 border border-black/10 rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-black/20 resize-none h-10 min-h-[40px] max-h-[100px] font-satoshi placeholder:text-foreground/20"
                          rows={1}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage(e);
                              }
                          }}
                      />
                   </div>
                   <button 
                      type="submit" 
                      disabled={sending || (!newMessage.trim() && !selectedFile)} 
                      className="btn-primary p-0 h-10 w-10 shrink-0 rounded-lg flex items-center justify-center"
                   >
                       {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                   </button>
                </form>
                <p className="text-[8px] text-[#6C757D] mt-2.5 text-center uppercase tracking-widest font-mono select-none">
                  Secure Socket Layer Active // P2P Channel Stream
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
