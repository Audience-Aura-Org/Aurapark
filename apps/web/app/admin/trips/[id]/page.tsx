import Link from 'next/link';
import { Button } from '@/components/Button';

interface AdminTripDetailPageProps {
  params: { id: string };
}

export default function AdminTripDetailPage({ params }: AdminTripDetailPageProps) {
  const { id } = params;

  return (
    <div className="min-h-screen bg-mesh-green pt-20 safe-bottom-nav">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-neutral-900">
              Trip Detail
            </h1>
            <p className="text-sm text-neutral-600">
              Admin view for trip <span className="font-mono text-neutral-800">{id}</span>.
              This is a lightweight placeholder so trip links resolve correctly.
            </p>
          </div>
          <Link href="/admin/trips">
            <Button variant="glass" size="sm">
              Back to Trips
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

