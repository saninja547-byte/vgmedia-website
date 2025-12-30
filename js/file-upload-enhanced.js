// file-upload-enhanced.js - Upload file MP3 thật sự
class FileUploaderEnhanced {
    constructor() {
        console.log('🎵 File Uploader Enhanced Initialized');
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    }
    
    // Hiển thị dialog chọn file
    showFilePicker(type = 'audio') {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = type === 'audio' ? 'audio/*' : 'image/*';
            input.multiple = false;
            
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
    
    // Upload file và lưu dưới dạng Data URL (local storage)
    uploadFileToLocalStorage(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('Không có file'));
                return;
            }
            
            // Kiểm tra kích thước
            if (file.size > this.maxFileSize) {
                reject(new Error(`File quá lớn (tối đa ${this.maxFileSize / 1024 / 1024}MB)`));
                return;
            }
            
            // Kiểm tra loại file
            const isAudio = this.allowedAudioTypes.includes(file.type);
            const isImage = this.allowedImageTypes.includes(file.type);
            
            if (!isAudio && !isImage) {
                reject(new Error('Chỉ hỗ trợ file audio (MP3, WAV, OGG) hoặc ảnh (JPG, PNG)'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified,
                    dataUrl: e.target.result,
                    uploadedAt: new Date().toISOString()
                };
                
                // Lưu vào localStorage
                const storageKey = `vgmedia_uploads_${Date.now()}_${file.name}`;
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
            };
            
            reader.onerror = () => {
                reject(new Error('Lỗi đọc file'));
            };
            
            if (isAudio) {
                // Đọc dưới dạng Data URL cho audio
                reader.readAsDataURL(file);
            } else {
                // Đọc dưới dạng Data URL cho ảnh
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Lấy metadata từ file audio
    async getAudioMetadata(file) {
        return new Promise((resolve) => {
            const audio = document.createElement('audio');
            audio.preload = 'metadata';
            
            audio.onloadedmetadata = () => {
                resolve({
                    duration: this.formatDuration(audio.duration),
                    durationSeconds: audio.duration,
                    sampleRate: '44100 Hz', // Mặc định
                    channels: 2, // Stereo
                    bitrate: '320 kbps' // Mặc định
                });
            };
            
            audio.onerror = () => {
                resolve({
                    duration: '0:00',
                    durationSeconds: 0,
                    sampleRate: 'Unknown',
                    channels: 2,
                    bitrate: 'Unknown'
                });
            };
            
            // Tạo URL tạm thời từ file
            const url = URL.createObjectURL(file);
            audio.src = url;
            
            // Cleanup sau 30 giây
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 30000);
        });
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
        
        // Remove common tags
        const tags = ['official', 'video', 'audio', 'lyric', 'lyrics', 'remix', 'mix', 'edit', 'version'];
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
            if (key.startsWith('vgmedia_uploads_')) {
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
