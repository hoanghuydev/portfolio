// js/models/spaceship.js

// spaceship và spaceshipNavigating đã được khai báo global trong utils.js

/**
 * Tải model phi thuyền không gian
 * (Đã được tích hợp vào preloadAllAssets)
 */
function loadSpaceship() {
    // Spaceship đã được preload trong preloadAllAssets()
    // Function này được giữ lại để tương thích ngược
    
    // Nếu spaceship chưa được load, load nó với gltfLoader global
    if (!spaceship && gltfLoader) {
        gltfLoader.load(
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
}

/**
 * Cập nhật vị trí và hướng của phi thuyền
 */
function updateSpaceshipPosition() {
    if (!spaceship) return;

    // Tính toán vị trí mới cho phi thuyền (hơi lệch sang một bên và ở dưới camera)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, cameraDirection).normalize();

    const up = new THREE.Vector3();
    up.crossVectors(cameraDirection, right).normalize();

    const offset = new THREE.Vector3()
        .add(right.multiplyScalar(1)) // Lệch sang phải
        .add(up.multiplyScalar(-0.6)) // Đi xuống dưới
        .add(cameraDirection.multiplyScalar(2)); // Ở phía trước

    const position = new THREE.Vector3().copy(camera.position).add(offset);
    spaceship.position.copy(position);

    // Chỉ thay đổi hướng khi không đang điều hướng tới hành tinh khác
    if (!spaceshipNavigating) {
        const lookAtPosition = new THREE.Vector3().copy(position)
            .add(cameraDirection.multiplyScalar(1))
            .add(up.multiplyScalar(0.1));
        spaceship.lookAt(lookAtPosition);
    }
}
