import { AuditLog } from '../models/index';

interface AuditLogOptions {
  userId?: number;
  action: string;
  resource: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
}

export async function logAudit({
  userId,
  action,
  resource,
  previousValue,
  newValue,
  ipAddress,
}: AuditLogOptions) {
  try {
    const prevString = previousValue ? JSON.stringify(previousValue) : null;
    const newString = newValue ? JSON.stringify(newValue) : null;
    
    await AuditLog.create({
      userId: userId || null,
      action,
      resource,
      previousValue: prevString,
      newValue: newString,
      ipAddress: ipAddress || '127.0.0.1',
    });
  } catch (error) {
    console.error('Audit Logging failed:', error);
  }
}
