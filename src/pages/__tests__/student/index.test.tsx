import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import StudentPage from '../../student/index';
import { renderWithProviders } from '../../../utils/testing';

// Mock next/router
const mockRouter = {
  push: vi.fn(),
  query: {},
};

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

describe('StudentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.push.mockClear();
  });

  it('renders verification form', () => {
    renderWithProviders(<StudentPage />);
    expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your verification code')).toBeInTheDocument();
    expect(screen.getByText('Start Session')).toBeInTheDocument();
  });

  it('handles successful verification', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ sessionId: '123' }),
    });
    global.fetch = mockFetch;

    renderWithProviders(<StudentPage />);

    const input = screen.getByPlaceholderText('Enter your verification code');
    const button = screen.getByText('Start Session');

    fireEvent.change(input, { target: { value: 'VALID123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/student/session/VALID123');
    });
  });

  it('handles verification error', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Verification failed' }),
    });
    global.fetch = mockFetch;

    renderWithProviders(<StudentPage />);

    const input = screen.getByPlaceholderText('Enter your verification code');
    const button = screen.getByText('Start Session');

    fireEvent.change(input, { target: { value: 'INVALID' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Verification failed')).toBeInTheDocument();
    });
  });
}); 