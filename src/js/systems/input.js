/**
 * Input Manager - Handles keyboard and touch input
 * SNES-style controls with mobile touch support
 */

export class InputManager {
    constructor(canvas, isMobile = false) {
        this.canvas = canvas;
        this.isMobile = isMobile;

        // Event listeners
        this.listeners = {};

        // Input state
        this.keys = {};
        this.previousKeys = {};
        this.touches = {};

        // SNES controller mapping
        this.keyMap = {
            // D-Pad
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'KeyW': 'up',
            'KeyS': 'down',
            'KeyA': 'left',
            'KeyD': 'right',

            // Action buttons
            'KeyZ': 'a',
            'KeyX': 'b',
            'Space': 'a',
            'ShiftLeft': 'b',

            // System buttons
            'Enter': 'start',
            'Escape': 'select',
            'KeyP': 'select'
        };

        // Touch control elements
        this.touchElements = {
            dpad: null,
            actionButtons: null
        };

        this.init();
    }

    /**
     * Initialize input system
     */
    init() {
        this.setupKeyboardEvents();

        if (this.isMobile) {
            this.setupTouchEvents();
        }

        console.log('🎮 Input manager initialized');
    }

    /**
     * Setup keyboard event listeners
     */
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            const mappedKey = this.keyMap[e.code] || e.key;

            if (!this.keys[mappedKey]) {
                this.keys[mappedKey] = true;
                this.emit('keydown', mappedKey);
            }
        });

        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            const mappedKey = this.keyMap[e.code] || e.key;

            this.keys[mappedKey] = false;
            this.emit('keyup', mappedKey);
        });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Setup touch event listeners for mobile
     */
    setupTouchEvents() {
        // Get touch control elements
        this.touchElements.dpad = document.getElementById('dpad');
        this.touchElements.actionButtons = document.getElementById('action-buttons');

        if (this.touchElements.dpad) {
            this.setupDPadEvents();
        }

        if (this.touchElements.actionButtons) {
            this.setupActionButtonEvents();
        }
    }

    /**
     * Setup D-Pad touch events
     */
    setupDPadEvents() {
        const dpadButtons = this.touchElements.dpad.querySelectorAll('.dpad-button');

        dpadButtons.forEach(button => {
            const direction = button.dataset.direction;
            if (direction === 'center') return;

            // Touch start
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                button.classList.add('pressed');
                this.keys[direction] = true;
                this.emit('touchstart', { direction, action: null });
                this.emit('keydown', direction);
            });

            // Touch end
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.classList.remove('pressed');
                this.keys[direction] = false;
                this.emit('touchend', { direction, action: null });
                this.emit('keyup', direction);
            });

            // Touch cancel
            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                button.classList.remove('pressed');
                this.keys[direction] = false;
                this.emit('touchend', { direction, action: null });
                this.emit('keyup', direction);
            });

            // Prevent touch from propagating
            button.addEventListener('touchmove', (e) => {
                e.preventDefault();
            });
        });
    }

    /**
     * Setup action button touch events
     */
    setupActionButtonEvents() {
        const actionButtons = this.touchElements.actionButtons.querySelectorAll('.action-button');

        actionButtons.forEach(button => {
            const action = button.dataset.action;

            // Touch start
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                button.classList.add('pressed');
                this.keys[action] = true;
                this.emit('touchstart', { direction: null, action });
                this.emit('keydown', action);
            });

            // Touch end
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.classList.remove('pressed');
                this.keys[action] = false;
                this.emit('touchend', { direction: null, action });
                this.emit('keyup', action);
            });

            // Touch cancel
            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                button.classList.remove('pressed');
                this.keys[action] = false;
                this.emit('touchend', { direction: null, action });
                this.emit('keyup', action);
            });

            // Prevent touch from propagating
            button.addEventListener('touchmove', (e) => {
                e.preventDefault();
            });
        });
    }

    /**
     * Update input state (called each frame)
     */
    update() {
        // Store previous frame's input state
        this.previousKeys = { ...this.keys };
    }

    /**
     * Check if key is currently pressed
     */
    isPressed(key) {
        return !!this.keys[key];
    }

    /**
     * Check if key was just pressed this frame
     */
    isJustPressed(key) {
        return !!this.keys[key] && !this.previousKeys[key];
    }

    /**
     * Check if key was just released this frame
     */
    isJustReleased(key) {
        return !this.keys[key] && !!this.previousKeys[key];
    }

    /**
     * Get directional input as vector
     */
    getDirectionVector() {
        const x = (this.isPressed('right') ? 1 : 0) - (this.isPressed('left') ? 1 : 0);
        const y = (this.isPressed('down') ? 1 : 0) - (this.isPressed('up') ? 1 : 0);

        return { x, y };
    }

    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (!this.listeners[event]) return;

        const index = this.listeners[event].indexOf(callback);
        if (index > -1) {
            this.listeners[event].splice(index, 1);
        }
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if (!this.listeners[event]) return;

        this.listeners[event].forEach(callback => {
            callback(data);
        });
    }

    /**
     * Cleanup input manager
     */
    destroy() {
        // Remove all event listeners
        this.listeners = {};

        // Remove touch event listeners
        if (this.touchElements.dpad) {
            const dpadButtons = this.touchElements.dpad.querySelectorAll('.dpad-button');
            dpadButtons.forEach(button => {
                button.replaceWith(button.cloneNode(true));
            });
        }

        if (this.touchElements.actionButtons) {
            const actionButtons = this.touchElements.actionButtons.querySelectorAll('.action-button');
            actionButtons.forEach(button => {
                button.replaceWith(button.cloneNode(true));
            });
        }
    }
} 