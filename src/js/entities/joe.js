/**
 * Joe - The Bitter Rejected Boss
 */

import { Entity } from './entity.js';
import { COLLISION_LAYERS, COLORS } from '../constants.js';

export class Joe extends Entity {
    constructor(x, y, game) {
        super(x, y);
        
        this.game = game;
        
        // Boss properties
        this.type = 'boss';
        this.name = 'Joe';
        this.width = 64;
        this.height = 96;
        this.health = 100;
        this.maxHealth = 100;
        
        // Collision
        this.solid = true;
        this.collisionLayer = COLLISION_LAYERS.ENEMY;
        this.collisionMask = COLLISION_LAYERS.PLAYER;
        
        // Boss phases
        this.phase = 1;
        this.transformed = false;
        
        // Attack patterns
        this.attackTimer = 0;
        this.attackCooldown = 60;
        this.currentPattern = 0;
        
        // Movement
        this.baseY = y;
        this.floatTimer = 0;
        
        // Animation
        this.animationTimer = 0;
        this.tearTimer = 0;
        
        // Projectiles array
        this.projectiles = [];
        
        // Combat state
        this.isFighting = false;
        this.damageFlash = 0;
    }

    startFighting() {
        this.isFighting = true;
    }

    onUpdate(deltaTime) {
        if (!this.isFighting) return;
        
        this.updateMovement(deltaTime);
        this.updateAttacks(deltaTime);
        this.updateAnimation(deltaTime);
        
        // Phase change at 50% health
        if (this.health <= 50 && !this.transformed) {
            this.transform();
        }
    }

    updateMovement(deltaTime) {
        // Floating movement
        this.floatTimer += deltaTime * 0.001;
        
        if (this.transformed) {
            // Chaotic movement in phase 2
            this.y = this.baseY + Math.sin(this.floatTimer * 2) * 30;
            this.x += Math.sin(this.floatTimer * 3) * 2;
            
            // Keep in bounds
            if (this.x < 150) this.x = 150;
            if (this.x > 200) this.x = 200;
        } else {
            // Gentle floating in phase 1
            this.y = this.baseY + Math.sin(this.floatTimer) * 10;
        }
    }

    updateAttacks(deltaTime) {
        this.attackTimer += deltaTime / 16.67;
        
        if (this.attackTimer >= this.attackCooldown) {
            this.attackTimer = 0;
            
            if (this.transformed) {
                this.phase2Attack();
            } else {
                this.phase1Attack();
            }
        }
    }

