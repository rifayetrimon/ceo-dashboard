// import { jwtDecode } from "jwt-decode";

// // Define the exact shape of your token based on the JSON you provided
// interface DecodedToken {
//     app_code: string;       // e.g. "awfahq"
//     db_name: string;        // e.g. "devsec_testasis"
//     cust_name?: string;
//     app_name?: string;
//     url?: string;
//     // Allow any other extra fields
//     [key: string]: any;
// }

// export const getSessionCredentials = () => {
//     // 0. Debug Log: Prove the function was actually called
//     console.log("🔍 [SessionHelper] Attempting to retrieve credentials...");

//     // 1. Safety check for Server Side Rendering
//     if (typeof window === 'undefined') {
//         console.log("⚠️ [SessionHelper] Server-side detected, skipping session storage.");
//         return { appCode: null, dbName: null };
//     }

//     // 2. Get the encrypted key
//     const encryptedKey = sessionStorage.getItem('x-encrypted-key');

//     if (!encryptedKey) {
//         console.warn('⚠️ [SessionHelper] x-encrypted-key missing from session storage');
//         return { appCode: null, dbName: null };
//     }

//     try {
//         // 3. Decode the token using the interface defined above
//         const decoded = jwtDecode<DecodedToken>(encryptedKey);

//         // 4. Map the specific fields from your token to the app's variable names
//         const appCode = decoded.app_code;
//         const databaseName = decoded.db_name;

//         if (!appCode || !databaseName) {
//             // console.error('❌ [SessionHelper] Token is missing "app_code" or "db_name"', decoded);
//             return { appCode: null, databaseName: null };
//         }

//         // ✅ Success Log
// console.log(`✅ [SessionHelper] Credentials Loaded: appCode="${appCode}", dbName="${databaseName}"`);

//         return { appCode, databaseName };

//     } catch (e) {
//         console.error("❌ [SessionHelper] Decode Failed", e);
//         return { appCode: null, databaseName: null };
//     }
// };