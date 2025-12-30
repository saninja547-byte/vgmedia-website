// file-upload.js - Upload file ảnh/audio lên ImgBB (Free)
class FileUploader {
    constructor() {
        this.IMG_BB_API_KEY = 'YOUR_API_KEY_HERE'; // FREE API KEY
        this.IMG_BB_URL = 'https://api.imgbb.com/1/upload';
    }
    
    // Upload ảnh thumbnail
    async uploadImage(file) {
        if (!file) return null;
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('File quá lớn (tối đa 10MB)');
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Chỉ hỗ trợ file ảnh');
        }
        
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            // For demo, we'll use a mock URL
            // In production, you need to get free API key from imgbb.com
            return this.getMockImageUrl(file.name);
            
            // REAL CODE (uncomment when you have API key):
            /*
            const response = await fetch(`${this.IMG_BB_URL}?key=${this.IMG_BB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            return data.data.url;
            */
            
        } catch (error) {
            console.error('Upload error:', error);
            // Fallback: Use placeholder
            return this.getPlaceholderImage();
        }
    }
    
    // Mock function for demo
    getMockImageUrl(filename) {
        const images = [
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
            'https://images.unsplash.com/photo-1518609878373-06d740f60d8b',
            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad',
            'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1'
        ];
        
        const randomImage = images[Math.floor(Math.random() * images.length)];
        return `${randomImage}?auto=format&fit=crop&w=500&q=80`;
    }
    
    getPlaceholderImage() {
        return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80';
    }
    
    // For audio files - we'll use mock URLs for demo
    getAudioUrl(filename) {
        const audioFiles = {
            'mp3': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            'wav': 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
            'm4a': 'https://file-examples.com/storage/fe8c7eef0c6334e979d40b4/2017/11/file_example_MP3_5MG.mp3'
        };
        
        const ext = filename.split('.').pop().toLowerCase();
        return audioFiles[ext] || audioFiles.mp3;
    }
}

// Make it global
window.FileUploader = FileUploader;