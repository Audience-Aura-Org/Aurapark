import Link from 'next/link';
import { Button } from '@/components/Button';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-mesh-green flex items-center justify-center pt-20">
            <div className="text-center space-y-8 p-8">
                <div className="glass-panel-strong p-16 rounded-3xl max-w-2xl mx-auto">
                    {/* 404 Illustration */}
                    <div className="mb-8">
                        <div className="text-[120px] font-black text-gradient-green leading-none">404</div>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-500 rounded-3xl flex items-center justify-center shadow-glass-lg">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Message */}
                    <h1 className="text-3xl font-black text-neutral-900 mb-4">Page Not Found</h1>
                    <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-4 justify-center">
                        <Link href="/">
                            <Button variant="primary" size="lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Go Home
                            </Button>
                        </Link>
                        <Link href="/search">
                            <Button variant="glass" size="lg">
                                Search Trips
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Floating Orbs */}
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>
        </div>
    );
}
