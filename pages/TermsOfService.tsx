
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Components';
import { ScrollFloat } from '../components/ui/ReactBits';
import { FileText, Gavel, Copyright, AlertTriangle, CreditCard, Mail, Database } from 'lucide-react';
import { INITIAL_CONTACT_INFO } from '../constants';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-4">
            <ScrollFloat>Terms & Conditions</ScrollFloat>
        </h1>
        <p className="text-gray-400">Effective Date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-8">
        <Card className="p-8">
            <div className="flex items-center gap-3 mb-4 text-vision-primary">
                <FileText size={24} />
                <h2 className="text-xl font-bold text-white">1. Agreement to Terms</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-justify">
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and <strong>Vision Built</strong> (“we,” “us” or “our”), concerning your access to and use of the <em>visionbuilt.in</em> website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
            </p>
            <p className="text-gray-300 mt-2 text-justify">
                By accessing the Site, you agree that you have read, understood, and agreed to be bound by all of these Terms of Service.
            </p>
        </Card>

        <Card className="p-8">
            <div className="flex items-center gap-3 mb-4 text-vision-primary">
                <Copyright size={24} />
                <h2 className="text-xl font-bold text-white">2. Intellectual Property Rights</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4 text-justify">
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us.
            </p>
            <p className="text-gray-300 leading-relaxed text-justify">
                <strong>Project Ownership:</strong> Upon full payment for Custom Software or Design services, ownership of the final deliverables is transferred to the client. However, Vision Built retains the right to use the work for portfolio and marketing purposes unless a Non-Disclosure Agreement (NDA) is signed prior to the project commencement.
            </p>
        </Card>

        <Card className="p-8">
            <div className="flex items-center gap-3 mb-4 text-vision-primary">
                <Gavel size={24} />
                <h2 className="text-xl font-bold text-white">3. User Representations</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-justify">
                By using the Site, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-2 mt-2 text-justify">
                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                <li>You are not a minor in the jurisdiction in which you reside.</li>
                <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</li>
                <li>You will not use the Site for any illegal or unauthorized purpose.</li>
            </ul>
        </Card>

        <Card className="p-8">
            <div className="flex items-center gap-3 mb-4 text-vision-primary">
                <CreditCard size={24} />
                <h2 className="text-xl font-bold text-white">4. Payment and Fees</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-justify">
                We accept payments through various online payment methods including Credit/Debit cards and Razorpay. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site.
            </p>
            <p className="text-gray-300 mt-4 leading-relaxed text-justify">
                <strong>Domain Charges:</strong> Domain registration fees are fixed and non-changeable. Once a domain is purchased on your behalf, the fee is non-refundable and the domain name cannot be altered.
            </p>
            <p className="text-gray-300 mt-4 text-justify">
                We maintain a strict refund policy to ensure fairness. For details regarding cancellations, eligible refunds, and non-refundable items, please refer to our full <Link to="/refund-policy" className="text-vision-primary hover:underline">Refund Policy</Link>.
            </p>
        </Card>

        <Card className="p-8">
            <div className="flex items-center gap-3 mb-4 text-vision-primary">
                <Database size={24} />
                <h2 className="text-xl font-bold text-white">5. Project Retention & Hosting</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-justify">
                <strong>File Backup:</strong> We provide a complimentary backup of your project files for a period of <strong>6 months</strong> from the date of completion. After this 6-month period, all project files will be permanently deleted from our secure storage.
            </p>
            <p className="text-gray-300 mt-2 leading-relaxed text-justify">
                It is the client's sole responsibility to download, back up, and secure their project files upon delivery. Vision Built is not liable for any data loss occurring after this retention period.
            </p>
        </Card>

        <Card className="p-8 bg-white/5 border border-white/10">
             <div className="flex items-center gap-3 mb-4 text-vision-primary">
                <Mail size={24} />
                <h2 className="text-xl font-bold text-white">6. Contact Us</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-justify">
                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="text-white font-mono">{INITIAL_CONTACT_INFO.email}</p>
                 </div>
                 <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                    <p className="text-xs text-gray-500 uppercase">Instagram</p>
                    <p className="text-white font-mono">@{INITIAL_CONTACT_INFO.instagram}</p>
                 </div>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
