// utils.js - Shared configurations and utility functions

// --- Cấu hình cho từng trang ---
const pageData = {
    'home-page': {
        cameraPosition: new THREE.Vector3(0, 2, 9),
        lookAt: new THREE.Vector3(0, 0, 0),
        modelPath: 'model/earth.glb',
        modelName: 'earth',
        position: new THREE.Vector3(4.5, 0, 0),
        scale: 0.03
    },
    'about-page': {
        cameraPosition: new THREE.Vector3(10, 0, 8),
        lookAt: new THREE.Vector3(30, 0, 0),
        modelPath: 'model/mars.glb',
        modelName: 'mars',
        position: new THREE.Vector3(30, 0, 0),
        scale: 4
    },
    'projects-page': {
        cameraPosition: new THREE.Vector3(15, -15, 8),
        lookAt: new THREE.Vector3(15, -15, 0),
        modelPath: 'model/uranus.glb',
        modelName: 'uranus',
        position: new THREE.Vector3(20, -15, 0),
        scale: 0.02
    },
    'contact-page': {
        cameraPosition: new THREE.Vector3(-38, 0, 10),
        lookAt: new THREE.Vector3(-35, 0, 0),
        modelPath: 'model/saturn.glb',
        modelName: 'saturn',
        position: new THREE.Vector3(-30, 2, 0),
        scale: 0.03
    },
};

// --- Global variables ---
let scene, camera, renderer, stars, universe;
const planets = {};
let satellite;
let controlsTarget;
let currentPageId = 'home-page';
let isAnimating = false;
let mouseX = 0, mouseY = 0;
let clock = new THREE.Clock();
let composer, bloomPass;

// --- Loading variables ---
let loadingManager;
let textureLoader;
let gltfLoader;
let isLoaded = false;
let loadedModels = 0;
const totalModels = Object.keys(pageData).length + 2; // +2 for satellite và spaceship

// --- Spaceship variables (để tương thích với spaceship.js) ---
let spaceship = null;
let spaceshipNavigating = false;

// --- Loading Manager Functions ---

/**
 * Khởi tạo Loading Manager để theo dõi tiến trình tải
 */
function initLoadingManager() {
    loadingManager = new THREE.LoadingManager();
    
    // Cập nhật progress bar
    loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
        const progress = (itemsLoaded / itemsTotal) * 100;
        updateLoadingProgress(progress, `Đang tải: ${getFileName(url)}`);
    };
    
    // Khi tải xong tất cả
    loadingManager.onLoad = function() {
        console.log('Tất cả resources đã được tải');
        updateLoadingProgress(100, 'Hoàn thành!');
        setTimeout(() => {
            hideLoadingScreen();
            onLoadComplete(); // Measure load time
        }, 500);
    };
    
    // Xử lý lỗi
    loadingManager.onError = function(url) {
        const error = `Failed to load: ${url}`;
        console.error('Lỗi khi tải:', url);
        updateLoadingProgress(0, `Lỗi tải: ${getFileName(url)}`);
        
        // Report to error handler
        if (errorHandler) {
            errorHandler.handleError('Resource Loading Error', error);
        }
        
        // Try fallback after multiple errors
        setTimeout(() => {
            if (errorHandler && !isLoaded) {
                errorHandler.enableFallbackMode();
            }
        }, 5000);
    };
    
    // Khởi tạo loaders với loading manager
    textureLoader = new THREE.TextureLoader(loadingManager);
    gltfLoader = new THREE.GLTFLoader(loadingManager);
}

/**
 * Cập nhật progress bar
 */
function updateLoadingProgress(percentage, status) {
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const loadingStatus = document.getElementById('loading-status');
    
    if (progressFill) progressFill.style.width = percentage + '%';
    if (progressPercentage) progressPercentage.textContent = Math.round(percentage) + '%';
    if (loadingStatus) loadingStatus.textContent = status;
}

/**
 * Ẩn loading screen và hiển thị website
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const body = document.body;
    
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        body.classList.remove('loading');
        isLoaded = true;
        
        // Sau khi ẩn loading screen, bắt đầu animation
        setTimeout(() => {
            startAnimation();
        }, 100);
    }
}

/**
 * Lấy tên file từ URL
 */
