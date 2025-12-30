// File: js/music-data.js
// Dữ liệu bài hát VGMEDIA - Dùng localStorage để đồng bộ giữa các trang

// Hàm lấy dữ liệu từ localStorage
function getMusicLibrary() {
    const stored = localStorage.getItem('vgmedia_music_library');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Dữ liệu mẫu nếu chưa có trong localStorage
    const defaultLibrary = [
        {
            id: 1,
            title: "Summer Vibes 2024 - DJ Remix Extended",
            artist: "VG Music Collective",
            duration: "1:25:34",
            genre: "Progressive House",
            bpm: "128 BPM",
            price: 199000,
            type: "premium",
            thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            audioFile: "assets/audio/summer-vibes.mp3",
            description: "Bản remix độc quyền từ VGMEDIA với âm thanh chất lượng cao, phù hợp cho các buổi tiệc và tập luyện thể thao.",
            introEnd: 150 // 2:30 phút = 150 giây
        },
        {
            id: 2,
            title: "Deep Night Sessions Vol. 3",
            artist: "DJ Vortex",
            duration: "1:15:22",
            genre: "Deep House",
            bpm: "122 BPM",
            price: 0,
            type: "free",
            thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            audioFile: "assets/audio/deep-night.mp3",
            description: "Bản mix đêm sâu lắng với giai điệu mượt mà và nhịp điệu cuốn hút.",
            introEnd: 0
        },
        {
            id: 3,
            title: "Tech Energy 2024 Mix",
            artist: "VG Techno Team",
            duration: "1:32:18",
            genre: "Techno",
            bpm: "135 BPM",
            price: 249000,
            type: "premium",
            thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            audioFile: "assets/audio/tech-energy.mp3",
            description: "Năng lượng techno mạnh mẽ cho những buổi tiệc thâu đêm.",
            introEnd: 150
        },
        {
            id: 4,
            title: "Tropical House Paradise",
            artist: "Island Beats",
            duration: "1:18:45",
            genre: "Tropical House",
            bpm: "118 BPM",
            price: 179000,
            type: "premium",
            thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80",
            audioFile: "assets/audio/tropical-house.mp3",
            description: "Cảm giác nhiệt đới với giai điệu tươi mát và nhịp điệu vui tươi.",
            introEnd: 150
        }
    ];
    
    // Lưu dữ liệu mẫu vào localStorage
    localStorage.setItem('vgmedia_music_library', JSON.stringify(defaultLibrary));
    return defaultLibrary;
}

// Hàm cập nhật dữ liệu vào localStorage
function updateMusicLibrary(updatedLibrary) {
    localStorage.setItem('vgmedia_music_library', JSON.stringify(updatedLibrary));
    // Kích hoạt sự kiện để các trang khác biết dữ liệu đã thay đổi
    window.dispatchEvent(new Event('musicLibraryUpdated'));
}

// Hàm lấy bài hát theo ID
function getSongById(id) {
    const library = getMusicLibrary();
    return library.find(song => song.id === id);
}

// Hàm thêm bài hát mới
function addNewSong(songData) {
    const library = getMusicLibrary();
    const newId = library.length > 0 ? Math.max(...library.map(s => s.id)) + 1 : 1;
    
    const newSong = {
        id: newId,
        ...songData
    };
    
    library.push(newSong);
    updateMusicLibrary(library);
    return newId;
}

// Hàm cập nhật bài hát
function updateSong(songId, songData) {
    const library = getMusicLibrary();
    const index = library.findIndex(song => song.id === songId);
    
    if (index !== -1) {
        library[index] = { ...library[index], ...songData };
        updateMusicLibrary(library);
        return true;
    }
    
    return false;
}

// Hàm xóa bài hát
function deleteSong(songId) {
    let library = getMusicLibrary();
    library = library.filter(song => song.id !== songId);
    updateMusicLibrary(library);
    return true;
}

// Hàm lấy bài hát tiếp theo
function getNextSong(currentId) {
    const library = getMusicLibrary();
    const currentIndex = library.findIndex(song => song.id === currentId);
    
    if (currentIndex === -1) return library[0];
    
    const nextIndex = (currentIndex + 1) % library.length;
    return library[nextIndex];
}

// Hàm lấy bài hát trước đó
function getPreviousSong(currentId) {
    const library = getMusicLibrary();
    const currentIndex = library.findIndex(song => song.id === currentId);
    
    if (currentIndex === -1) return library[0];
    
    const prevIndex = (currentIndex - 1 + library.length) % library.length;
    return library[prevIndex];
}