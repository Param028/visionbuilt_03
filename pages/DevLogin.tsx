
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Terminal, ArrowRight, Fingerprint, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { Logo } from '../components/ui/Logo';
import { useToast } from '../components/ui/Toast';

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
        // Use password login for devs
        const user = await api.signInWithPassword(email, password);
        
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
    <div className="min-h-screen bg-[#050505] text-green-500 font-mono flex items-center justify-center relative overflow-hidden selection:bg-green-900 selection:text-white">
      {/* Matrix-style background effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      
      {/* Scanline */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] opacity-20"></div>

      <div className="relative z-10 w-full max-w-md p-2">
         {/* Terminal Header */}
         <div className="border border-green-800 bg-black/90 shadow-[0_0_30px_rgba(34,197,94,0.1)] rounded-sm overflow-hidden">
             <div className="bg-green-900/20 border-b border-green-800 p-2 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-xs">
                     <Terminal size={14} />
                     <span>SYS.ROOT.ACCESS</span>
                 </div>
                 <div className="flex gap-1">
                     <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                     <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                     <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                 </div>
             </div>
             
             <div className="p-8">
                 <div className="flex justify-center mb-8">
                     <div className="relative group">
                         <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                         <Logo className="w-16 h-16 relative z-10 grayscale brightness-200 contrast-200" />
                     </div>
                 </div>

                 <div className="mb-6 space-y-1 text-xs opacity-70">
                     <p>{'>'} INITIALIZING SECURE CONNECTION...</p>
                     <p>{'>'} ENCRYPTING TRAFFIC (AES-256)...</p>
                     <p>{'>'} ESTABLISHED.</p>
                 </div>

                 <form onSubmit={handleLogin} className="space-y-6">
                     <div className="space-y-4">
                         <div className="relative group">
                             <label className="text-[10px] uppercase tracking-widest opacity-60 mb-1 block">Operative ID</label>
                             <div className="flex items-center border-b border-green-800 group-focus-within:border-green-500 transition-colors py-1">
                                 <ChevronRight size={14} className="mr-2 animate-pulse" />
                                 <input 
                                     type="email" 
                                     value={email}
                                     onChange={(e) => setEmail(e.target.value)}
                                     className="bg-transparent border-none outline-none text-green-400 w-full placeholder-green-900"
                                     placeholder="admin@visionbuilt.com"
                                     autoComplete="off"
                                 />
                             </div>
                         </div>
                         
                         <div className="relative group">
                             <label className="text-[10px] uppercase tracking-widest opacity-60 mb-1 block">Security Key</label>
                             <div className="flex items-center border-b border-green-800 group-focus-within:border-green-500 transition-colors py-1">
                                 <Lock size={14} className="mr-2" />
                                 <input 
                                     type="password" 
                                     value={password}
                                     onChange={(e) => setPassword(e.target.value)}
                                     className="bg-transparent border-none outline-none text-green-400 w-full placeholder-green-900"
                                     placeholder="••••••••••••"
                                 />
                             </div>
                         </div>
                     </div>

                     {error && (
                         <div className="border border-red-500/50 bg-red-900/10 text-red-500 p-3 text-xs flex flex-col gap-2">
                             <div className="flex items-center font-bold">
                                <Shield size={14} className="mr-2" />
                                ACCESS DENIED
                             </div>
                             <p>{error}</p>
                             {error.includes("Email not confirmed") && (
                                <p className="text-[10px] text-red-400 opacity-80">
                                    Hint: Run the SQL command to verify your email manually if this is a restored admin account.
                                </p>
                             )}
                         </div>
                     )}

                     <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-green-900/20 border border-green-700 hover:bg-green-500 hover:text-black text-green-500 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                     >
                         {loading ? (
                             <>
                                <Fingerprint className="animate-pulse" size={16} />
                                <span>Verifying...</span>
                             </>
                         ) : (
                             <>
                                <span>Authenticate</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                             </>
                         )}
                         {loading && (
                             <div className="absolute bottom-0 left-0 h-0.5 bg-green-400 animate-[shine_2s_infinite] w-full"></div>
                         )}
                     </button>
                 </form>
             </div>
             
             <div className="bg-black border-t border-green-900 p-2 text-[10px] text-center opacity-40">
                 RESTRICTED ACCESS // AUTHORIZED PERSONNEL ONLY
             </div>
         </div>
      </div>
    </div>
  );
};

export default DevLogin;
