// auth-fixed.js - SIMPLE WORKING VERSION
console.log('✅ Auth system loaded');

const AUTH_KEY = 'vgmedia_auth';

// Default users
const DEFAULT_USERS = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@vgmedia.com',
        name: 'Quản trị viên',
        type: 'admin',
        isPremium: true,
        purchasedSongs: [],
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        username: 'user',
        password: 'user123',
        email: 'user@example.com',
        name: 'Người dùng Demo',
        type: 'user',
        isPremium: false,
        purchasedSongs: [2, 5],
        favorites: [1, 3],
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        username: 'premium',
        password: 'premium123',
        email: 'premium@vgmedia.com',
        name: 'Premium User',
        type: 'user',
        isPremium: true,
        purchasedSongs: [1, 3, 4],
        favorites: [1, 2, 3, 4, 5],
        createdAt: new Date().toISOString()
    }
];

// Initialize
function initAuth() {
    if (!localStorage.getItem('vgmedia_users')) {
        localStorage.setItem('vgmedia_users', JSON.stringify(DEFAULT_USERS));
        console.log('✅ Created default users');
    }
}

// Get all users
function getUsers() {
    initAuth();
    return JSON.parse(localStorage.getItem('vgmedia_users')) || [];
}

// Login function - FIXED
function login(username, password) {
    console.log('🔐 Login attempt:', username);
    
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Don't store password
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
        
        console.log('✅ Login successful:', user.name);
        return { 
            success: true, 
            user: userWithoutPassword,
            message: 'Đăng nhập thành công!'
        };
    }
    
    console.log('❌ Login failed for:', username);
    return { 
        success: false, 
        message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
    };
}

// Get current user
function getCurrentUser() {
    try {
        const auth = localStorage.getItem(AUTH_KEY);
        return auth ? JSON.parse(auth) : null;
    } catch (e) {
        console.error('Error getting current user:', e);
        return null;
    }
}

// Check if logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Logout
function logout() {
    const user = getCurrentUser();
    localStorage.removeItem(AUTH_KEY);
    console.log('✅ Logged out:', user?.name || 'Unknown');
    return { success: true, message: 'Đã đăng xuất' };
}

// Make functions global
window.login = login;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.logout = logout;

// Auto-initialize
initAuth();
console.log('✅ Auth system ready');
