import myAxios from '@/lib/myAxios';

export const getUserProfile = async () => {
    if (typeof window === 'undefined') {
        throw new Error('sessionStorage not available on server');
    }

    const userId = sessionStorage.getItem('user_id');
    const encryptedKey = sessionStorage.getItem('x-encrypted-key');
    const encryptedUser = sessionStorage.getItem('encrypted_user');
    const userToken = sessionStorage.getItem('userToken');

    // console.log(userId);
    // console.log(encryptedKey);

    if (!userId) throw new Error('No user_id found in sessionStorage');
    if (!encryptedKey) throw new Error('Encrypted key missing');

    const response = await myAxios.post(
        `api/v2/staff/eboss/staff/details`,
        {
            action: 'get_staff_one',
            filter_uid: userId,
        },
        {
            headers: {
                Authorization: `Bearer ${userToken}`,
                'x-encrypted-key': encryptedKey,
                'x-encrypted-user': encryptedUser,
            },
        },
    );

    // console.log('Full API response:', response.data); // ✅ Debug log


    return response.data.data;
};