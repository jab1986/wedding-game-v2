/**
 * Boss State
 * Epic boss fight with Joe
 */

import { GameState } from './gameState.js';
import { SCREEN, COLORS } from '../constants.js';
import { Joe } from '../entities/joe.js';

export class BossState extends GameState {
    init() {
        this.shakeAmount = 0;
        this.flashAlpha = 0;
    }

    onEnter() {
        // Create boss Joe
        this.joe = new Joe(600, 200, this.game);
        this.game.entityManager.addEntity(this.joe);
        
        // Set boss music
        this.game.audioManager.playMusic('boss_theme');
        
        // Show boss intro
        this.game.changeState('dialogue', {
            dialogue: [
                { speaker: "Joe", text: "WELCOME TO MY REALM OF ETERNAL BITTERNESS!" },
                { speaker: "Mark", text: "This is getting weird, even for us." },
                { speaker: "Jenny", text: "Just hit him with your drumsticks!" },
                { speaker: "Joe", text: "PHASE ONE: REJECTED MUSICIAN RAGE!" }
            ],
            onComplete: () => {
                this.startBossFight();
            }
        });
    }

    startBossFight() {
        this.game.changeState('boss');
        this.joe.startFighting();
    }

    update(deltaTime) {
        // Update screen shake
        if (this.shakeAmount > 0) {
            this.shakeAmount -= deltaTime * 0.01;
        }

        // Update flash effect
        if (this.flashAlpha > 0) {
            this.flashAlpha -= deltaTime * 0.005;
        }

        // Check if Joe is defeated
        if (this.joe && this.joe.health <= 0) {
            this.onBossDefeated();
        }

        // Check if player died
        if (this.game.player && this.game.player.health <= 0) {
            this.game.changeState('gameover');
        }
    }

    onBossDefeated() {
        // Clear projectiles
        this.game.entityManager.queryEntities(e => e.type === 'projectile').forEach(p => {
            p.destroy();
        });

        // Victory dialogue
        this.game.changeState('dialogue', {
            dialogue: [
                { speaker: "Joe", text: "*collapses* I... I just wanted to be included..." },
                { speaker: "Mark", text: "Mate, you can't force friendship with violence!" },
                { speaker: "Jenny", text: "Though to be fair, that was pretty metal." },
                { speaker: "Joe", text: "*crying* I spent so long on that wedding game..." },
                { speaker: "Mark", text: "...You made us a game?" },
                { speaker: "Joe", text: "Yeah... 16-bit style... with spite mechanics..." },
                { speaker: "Jenny", text: "That's... actually kind of sweet?" },
                { speaker: "Mark", text: "Alright, f*** it. You can come to the reception." },
                { speaker: "Joe", text: "*sniff* Really?" },
                { speaker: "Mark", text: "Yeah, but no more chaos forms, alright?" },
                { speaker: "Joe", text: "Deal! I'll even play bass for Agent Elf!" },
                { speaker: "Mark", text: "Let's not get carried away..." },
                { speaker: "Officiant", text: "*clears throat* Can we PLEASE finish this wedding?" },
                { speaker: "Both", text: "YES! I DO! WE'RE MARRIED!" },
                { speaker: "Everyone", text: "*cheers*" },
                { speaker: "System", text: "*THE END*" }
            ],
            onComplete: () => {
                this.game.changeState('ending');
            }
        });
    }

    render(ctx, interpolation) {
        // Apply screen shake
        if (this.shakeAmount > 0) {
            ctx.save();
            const shakeX = (Math.random() - 0.5) * this.shakeAmount * 10;
            const shakeY = (Math.random() - 0.5) * this.shakeAmount * 10;
            ctx.translate(shakeX, shakeY);
        }

        // Chaos dimension background
        const time = Date.now() / 1000;
        ctx.fillStyle = COLORS.BLACK;
        ctx.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);

        // Swirling chaos effect
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = `hsla(${(time * 50 + i * 20) % 360}, 100%, 50%, 0.1)`;
            const x = Math.sin(time + i) * 100 + SCREEN.WIDTH / 2;
            const y = Math.cos(time + i) * 100 + SCREEN.HEIGHT / 2;
            ctx.fillRect(x - 25, y - 25, 50, 50);
        }

        // Ground
        ctx.fillStyle = '#1a0033';
        ctx.fillRect(0, SCREEN.HEIGHT - 50, SCREEN.WIDTH, 50);

        // Boss name
        ctx.fillStyle = COLORS.RED;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('JOE THE REJECTED', SCREEN.WIDTH / 2, 20);

        // Boss health bar
        if (this.joe) {
            const barWidth = 200;
            const barX = (SCREEN.WIDTH - barWidth) / 2;
            const barY = 30;
            
            // Background
            ctx.fillStyle = COLORS.DARK_GRAY;
            ctx.fillRect(barX, barY, barWidth, 10);
            
            // Health
            const healthPercent = Math.max(0, this.joe.health / this.joe.maxHealth);
            ctx.fillStyle = healthPercent > 0.5 ? COLORS.RED : 
                           healthPercent > 0.25 ? COLORS.GOLD : COLORS.PINK;
            ctx.fillRect(barX, barY, barWidth * healthPercent, 10);
            
            // Border
            ctx.strokeStyle = COLORS.WHITE;
            ctx.strokeRect(barX, barY, barWidth, 10);
        }

        // Player health
        if (this.game.player) {
            ctx.fillStyle = COLORS.WHITE;
            ctx.font = '8px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('MARK HP', 10, 25);
            
            ctx.fillStyle = COLORS.RED;
            ctx.fillRect(10, 30, this.game.player.health, 5);
            ctx.strokeStyle = COLORS.WHITE;
            ctx.strokeRect(10, 30, 100, 5);
        }

        if (this.shakeAmount > 0) {
            ctx.restore();
        }

        // Flash effect
        if (this.flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
            ctx.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);
        }
    }

    triggerScreenShake(amount = 1) {
        this.shakeAmount = Math.min(2, this.shakeAmount + amount);
    }

    triggerFlash(alpha = 0.8) {
        this.flashAlpha = alpha;
    }
}