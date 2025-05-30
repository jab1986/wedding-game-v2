/**
 * Obstacle Entity
 * Static obstacles in levels
 */

import { Entity } from './entity.js';
import { COLLISION_LAYERS, COLORS } from '../constants.js';

export class Obstacle extends Entity {
    constructor(x, y, width, height, obstacleType, label) {
        super(x, y);
        
        this.type = 'obstacle';
        this.obstacleType = obstacleType;
        this.label = label;
        this.width = width;
        this.height = height;
        
        // Make it solid and static
        this.solid = true;
        this.isStatic = true;
        this.collisionLayer = COLLISION_LAYERS.WALL;
        
        // Visual properties based on type
        this.setupVisuals();
    }

    setupVisuals() {
        switch (this.obstacleType) {
            case 'plant':
                this.color = COLORS.GRASS_GREEN;
                this.accent = COLORS.LIGHT_GREEN;
                break;
            case 'sign':
                this.color = COLORS.RED;
                this.accent = COLORS.WHITE;
                break;
            case 'shop':
                this.color = COLORS.PINK;
                this.accent = COLORS.RED;
                break;
            case 'crime':
                this.color = COLORS.GOLD;
                this.accent = COLORS.BLACK;
                break;
            case 'chairs':
                this.color = '#8b4513';
                this.accent = COLORS.DARK_GRAY;
                break;
            case 'wine':
                this.color = '#4b0082';
                this.accent = COLORS.RED;
                break;
            default:
                this.color = COLORS.DARK_GRAY;
                this.accent = COLORS.GRAY;
        }
    }

    render(ctx) {
        // Main body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Type-specific decorations
        switch (this.obstacleType) {
            case 'plant':
                // Leaves
                ctx.fillStyle = this.accent;
                for (let i = 0; i < 5; i++) {
                    const leafX = this.x + Math.random() * this.width;
                    const leafY = this.y + Math.random() * this.height * 0.5;
                    ctx.fillRect(leafX, leafY, 8, 4);
                }
                break;
                
            case 'sign':
                // Sign text
                ctx.fillStyle = this.accent;
                ctx.font = '6px monospace';
                ctx.fillText('XXX', this.x + 10, this.y + this.height / 2);
                break;
                
            case 'shop':
                // Window
                ctx.fillStyle = COLORS.BLACK;
                ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 40);
                // Neon effect
                ctx.strokeStyle = this.accent;
                ctx.strokeRect(this.x + 10, this.y + 10, this.width - 20, this.height - 40);
                break;
                
            case 'crime':
                // Police tape
                ctx.strokeStyle = this.accent;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.moveTo(this.x + this.width, this.y);
                ctx.lineTo(this.x, this.y + this.height);
                ctx.stroke();
                break;
                
            case 'chairs':
                // Multiple chair shapes
                for (let i = 0; i < 3; i++) {
                    const chairX = this.x + i * 20;
                    const chairY = this.y + i * 10;
                    ctx.fillStyle = this.color;
                    ctx.fillRect(chairX, chairY, 15, 20);
                }
                break;
                
            case 'wine':
                // Spill effect
                ctx.fillStyle = this.accent;
                ctx.beginPath();
                ctx.ellipse(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.width / 2,
                    this.height / 2,
                    0, 0, Math.PI * 2
                );
                ctx.fill();
                break;
        }
        
        // Label
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '6px monospace';
        ctx.fillText(this.label, this.x, this.y - 5);
        
        // Debug bounds
        if (window.DEBUG_ENTITIES) {
            ctx.strokeStyle = COLORS.RED;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}