/**
 * Base Entity Class - SNES Style
 * All game objects inherit from this base class
 */

import { COLLISION_LAYERS, COLORS } from '../constants.js';

export class Entity {
    constructor(x = 0, y = 0) {
        // Position
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;

        // Dimensions
        this.width = 16;
        this.height = 16;

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;

        // State
        this.isDead = false;
        this.isVisible = true;
        this.isActive = true;

        // Rendering
        this.sprite = null;
        this.depth = 0; // Z-order for rendering
        this.scale = 1;
        this.rotation = 0;
        this.alpha = 1;

        // Animation
        this.currentFrame = 0;
        this.frameTime = 0;
        this.animationSpeed = 100; // ms per frame

        // Type identifier
        this.type = 'entity';

        // Collision
        this.solid = false;
        this.collisionMask = COLLISION_LAYERS.ALL;
        this.collisionLayer = COLLISION_LAYERS.NONE;
        this.isTrigger = false;
        this.isStatic = false;
        this.mass = 1;
        this.bounciness = 0;
    }

    /**
     * Update entity logic (called every frame)
     */
    update(deltaTime) {
        if (!this.isActive) return;

        // Store previous position for interpolation
        this.prevX = this.x;
        this.prevY = this.y;

        // Apply acceleration to velocity
        this.vx += this.ax * deltaTime / 1000;
        this.vy += this.ay * deltaTime / 1000;

        // Apply velocity to position
        this.x += this.vx * deltaTime / 1000;
        this.y += this.vy * deltaTime / 1000;

        // Update animation
        this.updateAnimation(deltaTime);

        // Custom update logic (override in subclasses)
        this.onUpdate(deltaTime);
    }

    /**
     * Custom update logic (override in subclasses)
     */
    onUpdate(deltaTime) {
        // Override in subclasses
    }

    /**
     * Update animation frames
     */
    updateAnimation(deltaTime) {
        if (!this.sprite || !this.sprite.frames) return;

        this.frameTime += deltaTime;
        if (this.frameTime >= this.animationSpeed) {
            this.currentFrame = (this.currentFrame + 1) % this.sprite.frames.length;
            this.frameTime = 0;
        }
    }

    /**
     * Render entity with interpolation
     */
    render(ctx, interpolation = 0) {
        if (!this.isVisible) return;

        // Interpolate position for smooth movement
        const renderX = this.prevX + (this.x - this.prevX) * interpolation;
        const renderY = this.prevY + (this.y - this.prevY) * interpolation;

        // Save context
        ctx.save();

        // Apply transformations
        ctx.translate(renderX + this.width / 2, renderY + this.height / 2);
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;

        // Render sprite or placeholder
        if (this.sprite) {
            this.renderSprite(ctx);
        } else {
            this.renderPlaceholder(ctx);
        }

        // Restore context
        ctx.restore();

        // Debug rendering
        if (window.DEBUG_ENTITIES) {
            this.renderDebug(ctx, renderX, renderY);
        }
    }

    /**
     * Render sprite
     */
    renderSprite(ctx) {
        if (this.sprite.frames && this.sprite.frames.length > 0) {
            // Animated sprite
            const frame = this.sprite.frames[this.currentFrame];
            ctx.drawImage(
                this.sprite.image,
                frame.x, frame.y, frame.width, frame.height,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
        } else {
            // Static sprite
            ctx.drawImage(
                this.sprite.image,
                this.sprite.x || 0, this.sprite.y || 0,
                this.sprite.width || this.width, this.sprite.height || this.height,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
        }
    }

    /**
     * Render placeholder (when no sprite)
     */
    renderPlaceholder(ctx) {
        ctx.fillStyle = COLORS.MAGENTA; // Debug placeholder
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }

    /**
     * Render debug information
     */
    renderDebug(ctx, x, y) {
        // Bounding box
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.width, this.height);

        // Center point
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + this.width / 2 - 1, y + this.height / 2 - 1, 2, 2);

        // Velocity vector
        if (this.vx !== 0 || this.vy !== 0) {
            ctx.strokeStyle = '#FFFF00';
            ctx.beginPath();
            ctx.moveTo(x + this.width / 2, y + this.height / 2);
            ctx.lineTo(
                x + this.width / 2 + this.vx * 10,
                y + this.height / 2 + this.vy * 10
            );
            ctx.stroke();
        }
    }

    /**
     * Get bounding box
     */
    getBounds() {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.width,
            bottom: this.y + this.height,
            centerX: this.x + this.width / 2,
            centerY: this.y + this.height / 2
        };
    }

    /**
     * Check collision with another entity
     */
    collidesWith(other) {
        if (!this.solid || !other.solid) return false;
        if ((this.collisionMask & other.collisionLayer) === 0) return false;

        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();

        return bounds1.left < bounds2.right &&
            bounds1.right > bounds2.left &&
            bounds1.top < bounds2.bottom &&
            bounds1.bottom > bounds2.top;
    }

    /**
     * Handle collision with another entity
     */
    onCollision(other) {
        // Override in subclasses
    }

    /**
     * Set sprite
     */
    setSprite(sprite) {
        this.sprite = sprite;
        if (sprite) {
            this.width = sprite.width || this.width;
            this.height = sprite.height || this.height;
        }
    }

    /**
     * Set animation frames
     */
    setAnimation(frames, speed = 100) {
        if (this.sprite) {
            this.sprite.frames = frames;
            this.animationSpeed = speed;
            this.currentFrame = 0;
            this.frameTime = 0;
        }
    }

    /**
     * Destroy entity
     */
    destroy() {
        this.isDead = true;
        this.onDestroy();
    }

    /**
     * Called when entity is destroyed
     */
    onDestroy() {
        // Override in subclasses
    }

    /**
     * Distance to another entity
     */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Angle to another entity (in radians)
     */
    angleTo(other) {
        return Math.atan2(other.y - this.y, other.x - this.x);
    }
} 