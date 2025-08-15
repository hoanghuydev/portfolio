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
    const textureLoader = new THREE.TextureLoader();
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

    // Thêm một biến global để có thể xoay nó trong hàm animate
}