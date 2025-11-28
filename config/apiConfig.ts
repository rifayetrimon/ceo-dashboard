// config/apiConfig.ts

/**
 * API Configuration Interface
 * Define the structure of API request parameters and field mappings
 */
export interface ApiConfig {
    baseUrl: string;
    fieldMappings: {
        appCode: string;      // Backend field name for app code
        databaseName: string; // Backend field name for database
        payloadType: string;  // Backend field name for payload type
    };
}

/**
 * Auth Session Interface
 * Structure of decoded session data from auth service
 */
export interface AuthSession {
    app_code: string;    // From decoded encrypted key
    db_name: string;     // From decoded encrypted key
    // Add other session fields as needed
}

/**
 * Default API Configuration
 * NO DEFAULT VALUES - Must get from auth session
 */
export const defaultApiConfig: ApiConfig = {
    baseUrl: 'https://devapi02.awfatech.com/proxy/api/v1/dashboard/summery',
    fieldMappings: {
        appCode: 'app_code',           // Maps to backend field
        databaseName: 'db_name', // Maps to backend field
        payloadType: 'payloadType',   // Maps to backend field
    },
};

/**
 * API Configuration Manager
 * Manages configuration and builds request bodies from auth session
 */
class ApiConfigManager {
    private config: ApiConfig = defaultApiConfig;
    private authSession: AuthSession | null = null;

    /**
     * Get current configuration
     */
    getConfig(): ApiConfig {
        return { ...this.config };
    }

    /**
     * Set auth session from decoded encrypted key
     */
    setAuthSession(session: AuthSession): void {
        this.authSession = session;
    }

    /**
     * Get current auth session
     */
    getAuthSession(): AuthSession | null {
        return this.authSession;
    }

    /**
     * Clear auth session (on logout)
     */
    clearAuthSession(): void {
        this.authSession = null;
    }

    /**
     * Update entire configuration
     */
    setConfig(newConfig: Partial<ApiConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Update field mappings only
     */
    setFieldMappings(mappings: Partial<ApiConfig['fieldMappings']>): void {
        this.config.fieldMappings = { ...this.config.fieldMappings, ...mappings };
    }

    /**
     * Update base URL
     */
    setBaseUrl(url: string): void {
        this.config.baseUrl = url;
    }

    /**
     * Build request body with proper field mapping
     * Uses auth session or provided params
     */
    buildRequestBody(params: {
        appCode?: string;
        databaseName?: string;
        payloadType: string;
    }): Record<string, string> {
        const { fieldMappings } = this.config;

        // If params provided, use them; otherwise use auth session
        const appCode = params.appCode || this.authSession?.app_code;
        const databaseName = params.databaseName || this.authSession?.db_name;

        if (!appCode || !databaseName) {
            throw new Error(
                'Missing required credentials. Please ensure you are authenticated and session is valid.'
            );
        }

        return {
            [fieldMappings.appCode]: appCode,
            [fieldMappings.databaseName]: databaseName,
            [fieldMappings.payloadType]: params.payloadType,
        };
    }

    /**
     * Validate that auth session is set
     */
    validateSession(): void {
        if (!this.authSession) {
            throw new Error('No auth session found. Please login first.');
        }
    }
}

// Export singleton instance
export const apiConfigManager = new ApiConfigManager();

/**
 * Helper function to update configuration at runtime
 */
export function configureApi(config: Partial<ApiConfig>): void {
    apiConfigManager.setConfig(config);
}

/**
 * Set auth session after decoding encrypted key
 */
export function setAuthSession(session: AuthSession): void {
    apiConfigManager.setAuthSession(session);
}

/**
 * Clear auth session on logout
 */
export function clearAuthSession(): void {
    apiConfigManager.clearAuthSession();
}

/**
 * Get current auth session
 */
export function getAuthSession(): AuthSession | null {
    return apiConfigManager.getAuthSession();
}