/**
 * Menu State
 * Main menu screen
 */

import { GameState } from './gameState.js';
import { SCREEN, COLORS, GAME_STATES } from '../constants.js';

export class MenuState extends GameState {
    init() {
        this.titleY = -50;
        this.titleTargetY = SCREEN.HEIGHT / 2 - 60;
        this.menuAlpha = 0;
        this.selectedOption = 0;
        this.options = ['START GAME', 'HOW TO PLAY', 'CREDITS'];
        this.particles = [];
        
        // Create background particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * SCREEN.WIDTH,
                y: Math.random() * SCREEN.HEIGHT,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? COLORS.PINK : COLORS.RED
            });
        }
    }

    onEnter() {
        this.titleY = -50;
        this.menuAlpha = 0;
        this.selectedOption = 0;
    }

    update(deltaTime) {
        // Animate title
        if (this.titleY < this.titleTargetY) {
            this.titleY += 3;
        }

        // Fade in menu
        if (this.titleY >= this.titleTargetY - 10 && this.menuAlpha < 1) {
            this.menuAlpha += 0.02;
        }

        // Update particles
        this.particles.forEach(p => {
            p.y -= p.speed;
            if (p.y < -10) {
                p.y = SCREEN.HEIGHT + 10;
                p.x = Math.random() * SCREEN.WIDTH;
            }
        });
    }

    render(ctx) {
        // Background
        ctx.fillStyle = COLORS.BLACK;
        ctx.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);

        // Draw particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        // Title
        ctx.save();
        ctx.translate(SCREEN.WIDTH / 2, this.titleY);
        
        // Main title
        ctx.fillStyle = COLORS.RED;
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("MARK & JENNY'S", 0, 0);
        ctx.fillText("F***ING EPIC", 0, 20);
        ctx.fillText("WEDDING QUEST", 0, 40);

        // Subtitle
        ctx.fillStyle = COLORS.DARK_GRAY;
        ctx.font = '8px monospace';
        ctx.fillText("SNES EDITION", 0, 60);
        
        ctx.restore();

        // Menu options
        if (this.menuAlpha > 0) {
            ctx.globalAlpha = this.menuAlpha;
            
            const menuY = SCREEN.HEIGHT / 2 + 40;
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            
            this.options.forEach((option, i) => {
                const y = menuY + i * 20;
                
                if (i === this.selectedOption) {
                    // Selected option
                    ctx.fillStyle = COLORS.WHITE;
                    ctx.fillText('> ' + option + ' <', SCREEN.WIDTH / 2, y);
                    
                    // Pulsing effect
                    const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
                    ctx.globalAlpha = this.menuAlpha * pulse;
                    ctx.fillStyle = COLORS.PINK;
                    ctx.fillText('> ' + option + ' <', SCREEN.WIDTH / 2, y);
                    ctx.globalAlpha = this.menuAlpha;
                } else {
                    ctx.fillStyle = COLORS.GRAY;
                    ctx.fillText(option, SCREEN.WIDTH / 2, y);
                }
            });

            // Controls hint
            ctx.fillStyle = COLORS.DARK_GRAY;
            ctx.font = '6px monospace';
            ctx.fillText('ARROWS: Select  ENTER/A: Confirm', SCREEN.WIDTH / 2, SCREEN.HEIGHT - 20);
            
            // Warning
            ctx.fillStyle = COLORS.RED;
            ctx.fillText('⚠ WARNING: Contains love, drums, and spite ⚠', SCREEN.WIDTH / 2, SCREEN.HEIGHT - 10);
            
            ctx.globalAlpha = 1;
        }

        // Decorative elements
        ctx.fillStyle = COLORS.PINK;
        ctx.font = '12px monospace';
        ctx.fillText('💀', 20, 20);
        ctx.fillText('♥', SCREEN.WIDTH - 20, 20);
        ctx.fillText('💀', 20, SCREEN.HEIGHT - 20);
        ctx.fillText('♥', SCREEN.WIDTH - 20, SCREEN.HEIGHT - 20);
    }

    handleInput(action, pressed) {
        if (!pressed) return;
        
        switch (action) {
            case 'up':
                this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
                this.game.audioManager.playSound('menu_move');
                break;
                
            case 'down':
                this.selectedOption = (this.selectedOption + 1) % this.options.length;
                this.game.audioManager.playSound('menu_move');
                break;
                
            case 'a':
            case 'start':
                this.selectOption();
                break;
        }
    }

    selectOption() {
        this.game.audioManager.playSound('menu_select');
        
        switch (this.selectedOption) {
            case 0: // Start Game
                this.game.startNewGame();
                break;
                
            case 1: // How to Play
                this.game.changeState('instructions');
                break;
                
            case 2: // Credits
                this.game.changeState('credits');
                break;
        }
    }
}