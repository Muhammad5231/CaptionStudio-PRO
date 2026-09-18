import { prisma } from '@captionstudio/database';

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function recordAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        resource: params.resource,
        details: params.details ? JSON.stringify(params.details) : undefined,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (err) {
    // Non-blocking: audit log failure should not crash main transaction
    console.error('[AuditLog Error]', err);
  }
}

