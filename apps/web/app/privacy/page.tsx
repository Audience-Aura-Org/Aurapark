import { PageHeader } from '@/components/PageHeader';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-mesh-green pt-20 safe-bottom-nav">
            <div className="container-custom py-16 space-y-12">
                <PageHeader
                    title="Privacy Policy"
                    subtitle="How we collect, use, and protect your data"
                />

                <div className="glass-panel p-12 max-w-4xl mx-auto space-y-8">
                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">1. Information We Collect</h2>
                        <p className="text-neutral-700 leading-relaxed">
                            We collect information you provide directly to us, including your name, email address, phone number,
                            and payment information when you create an account or make a booking. We also collect information
                            about your usage of our services, including trip history and preferences.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">2. How We Use Your Information</h2>
                        <p className="text-neutral-700 leading-relaxed mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                            <li>Process your bookings and payments</li>
                            <li>Send you booking confirmations and updates</li>
                            <li>Improve our services and user experience</li>
                            <li>Communicate with you about promotions and updates</li>
                            <li>Ensure the security and integrity of our platform</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">3. Data Security</h2>
                        <p className="text-neutral-700 leading-relaxed">
                            We implement industry-standard security measures to protect your personal information. All payment
                            information is encrypted and processed through secure payment gateways. We regularly review and
                            update our security practices to ensure your data remains protected.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">4. Information Sharing</h2>
                        <p className="text-neutral-700 leading-relaxed">
                            We do not sell your personal information. We may share your information with transport agencies
                            to fulfill your bookings, with payment processors to handle transactions, and with service providers
                            who assist us in operating our platform. All third parties are required to maintain the confidentiality
                            of your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">5. Your Rights</h2>
                        <p className="text-neutral-700 leading-relaxed">
                            You have the right to access, update, or delete your personal information at any time. You can
                            manage your account settings or contact our support team for assistance. You may also opt out of
                            marketing communications while still receiving essential service-related messages.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">6. Contact Us</h2>
                        <p className="text-neutral-700 leading-relaxed">
                            If you have any questions about this Privacy Policy or our data practices, please contact us at
                            privacy@antigravity-transport.com or through our support channels.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-white/30">
                        <p className="text-sm text-neutral-600">
                            Last updated: February 5, 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
