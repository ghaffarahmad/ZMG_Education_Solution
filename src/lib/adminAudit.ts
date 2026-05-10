import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import AuditLog from "@/models/AuditLog";

type AdminIdentity = {
  id?: string;
  email?: string;
  name?: string;
};

function parseCookieHeader(header: string | null) {
  if (!header) return new Map<string, string>();

  return new Map(
    header.split(";").map((item) => {
      const [key, ...value] = item.trim().split("=");
      return [key, decodeURIComponent(value.join("="))] as const;
    })
  );
}

export async function getAdminIdentity(request?: Request): Promise<AdminIdentity | null> {
  const tokenFromHeader = parseCookieHeader(request?.headers.get("cookie") || null).get("admin_token");
  const token = tokenFromHeader || (await cookies()).get("admin_token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    id: typeof payload.id === "string" ? payload.id : undefined,
    email: typeof payload.email === "string" ? payload.email : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined,
  };
}

export function formatAdmin(identity: AdminIdentity | null) {
  if (!identity) return "Unknown Admin";
  return identity.name || identity.email || identity.id || "Unknown Admin";
}

export async function writeAuditLog(input: {
  request?: Request;
  action: string;
  recordType?: string;
  recordId?: string;
  success: boolean;
  reason?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const admin = await getAdminIdentity(input.request);
    await AuditLog.create({
      adminUser: formatAdmin(admin),
      action: input.action,
      recordType: input.recordType,
      recordId: input.recordId,
      success: input.success,
      reason: input.reason,
      metadata: input.metadata,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
