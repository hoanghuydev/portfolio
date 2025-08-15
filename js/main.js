// main.js - Main controller file that orchestrates the entire 3D portfolio

let isInitialized = false;

/**
 * Khởi tạo toàn bộ hệ thống 3D
 */
function init3D() {
    if (isInitialized) return;
    isInitialized = true;

    // 1. Khởi tạo scene và camera cơ bản
    initSceneBasics();
    
    // 2. Thiết lập ánh sáng
    setupLighting();

    // 3. Tạo các vì sao nền
    createStars();
    
    // 3. Tạo vũ trụ nền
    createUniverse();
    
    // 4. Tải tất cả các model 3D
    loadAllModels();
    
    // 5. Thiết lập event listeners
    setupEventListeners();
    
    // 6. Bắt đầu animation loop
    startAnimation();
}

/**
 * Tải tất cả các model 3D cho các trang
 */
function loadAllModels() {
    loadSatellite();
    loadEarthModel();
    loadMarsModel();
    loadSaturnModel();
    loadUranusModel();
    loadSpaceship();
}

/**
 * Thiết lập tất cả event listeners
 */
function setupEventListeners() {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
    initNavigation();
}

/**
 * Khởi tạo ứng dụng khi DOM đã sẵn sàng
 */
function initializeApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init3D);
    } else {
        init3D();
    }
}

initializeApp();
