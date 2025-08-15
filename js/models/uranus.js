// uranus.js - Uranus model loading and animation for contact page

/**
 * Tải và thiết lập model Sao Thiên Vương cho trang liên hệ
 */
function loadUranusModel() {
    const loader = new THREE.GLTFLoader();
    const data = pageData['contact-page'];
    
    loader.load(data.modelPath, (gltf) => {
        const planet = gltf.scene;
        planet.position.copy(data.position);
        planet.scale.set(data.scale, data.scale, data.scale);
        planets[data.modelName] = planet;
        scene.add(planet);
    });
}