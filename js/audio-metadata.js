// audio-metadata.js - Tự động lấy metadata từ file nhạc
console.log('Audio Metadata Extractor Loaded');

class AudioMetadataExtractor {
    constructor() {
        console.log('Metadata Extractor initialized');
        this.audioElement = document.createElement('audio');
    }
    
    // Lấy thông tin cơ bản từ URL
    async getBasicInfo(audioUrl) {
        return new Promise((resolve, reject) => {
            console.log('🔍 Getting audio info from:', audioUrl);
            
            const audio = new Audio();
            audio.src = audioUrl;
            audio.preload = 'metadata';
            
            // Timeout sau 5 giây
            const timeout = setTimeout(() => {
                audio.remove();
                reject(new Error('Timeout loading audio'));
            }, 5000);
            
            audio.addEventListener('loadedmetadata', () => {
                clearTimeout(timeout);
                console.log('✅ Audio metadata loaded');
                
                // Extract filename from URL
                const fileName = this.extractFileName(audioUrl);
                const duration = this.formatDuration(audio.duration);
                
                resolve({
                    fileName: fileName,
                    title: this.extractTitleFromFileName(fileName),
                    duration: duration,
                    rawDuration: audio.duration,
                    size: 'Unknown',
                    sampleRate: 'Unknown'
                });
                
                audio.remove();
            });
            
            audio.addEventListener('error', (e) => {
                clearTimeout(timeout);
                console.error('❌ Error loading audio:', e);
                reject(new Error('Không thể tải file nhạc'));
                audio.remove();
            });
            
            // Load audio
            audio.load();
        });
    }
    
    // Extract filename from URL
    extractFileName(url) {
        try {
            // Remove query parameters
            let cleanUrl = url.split('?')[0];
            // Get last part after /
            const parts = cleanUrl.split('/');
            return parts[parts.length - 1];
        } catch (e) {
            return 'audio.mp3';
        }
    }
    
    // Extract title from filename
    extractTitleFromFileName(fileName) {
        if (!fileName) return 'Bài hát mới';
        
        // Remove extension
        let title = fileName.replace(/\.[^/.]+$/, "");
        
        // Common cleanup patterns
        title = title.replace(/[_-]/g, ' ');
        title = title.replace(/^\d+\s*[-.]\s*/, '');
        title = title.replace(/\s+/g, ' ');
        
        // Remove common tags
        const tags = [
            'official', 'video', 'audio', 'lyric', 'lyrics', 
            'remix', 'mix', 'edit', 'version', 'full', 'hd',
            '4k', '1080p', '720p', 'mp3', 'm4a', 'wav'
        ];
        
        tags.forEach(tag => {
            const regex = new RegExp(`\\s*${tag}\\s*`, 'gi');
            title = title.replace(regex, ' ');
        });
        
        // Capitalize first letter of each word
        title = title.split(' ')
            .map(word => {
                if (word.length === 0) return '';
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
        
        return title.trim() || 'Bài hát mới';
    }
    
    // Format duration (seconds to HH:MM:SS)
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
    
    // Guess genre from title
    guessGenre(title) {
        if (!title) return 'EDM';
        
        const titleLower = title.toLowerCase();
        
        const genreMap = {
            'EDM': ['edm', 'electronic', 'house', 'techno', 'trance', 'dubstep', 'drum and bass', 'dnb', 'electro'],
            'Pop': ['pop', 'top 40', 'mainstream', 'vpop', 'kpop'],
            'Hip Hop': ['hip hop', 'rap', 'trap', 'r&b', 'rnb', 'hiphop'],
            'Rock': ['rock', 'metal', 'punk', 'alternative', 'hard rock'],
            'Jazz': ['jazz', 'blues', 'soul'],
            'Classical': ['classical', 'orchestra', 'symphony', 'piano'],
            'Country': ['country', 'folk', 'bluegrass'],
            'Dance': ['dance', 'disco', 'club'],
            'Indie': ['indie', 'alternative'],
            'Acoustic': ['acoustic', 'unplugged']
        };
        
        for (const [genre, keywords] of Object.entries(genreMap)) {
            if (keywords.some(keyword => titleLower.includes(keyword))) {
                return genre;
            }
        }
        
        return 'EDM';
    }
    
    // Guess BPM based on genre
    guessBPM(genre) {
        const bpmMap = {
            'EDM': '128 BPM',
            'House': '120-130 BPM',
            'Techno': '125-140 BPM',
            'Trance': '130-145 BPM',
            'Dubstep': '140-150 BPM',
            'Pop': '100-130 BPM',
            'Hip Hop': '85-115 BPM',
            'Rock': '100-140 BPM',
            'Jazz': '60-120 BPM',
            'Classical': '60-120 BPM',
            'Dance': '120-140 BPM',
            'Indie': '80-120 BPM',
            'Acoustic': '70-110 BPM',
            'Country': '80-120 BPM'
        };
        
        return bpmMap[genre] || '128 BPM';
    }
}

// Make it globally available
window.AudioMetadataExtractor = AudioMetadataExtractor;
console.log('✅ AudioMetadataExtractor ready');