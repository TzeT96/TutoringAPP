import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import NewSessionPage from '../../../admin/sessions/new';

// Mock next-auth
vi.mock('next-auth/react');
const mockUseSession = useSession as unknown as ReturnType<typeof vi.fn>;

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));
const mockUseRouter = useRouter as unknown as ReturnType<typeof vi.fn>;

describe('NewSessionPage', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
  };

  beforeEach(() => {
    mockUseRouter.mockReturnValue(mockRouter);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows access denied when not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    
    render(<NewSessionPage />);
    
    expect(screen.getByText('Access Denied')).toBeDefined();
    expect(screen.getByText('Please sign in to create a new session.')).toBeDefined();
  });

  it('allows creating a new session when authenticated', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      status: 'authenticated',
    });

    const mockResponse = { id: 'test-id', code: 'TEST123' };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<NewSessionPage />);

    const input = screen.getByRole('textbox', { name: /session code/i });
    const submitButton = screen.getByRole('button', { name: /create session/i });

    fireEvent.change(input, { target: { value: 'TEST123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: 'TEST123' }),
      });
      expect(mockPush).toHaveBeenCalledWith('/admin/sessions/test-id');
    });
  });

  it('shows error message when session creation fails', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      status: 'authenticated',
    });

    const errorMessage = 'Session code already exists';
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: errorMessage }),
    });

    render(<NewSessionPage />);

    const input = screen.getByRole('textbox', { name: /session code/i });
    const submitButton = screen.getByRole('button', { name: /create session/i });

    fireEvent.change(input, { target: { value: 'TEST123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeDefined();
    });
  });
}); 