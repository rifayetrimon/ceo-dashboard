'use client';
import { jwtDecode } from 'jwt-decode';

// ============================================================
// API CONFIGURATION
// ============================================================
const API_BASE_URL = 'https://devapi02.awfatech.com/proxy/api/v1/dashboard/summary';
const API_OUTSTANDING_AMOUNT_URL = 'https://devapi02.awfatech.com/proxy/api/v1/dashboard/summary/mock';

// ============================================================
// SESSION HELPER (Token Decoding)
// ============================================================

interface DecodedToken {
    app_code: string;
    db_name: string;
    cust_name?: string;
    app_name?: string;
    url?: string;
    [key: string]: any;
}

///////////////////////////// For the user based finance reports

// export const getSessionCredentials = () => {
//     if (typeof window === 'undefined') {
//         return { appCode: null, databaseName: null };
//     }

//     const encryptedKey = sessionStorage.getItem('x-encrypted-key');

//     if (!encryptedKey) {
//         console.warn('⚠️ [SessionHelper] x-encrypted-key missing from session storage');
//         return { appCode: null, databaseName: null };
//     }

//     try {
//         const decoded = jwtDecode<DecodedToken>(encryptedKey);
//         const appCode = decoded.app_code;
//         const databaseName = decoded.db_name;

//         if (!appCode || !databaseName) {
//             return { appCode: null, databaseName: null };
//         }

//         console.log(`✅ [SessionHelper] Credentials Loaded: appCode="${appCode}", dbName="${databaseName}"`);
//         return { appCode, databaseName };

//     } catch (e) {
//         console.error("❌ [SessionHelper] Decode Failed", e);
//         return { appCode: null, databaseName: null };
//     }
// };

// ============================================================
// INTERFACE DEFINITIONS
// ============================================================

// ✅ Local interface for Table Data (detached from UI component imports)
export interface FinanceDataRow {
    [key: string]: string | number | null | undefined;
    zone: string;
    zoneCode?: string;
    color?: string;
    // Keys matching the 'month_' prefix for the slider logic
    month_january: string | number;
    month_february: string | number;
    month_march: string | number;
    month_april: string | number;
    month_may: string | number;
    month_june: string | number;
    month_july: string | number;
    month_august: string | number;
    month_september: string | number;
    month_october: string | number;
    month_november: string | number;
    month_december: string | number;
    total: string | number;
}

export interface CategoryData {
    code: string;
    name: string;
    total: number;
}

export interface Branch {
    branchId: number;
    name: string;
    zone?: string;
    monthly_revenue: any[];
    monthly_cost: any[];
    monthly_profit: any[];
}

interface FinanceSummaryResponse {
    success: boolean;
    message: string;
    data: { branches: Branch[] };
}

export interface ProcessedFinanceData {
    years: string[];
    branches: Branch[];
    revenueByYear: { [year: string]: number[] };
    costByYear: { [year: string]: number[] };
    profitByYear: { [year: string]: number[] };
}

export interface ChartSeriesData {
    name: string;
    data: number[];
}

export interface ZoneFinancialSummary {
    zoneName: string;
    totalIncome: number;
    totalExpense: number;
    totalProfit: number;
}

export interface FinanceOutstandingAmountResponse {
    success: boolean;
    message: string;
    data: {
        outstandingAmount: number;
        branches: any[];
    };
}

// ============================================================
// 1. GENERIC & DASHBOARD SERVICE FUNCTIONS
// ============================================================

// export const dashboardService = {

//     getSystemInfo: async (): Promise<any> => {
//         try {
//             // Retrieve credentials dynamically
//             const { appCode, databaseName } = getSessionCredentials();

//             if (!appCode || !databaseName) {
//                 throw new Error("Missing Session Credentials");
//             }

