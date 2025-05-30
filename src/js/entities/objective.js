/**
 * Objective Entity
 * Level objectives that trigger progression
 */

import { Entity } from './entity.js';
import { COLLISION_LAYERS, COLORS } from '../constants.js';

export class Objective extends Entity {
    constructor(x, y, width, height, label, onReached) {
        super(x, y);
        
        this.type = 'objective';
        this.label = label;
        this.width = width;
        this.height = height;
        this.onReached = onReached;
        
        // Trigger properties
        this.isTrigger = true;
        this.solid = false;
        this.collisionLayer = COLLISION_LAYERS.TRIGGER;
        this.collisionMask = COLLISION_LAYERS.PLAYER;
        
        // Visual properties
        this.glowTimer = 0;
        this.isActivated = false;
    }

    onUpdate(deltaTime) {
        this.glowTimer += deltaTime * 0.003;
    }

    onCollision(other) {
        if (other.type === 'player' && !this.isActivated) {
            this.isActivated = true;
            
            // Trigger the objective
            if (this.onReached) {
                this.onReached();
            }
            
            // Visual feedback
            if (this.game) {
                this.game.createParticleBurst(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    20,
                    COLORS.GOLD
                );
                
                this.game.audioManager.playSound('objective_reached');
            }
        }
    }

    render(ctx) {
        // Pulsing glow effect
        const glowSize = Math.sin(this.glowTimer) * 5 + 5;
        
        // Outer glow
        ctx.shadowBlur = glowSize;
        ctx.shadowColor = COLORS.GOLD;
        
        // Main body
        ctx.fillStyle = COLORS.GOLD;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Border
        ctx.strokeStyle = COLORS.RED;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.shadowBlur = 0;
        
        // Inner decoration based on label
        ctx.fillStyle = COLORS.BLACK;
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        
        switch (this.label) {
            case 'That Bridge':
                // Bridge icon
                ctx.fillRect(this.x + 10, this.y + this.height - 20, this.width - 20, 5);
                ctx.fillRect(this.x + 5, this.y + 20, 5, this.height - 40);
                ctx.fillRect(this.x + this.width - 10, this.y + 20, 5, this.height - 40);
                break;
                
            case 'Sketchy Pub':
                // Pub sign
                ctx.fillText('PUB', this.x + this.width / 2, this.y + this.height / 2);
                ctx.fillRect(this.x + 20, this.y + 10, this.width - 40, 3);
                break;
                
            case 'Altar':
                // Wedding altar
                ctx.fillRect(this.x + this.width / 2 - 2, this.y + 10, 4, this.height - 20);
                ctx.fillRect(this.x + 10, this.y + 20, this.width - 20, 4);
                ctx.fillText('♥', this.x + this.width / 2, this.y + 15);
                break;
        }
        
        // Label with arrow
        ctx.fillStyle = COLORS.GOLD;
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        
        // Bouncing arrow
        const arrowY = this.y - 20 + Math.sin(this.glowTimer * 2) * 3;
        ctx.fillText('▼', this.x + this.width / 2, arrowY);
        ctx.fillText(this.label, this.x + this.width / 2, this.y - 5);
        
        // Debug bounds
        if (window.DEBUG_ENTITIES) {
            ctx.strokeStyle = COLORS.LIGHT_GREEN;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}