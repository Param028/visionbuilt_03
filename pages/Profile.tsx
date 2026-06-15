import React, { useState } from 'react';
import { User } from '../types';
import { Card, Input, Button, Badge } from '../components/ui/Components';
import { ScrollFloat } from '../components/ui/ReactBits';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { User as UserIcon, Lock, Globe, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../constants';

const Profile: React.FC<{ user: User, setUser: (u: User) => void }> = ({ user, setUser }) => {
  const [name, setName] = useState(user.name);
  const [country, setCountry] = useState(user.country || 'India');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const updatedUser = await api.updateProfile(user.id, { name, country });
        if (updatedUser) {
            setUser(updatedUser);
            toast.success("Profile updated successfully!");
        }
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPassword || newPassword.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
      }
      setLoading(true);
      try {
          await api.updateUserPassword(newPassword);
          toast.success("Password changed successfully!");
          setNewPassword('');
      } catch (error: any) {
          toast.error(error.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            <ScrollFloat>Account Settings</ScrollFloat>
        </h1>
        <p className="text-foreground/50">Manage your identity and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User ID Card */}
          <Card className="h-fit text-center space-y-4 md:col-span-1 border-divider">
              <div className="w-24 h-24 bg-foreground text-background rounded-full mx-auto flex items-center justify-center text-4xl font-bold shadow-md">
                  {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                  <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                  <p className="text-sm text-foreground/50 font-mono mt-1">{user.email}</p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                  <Badge variant={user.role === 'client' ? 'default' : 'info'} className="uppercase">
                      {user.role.replace('_', ' ')}
                  </Badge>
                  {user.email_verified && <Badge variant="success" className="flex items-center gap-1"><ShieldCheck size={10}/> Verified</Badge>}
              </div>
          </Card>

          {/* Edit Forms */}
          <div className="md:col-span-2 space-y-8">
              {/* Profile Details */}
              <Card>
                  <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 border-b border-divider pb-4">
                      <UserIcon size={20} className="text-foreground/75" /> Profile Information
                  </h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                      <div className="grid grid-cols-1 gap-5">
                          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                          <div>
                              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider block mb-1.5">Email Address</label>
                              <div className="flex items-center bg-content2 border border-divider rounded-lg px-3 py-2 text-foreground/40 cursor-not-allowed">
                                  <Mail size={16} className="mr-2" />
                                  {user.email}
                              </div>
                              <p className="text-[10px] text-foreground/35 mt-1">Email cannot be changed directly.</p>
                          </div>
                          <div>
                                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                                    <Globe size={12} /> Country / Region
                                </label>
                                <select
                                    className="flex h-10 w-full rounded-lg border border-divider bg-content1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus/30"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    required
                                >
                                    {SUPPORTED_COUNTRIES.map((c) => (
                                        <option key={c} value={c} className="bg-content1 text-foreground">
                                            {c}
                                        </option>
                                    ))}
                                </select>
                          </div>
                      </div>
                      <div className="flex justify-end">
                          <Button type="submit" disabled={loading} className="min-w-[120px]">
                              {loading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                          </Button>
                      </div>
                  </form>
              </Card>

              {/* Security */}
              <Card>
                  <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 border-b border-divider pb-4">
                      <Lock size={20} className="text-foreground/75" /> Security
                  </h3>
                  <form onSubmit={handleChangePassword} className="space-y-5">
                      <Input 
                          type="password" 
                          label="New Password" 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          placeholder="Min 6 characters"
                          minLength={6}
                      />
                      <div className="flex justify-end">
                          <Button type="submit" variant="secondary" disabled={loading || !newPassword} className="min-w-[120px]">
                              {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
                          </Button>
                      </div>
                  </form>
              </Card>
          </div>
      </div>
    </div>
  );
};

export default Profile;