//             const response = await fetch(`${API_BASE_URL}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ appCode, databaseName, payloadType: 'SYSTEM_INFO' }),
//             });
//             if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//             return await response.json();
//         } catch (error) {
//             console.error('Error fetching system info:', error);
//             throw error;
//         }
//     },

//     getDashboardData: async (payloadType: string): Promise<any> => {
//         try {
//             // Retrieve credentials dynamically
//             const { appCode, databaseName } = getSessionCredentials();

//             if (!appCode || !databaseName) {
//                 throw new Error("Missing Session Credentials");
//             }

//             const response = await fetch(`${API_BASE_URL}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ appCode, databaseName, payloadType }),
//             });
//             if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//             return await response.json();
//         } catch (error) {
//             console.error(`Error fetching dashboard data (${payloadType}):`, error);
//             throw error;
//         }
//     },
// };

// export const getFinanceSummary = async (): Promise<FinanceSummaryResponse> => {
//     try {
//         // Retrieve credentials dynamically
//         const { appCode, databaseName } = getSessionCredentials();

//         if (!appCode || !databaseName) {
//             throw new Error("Missing Session Credentials");
//         }

//         const response = await fetch(`${API_BASE_URL}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ appCode, databaseName, payloadType: 'FINANCE_SUMMARY' }),
//         });
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         const data: FinanceSummaryResponse = await response.json();
//         return data;
//     } catch (error) {
//         console.error('Error fetching finance summary:', error);
//         throw error;
//     }
// };

export const dashboardService = {
    getSystemInfo: async (): Promise<any> => {
        try {
            // Retrieve credentials dynamically
            const appCode = 'azzahrawi';
            const databaseName = 'azzahrawi_azzahrawi';

            if (!appCode || !databaseName) {
                throw new Error('Missing Session Credentials');
            }

            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appCode, databaseName, payloadType: 'SYSTEM_INFO' }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching system info:', error);
            throw error;
        }
    },

    getDashboardData: async (payloadType: string): Promise<any> => {
        try {
            // Retrieve credentials dynamically
            const appCode = 'azzahrawi';
            const databaseName = 'azzahrawi_azzahrawi';

            if (!appCode || !databaseName) {
                throw new Error('Missing Session Credentials');
            }

            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appCode, databaseName, payloadType }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching dashboard data (${payloadType}):`, error);
            throw error;
        }
    },
};

export const getFinanceSummary = async (): Promise<FinanceSummaryResponse> => {
    try {
        // Retrieve credentials dynamically
        const appCode = 'azzahrawi';
        const databaseName = 'azzahrawi_azzahrawi';

        if (!appCode || !databaseName) {
            throw new Error('Missing Session Credentials');
        }

        const response = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appCode, databaseName, payloadType: 'FINANCE_SUMMARY' }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: FinanceSummaryResponse = await response.json();
        // console.log('📦 [API DATA] FinanceSummary Response:', data);
        return data;
    } catch (error) {
        console.error('Error fetching finance summary:', error);
        throw error;
    }
};

export const getFinanceOutstandingAmount = async (): Promise<FinanceOutstandingAmountResponse> => {
    try {
        // Retrieve credentials dynamically
        const appCode = 'azzahrawi';
        const databaseName = 'azzahrawi_azzahrawi';

        if (!appCode || !databaseName) {
            throw new Error('Missing Session Credentials');
        }

        const response = await fetch(`${API_OUTSTANDING_AMOUNT_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appCode, databaseName, payloadType: 'OUTSTANDING_INVOICE' }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: FinanceOutstandingAmountResponse = await response.json();
        console.log('📦 [API DATA] FinanceOutstandingAmount Response:', data);
        return data;
    } catch (error) {
        console.error('Error fetching finance outstanding amount:', error);
        throw error;
    }
};

// ============================================================
// 2. CORE DATA PROCESSING FUNCTIONS
// ============================================================

