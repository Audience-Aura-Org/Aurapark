export default function AgencyDriversPage() {
  return (
    <div className="min-h-screen bg-mesh-green pt-20 safe-bottom-nav">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3">
          Drivers
        </h1>
        <p className="text-sm text-neutral-700">
          This page is a simple placeholder for managing and viewing drivers.
          You already have detailed stats under <code>/agency/drivers/stats</code>;
          you can later route into that view or add a full directory from here.
        </p>
      </div>
    </div>
  );
}

