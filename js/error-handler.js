// error-handler.js - Centralized error handling and fallback mechanisms

/**
 * Error Handler và Fallback System
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.fallbackActive = false;
        this.setupErrorHandling();
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError('JavaScript Error', event.error, event.filename, event.lineno);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Promise Rejection', event.reason);
            event.preventDefault();
        });

        // Handle WebGL context loss (đặt sau khi renderer đã được khởi tạo)
        setTimeout(() => {
            if (typeof renderer !== 'undefined' && renderer && renderer.domElement) {
                renderer.domElement.addEventListener('webglcontextlost', (event) => {
                    event.preventDefault();
                    this.handleWebGLContextLoss();
                });

                renderer.domElement.addEventListener('webglcontextrestored', () => {
                    this.handleWebGLContextRestore();
                });
            }
        }, 1000); // Chờ 1 giây để renderer được khởi tạo
    }

    /**
     * Handle general errors
     */
    handleError(type, error, filename = '', lineno = 0) {
        const errorInfo = {
            type,
            message: error?.message || error,
            filename,
            lineno,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        this.errors.push(errorInfo);
        console.error(`${type}:`, errorInfo);

        // Show user-friendly error if critical
        if (this.isCriticalError(error)) {
            this.showErrorFallback();
        }

        // Send error to analytics (if implemented)
        this.reportError(errorInfo);
    }

    /**
     * Check if error is critical
     */
    isCriticalError(error) {
        const criticalPatterns = [
            /webgl/i,
            /out of memory/i,
            /network error/i,
            /failed to fetch/i
        ];

        const errorMessage = error?.message || error;
        return criticalPatterns.some(pattern => pattern.test(errorMessage));
    }

    /**
     * Show error fallback UI
     */
    showErrorFallback() {
        if (this.fallbackActive) return;
        this.fallbackActive = true;

        const errorOverlay = document.createElement('div');
        errorOverlay.id = 'error-fallback';
        errorOverlay.innerHTML = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h2>Oops! Có lỗi xảy ra</h2>
                <p>Website đang gặp vấn đề kỹ thuật. Chúng tôi đang cố gắng khắc phục.</p>
                <div class="error-actions">
                    <button onclick="location.reload()" class="error-button">Tải lại trang</button>
                    <button onclick="errorHandler.enableFallbackMode()" class="error-button secondary">Chế độ đơn giản</button>
                </div>
                <details class="error-details">
                    <summary>Chi tiết lỗi (cho developer)</summary>
                    <pre id="error-log"></pre>
                </details>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #error-fallback {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(10, 10, 26, 0.95);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #ebebff;
                font-family: 'Roboto', sans-serif;
            }
            .error-container {
                text-align: center;
                max-width: 500px;
                padding: 40px;
                background: #11112a;
                border-radius: 8px;
                border: 1px solid #00ffff;
            }
            .error-icon {
                font-size: 3rem;
                margin-bottom: 20px;
            }
            .error-actions {
                margin: 30px 0;
            }
            .error-button {
                background: #00ffff;
                color: #0a0a1a;
                border: none;
                padding: 12px 24px;
                margin: 0 10px;
                border-radius: 4px;
                cursor: pointer;
                font-family: 'Orbitron', sans-serif;
                font-weight: bold;
            }
            .error-button.secondary {
                background: transparent;
                color: #00ffff;
                border: 1px solid #00ffff;
            }
            .error-button:hover {
                opacity: 0.8;
            }
            .error-details {
                margin-top: 30px;
                text-align: left;
            }
            .error-details pre {
                background: #0a0a1a;
                padding: 15px;
                border-radius: 4px;
                overflow: auto;
                max-height: 200px;
                font-size: 0.8rem;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(errorOverlay);

        // Show error details
        const errorLog = document.getElementById('error-log');
        if (errorLog) {
            errorLog.textContent = JSON.stringify(this.errors, null, 2);
        }
    }

    /**
     * Enable fallback mode (simple website without 3D)
     */
    enableFallbackMode() {
        // Hide 3D canvas
        const canvas = document.getElementById('bg-canvas');
        if (canvas) canvas.style.display = 'none';

        // Show simple background
        document.body.style.background = 'linear-gradient(135deg, #0A0A1A 0%, #1a1a2e 50%, #16213e 100%)';

        // Remove error overlay
        const errorOverlay = document.getElementById('error-fallback');
        if (errorOverlay) errorOverlay.remove();

        // Show content
        document.body.classList.remove('loading');
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.classList.add('hidden');

        console.log('Fallback mode enabled - 3D features disabled');
    }

    /**
     * Handle WebGL context loss
     */
    handleWebGLContextLoss() {
        console.warn('WebGL context lost');
        updateLoadingProgress(0, 'Mất kết nối đồ họa...');
        
        // Try to restore context
        setTimeout(() => {
            if (renderer && renderer.getContext()) {
                this.handleWebGLContextRestore();
            } else {
                this.enableFallbackMode();
            }
        }, 2000);
    }

    /**
     * Handle WebGL context restore
     */
    handleWebGLContextRestore() {
        console.log('WebGL context restored');
        // Reload resources
        if (typeof preloadAllAssets === 'function') {
            preloadAllAssets();
        }
    }

    /**
     * Report error to analytics (placeholder)
     */
    reportError(errorInfo) {
        // In production, send to error reporting service
        // console.log('Error reported:', errorInfo);
    }

    /**
     * Get error summary for debugging
     */
    getErrorSummary() {
        return {
            total: this.errors.length,
            types: this.errors.reduce((acc, error) => {
                acc[error.type] = (acc[error.type] || 0) + 1;
                return acc;
            }, {}),
            recent: this.errors.slice(-5)
        };
    }
}

// Global error handler instance
let errorHandler;

/**
 * Initialize error handler
 */
function initErrorHandler() {
    errorHandler = new ErrorHandler();
    console.log('Error handler initialized');
}

// Initialize immediately
initErrorHandler();
