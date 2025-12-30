// VGMEDIA Main Application
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const playMainBtn = document.getElementById('playMainBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const songProgress = document.getElementById('songProgress');
    const progressHandle = document.getElementById('progressHandle');
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const waveformCanvas = document.getElementById('waveformCanvas');
    const vinylRecord = document.querySelector('.vinyl-record');
    const songsList = document.getElementById('songsList');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const adminLink = document.getElementById('adminLink');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const likeBtn = document.getElementById('likeBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const buyBtn = document.getElementById('buyBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // State variables
    let currentSongId = 1;
    let isPlaying = false;
    let canvasCtx;
    let introTimer = null;
    let currentFilter = 'all';
    
    // Initialize player
    function initPlayer() {
        // Update login UI
        updateLoginUI();
        
        // Setup canvas for waveform
        canvasCtx = waveformCanvas.getContext('2d');
        
        // Setup audio player
        audioPlayer.volume = volumeSlider.value / 100;
        
        // Load first song
        loadSong(currentSongId);
        
        // Render music library
        renderMusicLibrary();
        
        // Draw initial waveform
        drawWaveform();
        
        // Setup event listeners
        setupEventListeners();
        
        // Listen for music library updates
        window.addEventListener('musicLibraryUpdated', () => {
            loadSong(currentSongId);
            renderMusicLibrary();
        });
    }
    
    // Update login UI
    function updateLoginUI() {
        const user = getCurrentUser();
        
        if (user) {
            loginBtn.style.display = 'none';
            userMenu.style.display = 'flex';
            userName.textContent = user.name;
            
            if (isAdmin()) {
                adminLink.style.display = 'flex';
            }
            
            if (isPremium()) {
                subscribeBtn.textContent = 'Premium Member';
                subscribeBtn.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
                subscribeBtn.style.color = '#000';
            }
        } else {
            loginBtn.style.display = 'block';
            userMenu.style.display = 'none';
            adminLink.style.display = 'none';
            subscribeBtn.textContent = 'Nâng cấp Premium';
            subscribeBtn.style.background = 'var(--gradient-primary)';
            subscribeBtn.style.color = 'white';
        }
    }
    
    // Load song by ID
    function loadSong(songId) {
        const song = getSongById(songId);
        if (!song) return;
        
        currentSongId = songId;
        
        // Update audio player with real URL
        audioPlayer.src = song.audioUrl;
        
        // Update UI with song info
        document.getElementById('currentTitle').textContent = song.title;
        document.getElementById('currentArtist').textContent = song.artist;
        document.getElementById('currentDuration').innerHTML = `<i class="fas fa-clock"></i> ${song.duration}`;
        document.getElementById('currentGenre').innerHTML = `<i class="fas fa-tag"></i> ${song.genre}`;
        document.getElementById('currentBPM').innerHTML = `<i class="fas fa-tachometer-alt"></i> ${song.bpm}`;
        document.getElementById('currentThumbnail').src = song.thumbnail;
        document.getElementById('currentDescription').textContent = song.description;
        
        // Update badge
        const badge = document.getElementById('currentBadge');
        badge.textContent = song.type === 'premium' ? 'PREMIUM' : 'FREE';
        badge.className = `song-badge ${song.type}`;
        
        // Update total time
        totalTimeEl.textContent = song.duration;
        
        // Update buy button with price
        const formattedPrice = song.price > 0 ? 
            song.price.toLocaleString('vi-VN') + 'đ' : 
            'Miễn phí';
        
        const user = getCurrentUser();
        const hasPurchased = hasPurchasedSong(songId);
        const isUserPremium = isPremium();
        
        if (song.type === 'premium' && !hasPurchased && !isUserPremium) {
            document.getElementById('introNotice').style.display = 'inline';
            buyBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> Mua bài hát - ${formattedPrice}`;
            buyBtn.disabled = false;
            buyBtn.style.background = '';
        } else if (song.type === 'premium' && (hasPurchased || isUserPremium)) {
            document.getElementById('introNotice').style.display = 'none';
            buyBtn.innerHTML = `<i class="fas fa-check"></i> Đã mua`;
            buyBtn.disabled = true;
            buyBtn.style.background = 'var(--success)';
        } else {
            document.getElementById('introNotice').style.display = 'none';
            buyBtn.innerHTML = `<i class="fas fa-download"></i> Tải miễn phí`;
            buyBtn.disabled = false;
            buyBtn.style.background = '';
        }
        
        // Reset progress
        updateProgress(0);
        
        // Reset waveform animation
        if (isPlaying) {
            drawWaveform();
        }
        
        // Update active song in library
        updateActiveSong();
    }
    
    // Render music library
    function renderMusicLibrary() {
        const songs = filterSongs(currentFilter);
        songsList.innerHTML = '';
        
        songs.forEach(song => {
            const songItem = document.createElement('div');
            songItem.className = `song-item ${song.id === currentSongId ? 'active' : ''}`;
            songItem.dataset.id = song.id;
            
            const formattedPrice = song.price > 0 ? 
                song.price.toLocaleString('vi-VN') + 'đ' : 
                'Miễn phí';
            
            const user = getCurrentUser();
            const hasPurchased = hasPurchasedSong(song.id);
            const isUserPremium = isPremium();
            
            let priceDisplay = formattedPrice;
            if (song.type === 'premium' && (hasPurchased || isUserPremium)) {
                priceDisplay = '<i class="fas fa-check" style="color: var(--success);"></i> Đã mua';
            }
            
            songItem.innerHTML = `
                <img src="${song.thumbnail}" alt="${song.title}" class="song-item-img">
                <div class="song-item-info">
                    <div class="song-item-title">${song.title}</div>
                    <div class="song-item-artist">${song.artist}</div>
                    <div class="song-item-meta">
                        <span>${song.duration}</span>
                        <span>${song.genre}</span>
                        <span>${song.bpm}</span>
                    </div>
                </div>
                <div class="song-item-price ${song.type === 'free' ? 'free' : ''}">
                    ${priceDisplay}
                </div>
            `;
            
            songItem.addEventListener('click', () => {
                loadSong(song.id);
                if (isPlaying) {
                    playSong();
                }
            });
            
            songsList.appendChild(songItem);
        });
    }
    
    // Update active song in library
    function updateActiveSong() {
        document.querySelectorAll('.song-item').forEach(item => {
            if (parseInt(item.dataset.id) === currentSongId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Draw waveform visualization
    function drawWaveform() {
        const width = waveformCanvas.width = waveformCanvas.offsetWidth;
        const height = waveformCanvas.height = waveformCanvas.offsetHeight;
        
        // Clear canvas
        canvasCtx.clearRect(0, 0, width, height);
        
        // Draw gradient background
        const gradient = canvasCtx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(108, 99, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(255, 101, 132, 0.2)');
        gradient.addColorStop(1, 'rgba(108, 99, 255, 0.1)');
        
        // Draw waveform bars
        const barWidth = 4;
        const barGap = 3;
        const barCount = Math.floor(width / (barWidth + barGap));
        const centerY = height / 2;
        
        for (let i = 0; i < barCount; i++) {
            // Create animated height based on position and time
            const amplitude = isPlaying ? Math.sin(Date.now() / 200 + i * 0.3) * 0.7 + 0.3 : 0.2;
            const barHeight = Math.max(5, amplitude * height * 0.8);
            
            const x = i * (barWidth + barGap);
            const y = centerY - barHeight / 2;
            
            // Create bar gradient
            const barGradient = canvasCtx.createLinearGradient(0, y, 0, y + barHeight);
            barGradient.addColorStop(0, '#6C63FF');
            barGradient.addColorStop(0.5, '#FF6584');
            barGradient.addColorStop(1, '#6C63FF');
            
            canvasCtx.fillStyle = barGradient;
            canvasCtx.fillRect(x, y, barWidth, barHeight);
            
            // Add reflection
            canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            canvasCtx.fillRect(x, y, barWidth, barHeight * 0.2);
        }
        
        // Request next frame for animation
        if (isPlaying) {
            requestAnimationFrame(drawWaveform);
        }
    }
    
    // Play current song
    function playSong() {
        const song = getSongById(currentSongId);
        if (!song) return;
        
        // Check playback rights
        if (song.type === 'premium' && !isPremium() && !hasPurchasedSong(currentSongId)) {
            // Set intro timer
            introTimer = setTimeout(() => {
                pauseSong();
                showPurchaseModal(song);
            }, 150000); // 2:30 minutes
            
            showIntroNotification();
        }
        
        isPlaying = true;
        document.body.classList.add('playing');
        vinylRecord.style.animationPlayState = 'running';
        
        // Update play/pause buttons
        playBtn.innerHTML = '<i class="fas fa-pause"></i> Tạm dừng';
        playMainBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        // Start waveform animation
        drawWaveform();
        
        // Play audio
        audioPlayer.play().catch(e => {
            console.error('Lỗi phát nhạc:', e);
            showNotification('Không thể phát nhạc. Vui lòng kiểm tra kết nối internet.', 'error');
        });
    }
    
    // Pause current song
    function pauseSong() {
        isPlaying = false;
        document.body.classList.remove('playing');
        vinylRecord.style.animationPlayState = 'paused';
        
        // Update play/pause buttons
        playBtn.innerHTML = '<i class="fas fa-play"></i> Phát nhạc';
        playMainBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        // Stop intro timer
        if (introTimer) {
            clearTimeout(introTimer);
            introTimer = null;
        }
        
        // Pause audio
        audioPlayer.pause();
    }
    
    // Update progress bar
    function updateProgress(currentTime, duration) {
        const percent = duration > 0 ? (currentTime / duration) * 100 : 0;
        songProgress.style.width = `${percent}%`;
        progressHandle.style.left = `${percent}%`;
        
        // Update time display
        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };
        
        currentTimeEl.textContent = formatTime(currentTime);
        
        // Check intro for premium songs
        const song = getSongById(currentSongId);
        if (song && song.type === 'premium' && song.introEnd > 0 && 
            !isPremium() && !hasPurchasedSong(currentSongId)) {
            if (currentTime >= song.introEnd) {
                pauseSong();
                showPurchaseModal(song);
            }
        }
    }
    
    // Show intro notification
    function showIntroNotification() {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.id = 'introNotification';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-clock" style="font-size: 1.2rem;"></i>
                <div>
                    <strong>Đang nghe thử</strong>
                    <p style="margin: 5px 0 0; font-size: 0.9rem;">
                        Bài hát premium chỉ phát 2:30 phút đầu.
                        <br>Mua bài hát để nghe toàn bộ!
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        notification.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    // Show purchase modal
    function showPurchaseModal(song) {
        const modal = document.createElement('div');
        modal.id = 'purchaseModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        const formattedPrice = song.price.toLocaleString('vi-VN') + 'đ';
        
        modal.innerHTML = `
            <div style="background: var(--dark-light); padding: 30px; border-radius: 20px; max-width: 500px; width: 90%;">
                <h2 style="color: var(--primary); margin-bottom: 15px;">
                    <i class="fas fa-crown"></i> Mua bài hát Premium
                </h2>
                <p style="margin-bottom: 20px; color: var(--gray-light);">
                    Bài hát "<strong style="color: white;">${song.title}</strong>" đã hết thời gian nghe thử.
                    Mua bài hát để nghe toàn bộ ${song.duration}!
                </p>
                
                <div style="background: rgba(108, 99, 255, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Giá bài hát:</span>
                        <span style="font-weight: bold; color: var(--secondary); font-size: 1.2rem;">
                            ${formattedPrice}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Thời lượng:</span>
                        <span>${song.duration}</span>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="cancelPurchase" style="
                        padding: 10px 20px;
                        background: transparent;
                        border: 2px solid var(--gray);
                        color: var(--gray-light);
                        border-radius: 8px;
                        cursor: pointer;
                    ">Để sau</button>
                    <button id="confirmPurchase" style="
                        padding: 10px 20px;
                        background: var(--gradient-primary);
                        border: none;
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        <i class="fas fa-shopping-cart"></i> Mua ngay
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('cancelPurchase').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('confirmPurchase').addEventListener('click', () => {
            const result = purchaseSong(song.id);
            if (result.success) {
                showNotification(`Mua thành công bài hát "${song.title}"!`, 'success');
                loadSong(song.id);
                modal.remove();
            } else {
                showNotification(result.message || 'Có lỗi xảy ra!', 'error');
            }
        });
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        let icon = 'fas fa-info-circle';
        if (type === 'success') icon = 'fas fa-check-circle';
        if (type === 'error') icon = 'fas fa-exclamation-circle';
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="${icon}" style="font-size: 1.2rem;"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Play button
        playBtn.addEventListener('click', function() {
            if (isPlaying) {
                pauseSong();
            } else {
                playSong();
            }
        });
        
        // Pause button
        pauseBtn.addEventListener('click', pauseSong);
        
        // Main play button
        playMainBtn.addEventListener('click', function() {
            if (isPlaying) {
                pauseSong();
            } else {
                playSong();
            }
        });
        
        // Previous button
        prevBtn.addEventListener('click', function() {
            const prevSong = getPreviousSong(currentSongId);
            loadSong(prevSong.id);
            if (isPlaying) {
                setTimeout(() => playSong(), 100);
            }
        });
        
        // Next button
        nextBtn.addEventListener('click', function() {
            const nextSong = getNextSong(currentSongId);
            loadSong(nextSong.id);
            if (isPlaying) {
                setTimeout(() => playSong(), 100);
            }
        });
        
        // Volume slider
        volumeSlider.addEventListener('input', function() {
            audioPlayer.volume = this.value / 100;
        });
        
        // Progress bar click
        progressBar.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const duration = audioPlayer.duration || 0;
            audioPlayer.currentTime = percent * duration;
        });
        
        // Progress bar drag
        let isDragging = false;
        
        progressHandle.addEventListener('mousedown', function() {
            isDragging = true;
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const duration = audioPlayer.duration || 0;
                audioPlayer.currentTime = percent * duration;
            }
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        // Audio time update
        audioPlayer.addEventListener('timeupdate', function() {
            updateProgress(audioPlayer.currentTime, audioPlayer.duration);
        });
        
        // Audio ended
        audioPlayer.addEventListener('ended', function() {
            const nextSong = getNextSong(currentSongId);
            loadSong(nextSong.id);
            playSong();
        });
        
        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderMusicLibrary();
            });
        });
        
        // Like button
        likeBtn.addEventListener('click', function() {
            this.classList.toggle('liked');
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.style.background = 'var(--secondary)';
                showNotification('Đã thêm vào yêu thích!');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.style.background = '';
                showNotification('Đã xóa khỏi yêu thích!');
            }
        });
        
        // Download button
        downloadBtn.addEventListener('click', function() {
            const song = getSongById(currentSongId);
            if (!song) return;
            
            if (song.type === 'premium' && !isPremium() && !hasPurchasedSong(currentSongId)) {
                showNotification('Vui lòng mua bài hát để tải xuống!', 'error');
                return;
            }
            
            showNotification(`Đang tải xuống: ${song.title}...`);
            // In production, implement actual download
            window.open(song.audioUrl, '_blank');
        });
        
        // Buy button
        buyBtn.addEventListener('click', function() {
            const song = getSongById(currentSongId);
            if (!song) return;
            
            if (song.type === 'free') {
                showNotification('Đang tải xuống bài hát miễn phí...');
                window.open(song.audioUrl, '_blank');
            } else {
                showPurchaseModal(song);
            }
        });
        
        // Login button
        loginBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
        
        // Logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                logout();
                showNotification('Đã đăng xuất!');
                setTimeout(() => location.reload(), 1000);
            });
        }
        
        // Subscribe button
        subscribeBtn.addEventListener('click', function() {
            if (!isLoggedIn()) {
                showNotification('Vui lòng đăng nhập để nâng cấp!', 'error');
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }
            
            if (isPremium()) {
                showNotification('Bạn đã là thành viên Premium!');
                return;
            }
            
            if (confirm('Nâng cấp lên Premium với giá 499,000đ/tháng?\nHủy bỏ bất cứ lúc nào.')) {
                const result = upgradeToPremium();
                if (result.success) {
                    showNotification('Nâng cấp Premium thành công!', 'success');
                    updateLoginUI();
                    loadSong(currentSongId);
                } else {
                    showNotification(result.message || 'Có lỗi xảy ra!', 'error');
                }
            }
        });
        
        // Navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Window resize
        window.addEventListener('resize', function() {
            drawWaveform();
        });
    }
    
    // Initialize player
    initPlayer();
});