export const processFinanceData = (branches: Branch[]): ProcessedFinanceData => {
    const yearsSet = new Set<number>();
    branches.forEach((branch) => {
        branch.monthly_revenue.forEach((yearData) => {
            yearsSet.add(yearData.year);
        });
    });

    const years = Array.from(yearsSet)
        .sort((a, b) => b - a)
        .map(String);

    const revenueByYear: { [year: string]: number[] } = {};
    const costByYear: { [year: string]: number[] } = {};
    const profitByYear: { [year: string]: number[] } = {};

    years.forEach((year) => {
        revenueByYear[year] = new Array(12).fill(0);
        costByYear[year] = new Array(12).fill(0);
        profitByYear[year] = new Array(12).fill(0);
    });

    branches.forEach((branch) => {
        years.forEach((yearStr) => {
            const yearNum = parseInt(yearStr);
            const revenueYear = branch.monthly_revenue.find((y: any) => y.year === yearNum);
            if (revenueYear) {
                revenueYear.records.forEach((record: any) => {
                    revenueByYear[yearStr][record.month - 1] += record.total;
                });
            }

            const costYear = branch.monthly_cost.find((y: any) => y.year === yearNum);
            if (costYear) {
                costYear.records.forEach((record: any) => {
                    costByYear[yearStr][record.month - 1] += record.total;
                });
            }
        });
    });

    years.forEach((year) => {
        for (let i = 0; i < 12; i++) {
            profitByYear[year][i] = revenueByYear[year][i] - costByYear[year][i];
        }
    });

    return { years, branches, revenueByYear, costByYear, profitByYear };
};

// ============================================================
// 3. YEARLY & TIME-RANGE CALCULATION FUNCTIONS
// ============================================================

export const calculateYearTotals = (processedData: ProcessedFinanceData, year: string) => {
    const revenue = processedData.revenueByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
    const cost = processedData.costByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
    const profit = revenue - cost;

    return {
        revenue,
        cost,
        profit,
        profitMargin: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : '0.00',
    };
};

export const calculateYearRangeTotals = (processedData: ProcessedFinanceData, startYear: string, endYear: string) => {
    const years = processedData.years.filter((year) => year >= startYear && year <= endYear);
    let totalRevenue = 0;
    let totalCost = 0;

    years.forEach((year) => {
        totalRevenue += processedData.revenueByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
        totalCost += processedData.costByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
    });

    const totalProfit = totalRevenue - totalCost;

    return {
        revenue: totalRevenue,
        cost: totalCost,
        profit: totalProfit,
        profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : '0.00',
        yearsIncluded: years,
    };
};

export const getLatestYearsProfitData = (processedData: ProcessedFinanceData, numberOfYears: number = 5): { years: string[]; profitData: number[] } => {
    const latestYears = processedData.years.slice(0, numberOfYears).reverse();
    const profitData = latestYears.map((year) => calculateYearTotals(processedData, year).profit);
    return { years: latestYears, profitData };
};

// ============================================================
// 4. CHART SERIES GENERATION FUNCTIONS
// ============================================================

export const getChartSeriesForYear = (
    processedData: ProcessedFinanceData,
    year: string,
    includeRevenue: boolean = true,
    includeCost: boolean = true,
    includeProfit: boolean = false,
): ChartSeriesData[] => {
    const series: ChartSeriesData[] = [];
    if (includeRevenue && processedData.revenueByYear[year]) {
        series.push({ name: 'Revenue', data: processedData.revenueByYear[year] });
    }
    if (includeCost && processedData.costByYear[year]) {
        series.push({ name: 'Cost', data: processedData.costByYear[year] });
    }
    if (includeProfit && processedData.profitByYear[year]) {
        series.push({ name: 'Profit', data: processedData.profitByYear[year] });
    }
    return series;
};

