import { PageHeader } from '@/components/PageHeader';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-mesh-green pt-20 safe-bottom-nav">
            <div className="container-custom py-16 space-y-12">
                <PageHeader
                    title="Terms of Service"
                    subtitle="Terms and conditions for using our platform"
                />

                <div className="glass-panel p-12 max-w-4xl mx-auto space-y-8">
                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-neutral-700 leading-relaxed">
                            By accessing and using the Aura Park platform, you accept and agree to be bound by
                            these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">2. User Accounts</h2>
                        <p className="text-neutral-700 leading-relaxed mb-4">
                            To use certain features of our platform, you must create an account. You agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Be responsible for all activities under your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">3. Booking and Payments</h2>
                        <p className="text-neutral-700 leading-relaxed">
                            All bookings are subject to availability and confirmation. Prices are displayed in the local currency
                            and include applicable taxes. Payment must be made at the time of booking. We reserve the right to
                            cancel bookings in case of technical errors or unavailability.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">4. Cancellation and Refunds</h2>
                        <p className="text-neutral-700 leading-relaxed">
                            Cancellation policies vary by transport agency. Free cancellations are typically available up to
                            24 hours before departure. Refunds are processed within 7-10 business days. Please review the
                            specific cancellation policy for each booking before confirming.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">5. User Conduct</h2>
                        <p className="text-neutral-700 leading-relaxed mb-4">
                            You agree not to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-neutral-700 ml-4">
                            <li>Use the platform for any illegal purposes</li>
                            <li>Attempt to interfere with the platform's functionality</li>
                            <li>Impersonate others or provide false information</li>
                            <li>Engage in fraudulent activities</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">6. Limitation of Liability</h2>
                        <p className="text-neutral-700 leading-relaxed">
                            Aura Park acts as an intermediary between users and transport agencies. We are not
                            responsible for the quality, safety, or timeliness of transportation services provided by agencies.
                            Our liability is limited to the amount paid for the booking.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">7. Changes to Terms</h2>
                        <p className="text-neutral-700 leading-relaxed">
                            We reserve the right to modify these terms at any time. Changes will be effective immediately upon
                            posting. Your continued use of the platform constitutes acceptance of the modified terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-neutral-900 mb-4">8. Contact Information</h2>
                        <p className="text-neutral-700 leading-relaxed">
                            For questions about these Terms of Service, please contact us at support@aurapark.com.
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
