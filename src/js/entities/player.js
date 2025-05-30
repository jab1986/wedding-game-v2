/**
 * Player Entity - Wedding Game Character
 * SNES-style player with 8-directional movement and animation
 */

import { Entity } from './entity.js';
import { PLAYER, COLLISION_LAYERS, ANIMATION_SPEEDS, COLORS } from '../constants.js';

export class Player extends Entity {
    constructor(x, y, inputManager, game = null) {
        super(x, y);

        this.inputManager = inputManager;
        this.game = game;

        // Player properties
        this.type = 'player';
        this.width = PLAYER.WIDTH;
        this.height = PLAYER.HEIGHT;
        this.solid = true;
        this.collisionLayer = COLLISION_LAYERS.PLAYER;
        this.collisionMask = COLLISION_LAYERS.WALL | COLLISION_LAYERS.ENEMY | COLLISION_LAYERS.ITEM | COLLISION_LAYERS.TRIGGER;

        // Movement
        this.speed = PLAYER.SPEED;
        this.maxSpeed = PLAYER.MAX_SPEED;
        this.acceleration = PLAYER.ACCELERATION;
        this.friction = 0.8;

        // Animation states
        this.state = 'idle'; // idle, walking, running, dancing
        this.direction = 'down'; // up, down, left, right
        this.lastDirection = 'down';

        // Wedding game specific
        this.hasRing = false;
        this.isMarried = false;
        this.happiness = PLAYER.INITIAL_HAPPINESS;
        this.energy = PLAYER.INITIAL_ENERGY;

        // Animation frames (will be set when sprite is loaded)
        this.animations = {
            idle: {
                down: [],
                up: [],
                left: [],
                right: []
            },
            walk: {
                down: [],
                up: [],
                left: [],
                right: []
            },
            dance: {
                down: [],
                up: [],
                left: [],
                right: []
            }
        };

        // Set initial animation
        this.animationSpeed = ANIMATION_SPEEDS.WALK;
    }

    /**
     * Update player logic
     */
    onUpdate(deltaTime) {
        this.handleInput();
        this.updateMovement(deltaTime);
        this.updateAnimation();
        this.updateStats(deltaTime);
    }

    /**
     * Handle player input
     */
    handleInput() {
        if (!this.inputManager) return;

        // Get input direction
        const input = this.inputManager.getDirectionVector();
        let targetVx = 0;
        let targetVy = 0;

        // Calculate target velocity
        if (input.x !== 0 || input.y !== 0) {
            // Normalize diagonal movement
            const magnitude = Math.sqrt(input.x * input.x + input.y * input.y);
            const normalizedX = input.x / magnitude;
            const normalizedY = input.y / magnitude;

            targetVx = normalizedX * this.speed;
            targetVy = normalizedY * this.speed;

            // Update direction for animation
            this.updateDirection(input.x, input.y);
            this.setState('walk');
        } else {
            this.setState('idle');
        }

        // Apply acceleration towards target velocity
        const accel = this.acceleration / 1000; // per ms
        this.vx += (targetVx - this.vx) * accel * 16.67; // 60fps timestep
        this.vy += (targetVy - this.vy) * accel * 16.67;

        // Handle action buttons
        if (this.inputManager.isJustPressed('a')) {
            this.performAction();
        }

        if (this.inputManager.isJustPressed('b')) {
            this.dance();
        }
    }

    /**
     * Update movement physics
     */
    updateMovement(deltaTime) {
        // Apply friction when not moving
        if (Math.abs(this.vx) < 1 && Math.abs(this.vy) < 1) {
            this.vx *= this.friction;
            this.vy *= this.friction;
        }

        // Clamp velocity to max speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        // Keep player on screen (basic bounds checking)
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
        if (this.x + this.width > 256) {
            this.x = 256 - this.width;
            this.vx = 0;
        }
        if (this.y < 0) {
            this.y = 0;
            this.vy = 0;
        }
        if (this.y + this.height > 224) {
            this.y = 224 - this.height;
            this.vy = 0;
        }
    }

    /**
     * Update direction based on input
     */
    updateDirection(inputX, inputY) {
        // Prioritize horizontal movement for 4-directional sprites
        if (Math.abs(inputX) > Math.abs(inputY)) {
            this.direction = inputX > 0 ? 'right' : 'left';
        } else if (inputY !== 0) {
            this.direction = inputY > 0 ? 'down' : 'up';
        }

        // Store last direction for idle animation
        if (this.direction !== this.lastDirection) {
            this.lastDirection = this.direction;
        }
    }

