import myAxios from '@/lib/myAxios';

// Session management constants
const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const LAST_ACTIVITY_KEY = 'lastActivity';
const IS_LOCKED_KEY = 'isLocked';

// 🔐 Step 1: Get the encrypted app token
export const loginUserWithAppcode = async (appCode: string) => {
    const response = await myAxios.post('/api/v2/auth/appcode', { appcode: appCode });

    const token = response.data?.data?.encrypted_key;
    if (token) {
        sessionStorage.setItem('x-encrypted-key', token);
    }

    return response.data;
};

// 👤 Step 2: Login using appToken in URL and token in header
export const loginUser = async (
    username: string,
    password: string,
    options?: {
        loginType?: string;
        firebaseId?: string;
        deviceSpec?: Record<string, any>;
    },
) => {
    const encryptedKey = sessionStorage.getItem('x-encrypted-key');
    if (!encryptedKey) throw new Error('Encrypted key missing');

    const url = `api/v2/auth/eboss/staff/login`;

    const response = await myAxios.post(
        url,
        {
            app_version: '1.0.0',
            username,
            password,
            login_type: options?.loginType || 'normal',
            firebase_id: options?.firebaseId || 'web-client-id',
            platform_code: 1,
            ...(options?.deviceSpec ? { device_spec: options.deviceSpec } : {}),
        },
        {
            headers: {
                'x-encrypted-key': encryptedKey,
            },
        },
    );

    const userId = response.data?.data?.user_id;
    const encrypted_user = response.data?.data?.encrypted_user;
    const token = response.data?.data?.token;

    if (!userId) throw new Error('User ID missing in login response');

    // Save all data to sessionStorage
    sessionStorage.setItem('user_id', userId);
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('userPassword', password);
    sessionStorage.setItem('encrypted_user', encrypted_user || '');
    sessionStorage.setItem('userToken', token || '');

    // Initialize activity tracking
    updateLastActivity();
    sessionStorage.setItem(IS_LOCKED_KEY, 'false');

    // Start monitoring inactivity
    startInactivityMonitoring();

    return response.data;
};

// 🔓 Unlock session with password only
export const unlockSession = async (password: string) => {
    const encryptedKey = sessionStorage.getItem('x-encrypted-key');
    const username = sessionStorage.getItem('username');
    const storedPassword = sessionStorage.getItem('userPassword');

    if (!encryptedKey || !username) {
        throw new Error('Session data missing. Please login again.');
    }

    // Verify password matches stored password
    if (password !== storedPassword) {
        throw new Error('Incorrect password');
    }

    const url = `api/v2/auth/eboss/staff/login`;

    const response = await myAxios.post(
        url,
        {
            app_version: '1.0.0',
            username,
            password,
            login_type: 'normal',
            firebase_id: 'web-client-id',
            platform_code: 1,
        },
        {
            headers: {
                'x-encrypted-key': encryptedKey,
            },
        },
    );

    // Unlock the session
    sessionStorage.setItem(IS_LOCKED_KEY, 'false');
    updateLastActivity();

    // Restart monitoring after unlock
    startInactivityMonitoring();

    // Dispatch unlock event
    window.dispatchEvent(new Event('sessionUnlocked'));

    return response.data;
};

// Update last activity timestamp
export const updateLastActivity = () => {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
};

// Check if session should be locked (FIXED: Always check immediately)
export const checkInactivity = () => {
    const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
    const isLocked = sessionStorage.getItem(IS_LOCKED_KEY);

    // If already locked, don't check again
    if (isLocked === 'true') return;

    // If no last activity recorded, don't lock
    if (!lastActivity) return;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

    console.log('⏱️ Checking inactivity:', {
        timeSinceLastActivity: Math.round(timeSinceLastActivity / 1000 / 60) + ' minutes',
        threshold: Math.round(INACTIVITY_TIMEOUT / 1000 / 60) + ' minutes',
        shouldLock: timeSinceLastActivity >= INACTIVITY_TIMEOUT
    });

    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        console.log('🔒 Locking session due to inactivity');
        lockSession();
    }
};

// Lock the session
export const lockSession = () => {
    sessionStorage.setItem(IS_LOCKED_KEY, 'true');
    // Stop monitoring when locked
    stopInactivityMonitoring();
    // Trigger a custom event that your UI can listen to
    window.dispatchEvent(new CustomEvent('sessionLocked'));
};

// Check if session is locked
export const isSessionLocked = (): boolean => {
    return sessionStorage.getItem(IS_LOCKED_KEY) === 'true';
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
    return !!sessionStorage.getItem('userToken');
};

// Start monitoring user activity
let inactivityInterval: NodeJS.Timeout | null = null;
let activityListenersAdded = false;

export const startInactivityMonitoring = () => {
    console.log('🚀 Starting inactivity monitoring');

    // Clear any existing interval
    if (inactivityInterval) {
        clearInterval(inactivityInterval);
    }

    // CRITICAL FIX: Check immediately on start
    checkInactivity();

    // Check inactivity every 30 seconds (increased frequency for better responsiveness)
    inactivityInterval = setInterval(() => {
        checkInactivity();
    }, 30000); // Check every 30 seconds

    // Only add activity listeners once
    if (!activityListenersAdded) {
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => {
            if (!isSessionLocked()) {
                updateLastActivity();
            }
        };

        activityEvents.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        activityListenersAdded = true;
        console.log('✅ Activity listeners registered');
    }
};

// Stop monitoring (call on logout or lock)
export const stopInactivityMonitoring = () => {
    console.log('🛑 Stopping inactivity monitoring');
    if (inactivityInterval) {
        clearInterval(inactivityInterval);
        inactivityInterval = null;
    }
};

// Logout - clears all session data
export const logout = () => {
    stopInactivityMonitoring();
    sessionStorage.clear();
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
};

// Get session data
export const getSessionData = () => {
    return {
        userId: sessionStorage.getItem('user_id'),
        username: sessionStorage.getItem('username'),
        encryptedUser: sessionStorage.getItem('encrypted_user'),
        userToken: sessionStorage.getItem('userToken'),
        encryptedKey: sessionStorage.getItem('x-encrypted-key'),
        isLocked: isSessionLocked(),
        isLoggedIn: isLoggedIn(),
    };
};