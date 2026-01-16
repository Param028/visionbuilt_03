
import React from 'react';
import { Card } from '../components/ui/Components';
import { ScrollFloat } from '../components/ui/ReactBits';
import { Shield, Lock, Eye, Database, Mail } from 'lucide-react';
import { INITIAL_CONTACT_INFO } from '../constants';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-4">
            <ScrollFloat>Privacy Policy</ScrollFloat>
        </h1>
        <p className="text-gray-400">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-8">
        <Card className="p-8">
            <div className="flex items-center gap-3 mb-4 text-vision-primary">
                <Shield size={24} />
                <h2 className="text-xl font-bold text-white">1. Introduction</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-justify">
                Welcome to <strong>Vision Built</strong>. We value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website <em>visionbuilt.in</em> or use our services.
            </p>
        </Card>

        <Card className="p-8">
            <div className="flex items-center gap-3 mb-4 text-vision-primary">
                <Database size={24} />
                <h2 className="text-xl font-bold text-white">2. Data Collection</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4 text-justify">
                We collect the following types of information:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-2 text-justify">
                <li><strong>Identity Data:</strong> Name, username, and social media handles (if provided).</li>
                <li><strong>Contact Data:</strong> Email address and phone number.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and operating system.</li>
                <li><strong>Usage Data:</strong> Information about how you use our website, products, and services.</li>
                <li><strong>Order Data:</strong> Details regarding the services or projects you purchase from us.</li>
            </ul>
        </Card>

        <Card className="p-8">
            <div className="flex items-center gap-3 mb-4 text-vision-primary">
                <Eye size={24} />
                <h2 className="text-xl font-bold text-white">3. How We Use Your Data</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-justify">
                We use your data to:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-2 mt-2 text-justify">
                <li>Process and deliver your orders (Services and Marketplace items).</li>
                <li>Manage your relationship with us, including notifying you about changes to our terms or privacy policy.</li>
                <li>Enable you to partake in a prize draw, competition, or complete a survey.</li>
                <li>Administer and protect our business and this website.</li>
                <li>Deliver relevant website content and advertisements to you.</li>
            </ul>
        </Card>

        <Card className="p-8">
             <div className="flex items-center gap-3 mb-4 text-vision-primary">
                <Lock size={24} />
                <h2 className="text-xl font-bold text-white">4. Data Security</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-justify">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4 text-justify">
                We use secure providers (Supabase, Razorpay) for authentication and payment processing. We do not store sensitive credit card details on our own servers.
            </p>
        </Card>

        <Card className="p-8 bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-4 text-vision-primary">
                <Mail size={24} />
                <h2 className="text-xl font-bold text-white">5. Contact Us</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-justify">
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                    <p className="text-xs text-gray-500 uppercase">Email Support</p>
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

export default PrivacyPolicy;
