/**
 * Jenny - The Hippie Photographer Companion (Simplified)
 */

import { Entity } from './entity.js';
import { COLLISION_LAYERS, COLORS } from '../constants.js';

export class Jenny extends Entity {
    constructor(x, y, mark) {
        super(x, y);
        
        this.mark = mark; // Reference to Mark for following
        
        // Character properties
        this.type = 'companion';
        this.name = 'Jenny';
        this.width = 32;
        this.height = 48;
        this.speed = 2.5;
        
        // Collision
        this.solid = true;
        this.collisionLayer = COLLISION_LAYERS.PLAYER;
        this.collisionMask = COLLISION_LAYERS.WALL | COLLISION_LAYERS.ENEMY;
        
        // AI behavior
        this.followDistance = 50;
        this.minDistance = 40;
        this.facing = 'right';
        
        // Special items
        this.hasCamera = true;
        this.flashCooldown = 0;
        
        // Animation
        this.animationTimer = 0;
        this.currentFrame = 0;
    }

    onUpdate(deltaTime) {
        this.followMark();
        this.updateCooldowns(deltaTime);
        this.updateAnimation(deltaTime);
        
        // Occasionally take photos
        if (this.flashCooldown <= 0 && Math.random() < 0.005) {
            this.takePhoto();
        }
    }

    followMark() {
        if (!this.mark) return;
        
        const dx = this.mark.x - this.x;
        const dy = this.mark.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only move if too far from Mark
        if (distance > this.followDistance) {
            // Calculate movement direction
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;
            
            // Apply movement with some lag for natural following
            this.vx += (moveX - this.vx) * 0.1;
            this.vy += (moveY - this.vy) * 0.1;
            
            // Update facing direction
            if (Math.abs(dx) > Math.abs(dy)) {
                this.facing = dx > 0 ? 'right' : 'left';
            }
        } else if (distance < this.minDistance) {
            // Too close, move away slightly
            this.vx *= 0.5;
            this.vy *= 0.5;
        } else {
            // Close enough, stop moving
            this.vx *= 0.8;
            this.vy *= 0.8;
        }
        
        // Keep Jenny in bounds
        if (this.x < 0) this.x = 0;
        if (this.x > 256 - this.width) this.x = 256 - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > 224 - this.height) this.y = 224 - this.height;
    }

    takePhoto() {
        this.flashCooldown = 120;
        
        // Create camera flash effect will be visible in render
        if (this.mark && this.mark.game && this.mark.game.audioManager) {
            this.mark.game.audioManager.playSound('camera_flash');
        }
    }

    updateCooldowns(deltaTime) {
        if (this.flashCooldown > 0) {
            this.flashCooldown -= deltaTime / 16.67;
        }
    }

    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        
        if (this.animationTimer > 200) {
            this.animationTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % 4;
        }
    }

    render(ctx, interpolation) {
        const renderX = this.prevX + (this.x - this.prevX) * interpolation;
        const renderY = this.prevY + (this.y - this.prevY) * interpolation;
        
        ctx.save();
        
        // Body (green hippie dress)
        ctx.fillStyle = '#228b22';
        ctx.fillRect(renderX + 8, renderY + 20, 16, 20);
        
        // Head
        ctx.fillStyle = '#fdbcb4';
        ctx.fillRect(renderX + 10, renderY + 5, 12, 12);
        
        // Long hippie hair
        ctx.fillStyle = '#654321';
        ctx.fillRect(renderX + 6, renderY + 3, 20, 15);
        
        // Flower in hair
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(renderX + 20, renderY + 5, 4, 4);
        
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(renderX + 12, renderY + 8, 3, 2);
        ctx.fillRect(renderX + 17, renderY + 8, 3, 2);
        ctx.fillStyle = '#654321';
        ctx.fillRect(renderX + 13, renderY + 8, 1, 1);
        ctx.fillRect(renderX + 18, renderY + 8, 1, 1);
        
        // Legs
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(renderX + 10, renderY + 40, 5, 8);
        ctx.fillRect(renderX + 17, renderY + 40, 5, 8);
        
        // Camera
        if (this.hasCamera) {
            ctx.fillStyle = '#333333';
            if (this.facing === 'right') {
                ctx.fillRect(renderX + 20, renderY + 18, 8, 6);
                // Lens
                ctx.fillStyle = '#87ceeb';
                ctx.fillRect(renderX + 26, renderY + 20, 2, 2);
            } else {
                ctx.fillRect(renderX + 4, renderY + 18, 8, 6);
                // Lens
                ctx.fillStyle = '#87ceeb';
                ctx.fillRect(renderX + 4, renderY + 20, 2, 2);
            }
        }
        
        // Camera flash effect
        if (this.flashCooldown > 100) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(renderX - 10, renderY - 10, this.width + 20, this.height + 20);
        }
        
        ctx.restore();
        
        // Debug bounds
        if (window.DEBUG_ENTITIES) {
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(renderX, renderY, this.width, this.height);
        }
    }
}