// animation.js - Main animation loop and effects

/**
 * Vòng lặp animation chính
 */
function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Xoay vũ trụ
    if (universe) {
        universe.rotation.y += 0.00005;
        universe.rotation.x += 0.00005;
    }

    // Xoay các vì sao nền
    if (stars) {
        stars.rotation.y += 0.00005;
        stars.rotation.x += 0.00005;
    }

    // Cập nhật animation cho từng hành tinh
    updateSatelliteAnimation(elapsedTime);

    // Hiệu ứng parallax khi không có animation chuyển trang
    if (!isAnimating) {
        const targetData = pageData[currentPageId];
        camera.position.x += (targetData.cameraPosition.x + (mouseX * 0.001) - camera.position.x) * 0.05;
        camera.position.y += (targetData.cameraPosition.y + (-mouseY * 0.001) - camera.position.y) * 0.05;
    }

    camera.lookAt(controlsTarget);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

/**
 * Khởi tạo và bắt đầu vòng lặp animation
 */
function startAnimation() {
    animate();
}
