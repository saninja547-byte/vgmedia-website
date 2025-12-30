// VGMEDIA Admin Panel - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel loading...');
    
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
    
    // Debug info
    console.log('Add button element:', addSongBtn);
    console.log('Modal element:', editModal);
    
    // SIMPLE FIX: Thêm event listener trực tiếp
    if (addSongBtn) {
        addSongBtn.addEventListener('click', function(e) {
            console.log('ADD SONG BUTTON CLICKED!', e);
            openAddModal();
        });
    }
    
    // Initialize
    initAdmin();
    
    function initAdmin() {
        console.log('Initializing admin panel...');
        
        // Load songs table
        loadSongsTable();
        
        // Setup event listeners
        setupEventListeners();
        
        // Show notification
        showNotification('Admin panel đã sẵn sàng!');
    }
    
    function openAddModal() {
        console.log('Opening add modal...');
        
        if (!editModal) {
            console.error('Modal not found!');
            return;
        }
        
        // Show modal
        editModal.style.display = 'flex';
        editModal.classList.add('active');
        
        // Reset form
        if (editSongForm) editSongForm.reset();
        
        // Set modal title
        if (modalTitle) modalTitle.textContent = 'Thêm bài hát mới';
        
        // Set default values
        try {
            const songs = window.getMusicLibrary ? window.getMusicLibrary() : [];
            const newId = songs.length > 0 ? Math.max(...songs.map(s => s.id)) + 1 : 1;
            
            document.getElementById('editSongId').value = newId;
            document.getElementById('editTitle').value = '';
            document.getElementById('editArtist').value = '';
            document.getElementById('editGenre').value = 'EDM';
            document.getElementById('editDuration').value = '0:03:30';
            document.getElementById('editType').value = 'premium';
            document.getElementById('editPrice').value = 199000;
            document.getElementById('editAudioFile').value = '';
            
            // Default thumbnail
            const thumbInput = document.getElementById('editThumbnail');
            if (thumbInput) {
                thumbInput.value = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f';
            }
            
            document.getElementById('editDescription').value = '';
            
        } catch (e) {
            console.error('Error setting default values:', e);
        }
    }
    
    function loadSongsTable() {
        console.log('Loading songs table...');
        
        try {
            // Your table loading code here
            if (songsTableBody) {
                songsTableBody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';
            }
        } catch (e) {
            console.error('Error loading table:', e);
        }
    }
    
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Modal close
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                editModal.style.display = 'none';
                editModal.classList.remove('active');
            });
        }
        
        // Cancel button
        if (btnCancel) {
            btnCancel.addEventListener('click', function() {
                editModal.style.display = 'none';
                editModal.classList.remove('active');
            });
        }
        
        // Close modal when clicking outside
        if (editModal) {
            editModal.addEventListener('click', function(e) {
                if (e.target === editModal) {
                    editModal.style.display = 'none';
                    editModal.classList.remove('active');
                }
            });
        }
        
        // Form submit
        if (editSongForm) {
            editSongForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Form submitted!');
                editModal.style.display = 'none';
                editModal.classList.remove('active');
            });
        }
    }
    
    function showNotification(message) {
        console.log('Notification:', message);
        // Simple alert for now
        alert(message);
    }
});