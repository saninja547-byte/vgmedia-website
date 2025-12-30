// VGMEDIA Authentication System
// Simple auth system using localStorage

const AUTH_KEY = 'vgmedia_auth';

// Default users data
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
        name: 'Người dùng thường',
        type: 'user',
        isPremium: false,
        purchasedSongs: [],
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        username: 'premium',
        password: 'premium123',
        email: 'premium@vgmedia.com',
        name: 'Thành viên Premium',
        type: 'user',
        isPremium: true,
        purchasedSongs: [1, 3, 4],
        createdAt: new Date().toISOString()
    }
];

// Initialize users
function initUsers() {
    if (!localStorage.getItem('vgmedia_users')) {
        localStorage.setItem('vgmedia_users', JSON.stringify(DEFAULT_USERS));
    }
}

// Get all users
function getUsers() {
    initUsers();
    return JSON.parse(localStorage.getItem('vgmedia_users')) || [];
}

// Save users
function saveUsers(users) {
    localStorage.setItem('vgmedia_users', JSON.stringify(users));
}

// Register new user
function registerUser(username, password, email, name) {
    const users = getUsers();
    
    // Check if username exists
    if (users.some(user => user.username === username)) {
        return { success: false, message: 'Tên đăng nhập đã tồn tại' };
    }
    
    // Check if email exists
    if (users.some(user => user.email === email)) {
        return { success: false, message: 'Email đã được sử dụng' };
    }
    
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        password,
        email,
        name,
        type: 'user',
        isPremium: false,
        purchasedSongs: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, user: newUser };
}

// Login
function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Don't store password in auth session
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
}

// Logout
function logout() {
    localStorage.removeItem(AUTH_KEY);
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem(AUTH_KEY) !== null;
}

// Get current user
function getCurrentUser() {
    const auth = localStorage.getItem(AUTH_KEY);
    return auth ? JSON.parse(auth) : null;
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    // For demo purposes, allow access to admin page
    // In production, use: return user && user.type === 'admin';
    return true; // Allow everyone to access admin for demo
}

// Check if user has premium
function isPremium() {
    const user = getCurrentUser();
    return user && (user.isPremium || user.type === 'admin');
}

// Purchase song
function purchaseSong(songId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Vui lòng đăng nhập' };
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) return { success: false, message: 'Người dùng không tồn tại' };
    
    if (!users[userIndex].purchasedSongs.includes(songId)) {
        users[userIndex].purchasedSongs.push(songId);
        saveUsers(users);
        
        // Update auth session
        user.purchasedSongs = users[userIndex].purchasedSongs;
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
    
    return { success: true };
}

// Check if user has purchased song
function hasPurchasedSong(songId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    return user.purchasedSongs && user.purchasedSongs.includes(songId);
}

// Upgrade to premium
function upgradeToPremium() {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Vui lòng đăng nhập' };
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) return { success: false, message: 'Người dùng không tồn tại' };
    
    users[userIndex].isPremium = true;
    saveUsers(users);
    
    // Update auth session
    user.isPremium = true;
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    
    return { success: true };
}

// Initialize on load
initUsers();

// Make functions globally available
window.registerUser = registerUser;
window.login = login;
window.logout = logout;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.isAdmin = isAdmin;
window.isPremium = isPremium;
window.purchaseSong = purchaseSong;
window.hasPurchasedSong = hasPurchasedSong;
window.upgradeToPremium = upgradeToPremium;