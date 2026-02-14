import Link from 'next/link';
import { Button } from '@/components/Button';

export default function ErrorPage() {
    return (
        <div className="min-h-screen liquid-gradient flex items-center justify-center p-8">
            <div className="max-w-2xl w-full glass p-12 text-center">
                <div className="text-8xl mb-6">⚠️</div>
                <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Oops!</h1>
                <h2 className="text-2xl font-black text-accent mb-6">Something Went Wrong</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    We encountered an unexpected error. This could be due to an expired session,
                    invalid booking code, or a temporary system issue.
                </p>

                <div className="space-y-4">
                    <div className="p-6 bg-white/5 rounded-2xl text-left">
                        <h3 className="text-white font-black mb-3">Common Issues:</h3>
                        <ul className="text-sm text-gray-400 space-y-2">
                            <li>• Your booking may have expired or been cancelled</li>
                            <li>• The trip you're looking for may no longer be available</li>
                            <li>• Your session may have timed out</li>
                        </ul>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Link href="/" className="flex-1">
                            <Button variant="secondary" className="w-full">Go Home</Button>
                        </Link>
                        <Link href="/search" className="flex-1">
                            <Button className="w-full">Browse Trips</Button>
                        </Link>
                    </div>

                    <Link href="/tickets" className="block">
                        <Button variant="outline" className="w-full">Lookup My Booking</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
