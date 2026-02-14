'use client';

interface PaymentSummaryProps {
    amount: number;
    platformFee: number;
    currency?: string;
}

export default function PaymentSummary({ amount, platformFee }: PaymentSummaryProps) {
    const total = amount + platformFee;

    return (
        <div className="glass p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
            <h3 className="text-xl font-black text-white tracking-tight">Order Summary</h3>

            <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-400">Base Fare</span>
                    <span className="text-white">${amount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-400">Service & Tech Fee</span>
                    <span className="text-white">${platformFee.toFixed(2)}</span>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-between items-center group-hover:border-white/10 transition-colors">
                <div>
                    <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1">Total Payable</div>
                    <div className="text-xs text-gray-500 font-bold">Inc. VAT & Insurance</div>
                </div>
                <div className="text-4xl font-black text-white tracking-tighter">
                    ${total.toFixed(2)}
                </div>
            </div>

            <div className="bg-success/5 border border-success/10 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success text-xs">✓</div>
                <div className="text-[10px] font-bold text-success/80 uppercase tracking-widest leading-tight">
                    Price Guarantee: Your fare is locked for 10 minutes.
                </div>
            </div>
        </div>
    );
}
