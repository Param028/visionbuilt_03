import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Paperclip, Download, ChevronLeft, FileText, CheckCircle2, Star, Box, ExternalLink, Image as ImageIcon, X, Loader2, MessageSquarePlus, Receipt, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Order, Message, User, MarketplaceItem, Payment } from '../types';
import { Button, Card, Badge, Textarea } from '../components/ui/Components';
import { ScrollFloat } from '../components/ui/ReactBits';
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

  if (!order) return <div className="p-20 text-center text-foreground/50">Loading Order Details...</div>;

  const totalAmount = order.total_amount || 0;
  const amountPaid = order.amount_paid || 0;
  const depositAmount = order.deposit_amount || 0;
  const remainingBalance = Math.max(0, totalAmount - amountPaid);
  
  const isPendingQuote = order.status === 'pending';
  const showDepositPay = !isPendingQuote && totalAmount > 0 && amountPaid < depositAmount;
  const showBalancePay = !isPendingQuote && !showDepositPay && totalAmount > 0 && amountPaid < totalAmount;
  const isFullyPaid = totalAmount > 0 && amountPaid >= totalAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to={user.role === 'admin' || user.role === 'super_admin' || user.role === 'developer' ? '/admin' : '/dashboard'} className="inline-flex items-center text-foreground/50 hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
        {/* Order Info Column */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">
                    <ScrollFloat>{`Order #${order.id.slice(-6).toUpperCase()}`}</ScrollFloat>
                </h2>
                <p className="text-sm text-foreground/50">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <Badge variant={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
            </div>
            
            <div className="space-y-4 py-4 border-t border-divider">
              <div>
                <p className="text-xs text-foreground/50 uppercase font-semibold">{order.type === 'project' ? 'Project' : 'Service'}</p>
                <p className="text-foreground font-medium flex items-center gap-2 mt-1">
                    {order.service_title}
                    {order.type === 'project' && <Box size={14} className="text-foreground/70" />}
                </p>
              </div>
              
              {order.type === 'service' ? (
                  <>
                      <div>
                        <p className="text-xs text-foreground/50 uppercase font-semibold">Business Name</p>
                        <p className="text-foreground mt-1">{order.requirements.business_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50 uppercase font-semibold">Requirements</p>
                        <p className="text-foreground/70 text-sm mt-1">{order.requirements.requirements_text}</p>
                      </div>
                  </>
              ) : (
                  <div>
                      <p className="text-xs text-foreground/50 uppercase font-semibold">License Type</p>
                      <p className="text-foreground mt-1">Standard Commercial License</p>
                  </div>
              )}
            </div>

            {/* Financials Section */}
            <div className="pt-4 border-t border-divider space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground/50">Total Quote</span>
                    <span className="font-bold text-foreground">
                        {totalAmount > 0 && !isPendingQuote ? formatPrice(totalAmount, user.country) : 'Pending Review'}
                    </span>
                </div>
                {depositAmount > 0 && !isPendingQuote && (
                    <div className="flex items-center justify-between text-xs text-foreground/50">
                        <span>Required Deposit</span>
                        <span>{formatPrice(depositAmount, user.country)}</span>
                    </div>
                )}
                <div className="flex items-center justify-between text-sm font-bold text-foreground pt-1 border-t border-divider/20">
                    <span>Amount Paid</span>
                    <span>{formatPrice(amountPaid, user.country)}</span>
                </div>
            </div>

            {/* Payment Actions */}
            {user.role === 'client' && (
                <div className="mt-4 pt-4 border-t border-divider space-y-3">
                    
                    {isPendingQuote && (
                         <div className="bg-content2 p-4 rounded-xl border border-divider text-center">
                            <Clock className="w-8 h-8 text-foreground/70 mx-auto mb-2" />
                            <p className="text-xs text-foreground/80 font-bold uppercase tracking-wide mb-1">Request Under Review</p>
                            <p className="text-[10px] text-foreground/50 mt-1">
                                A developer is reviewing your request. You will receive a notification with the quote and deposit link shortly.
                            </p>
                        </div>
                    )}

                    {showDepositPay && (
                        <div className="bg-content2 p-4 rounded-xl border border-divider">
                            <p className="text-xs text-foreground/75 mb-2 font-bold uppercase tracking-wide">Step 1: Deposit Required</p>
                            <Button 
                                className="w-full bg-foreground text-background hover:bg-foreground/90 border-none"
                                onClick={() => handlePayment(depositAmount - amountPaid, 'Initial Deposit')}
                                isLoading={isPaying}
                            >
                                Pay Deposit {formatPrice(depositAmount - amountPaid, user.country)}
                            </Button>
                        </div>
                    )}
                    
                    {showBalancePay && (
                        <div className="bg-content2 p-4 rounded-xl border border-divider">
                            <p className="text-xs text-foreground/75 mb-2 font-bold uppercase tracking-wide">Step 2: Final Balance</p>
                            <Button 
                                className="w-full bg-foreground text-background hover:bg-foreground/90 border-none"
                                onClick={() => handlePayment(remainingBalance, 'Final Balance')}
                                isLoading={isPaying}
                            >
                                Pay Remaining {formatPrice(remainingBalance, user.country)}
                            </Button>
                        </div>
                    )}

                    {isFullyPaid && totalAmount > 0 && (
                        <div className="bg-content2 p-3 rounded-xl border border-divider flex items-center justify-center gap-2 text-foreground text-sm font-bold">
                            <CheckCircle2 size={16} className="text-success" /> Payment Complete
                        </div>
                    )}
                </div>
            )}
            
            {order.status === 'completed' && order.type !== 'project' && (
                <div className="mt-6 pt-6 border-t border-divider">
                    <Button className="w-full" variant="secondary">
                        <Download className="w-4 h-4 mr-2"/> Download Invoice
                    </Button>
                </div>
            )}
          </Card>

           {/* Payments History */}
           {payments.length > 0 && (
               <Card>
                   <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wide">
                       <Receipt size={16} className="text-foreground/70" /> Payment History
                   </h3>
                   <div className="space-y-3">
                       {payments.map((payment) => (
                           <div key={payment.id} className="flex justify-between items-center p-3 rounded-lg bg-content2 border border-divider text-xs">
                               <div>
                                   <div className="text-foreground font-bold">{formatPrice(payment.amount, user.country)}</div>
                                   <div className="text-foreground/50 mt-0.5">{new Date(payment.date).toLocaleDateString()}</div>
                               </div>
                               <div className="text-right">
                                   <Badge variant="success" className="text-[10px] mb-1">SUCCESS</Badge>
                                   <div className="text-[9px] text-foreground/45 font-mono truncate max-w-[80px]">{payment.razorpay_id}</div>
                               </div>
                           </div>
                       ))}
                   </div>
               </Card>
           )}

           {/* Deliverables / Previews Section */}
           {order.deliverables && order.deliverables.length > 0 && (
               <Card>
                   <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                       <ImageIcon size={18} className="text-foreground/70" /> Project Deliverables
                   </h3>
                   <div className="grid grid-cols-2 gap-3">
                       {order.deliverables.map((url, idx) => (
                           <div key={idx} className="group relative aspect-video bg-black/40 rounded-lg overflow-hidden border border-divider cursor-pointer" onClick={() => window.open(url, '_blank')}>
                               <img src={url} alt={`Deliverable ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                   <ExternalLink className="text-foreground" size={20} />
                               </div>
                           </div>
                       ))}
                   </div>
               </Card>
           )}

           {/* Rating Section */}
           {order.status === 'completed' && user.role === 'client' && (
               <Card className="border-t-2 border-t-foreground/30">
                   <h3 className="text-lg font-bold text-foreground mb-2">Rate your Experience</h3>
                   {!order.rating ? (
                       <div className="space-y-4">
                           <div className="flex gap-2">
                               {[1, 2, 3, 4, 5].map((star) => (
                                   <button
                                     key={star}
                                     type="button"
                                     onMouseEnter={() => setHoverRating(star)}
                                     onMouseLeave={() => setHoverRating(0)}
                                     onClick={() => setRating(star)}
                                     className="text-foreground/30 hover:scale-110 transition-transform focus:outline-none"
                                   >
                                       <Star 
                                             size={28} 
                                             fill={(hoverRating || rating) >= star ? "currentColor" : "none"} 
                                             className={(hoverRating || rating) >= star ? "text-foreground" : "text-foreground/30"}
                                         />
                                   </button>
                               ))}
                           </div>
                           <Textarea 
                                placeholder="Share your feedback..."
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                           />
                           <Button 
                                onClick={handleSubmitRating} 
                                disabled={rating === 0 || isRatingSubmitting}
                                className="w-full"
                           >
                               {isRatingSubmitting ? 'Submitting...' : 'Submit Review'}
                           </Button>
                       </div>
                   ) : (
                       <div className="text-center py-4">
                           <div className="flex justify-center gap-1 mb-2">
                               {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                        key={star}
                                        size={20} 
                                        fill={rating >= star ? "currentColor" : "none"} 
                                        className={rating >= star ? "text-foreground" : "text-foreground/30"}
                                    />
                               ))}
                           </div>
                           <p className="text-foreground/70 italic">"{order.review || "No written review"}"</p>
                       </div>
                   )}
               </Card>
           )}
         </div>

         {/* Chat Column */}
         <div className="lg:col-span-2 h-full flex flex-col">
           <Card className="flex-grow flex flex-col p-0 overflow-hidden h-full border-divider shadow-md">
             {/* Chat Header */}
             <div className="p-4 border-b border-divider bg-content2/80 backdrop-blur-md flex justify-between items-center">
               <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-content1 border border-divider flex items-center justify-center text-foreground">
                       <MessageSquarePlus size={20} />
                   </div>
                   <div>
                     <h3 className="font-bold text-foreground flex items-center gap-2">
                         {order.type === 'project' ? 'Project Support' : 'Live Development Channel'}
                         <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                     </h3>
                     <p className="text-[10px] text-foreground/50 uppercase tracking-widest mt-0.5">Client & Dev Secure Stream</p>
                   </div>
               </div>
               {user.role !== 'client' && (
                 <Badge variant="default" className="uppercase text-[9px]">Staff Access</Badge>
               )}
             </div>

             {/* Chat Area */}
             <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-content1/30" ref={scrollRef}>
               {messages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-foreground/40 opacity-40">
                     <div className="p-6 bg-content2 rounded-full mb-4 border border-divider">
                         <MessageSquarePlus size={48} />
                     </div>
                     <p className="font-display text-lg">Initialize conversation...</p>
                 </div>
               ) : (
                 messages.map((msg) => {
                   const isMe = msg.sender_id === user.id;
                   const isAdmin = msg.sender_role === 'admin' || msg.sender_role === 'super_admin';
                   const isDev = msg.sender_role === 'developer';
                   
                   // Image check
                   const isImage = msg.attachment_url && (
                       msg.attachment_url.toLowerCase().endsWith('.jpg') || 
                       msg.attachment_url.toLowerCase().endsWith('.jpeg') || 
                       msg.attachment_url.toLowerCase().endsWith('.png') || 
                       msg.attachment_url.toLowerCase().endsWith('.webp') ||
                       msg.attachment_url.includes('image')
                   );

                   return (
                     <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                       <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                         isMe 
                           ? 'bg-foreground/5 border border-divider text-foreground rounded-br-none' 
                           : isAdmin 
                             ? 'bg-foreground/10 border border-divider text-foreground rounded-bl-none font-medium'
                             : isDev
                               ? 'bg-foreground/10 border border-divider text-foreground rounded-bl-none'
                               : 'bg-content2 border border-divider text-foreground rounded-bl-none'
                       }`}>
                          <div className="flex items-center justify-between gap-4 mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider text-foreground/80`}>
                                 {isMe ? 'You' : msg.sender_name} 
                                 <span className="ml-1 opacity-60">
                                     {isAdmin ? '(Admin)' : isDev ? '(Developer)' : '(Client)'}
                                 </span>
                              </span>
                              <span className="text-[10px] text-foreground/40 font-mono">
                                 {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                          </div>
                          
                          {isImage && (
                              <div className="mb-3 rounded-lg overflow-hidden border border-divider cursor-pointer group relative" onClick={() => window.open(msg.attachment_url, '_blank')}>
                                  <img src={msg.attachment_url} alt="Progress" className="w-full max-h-[300px] object-cover group-hover:scale-105 transition-transform duration-500" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <ExternalLink size={20} className="text-foreground" />
                                  </div>
                              </div>
                          )}

                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          
                          {!isImage && msg.attachment_url && (
                              <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="mt-3 p-3 bg-content2 rounded-lg border border-divider flex items-center group hover:border-foreground/50 transition-colors">
                                  <FileText className="w-4 h-4 text-foreground/50 mr-2 group-hover:text-foreground" />
                                  <span className="text-xs text-foreground/80 truncate max-w-[150px]">View Attachment</span>
                                  <Download className="w-3 h-3 ml-auto text-foreground/40" />
                              </a>
                          )}
                       </div>
                     </div>
                   );
                 })
               )}
             </div>

             {/* Preview Area */}
             {filePreview && (
                 <div className="p-4 bg-content2 border-t border-divider flex items-center gap-4 animate-in slide-in-from-bottom-4">
                     <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-divider">
                         <img src={filePreview} className="w-full h-full object-cover" alt="Preview" />
                         <button onClick={removeFile} className="absolute top-0 right-0 p-1 bg-black/60 text-white hover:text-red-400">
                             <X size={12} />
                         </button>
                     </div>
                     <div className="flex-1">
                         <p className="text-xs text-foreground font-bold">{selectedFile?.name}</p>
                         <p className="text-[10px] text-foreground/50">{(selectedFile!.size / 1024 / 1024).toFixed(2)} MB • Ready to send</p>
                     </div>
                 </div>
             )}

             {/* Input Area */}
             <div className="p-4 border-t border-divider bg-content2/40 backdrop-blur-md">
               <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileChange} 
                     className="hidden" 
                     accept="image/*,.pdf,.zip"
                  />
                  <Button 
                     type="button" 
                     variant="ghost" 
                     size="icon" 
                     className="text-foreground/60 hover:text-foreground rounded-full hover:bg-content1 h-11 w-11 shrink-0 border-divider"
                     onClick={() => fileInputRef.current?.click()}
                     disabled={sending}
                  >
                      <Paperclip className="w-5 h-5" />
                  </Button>
                  <div className="flex-grow relative">
                     <textarea 
                         value={newMessage}
                         onChange={(e) => setNewMessage(e.target.value)}
                         placeholder="Type a message or share progress..."
                         className="w-full bg-content1 border border-divider rounded-2xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-foreground/50 focus:ring-1 focus:ring-foreground/20 resize-none min-h-[44px] max-h-[120px] transition-all placeholder:text-foreground/40"
                         rows={1}
                         onKeyDown={(e) => {
                             if (e.key === 'Enter' && !e.shiftKey) {
                                 e.preventDefault();
                                 handleSendMessage(e);
                             }
                         }}
                     />
                  </div>
                  <Button 
                     type="submit" 
                     disabled={sending || (!newMessage.trim() && !selectedFile)} 
                     className="rounded-full h-11 w-11 shrink-0"
                     variant="primary"
                     size="icon"
                  >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
               </form>
               <p className="text-[9px] text-foreground/40 mt-2 text-center uppercase tracking-widest font-mono">
                 Encrypted Peer-to-Peer Communication Protocol Active
               </p>
             </div>
           </Card>
         </div>
       </div>
     </div>
   );
};

export default OrderDetails;
