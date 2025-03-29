import { renderWithProviders } from '@/utils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AdminDashboard from '../../admin';

describe('AdminDashboard', () => {
  const mockSession = {
    user: {
      email: 'admin@example.com',
      role: 'admin',
    },
    expires: '1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('generates verification code', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ code: 'ABC123' }),
    });

    renderWithProviders(<AdminDashboard />, { session: mockSession });
    
    const generateButton = screen.getByRole('button', { name: /generate new code/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('ABC123')).toBeInTheDocument();
    });
  });
}); 