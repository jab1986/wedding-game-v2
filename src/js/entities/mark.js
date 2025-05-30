/**
 * Mark - The Goth Drummer Protagonist (Simplified)
 */

import { Entity } from './entity.js';
import { COLLISION_LAYERS, COLORS, PLAYER } from '../constants.js';

export class Mark extends Entity {
    constructor(x, y, inputManager, game) {
        super(x, y);
        
        this.inputManager = inputManager;
        this.game = game;
        
        // Character properties
        this.type = 'player';
        this.name = 'Mark';
        this.width = 32;
        this.height = 48;
        this.speed = 3;
        this.health = 100;
        this.maxHealth = 100;
        
        // Collision
        this.solid = true;
        this.collisionLayer = COLLISION_LAYERS.PLAYER;
        this.collisionMask = COLLISION_LAYERS.WALL | COLLISION_LAYERS.ENEMY;
        
        // Combat
        this.attacking = false;
        this.attackCooldown = 0;
        this.attackRange = 60;
        this.attackDamage = 20;
        
        // Animation
        this.facing = 'right';
        this.animationTimer = 0;
        this.currentFrame = 0;
        
        // Special items
        this.hasDrumsticks = true;
        this.hasJoint = false;
        this.damageFlash = 0;
    }

    onUpdate(deltaTime) {
        this.handleInput();
        this.updateCooldowns(deltaTime);
        this.updateAnimation(deltaTime);
    }

    handleInput() {
        if (!this.inputManager) return;
        
        const input = this.inputManager.getDirectionVector();
        
        // Movement
        if (input.x !== 0 || input.y !== 0) {
            this.vx = input.x * this.speed;
            this.vy = input.y * this.speed;
            
            // Update facing direction
            if (input.x > 0) this.facing = 'right';
            else if (input.x < 0) this.facing = 'left';
        } else {
            this.vx *= 0.8; // Friction
            this.vy *= 0.8;
        }
        
        // Keep player in bounds
        if (this.x < 0) this.x = 0;
        if (this.x > 256 - this.width) this.x = 256 - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > 224 - this.height) this.y = 224 - this.height;
        
        // Attack
        if (this.inputManager.isJustPressed('a') && this.attackCooldown <= 0) {
            this.attack();
        }
    }

    attack() {
        this.attacking = true;
        this.attackCooldown = 30;
        
        // Play attack sound
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('drumstick_hit');
        }
        
        setTimeout(() => {
            this.attacking = false;
        }, 200);
    }

    updateCooldowns(deltaTime) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime / 16.67;
        }
    }

    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        
        if (this.animationTimer > 150) {
            this.animationTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % 4;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Flash red
        this.damageFlash = 10;
                
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('player_hurt');
        }
        
        if (this.health <= 0) {
            this.health = 0;
            this.onDeath();
        }
    }

    onDeath() {
        if (this.game) {
            this.game.gameOver();
        }
    }

    render(ctx, interpolation) {
        const renderX = this.prevX + (this.x - this.prevX) * interpolation;
        const renderY = this.prevY + (this.y - this.prevY) * interpolation;
        
        ctx.save();
        
        // Damage flash
        if (this.damageFlash > 0) {
            this.damageFlash--;
            ctx.filter = 'hue-rotate(180deg)';
        }
        
        // Attack animation
        if (this.attacking) {
            ctx.translate(renderX + this.width / 2, renderY + this.height / 2);
            ctx.rotate(Math.sin(Date.now() / 50) * 0.2);
            ctx.translate(-renderX - this.width / 2, -renderY - this.height / 2);
        }
        
        // Body (black clothing)
        ctx.fillStyle = '#000000';
        ctx.fillRect(renderX + 8, renderY + 20, 16, 20);
        
        // Head
        ctx.fillStyle = '#fdbcb4';
        ctx.fillRect(renderX + 10, renderY + 5, 12, 12);
        
        // Mohawk
        ctx.fillStyle = '#000000';
        ctx.fillRect(renderX + 14, renderY, 4, 8);
        
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(renderX + 12, renderY + 8, 3, 2);
        ctx.fillRect(renderX + 17, renderY + 8, 3, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(renderX + 13, renderY + 8, 1, 1);
        ctx.fillRect(renderX + 18, renderY + 8, 1, 1);
        
        // Legs
        ctx.fillStyle = '#000000';
        ctx.fillRect(renderX + 10, renderY + 40, 5, 8);
        ctx.fillRect(renderX + 17, renderY + 40, 5, 8);
        
        // Drumsticks
        if (this.hasDrumsticks) {
            ctx.fillStyle = '#8b4513';
            if (this.facing === 'right') {
                ctx.fillRect(renderX + 24, renderY + 25, 12, 2);
                ctx.fillRect(renderX + 24, renderY + 28, 12, 2);
            } else {
                ctx.fillRect(renderX - 4, renderY + 25, 12, 2);
                ctx.fillRect(renderX - 4, renderY + 28, 12, 2);
            }
        }
        
        ctx.restore();
        
        // Debug bounds
        if (window.DEBUG_ENTITIES) {
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(renderX, renderY, this.width, this.height);
        }
    }
}