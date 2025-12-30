// admin-fixed.js - VERSION 3.0 với auto-detect metadata
console.log('🎵 Admin Fixed Script v3.0 Loaded');

let metadataExtractor = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin Panel v3.0 Initializing...');
    
    // Initialize metadata extractor
    if (window.AudioMetadataExtractor) {
        metadataExtractor = new AudioMetadataExtractor();
        console.log('✅ Metadata extractor initialized');
    }
    
    // Setup everything
    setupAdminPanel();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('🎧 Admin panel đã sẵn sàng!', 'success');
    }, 500);
});

function setupAdminPanel() {
    console.log('⚙️ Setting up admin panel...');
    
    // 1. Fix Add Song Button
    const addBtn = document.getElementById('addSongBtn');
    if (addBtn) {
        addBtn.addEventListener('click', openAddModal);
        console.log('✅ Add button fixed');
    }
    
    // 2. Setup form auto-detect
    setupAutoDetect();
    // Thêm nút upload file
function addUploadButtons() {
    const audioUrlGroup = document.getElementById('editAudioFile').parentElement;
    
    // Tạo container cho upload buttons
    const uploadContainer = document.createElement('div');
    uploadContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 10px;
    `;
    
    // Nút upload audio
    const audioUploadBtn = document.createElement('button');
    audioUploadBtn.type = 'button';
    audioUploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload file MP3 từ máy';
    audioUploadBtn.style.cssText = `
        padding: 10px 15px;
        background: linear-gradient(135deg, #6C63FF, #FF6584);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        flex: 1;
    `;
    
    // Nút upload thumbnail
    const imageUploadBtn = document.createElement('button');
    imageUploadBtn.type = 'button';
    imageUploadBtn.innerHTML = '<i class="fas fa-image"></i> Upload ảnh thumbnail';
    imageUploadBtn.style.cssText = `
        padding: 10px 15px;
        background: rgba(108, 99, 255, 0.2);
        color: #6C63FF;
        border: 2px dashed #6C63FF;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        flex: 1;
    `;
    
    // Thêm event listeners
    audioUploadBtn.addEventListener('click', async () => {
        await uploadAudioFile();
    });
    
    imageUploadBtn.addEventListener('click', async () => {
        await uploadImageFile();
    });
    
    uploadContainer.appendChild(audioUploadBtn);
    uploadContainer.appendChild(imageUploadBtn);
    audioUrlGroup.appendChild(uploadContainer);
}

// Upload audio file
async function uploadAudioFile() {
    try {
        if (!window.FileUploaderEnhanced) {
            showNotification('Lỗi: File uploader không khả dụng', 'error');
            return;
        }
        
        const uploader = new FileUploaderEnhanced();
        const file = await uploader.showFilePicker('audio');
        
        if (!file) {
            return;
        }
        
        // Show loading
        showNotification(`📁 Đang upload: ${file.name}...`, 'info');
        
        // Upload file
        const result = await uploader.uploadFileToLocalStorage(file);
        
        if (result.success) {
            // Lấy metadata
            const metadata = await uploader.getAudioMetadata(file);
            
            // Cập nhật form
            const audioUrlInput = document.getElementById('editAudioFile');
            audioUrlInput.value = `local:${result.storageKey}`;
            
            // Auto-fill các trường khác
            const titleInput = document.getElementById('editTitle');
            if (!titleInput.value.trim()) {
                titleInput.value = uploader.extractTitleFromFileName(file.name);
            }
            
            const durationInput = document.getElementById('editDuration');
            if (!durationInput.value.trim()) {
                durationInput.value = metadata.duration;
            }
            
            // Auto-detect genre từ tên file
            const genreInput = document.getElementById('editGenre');
            if (!genreInput.value.trim()) {
                const title = titleInput.value.toLowerCase();
                if (title.includes('house')) genreInput.value = 'House';
                else if (title.includes('techno')) genreInput.value = 'Techno';
                else if (title.includes('trance')) genreInput.value = 'Trance';
                else if (title.includes('dubstep')) genreInput.value = 'Dubstep';
                else if (title.includes('pop')) genreInput.value = 'Pop';
                else genreInput.value = 'EDM';
            }
            
            showNotification(`✅ Upload thành công: ${file.name} (${metadata.duration})`, 'success');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification(`❌ Lỗi upload: ${error.message}`, 'error');
    }
}

// Upload image file
async function uploadImageFile() {
    try {
        if (!window.FileUploaderEnhanced) {
            showNotification('Lỗi: File uploader không khả dụng', 'error');
            return;
        }
        
        const uploader = new FileUploaderEnhanced();
        const file = await uploader.showFilePicker('image');
        
        if (!file) {
            return;
        }
        
        // Show loading
        showNotification(`🖼️ Đang upload ảnh: ${file.name}...`, 'info');
        
        // Upload file
        const result = await uploader.uploadFileToLocalStorage(file);
        
        if (result.success) {
            // Cập nhật form
            const thumbnailInput = document.getElementById('editThumbnail');
            thumbnailInput.value = `local:${result.storageKey}`;
            
            // Hiển thị preview
            const preview = document.createElement('img');
            preview.src = result.dataUrl;
            preview.style.cssText = `
                max-width: 200px;
                max-height: 200px;
                border-radius: 10px;
                margin-top: 10px;
                border: 2px solid #6C63FF;
            `;
            
            const parent = thumbnailInput.parentElement;
            const existingPreview = parent.querySelector('.thumbnail-preview');
            if (existingPreview) {
                existingPreview.remove();
            }
            
            preview.className = 'thumbnail-preview';
            parent.appendChild(preview);
            
            showNotification(`✅ Upload ảnh thành công!`, 'success');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification(`❌ Lỗi upload ảnh: ${error.message}`, 'error');
    }
}

// Thêm vào hàm initAdmin
function initAdmin() {
    // ... code cũ ...
    
    // Thêm nút upload
    setTimeout(() => {
        addUploadButtons();
    }, 1000);
}
    // 3. Setup modal controls
    setupModalControls();
    
    // 4. Load existing songs
    loadSongsTable();
    
    // 5. Setup search and filter
    setupSearchFilter();
    
    console.log('✅ Admin panel setup complete');
}

function openAddModal() {
    console.log('📝 Opening add modal...');
    
    const modal = document.getElementById('editModal');
    if (!modal) {
        console.error('❌ Modal not found');
        return;
    }
    
    // Show modal
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set modal title
    document.getElementById('modalTitle').textContent = '🎵 Thêm bài hát mới';
    
    // Reset form
    const form = document.getElementById('editSongForm');
    if (form) {
        form.reset();
        
        // Generate new ID
        try {
            const songs = window.getMusicLibrary ? window.getMusicLibrary() : [];
            const newId = songs.length > 0 ? Math.max(...songs.map(s => s.id)) + 1 : 1;
            document.getElementById('editSongId').value = newId;
            console.log('🆔 New song ID:', newId);
        } catch (e) {
            document.getElementById('editSongId').value = Date.now();
        }
        
        // Set default values
        document.getElementById('editType').value = 'premium';
        document.getElementById('editPrice').value = 199000;
        document.getElementById('editDuration').value = '3:30';
        document.getElementById('editGenre').value = 'EDM';
        document.getElementById('editBPM').value = '128 BPM';
        
        // Default thumbnail from Unsplash
        const thumbnails = [
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
            'https://images.unsplash.com/photo-1518609878373-06d740f60d8b',
            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad'
        ];
        const randomThumb = thumbnails[Math.floor(Math.random() * thumbnails.length)];
        document.getElementById('editThumbnail').value = randomThumb + '?auto=format&fit=crop&w=500&q=80';
        
        // Default description
        document.getElementById('editDescription').value = 'Bài hát chất lượng cao từ VGMEDIA';
        
        // Focus on title field
        setTimeout(() => {
            document.getElementById('editTitle').focus();
        }, 100);
    }
}

function setupAutoDetect() {
    const audioUrlInput = document.getElementById('editAudioFile');
    if (!audioUrlInput) return;
    
    console.log('🔍 Setting up auto-detect for audio URL');
    
    // Detect when user pastes or types URL
    audioUrlInput.addEventListener('input', function() {
        const url = this.value.trim();
        if (url && isValidAudioUrl(url)) {
            // Wait a bit before auto-detecting
            setTimeout(() => autoDetectMetadata(url), 300);
        }
    });
    
    // Add paste handler
    audioUrlInput.addEventListener('paste', function(e) {
        const pastedText = e.clipboardData.getData('text');
        if (pastedText && isValidAudioUrl(pastedText)) {
            setTimeout(() => {
                this.value = pastedText;
                autoDetectMetadata(pastedText);
            }, 10);
        }
    });
}

async function autoDetectMetadata(audioUrl) {
    console.log('🔍 Auto-detecting metadata for:', audioUrl);
    
    if (!audioUrl || !audioUrl.trim()) return;
    
    // Show loading state
    showLoadingState(true);
    
    try {
        // Validate URL
        if (!isValidUrl(audioUrl)) {
            throw new Error('URL không hợp lệ');
        }
        
        // Get filename for quick display
        const fileName = extractFileName(audioUrl);
        if (fileName) {
            const title = extractTitleFromFileName(fileName);
            const titleInput = document.getElementById('editTitle');
            if (titleInput && !titleInput.value.trim()) {
                titleInput.value = title;
                showFieldNotification('editTitle', `📁 Đã nhận diện: ${title}`);
            }
        }
        
        // Try to get metadata if extractor is available
        if (metadataExtractor) {
            const info = await metadataExtractor.getBasicInfo(audioUrl);
            
            console.log('✅ Metadata extracted:', info);
            
            // Update form fields
            const titleInput = document.getElementById('editTitle');
            const durationInput = document.getElementById('editDuration');
            const genreInput = document.getElementById('editGenre');
            const bpmInput = document.getElementById('editBPM');
            
            if (titleInput && !titleInput.value.trim()) {
                titleInput.value = info.title;
            }
            
            if (durationInput && !durationInput.value.trim()) {
                durationInput.value = info.duration;
            }
            
            if (genreInput && !genreInput.value.trim()) {
                const suggestedGenre = metadataExtractor.guessGenre(titleInput.value);
                genreInput.value = suggestedGenre;
                
                if (bpmInput) {
                    bpmInput.value = metadataExtractor.guessBPM(suggestedGenre);
                }
            }
            
            showNotification(`✅ Đã phân tích: ${info.title} (${info.duration})`, 'success');
        }
        
    } catch (error) {
        console.warn('⚠️ Auto-detect failed:', error.message);
        
        // Fallback: just use filename
        const fileName = extractFileName(audioUrl);
        if (fileName) {
            const title = extractTitleFromFileName(fileName);
            const titleInput = document.getElementById('editTitle');
            if (titleInput && !titleInput.value.trim()) {
                titleInput.value = title;
                showNotification(`📁 Đã nhận diện từ tên file: ${title}`, 'info');
            }
        }
        
    } finally {
        // Hide loading state
        showLoadingState(false);
    }
}

function setupModalControls() {
    const modal = document.getElementById('editModal');
    if (!modal) return;
    
    // Close button
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    // Cancel button
    const cancelBtn = document.querySelector('.btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    // Close when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Handle form submission
    const form = document.getElementById('editSongForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const songData = {
                id: parseInt(document.getElementById('editSongId').value),
                title: document.getElementById('editTitle').value.trim(),
                artist: document.getElementById('editArtist').value.trim(),
                genre: document.getElementById('editGenre').value.trim(),
                duration: document.getElementById('editDuration').value.trim(),
                type: document.getElementById('editType').value,
                price: parseInt(document.getElementById('editPrice').value) || 0,
                audioUrl: document.getElementById('editAudioFile').value.trim(),
                thumbnail: document.getElementById('editThumbnail').value.trim(),
                description: document.getElementById('editDescription').value.trim(),
                bpm: document.getElementById('editBPM') ? document.getElementById('editBPM').value.trim() : '128 BPM'
            };
            
            // Validation
            if (!songData.title || !songData.artist || !songData.audioUrl) {
                showNotification('❌ Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
                return;
            }
            
            // Show saving indicator
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
            submitBtn.disabled = true;
            
            try {
                // Save song (using your existing function)
                if (window.addSong) {
                    const newId = window.addSong(songData);
                    if (newId) {
                        showNotification(`✅ Đã thêm bài hát "${songData.title}" thành công!`, 'success');
                        
                        // Close modal
                        modal.style.display = 'none';
                        modal.classList.remove('active');
                        document.body.style.overflow = 'auto';
                        
                        // Reload table
                        loadSongsTable();
                        
                        // Dispatch update event for main page
                        window.dispatchEvent(new CustomEvent('musicLibraryUpdated'));
                    }
                } else {
                    // Fallback: save to localStorage directly
                    saveSongDirectly(songData);
                }
                
            } catch (error) {
                console.error('❌ Error saving song:', error);
                showNotification('❌ Có lỗi xảy ra khi lưu bài hát', 'error');
                
            } finally {
                // Restore button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

function saveSongDirectly(songData) {
    try {
        // Get existing library
        const library = JSON.parse(localStorage.getItem('vgmedia_music_library')) || [];
        
        // Check if song already exists
        const existingIndex = library.findIndex(s => s.id === songData.id);
        if (existingIndex >= 0) {
            // Update existing
            library[existingIndex] = songData;
            showNotification(`✏️ Đã cập nhật bài hát "${songData.title}"`, 'info');
        } else {
            // Add new
            library.push(songData);
            showNotification(`✅ Đã thêm bài hát "${songData.title}"`, 'success');
        }
        
        // Save back to localStorage
        localStorage.setItem('vgmedia_music_library', JSON.stringify(library));
        
        // Close modal
        document.getElementById('editModal').style.display = 'none';
        document.getElementById('editModal').classList.remove('active');
        
        // Reload table
        loadSongsTable();
        
        return true;
        
    } catch (error) {
        console.error('Error saving directly:', error);
        showNotification('❌ Lỗi khi lưu bài hát', 'error');
        return false;
    }
}

function loadSongsTable() {
    const tbody = document.getElementById('songsTableBody');
    if (!tbody) return;
    
    try {
        const songs = JSON.parse(localStorage.getItem('vgmedia_music_library')) || [];
        
        if (songs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 50px; color: #8A8A8A;">
                        <i class="fas fa-music" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                        <h4>Chưa có bài hát nào</h4>
                        <p>Bấm "Thêm bài hát mới" để bắt đầu</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        songs.forEach(song => {
            const price = song.price > 0 ? 
                song.price.toLocaleString('vi-VN') + 'đ' : 
                '<span style="color: #4CAF50;">Miễn phí</span>';
            
            html += `
                <tr>
                    <td>${song.id}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${song.thumbnail || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'}" 
                                 alt="${song.title}" 
                                 style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover;">
                            <div>
                                <div style="font-weight: 600;">${song.title}</div>
                                <div style="font-size: 12px; color: #8A8A8A;">${song.artist}</div>
                            </div>
                        </div>
                    </td>
                    <td>${song.artist}</td>
                    <td>${song.genre || 'EDM'}</td>
                    <td>
                        <span class="song-type ${song.type}" style="
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 600;
                            background: ${song.type === 'premium' ? 'rgba(108, 99, 255, 0.2)' : 'rgba(76, 175, 80, 0.2)'};
                            color: ${song.type === 'premium' ? '#6C63FF' : '#4CAF50'};
                        ">
                            ${song.type === 'premium' ? 'Premium' : 'Miễn phí'}
                        </span>
                    </td>
                    <td style="font-weight: 700; color: ${song.price > 0 ? '#FF6584' : '#4CAF50'}">
                        ${price}
                    </td>
                    <td>${song.duration}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editSong(${song.id})" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete" onclick="deleteSong(${song.id})" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading table:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: #FF6584;">
                    <i class="fas fa-exclamation-triangle"></i> Lỗi tải dữ liệu
                </td>
            </tr>
        `;
    }
}

// Edit song function
window.editSong = function(songId) {
    console.log('Editing song:', songId);
    
    const songs = JSON.parse(localStorage.getItem('vgmedia_music_library')) || [];
    const song = songs.find(s => s.id === songId);
    
    if (!song) {
        showNotification('❌ Không tìm thấy bài hát', 'error');
        return;
    }
    
    // Open modal and fill data
    const modal = document.getElementById('editModal');
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    document.getElementById('modalTitle').textContent = '✏️ Chỉnh sửa bài hát';
    document.getElementById('editSongId').value = song.id;
    document.getElementById('editTitle').value = song.title;
    document.getElementById('editArtist').value = song.artist;
    document.getElementById('editGenre').value = song.genre || 'EDM';
    document.getElementById('editDuration').value = song.duration;
    document.getElementById('editType').value = song.type || 'premium';
    document.getElementById('editPrice').value = song.price || 0;
    document.getElementById('editAudioFile').value = song.audioUrl || '';
    document.getElementById('editThumbnail').value = song.thumbnail || '';
    document.getElementById('editDescription').value = song.description || '';
    document.getElementById('editBPM').value = song.bpm || '128 BPM';
    
    // Focus on title
    setTimeout(() => {
        document.getElementById('editTitle').focus();
    }, 100);
};

// Delete song function
window.deleteSong = function(songId) {
    if (!confirm('Bạn có chắc muốn xóa bài hát này?\nHành động này không thể hoàn tác.')) {
        return;
    }
    
    try {
        const songs = JSON.parse(localStorage.getItem('vgmedia_music_library')) || [];
        const song = songs.find(s => s.id === songId);
        
        if (!song) {
            showNotification('❌ Không tìm thấy bài hát', 'error');
            return;
        }
        
        // Filter out the song to delete
        const filtered = songs.filter(s => s.id !== songId);
        localStorage.setItem('vgmedia_music_library', JSON.stringify(filtered));
        
        showNotification(`🗑️ Đã xóa bài hát "${song.title}"`, 'success');
        
        // Reload table
        loadSongsTable();
        
        // Notify main page
        window.dispatchEvent(new CustomEvent('musicLibraryUpdated'));
        
    } catch (error) {
        console.error('Error deleting song:', error);
        showNotification('❌ Lỗi khi xóa bài hát', 'error');
    }
};

function setupSearchFilter() {
    const searchInput = document.getElementById('searchSongs');
    const filterSelect = document.getElementById('filterType');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterSongsTable();
        });
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            filterSongsTable();
        });
    }
}

function filterSongsTable() {
    // This is a simplified filter - you can enhance it
    console.log('Filtering songs...');
    loadSongsTable(); // For now, just reload
}

// Helper functions
function isValidUrl(string) {
    try {
        new URL(string);
        return string.startsWith('http');
    } catch (_) {
        return false;
    }
}

function isValidAudioUrl(url) {
    const audioExtensions = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac'];
    return audioExtensions.some(ext => url.toLowerCase().includes(ext));
}

function extractFileName(url) {
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        return path.substring(path.lastIndexOf('/') + 1);
    } catch (e) {
        const parts = url.split('/');
        return parts[parts.length - 1].split('?')[0];
    }
}

function extractTitleFromFileName(fileName) {
    if (!fileName) return '';
    let title = fileName.replace(/\.[^/.]+$/, "");
    title = title.replace(/[_-]/g, ' ');
    title = title.replace(/\s+/g, ' ').trim();
    
    // Capitalize
    title = title.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    return title || 'Bài hát mới';
}

function showLoadingState(show) {
    const audioInput = document.getElementById('editAudioFile');
    if (!audioInput) return;
    
    if (show) {
        audioInput.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%236C63FF\'%3E%3Cpath d=\'M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z\'/%3E%3C/svg%3E")';
        audioInput.style.backgroundRepeat = 'no-repeat';
        audioInput.style.backgroundPosition = 'right 10px center';
        audioInput.style.backgroundSize = '20px';
    } else {
        audioInput.style.backgroundImage = '';
    }
}

function showFieldNotification(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const parent = field.parentElement;
    if (!parent) return;
    
    // Remove existing notification
    const existing = parent.querySelector('.field-notification');
    if (existing) existing.remove();
    
    // Add new notification
    const notification = document.createElement('div');
    notification.className = 'field-notification';
    notification.style.cssText = `
        margin-top: 5px;
        font-size: 12px;
        color: #6C63FF;
        animation: fadeIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    
    parent.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

function showNotification(message, type = 'info') {
    console.log('Notification:', message);
    
    // Remove existing notifications
    document.querySelectorAll('.vg-notification').forEach(el => el.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'vg-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#FF6584' : '#6C63FF'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        font-family: 'Poppins', sans-serif;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}" style="font-size: 16px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
(function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .field-notification {
            animation: fadeIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
})();


console.log('✅ Admin Fixed Script v3.0 Ready');