export const getChartSeriesForYearRange = (
    processedData: ProcessedFinanceData,
    startYear: string,
    endYear: string,
    includeRevenue: boolean = true,
    includeCost: boolean = true,
    includeProfit: boolean = true,
): ChartSeriesData[] => {
    const years = processedData.years.filter((year) => year >= startYear && year <= endYear);
    const aggregatedRevenue = new Array(12).fill(0);
    const aggregatedCost = new Array(12).fill(0);

    years.forEach((year) => {
        if (processedData.revenueByYear[year]) {
            processedData.revenueByYear[year].forEach((val, idx) => {
                aggregatedRevenue[idx] += val;
            });
        }
        if (processedData.costByYear[year]) {
            processedData.costByYear[year].forEach((val, idx) => {
                aggregatedCost[idx] += val;
            });
        }
    });

    const aggregatedProfit = aggregatedRevenue.map((rev, idx) => rev - aggregatedCost[idx]);
    const series: ChartSeriesData[] = [];
    if (includeRevenue) series.push({ name: 'Revenue', data: aggregatedRevenue });
    if (includeCost) series.push({ name: 'Cost', data: aggregatedCost });
    if (includeProfit) series.push({ name: 'Profit', data: aggregatedProfit });

    return series;
};

// ============================================================
// 5. COMPANY & CATEGORY BREAKDOWN FUNCTIONS (Pie Charts)
// ============================================================

export const processCompanyFinancialsByYear = (branches: any[], year: string): { totalProfit: number; labels: string[]; series: number[] } => {
    let totalIncome = 0;
    let totalCost = 0;

    branches.forEach((branch: any) => {
        // Calculate income (revenue)
        const revenueYear = branch.monthly_revenue?.find((yr: any) => yr.year.toString() === year);
        if (revenueYear) {
            const yearRevenue = revenueYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            totalIncome += yearRevenue;
        }

        // Calculate cost
        const costYear = branch.monthly_cost?.find((yr: any) => yr.year.toString() === year);
        if (costYear) {
            const yearCost = costYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            totalCost += yearCost;
        }
    });

    const totalProfit = totalIncome - totalCost;

    return {
        totalProfit: totalProfit,
        labels: ['Income', 'Cost', 'Profit'],
        series: [totalIncome, totalCost, Math.abs(totalProfit)],
    };
};

export const processCategoryTotalsForYear = (branches: any[], year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches.forEach((branch) => {
        const yearData = branch.monthly_revenue?.find((yr: any) => yr.year.toString() === year);

        if (yearData) {
            yearData.records?.forEach((record: any) => {
                record.categories?.forEach((category: any) => {
                    const existing = categoryTotals.get(category.code);
                    if (existing) {
                        existing.total += category.total;
                    } else {
                        categoryTotals.set(category.code, { name: category.name, total: category.total });
                    }
                });
            });
        }
    });

    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return { labels: sortedCategories.map((cat) => cat.name), series: sortedCategories.map((cat) => cat.total) };
};

export const processExpenseCategoryTotalsForYear = (branches: any[], year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches.forEach((branch) => {
        const yearData = branch.monthly_cost?.find((yr: any) => yr.year.toString() === year);

        if (yearData) {
            yearData.records?.forEach((record: any) => {
                record.categories?.forEach((category: any) => {
                    const existing = categoryTotals.get(category.code);
                    if (existing) {
                        existing.total += category.total;
                    } else {
                        categoryTotals.set(category.code, { name: category.name, total: category.total });
                    }
                });
            });
        }
    });

    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return { labels: sortedCategories.map((cat) => cat.name), series: sortedCategories.map((cat) => cat.total) };
};

// ============================================================
// 6. ZONE-SPECIFIC FUNCTIONS
// ============================================================

