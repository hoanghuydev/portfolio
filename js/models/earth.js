// earth.js - Earth model loading and satellite logic for home page

/**
 * Tải và thiết lập model Trái Đất cho trang chủ
 * (Đã được tích hợp vào preloadAllAssets)
 */
function loadEarthModel() {
    // Model này đã được preload trong preloadAllAssets()
    // Function này được giữ lại để tương thích ngược
    const data = pageData['home-page'];
    
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
