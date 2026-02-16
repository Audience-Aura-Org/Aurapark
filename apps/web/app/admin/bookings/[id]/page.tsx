import Link from 'next/link';
import { Button } from '@/components/Button';

interface AdminBookingDetailPageProps {
  params: { id: string };
}

export default function AdminBookingDetailPage({ params }: AdminBookingDetailPageProps) {
  const { id } = params;

  return (
    <div className="min-h-screen bg-mesh-green pt-20 safe-bottom-nav">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-neutral-900">
              Booking Detail
            </h1>
            <p className="text-sm text-neutral-600">
              Admin view for booking <span className="font-mono text-neutral-800">{id}</span>.
              This page is a placeholder target so booking links don&apos;t 404.
            </p>
          </div>
          <Link href="/admin/bookings">
            <Button variant="glass" size="sm">
              Back to Bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

