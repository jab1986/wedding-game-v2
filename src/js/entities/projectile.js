/**
 * Projectile Entity
 * Boss projectiles and attacks
 */

import { Entity } from './entity.js';
import { COLLISION_LAYERS, COLORS } from '../constants.js';

export class Projectile extends Entity {
    constructor(x, y, vx, vy, projectileType = 'spite', damage = 10) {
        super(x, y);
        
        this.type = 'projectile';
        this.projectileType = projectileType;
        this.damage = damage;
        
        // Movement
        this.vx = vx;
        this.vy = vy;
        
        // Size based on type
        switch (projectileType) {
            case 'spite':
                this.width = 20;
                this.height = 10;
                this.color = COLORS.LIGHT_GREEN;
                break;
            case 'chaos':
                this.width = 15;
                this.height = 15;
                this.color = COLORS.RED;
                break;
            default:
                this.width = 10;
                this.height = 10;
                this.color = COLORS.GOLD;
        }
        
        // Collision
        this.solid = false;
        this.isTrigger = true;
        this.collisionLayer = COLLISION_LAYERS.ENEMY;
        this.collisionMask = COLLISION_LAYERS.PLAYER;
        
        // Lifetime
        this.lifetime = 5000; // 5 seconds
        this.trail = [];
        this.trailLength = 5;
    }

    onUpdate(deltaTime) {
        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // Update lifetime
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.destroy();
        }

        // Check if out of bounds
        if (this.x < -50 || this.x > 850 || this.y < -50 || this.y > 650) {
            this.destroy();
        }
    }

    onCollision(other) {
        if (other.type === 'player') {
            // Damage player
            if (other.takeDamage) {
                other.takeDamage(this.damage);
            }
            
            // Create hit effect
            if (this.game) {
                this.game.createParticleBurst(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    8,
                    this.color
                );
            }
            
            // Destroy projectile
            this.destroy();
        }
    }

    render(ctx) {
        // Draw trail
        this.trail.forEach((pos, i) => {
            const alpha = (i / this.trail.length) * 0.5;
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            const size = (i / this.trail.length) * this.width;
            ctx.fillRect(pos.x, pos.y, size, size);
        });

        // Main projectile
        if (this.projectileType === 'chaos') {
            // Chaotic appearance
            const time = Date.now() / 100;
            ctx.fillStyle = `hsl(${(time * 50) % 360}, 100%, 50%)`;
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Special effects based on type
        switch (this.projectileType) {
            case 'spite':
                // Crying face
                ctx.fillStyle = COLORS.BLACK;
                ctx.fillRect(this.x + 4, this.y + 2, 2, 2);
                ctx.fillRect(this.x + 8, this.y + 2, 2, 2);
                ctx.fillRect(this.x + 6, this.y + 6, 4, 2);
                break;
                
            case 'chaos':
                // Spinning effect
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.rotate(Date.now() / 100);
                ctx.fillStyle = COLORS.WHITE;
                ctx.fillRect(-2, -6, 4, 12);
                ctx.fillRect(-6, -2, 12, 4);
                ctx.restore();
                break;
        }
        
        // Debug bounds
        if (window.DEBUG_ENTITIES) {
            ctx.strokeStyle = COLORS.RED;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}