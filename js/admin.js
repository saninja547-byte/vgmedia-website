// File: js/admin.js
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
    const adminLogout = document.getElementById('adminLogout');
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const sections = document.querySelectorAll('.admin-section');
    
    // State variables
    let currentEditId = null;
    let isEditMode = false;
    
    // Kiểm tra đăng nhập admin
    if (!isAdmin()) {
        alert('Vui lòng đăng nhập với tài khoản admin!');
        window.location.href = 'login.html';
        return;
    }
    
    // Cập nhật tên admin
    const user = getCurrentUser();
    if (user) {
        adminUsername.textContent = user.name;
    }
    
    // Khởi tạo admin panel
    function initAdmin() {
        loadSongsTable();
        setupEventListeners();
    }
    
    // Load songs vào table
    function loadSongsTable(filter = '', type = 'all') {
        let songs = getMusicLibrary();
        
        // Áp dụng bộ lọc
        if (filter) {
            const searchLower = filter.toLowerCase();
            songs = songs.filter(song => 
                song.title.toLowerCase().includes(searchLower) ||
                song.artist.toLowerCase().includes(searchLower) ||
                song.genre.toLowerCase().includes(searchLower)
            );
        }
        
        if (type !== 'all') {
            songs = songs.filter(song => song.type === type);
        }
        
        // Xóa table cũ
        songsTableBody.innerHTML = '';
        
        // Thêm rows mới
        songs.forEach(song => {
            const row = document.createElement('tr');
            const formattedPrice = song.price > 0 ? 
                song.price.toLocaleString('vi-VN') + 'đ' : 
                'Miễn phí';
            
            row.innerHTML = `
                <td>${song.id}</td>
                <td>
                    <div style="font-weight: 600; color: var(--light);">${song.title}</div>
                    <div style="font-size: 0.8rem; color: var(--gray);">${song.audioFile}</div>
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
        
        // Thêm event listeners cho các button
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteSong(parseInt(btn.dataset.id)));
        });
    }
    
    // Mở modal chỉnh sửa
    function openEditModal(songId) {
        const songs = getMusicLibrary();
        const song = songs.find(s => s.id === songId);
        
        if (!song) return;
        
        currentEditId = songId;
        isEditMode = true;
        
        // Điền form
        document.getElementById('editSongId').value = song.id;
        document.getElementById('editTitle').value = song.title;
        document.getElementById('editArtist').value = song.artist;
        document.getElementById('editGenre').value = song.genre;
        document.getElementById('editDuration').value = song.duration;
        document.getElementById('editType').value = song.type;
        document.getElementById('editPrice').value = song.price;
        document.getElementById('editAudioFile').value = song.audioFile || '';
        document.getElementById('editThumbnail').value = song.thumbnail || '';
        document.getElementById('editBPM').value = song.bpm || '';
        document.getElementById('editDescription').value = song.description || '';
        
        // Cập nhật tiêu đề modal
        modalTitle.textContent = 'Chỉnh sửa bài hát';
        
        // Hiển thị/ẩn field giá
        togglePriceField();
        
        // Hiển thị modal
        editModal.classList.add('active');
    }
    
    // Mở modal thêm mới
    function openAddModal() {
        const songs = getMusicLibrary();
        const newId = songs.length > 0 ? Math.max(...songs.map(s => s.id)) + 1 : 1;
        
        // Reset form
        editSongForm.reset();
        
        // Đặt giá trị mặc định
        document.getElementById('editSongId').value = newId;
        document.getElementById('editType').value = 'premium';
        document.getElementById('editPrice').value = 199000;
        document.getElementById('editDuration').value = '1:00:00';
        document.getElementById('editBPM').value = '128 BPM';
        
        currentEditId = null;
        isEditMode = false;
        
        // Cập nhật tiêu đề modal
        modalTitle.textContent = 'Thêm bài hát mới';
        
        // Hiển thị/ẩn field giá
        togglePriceField();
        
        // Hiển thị modal
        editModal.classList.add('active');
    }
    
    // Đóng modal
    function closeEditModal() {
        editModal.classList.remove('active');
        editSongForm.reset();
        currentEditId = null;
        isEditMode = false;
    }
    
    // Xóa bài hát
    function deleteSong(songId) {
        if (confirm('Bạn có chắc chắn muốn xóa bài hát này?')) {
            const success = deleteSongFromLibrary(songId);
            if (success) {
                loadSongsTable(searchInput.value, filterType.value);
                showNotification('Đã xóa bài hát thành công!', 'success');
            } else {
                showNotification('Có lỗi xảy ra khi xóa bài hát!', 'error');
            }
        }
    }
    
    // Xóa bài hát từ thư viện
    function deleteSongFromLibrary(songId) {
        let songs = getMusicLibrary();
        songs = songs.filter(song => song.id !== songId);
        updateMusicLibrary(songs);
        return true;
    }
    
    // Hiển thị/ẩn field giá
    function togglePriceField() {
        const type = document.getElementById('editType').value;
        const priceField = document.getElementById('editPrice');
        
        if (type === 'free') {
            priceField.disabled = true;
            priceField.value = 0;
        } else {
            priceField.disabled = false;
            if (!priceField.value) {
                priceField.value = 199000;
            }
        }
    }
    
    // Hiển thị thông báo
    function showNotification(message, type = 'info') {
        // Tạo notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        
        let icon = 'fas fa-info-circle';
        let bgColor = 'var(--primary)';
        
        if (type === 'success') {
            icon = 'fas fa-check-circle';
            bgColor = 'var(--success)';
        }
        if (type === 'error') {
            icon = 'fas fa-exclamation-circle';
            bgColor = 'var(--secondary)';
        }
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; padding: 15px 25px; background: ${bgColor}; color: white; border-radius: var(--radius-md);">
                <i class="${icon}" style="font-size: 1.2rem;"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Chuyển đổi giữa các section
    function switchSection(sectionId) {
        // Ẩn tất cả sections
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Xóa active từ tất cả nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Hiển thị section được chọn
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active');
        }
        
        // Active nav link tương ứng
        const activeNavLink = document.querySelector(`.admin-nav-link[data-section="${sectionId.replace('Section', '')}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search
        searchInput.addEventListener('input', () => {
            loadSongsTable(searchInput.value, filterType.value);
        });
        
        // Filter
        filterType.addEventListener('change', () => {
            loadSongsTable(searchInput.value, filterType.value);
        });
        
        // Type change
        document.getElementById('editType').addEventListener('change', togglePriceField);
        
        // Modal close
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
                title: document.getElementById('editTitle').value,
                artist: document.getElementById('editArtist').value,
                genre: document.getElementById('editGenre').value,
                duration: document.getElementById('editDuration').value,
                type: document.getElementById('editType').value,
                price: parseInt(document.getElementById('editPrice').value) || 0,
                audioFile: document.getElementById('editAudioFile').value,
                thumbnail: document.getElementById('editThumbnail').value,
                bpm: document.getElementById('editBPM').value || '128 BPM',
                description: document.getElementById('editDescription').value,
                introEnd: document.getElementById('editType').value === 'premium' ? 150 : 0
            };
            
            let success = false;
            let message = '';
            
            if (isEditMode && currentEditId) {
                // Cập nhật bài hát
                success = updateSong(currentEditId, songData);
                message = success ? 'Cập nhật bài hát thành công!' : 'Có lỗi xảy ra khi cập nhật!';
            } else {
                // Thêm bài hát mới
                const newId = addNewSong(songData);
                success = newId > 0;
                message = success ? 'Thêm bài hát mới thành công!' : 'Có lỗi xảy ra khi thêm mới!';
            }
            
            if (success) {
                loadSongsTable(searchInput.value, filterType.value);
                closeEditModal();
                showNotification(message, 'success');
            } else {
                showNotification(message, 'error');
            }
        });
        
        // Logout button
        adminLogout.addEventListener('click', () => {
            if (confirm('Bạn có muốn đăng xuất không?')) {
                logout();
                window.location.href = 'index.html';
            }
        });
        
        // Navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                if (section) {
                    switchSection(section + 'Section');
                } else if (link.getAttribute('href') === 'index.html') {
                    window.location.href = 'index.html';
                }
            });
        });
        
        // Listen for music library updates
        window.addEventListener('musicLibraryUpdated', () => {
            loadSongsTable(searchInput.value, filterType.value);
        });
        
        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'vgmedia_music_library') {
                loadSongsTable(searchInput.value, filterType.value);
            }
        });
    }
    
    // Khởi tạo admin panel
    initAdmin();
});