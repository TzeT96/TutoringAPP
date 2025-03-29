import { createMocks } from 'node-mocks-http';
import verifyCodeHandler from '../verify-code';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// Mock Prisma
vi.mock('../../../lib/prisma', () => ({
  default: {
    verificationCode: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('/api/verify-code', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates verification code', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        code: 'VALID123',
      },
    });

    const mockVerificationCode = {
      id: 1,
      code: 'VALID123',
      sessionId: 'session123',
      expiresAt: new Date(Date.now() + 3600000),
      used: false,
    };

    (prisma.verificationCode.findUnique as any).mockResolvedValueOnce(mockVerificationCode);
    (prisma.verificationCode.update as any).mockResolvedValueOnce({ ...mockVerificationCode, used: true });

    await verifyCodeHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        sessionId: 'session123',
      })
    );
  });

  it('rejects invalid method', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await verifyCodeHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: 'Method not allowed',
      })
    );
  });

  it('rejects missing code', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {},
    });

    await verifyCodeHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: 'Verification code is required',
      })
    );
  });

  it('rejects expired code', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        code: 'EXPIRED123',
      },
    });

    const mockVerificationCode = {
      id: 2,
      code: 'EXPIRED123',
      sessionId: 'session456',
      expiresAt: new Date(Date.now() - 3600000),
      used: false,
    };

    (prisma.verificationCode.findUnique as any).mockResolvedValueOnce(mockVerificationCode);

    await verifyCodeHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: 'Verification code has expired',
      })
    );
  });

  it('rejects used code', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        code: 'USED123',
      },
    });

    const mockVerificationCode = {
      id: 3,
      code: 'USED123',
      sessionId: 'session789',
      expiresAt: new Date(Date.now() + 3600000),
      used: true,
    };

    (prisma.verificationCode.findUnique as any).mockResolvedValueOnce(mockVerificationCode);

    await verifyCodeHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: 'Verification code has already been used',
      })
    );
  });
}); 