import { Button } from '@/components/Button';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-mesh-green flex items-center justify-center">
            <div className="text-center space-y-8 p-8">
                <div className="glass-panel-strong p-16 rounded-3xl max-w-2xl mx-auto">
                    {/* Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="w-32 h-32 bg-gradient-to-br from-warning-400 to-warning-500 rounded-3xl flex items-center justify-center shadow-glass-lg animate-pulse">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Message */}
                    <h1 className="text-4xl font-black text-neutral-900 mb-4">Under Maintenance</h1>
                    <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
                        We're currently performing scheduled maintenance to improve your experience.
                        We'll be back shortly!
                    </p>

                    {/* Estimated Time */}
                    <div className="glass-panel p-6 max-w-sm mx-auto mb-8">
                        <div className="text-sm font-bold text-neutral-600 uppercase tracking-wide mb-2">Estimated Downtime</div>
                        <div className="text-3xl font-black text-neutral-900">2 Hours</div>
                    </div>

                    {/* Contact */}
                    <p className="text-sm text-neutral-600">
                        Need urgent assistance? Contact us at{' '}
                        <a href="mailto:support@antigravity-transport.com" className="text-primary-600 font-bold hover:underline">
                            support@antigravity-transport.com
                        </a>
                    </p>
                </div>

                {/* Floating Orbs */}
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>
        </div>
    );
}