    /**
     * Set animation state
     */
    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.currentFrame = 0;
            this.frameTime = 0;
        }
    }

    /**
     * Update animation based on state and direction
     */
    updateAnimation() {
        if (!this.animations[this.state] || !this.animations[this.state][this.direction]) {
            return;
        }

        const frames = this.animations[this.state][this.direction];
        if (frames.length > 0 && this.sprite) {
            this.sprite.frames = frames;
        }
    }

    /**
     * Update player stats
     */
    updateStats(deltaTime) {
        // Decrease energy when moving
        if (this.state === 'walk') {
            this.energy = Math.max(0, this.energy - deltaTime * PLAYER.ENERGY_DECAY_RATE);
        }

        // Regenerate energy when idle
        if (this.state === 'idle') {
            this.energy = Math.min(100, this.energy + deltaTime * PLAYER.ENERGY_REGEN_RATE);
        }

        // Happiness decreases over time
        this.happiness = Math.max(0, this.happiness - deltaTime * PLAYER.HAPPINESS_DECAY_RATE);
    }

    /**
     * Perform action (interact with objects)
     */
    performAction() {
        console.log('Player action!');
        // TODO: Implement interaction system
    }

    /**
     * Start dancing
     */
    dance() {
        if (this.state !== 'dance') {
            this.setState('dance');
            this.happiness = Math.min(100, this.happiness + 10);
            console.log('Player is dancing! 💃');
            
            // Create particle effect
            if (this.game) {
                this.game.createParticleBurst(
                    this.x + this.width / 2,
                    this.y + this.height,
                    8,
                    COLORS.PINK
                );
            }
        }
    }

    /**
     * Pick up ring
     */
    pickupRing() {
        this.hasRing = true;
        this.happiness = Math.min(100, this.happiness + 20);
        console.log('Player picked up the ring! 💍');
        
        // Create particle effect
        if (this.game) {
            this.game.createParticleBurst(
                this.x + this.width / 2,
                this.y + this.height / 2,
                12,
                COLORS.GOLD
            );
        }
    }

    /**
     * Get married
     */
    marry() {
        if (this.hasRing) {
            this.isMarried = true;
            this.happiness = 100;
            console.log('Player got married! 💒');
            return true;
        }
        return false;
    }

    /**
     * Set player animations
     */
    setAnimations(animations) {
        this.animations = { ...this.animations, ...animations };
    }

    /**
     * Get player status
     */
    getStatus() {
        return {
            hasRing: this.hasRing,
            isMarried: this.isMarried,
            happiness: Math.round(this.happiness),
            energy: Math.round(this.energy),
            state: this.state,
            direction: this.direction
        };
    }

    /**
     * Render player with additional effects
     */
    render(ctx, interpolation = 0) {
        // Call parent render
        super.render(ctx, interpolation);

        // Render status effects
        if (this.hasRing && !this.isMarried) {
            this.renderRingEffect(ctx, interpolation);
        }

        if (this.isMarried) {
            this.renderMarriedEffect(ctx, interpolation);
        }
    }

    /**
     * Render ring effect
     */
    renderRingEffect(ctx, interpolation) {
        const renderX = this.prevX + (this.x - this.prevX) * interpolation;
        const renderY = this.prevY + (this.y - this.prevY) * interpolation;

        ctx.save();
        ctx.fillStyle = COLORS.GOLD;
        ctx.beginPath();
        ctx.arc(
            renderX + this.width / 2,
            renderY - 5,
            3 + Math.sin(Date.now() * 0.01) * 1,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
    }

    /**
     * Render married effect
     */
    renderMarriedEffect(ctx, interpolation) {
        const renderX = this.prevX + (this.x - this.prevX) * interpolation;
        const renderY = this.prevY + (this.y - this.prevY) * interpolation;

        ctx.save();
        ctx.fillStyle = COLORS.PINK;

        // Floating hearts
        for (let i = 0; i < 3; i++) {
            const offset = Date.now() * 0.005 + i * 2;
            const heartX = renderX + this.width / 2 + Math.sin(offset) * 10;
            const heartY = renderY - 10 - i * 8 + Math.sin(offset * 2) * 3;

            ctx.fillText('♥', heartX, heartY);
        }

        ctx.restore();
    }
} 