export const calculateZoneWiseFinancials = (financeBranches: any[], systemBranches: any[], year: number): ZoneFinancialSummary[] => {
    const branchZoneMap: { [branchId: number]: { zone: string; zoneName: string } } = {};
    systemBranches.forEach((branch: any) => {
        if (branch.zone && branch.zone.trim() !== '') {
            branchZoneMap[branch.branchId] = { zone: branch.zone, zoneName: branch.zoneName || branch.zone };
        }
    });

    const zoneData: { [zoneName: string]: { income: number; expense: number } } = {};

    financeBranches.forEach((branch: any) => {
        const zoneInfo = branchZoneMap[branch.branchId];
        if (!zoneInfo) return;
        const zoneName = zoneInfo.zoneName;
        if (!zoneData[zoneName]) {
            zoneData[zoneName] = { income: 0, expense: 0 };
        }

        const revenueYear = branch.monthly_revenue?.find((y: any) => y.year === year);
        if (revenueYear) {
            const yearRevenue = revenueYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            zoneData[zoneName].income += yearRevenue;
        }

        const costYear = branch.monthly_cost?.find((y: any) => y.year === year);
        if (costYear) {
            const yearCost = costYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            zoneData[zoneName].expense += yearCost;
        }
    });

    return Object.entries(zoneData)
        .map(([zoneName, data]) => ({ zoneName, totalIncome: data.income, totalExpense: data.expense, totalProfit: data.income - data.expense }))
        .sort((a, b) => a.zoneName.localeCompare(b.zoneName));
};

export const processCategoryTotalsForZone = (branches: any[], zoneName: string, year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();
    branches
        .filter((branch: any) => branch.name.toUpperCase().includes(zoneName.toUpperCase()))
        .forEach((branch: any) => {
            const yearData = branch.monthly_revenue?.find((yr: any) => yr.year.toString() === year);

            if (yearData) {
                yearData.records?.forEach((record: any) => {
                    record.categories?.forEach((category: any) => {
                        const existing = categoryTotals.get(category.code);
                        if (existing) {
                            existing.total += category.total;
                        } else {
                            categoryTotals.set(category.code, { name: category.name, total: category.total });
                        }
                    });
                });
            }
        });

    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return { labels: sortedCategories.map((cat) => cat.name), series: sortedCategories.map((cat) => cat.total) };
};

export const processExpenseCategoryTotalsForZone = (branches: any[], zoneName: string, year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches
        .filter((branch: any) => branch.name.toUpperCase().includes(zoneName.toUpperCase()))
        .forEach((branch: any) => {
            const yearData = branch.monthly_cost?.find((yr: any) => yr.year.toString() === year);

            if (yearData) {
                yearData.records?.forEach((record: any) => {
                    record.categories?.forEach((category: any) => {
                        const existing = categoryTotals.get(category.code);
                        if (existing) {
                            existing.total += category.total;
                        } else {
                            categoryTotals.set(category.code, { name: category.name, total: category.total });
                        }
                    });
                });
            }
        });

    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return { labels: sortedCategories.map((cat) => cat.name), series: sortedCategories.map((cat) => cat.total) };
};

// ============================================================
// 7. UTILITY & FORMATTING FUNCTIONS
// ============================================================

export const getAvailableYears = (branches: any[]): string[] => {
    const years = new Set<string>();

    branches.forEach((branch: any) => {
        branch.monthly_revenue?.forEach((yearData: any) => {
            if (yearData.year && yearData.total > 0) {
                years.add(yearData.year.toString());
            }
        });
    });

    return Array.from(years).sort((a, b) => b.localeCompare(a));
};

