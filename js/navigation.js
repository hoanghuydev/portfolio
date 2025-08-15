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

    // 2. Bắt đầu animation cho camera bằng GSAP
    gsap.to(camera.position, {
        x: targetData.cameraPosition.x,
        y: targetData.cameraPosition.y,
        z: targetData.cameraPosition.z,
        duration: 2.8,
        ease: 'power3.inOut',
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
