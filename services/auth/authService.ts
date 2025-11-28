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
        // Save to sessionStorage instead of localStorage
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
    sessionStorage.setItem('username', username); // Store username for unlock
    sessionStorage.setItem('userPassword', password); // Store password for unlock verification
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

    // Dispatch unlock event
    window.dispatchEvent(new Event('sessionUnlocked'));

    return response.data;
};

// Update last activity timestamp
export const updateLastActivity = () => {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
};

// Check if session should be locked
export const checkInactivity = () => {
    const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
    const isLocked = sessionStorage.getItem(IS_LOCKED_KEY);

    if (!lastActivity || isLocked === 'true') return;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        lockSession();
    }
};

// Lock the session
export const lockSession = () => {
    sessionStorage.setItem(IS_LOCKED_KEY, 'true');
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

export const startInactivityMonitoring = () => {
    // Clear any existing interval
    if (inactivityInterval) {
        clearInterval(inactivityInterval);
    }

    // Check inactivity every minute
    inactivityInterval = setInterval(() => {
        checkInactivity();
    }, 60000); // Check every 1 minute

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
        if (!isSessionLocked()) {
            updateLastActivity();
        }
    };

    activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
    });
};

// Stop monitoring (call on logout)
export const stopInactivityMonitoring = () => {
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


// import myAxios from '@/lib/myAxios';

// // 🔐 Step 1: Get the encrypted app token
// export const loginUserWithAppcode = async (appCode: string) => {
//     const response = await myAxios.post('/api/v2/auth/appcode', { appcode: appCode });

//     const token = response.data?.data?.encrypted_key;
//     if (token) {
//         // Save only once
//         localStorage.setItem('x-encrypted-key', token);
//     }

//     return response.data;
// };

// // 👤 Step 2: Login using appToken in URL and token in header
// export const loginUser = async (
//     username: string,
//     password: string,
//     options?: {
//         loginType?: string;
//         firebaseId?: string;
//         deviceSpec?: Record<string, any>;
//     },
// ) => {
//     const encryptedKey = localStorage.getItem('x-encrypted-key');
//     if (!encryptedKey) throw new Error('Encrypted key missing');

//     const url = `api/v2/auth/eboss/staff/login`;

//     const response = await myAxios.post(
//         url,
//         {
//             app_version: '1.0.0',
//             username,
//             password,
//             login_type: options?.loginType || 'normal',
//             firebase_id: options?.firebaseId || 'web-client-id',
//             platform_code: 1,
//             ...(options?.deviceSpec ? { device_spec: options.deviceSpec } : {}),
//         },
//         {
//             headers: {
//                 'x-encrypted-key': encryptedKey,
//             },
//         },
//     );

//     const userId = response.data?.data?.user_id;
//     const encrypted_user = response.data?.data?.encrypted_user;
//     const token = response.data?.data?.token;
//     if (!userId) throw new Error('User ID missing in login response');
//     localStorage.setItem('user_id', userId);
//     localStorage.setItem('encrypted_user', encrypted_user || '');
//     localStorage.setItem('userToken', token || '');

//     // const profileData = await getUserProfile();
//     // console.log('Fetched profile after login:', profileData);

//     return response.data;
// };
