
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { Input, Badge } from '../components/ui/Components';
import { User as UserIcon, Lock, Globe, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../constants';
import { motion } from 'framer-motion';

// ── Field wrapper ──────────────────────────────────────────────
const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-satoshi tracking-widest uppercase" style={{ color: 'rgba(248,249,250,0.3)' }}>
      {label}
    </label>
    {children}
  </div>
);

// ── Section card ──────────────────────────────────────────────
const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="glass-card p-8">
    <h3
      className="flex items-center gap-2.5 font-display font-semibold text-foreground mb-7 pb-5 border-b text-base"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <span style={{ color: 'var(--vb-accent)' }}>{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

// ── COMPONENT ─────────────────────────────────────────────────
const Profile: React.FC<{ user: User; setUser: (u: User) => void }> = ({ user, setUser }) => {
  const [name, setName]             = useState(user.name);
  const [country, setCountry]       = useState(user.country || 'India');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading]       = useState(false);
  const toast                       = useToast();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await api.updateProfile(user.id, { name, country });
      if (updatedUser) {
        setUser(updatedUser);
        toast.success('Profile updated successfully!');
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
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.updateUserPassword(newPassword);
      toast.success('Password changed successfully!');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">

      {/* ── Page header ── */}
      <div
        className="relative border-b pt-20 pb-16 overflow-hidden"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          aria-hidden="true"
          style={{
            width: '500px', height: '260px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(124,143,161,0.05) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="container-vb relative z-10">
          <motion.p
            className="text-label mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            My Account
          </motion.p>
          <motion.h1
            className="text-display-sm font-display font-bold text-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Account Settings
          </motion.h1>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container-vb section-y-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Identity card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-card p-8 text-center space-y-5">
              {/* Avatar */}
              <div
                className="w-20 h-20 mx-auto flex items-center justify-center font-display font-bold text-3xl text-background"
                style={{ background: '#F8F9FA' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* Name + email */}
              <div>
                <h2 className="font-display font-bold text-foreground text-xl">{user.name}</h2>
                <p className="text-xs font-satoshi mt-1.5" style={{ color: 'rgba(248,249,250,0.35)' }}>
                  {user.email}
                </p>
              </div>

              {/* Badges */}
              <div className="flex justify-center gap-2 flex-wrap pt-2">
                <Badge
                  variant={user.role === 'client' ? 'default' : 'info'}
                  className="uppercase text-[10px]"
                >
                  {user.role.replace('_', ' ')}
                </Badge>
                {user.email_verified && (
                  <Badge variant="success" className="flex items-center gap-1 text-[10px]">
                    <ShieldCheck size={9} /> Verified
                  </Badge>
                )}
              </div>

              {/* Member info */}
              <div
                className="text-xs pt-4 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(248,249,250,0.25)' }}
              >
                <p className="font-satoshi tracking-wide">Vision Built Member</p>
                <p className="mt-0.5">{user.country || 'India'}</p>
              </div>
            </div>
          </motion.div>

          {/* ── Edit forms ── */}
          <div className="md:col-span-2 space-y-5">

            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Section icon={<UserIcon size={16} />} title="Profile Information">
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <FormField label="Full Name">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="vb-input-native"
                    />
                  </FormField>

                  <FormField label="Email Address">
                    <div
                      className="flex items-center gap-2 px-3 h-11 border text-sm"
                      style={{
                        borderColor: 'rgba(255,255,255,0.07)',
                        background: 'rgba(255,255,255,0.02)',
                        color: 'rgba(248,249,250,0.3)',
                      }}
                    >
                      <Mail size={13} style={{ color: 'rgba(248,249,250,0.25)' }} />
                      {user.email}
                    </div>
                    <p className="text-[10px] mt-1.5 font-satoshi" style={{ color: 'rgba(248,249,250,0.2)' }}>
                      Email cannot be changed directly.
                    </p>
                  </FormField>

                  <FormField label="Country / Region">
                    <div className="relative">
                      <Globe
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'rgba(248,249,250,0.3)' }}
                      />
                      <select
                        className="vb-input pl-8"
                        style={{ height: '2.875rem' }}
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                      >
                        {SUPPORTED_COUNTRIES.map((c) => (
                          <option key={c} value={c} className="bg-[#2C3137] text-foreground">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </FormField>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary !text-xs !py-2.5 !px-7 min-w-[140px] justify-center"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </Section>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Section icon={<Lock size={16} />} title="Security">
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <FormField label="New Password">
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      minLength={6}
                    />
                  </FormField>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading || !newPassword}
                      className="btn-ghost !text-xs !py-2.5 !px-7 min-w-[140px] justify-center disabled:opacity-40"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : 'Update Password'}
                    </button>
                  </div>
                </form>
              </Section>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
