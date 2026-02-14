'use client';

interface Seat {
    seatNumber: string;
    type: string;
    row: number;
    column: number;
    isAvailable: boolean;
}

interface SeatMapProps {
    seatMap: {
        rows: number;
        columns: number;
        seats: Seat[];
    };
    selectedSeats?: string[];
    onSeatSelect?: (seatNumber: string) => void;
}

export default function SeatMap({ seatMap, selectedSeats = [], onSeatSelect }: SeatMapProps) {
    const getSeatColor = (seat: Seat) => {
        if (!seat.isAvailable) return 'bg-gray-600 cursor-not-allowed';
        if (selectedSeats.includes(seat.seatNumber)) return 'bg-green-500 hover:bg-green-600';

        switch (seat.type) {
            case 'VIP':
                return 'bg-purple-500 hover:bg-purple-600';
            case 'SLEEPER':
                return 'bg-blue-500 hover:bg-blue-600';
            case 'EMPTY':
                return 'bg-transparent cursor-default';
            default:
                return 'bg-gray-400 hover:bg-gray-500';
        }
    };

    const handleSeatClick = (seat: Seat) => {
        if (seat.isAvailable && seat.type !== 'EMPTY' && onSeatSelect) {
            onSeatSelect(seat.seatNumber);
        }
    };

    // Create grid
    const grid: (Seat | null)[][] = Array(seatMap.rows)
        .fill(null)
        .map(() => Array(seatMap.columns).fill(null));

    // Place seats in grid
    seatMap.seats.forEach(seat => {
        if (seat.row < seatMap.rows && seat.column < seatMap.columns) {
            grid[seat.row][seat.column] = seat;
        }
    });

    return (
        <div className="glass p-6">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Seat Layout</h3>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-400 rounded"></div>
                        <span className="text-gray-300">Standard</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500 rounded"></div>
                        <span className="text-gray-300">VIP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded"></div>
                        <span className="text-gray-300">Sleeper</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded"></div>
                        <span className="text-gray-300">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-600 rounded"></div>
                        <span className="text-gray-300">Unavailable</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="inline-block">
                    {grid.map((row, rowIdx) => (
                        <div key={rowIdx} className="flex gap-2 mb-2">
                            {row.map((seat, colIdx) => (
                                <div key={colIdx} className="relative">
                                    {seat && seat.type !== 'EMPTY' ? (
                                        <button
                                            onClick={() => handleSeatClick(seat)}
                                            disabled={!seat.isAvailable}
                                            className={`w-12 h-12 rounded transition-all ${getSeatColor(seat)} ${seat.isAvailable && seat.type !== 'EMPTY' ? 'cursor-pointer' : ''
                                                }`}
                                            title={`${seat.seatNumber} - ${seat.type}`}
                                        >
                                            <span className="text-xs text-white font-semibold">
                                                {seat.seatNumber}
                                            </span>
                                        </button>
                                    ) : (
                                        <div className="w-12 h-12"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
