// navigation.js - Page switching and navigation logic

/**
 * Chuyển đổi giữa các trang
 */
function switchPage(pageId) {
    if (pageId === currentPageId || isAnimating) return;
    
    const oldPageId = currentPageId;
    isAnimating = true;

    const targetData = pageData[pageId];
    if (!targetData) {
        isAnimating = false;
        return;
    }

    // 1. Làm mờ trang hiện tại
    const oldPage = document.getElementById(oldPageId);
    if (oldPage) {
        oldPage.style.animation = 'fadeOut 0.5s forwards';
    }

    // Kích hoạt hiệu ứng motion blur
    gsap.to(bloomPass, {
        strength: 1.5,
        duration: 1,
        ease: 'power2.in',
        onComplete: () => {
            gsap.to(bloomPass, {
                strength: 0,
                duration: 1,
                ease: 'power2.out'
            });
        }
    });

    // 2. Bắt đầu animation cho camera bằng GSAP
    gsap.to(camera.position, {
        x: targetData.cameraPosition.x,
        y: targetData.cameraPosition.y,
        z: targetData.cameraPosition.z,
        duration: 2.8,
        ease: 'power3.inOut'
    });

    gsap.to(controlsTarget, {
        x: targetData.lookAt.x,
        y: targetData.lookAt.y,
        z: targetData.lookAt.z,
        duration: 2.8,
        ease: 'power3.inOut',
        onComplete: () => {
            isAnimating = false;
        }
    });

    // Thêm animation cho phi thuyền bay về phía hành tinh
    if (spaceship) {
        // Đánh dấu phi thuyền đang điều hướng
        spaceshipNavigating = true;
        
        // Vị trí hành tinh mục tiêu
        const targetPlanetPosition = new THREE.Vector3(
            targetData.lookAt.x,
            targetData.lookAt.y,
            targetData.lookAt.z
        );

        gsap.to(spaceship.position, {
            x: targetData.cameraPosition.x,
            y: targetData.cameraPosition.y,
            z: targetData.cameraPosition.z,
            duration: 2.5, // Ngắn hơn camera một chút để tạo cảm giác phi thuyền dẫn đầu
            ease: 'power3.inOut',
            onStart: () => {
                spaceshipNavigating = true;
            },
            onUpdate: () => {
                // Trong suốt quá trình di chuyển, luôn hướng mũi phi thuyền về hành tinh mục tiêu
                if (spaceship) {
                    // Lưu quaternion hiện tại
                    const currentQuaternion = spaceship.quaternion.clone();
                    
                    // Sử dụng lookAt trực tiếp để xác định hướng đúng
                    spaceship.lookAt(targetPlanetPosition);
                    const targetQuaternion = spaceship.quaternion.clone();
                    
                    // Khôi phục quaternion hiện tại
                    spaceship.quaternion.copy(currentQuaternion);
                    
                    // Xoay từ từ bằng slerp
                    spaceship.quaternion.slerp(targetQuaternion, 0.05);
                }
            },
            onComplete: () => {
                // Kết thúc điều hướng
                spaceshipNavigating = false;
                // Sau khi đến nơi, cập nhật lại vị trí phi thuyền trước camera
                updateSpaceshipPosition();
            }
        });
    }

    // 3. Chuyển class 'active' giữa chừng animation
    gsap.delayedCall(1.2, () => {
        if (oldPage) {
            oldPage.classList.remove('active');
            oldPage.style.animation = '';
        }
        
        const newPage = document.getElementById(pageId);
        if (newPage) {
            newPage.classList.add('active');
        }
        
        currentPageId = pageId;
    });

    // Cập nhật trạng thái active cho link điều hướng
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });
    
    window.scrollTo(0, 0);
}

/**
 * Khởi tạo các event listener cho navigation
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .logo, .cta-button');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.currentTarget.dataset.page;
            if (pageId) {
                switchPage(pageId);
            }
        });
    });
}
