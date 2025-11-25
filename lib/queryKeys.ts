// lib/queryKeys.ts
// Centralized query keys for cache management

export const financeKeys = {
    // Base key for all finance queries
    all: ['finance'] as const,

    // System & Dashboard
    systemInfo: (appCode: string | null, dbName: string) => ['finance', 'systemInfo', appCode, dbName] as const,

    dashboardData: (payload: string, appCode: string | null, dbName: string) => ['finance', 'dashboard', payload, appCode, dbName] as const,

    // Finance Summary - Base query
    financeSummary: (appCode: string | null, dbName: string) => ['finance', 'summary', appCode, dbName] as const,

    // Processed Data
    processedData: (appCode: string | null, dbName: string) => ['finance', 'processed', appCode, dbName] as const,

    // Year-based queries
    yearTotals: (year: string, appCode: string | null, dbName: string) => ['finance', 'yearTotals', year, appCode, dbName] as const,

    companyFinancials: (year: string, appCode: string | null, dbName: string) => ['finance', 'companyFinancials', year, appCode, dbName] as const,

    categoryTotals: (year: string, appCode: string | null, dbName: string) => ['finance', 'categoryTotals', year, appCode, dbName] as const,

    expenseTotals: (year: string, appCode: string | null, dbName: string) => ['finance', 'expenseTotals', year, appCode, dbName] as const,

    zoneFinancials: (year: number, appCode: string | null, dbName: string) => ['finance', 'zoneFinancials', year, appCode, dbName] as const,
};
