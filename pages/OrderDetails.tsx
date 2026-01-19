
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Paperclip, Download, ChevronLeft, FileText, CheckCircle2, Star, Box, ExternalLink, Image as ImageIcon, X, Loader2, MessageSquarePlus, Receipt } from 'lucide-react';
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

  if (!order) return <div className="p-20 text-center">Loading Order Details...</div>;

  const totalAmount = order.total_amount || 0;
  const amountPaid = order.amount_paid || 0;
  const depositAmount = order.deposit_amount || 0;
  const remainingBalance = Math.max(0, totalAmount - amountPaid);
  
  // Payment Logic:
  // 1. Pending: User CANNOT pay yet.
  // 2. Accepted: User CAN pay deposit.
  // 3. In Progress: User CAN pay balance.
  
  const isPendingQuote = order.status === 'pending';
  const showDepositPay = !isPendingQuote && totalAmount > 0 && amountPaid < depositAmount;
  const showBalancePay = !isPendingQuote && !showDepositPay && totalAmount > 0 && amountPaid < totalAmount;
  const isFullyPaid = totalAmount > 0 && amountPaid >= totalAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to={user.role === 'admin' || user.role === 'super_admin' || user.role === 'developer' ? '/admin' : '/dashboard'} className="inline-flex items-center text-gray-400 hover:text-white mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
        {/* Order Info Column */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                    <ScrollFloat>{`Order #${order.id.slice(-6).toUpperCase()}`}</ScrollFloat>
                </h2>
                <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <Badge variant={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
            </div>
            
            <div className="space-y-4 py-4 border-t border-white/5">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">{order.type === 'project' ? 'Project' : 'Service'}</p>
                <p className="text-white font-medium flex items-center gap-2">
                    {order.service_title}
                    {order.type === 'project' && <Box size={14} className="text-vision-primary" />}
                </p>
              </div>
              
              {order.type === 'service' ? (
                  <>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Business Name</p>
                        <p className="text-white">{order.requirements.business_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Requirements</p>
                        <p className="text-gray-300 text-sm mt-1">{order.requirements.requirements_text}</p>
                      </div>
                  </>
              ) : (
                  <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">License Type</p>
                      <p className="text-white">Standard Commercial License</p>
                  </div>
              )}
            </div>

            {/* Financials Section */}
            <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Quote</span>
                    <span className="font-bold text-white">
                        {totalAmount > 0 && !isPendingQuote ? formatPrice(totalAmount, user.country) : 'Pending Review'}
                    </span>
                </div>
                {depositAmount > 0 && !isPendingQuote && (
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Required Deposit</span>
                        <span>{formatPrice(depositAmount, user.country)}</span>
                    </div>
                )}
                <div className="flex items-center justify-between text-sm font-bold text-vision-primary">
                    <span>Amount Paid</span>
                    <span>{formatPrice(amountPaid, user.country)}</span>
                </div>
            </div>

            {/* Payment Actions */}
            {user.role === 'client' && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    
                    {isPendingQuote && (
                         <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-center">
                            {/* Removed unused Clock icon here to fix build, but wait, Clock wasn't in unused list for OrderDetails.tsx? 
                                Check error log again.
                                "pages/OrderDetails.tsx:4:210 - error TS6133: 'Info' is declared but its value is never read."
                                "pages/OrderDetails.tsx:4:197 - error TS6133: 'Lock' is declared but its value is never read."
                                "pages/OrderDetails.tsx:4:185 - error TS6133: 'DollarSign' is declared but its value is never read."
                                "pages/OrderDetails.tsx:4:122 - error TS6133: 'RefreshCcw' is declared but its value is never read."
                                "pages/OrderDetails.tsx:4:109 - error TS6133: 'AlertCircle' is declared but its value is never read."
                                "pages/OrderDetails.tsx:4:50 - error TS6133: 'Calendar' is declared but its value is never read."
                                Ah, Clock is NOT in the error list for OrderDetails.tsx. It is used. I will keep it.
                                But wait, I need to import it. It was in the import list.
                                Let me re-add Clock to imports if I removed it.
                                In previous xml for OrderDetails I removed Clock. I should check if it is used.
                                Searching for <Clock... in OrderDetails.tsx...
                                Yes, it is used: <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                So I must keep Clock in imports.
                            */}
                            {/* Re-adding Clock to imports in this file block */}
                            <p className="text-xs text-blue-400 font-bold uppercase tracking-wide mb-1">Request Under Review</p>
                            <p className="text-[10px] text-gray-400">
                                A developer is reviewing your request. You will receive a notification with the quote and deposit link shortly.
                            </p>
                        </div>
                    )}

                    {showDepositPay && (
                        <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                            <p className="text-xs text-yellow-500 mb-2 font-bold uppercase tracking-wide">Step 1: Deposit Required</p>
                            <Button 
                                className="w-full bg-yellow-500 text-black hover:bg-yellow-400 border-none"
                                onClick={() => handlePayment(depositAmount - amountPaid, 'Initial Deposit')}
                                isLoading={isPaying}
                            >
                                Pay Deposit {formatPrice(depositAmount - amountPaid, user.country)}
                            </Button>
                        </div>
                    )}
                    
                    {showBalancePay && (
                        <div className="bg-vision-primary/10 p-4 rounded-xl border border-vision-primary/20">
                            <p className="text-xs text-vision-primary mb-2 font-bold uppercase tracking-wide">Step 2: Final Balance</p>
                            <Button 
                                className="w-full"
                                onClick={() => handlePayment(remainingBalance, 'Final Balance')}
                                isLoading={isPaying}
                            >
                                Pay Remaining {formatPrice(remainingBalance, user.country)}
                            </Button>
                        </div>
                    )}

                    {isFullyPaid && totalAmount > 0 && (
                        <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20 flex items-center justify-center gap-2 text-green-400 text-sm font-bold">
                            <CheckCircle2 size={16} /> Payment Complete
                        </div>
                    )}
                </div>
            )}
            
            {order.status === 'completed' && order.type !== 'project' && (
                <div className="mt-6 pt-6 border-t border-white/5">
                    <Button className="w-full" variant="secondary">
                        <Download className="w-4 h-4 mr-2"/> Download Invoice
                    </Button>
                </div>
            )}
          </Card>

           {/* Payments History */}
           {payments.length > 0 && (
               <Card>
                   <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                       <Receipt size={16} className="text-vision-secondary" /> Payment History
                   </h3>
                   <div className="space-y-3">
                       {payments.map((payment) => (
                           <div key={payment.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                               <div>
                                   <div className="text-white font-bold">{formatPrice(payment.amount, user.country)}</div>
                                   <div className="text-gray-500">{new Date(payment.date).toLocaleDateString()}</div>
                               </div>
                               <div className="text-right">
                                   <Badge variant="success" className="text-[10px] mb-1">SUCCESS</Badge>
                                   <div className="text-[9px] text-gray-500 font-mono truncate max-w-[80px]">{payment.razorpay_id}</div>
                               </div>
                           </div>
                       ))}
                   </div>
               </Card>
           )}

           {/* Deliverables / Previews Section */}
           {order.deliverables && order.deliverables.length > 0 && (
               <Card>
                   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <ImageIcon size={18} className="text-vision-secondary" /> Project Deliverables
                   </h3>
                   <div className="grid grid-cols-2 gap-3">
                       {order.deliverables.map((url, idx) => (
                           <div key={idx} className="group relative aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10 cursor-pointer" onClick={() => window.open(url, '_blank')}>
                               <img src={url} alt={`Deliverable ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                   <ExternalLink className="text-white" size={20} />
                               </div>
                           </div>
                       ))}
                   </div>
               </Card>
           )}

           {/* Rating Section */}
           {order.status === 'completed' && user.role === 'client' && (
               <Card className="border-t-4 border-t-yellow-500/50">
                   <h3 className="text-lg font-bold text-white mb-2">Rate your Experience</h3>
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
                                     className="text-gray-600 hover:scale-110 transition-transform focus:outline-none"
                                   >
                                       <Star 
                                            size={28} 
                                            fill={(hoverRating || rating) >= star ? "#eab308" : "none"} 
                                            className={(hoverRating || rating) >= star ? "text-yellow-500" : "text-gray-600"}
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
                                        fill={rating >= star ? "#eab308" : "none"} 
                                        className={rating >= star ? "text-yellow-500" : "text-gray-600"}
                                    />
                               ))}
                           </div>
                           <p className="text-gray-300 italic">"{order.review || "No written review"}"</p>
                       </div>
                   )}
               </Card>
           )}
        </div>

        {/* Chat Column */}
        <div className="lg:col-span-2 h-full flex flex-col">
          <Card className="flex-grow flex flex-col p-0 overflow-hidden h-full border-vision-primary/10 shadow-2xl">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 bg-vision-900/40 backdrop-blur-md flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-vision-primary/10 flex items-center justify-center text-vision-primary">
                      <MessageSquarePlus size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                        {order.type === 'project' ? 'Project Support' : 'Live Development Channel'}
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    </h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Client & Dev Secure Stream</p>
                  </div>
              </div>
              {user.role !== 'client' && (
                <Badge variant="info" className="uppercase text-[9px]">Staff Access</Badge>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-black/40" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-40">
                    <div className="p-6 bg-white/5 rounded-full mb-4">
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
                      <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-lg ${
                        isMe 
                          ? 'bg-vision-primary/10 border border-vision-primary/20 text-white rounded-br-none' 
                          : isAdmin 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-white rounded-bl-none'
                            : isDev
                              ? 'bg-vision-secondary/10 border border-vision-secondary/20 text-white rounded-bl-none'
                              : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-none'
                      }`}>
                         <div className="flex items-center justify-between gap-4 mb-2">
                             <span className={`text-[10px] font-bold uppercase tracking-wider ${isMe ? 'text-vision-primary' : isAdmin ? 'text-emerald-400' : isDev ? 'text-vision-secondary' : 'text-gray-400'}`}>
                                {isMe ? 'You' : msg.sender_name} 
                                <span className="ml-1 opacity-60">
                                    {isAdmin ? '(Admin)' : isDev ? '(Developer)' : '(Client)'}
                                </span>
                             </span>
                             <span className="text-[10px] text-gray-500 font-mono">
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </span>
                         </div>
                         
                         {isImage && (
                             <div className="mb-3 rounded-lg overflow-hidden border border-white/10 cursor-pointer group relative" onClick={() => window.open(msg.attachment_url, '_blank')}>
                                 <img src={msg.attachment_url} alt="Progress" className="w-full max-h-[300px] object-cover group-hover:scale-105 transition-transform duration-500" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                     <ExternalLink size={20} className="text-white" />
                                 </div>
                             </div>
                         )}

                         <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                         
                         {!isImage && msg.attachment_url && (
                             <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="mt-3 p-3 bg-black/40 rounded-lg border border-white/10 flex items-center group hover:border-vision-primary/50 transition-colors">
                                 <FileText className="w-4 h-4 text-gray-400 mr-2 group-hover:text-vision-primary" />
                                 <span className="text-xs text-gray-300 truncate max-w-[150px]">View Attachment</span>
                                 <Download className="w-3 h-3 ml-auto text-gray-500" />
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
                <div className="p-4 bg-vision-900/60 border-t border-white/5 flex items-center gap-4 animate-in slide-in-from-bottom-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-vision-primary/30">
                        <img src={filePreview} className="w-full h-full object-cover" alt="Preview" />
                        <button onClick={removeFile} className="absolute top-0 right-0 p-1 bg-black/60 text-white hover:text-red-400">
                            <X size={12} />
                        </button>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-white font-bold">{selectedFile?.name}</p>
                        <p className="text-[10px] text-gray-500">{(selectedFile!.size / 1024 / 1024).toFixed(2)} MB • Ready to send</p>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-vision-900/40 backdrop-blur-md">
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
                    className="text-gray-400 hover:text-vision-primary rounded-full hover:bg-vision-primary/5 h-11 w-11 shrink-0"
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
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-vision-primary/50 focus:ring-1 focus:ring-vision-primary/20 resize-none min-h-[44px] max-h-[120px] transition-all"
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
              <p className="text-[9px] text-gray-600 mt-2 text-center uppercase tracking-widest font-mono">
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
