'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';

export default function DriverScanPage() {
  return (
    <div className="min-h-screen bg-mesh-green pt-20 safe-bottom-nav">
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-4">
        <h1 className="text-2xl md:text-3xl font-black text-neutral-900">
          Scan Tickets
        </h1>
        <p className="text-sm text-neutral-700">
          This is a placeholder screen for a future QR / ticket scanning flow for drivers.
          The bottom navigation now points to a real page; you can plug in camera access
          and validation against your tickets API here later.
        </p>
        <Link href="/driver/trips">
          <Button variant="primary" size="sm">
            View My Trips
          </Button>
        </Link>
      </div>
    </div>
  );
}

