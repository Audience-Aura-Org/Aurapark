import AuditLog from '@/lib/models/AuditLog';

export class AuditService {
    /**
     * Record a system event
     */
    static async log({
        userId,
        action,
        resource,
        resourceId,
        details,
        req
    }: {
        userId?: any;
        action: string;
        resource: string;
        resourceId?: string;
        details?: any;
        req?: Request;
    }) {
        try {
            const ipAddress = req?.headers.get('x-forwarded-for') || 'unknown';
            const userAgent = req?.headers.get('user-agent') || 'unknown';

            await AuditLog.create({
                userId,
                action,
                resource,
                resourceId,
                details,
                ipAddress,
                userAgent
            });
        } catch (error) {
            // We don't want audit logging failures to crash the main request
            console.error('Audit Logging Failed:', error);
        }
    }
}
