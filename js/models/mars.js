// mars.js - Mars model loading and animation for about page

/**
 * Tải và thiết lập model Sao Hỏa cho trang giới thiệu
 */
function loadMarsModel() {
    const loader = new THREE.GLTFLoader();
    const data = pageData['about-page'];
    
    loader.load(data.modelPath, (gltf) => {
        const planet = gltf.scene;
        planet.position.copy(data.position);
        planet.scale.set(data.scale, data.scale, data.scale);
        planets[data.modelName] = planet;
        scene.add(planet);
    });
}

