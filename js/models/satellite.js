// satellite.js - Satellite model loading and animation for home page
/**
 * Tải và thiết lập vệ tinh cho Trái Đất
 */
function loadSatellite() {
    const loader = new THREE.GLTFLoader();
    
    loader.load('model/satellite.glb', (gltf) => {
        satellite = gltf.scene;
        satellite.scale.set(5, 5, 5);
        
        // Thêm vệ tinh vào Trái Đất sau khi Trái Đất đã được tải
        const checkEarthLoaded = setInterval(() => {
            if (planets.earth) {
                planets.earth.add(satellite);
                clearInterval(checkEarthLoaded);
            }
        }, 100);
    });
}

/**
 * Cập nhật hoạt động của Trái Đất và vệ tinh trong animation loop
 */
function updateSatelliteAnimation(elapsedTime) {
    // Vệ tinh quay quanh Trái Đất
    if (satellite) {
        const orbitRadius = 160; // Bán kính quỹ đạo lớn hơn trong local space
        const verticalOrbit = 40; // Quỹ đạo theo trục y
        satellite.position.x = Math.sin(elapsedTime * 0.4) * orbitRadius;
        satellite.position.z = Math.cos(elapsedTime * 0.4) * orbitRadius;
        satellite.position.y = Math.cos(elapsedTime * 0.8) * verticalOrbit;
        satellite.lookAt(new THREE.Vector3(0, 0, 0)); // Hướng mũi tàu vào tâm Trái Đất
    }
}