export const formatCurrency = (value: number, locale: string = 'en-MY'): string => {
    return `RM ${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatLargeNumber = (value: number): string => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'K';
    }
    return value.toFixed(0);
};

// ============================================================
// 8. DATA PROCESSING - OUTSTANDING AMOUNTS
// ============================================================

/**
 * Processes the monthly outstanding API response to group data by Zone.
 * Returns data compatible with the Dashboard TableRow structure.
 */
export const calculateOutstandingAmountsByZone = (
    outstandingBranches: any[], // The 'branches' array from your new API
    systemBranches: any[], // To map BranchID -> Zone
    year: number,
): { tableData: FinanceDataRow[]; totalsRow: FinanceDataRow } => {
    // 1. Setup Zone Map
    const zoneMap = new Map<
        string,
        {
            months: number[];
            total: number;
            color: string;
            zoneName: string;
            zoneCode: string;
        }
    >();

    const colors = ['blue', 'purple', 'orange', 'green', 'red', 'cyan', 'pink', 'yellow'];
    let colorIndex = 0;

    // 2. Initialize Zones from System Info
    systemBranches.forEach((sysBranch: any) => {
        const zoneCode = sysBranch.zone?.trim();
        const zoneName = sysBranch.zoneName?.trim() || zoneCode || 'Unknown Zone';

        if (zoneCode && !zoneMap.has(zoneCode)) {
            zoneMap.set(zoneCode, {
                months: new Array(12).fill(0),
                total: 0,
                color: colors[colorIndex % colors.length],
                zoneName: zoneName,
                zoneCode: zoneCode,
            });
            colorIndex++;
        }
    });

    // 3. Create Lookup Map for Branch -> Zone
    const branchToZoneMap = new Map<number, string>();
    systemBranches.forEach((sysBranch: any) => {
        if (sysBranch.branchId !== undefined && sysBranch.zone) {
            branchToZoneMap.set(sysBranch.branchId, sysBranch.zone.trim());
        }
    });

    // 4. Aggregate Outstanding Data
    outstandingBranches.forEach((branch: any) => {
        const zoneCode = branchToZoneMap.get(branch.branchId);
        if (!zoneCode) return;

        const zoneData = zoneMap.get(zoneCode);
        if (!zoneData) return;

        // Note: The new API returns data in 'monthly_outstanding'
        const yearData = branch.monthly_outstanding?.find((y: any) => y.year === year);

        if (yearData && yearData.records) {
            yearData.records.forEach((record: any) => {
                const monthIndex = record.month - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    zoneData.months[monthIndex] += record.total || 0;
                }
            });
        }
    });

    // 5. Build Table Rows using FinanceDataRow interface
    const tableData: FinanceDataRow[] = [];
    const monthTotals = new Array(12).fill(0); // Store totals for all 12 months
    let grandTotal = 0;

    const sortedZones = Array.from(zoneMap.entries()).sort((a, b) => a[1].zoneName.localeCompare(b[1].zoneName));

    sortedZones.forEach(([zoneCode, data]) => {
        // Calculate totals for all months
        const rowTotal = data.months.reduce((sum, val) => sum + val, 0);
        grandTotal += rowTotal;

        // Accumulate vertical totals
        for (let i = 0; i < 12; i++) {
            monthTotals[i] += data.months[i];
        }

        const row: FinanceDataRow = {
            zone: data.zoneName,
            zoneCode: zoneCode,
            // ✅ USING 'month_' KEYS to allow TableData.tsx to filter correctly
            month_january: data.months[0],
            month_february: data.months[1],
            month_march: data.months[2],
            month_april: data.months[3],
            month_may: data.months[4],
            month_june: data.months[5],
            month_july: data.months[6],
            month_august: data.months[7],
            month_september: data.months[8],
            month_october: data.months[9],
            month_november: data.months[10],
            month_december: data.months[11],
            total: rowTotal,
            color: data.color,
        };

        tableData.push(row);
    });

    // 6. Build Totals Row
    const totalsRow: FinanceDataRow = {
        zone: 'Total',
        month_january: monthTotals[0],
        month_february: monthTotals[1],
        month_march: monthTotals[2],
        month_april: monthTotals[3],
        month_may: monthTotals[4],
        month_june: monthTotals[5],
        month_july: monthTotals[6],
        month_august: monthTotals[7],
        month_september: monthTotals[8],
        month_october: monthTotals[9],
        month_november: monthTotals[10],
        month_december: monthTotals[11],
        total: grandTotal,
    };

    return { tableData, totalsRow };
};
