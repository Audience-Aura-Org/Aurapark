'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';

export default function DriverManifestPage() {
  return (
    <div className="min-h-screen bg-mesh-green pt-20 safe-bottom-nav">
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-4">
        <h1 className="text-2xl md:text-3xl font-black text-neutral-900">
          Passenger Manifest
        </h1>
        <p className="text-sm text-neutral-700">
          This page acts as a hub for driver manifests. Use the &quot;My Trips&quot; screen
          to open the detailed manifest for a specific trip – this hub simply ensures the
          navigation tab goes to a valid route.
        </p>
        <Link href="/driver/trips">
          <Button variant="primary" size="sm">
            Go to My Trips
          </Button>
        </Link>
      </div>
    </div>
  );
}

