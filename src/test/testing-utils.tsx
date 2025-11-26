import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement } from 'react';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

export function render(ui: ReactElement, options = {}) {
  const queryClient = createTestQueryClient();

  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
    ...options,
  });
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
