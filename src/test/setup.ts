import '@testing-library/jest-dom/vitest';
import { vi, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Add custom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Declare test globals
declare global {
  // eslint-disable-next-line no-var
  var MediaRecorder: {
    new (stream: MediaStream, options?: MediaRecorderOptions): MediaRecorder;
    prototype: MediaRecorder;
    isTypeSupported(type: string): boolean;
  };
  
  interface Window {
    fetch: ReturnType<typeof vi.fn>;
  }
}

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    query: {},
  })),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock fetch
global.fetch = vi.fn();

// Mock MediaRecorder
class MockMediaRecorder {
  start() {}
  stop() {}
  ondataavailable() {}
}

global.MediaRecorder = MockMediaRecorder as any;

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{
        stop: vi.fn()
      }]
    })
  }
}); 