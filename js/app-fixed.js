// app-fixed.js - FIXED MAIN APP
console.log('🎵 VGMEDIA App Fixed v2.0');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing VGMEDIA...');
    
    // 1. Fix authentication UI
    updateAuthUI();
    
    // 2. Initialize player
    initPlayer();
    
    // 3. Load music library
    loadMusicLibrary();
    
    // 4. Setup event listeners
    setupEventListeners();
    
    // 5. Setup demo data if empty
    setupDemoData();
    
    console.log('✅ VGMEDIA Ready!');
});

function updateAuthUI() {
    const user = getCurrentUser();
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const adminLink = document.getElementById('adminLink');
    const subscribeBtn = document.getElementById('subscribeBtn');
    
    if (user) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (userName) userName.textContent = user.name;
        
        // Show admin link for admin users
        if (adminLink) {
            if (user.type === 'admin') {
                adminLink.style.display = 'flex';
            } else {
                adminLink.style.display = 'none';
            }
        }
        
        // Update subscribe button for premium users
        if (subscribeBtn) {
            if (user.isPremium || user.type === 'admin') {
                subscribeBtn.innerHTML = '<i class="fas fa-crown"></i> Premium Member';
                subscribeBtn.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
                subscribeBtn.style.color = '#000';
                subscribeBtn.disabled = true;
            }
        }
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        
        if (subscribeBtn) {
            subscribeBtn.innerHTML = '<i class="fas fa-crown"></i> Nâng cấp Premium';
            subscribeBtn.style.background = 'linear-gradient(135deg, #6C63FF, #FF6584)';
            subscribeBtn.style.color = 'white';
            subscribeBtn.disabled = false;
        }
    }
}

function initPlayer() {
    console.log('🎧 Initializing player...');
    
    const audioPlayer = document.getElementById('audioPlayer');
    if (!audioPlayer) return;
    
    // Set default volume
    audioPlayer.volume = 0.8;
    
    // Load first song
    const songs = getMusicLibrary();
    if (songs.length > 0) {
        loadSong(songs[0].id);
    }
}

