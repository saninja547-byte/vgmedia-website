// auth-fixed.js - FIXED VERSION
const AUTH_KEY = 'vgmedia_auth';

// Default users (INCLUDE REGISTRATION)
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
        favorites: [],
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        username: 'user',
        password: 'user123', 
        email: 'user@vgmedia.com',
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
    }
    
    // Auto login demo user for easier testing
    if (!localStorage.getItem(AUTH_KEY)) {
        const demoUser = { ...DEFAULT_USERS[1] };
        delete demoUser.password;
        localStorage.setItem(AUTH_KEY, JSON.stringify(demoUser));
    }
}

// Enhanced registration
function registerUser(username, password, email, name) {
    const users = getUsers();
    
    // Validation
    if (!username || !password || !email || !name) {
        return { success: false, message: 'Vui lòng điền đầy đủ thông tin' };
    }
    
    if (username.length < 3) {
        return { success: false, message: 'Tên đăng nhập tối thiểu 3 ký tự' };
    }
    
    if (password.length < 6) {
        return { success: false, message: 'Mật khẩu tối thiểu 6 ký tự' };
    }
    
    if (!validateEmail(email)) {
        return { success: false, message: 'Email không hợp lệ' };
    }
    
    // Check duplicates
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Tên đăng nhập đã tồn tại' };
    }
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'Email đã được sử dụng' };
    }
    
    // Create new user
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        password,
        email,
        name,
        type: 'user',
        isPremium: false,
        purchasedSongs: [],
        favorites: [],
        createdAt: new Date().toISOString(),
        profilePic: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=6C63FF&color=fff'
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto login after registration
    const { password: _, ...userWithoutPass } = newUser;
    localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPass));
    
    return { 
        success: true, 
        user: userWithoutPass,
        message: 'Đăng ký thành công! Đã tự động đăng nhập.'
    };
}

// Enhanced login
function login(username, password) {
    const users = getUsers();
    const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
    );
    
    if (user) {
        // Don't store password
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
        
        return { 
            success: true, 
            user: userWithoutPassword,
            message: 'Đăng nhập thành công!'
        };
    }
    
    return { 
        success: false, 
        message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
    };
}

// Helper functions
function getUsers() {
    initAuth();
    return JSON.parse(localStorage.getItem('vgmedia_users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('vgmedia_users', JSON.stringify(users));
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Add user functions
function updateUserProfile(userId, updates) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        saveUsers(users);
        
        // Update current session
        const current = getCurrentUser();
        if (current && current.id === userId) {
            localStorage.setItem(AUTH_KEY, JSON.stringify({
                ...current,
                ...updates
            }));
        }
        
        return true;
    }
    
    return false;
}

function addToFavorites(userId, songId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        if (!users[index].favorites.includes(songId)) {
            users[index].favorites.push(songId);
            saveUsers(users);
            
            // Update session
            user.favorites = users[index].favorites;
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
            
            return true;
        }
    }
    
    return false;
}

function removeFromFavorites(userId, songId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        users[index].favorites = users[index].favorites.filter(id => id !== songId);
        saveUsers(users);
        
        // Update session
        user.favorites = users[index].favorites;
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        
        return true;
    }
    
    return false;
}

// Make all functions global
window.registerUser = registerUser;
window.login = login;
window.logout = function() {
    localStorage.removeItem(AUTH_KEY);
    return { success: true, message: 'Đã đăng xuất' };
};
window.isLoggedIn = function() {
    return localStorage.getItem(AUTH_KEY) !== null;
};
window.getCurrentUser = function() {
    const auth = localStorage.getItem(AUTH_KEY);
    return auth ? JSON.parse(auth) : null;
};
window.isAdmin = function() {
    const user = getCurrentUser();
    return user && user.type === 'admin';
};
window.isPremium = function() {
    const user = getCurrentUser();
    return user && (user.isPremium || user.type === 'admin');
};
window.purchaseSong = function(songId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Vui lòng đăng nhập' };
    
    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
        if (!users[index].purchasedSongs.includes(songId)) {
            users[index].purchasedSongs.push(songId);
            saveUsers(users);
            
            user.purchasedSongs = users[index].purchasedSongs;
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        }
        
        return { success: true, message: 'Mua bài hát thành công!' };
    }
    
    return { success: false, message: 'Lỗi hệ thống' };
};
window.hasPurchasedSong = function(songId) {
    const user = getCurrentUser();
    return user && user.purchasedSongs && user.purchasedSongs.includes(songId);
};
window.upgradeToPremium = function() {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Vui lòng đăng nhập' };
    
    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
        users[index].isPremium = true;
        saveUsers(users);
        
        user.isPremium = true;
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        
        return { success: true, message: 'Nâng cấp Premium thành công!' };
    }
    
    return { success: false, message: 'Lỗi hệ thống' };
};
window.addToFavorites = addToFavorites;
window.removeFromFavorites = removeFromFavorites;
window.updateUserProfile = updateUserProfile;

// Initialize
initAuth();