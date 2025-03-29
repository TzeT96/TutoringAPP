import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: Session | null;
}

function TestWrapper({ children, session }: { children: React.ReactNode; session: Session | null }) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  { session = null, ...renderOptions }: CustomRenderOptions = {}
): RenderResult {
  return {
    ...render(ui, {
      wrapper: ({ children }) => <TestWrapper session={session}>{children}</TestWrapper>,
      ...renderOptions,
    }),
  };
} 