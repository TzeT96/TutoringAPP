import prisma from './prisma';
import { VerificationCode, TutoringSession } from '@prisma/client';

// Define a type that includes the session relation
type VerificationCodeWithSession = VerificationCode & {
  session: TutoringSession | null;
};

/**
 * Helper function to safely find a verification code without using case-insensitive mode
 * which can cause errors in some Prisma versions
 * 
 * @param code The verification code to search for (will be converted to uppercase)
 * @param includeSession Whether to include the session in the result
 * @param onlyActive Whether to only return active (non-used and non-expired) codes
 */
export async function findVerificationCode(
  code: string, 
  includeSession: boolean = true,
  onlyActive: boolean = true
): Promise<VerificationCodeWithSession | null> {
  // Always convert to uppercase for consistency
  const uppercaseCode = code.toUpperCase();
  
  // Build where clause
  const where: any = {
    code: uppercaseCode // Direct equality check, not an object
  };
  
  // Add filters for active codes if needed
  if (onlyActive) {
    where.isUsed = false;
    where.expiresAt = {
      gt: new Date() // Not expired
    };
  }
  
  // Run the query
  const result = await prisma.verificationCode.findFirst({
    where,
    include: includeSession ? {
      session: true
    } : undefined
  });
  
  return result as VerificationCodeWithSession | null;
}

/**
 * Helper function to safely update a verification code to mark it as used
 */
export async function markVerificationCodeAsUsed(codeId: string) {
  return await prisma.verificationCode.update({
    where: { id: codeId },
    data: { isUsed: true }
  });
}

/**
 * Helper function to update a session status to IN_PROGRESS if it's still PENDING
 */
export async function updateSessionStatus(sessionId: string, newStatus: string) {
  return await prisma.tutoringSession.update({
    where: { id: sessionId },
    data: { status: newStatus }
  });
} 