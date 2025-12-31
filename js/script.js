class MusicUploader {
    constructor() {
        this.chunkSize = 1024 * 1024; // 1MB chunks
        this.maxRetries = 3;
        this.files = [];
        this.initializeElements();
        this.setupEventListeners();
        this.loadExistingFiles();
        this.updateStats();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.browseBtn = document.getElementById('browseBtn');
        this.fileInput = document.getElementById('fileInput');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercent = document.getElementById('progressPercent');
        this.fileName = document.getElementById('fileName');
        this.musicGrid = document.getElementById('musicGrid');
        this.notificationContainer = document.getElementById('notificationContainer');
    }

    setupEventListeners() {
        this.browseBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.style.borderColor = '#6c5ce7';
            this.uploadArea.style.background = 'rgba(108, 92, 231, 0.1)';
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            this.uploadArea.style.background = 'rgba(255, 255, 255, 0.03)';
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            this.uploadArea.style.background = 'rgba(255, 255, 255, 0.03)';
            this.handleFileSelect(e);
        });
    }

    handleFileSelect(e) {
        const files = e.target.files || e.dataTransfer.files;
        if (!files.length) return;

        Array.from(files).forEach(file => {
            if (!this.isValidAudioFile(file)) {
                this.showNotification('Lỗi', `File ${file.name} không phải là file nhạc hợp lệ`, 'error');
                return;
            }

            if (file.size > 200 * 1024 * 1024) {
                this.showNotification('Lỗi', `File ${file.name} vượt quá 200MB`, 'error');
                return;
            }

            this.showNotification('Thông tin', `Đang xử lý: ${file.name}`, 'warning');
            this.uploadFile(file);
        });
    }

    isValidAudioFile(file) {
        const validTypes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
            'audio/x-wav', 'audio/flac', 'audio/aac', 'audio/x-m4a',
            'audio/ogg', 'audio/webm'
        ];
        return validTypes.includes(file.type) || file.name.match(/\.(mp3|wav|flac|aac|m4a|ogg|webm)$/i);
    }

    async uploadFile(file, retryCount = 0) {
        const totalChunks = Math.ceil(file.size / this.chunkSize);
        let uploadedChunks = 0;
        
        this.showProgress(file.name);

        try {
            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * this.chunkSize;
                const end = Math.min(start + this.chunkSize, file.size);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append('file', chunk);
                formData.append('fileName', file.name);
                formData.append('chunkIndex', chunkIndex);
                formData.append('totalChunks', totalChunks);
                formData.append('fileSize', file.size);
                formData.append('fileType', file.type);

                const response = await fetch('upload.php', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                uploadedChunks++;
                const progress = Math.round((uploadedChunks / totalChunks) * 90); // 90% cho upload
                this.updateProgress(progress, file.name);
            }

            // Hoàn tất upload
            const response = await fetch('upload.php?complete=' + encodeURIComponent(file.name), {
                method: 'GET'
            });

            const result = await response.json();

            if (result.success) {
                this.updateProgress(100, file.name);
                this.showNotification('Thành công', `Đã upload ${file.name} thành công!`, 'success');
                this.addMusicCard(result.file);
                this.updateStats();
                
                // Reset sau 2 giây
                setTimeout(() => {
                    this.hideProgress();
                    this.fileInput.value = '';
                }, 2000);
            } else {
                throw new Error(result.error || 'Lỗi khi hoàn tất upload');
            }

        } catch (error) {
            console.error('Upload error:', error);
            
            if (retryCount < this.maxRetries) {
                this.showNotification('Thử lại', `Đang thử lại upload ${file.name}... (${retryCount + 1}/${this.maxRetries})`, 'warning');
                setTimeout(() => this.uploadFile(file, retryCount + 1), 2000);
            } else {
                this.showNotification('Lỗi', `Không thể upload ${file.name}: ${error.message}`, 'error');
                this.hideProgress();
            }
        }
    }

    showProgress(fileName) {
        this.fileName.textContent = fileName;
        this.progressContainer.style.display = 'block';
        this.updateProgress(0, fileName);
    }

    updateProgress(percent, fileName) {
        this.progressFill.style.width = percent + '%';
        this.progressPercent.textContent = percent + '%';
        this.fileName.textContent = `${fileName} (${percent}%)`;
        
        // Hiệu ứng màu sắc khi gần hoàn thành
        if (percent > 85) {
            this.progressFill.style.background = 'linear-gradient(90deg, #00b894, #00cec9)';
        }
    }

    hideProgress() {
        setTimeout(() => {
            this.progressContainer.style.display = 'none';
            this.progressFill.style.width = '0%';
            this.progressFill.style.background = 'linear-gradient(90deg, var(--primary), var(--accent))';
        }, 1000);
    }

    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)} notification-icon"></i>
                <div class="notification-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;

        this.notificationContainer.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 5000);
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    addMusicCard(fileInfo) {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.innerHTML = `
            <i class="fas fa-music music-icon"></i>
            <div class="music-info">
                <h4>${fileInfo.name}</h4>
                <div class="music-meta">
                    <span>${this.formatFileSize(fileInfo.size)}</span>
                    <span>${moment(fileInfo.uploaded).fromNow()}</span>
                </div>
            </div>
            <div class="music-actions">
                <button class="action-btn" onclick="musicPlayer.play('${fileInfo.path}')">
                    <i class="fas fa-play"></i> Play
                </button>
                <button class="action-btn" onclick="musicPlayer.download('${fileInfo.path}', '${fileInfo.name}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `;

        this.musicGrid.insertBefore(card, this.musicGrid.firstChild);
        this.files.unshift(fileInfo);
        this.saveToLocalStorage();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    loadExistingFiles() {
        const stored = localStorage.getItem('musicFiles');
        if (stored) {
            this.files = JSON.parse(stored);
            this.files.forEach(file => this.addMusicCard(file));
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('musicFiles', JSON.stringify(this.files.slice(0, 50))); // Lưu 50 file gần nhất
    }

    updateStats() {
        document.getElementById('totalFiles').textContent = this.files.length;
        
        const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
        document.getElementById('totalSize').textContent = this.formatFileSize(totalSize);
        
        if (this.files.length > 0) {
            const latest = this.files[0].uploaded;
            document.getElementById('lastUpload').textContent = moment(latest).fromNow();
        }
    }
}

// Music Player Controller
const musicPlayer = {
    play: function(path) {
        const audio = new Audio(path);
        audio.play();
        window.showNotification('Phát nhạc', 'Đang phát bài hát...', 'success');
    },
    
    download: function(path, name) {
        const a = document.createElement('a');
        a.href = path;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.showNotification('Tải xuống', `Đang tải ${name}...`, 'success');
    }
};

// Khởi tạo khi trang load
window.addEventListener('DOMContentLoaded', () => {
    window.musicUploader = new MusicUploader();
    window.showNotification = (title, message, type) => 
        window.musicUploader.showNotification(title, message, type);
});
