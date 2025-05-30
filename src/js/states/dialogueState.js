/**
 * Dialogue State
 * Handles story dialogue and cutscenes
 */

import { GameState } from './gameState.js';
import { SCREEN, COLORS } from '../constants.js';

export class DialogueState extends GameState {
    init() {
        this.currentIndex = 0;
        this.currentText = '';
        this.targetText = '';
        this.charIndex = 0;
        this.charTimer = 0;
        this.charSpeed = 30; // ms per character
        this.isComplete = false;
        this.boxY = SCREEN.HEIGHT;
        this.boxTargetY = SCREEN.HEIGHT - 60;
    }

    onEnter(previousState, data = {}) {
        this.dialogue = data.dialogue || [];
        this.onComplete = data.onComplete || (() => {});
        this.currentIndex = 0;
        this.currentText = '';
        this.charIndex = 0;
        this.isComplete = false;
        this.boxY = SCREEN.HEIGHT;
        
        if (this.dialogue.length > 0) {
            this.showNextDialogue();
        }
    }

    showNextDialogue() {
        if (this.currentIndex >= this.dialogue.length) {
            this.onComplete();
            return;
        }

        const current = this.dialogue[this.currentIndex];
        this.targetText = current.text || current;
        this.currentSpeaker = current.speaker || null;
        this.currentText = '';
        this.charIndex = 0;
        this.isComplete = false;
        
        // Special effects for certain speakers
        if (this.currentSpeaker === 'SFX') {
            this.game.audioManager.playSound('crash');
            this.game.createParticleBurst(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2, 20, COLORS.RED);
        } else if (this.currentSpeaker === 'Ghost') {
            this.game.audioManager.playSound('ghost');
        } else if (this.currentSpeaker === 'Joe') {
            this.game.audioManager.playSound('boss');
        }
    }

    update(deltaTime) {
        // Animate dialogue box
        if (this.boxY > this.boxTargetY) {
            this.boxY -= 5;
        }

        // Typewriter effect
        if (!this.isComplete && this.charIndex < this.targetText.length) {
            this.charTimer += deltaTime;
            
            if (this.charTimer >= this.charSpeed) {
                this.charTimer = 0;
                this.currentText += this.targetText[this.charIndex];
                this.charIndex++;
                
                // Play typing sound
                if (this.charIndex % 3 === 0) {
                    this.game.audioManager.playSound('text');
                }
                
                if (this.charIndex >= this.targetText.length) {
                    this.isComplete = true;
                }
            }
        }
    }

    render(ctx, interpolation) {
        // Render the game state behind the dialogue
        this.game.getState('playing').render(ctx, interpolation);
        
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);
        
        // Dialogue box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(10, this.boxY, SCREEN.WIDTH - 20, 50);
        
        ctx.strokeStyle = COLORS.RED;
        ctx.lineWidth = 2;
        ctx.strokeRect(10, this.boxY, SCREEN.WIDTH - 20, 50);
        
        // Speaker name
        if (this.currentSpeaker) {
            ctx.fillStyle = this.getSpeakerColor();
            ctx.font = '8px monospace';
            ctx.fillText(this.currentSpeaker + ':', 20, this.boxY + 15);
        }
        
        // Dialogue text
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '8px monospace';
        const textY = this.currentSpeaker ? this.boxY + 30 : this.boxY + 20;
        
        // Word wrap
        const words = this.currentText.split(' ');
        let line = '';
        let y = textY;
        const maxWidth = SCREEN.WIDTH - 40;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, 20, y);
                line = words[i] + ' ';
                y += 10;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 20, y);
        
        // Continue indicator
        if (this.isComplete) {
            const blinkAlpha = Math.sin(Date.now() / 200) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${blinkAlpha})`;
            ctx.font = '6px monospace';
            ctx.fillText('▼', SCREEN.WIDTH - 25, this.boxY + 40);
        }
        
        // Instructions
        ctx.fillStyle = COLORS.DARK_GRAY;
        ctx.font = '6px monospace';
        ctx.fillText('[SPACE/A to continue]', SCREEN.WIDTH / 2 - 40, this.boxY + 55);
    }

    getSpeakerColor() {
        switch (this.currentSpeaker) {
            case 'Mark': return COLORS.DARK_GRAY;
            case 'Jenny': return COLORS.GRASS_GREEN;
            case 'Joe': return COLORS.BLUE;
            case 'Ghost': return COLORS.LIGHT_BLUE;
            case 'System': return COLORS.RED;
            case 'SFX': return COLORS.GOLD;
            default: return COLORS.WHITE;
        }
    }

    handleInput(action, pressed) {
        if (!pressed) return;
        
        if (action === 'a' || action === 'start') {
            if (this.isComplete) {
                this.currentIndex++;
                this.showNextDialogue();
            } else {
                // Skip to end of current text
                this.currentText = this.targetText;
                this.charIndex = this.targetText.length;
                this.isComplete = true;
            }
        }
    }
}