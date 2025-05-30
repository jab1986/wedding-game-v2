// src/js/main.js
import { Game } from './game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    const game = new Game('game-canvas');

    // Handle window resize
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
        }, 250);
    }

    function resizeCanvas() {
        const container = document.getElementById('game-container');
        const maxWidth = window.innerWidth - 8;
        const maxHeight = window.innerHeight - 8;
        const scale = Math.min(maxWidth / 800, maxHeight / 600);

        if (window.innerWidth < 768) {
            container.style.transform = `scale(${scale})`;
            container.style.transformOrigin = 'center center';
        } else {
            container.style.transform = 'scale(1)';
        }
    }

    // Initial resize
    resizeCanvas();
    window.addEventListener('resize', handleResize);

    // Prevent unwanted mobile behaviors
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });

    // Debug mode toggle with konami code
    let konamiCode = [];
    const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    window.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);

        if (konamiCode.join(',') === konamiPattern.join(',')) {
            window.DEBUG_MODE = !window.DEBUG_MODE;
            console.log('Debug mode:', window.DEBUG_MODE ? 'ON' : 'OFF');
            if (window.DEBUG_MODE) {
                // Add debug UI
                addDebugUI();
            } else {
                // Remove debug UI
                removeDebugUI();
            }
        }
    });

    // Performance monitoring
    let lastFPSUpdate = 0;
    let frameCount = 0;
    let fps = 0;

    function updateFPS(timestamp) {
        frameCount++;

        if (timestamp - lastFPSUpdate >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastFPSUpdate = timestamp;

            if (window.DEBUG_MODE) {
                const fpsDisplay = document.getElementById('debug-fps');
                if (fpsDisplay) {
                    fpsDisplay.textContent = `FPS: ${fps}`;
                }
            }
        }

        requestAnimationFrame(updateFPS);
    }

    requestAnimationFrame(updateFPS);

    // Expose game instance for debugging
    window.GAME = game;
});

function addDebugUI() {
    const debugUI = document.createElement('div');
    debugUI.id = 'debug-ui';
    debugUI.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.8);
        color: #0f0;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
    `;

    debugUI.innerHTML = `
        <div id="debug-fps">FPS: 0</div>
        <div id="debug-entities">Entities: 0</div>
        <div id="debug-particles">Particles: 0</div>
        <div id="debug-state">State: </div>
    `;

    document.body.appendChild(debugUI);
}

function removeDebugUI() {
    const debugUI = document.getElementById('debug-ui');
    if (debugUI) {
        debugUI.remove();
    }
}