import axios from 'axios';

const API_BASE_URL = 'https://fedc5fb7-9b4b-4ae2-bfb6-ee11a3c5199e.mock.pstmn.io';

// Request interface
interface DashboardRequest {
    appCode: string | null;
    dbName: string;
    payload: string;
}

// Response interface (adjust based on your actual API response)
interface DashboardResponse {
    // Define your response structure here
    data?: any;
    success?: boolean;
    message?: string;
}

export const dashboardService = {
    // Get System Info
    getSystemInfo: async (appCode: string | null = null, dbName: string = ''): Promise<DashboardResponse> => {
        try {
            const response = await axios.post<DashboardResponse>(`${API_BASE_URL}/dashboard-new`, {
                appCode,
                dbName,
                payload: 'SYSTEM_INFO',
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching system info:', error);
            throw error;
        }
    },

    // Generic dashboard data fetch (if you have other payloads)
    getDashboardData: async (payload: string, appCode: string | null = null, dbName: string = ''): Promise<DashboardResponse> => {
        try {
            const response = await axios.post<DashboardResponse>(`${API_BASE_URL}/dashboard-new`, {
                appCode,
                dbName,
                payload,
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching dashboard data (${payload}):`, error);
            throw error;
        }
    },
};