function loadMusicLibrary() {
    console.log('📚 Loading music library...');
    
    const songsList = document.getElementById('songsList');
    if (!songsList) return;
    
    const songs = getMusicLibrary();
    const user = getCurrentUser();
    
    if (songs.length === 0) {
        songsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #8A8A8A; grid-column: 1 / -1;">
                <i class="fas fa-music" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                <h4>Thư viện nhạc trống</h4>
                <p>Hãy thêm bài hát đầu tiên từ trang admin!</p>
                <a href="./admin.html" class="btn-action" style="margin-top: 20px;">
                    <i class="fas fa-cog"></i> Đến trang quản lý
                </a>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    songs.forEach(song => {
        const isPurchased = user && (user.isPremium || user.purchasedSongs.includes(song.id));
        const isFree = song.type === 'free';
        const canPlay = isFree || isPurchased;
        
        const priceDisplay = isFree ? 
            '<span style="color: #4CAF50;"><i class="fas fa-unlock"></i> Miễn phí</span>' :
            isPurchased ? 
            '<span style="color: #6C63FF;"><i class="fas fa-check-circle"></i> Đã mua</span>' :
            `<span style="color: #FF6584;">${song.price.toLocaleString('vi-VN')}đ</span>`;
        
        html += `
            <div class="song-item" data-id="${song.id}" onclick="playSong(${song.id})" style="cursor: pointer;">
                <img src="${song.thumbnail || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'}" 
                     alt="${song.title}" 
                     class="song-item-img">
                <div class="song-item-info">
                    <div class="song-item-title">
                        ${song.title}
                        ${!canPlay ? '<span style="margin-left: 8px; font-size: 12px; color: #FF6584;"><i class="fas fa-lock"></i></span>' : ''}
                    </div>
                    <div class="song-item-artist">${song.artist}</div>
                    <div class="song-item-meta">
                        <span><i class="fas fa-clock"></i> ${song.duration}</span>
                        <span><i class="fas fa-tag"></i> ${song.genre || 'EDM'}</span>
                        <span><i class="fas fa-fire"></i> ${song.bpm || '128 BPM'}</span>
                    </div>
                </div>
                <div class="song-item-price">
                    ${priceDisplay}
                </div>
            </div>
        `;
    });
    
    songsList.innerHTML = html;
}

// Global function to play song
window.playSong = function(songId) {
    console.log('Playing song:', songId);
    
    const song = getSongById(songId);
    const user = getCurrentUser();
    
    if (!song) {
        showNotification('Bài hát không tồn tại', 'error');
        return;
    }
    
    // Check if user can play this song
    const canPlay = song.type === 'free' || 
                   (user && (user.isPremium || user.purchasedSongs.includes(songId)));
    
    if (!canPlay) {
        // Show purchase modal
        showPurchaseModal(song);
        return;
    }
    
    // Load and play the song
    loadSong(songId);
    
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const playMainBtn = document.getElementById('playMainBtn');
    
    if (audioPlayer) {
        audioPlayer.play()
            .then(() => {
                // Update UI
                if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i> Tạm dừng';
                if (playMainBtn) playMainBtn.innerHTML = '<i class="fas fa-pause"></i>';
                
                // Add playing class
                document.body.classList.add('playing');
                
                showNotification(`🎵 Đang phát: ${song.title}`, 'success');
            })
            .catch(error => {
                console.error('Play error:', error);
                showNotification('Không thể phát nhạc. Vui lòng thử lại.', 'error');
            });
    }
};

function loadSong(songId) {
    const song = getSongById(songId);
    if (!song) return;
    
    // Update UI
    document.getElementById('currentTitle').textContent = song.title;
    document.getElementById('currentArtist').textContent = song.artist;
    document.getElementById('currentDuration').innerHTML = `<i class="fas fa-clock"></i> ${song.duration}`;
    document.getElementById('currentGenre').innerHTML = `<i class="fas fa-tag"></i> ${song.genre || 'EDM'}`;
    document.getElementById('currentBPM').innerHTML = `<i class="fas fa-tachometer-alt"></i> ${song.bpm || '128 BPM'}`;
    
    const thumbnail = document.getElementById('currentThumbnail');
    if (thumbnail) {
        thumbnail.src = song.thumbnail || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f';
    }
    
    document.getElementById('currentDescription').textContent = song.description || 'Bài hát chất lượng cao từ VGMEDIA';
    
    // Update badge
    const badge = document.getElementById('currentBadge');
    badge.textContent = song.type === 'premium' ? 'PREMIUM' : 'FREE';
    badge.className = `song-badge ${song.type}`;
    
    // Update buy button
    const buyBtn = document.getElementById('buyBtn');
    const user = getCurrentUser();
    const hasPurchased = user && (user.isPremium || user.purchasedSongs.includes(songId));
    
    if (buyBtn) {
        if (song.type === 'free') {
            buyBtn.innerHTML = '<i class="fas fa-download"></i> Tải miễn phí';
            buyBtn.style.background = '';
        } else if (hasPurchased) {
            buyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Đã mua';
            buyBtn.style.background = '#4CAF50';
            buyBtn.disabled = true;
        } else {
            buyBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> Mua bài hát - ${song.price.toLocaleString('vi-VN')}đ`;
            buyBtn.style.background = '';
            buyBtn.disabled = false;
        }
    }
    
    // Update audio player
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
        audioPlayer.src = song.audioUrl;
        
        // Check if user can play full song
        if (song.type === 'premium' && user && !user.isPremium && !hasPurchased) {
            // Set intro end time (2:30 minutes)
            audioPlayer.dataset.introEnd = '150';
            document.getElementById('introNotice').style.display = 'inline';
        } else {
            delete audioPlayer.dataset.introEnd;
            document.getElementById('introNotice').style.display = 'none';
        }
    }
    
    // Update active song in library
    document.querySelectorAll('.song-item').forEach(item => {
        if (parseInt(item.dataset.id) === songId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            window.location.href = './login.html';
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                logout();
                showNotification('Đã đăng xuất thành công', 'success');
                setTimeout(() => location.reload(), 1000);
            }
        });
    }
    
    // Subscribe button
    const subscribeBtn = document.getElementById('subscribeBtn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function() {
            const user = getCurrentUser();
            
            if (!user) {
                showNotification('Vui lòng đăng nhập để nâng cấp!', 'error');
                setTimeout(() => {
                    window.location.href = './login.html';
                }, 1500);
                return;
            }
            
            if (user.isPremium) {
                showNotification('Bạn đã là thành viên Premium!', 'info');
                return;
            }
            
            if (confirm('Nâng cấp lên Premium với giá 499,000đ/tháng?\nHủy bỏ bất cứ lúc nào.')) {
                const result = upgradeToPremium();
                if (result.success) {
                    showNotification('🎉 Nâng cấp Premium thành công!', 'success');
                    updateAuthUI();
                    loadMusicLibrary();
                } else {
                    showNotification(result.message || 'Có lỗi xảy ra!', 'error');
                }
            }
        });
    }
    
    // Play button
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            const audioPlayer = document.getElementById('audioPlayer');
            if (!audioPlayer.src) return;
            
            if (audioPlayer.paused) {
                playCurrentSong();
            } else {
                pauseCurrentSong();
            }
        });
    }
    
    // Buy button
    const buyBtn = document.getElementById('buyBtn');
    if (buyBtn) {
        buyBtn.addEventListener('click', function() {
            const songs = getMusicLibrary();
            if (songs.length === 0) return;
            
            const currentSong = getSongById(1); // Default to first song
            if (!currentSong) return;
            
            if (currentSong.type === 'free') {
                // Download free song
                showNotification('Đang tải xuống bài hát miễn phí...', 'info');
                window.open(currentSong.audioUrl, '_blank');
            } else {
                // Show purchase modal for premium song
                showPurchaseModal(currentSong);
            }
        });
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter songs
            filterSongs(filter);
        });
    });
    
    // Audio player events
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
        audioPlayer.addEventListener('timeupdate', function() {
            updateProgress(this.currentTime, this.duration);
            
            // Check intro for premium songs
            const introEnd = this.dataset.introEnd;
            if (introEnd && this.currentTime >= parseInt(introEnd)) {
                this.pause();
                showPurchaseModal(getSongById(1)); // Show purchase modal
            }
        });
        
        audioPlayer.addEventListener('ended', function() {
            const songs = getMusicLibrary();
            const currentId = 1; // You need to track current song ID
            const currentIndex = songs.findIndex(s => s.id === currentId);
            
            if (currentIndex >= 0 && currentIndex < songs.length - 1) {
                // Play next song
                playSong(songs[currentIndex + 1].id);
            }
        });
    }
}

function filterSongs(filter) {
    const songs = getMusicLibrary();
    const user = getCurrentUser();
    
    let filteredSongs = songs;
    
    if (filter === 'free') {
        filteredSongs = songs.filter(song => song.type === 'free');
    } else if (filter === 'premium') {
        filteredSongs = songs.filter(song => song.type === 'premium');
    }
    
    // Update UI
    const songsList = document.getElementById('songsList');
    if (!songsList) return;
    
    if (filteredSongs.length === 0) {
        songsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #8A8A8A; grid-column: 1 / -1;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                <h4>Không tìm thấy bài hát</h4>
                <p>Thử bộ lọc khác hoặc thêm bài hát mới</p>
            </div>
        `;
        return;
    }
    
    // Re-render filtered songs
    loadMusicLibrary(); // Simplified for now
}

function playCurrentSong() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const playMainBtn = document.getElementById('playMainBtn');
    
    if (audioPlayer && audioPlayer.src) {
        audioPlayer.play()
            .then(() => {
                if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i> Tạm dừng';
                if (playMainBtn) playMainBtn.innerHTML = '<i class="fas fa-pause"></i>';
                document.body.classList.add('playing');
            })
            .catch(error => {
                console.error('Play error:', error);
                showNotification('Không thể phát nhạc', 'error');
            });
    }
}

function pauseCurrentSong() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const playMainBtn = document.getElementById('playMainBtn');
    
    if (audioPlayer) {
        audioPlayer.pause();
        if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i> Phát nhạc';
        if (playMainBtn) playMainBtn.innerHTML = '<i class="fas fa-play"></i>';
        document.body.classList.remove('playing');
    }
}

