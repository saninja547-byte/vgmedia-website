// VGMEDIA Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const songsTableBody = document.getElementById('songsTableBody');
    const searchInput = document.getElementById('searchSongs');
    const filterType = document.getElementById('filterType');
    const editModal = document.getElementById('editModal');
    const editSongForm = document.getElementById('editSongForm');
    const modalClose = document.querySelector('.modal-close');
    const btnCancel = document.querySelector('.btn-cancel');
    const addSongBtn = document.getElementById('addSongBtn');
    const modalTitle = document.getElementById('modalTitle');
    const adminUsername = document.getElementById('adminUsername');
    
    // State variables
    let currentEditId = null;
    let isEditMode = false;
    let currentSearch = '';
    let currentTypeFilter = 'all';
    
    // Initialize admin panel
    function initAdmin() {
        // Update admin username
        const user = getCurrentUser();
        if (user) {
            adminUsername.textContent = user.name;
        }
        
        loadSongsTable();
        setupEventListeners();
        
        // Show welcome message
        showNotification('Chào mừng đến với trang quản lý VGMEDIA!', 'info');
    }
    
    // Load songs into table
    function loadSongsTable() {
        const songs = filterSongs(currentTypeFilter, currentSearch);
        
        // Clear table
        songsTableBody.innerHTML = '';
        
        if (songs.length === 0) {
            songsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--gray);">
                        <i class="fas fa-music" style="font-size: 3rem; margin-bottom: 20px; display: block;"></i>
                        <p>Không tìm thấy bài hát nào</p>
                        <button class="btn-admin btn-add-song" style="margin-top: 20px;" id="addFirstSong">
                            <i class="fas fa-plus"></i> Thêm bài hát đầu tiên
                        </button>
                    </td>
                </tr>
            `;
            
            document.getElementById('addFirstSong')?.addEventListener('click', openAddModal);
            return;
        }
        
        // Add rows
        songs.forEach(song => {
            const row = document.createElement('tr');
            const formattedPrice = song.price > 0 ? 
                song.price.toLocaleString('vi-VN') + 'đ' : 
                'Miễn phí';
            
            row.innerHTML = `
                <td>${song.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${song.thumbnail}" alt="${song.title}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                        <div>
                            <div style="font-weight: 600; color: var(--light);">${song.title}</div>
                            <div style="font-size: 0.8rem; color: var(--gray); max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${song.audioUrl}</div>
                        </div>
                    </div>
                </td>
                <td>${song.artist}</td>
                <td>${song.genre}</td>
                <td>
                    <span class="song-type ${song.type}">${song.type === 'premium' ? 'Premium' : 'Miễn phí'}</span>
                </td>
                <td class="song-price ${song.price === 0 ? 'free' : ''}">${formattedPrice}</td>
                <td>${song.duration}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" data-id="${song.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" data-id="${song.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            songsTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteSongConfirm(parseInt(btn.dataset.id)));
        });
    }
    
    // Open edit modal
    function openEditModal(songId) {
        const songs = getMusicLibrary();
        const song = songs.find(s => s.id === songId);
        
        if (!song) {
            showNotification('Không tìm thấy bài hát!', 'error');
            return;
        }
        
        currentEditId = songId;
        isEditMode = true;
        
        // Fill form
        document.getElementById('editSongId').value = song.id;
        document.getElementById('editTitle').value = song.title;
        document.getElementById('editArtist').value = song.artist;
        document.getElementById('editGenre').value = song.genre;
        document.getElementById('editDuration').value = song.duration;
        document.getElementById('editType').value = song.type;
        document.getElementById('editPrice').value = song.price;
        document.getElementById('editAudioFile').value = song.audioUrl;
        document.getElementById('editThumbnail').value = song.thumbnail;
        document.getElementById('editDescription').value = song.description || '';
        
        // Update modal title
        modalTitle.textContent = 'Chỉnh sửa bài hát';
        
        // Toggle price field
        togglePriceField();
        
        // Show modal
        editModal.classList.add('active');
    }
    
    // Open add modal
    function openAddModal() {
        const songs = getMusicLibrary();
        const newId = songs.length > 0 ? Math.max(...songs.map(s => s.id)) + 1 : 1;
        
        // Reset form
        editSongForm.reset();
        
        // Set default values
        document.getElementById('editSongId').value = newId;
        document.getElementById('editType').value = 'premium';
        document.getElementById('editPrice').value = 199000;
        document.getElementById('editDuration').value = '1:00:00';
        document.getElementById('editGenre').value = 'Progressive House';
        document.getElementById('editBPM').value = '128 BPM';
        
        // Set default thumbnail
        document.getElementById('editThumbnail').value = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        
        // Set default audio URL (free sample)
        document.getElementById('editAudioFile').value = 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3';
        
        currentEditId = null;
        isEditMode = false;
        
        // Update modal title
        modalTitle.textContent = 'Thêm bài hát mới';
        
        // Toggle price field
        togglePriceField();
        
        // Show modal
        editModal.classList.add('active');
    }
    
    // Close edit modal
    function closeEditModal() {
        editModal.classList.remove('active');
        editSongForm.reset();
        currentEditId = null;
        isEditMode = false;
    }
    
    // Delete song confirmation
    function deleteSongConfirm(songId) {
        const song = getSongById(songId);
        if (!song) return;
        
        if (confirm(`Bạn có chắc chắn muốn xóa bài hát "${song.title}"?\nHành động này không thể hoàn tác.`)) {
            deleteSong(songId);
            loadSongsTable();
            showNotification(`Đã xóa bài hát "${song.title}"`, 'success');
        }
    }
    
    // Toggle price field
    function togglePriceField() {
        const type = document.getElementById('editType').value;
        const priceField = document.getElementById('editPrice');
        
        if (type === 'free') {
            priceField.disabled = true;
            priceField.value = 0;
        } else {
            priceField.disabled = false;
            if (!priceField.value || priceField.value === '0') {
                priceField.value = 199000;
            }
        }
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.admin-notification').forEach(el => el.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `admin-notification notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--secondary)' : 'var(--primary)'};
            color: white;
            padding: 15px 25px;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        let icon = 'fas fa-info-circle';
        if (type === 'success') icon = 'fas fa-check-circle';
        if (type === 'error') icon = 'fas fa-exclamation-circle';
        
        notification.innerHTML = `
            <i class="${icon}" style="font-size: 1.2rem;"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search input
        searchInput.addEventListener('input', () => {
            currentSearch = searchInput.value;
            loadSongsTable();
        });
        
        // Filter select
        filterType.addEventListener('change', () => {
            currentTypeFilter = filterType.value;
            loadSongsTable();
        });
        
        // Type change in form
        document.getElementById('editType').addEventListener('change', togglePriceField);
        
        // Modal close buttons
        modalClose.addEventListener('click', closeEditModal);
        btnCancel.addEventListener('click', closeEditModal);
        
        // Close modal on outside click
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
        
        // Add song button
        addSongBtn.addEventListener('click', openAddModal);
        
        // Form submit
        editSongForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const songData = {
                title: document.getElementById('editTitle').value.trim(),
                artist: document.getElementById('editArtist').value.trim(),
                genre: document.getElementById('editGenre').value.trim(),
                duration: document.getElementById('editDuration').value.trim(),
                type: document.getElementById('editType').value,
                price: parseInt(document.getElementById('editPrice').value) || 0,
                audioUrl: document.getElementById('editAudioFile').value.trim(),
                thumbnail: document.getElementById('editThumbnail').value.trim() || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                description: document.getElementById('editDescription').value.trim(),
                bpm: "128 BPM"
            };
            
            // Validation
            if (!songData.title || !songData.artist || !songData.audioUrl) {
                showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
                return;
            }
            
            let success = false;
            let message = '';
            
            if (isEditMode && currentEditId) {
                // Update existing song
                success = updateSong(currentEditId, songData);
                message = success ? 'Cập nhật bài hát thành công!' : 'Có lỗi xảy ra khi cập nhật!';
            } else {
                // Add new song
                const newId = addSong(songData);
                success = newId > 0;
                message = success ? 'Thêm bài hát mới thành công!' : 'Có lỗi xảy ra khi thêm mới!';
            }
            
            if (success) {
                loadSongsTable();
                closeEditModal();
                showNotification(message, 'success');
                
                // Dispatch event for main page to update
                window.dispatchEvent(new CustomEvent('musicLibraryUpdated'));
            } else {
                showNotification(message, 'error');
            }
        });
        
        // Listen for music library updates
        window.addEventListener('musicLibraryUpdated', () => {
            loadSongsTable();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: Add new song
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                openAddModal();
            }
            
            // Escape: Close modal
            if (e.key === 'Escape') {
                closeEditModal();
            }
            
            // Ctrl/Cmd + F: Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInput.focus();
            }
        });
        
        // Focus search box on page load
        searchInput.focus();
    }
    
    // Initialize admin panel
    initAdmin();
});