import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import SessionPage from '../../../student/session/[code]';
import { renderWithProviders } from '../../../../utils/testing';

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock MediaRecorder
class MockMediaRecorder {
  static isTypeSupported = () => true;
  start = vi.fn();
  stop = vi.fn();
  ondataavailable: ((event: any) => void) | null = null;
  onstop: (() => void) | null = null;
  state = 'inactive';
  addEventListener = vi.fn();
  removeEventListener = vi.fn();

  constructor() {
    setTimeout(() => {
      if (this.ondataavailable) {
        this.ondataavailable({ data: new Blob() });
      }
      if (this.onstop) {
        this.onstop();
      }
    }, 0);
  }
}

describe('SessionPage', () => {
  const mockPush = vi.fn();
  const mockQuestions = [
    { id: '1', text: 'What is your name?' },
    { id: '2', text: 'Why do you want to learn?' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock router
    (useRouter as any).mockReturnValue({
      push: mockPush,
      query: { code: 'TEST123' },
    });

    // Mock session
    (useSession as any).mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      status: 'authenticated',
    });

    // Mock fetch for questions and answer submission
    global.fetch = vi.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: async () => ({ questions: mockQuestions }),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      }));

    // Mock mediaDevices
    if (!global.navigator) {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });
    }

    if (!global.navigator.mediaDevices) {
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [{
              stop: vi.fn(),
            }],
          }),
        },
        writable: true,
        configurable: true,
      });
    }

    // Set up MediaRecorder mock
    global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;
  });

  it('renders loading state initially', () => {
    renderWithProviders(<SessionPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders questions after loading', async () => {
    renderWithProviders(<SessionPage />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].text)).toBeInTheDocument();
    });
  });

  it('handles recording controls', async () => {
    renderWithProviders(<SessionPage />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].text)).toBeInTheDocument();
    });

    const startButton = screen.getByText('Start Recording');
    await waitFor(() => {
      fireEvent.click(startButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Stop Recording')).toBeInTheDocument();
    });

    const stopButton = screen.getByText('Stop Recording');
    await waitFor(() => {
      fireEvent.click(stopButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Start Recording')).toBeInTheDocument();
    });
  });

  it('handles submission and moves to next question', async () => {
    renderWithProviders(<SessionPage />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].text)).toBeInTheDocument();
    });

    const startButton = screen.getByText('Start Recording');
    await waitFor(() => {
      fireEvent.click(startButton);
    });

    const stopButton = screen.getByText('Stop Recording');
    await waitFor(() => {
      fireEvent.click(stopButton);
    });

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[1].text)).toBeInTheDocument();
    });
  });
}); 