    phase1Attack() {
        // Spite projectiles
        this.projectiles.push({
            x: this.x,
            y: this.y + this.height / 2,
            vx: -2, // velocity x
            vy: (Math.random() - 0.5) * 2, // velocity y
            width: 8,
            height: 8,
            damage: 10,
            color: '#00ff00'
        });
        
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('boss_attack');
        }
    }

    phase2Attack() {
        // Chaos barrage - multiple projectiles
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI / 4) * (i - 1);
            const speed = 3;
            
            this.projectiles.push({
                x: this.x,
                y: this.y + this.height / 2,
                vx: -Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                width: 10,
                height: 10,
                damage: 15,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`
            });
        }
        
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('boss_attack_heavy');
        }
    }

    transform() {
        this.transformed = true;
        this.phase = 2;
        this.attackCooldown = 40; // Faster attacks
        
        // Create transformation effect
        if (this.game) {
            this.game.createParticleBurst(
                this.x + this.width / 2,
                this.y + this.height / 2,
                30,
                COLORS.RED
            );
            
            this.game.audioManager.playSound('boss_transform');
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Flash effect
        this.damageFlash = 10;
        
        // Create damage particles
        if (this.game) {
            this.game.createParticleBurst(
                this.x + this.width / 2,
                this.y + this.height / 2,
                5,
                COLORS.RED
            );
            
            this.game.audioManager.playSound('boss_hurt');
        }
        
        if (this.health <= 0) {
            this.health = 0;
            this.onDefeat();
        }
    }

    onDefeat() {
        this.isFighting = false;
        this.isDead = true;
        
        // Clear all projectiles
        this.projectiles = [];
        
        // Victory effect
        if (this.game) {
            this.game.createParticleBurst(
                this.x + this.width / 2,
                this.y + this.height / 2,
                50,
                COLORS.GOLD
            );
            
            this.game.audioManager.playSound('boss_defeat');
        }
    }

    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        this.tearTimer += deltaTime;
        
        if (this.damageFlash > 0) {
            this.damageFlash--;
        }
        
        // Update projectiles
        this.projectiles = this.projectiles.filter(proj => {
            proj.x += proj.vx;
            proj.y += proj.vy;
            
            // Remove projectiles that go off screen
            return proj.x > -50 && proj.x < 300 && proj.y > -50 && proj.y < 300;
        });
    }

    render(ctx, interpolation) {
        const renderX = this.prevX + (this.x - this.prevX) * interpolation;
        const renderY = this.prevY + (this.y - this.prevY) * interpolation;
        
        ctx.save();
        
        // Damage flash
        if (this.damageFlash > 0) {
            ctx.filter = 'brightness(2)';
        }
        
        if (!this.transformed) {
            // Phase 1 - Sad musician Joe
            
            // Body (blue shirt)
            ctx.fillStyle = '#4169e1';
            ctx.fillRect(renderX + 16, renderY + 30, 32, 40);
            
            // Head
            ctx.fillStyle = '#fdbcb4';
            ctx.fillRect(renderX + 20, renderY + 10, 24, 24);
            
            // Sad face
            ctx.fillStyle = '#000000';
            // Eyes
            ctx.fillRect(renderX + 26, renderY + 18, 3, 2);
            ctx.fillRect(renderX + 36, renderY + 18, 3, 2);
            // Frown
            ctx.beginPath();
            ctx.arc(renderX + 32, renderY + 30, 8, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.stroke();
            
            // Tears
            if (Math.sin(this.tearTimer * 0.005) > 0) {
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(renderX + 28, renderY + 22, 2, 8);
                ctx.fillRect(renderX + 38, renderY + 22, 2, 8);
            }
            
            // "REJECTED" band shirt text
            ctx.fillStyle = '#ffffff';
            ctx.font = '6px monospace';
            ctx.fillText('REJECTED', renderX + 18, renderY + 50);
            
            // Legs
            ctx.fillStyle = '#333333';
            ctx.fillRect(renderX + 22, renderY + 70, 8, 26);
            ctx.fillRect(renderX + 34, renderY + 70, 8, 26);
            
        } else {
            // Phase 2 - CHAOS FORM
            const time = Date.now() / 100;
            
            // Chaotic body
            ctx.fillStyle = `hsl(${time % 360}, 100%, 50%)`;
            ctx.fillRect(renderX + 8, renderY + 20, 48, 60);
            
            // Evil head
            ctx.fillStyle = '#000000';
            ctx.fillRect(renderX + 16, renderY, 32, 30);
            
            // Glowing eyes
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff0000';
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(renderX + 24, renderY + 12, 6, 4);
            ctx.fillRect(renderX + 36, renderY + 12, 6, 4);
            ctx.shadowBlur = 0;
            
            // Chaos crown
            ctx.fillStyle = '#ffd700';
            for (let i = 0; i < 3; i++) {
                const spikeX = renderX + 20 + i * 12;
                const spikeY = renderY - 10 + Math.sin(time + i) * 3;
                ctx.fillRect(spikeX, spikeY, 8, 8);
            }
            
            // Evil grin
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(renderX + 32, renderY + 20, 10, 0, Math.PI);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Debug bounds
        if (window.DEBUG_ENTITIES) {
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(renderX, renderY, this.width, this.height);
        }
    }
}