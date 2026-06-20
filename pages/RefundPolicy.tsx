import React from 'react';
import { CheckCircle, XCircle, Clock, Mail, ShieldAlert, FileText, Globe, HardDrive } from 'lucide-react';
import { INITIAL_CONTACT_INFO } from '../constants';
import { motion } from 'framer-motion';

// ── Reusable section block ─────────────────────────────────────
const PolicySection: React.FC<{
  icon: React.ReactNode;
  heading: string;
  children: React.ReactNode;
  statusColor?: string;
}> = ({ icon, heading, children, statusColor }) => (
  <div className="glass-card p-8 md:p-10">
    <div
      className="flex items-center gap-3 mb-5 pb-5 border-b"
      style={{ borderColor: 'rgba(0,0,0,0.08)' }}
    >
      <span style={{ color: statusColor || 'var(--vb-accent)' }}>{icon}</span>
      <h2 className="font-display font-bold text-foreground text-lg">{heading}</h2>
    </div>
    <div className="text-foreground/45 leading-relaxed text-sm space-y-3">
      {children}
    </div>
  </div>
);

// ── COMPONENT ─────────────────────────────────────────────────
const RefundPolicy: React.FC = () => {
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
            Refund Policy
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
          <PolicySection icon={<ShieldAlert size={18} />} heading="Our Commitment">
            <p>
              Vision Built is committed to delivering exceptional software solutions. We understand that sometimes plans need to adapt. This policy outlines when refunds are applicable for our <strong>Services</strong> (Custom Development) and <strong>Marketplace</strong> (Digital Products).
            </p>
          </PolicySection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PolicySection icon={<CheckCircle size={18} />} heading="Service Orders" statusColor="#a3e635">
              <p className="font-semibold text-foreground/75 mb-2">Eligible for Refund:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Order Cancellation:</strong> Full refund is eligible provided no work has commenced on the project.</li>
                <li><strong>Non-Delivery:</strong> Full refund if we fail to initiate the project after payment confirmation.</li>
                <li><strong>Major Deviation:</strong> Partial or full refund if the final deliverable significantly deviates from the agreed scope and cannot be rectified.</li>
              </ul>
            </PolicySection>

            <PolicySection icon={<FileText size={18} />} heading="Marketplace Items">
              <p className="font-semibold text-foreground/75 mb-2">Digital Products Policy:</p>
              <p>
                Due to the nature of digital downloads, generally <strong>all sales are final</strong> once the file has been downloaded.
              </p>
              <p className="mt-2">
                <strong>Exceptions:</strong> Refunds may be granted if the file is technically defective (corrupt or missing files) and our support team cannot fix it.
              </p>
            </PolicySection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PolicySection icon={<Globe size={18} />} heading="Domain Charges">
              <p>
                Domain registration fees are fixed and set by the registrar. These charges are <strong>non-negotiable and non-refundable</strong> once the domain has been purchased. Domain names cannot be changed or edited after registration.
              </p>
            </PolicySection>

            <PolicySection icon={<HardDrive size={18} />} heading="Data Retention">
              <p>
                We retain project files and backups for a period of <strong>6 months</strong> from the date of completion. After this period, files will be permanently deleted from our servers to ensure data privacy and optimize storage. Clients are advised to download and secure their files immediately upon delivery.
              </p>
            </PolicySection>
          </div>

          <PolicySection icon={<XCircle size={18} />} heading="General Non-Refundable Scenarios" statusColor="#f87171">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Change of mind after project kickoff or file download.</li>
                <li>Delays caused by client (e.g., failure to provide requirements).</li>
              </ul>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Completed projects that were approved at the mockup/staging phase.</li>
                <li>Third-party fees (e.g., Domain registration costs, Hosting fees) incurred on your behalf.</li>
              </ul>
            </div>
          </PolicySection>

          {/* Contact / Action Card */}
          <div className="glass-card p-8 md:p-10 text-center">
            <h2 className="text-xl font-display font-bold text-foreground mb-3">Requesting a Refund</h2>
            <p className="text-foreground/45 text-sm mb-6 max-w-xl mx-auto">
              If you believe you are eligible for a refund based on the criteria above, please submit a request immediately. Include your <strong>Order ID</strong> and a detailed explanation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <a
                href={`mailto:${INITIAL_CONTACT_INFO.email}?subject=Refund Request`}
                className="vb-btn-primary px-6 py-2.5 flex items-center justify-center gap-2"
              >
                <Mail size={16} /> Email Support
              </a>
              <div className="h-px w-10 bg-black/10 sm:h-10 sm:w-px" />
              <div className="text-left">
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-0.5">Direct Contact</p>
                <p className="text-foreground/70 font-mono text-sm">{INITIAL_CONTACT_INFO.email}</p>
                <p className="text-foreground/50 text-xs mt-0.5">Instagram: @{INITIAL_CONTACT_INFO.instagram}</p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-foreground/30">
              <Clock size={12} />
              <span>Processing Time: Refunds are typically processed within 5-7 business days to the original payment method.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
