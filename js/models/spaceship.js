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
                
                // Điều chỉnh scale dựa trên device type
                const isMobile = isMobileDevice();
                const scale = isMobile ? 1.8 : 2.3; // Nhỏ hơn trên mobile
                spaceship.scale.set(scale, scale, scale);
                
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
 * Kiểm tra xem có phải mobile device không
 */
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Cập nhật scale spaceship khi thay đổi kích thước màn hình
 */
function updateSpaceshipScale() {
    if (!spaceship) return;
    
    const isMobile = isMobileDevice();
    const scale = isMobile ? 1.8 : 2.3;
    spaceship.scale.set(scale, scale, scale);
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

    // Điều chỉnh offset dựa trên device type
    const isMobile = isMobileDevice();
    const rightOffset = isMobile ? 0.3 : 1; // Giảm offset sang phải trên mobile
    const downOffset = isMobile ? -0.3 : -0.6; // Điều chỉnh vị trí dọc
    const forwardOffset = isMobile ? 1.5 : 2; // Điều chỉnh khoảng cách

    const offset = new THREE.Vector3()
        .add(right.multiplyScalar(rightOffset)) // Lệch sang phải (ít hơn trên mobile)
        .add(up.multiplyScalar(downOffset)) // Đi xuống dưới
        .add(cameraDirection.multiplyScalar(forwardOffset)); // Ở phía trước

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
