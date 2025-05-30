import { COLORS, COMBAT } from '../constants.js';

export class SimpleJoe {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 96;
        this.health = COMBAT.JOE_HEALTH;
        this.maxHealth = COMBAT.JOE_HEALTH;
        this.color = COLORS.JOE.NORMAL;
        this.transformed = false;

        // Attack properties
        this.attackTimer = 0;
        this.attackCooldown = 60; // frames
        this.projectiles = [];

        // Movement
        this.baseY = y;
        this.floatTimer = 0;
    }

    update(dt, target, audioManager) {
        // Update floating movement
        this.floatTimer += dt;

        if (this.transformed) {
            // Chaotic movement in phase 2
            this.y = this.baseY + Math.sin(this.floatTimer * 2) * 30;
            this.x += Math.sin(this.floatTimer * 3) * 2;
            this.color = COLORS.JOE.TRANSFORMED;
        } else {
            // Gentle floating in phase 1
            this.y = this.baseY + Math.sin(this.floatTimer) * 10;
        }

        // Keep in bounds
        this.x = Math.max(400, Math.min(this.x, 700));

        // Update attacks
        this.attackTimer++;
        if (this.attackTimer >= this.attackCooldown) {
            this.attackTimer = 0;
            this.attack(target, audioManager);
        }

        // Update projectiles
        this.projectiles = this.projectiles.filter(proj => {
            proj.x += proj.vx * dt;
            proj.y += proj.vy * dt;
            return proj.x > -50 && proj.x < 850 && proj.y > -50 && proj.y < 650;
        });

        // Transform at 50% health
        if (this.health <= COMBAT.JOE_PHASE2_THRESHOLD && !this.transformed) {
            this.transform();
        }
    }

    attack(target, audioManager) {
        if (this.transformed) {
            // Phase 2: Multiple projectiles
            for (let i = 0; i < 3; i++) {
                const angle = (Math.PI / 4) * (i - 1);
                const speed = COMBAT.PROJECTILE_SPEED;

                this.projectiles.push({
                    x: this.x,
                    y: this.y + this.height / 2,
                    vx: -Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    width: 12,
                    height: 12,
                    damage: COMBAT.PROJECTILE_DAMAGE_PHASE2,
                    color: '#ff0000'
                });
            }
        } else {
            // Phase 1: Single projectile
            this.projectiles.push({
                x: this.x,
                y: this.y + this.height / 2,
                vx: -COMBAT.PROJECTILE_SPEED,
                vy: (Math.random() - 0.5) * 100,
                width: 8,
                height: 8,
                damage: COMBAT.PROJECTILE_DAMAGE,
                color: '#ffff00'
            });
        }

        // Play sound if available
        if (audioManager && audioManager.playSound) {
            audioManager.playSound('attack');
        }
    }

    transform() {
        this.transformed = true;
        this.attackCooldown = 40; // Faster attacks
        this.color = COLORS.JOE.TRANSFORMED;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
} 