function getFileName(url) {
    return url.split('/').pop().split('?')[0];
}

/**
 * Preload tất cả models và textures
 */
function preloadAllAssets() {
    updateLoadingProgress(0, 'Đang khởi tạo...');
    
    // Khởi tạo loading manager trước
    initLoadingManager();
    
    // Preload textures (universe đã được load trong createUniverse)
    textureLoader.load('images/avatar.jpg');
    
    // Preload tất cả models
    Object.values(pageData).forEach(data => {
        gltfLoader.load(data.modelPath, (gltf) => {
            // Cache model khi tải xong
            const planet = gltf.scene.clone();
            planet.position.copy(data.position);
            planet.scale.set(data.scale, data.scale, data.scale);
            planets[data.modelName] = planet;
            scene.add(planet);
            loadedModels++;
        });
    });
    
    // Load satellite (sẽ được gắn vào Earth sau khi Earth load xong)
    gltfLoader.load('model/satellite.glb', (gltf) => {
        satellite = gltf.scene;
        satellite.scale.set(5, 5, 5); // Scale gốc như ban đầu
        
        // Thêm vệ tinh vào Trái Đất sau khi Trái Đất đã được tải
        const checkEarthLoaded = setInterval(() => {
            if (planets.earth) {
                planets.earth.add(satellite);
                clearInterval(checkEarthLoaded);
            }
        }, 100);
        loadedModels++;
    });
    
    // Load spaceship (sẽ follow camera như logic gốc)
    gltfLoader.load('model/spaceship.glb', (gltf) => {
        spaceship = gltf.scene;
        spaceship.scale.set(2.3, 2.3, 2.3); // Scale gốc như ban đầu
        
        // Đặt vị trí ban đầu của phi thuyền ở trước camera
        updateSpaceshipPosition();
        
        scene.add(spaceship);
        loadedModels++;
    });
}

// --- Utility functions ---

/**
 * Xử lý sự kiện di chuyển chuột
 */
function onMouseMove(event) {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
}

/**
 * Xử lý sự kiện thay đổi kích thước cửa sổ
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

/**
 * Khởi tạo scene và camera cơ bản
 */
function initSceneBasics() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.copy(pageData['home-page'].cameraPosition);
    camera.lookAt(pageData['home-page'].lookAt);
    
    controlsTarget = pageData['home-page'].lookAt.clone();

    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const renderScene = new THREE.RenderPass(scene, camera);

    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 0; // Bắt đầu với không có hiệu ứng bloom
    bloomPass.radius = 0;

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
}

/**
 * Thiết lập ánh sáng cho scene
 */
function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 5, 10);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, -3, 5);
    scene.add(pointLight);
}

/**
 * Tạo các vì sao nền
 */
function createStars() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 15000;
    const posArray = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xaaaaaa
    });
    stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);
}

function createUniverse() {
    // Kiểm tra nếu textureLoader đã được khởi tạo
    if (!textureLoader) {
        // Nếu chưa có loading manager, tạo texture loader tạm thời
        const tempLoader = new THREE.TextureLoader();
        const universeTexture = tempLoader.load('images/texture/universe.jpg');
        
        universeTexture.wrapS = THREE.RepeatWrapping;
        universeTexture.wrapT = THREE.RepeatWrapping;
        universeTexture.repeat.set(1, 1);

        const geometry = new THREE.SphereGeometry(200, 64, 64); 
        const material = new THREE.MeshBasicMaterial({
            map: universeTexture,
            side: THREE.BackSide 
        });
        universe = new THREE.Mesh(geometry, material);
        scene.add(universe);
    } else {
        // Sử dụng texture loader đã có loading manager
        const universeTexture = textureLoader.load('images/texture/universe.jpg');
        
        universeTexture.wrapS = THREE.RepeatWrapping;
        universeTexture.wrapT = THREE.RepeatWrapping;
        universeTexture.repeat.set(1, 1);

        const geometry = new THREE.SphereGeometry(200, 64, 64); 
        const material = new THREE.MeshBasicMaterial({
            map: universeTexture,
            side: THREE.BackSide 
        });
        universe = new THREE.Mesh(geometry, material);
        scene.add(universe);
    }
}