export enum UserRole {
    ADMIN = 'ADMIN',
    AGENCY_STAFF = 'AGENCY_STAFF',
    DRIVER = 'DRIVER',
    USER = 'USER'
}

export enum AgencyStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    REJECTED = 'REJECTED'
}

export enum TripStatus {
    SCHEDULED = 'SCHEDULED',
    EN_ROUTE = 'EN_ROUTE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum SeatType {
    STANDARD = 'STANDARD',
    VIP = 'VIP',
    SLEEPER = 'SLEEPER',
    EMPTY = 'EMPTY'
}

export enum BusType {
    STANDARD = 'STANDARD',
    VIP_1 = 'VIP 1',
    VIP_2 = 'VIP 2'
}

export enum BusAmenity {
    AC = 'AC',
    WIFI = 'Wifi',
    USB_CHARGING = 'USB Charging',
    FOOD = 'Food/Snacks',
    WATER = 'Water Bottle',
    BLANKET = 'Blanket',
    ENTERTAINMENT = 'TV/Movies',
    TOILET = 'Toilet',
    RECLINING_SEATS = 'Reclining Seats'
}

export enum ReservationStatus {
    PENDING = 'PENDING',
    EXPIRED = 'EXPIRED',
    CONFIRMED = 'CONFIRMED'
}

export enum BookingStatus {
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUND_INITIATED = 'REFUND_INITIATED',
    REFUNDED = 'REFUNDED'
}

export enum DisputeStatus {
    OPEN = 'OPEN',
    UNDER_REVIEW = 'UNDER_REVIEW',
    RESOLVED = 'RESOLVED',
    REJECTED = 'REJECTED'
}

export enum RefundReason {
    USER_CANCELLED = 'USER_CANCELLED',
    TRIP_CANCELLED = 'TRIP_CANCELLED',
    PAYMENT_FAILURE = 'PAYMENT_FAILURE',
    OTHER = 'OTHER'
}

export enum NotificationType {
    BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
    TRIP_ADVISORY = 'TRIP_ADVISORY',
    CANCELLATION_NOTICE = 'CANCELLATION_NOTICE',
    PAYMENT_ALERT = 'PAYMENT_ALERT'
}

export enum NotificationStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED',
    DELIVERED = 'DELIVERED'
}

export enum FuelType {
    DIESEL = 'DIESEL',
    PETROL = 'PETROL'
}

export enum MaintenanceType {
    ROUTINE = 'ROUTINE',
    REPAIR = 'REPAIR',
    INSPECTION = 'INSPECTION',
    PREVENTIVE = 'PREVENTIVE'
}

export enum MaintenanceStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum ShipmentStatus {
    PENDING = 'PENDING',
    RECEIVED = 'RECEIVED',
    EN_ROUTE = 'EN_ROUTE',
    ARRIVED = 'ARRIVED',
    DELIVERED = 'DELIVERED',
    COLLECTED = 'COLLECTED',
    CANCELLED = 'CANCELLED'
}

export enum PromoStatus {
    ACTIVE = 'ACTIVE',
    SCHEDULED = 'SCHEDULED',
    EXPIRED = 'EXPIRED',
    DISABLED = 'DISABLED'
}

export enum SupportTicketStatus {
    OPEN = 'OPEN',
    PENDING = 'PENDING',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED'
}

export enum SupportTicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}
