import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Terminal, ArrowRight, Fingerprint, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { useToast } from '../components/ui/Toast';
import { motion } from 'framer-motion';

const DevLogin: React.FC<{ setUser: (u: User) => void }> = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        // Use password login for devs with a timeout wrapper to prevent hanging
        const user = await Promise.race([
            api.signInWithPassword(email, password),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Authentication timed out. Database might be waking up, please try again.")), 60000))
        ]);
        
        if (!user) {
            throw new Error("Critical Error: User profile could not be loaded.");
        }

        // Check if user actually has permissions
        if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'developer') {
             throw new Error("Unauthorized Access Level: [Role mismatch: " + user.role + "]");
        }

        setUser(user);
        toast.success(`Welcome back, ${user.name}`);
        navigate('/admin');
    } catch (err: any) {
        console.error(err);
        const errorMsg = err.message || 'Authentication Failed';
        setError(errorMsg);
        toast.error(errorMsg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-emerald-400 font-mono flex items-center justify-center relative overflow-hidden selection:bg-emerald-950 selection:text-white">
      {/* Scanline & grid */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] opacity-15" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />

      {/* Ambient green glow behind the login panel */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
        style={{
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 w-full max-w-md p-4">
         {/* Terminal Header */}
         <motion.div 
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           className="border border-emerald-500/20 bg-[#25292e] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden"
         >
             <div className="bg-emerald-500/[0.02] border-b border-emerald-500/10 px-4 py-3.5 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[10px] tracking-widest text-emerald-500/60 font-semibold uppercase">
                     <Terminal size={12} />
                     <span>SYS.ROOT.ACCESS</span>
                 </div>
                 <div className="flex gap-1.5 select-none">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/10"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/10"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/10"></div>
                 </div>
             </div>
             
             <div className="p-8 space-y-6">
                 <div className="flex justify-center mb-4">
                     <div className="relative group">
                          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                          <img src="/logo.png" alt="Vision Built Logo" className="w-32 relative z-10 grayscale brightness-150 contrast-200 object-contain" />
                     </div>
                 </div>

                 <div className="space-y-1 text-[10px] text-emerald-500/40 select-none">
                     <p>{'>'} INITIALIZING SECURE SHELL...</p>
                     <p>{'>'} AES-256 TRAFFIC CRYPTO LINK ACTIVE.</p>
                     <p>{'>'} PROTOCOL ESTABLISHED.</p>
                 </div>

                 <form onSubmit={handleLogin} className="space-y-5">
                     <div className="space-y-4">
                          <div className="space-y-1.5">
                              <label className="text-[9px] uppercase tracking-widest text-emerald-500/50 block">Operative ID</label>
                              <div className="flex items-center border border-emerald-500/10 bg-black/10 focus-within:border-emerald-500/30 transition-all rounded-lg px-3.5 py-2.5">
                                  <ChevronRight size={14} className="mr-2 text-emerald-500/50 animate-pulse" />
                                  <input 
                                      type="email" 
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      className="bg-transparent border-none outline-none text-emerald-300 w-full placeholder-emerald-950 text-xs"
                                      placeholder="admin@visionbuilt.com"
                                      autoComplete="off"
                                  />
                              </div>
                          </div>
                          
                          <div className="space-y-1.5">
                              <label className="text-[9px] uppercase tracking-widest text-emerald-500/50 block">Security Key</label>
                              <div className="flex items-center border border-emerald-500/10 bg-black/10 focus-within:border-emerald-500/30 transition-all rounded-lg px-3.5 py-2.5">
                                  <Lock size={14} className="mr-2 text-emerald-500/50" />
                                  <input 
                                      type="password" 
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      className="bg-transparent border-none outline-none text-emerald-300 w-full placeholder-emerald-950 text-xs"
                                      placeholder="••••••••••••"
                                  />
                              </div>
                          </div>
                     </div>

                     {error && (
                          <div className="border border-red-500/20 bg-red-950/5 text-red-400 p-3.5 text-xs flex flex-col gap-1.5 rounded-lg">
                              <div className="flex items-center font-bold tracking-wider">
                                 <Shield size={12} className="mr-2" />
                                 SYS.ACCESS.REJECTED
                              </div>
                              <p className="text-[11px] leading-relaxed text-red-400/80">{error}</p>
                              {error.includes("Email not confirmed") && (
                                 <p className="text-[9px] text-red-500/50 leading-relaxed font-sans">
                                     Hint: Run SQL commands to update auth.users email confirmation manually.
                                 </p>
                              )}
                          </div>
                     )}

                     <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-400 hover:text-black text-emerald-400 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                     >
                          {loading ? (
                              <>
                                 <Fingerprint className="animate-pulse" size={14} />
                                 <span>SYS.VERIFYING...</span>
                              </>
                          ) : (
                              <>
                                 <span>Authenticate</span>
                                 <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                              </>
                          )}
                     </button>
                 </form>
             </div>
             
             <div className="bg-black/20 border-t border-emerald-500/10 py-3 text-[9px] text-center text-emerald-500/30 uppercase tracking-wider select-none">
                 RESTRICTED AREA // PROTOCOL ACTIVE
             </div>
         </motion.div>
      </div>
    </div>
  );
};

export default DevLogin;
