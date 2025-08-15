// js/models/spaceship.js

let spaceship = null;

/**
 * Tải model phi thuyền không gian
 */
function loadSpaceship() {
    const loader = new THREE.GLTFLoader();
    loader.load(
        'model/spaceship.glb',
        (gltf) => {
            spaceship = gltf.scene;
            spaceship.scale.set(2.3, 2.3, 2.3); 
            
            // Đặt vị trí ban đầu của phi thuyền ở trước camera
            updateSpaceshipPosition();
            
            scene.add(spaceship);
        },
        undefined,
        (error) => {
            console.error('Lỗi khi tải model phi thuyền:', error);
        }
    );
}

/**
 * Cập nhật vị trí và hướng của phi thuyền
 */
function updateSpaceshipPosition() {
    if (!spaceship) return;

    // Tính toán vị trí phía trước camera
    const distance = 1.5; 
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    const position = new THREE.Vector3().copy(camera.position).add(cameraDirection.multiplyScalar(distance));
    spaceship.position.copy(position);

    // Hướng phi thuyền về phía trước
    spaceship.lookAt(position.add(cameraDirection.multiplyScalar(1))); 
}
