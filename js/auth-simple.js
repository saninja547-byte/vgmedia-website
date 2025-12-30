// auth-simple.js - ULTRA SIMPLE WORKING VERSION
console.log('🎯 SIMPLE AUTH SYSTEM LOADED');

// SIMPLE LOGIN FUNCTION - ALWAYS WORKS
window.simpleLogin = function(username, password) {
    console.log('🔐 SIMPLE LOGIN:', username);
    
    // Always return success for demo accounts
    const demoAccounts = {
        'admin': { name: 'Admin User', type: 'admin', isPremium: true },
        'user': { name: 'Regular User', type: 'user', isPremium: false },
        'premium': { name: 'Premium User', type: 'user', isPremium: true }
    };
    
    if (demoAccounts[username]) {
        const user = {
            id: Date.now(),
            username: username,
            name: demoAccounts[username].name,
            type: demoAccounts[username].type,
            isPremium: demoAccounts[username].isPremium,
            purchasedSongs: [1, 2, 3],
            favorites: [1, 2]
        };
        
        // Save to localStorage
        localStorage.setItem('vgmedia_user', JSON.stringify(user));
        localStorage.setItem('vgmedia_logged_in', 'true');
        localStorage.setItem('vgmedia_login_time', Date.now().toString());
        
        console.log('✅ SIMPLE LOGIN SUCCESS:', user.name);
        
        return {
            success: true,
            user: user,
            message: 'Đăng nhập thành công!'
        };
    }
    
    return {
        success: false,
        message: 'Sai tên đăng nhập hoặc mật khẩu'
    };
};

// SIMPLE GET CURRENT USER
window.simpleGetCurrentUser = function() {
    try {
        const user = localStorage.getItem('vgmedia_user');
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
};

// SIMPLE LOGOUT
window.simpleLogout = function() {
    localStorage.removeItem('vgmedia_user');
    localStorage.removeItem('vgmedia_logged_in');
    console.log('✅ Đã đăng xuất');
    return { success: true };
};

// SIMPLE IS LOGGED IN
window.simpleIsLoggedIn = function() {
    return localStorage.getItem('vgmedia_logged_in') === 'true';
};

console.log('✅ SIMPLE AUTH READY');
