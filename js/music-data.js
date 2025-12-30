// VGMEDIA Music Database System
// Using localStorage for demo - In production, replace with real database

const STORAGE_KEY = 'vgmedia_music_library';
const USERS_KEY = 'vgmedia_users';

// Sample music data with free audio URLs
const DEFAULT_MUSIC_LIBRARY = [
    {
        id: 1,
        title: "Summer Vibes 2024 - DJ Remix Extended",
        artist: "VG Music Collective",
        duration: "1:25:34",
        genre: "Progressive House",
        bpm: "128 BPM",
        price: 199000,
        type: "premium",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        audioUrl: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
        description: "Bản remix độc quyền từ VGMEDIA với âm thanh chất lượng cao, phù hợp cho các buổi tiệc và tập luyện thể thao.",
        introEnd: 150 // 2:30 minutes in seconds
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
        thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        audioUrl: "https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3",
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
        thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        audioUrl: "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3",
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
        thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        audioUrl: "https://assets.mixkit.co/music/preview/mixkit-summer-breeze-12.mp3",
        description: "Cảm giác nhiệt đới với giai điệu tươi mát và nhịp điệu vui tươi.",
        introEnd: 150
    },
    {
        id: 5,
        title: "Midnight Drive Mix",
        artist: "Night Riders",
        duration: "1:22:10",
        genre: "Synthwave",
        bpm: "110 BPM",
        price: 0,
        type: "free",
        thumbnail: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        audioUrl: "https://assets.mixkit.co/music/preview/mixkit-mysterious-space-583.mp3",
        description: "Bản mix hoàn hảo cho những chuyến đi đêm với giai điệu synthwave retro.",
        introEnd: 0
    }
];

// Initialize music library
function initMusicLibrary() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MUSIC_LIBRARY));
    }
}

// Get all songs
function getMusicLibrary() {
    initMusicLibrary();
    const library = localStorage.getItem(STORAGE_KEY);
    return library ? JSON.parse(library) : [];
}

// Save music library
function saveMusicLibrary(library) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    // Dispatch event for other components to update
    window.dispatchEvent(new CustomEvent('musicLibraryUpdated'));
}

// Get song by ID
function getSongById(id) {
    const library = getMusicLibrary();
    return library.find(song => song.id === id);
}

// Add new song
function addSong(songData) {
    const library = getMusicLibrary();
    const newId = library.length > 0 ? Math.max(...library.map(s => s.id)) + 1 : 1;
    
    const newSong = {
        id: newId,
        ...songData,
        introEnd: songData.type === 'premium' ? 150 : 0
    };
    
    library.push(newSong);
    saveMusicLibrary(library);
    return newId;
}

// Update song
function updateSong(songId, songData) {
    const library = getMusicLibrary();
    const index = library.findIndex(song => song.id === songId);
    
    if (index !== -1) {
        library[index] = { ...library[index], ...songData };
        saveMusicLibrary(library);
        return true;
    }
    
    return false;
}

// Delete song
function deleteSong(songId) {
    let library = getMusicLibrary();
    library = library.filter(song => song.id !== songId);
    saveMusicLibrary(library);
    return true;
}

// Get next song
function getNextSong(currentId) {
    const library = getMusicLibrary();
    const currentIndex = library.findIndex(song => song.id === currentId);
    
    if (currentIndex === -1) return library[0];
    
    const nextIndex = (currentIndex + 1) % library.length;
    return library[nextIndex];
}

// Get previous song
function getPreviousSong(currentId) {
    const library = getMusicLibrary();
    const currentIndex = library.findIndex(song => song.id === currentId);
    
    if (currentIndex === -1) return library[0];
    
    const prevIndex = (currentIndex - 1 + library.length) % library.length;
    return library[prevIndex];
}

// Filter songs
function filterSongs(filter = 'all', searchTerm = '') {
    let library = getMusicLibrary();
    
    // Apply type filter
    if (filter !== 'all') {
        library = library.filter(song => song.type === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        library = library.filter(song => 
            song.title.toLowerCase().includes(term) ||
            song.artist.toLowerCase().includes(term) ||
            song.genre.toLowerCase().includes(term)
        );
    }
    
    return library;
}

// Initialize on load
initMusicLibrary();