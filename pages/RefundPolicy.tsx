import React from 'react';
import { Card, Button } from '../components/ui/Components';
import { ScrollFloat } from '../components/ui/ReactBits';
import { CheckCircle, XCircle, Clock, Mail, ShieldAlert, FileText, Globe, HardDrive } from 'lucide-react';
import { INITIAL_CONTACT_INFO } from '../constants';

const RefundPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            <ScrollFloat>Refund & Cancellation Policy</ScrollFloat>
        </h1>
        <p className="text-foreground/50">Clear, fair, and transparent policies for our clients.</p>
      </div>

      <div className="space-y-8">
        <Card className="p-8 border-l-2 border-l-foreground bg-content2/40">
            <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <ShieldAlert className="text-foreground/75" /> Our Commitment
            </h2>
            <p className="text-foreground/75 leading-relaxed text-justify">
                Vision Built is committed to delivering exceptional software solutions. We understand that sometimes things don't go as planned. This policy outlines when refunds are applicable for our <strong>Services</strong> (Custom Development) and <strong>Marketplace</strong> (Digital Products).
            </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Services Section */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-divider pb-2">Service Orders</h3>
                
                <Card className="p-6 h-full">
                    <div className="flex items-center gap-3 mb-4 text-success">
                        <CheckCircle size={24} />
                        <h4 className="font-bold text-foreground">Eligible for Refund</h4>
                    </div>
                    <ul className="list-disc list-inside text-sm text-foreground/60 space-y-3 text-justify">
                        <li><strong>Order Cancellation:</strong> Full refund is eligible provided no work has commenced on the project.</li>
                        <li><strong>Non-Delivery:</strong> Full refund if we fail to initiate the project after payment confirmation.</li>
                        <li><strong>Major Deviation:</strong> Partial or full refund if the final deliverable significantly deviates from the agreed scope of work and cannot be rectified.</li>
                    </ul>
                </Card>
            </div>

            {/* Marketplace Section */}
             <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-divider pb-2">Marketplace Items</h3>

                <Card className="p-6 h-full">
                    <div className="flex items-center gap-3 mb-4 text-foreground/70">
                         <FileText size={24} />
                         <h4 className="font-bold text-foreground">Digital Product Policy</h4>
                    </div>
                    <p className="text-sm text-foreground/60 mb-4 text-justify">
                        Due to the nature of digital downloads, generally <strong>all sales are final</strong> once the file has been downloaded.
                    </p>
                    <ul className="list-disc list-inside text-sm text-foreground/60 space-y-3 text-justify">
                        <li><strong>Exceptions:</strong> Refunds may be granted if the file is technically defective (corrupt, missing files) and our support team cannot fix it.</li>
                    </ul>
                </Card>
            </div>
        </div>

        {/* Domain & Backup Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="p-6">
                <div className="flex items-center gap-3 mb-3 text-foreground/70">
                    <Globe size={24} />
                    <h3 className="font-bold text-foreground">Domain Charges</h3>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed text-justify">
                    Domain registration fees are fixed and set by the registrar. These charges are <strong>non-negotiable and non-refundable</strong> once the domain has been purchased. Domain names cannot be changed or edited after registration.
                </p>
            </Card>

            <Card className="p-6">
                <div className="flex items-center gap-3 mb-3 text-foreground/70">
                    <HardDrive size={24} />
                    <h3 className="font-bold text-foreground">Data Retention</h3>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed text-justify">
                    We retain project files and backups for a period of <strong>6 months</strong> from the date of completion. After this period, files will be permanently deleted from our servers to ensure data privacy and optimize storage. Clients are advised to download and secure their files immediately upon delivery.
                </p>
            </Card>
        </div>

        <Card className="p-6 mt-6">
             <div className="flex items-center gap-3 mb-3 text-danger/90">
                <XCircle size={24} />
                <h3 className="font-bold text-foreground">General Non-Refundable Scenarios</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground/60">
                <ul className="list-disc list-inside space-y-2 text-justify">
                    <li>Change of mind after project kickoff or file download.</li>
                    <li>Delays caused by client (e.g., failure to provide requirements).</li>
                </ul>
                <ul className="list-disc list-inside space-y-2 text-justify">
                     <li>Completed projects that were approved at the mockup/staging phase.</li>
                     <li>Third-party fees (e.g., Domain registration costs, Hosting fees) incurred on your behalf.</li>
                </ul>
            </div>
        </Card>

        <Card className="p-8 text-center bg-content2 border border-divider">
            <h2 className="text-2xl font-bold text-foreground mb-4">Requesting a Refund</h2>
            <p className="text-foreground/75 mb-8 max-w-2xl mx-auto">
                If you believe you are eligible for a refund based on the criteria above, please submit a request immediately. 
                Include your <strong>Order ID</strong> and a detailed explanation.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <a href={`mailto:${INITIAL_CONTACT_INFO.email}?subject=Refund Request`} className="group">
                    <Button size="lg" className="w-full sm:w-auto" variant="primary">
                        <Mail className="mr-2" /> Email Support
                    </Button>
                </a>
                
                <div className="h-px w-10 bg-divider sm:h-10 sm:w-px"></div>

                <div className="text-left">
                    <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">Direct Contact</p>
                    <p className="text-foreground font-mono text-sm">{INITIAL_CONTACT_INFO.email}</p>
                    <p className="text-foreground/75 text-sm mt-0.5">@{INITIAL_CONTACT_INFO.instagram}</p>
                </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-foreground/45">
                 <Clock size={12} />
                 <span>Processing Time: Refunds are typically processed within 5-7 business days to the original payment method.</span>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicy;
