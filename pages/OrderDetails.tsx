
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Paperclip, Download, ChevronLeft, Calendar, FileText, CheckCircle2, Star, Box, ExternalLink, AlertCircle, RefreshCcw } from 'lucide-react';
import { api } from '../services/api';
import { Order, Message, User, MarketplaceItem } from '../types';
import { Button, Card, Badge, Input, Textarea } from '../components/ui/Components';
import { ScrollFloat } from '../components/ui/ReactBits';
import { INITIAL_CONTACT_INFO } from '../constants';

const OrderDetails: React.FC<{ user: User }> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [project, setProject] = useState<MarketplaceItem | null>(null);
  
  // Rating State
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      api.getOrderById(id).then(o => {
          setOrder(o || null);
          if (o?.rating) setRating(o.rating);
          if (o?.review) setReview(o.review);
          
          // If it's a project, fetch project details
          if (o?.type === 'project' && o.project_id) {
              api.getMarketplaceItemById(o.project_id).then(p => setProject(p || null));
          }
      });
      api.getMessages(id).then(setMessages);
    }
  }, [id]);

  useEffect(() => {
    // Scroll to bottom of chat
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;
    setSending(true);

    const msg = await api.sendMessage({
      order_id: id,
      sender_id: user.id,
      sender_name: user.name,
      sender_role: user.role,
      content: newMessage,
    });

    setMessages([...messages, msg]);
    setNewMessage('');
    setSending(false);
  };

  const handleSubmitRating = async () => {
      if(!order || rating === 0) return;
      setIsRatingSubmitting(true);
      const updatedOrder = await api.rateOrder(order.id, rating, review);
      setOrder(updatedOrder);
      setIsRatingSubmitting(false);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'mockup_ready': return 'warning';
      default: return 'default';
    }
  };

  const handleDownload = () => {
      if (project?.download_url) {
          window.open(project.download_url, '_blank');
      }
  };

  const handleRefundRequest = () => {
      const subject = `Refund Request: Order #${order?.id}`;
      const body = `Hi Vision Built Team,\n\nI would like to request a refund for Order #${order?.id}.\n\nReason:\n\nThank you, ${user.name}`;
      window.open(`mailto:${INITIAL_CONTACT_INFO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  if (!order) return <div className="p-20 text-center">Loading Order Details...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="inline-flex items-center text-gray-400 hover:text-white mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
        {/* Order Info Column */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                    <ScrollFloat>{`Order #${order.id}`}</ScrollFloat>
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
                      {order.requirements.reference_links && (
                        <div>
                           <p className="text-xs text-gray-500 uppercase font-semibold">References</p>
                           <a href={`https://${order.requirements.reference_links}`} target="_blank" rel="noreferrer" className="text-vision-primary text-sm hover:underline truncate block">
                             {order.requirements.reference_links}
                           </a>
                        </div>
                      )}
                      
                       <div className="pt-4 border-t border-white/5">
                          <h4 className="text-sm font-semibold text-white mb-3">Add-ons</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Domain Purchase</span>
                              <span className={order.domain_requested ? "text-green-400" : "text-gray-600"}>{order.domain_requested ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Business Email</span>
                              <span className={order.business_email_requested ? "text-green-400" : "text-gray-600"}>{order.business_email_requested ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>
                  </>
              ) : (
                  <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">License Type</p>
                      <p className="text-white">Standard Commercial License</p>
                  </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="pt-4 border-t border-white/5">
                <h4 className="text-sm font-semibold text-white mb-3">Payment Summary</h4>
                <div className="space-y-2">
                    {order.discount_amount && (
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-green-400">Discount ({order.applied_offer_code})</span>
                            <span className="text-green-400">-${order.discount_amount}</span>
                         </div>
                    )}
                    <div className="flex items-center justify-between text-sm font-bold text-vision-primary">
                        <span>Total Order Amount</span>
                        <span>${order.total_amount}</span>
                    </div>
                </div>
            </div>
            
            {/* Project Download Section */}
            {order.type === 'project' && order.status === 'completed' && project && (
                <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-bottom-2">
                    <Button className="w-full h-12 text-base shadow-[0_0_15px_rgba(6,182,212,0.3)]" onClick={handleDownload}>
                        <Download className="w-5 h-5 mr-2"/> Download Project Files
                    </Button>
                    <p className="text-center text-xs text-gray-500 mt-2">v1.0.0 • ZIP Archive</p>
                </div>
            )}
            
            {/* Invoice Download (Generic) */}
            {order.status === 'completed' && order.type !== 'project' && (
                <div className="mt-6 pt-6 border-t border-white/5">
                    <Button className="w-full" variant="secondary">
                        <Download className="w-4 h-4 mr-2"/> Download Invoice
                    </Button>
                </div>
            )}

            {/* Refund Button */}
            {(order.status === 'in_progress' || order.status === 'completed' || order.status === 'mockup_ready') && (
                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                    <button 
                        onClick={handleRefundRequest}
                        className="text-xs text-gray-500 hover:text-red-400 flex items-center justify-center w-full gap-2 transition-colors"
                    >
                        <RefreshCcw size={12} /> Request a Refund
                    </button>
                </div>
            )}
          </Card>

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
                                placeholder="Share your feedback (optional)..."
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
                           <p className="text-xs text-green-400 mt-2 font-medium">Thank you for your feedback!</p>
                       </div>
                   )}
               </Card>
           )}
        </div>

        {/* Chat Column */}
        <div className="lg:col-span-2 h-full flex flex-col">
          <Card className="flex-grow flex flex-col p-0 overflow-hidden h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="font-semibold text-white flex items-center">
                 <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                 {order.type === 'project' ? 'Project Support' : 'Live Developer Chat'}
              </h3>
              {user.role === 'admin' && (
                <span className="text-xs text-gray-400">Viewing as Admin</span>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-black/20" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p>
                        {order.type === 'project' 
                            ? 'Need help with setup? Ask us anything!' 
                            : 'No messages yet. Start the conversation!'}
                    </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  const isAdmin = msg.sender_role === 'admin';
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isMe 
                          ? 'bg-vision-primary/20 border border-vision-primary/30 text-white rounded-br-none' 
                          : isAdmin 
                            ? 'bg-vision-secondary/20 border border-vision-secondary/30 text-white rounded-bl-none'
                            : 'bg-white/10 text-gray-200 rounded-bl-none'
                      }`}>
                         <div className="flex items-baseline justify-between space-x-2 mb-1">
                             <span className={`text-xs font-bold ${isMe ? 'text-vision-primary' : isAdmin ? 'text-vision-secondary' : 'text-gray-400'}`}>
                                {isMe ? 'You' : msg.sender_name} {isAdmin && !isMe && '(Support)'}
                             </span>
                             <span className="text-[10px] text-gray-500 opacity-70">
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </span>
                         </div>
                         <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                         {msg.attachment_url && (
                             <div className="mt-2 p-2 bg-black/20 rounded border border-white/10 flex items-center">
                                 <Paperclip className="w-3 h-3 text-gray-400 mr-2" />
                                 <span className="text-xs text-vision-primary underline cursor-pointer">View Attachment</span>
                             </div>
                         )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-white/5">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                 <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                     <Paperclip className="w-5 h-5" />
                 </Button>
                 <input 
                   type="text" 
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                   placeholder="Type your message..."
                   className="flex-grow bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-vision-primary/50"
                 />
                 <Button type="submit" disabled={sending || !newMessage.trim()} size="sm" className="px-4">
                     {sending ? '...' : <Send className="w-4 h-4" />}
                 </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
