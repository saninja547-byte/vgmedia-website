// File: js/auth.js
// Quản lý đăng nhập và xác thực người dùng

// Khóa localStorage
const AUTH_KEY = 'vgmedia_auth';
const USERS_KEY = 'vgmedia_users';

// Khởi tạo dữ liệu người dùng mẫu
function initUsers() {
    if (!localStorage.getItem(USERS_KEY)) {
        const defaultUsers = [
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
                name: 'Người dùng mẫu',
                type: 'user',
                isPremium: false,
                purchasedSongs: [],
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
}

// Lấy danh sách người dùng
function getUsers() {
    initUsers();
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

// Lưu danh sách người dùng
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Đăng ký người dùng mới
function registerUser(username, password, email, name) {
    const users = getUsers();
    
    // Kiểm tra username đã tồn tại
    if (users.some(user => user.username === username)) {
        return { success: false, message: 'Tên đăng nhập đã tồn tại' };
    }
    
    // Kiểm tra email đã tồn tại
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

// Đăng nhập
function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Lưu thông tin đăng nhập (không lưu password)
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
}

// Đăng xuất
function logout() {
    localStorage.removeItem(AUTH_KEY);
}

// Kiểm tra đăng nhập
function isLoggedIn() {
    return localStorage.getItem(AUTH_KEY) !== null;
}

// Lấy thông tin người dùng hiện tại
function getCurrentUser() {
    const auth = localStorage.getItem(AUTH_KEY);
    return auth ? JSON.parse(auth) : null;
}

// Kiểm tra có phải admin không
function isAdmin() {
    const user = getCurrentUser();
    return user && user.type === 'admin';
}

// Kiểm tra có phải premium không
function isPremium() {
    const user = getCurrentUser();
    return user && (user.isPremium || user.type === 'admin');
}

// Mua bài hát
function purchaseSong(songId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Vui lòng đăng nhập' };
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) return { success: false, message: 'Người dùng không tồn tại' };
    
    if (!users[userIndex].purchasedSongs.includes(songId)) {
        users[userIndex].purchasedSongs.push(songId);
        saveUsers(users);
        
        // Cập nhật thông tin đăng nhập
        user.purchasedSongs = users[userIndex].purchasedSongs;
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
    
    return { success: true };
}

// Kiểm tra đã mua bài hát chưa
function hasPurchasedSong(songId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    return user.purchasedSongs && user.purchasedSongs.includes(songId);
}

// Nâng cấp Premium
function upgradeToPremium() {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Vui lòng đăng nhập' };
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) return { success: false, message: 'Người dùng không tồn tại' };
    
    users[userIndex].isPremium = true;
    saveUsers(users);
    
    // Cập nhật thông tin đăng nhập
    user.isPremium = true;
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    
    return { success: true };
}

// Khởi tạo khi load trang
initUsers();

// Xuất các hàm để sử dụng trong các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerUser,
        login,
        logout,
        isLoggedIn,
        getCurrentUser,
        isAdmin,
        isPremium,
        purchaseSong,
        hasPurchasedSong,
        upgradeToPremium,
        getUsers
    };
}