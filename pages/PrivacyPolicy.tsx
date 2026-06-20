
import React from 'react';
import { Shield, Lock, Eye, Database, Mail } from 'lucide-react';
import { INITIAL_CONTACT_INFO } from '../constants';
import { motion } from 'framer-motion';

// ── Reusable section block ─────────────────────────────────────
const PolicySection: React.FC<{
  icon: React.ReactNode;
  heading: string;
  children: React.ReactNode;
}> = ({ icon, heading, children }) => (
  <div className="glass-card p-8 md:p-10">
    <div
      className="flex items-center gap-3 mb-5 pb-5 border-b"
      style={{ borderColor: 'rgba(0,0,0,0.08)' }}
    >
      <span style={{ color: 'var(--vb-accent)' }}>{icon}</span>
      <h2 className="font-display font-bold text-foreground text-lg">{heading}</h2>
    </div>
    <div className="text-foreground/45 leading-relaxed text-sm space-y-3">
      {children}
    </div>
  </div>
);

// ── COMPONENT ─────────────────────────────────────────────────
const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen">

      {/* Page header */}
      <div
        className="relative border-b pt-20 pb-14 overflow-hidden"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
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
        <div className="container-vb relative z-10 text-center">
          <motion.p
            className="text-label mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Legal
          </motion.p>
          <motion.h1
            className="text-display font-display font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            className="text-foreground/30 text-sm font-satoshi tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Last Updated: {new Date().toLocaleDateString()}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="container-vb section-y-sm max-w-4xl mx-auto">
        <div className="space-y-4">

          <PolicySection icon={<Shield size={18} />} heading="1. Introduction">
            <p>
              Welcome to <strong className="text-foreground/70">Vision Built</strong>. We value your privacy and are committed to protecting your personal data.
              This privacy policy explains how we collect, use, and safeguard your information when you visit{' '}
              <em>visionbuilt.in</em> or use our services.
            </p>
          </PolicySection>

          <PolicySection icon={<Database size={18} />} heading="2. Data Collection">
            <p>We collect the following types of information:</p>
            <ul className="space-y-1.5 mt-3">
              {[
                ['Identity Data', 'Name, username, and social media handles (if provided).'],
                ['Contact Data', 'Email address and phone number.'],
                ['Technical Data', 'IP address, browser type, and operating system.'],
                ['Usage Data', 'How you interact with our website, products, and services.'],
                ['Order Data', 'Details of services or projects you purchase from us.'],
              ].map(([label, text]) => (
                <li key={label} className="flex items-start gap-2">
                  <span
                    className="text-[10px] font-satoshi font-medium tracking-widest uppercase mt-0.5 shrink-0"
                    style={{ color: 'var(--vb-accent)' }}
                  >
                    {label}
                  </span>
                  <span>— {text}</span>
                </li>
              ))}
            </ul>
          </PolicySection>

          <PolicySection icon={<Eye size={18} />} heading="3. How We Use Your Data">
            <p>We use your data to:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside ml-2">
              <li>Process and deliver your orders (Services and Marketplace items).</li>
              <li>Manage your relationship with us, including notifying you about policy changes.</li>
              <li>Enable you to partake in surveys or community activities.</li>
              <li>Administer and protect our business and website.</li>
              <li>Deliver relevant website content and communications.</li>
            </ul>
          </PolicySection>

          <PolicySection icon={<Lock size={18} />} heading="4. Data Security">
            <p>
              We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used,
              or accessed in an unauthorized way. Access to your personal data is limited to personnel with a legitimate business need.
            </p>
            <p className="mt-3">
              We use secure providers (Supabase, Razorpay) for authentication and payment processing.
              We do <strong className="text-foreground/60">not</strong> store sensitive credit card details on our own servers.
            </p>
          </PolicySection>

          {/* Contact */}
          <div className="glass-card p-8 md:p-10">
            <div
              className="flex items-center gap-3 mb-5 pb-5 border-b"
              style={{ borderColor: 'rgba(0,0,0,0.08)' }}
            >
              <span style={{ color: 'var(--vb-accent)' }}><Mail size={18} /></span>
              <h2 className="font-display font-bold text-foreground text-lg">5. Contact Us</h2>
            </div>
            <p className="text-foreground/45 text-sm mb-6">
              For any questions about this privacy policy or our privacy practices, reach us at:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Email Support', value: INITIAL_CONTACT_INFO.email },
                { label: 'Instagram', value: `@${INITIAL_CONTACT_INFO.instagram}` },
              ].map(item => (
                <div
                  key={item.label}
                  className="p-4 border"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.04)' }}
                >
                  <p className="text-label mb-1.5">{item.label}</p>
                  <p className="text-foreground/70 font-satoshi text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
