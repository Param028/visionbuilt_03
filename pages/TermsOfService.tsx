import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Gavel, Copyright, CreditCard, Mail, Database } from 'lucide-react';
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
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
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
const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div
        className="relative border-b pt-20 pb-14 overflow-hidden"
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
            Terms & Conditions
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
          <PolicySection icon={<FileText size={18} />} heading="1. Agreement to Terms">
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and <strong>Vision Built</strong> (“we,” “us” or “our”), concerning your access to and use of the <em>visionbuilt.in</em> website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
            </p>
            <p className="mt-3">
              By accessing the Site, you agree that you have read, understood, and agreed to be bound by all of these Terms of Service.
            </p>
          </PolicySection>

          <PolicySection icon={<Copyright size={18} />} heading="2. Intellectual Property Rights">
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us.
            </p>
            <p className="mt-3">
              <strong>Project Ownership:</strong> Upon full payment for Custom Software or Design services, ownership of the final deliverables is transferred to the client. However, Vision Built retains the right to use the work for portfolio and marketing purposes unless a Non-Disclosure Agreement (NDA) is signed prior to the project commencement.
            </p>
          </PolicySection>

          <PolicySection icon={<Gavel size={18} />} heading="3. User Representations">
            <p>By using the Site, you represent and warrant that:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 ml-2">
              <li>All registration information you submit will be true, accurate, current, and complete.</li>
              <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
              <li>You are not a minor in the jurisdiction in which you reside.</li>
              <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</li>
              <li>You will not use the Site for any illegal or unauthorized purpose.</li>
            </ul>
          </PolicySection>

          <PolicySection icon={<CreditCard size={18} />} heading="4. Payment and Fees">
            <p>
              We accept payments through various online payment methods including Credit/Debit cards and Razorpay. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site.
            </p>
            <p className="mt-3">
              <strong>Domain Charges:</strong> Domain registration fees are fixed and non-changeable. Once a domain is purchased on your behalf, the fee is non-refundable and the domain name cannot be altered.
            </p>
            <p className="mt-3">
              We maintain a strict refund policy to ensure fairness. For details regarding cancellations, eligible refunds, and non-refundable items, please refer to our full <Link to="/refund-policy" className="text-foreground underline hover:text-[var(--vb-accent)] transition-colors">Refund Policy</Link>.
            </p>
          </PolicySection>

          <PolicySection icon={<Database size={18} />} heading="5. Project Retention & Hosting">
            <p>
              <strong>File Backup:</strong> We provide a complimentary backup of your project files for a period of <strong>6 months</strong> from the date of completion. After this 6-month period, all project files will be permanently deleted from our secure storage.
            </p>
            <p className="mt-3">
              It is the client's sole responsibility to download, back up, and secure their project files upon delivery. Vision Built is not liable for any data loss occurring after this retention period.
            </p>
          </PolicySection>

          {/* Contact / Action Card */}
          <div className="glass-card p-8 md:p-10">
            <div
              className="flex items-center gap-3 mb-5 pb-5 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <span style={{ color: 'var(--vb-accent)' }}><Mail size={18} /></span>
              <h2 className="font-display font-bold text-foreground text-lg">6. Contact Us</h2>
            </div>
            <p className="text-foreground/45 text-sm mb-6">
              In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Email Support', value: INITIAL_CONTACT_INFO.email },
                { label: 'Instagram', value: `@${INITIAL_CONTACT_INFO.instagram}` },
              ].map(item => (
                <div
                  key={item.label}
                  className="p-4 border"
                  style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
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

export default TermsOfService;
