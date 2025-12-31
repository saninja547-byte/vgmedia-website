// file-upload-enhanced.js - UPDATED VERSION
class FileUploaderEnhanced {
    constructor() {
        console.log('🎵 File Uploader Enhanced Initialized');
        this.maxFileSize = 500 * 1024 * 1024; // TĂNG LÊN 500MB (cho nhạc 3+ giờ)
        this.allowedAudioTypes = [
            'audio/mpeg', 
            'audio/mp3', 
            'audio/wav', 
            'audio/ogg', 
            'audio/m4a',
            'audio/flac',
            'audio/aac',
            'audio/x-m4a'
        ];
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    }
    
    // Hiển thị dialog chọn file
    showFilePicker(type = 'audio') {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = type === 'audio' ? 'audio/*,.mp3,.wav,.ogg,.m4a,.flac' : 'image/*';
            input.multiple = false;
            
            // Cho phép file lớn
            input.removeAttribute('multiple');
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    resolve(file);
                } else {
                    resolve(null);
                }
            };
            
            input.click();
        });
    }
    
    // Upload file - CẢI THIỆN CHO FILE LỚN
    async uploadFileToLocalStorage(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('Không có file'));
                return;
            }
            
            console.log('📁 File info:', {
                name: file.name,
                size: this.formatFileSize(file.size),
                type: file.type
            });
            
            // Kiểm tra kích thước - ĐÃ NÂNG LÊN 500MB
            if (file.size > this.maxFileSize) {
                reject(new Error(`File quá lớn (tối đa ${this.maxFileSize / 1024 / 1024}MB)`));
                return;
            }
            
            // Kiểm tra loại file
            const isAudio = this.allowedAudioTypes.includes(file.type.toLowerCase());
            const isImage = this.allowedImageTypes.includes(file.type.toLowerCase());
            
            if (!isAudio && !isImage) {
                // Fallback: kiểm tra extension
                const ext = file.name.toLowerCase().split('.').pop();
                const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'];
                
                if (audioExtensions.includes(ext)) {
                    console.log('✅ File có extension audio hợp lệ:', ext);
                    // Tiếp tục xử lý
                } else {
                    reject(new Error(`Không hỗ trợ file type: ${file.type}. Chỉ hỗ trợ audio (MP3, WAV, OGG, FLAC, M4A) hoặc ảnh (JPG, PNG)`));
                    return;
                }
            }
            
            const reader = new FileReader();
            
            reader.onloadstart = () => {
                console.log('🔄 Bắt đầu đọc file...');
            };
            
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    console.log(`📊 Đang đọc: ${percent}%`);
                }
            };
            
            reader.onload = (e) => {
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified,
                    dataUrl: e.target.result,
                    uploadedAt: new Date().toISOString()
                };
                
                // Tạo storage key unique
                const storageKey = `vgmedia_upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                try {
                    localStorage.setItem(storageKey, JSON.stringify(fileData));
                    console.log('✅ File saved to localStorage:', storageKey);
                    
                    resolve({
                        success: true,
                        storageKey: storageKey,
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: this.formatFileSize(file.size),
                        dataUrl: e.target.result,
                        isAudio: isAudio
                    });
                } catch (error) {
                    console.error('❌ LocalStorage error:', error);
                    
                    // Nếu localStorage đầy, thử xóa file cũ
                    this.cleanupOldUploads();
                    
                    // Thử lại
                    try {
                        localStorage.setItem(storageKey, JSON.stringify(fileData));
                        resolve({
                            success: true,
                            storageKey: storageKey,
                            fileName: file.name,
                            fileType: file.type,
                            fileSize: this.formatFileSize(file.size),
                            dataUrl: e.target.result,
                            isAudio: isAudio
                        });
                    } catch (retryError) {
                        reject(new Error('LocalStorage đã đầy. Vui lòng xóa bớt file cũ.'));
                    }
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Lỗi đọc file'));
            };
            
            // Đọc dưới dạng Data URL
            reader.readAsDataURL(file);
        });
    }
    
    // Dọn dẹp uploads cũ
    cleanupOldUploads() {
        console.log('🧹 Cleaning up old uploads...');
        const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 ngày trước
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('vgmedia_upload_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (new Date(data.uploadedAt).getTime() < cutoffTime) {
                        localStorage.removeItem(key);
                        console.log('🗑️ Removed old upload:', key);
                    }
                } catch (e) {
                    // Bỏ qua lỗi
                }
            }
        }
    }
    
    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Format duration
    formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    // Extract title from filename
    extractTitleFromFileName(filename) {
        let title = filename.replace(/\.[^/.]+$/, ""); // Remove extension
        title = title.replace(/[_-]/g, ' ');
        title = title.replace(/^\d+\s*[-.]\s*/, '');
        
        // Remove common audio tags
        const tags = [
            'official', 'video', 'audio', 'lyric', 'lyrics', 
            'remix', 'mix', 'edit', 'version', 'full', 'hd',
            '320kbps', '256kbps', '128kbps', 'high quality',
            'extended', 'radio', 'club', 'dub', 'instrumental'
        ];
        
        tags.forEach(tag => {
            const regex = new RegExp(`\\s*${tag}\\s*`, 'gi');
            title = title.replace(regex, ' ');
        });
        
        // Capitalize
        title = title.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        
        return title.trim() || 'Bài hát mới';
    }
    
    // Lấy tất cả file đã upload
    getAllUploadedFiles() {
        const files = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('vgmedia_upload_')) {
                try {
                    const fileData = JSON.parse(localStorage.getItem(key));
                    files.push({
                        key: key,
                        ...fileData
                    });
                } catch (e) {
                    console.error('Error parsing file data:', key);
                }
            }
        }
        return files;
    }
    
    // Xóa file đã upload
    deleteUploadedFile(storageKey) {
        localStorage.removeItem(storageKey);
        return true;
    }
}

// Make it global
window.FileUploaderEnhanced = FileUploaderEnhanced;
