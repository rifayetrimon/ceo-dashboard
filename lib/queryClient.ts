// // lib/queryClient.ts
// import { QueryClient } from '@tanstack/react-query';

// export const queryClient = new QueryClient();

// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
            refetchOnWindowFocus: false, // Don't refetch when user comes back to tab
            retry: 1, // Retry failed requests once
            refetchOnMount: true, // Refetch when component mounts
            refetchOnReconnect: true, // Refetch when internet reconnects
        },
    },
});
