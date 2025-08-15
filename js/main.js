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
    
    // 4. Tạo vũ trụ nền (tạo sớm để có background)
    createUniverse();
    
    // 5. Khởi tạo performance optimizer
    initPerformanceOptimizer();
    
    // 6. Thiết lập event listeners (không bao gồm animation)
    setupEventListeners();
    
    // 7. Bắt đầu preload tất cả assets
    preloadAllAssets();
}

/**
 * Tải tất cả các model 3D cho các trang (đã được thay thế bằng preloadAllAssets)
 * Giữ lại để tương thích ngược
 */
function loadAllModels() {
    // Function này đã được thay thế bằng preloadAllAssets() trong utils.js
    // Tất cả models sẽ được preload trong preloadAllAssets()
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
