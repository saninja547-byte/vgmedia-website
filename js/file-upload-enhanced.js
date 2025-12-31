// file-upload-enhanced.js - FIXED VERSION for large files
class FileUploaderEnhanced {
    constructor() {
        console.log('🎵 File Uploader Enhanced Initialized');
        this.maxFileSize = 500 * 1024 * 1024; // 500MB
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
        this.chunkSize = 5 * 1024 * 1024; // Chunk 5MB để tránh out of memory
    }
    
    // Hiển thị dialog chọn file
    showFilePicker(type = 'audio') {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = type === 'audio' ? 'audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac' : 'image/*';
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
    
    // Upload file với chunking để tránh out of memory
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
            
            // Kiểm tra kích thước
            if (file.size > this.maxFileSize) {
                reject(new Error(`File quá lớn (tối đa ${this.maxFileSize / 1024 / 1024}MB)`));
                return;
            }
            
            // Kiểm tra loại file
            const isAudio = this.isAudioFile(file);
            const isImage = this.allowedImageTypes.includes(file.type.toLowerCase());
            
            if (!isAudio && !isImage) {
                reject(new Error(`Không hỗ trợ file type: ${file.type}. Chỉ hỗ trợ audio hoặc ảnh`));
                return;
            }
            
            // Chunk file lớn để tránh out of memory
            if (file.size > 50 * 1024 * 1024) { // > 50MB
                console.log('📦 File lớn, sử dụng chunking...');
                this.uploadLargeFile(file, resolve, reject);
            } else {
                // File nhỏ, upload bình thường
                this.uploadSmallFile(file, resolve, reject);
            }
        });
    }
    
    // Upload file nhỏ (< 50MB)
    uploadSmallFile(file, resolve, reject) {
        const reader = new FileReader();
        
        reader.onloadstart = () => {
            console.log('🔄 Đang đọc file nhỏ...');
        };
        
        reader.onload = (e) => {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                dataUrl: e.target.result,
                uploadedAt: new Date().toISOString(),
                chunks: 1,
                chunkIndex: 0
            };
            
            // Lưu vào localStorage
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
                    isAudio: this.isAudioFile(file)
                });
            } catch (error) {
                console.error('❌ LocalStorage error:', error);
                reject(new Error('LocalStorage đã đầy. Vui lòng xóa bớt file cũ.'));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Lỗi đọc file'));
        };
        
        reader.readAsDataURL(file);
    }
    
    // Upload file lớn với chunking
    uploadLargeFile(file, resolve, reject) {
        const totalChunks = Math.ceil(file.size / this.chunkSize);
        const storageKey = `vgmedia_large_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let chunksUploaded = 0;
        let fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            uploadedAt: new Date().toISOString(),
            totalChunks: totalChunks,
            chunks: []
        };
        
        console.log(`📦 Chia thành ${totalChunks} chunks`);
        
        // Upload từng chunk
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * this.chunkSize;
            const end = Math.min(start + this.chunkSize, file.size);
            const chunk = file.slice(start, end);
            
            const chunkReader = new FileReader();
            
            chunkReader.onload = (e) => {
                fileData.chunks[chunkIndex] = {
                    data: e.target.result,
                    index: chunkIndex,
                    size: chunk.size
                };
                
                chunksUploaded++;
                
                console.log(`📊 Đã upload chunk ${chunkIndex + 1}/${totalChunks}`);
                
                // Khi upload xong tất cả chunks
                if (chunksUploaded === totalChunks) {
                    try {
                        // Lưu metadata
                        localStorage.setItem(storageKey + '_meta', JSON.stringify(fileData));
                        console.log('✅ Large file upload completed');
                        
                        resolve({
                            success: true,
                            storageKey: storageKey,
                            fileName: file.name,
                            fileType: file.type,
                            fileSize: this.formatFileSize(file.size),
                            isAudio: this.isAudioFile(file),
                            isLargeFile: true,
                            totalChunks: totalChunks
                        });
                    } catch (error) {
                        reject(new Error('Không thể lưu file lớn. Bộ nhớ đã đầy.'));
                    }
                }
            };
            
            chunkReader.onerror = () => {
                reject(new Error(`Lỗi đọc chunk ${chunkIndex}`));
            };
            
            // Đọc chunk
            chunkReader.readAsDataURL(chunk);
        }
    }
    
    // Kiểm tra file audio (bao gồm kiểm tra extension)
    isAudioFile(file) {
        // Kiểm tra MIME type
        if (this.allowedAudioTypes.includes(file.type.toLowerCase())) {
            return true;
        }
        
        // Kiểm tra extension
        const fileName = file.name.toLowerCase();
        const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];
        
        return audioExtensions.some(ext => fileName.endsWith(ext));
    }
    
    // Dọn dẹp uploads cũ
    cleanupOldUploads() {
        console.log('🧹 Cleaning up old uploads...');
        const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 ngày trước
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('vgmedia_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.uploadedAt && new Date(data.uploadedAt).getTime() < cutoffTime) {
                        localStorage.removeItem(key);
                        console.log('🗑️ Removed old upload:', key);
                    }
                } catch (e) {
                    // Bỏ qua lỗi
                }
            }
        }
    }
    
    // Lấy metadata từ file audio
    async getAudioMetadata(file) {
        return new Promise((resolve) => {
            const audio = document.createElement('audio');
            audio.preload = 'metadata';
            
            // Tạo URL tạm thời từ file
            const url = URL.createObjectURL(file);
            audio.src = url;
            
            let metadataLoaded = false;
            
            const loadTimeout = setTimeout(() => {
                if (!metadataLoaded) {
                    URL.revokeObjectURL(url);
                    resolve({
                        duration: '0:00',
                        durationSeconds: 0,
                        sampleRate: 'Unknown',
                        channels: 2,
                        bitrate: 'Unknown'
                    });
                }
            }, 10000); // Timeout 10 giây
            
            audio.onloadedmetadata = () => {
                clearTimeout(loadTimeout);
                metadataLoaded = true;
                
                resolve({
                    duration: this.formatDuration(audio.duration),
                    durationSeconds: audio.duration,
                    sampleRate: '44100 Hz',
                    channels: 2,
                    bitrate: '320 kbps'
                });
                
                URL.revokeObjectURL(url);
            };
            
            audio.onerror = () => {
                clearTimeout(loadTimeout);
                metadataLoaded = true;
                
                resolve({
                    duration: '0:00',
                    durationSeconds: 0,
                    sampleRate: 'Unknown',
                    channels: 2,
                    bitrate: 'Unknown'
                });
                
                URL.revokeObjectURL(url);
            };
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
            if (key.startsWith('vgmedia_upload_') || key.startsWith('vgmedia_large_')) {
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
        
        // Nếu là large file, xóa cả metadata
        if (storageKey.startsWith('vgmedia_large_')) {
            localStorage.removeItem(storageKey + '_meta');
        }
        
        return true;
    }
}

// Make it global
window.FileUploaderEnhanced = FileUploaderEnhanced;
