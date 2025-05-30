/**
 * Joe - The Bitter Rejected Boss
 */

import { Entity } from './entity.js';
import { COLLISION_LAYERS, COLORS } from '../constants.js';
import { Projectile } from './projectile.js';

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
            if (this.x < 400) this.x = 400;
            if (this.x > 700) this.x = 700;
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
        const projectile = new Projectile(
            this.x,
            this.y + this.height / 2,
            -150, // velocity x
            (Math.random() - 0.5) * 100, // velocity y
            'spite',
            10 // damage
        );
        
        this.game.entityManager.addEntity(projectile);
        this.game.audioManager.playSound('boss_attack');
    }

    phase2Attack() {
        // Chaos barrage - multiple projectiles
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI / 4) * (i - 1);
            const speed = 200;
            
            const projectile = new Projectile(
                this.x,
                this.y + this.height / 2,
                -Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                'chaos',
                15
            );
            
            projectile.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            this.game.entityManager.addEntity(projectile);
        }
        
        this.game.audioManager.playSound('boss_attack_heavy');
        this.game.getState('boss').triggerScreenShake(0.3);
    }

    transform() {
        this.transformed = true;
        this.phase = 2;
        this.attackCooldown = 40; // Faster attacks
        
        // Transformation effect
        this.game.getState('boss').triggerFlash();
        this.game.audioManager.playSound('boss_transform');
        
        // Particles
        this.game.createParticleBurst(
            this.x + this.width / 2,
            this.y + this.height / 2,
            30,
            COLORS.RED
        );
        
        // Show transformation dialogue
        this.game.changeState('dialogue', {
            dialogue: [
                { speaker: "Joe", text: "AHHHHH! YOU'VE PUSHED ME TOO FAR!" },
                { speaker: "Joe", text: "TIME FOR MY FINAL FORM!" },
                { speaker: "Joe", text: "BEHOLD... ULTRA BITTER JOE!" },
                { speaker: "Mark", text: "Oh for f***'s sake..." },
                { speaker: "Jenny", text: "Just keep hitting him, babe!" },
                { speaker: "Joe", text: "I'LL SHOW YOU ALL! MAXIMUM SPITE MODE!" }
            ],
            onComplete: () => {
                this.game.changeState('boss');
            }
        });
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Flash effect
        this.damageFlash = 10;
        
        // Create damage particles
        this.game.createParticleBurst(
            this.x + this.width / 2,
            this.y + this.height / 2,
            5,
            COLORS.RED
        );
        
        this.game.audioManager.playSound('boss_hurt');
        
        if (this.health <= 0) {
            this.health = 0;
            this.onDefeat();
        }
    }

    onDefeat() {
        this.isFighting = false;
        this.isDead = true;
        
        // Clear all projectiles
        this.game.entityManager.queryEntities(e => e.type === 'projectile').forEach(p => {
            p.destroy();
        });
        
        // Victory effect
        this.game.createParticleBurst(
            this.x + this.width / 2,
            this.y + this.height / 2,
            50,
            COLORS.GOLD
        );
        
        this.game.audioManager.playSound('boss_defeat');
    }

    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        this.tearTimer += deltaTime;
        
        if (this.damageFlash > 0) {
            this.damageFlash--;
        }
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
            ctx.fillStyle = COLORS.BLUE;
            ctx.fillRect(renderX + 16, renderY + 30, 32, 40);
            
            // Head
            ctx.fillStyle = '#fdbcb4';
            ctx.fillRect(renderX + 20, renderY + 10, 24, 24);
            
            // Sad face
            ctx.fillStyle = COLORS.BLACK;
            // Eyes
            ctx.fillRect(renderX + 26, renderY + 18, 3, 2);
            ctx.fillRect(renderX + 36, renderY + 18, 3, 2);
            // Frown
            ctx.beginPath();
            ctx.arc(renderX + 32, renderY + 30, 8, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.stroke();
            
            // Tears
            if (Math.sin(this.tearTimer * 0.005) > 0) {
                ctx.fillStyle = COLORS.LIGHT_BLUE;
                ctx.fillRect(renderX + 28, renderY + 22, 2, 8);
                ctx.fillRect(renderX + 38, renderY + 22, 2, 8);
            }
            
            // "REJECTED" band shirt text
            ctx.fillStyle = COLORS.WHITE;
            ctx.font = '6px monospace';
            ctx.fillText('REJECTED', renderX + 18, renderY + 50);
            
            // Legs
            ctx.fillStyle = COLORS.DARK_GRAY;
            ctx.fillRect(renderX + 22, renderY + 70, 8, 26);
            ctx.fillRect(renderX + 34, renderY + 70, 8, 26);
            
        } else {
            // Phase 2 - CHAOS FORM
            const time = Date.now() / 100;
            
            // Chaotic body
            ctx.fillStyle = `hsl(${time % 360}, 100%, 50%)`;
            ctx.fillRect(renderX + 8, renderY + 20, 48, 60);
            
            // Evil head
            ctx.fillStyle = COLORS.BLACK;
            ctx.fillRect(renderX + 16, renderY, 32, 30);
            
            // Glowing eyes
            ctx.shadowBlur = 10;
            ctx.shadowColor = COLORS.RED;
            ctx.fillStyle = COLORS.RED;
            ctx.fillRect(renderX + 24, renderY + 12, 6, 4);
            ctx.fillRect(renderX + 36, renderY + 12, 6, 4);
            ctx.shadowBlur = 0;
            
            // Chaos crown
            ctx.fillStyle = COLORS.GOLD;
            for (let i = 0; i < 3; i++) {
                const spikeX = renderX + 20 + i * 12;
                const spikeY = renderY - 10 + Math.sin(time + i) * 3;
                ctx.fillRect(spikeX, spikeY, 8, 8);
            }
            
            // Evil grin
            ctx.strokeStyle = COLORS.WHITE;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(renderX + 32, renderY + 20, 10, 0, Math.PI);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Debug bounds
        if (window.DEBUG_ENTITIES) {
            ctx.strokeStyle = COLORS.RED;
            ctx.strokeRect(renderX, renderY, this.width, this.height);
        }
    }
}