function updateProgress(currentTime, duration) {
    const progress = document.getElementById('songProgress');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    
    if (progress && duration > 0) {
        const percent = (currentTime / duration) * 100;
        progress.style.width = percent + '%';
    }
    
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(currentTime);
    }
    
    if (totalTimeEl && duration) {
        totalTimeEl.textContent = formatTime(duration);
    }
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showPurchaseModal(song) {
    // Create modal HTML
    const modalHtml = `
        <div id="purchaseModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        ">
            <div style="
                background: #1E1E1E;
                padding: 30px;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                border: 2px solid #6C63FF;
            ">
                <h2 style="color: #6C63FF; margin-bottom: 20px;">
                    <i class="fas fa-crown"></i> Mua bài hát Premium
                </h2>
                
                <div style="
                    background: rgba(108, 99, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 25px;
                ">
                    <h3 style="margin-top: 0; color: white;">${song.title}</h3>
                    <p style="color: #B0B0B0; margin-bottom: 15px;">${song.artist} • ${song.duration}</p>
                    
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-top: 15px;
                        border-top: 1px solid rgba(255,255,255,0.1);
                    ">
                        <span style="color: #8A8A8A;">Giá:</span>
                        <span style="
                            font-size: 24px;
                            font-weight: bold;
                            color: #FF6584;
                        ">${song.price.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>
                
                <div style="
                    background: rgba(76, 175, 80, 0.1);
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 25px;
                    border: 1px solid rgba(76, 175, 80, 0.3);
                ">
                    <h4 style="margin-top: 0; color: #4CAF50;">
                        <i class="fas fa-lightbulb"></i> Mẹo tiết kiệm
                    </h4>
                    <p style="color: #B0B0B0; margin: 10px 0; font-size: 14px;">
                        <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
                        Nâng cấp Premium để nghe tất cả bài hát không giới hạn
                    </p>
                    <p style="color: #B0B0B0; font-size: 14px;">
                        <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
                        Chỉ 499,000đ/tháng - Tiết kiệm hơn mua lẻ
                    </p>
                </div>
                
                <div style="display: flex; gap: 15px;">
                    <button onclick="closeModal()" style="
                        flex: 1;
                        padding: 15px;
                        background: transparent;
                        border: 2px solid #8A8A8A;
                        color: #B0B0B0;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s;
                    " onmouseover="this.style.borderColor='#FF6584'; this.style.color='#FF6584'" 
                       onmouseout="this.style.borderColor='#8A8A8A'; this.style.color='#B0B0B0'">
                        Để sau
                    </button>
                    
                    <button onclick="buySongNow(${song.id})" style="
                        flex: 2;
                        padding: 15px;
                        background: linear-gradient(135deg, #6C63FF, #FF6584);
                        border: none;
                        color: white;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(108, 99, 255, 0.3)'"
                       onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
                        <i class="fas fa-shopping-cart"></i> Mua ngay
                    </button>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        </style>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Global modal functions
window.closeModal = function() {
    const modal = document.getElementById('purchaseModal');
    if (modal) modal.remove();
};

window.buySongNow = function(songId) {
    const result = purchaseSong(songId);
    
    if (result.success) {
        showNotification('🎉 Mua bài hát thành công!', 'success');
        loadMusicLibrary();
        closeModal();
    } else {
        showNotification(result.message || 'Có lỗi xảy ra', 'error');
    }
};

function showNotification(message, type = 'info') {
    console.log('Notification:', message);
    
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(el => el.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#FF6584' : '#6C63FF'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}" style="font-size: 18px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function setupDemoData() {
    // Add some demo songs if library is empty
    const songs = getMusicLibrary();
    if (songs.length === 0) {
        const demoLibrary = [
            {
                id: 1,
                title: "Summer Vibes 2024",
                artist: "VG Music Collective",
                duration: "3:45",
                genre: "EDM",
                bpm: "128 BPM",
                price: 199000,
                type: "premium",
                thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                description: "Bản nhạc EDM sôi động cho mùa hè"
            },
            {
                id: 2,
                title: "Midnight Drive",
                artist: "Night Riders",
                duration: "4:20",
                genre: "Synthwave",
                bpm: "110 BPM",
                price: 0,
                type: "free",
                thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=80",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                description: "Chill synthwave cho những chuyến đi đêm"
            },
            {
                id: 3,
                title: "Deep House Sessions",
                artist: "DJ Vortex",
                duration: "5:15",
                genre: "Deep House",
                bpm: "122 BPM",
                price: 149000,
                type: "premium",
                thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=80",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                description: "Deep house mượt mà cho không gian lounge"
            }
        ];
        
        localStorage.setItem('vgmedia_music_library', JSON.stringify(demoLibrary));
        console.log('✅ Demo data added');
        
        // Reload library
        loadMusicLibrary();
    }
}