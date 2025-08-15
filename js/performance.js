// performance.js - Performance optimizations and monitoring

/**
 * Tối ưu hiệu năng và monitoring
 */
class PerformanceOptimizer {
    constructor() {
        this.performanceMetrics = {
            loadTime: 0,
            renderTime: 0,
            frameRate: 0,
            memoryUsage: 0
        };
        this.startTime = performance.now();
        this.frameCount = 0;
        this.lastFrameTime = 0;
    }

    /**
     * Khởi tạo tối ưu hiệu năng
     */
    init() {
        this.optimizeRenderer();
        this.enableFrustumCulling();
        this.setupPerformanceMonitoring();
        this.preloadCriticalAssets();
    }

    /**
     * Tối ưu renderer
     */
    optimizeRenderer() {
        if (renderer) {
            // Giảm pixel ratio trên thiết bị có DPI cao
            const maxPixelRatio = Math.min(window.devicePixelRatio, 2);
            renderer.setPixelRatio(maxPixelRatio);
            
            // Enable shadow map optimization
            renderer.shadowMap.enabled = false; // Tắt shadow để tăng performance
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // Optimize rendering
            renderer.powerPreference = "high-performance";
            renderer.antialias = window.devicePixelRatio < 2; // Chỉ enable antialias trên màn hình thường
        }
    }

    /**
     * Enable frustum culling để chỉ render objects trong view
     */
    enableFrustumCulling() {
        if (scene && camera) {
            scene.traverse((object) => {
                if (object.isMesh) {
                    object.frustumCulled = true;
                }
            });
        }
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor FPS
        this.monitorFrameRate();
        
        // Monitor memory usage
        this.monitorMemoryUsage();
        
        // Log performance metrics periodically
        setInterval(() => {
            this.logPerformanceMetrics();
        }, 10000); // Log every 10 seconds
    }

    /**
     * Monitor frame rate
     */
    monitorFrameRate() {
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        if (delta > 0) {
            const fps = 1000 / delta;
            this.performanceMetrics.frameRate = Math.round(fps);
        }
        
        this.frameCount++;
        requestAnimationFrame(() => this.monitorFrameRate());
    }

    /**
     * Monitor memory usage
     */
    monitorMemoryUsage() {
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = Math.round(
                performance.memory.usedJSHeapSize / 1048576
            ); // Convert to MB
        }
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        console.log('Performance Metrics:', this.performanceMetrics);
        
        // Warn if performance is poor
        if (this.performanceMetrics.frameRate < 30) {
            console.warn('Low frame rate detected:', this.performanceMetrics.frameRate, 'FPS');
        }
        
        if (this.performanceMetrics.memoryUsage > 100) {
            console.warn('High memory usage:', this.performanceMetrics.memoryUsage, 'MB');
        }
    }

    /**
     * Preload critical assets với priority
     */
    preloadCriticalAssets() {
        // Preload critical textures với low quality trước
        const criticalTextures = [
            'images/avatar.jpg',
            'images/texture/universe.jpg'
        ];

        criticalTextures.forEach(path => {
            const img = new Image();
            img.src = path;
        });
    }

    /**
     * Cleanup resources khi không cần thiết
     */
    cleanupResources() {
        // Cleanup textures
        Object.values(planets).forEach(planet => {
            if (planet.material && planet.material.map) {
                planet.material.map.dispose();
            }
            if (planet.material) {
                planet.material.dispose();
            }
            if (planet.geometry) {
                planet.geometry.dispose();
            }
        });

        // Cleanup renderer
        if (renderer) {
            renderer.dispose();
        }
    }

    /**
     * Adaptive quality dựa trên performance
     */
    adaptiveQuality() {
        const fps = this.performanceMetrics.frameRate;
        
        if (fps < 30) {
            // Reduce quality
            this.reduceQuality();
        } else if (fps > 50) {
            // Can increase quality
            this.increaseQuality();
        }
    }

    /**
     * Giảm chất lượng khi performance thấp
     */
    reduceQuality() {
        if (renderer) {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        }
        
        // Reduce particle count
        if (stars && stars.geometry.attributes.position.count > 5000) {
            const reducedPositions = new Float32Array(5000 * 3);
            stars.geometry.setAttribute('position', new THREE.BufferAttribute(reducedPositions, 3));
        }
        
        console.log('Quality reduced due to low performance');
    }

    /**
     * Tăng chất lượng khi performance tốt
     */
    increaseQuality() {
        if (renderer && renderer.getPixelRatio() < 2) {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
        
        console.log('Quality increased due to good performance');
    }

    /**
     * Measure load time
     */
    measureLoadTime() {
        this.performanceMetrics.loadTime = performance.now() - this.startTime;
        console.log('Total load time:', this.performanceMetrics.loadTime.toFixed(2), 'ms');
    }
}

// Global performance optimizer instance
let performanceOptimizer;

/**
 * Khởi tạo performance optimizer
 */
function initPerformanceOptimizer() {
    performanceOptimizer = new PerformanceOptimizer();
    performanceOptimizer.init();
}

/**
 * Gọi khi load xong để measure load time
 */
function onLoadComplete() {
    if (performanceOptimizer) {
        performanceOptimizer.measureLoadTime();
    }
}

/**
 * Cleanup resources khi rời khỏi trang
 */
window.addEventListener('beforeunload', () => {
    if (performanceOptimizer) {
        performanceOptimizer.cleanupResources();
    }
});

/**
 * Adaptive quality dựa trên performance
 */
setInterval(() => {
    if (performanceOptimizer) {
        performanceOptimizer.adaptiveQuality();
    }
}, 5000); // Check every 5 seconds
