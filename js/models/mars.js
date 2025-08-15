// mars.js - Mars model loading and animation for about page

/**
 * Tải và thiết lập model Sao Hỏa cho trang giới thiệu
 * (Đã được tích hợp vào preloadAllAssets)
 */
function loadMarsModel() {
    // Model này đã được preload trong preloadAllAssets()
    // Function này được giữ lại để tương thích ngược
    const data = pageData['about-page'];
    
    // Nếu model chưa được load, load nó với gltfLoader global
    if (!planets[data.modelName] && gltfLoader) {
        gltfLoader.load(data.modelPath, (gltf) => {
            const planet = gltf.scene;
            planet.position.copy(data.position);
            planet.scale.set(data.scale, data.scale, data.scale);
            planets[data.modelName] = planet;
            scene.add(planet);
        });
    }
}

