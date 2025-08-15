// earth.js - Earth model loading and satellite logic for home page

/**
 * Tải và thiết lập model Trái Đất cho trang chủ
 */
function loadEarthModel() {
    const loader = new THREE.GLTFLoader();
    const data = pageData['home-page'];
    
    loader.load(data.modelPath, (gltf) => {
        const planet = gltf.scene;
        planet.position.copy(data.position);
        planet.scale.set(data.scale, data.scale, data.scale);
        planets[data.modelName] = planet;
        scene.add(planet);
    });
}
