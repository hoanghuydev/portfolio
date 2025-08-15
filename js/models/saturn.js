// saturn.js - Saturn model loading and animation for projects page

/**
 * Tải và thiết lập model Sao Thổ cho trang dự án
 */
function loadSaturnModel() {
    const loader = new THREE.GLTFLoader();
    const data = pageData['projects-page'];
    
    loader.load(data.modelPath, (gltf) => {
        const planet = gltf.scene;
        planet.position.copy(data.position);
        planet.scale.set(data.scale, data.scale, data.scale);
        planets[data.modelName] = planet;
        scene.add(planet);
    });
}