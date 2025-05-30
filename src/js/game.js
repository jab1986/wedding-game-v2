// src/js/game.js
import { GAME_STATES, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { Mark } from './entities/mark.js';
import { Jenny } from './entities/jenny.js';
import { Joe } from './entities/joe.js';
import { InputManager } from './systems/input.js';
import { AudioManager } from './systems/audio.js';
import { LevelManager } from './systems/levelManager.js';
import { Renderer } from './systems/renderer.js';
import { ParticleSystem } from './systems/particleSystem.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        // Set canvas size to SNES resolution
        this.canvas.width = 256;  // SNES width
        this.canvas.height = 224; // SNES height

        // Game state
        this.state = GAME_STATES.START;
        this.previousState = null;
        this.dialogueIndex = 0;

        // Frame timing
        this.lastTime = 0;
        this.accumulator = 0;
        this.deltaTime = 1000 / 60; // 60 FPS
        this.currentTime = 0;
        this.frameCount = 0;

        // Systems
        this.inputManager = new InputManager(this.canvas);
        this.audioManager = new AudioManager();
        this.levelManager = new LevelManager(this);
        this.renderer = new Renderer(this.ctx);
        this.particleSystem = new ParticleSystem();

        // Entities
        this.mark = null;
        this.jenny = null;
        this.joe = null;

        // UI elements
        this.dialogueBox = document.getElementById('dialogue');
        this.bossHealthBar = document.getElementById('bossHealth');
        this.bossName = document.getElementById('bossName');
        this.startScreen = document.getElementById('startScreen');

        this.init();
    }

    init() {
        // Create player characters
        this.mark = new Mark(50, 150, this.inputManager, this);
        this.jenny = new Jenny(90, 150, this.mark);

        // Create boss (hidden initially)
        this.joe = new Joe(180, 50, this);

        // Bind game loop
        this.gameLoop = this.gameLoop.bind(this);

        // Set up UI event handlers
        this.setupUI();

        // Show start screen
        this.showStartScreen();

        // Start the game loop
        requestAnimationFrame(this.gameLoop);
    }

    setupUI() {
        // Start button - use class selector instead of descendant selector
        const startBtn = document.querySelector('.start-button');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        // Mute button
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.audioManager.toggleMute());
        }

        // Dialogue advancement
        this.canvas.addEventListener('click', () => {
            if (this.state === GAME_STATES.DIALOGUE) {
                this.nextDialogue();
            }
        });
    }

    showStartScreen() {
        if (this.startScreen) {
            this.startScreen.classList.remove('hidden');
        }
        // Clear canvas with a dark background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    startGame() {
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
        }
        this.state = GAME_STATES.PLAYING;
        this.audioManager.unlock();
        this.audioManager.startMusic();

        // Resume audio context if suspended
        if (this.audioManager.context && this.audioManager.context.state === 'suspended') {
            this.audioManager.context.resume();
        }
    }

    gameLoop(timestamp) {
        // Calculate delta time
        if (!this.lastTime) this.lastTime = timestamp;
        const frameTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Prevent spiral of death
        if (frameTime > 250) {
            this.accumulator = this.deltaTime;
        } else {
            this.accumulator += frameTime;
        }

        // Fixed timestep updates
        while (this.accumulator >= this.deltaTime) {
            this.update(this.deltaTime / 1000);
            this.accumulator -= this.deltaTime;
        }

        // Render with interpolation
        const interpolation = this.accumulator / this.deltaTime;
        this.render(interpolation);

        // FPS counter
        this.frameCount++;

        requestAnimationFrame(this.gameLoop);
    }

    update(dt) {
        // Update input manager
        this.inputManager.update();

        // Update based on game state
        switch (this.state) {
            case GAME_STATES.START:
                // Start screen doesn't need updates
                break;
            case GAME_STATES.PLAYING:
                this.updatePlaying(dt);
                break;
            case GAME_STATES.BOSS_FIGHT:
                this.updateBossFight(dt);
                break;
            case GAME_STATES.DIALOGUE:
                // Dialogue doesn't need updates
                break;
        }

        // Always update particles
        this.particleSystem.update(dt);
    }

    updatePlaying(dt) {
        // Update player movement
        this.mark.update(dt * 1000); // Convert to milliseconds
        this.jenny.update(dt * 1000);

        // Check level objectives
        const currentLevel = this.levelManager.getCurrentLevel();
        if (currentLevel.checkObjective && this.levelManager.checkObjective(this.mark)) {
            this.startDialogue();
        }
    }

    updateBossFight(dt) {
        // Update all entities
        this.mark.update(dt * 1000);
        this.jenny.update(dt * 1000);
        this.joe.update(dt * 1000);

        // Check collisions
        this.checkBossCollisions();

        // Update boss health bar
        this.updateBossHealthBar();

        // Check win/lose conditions
        if (this.joe.health <= 0) {
            this.winBossFight();
        } else if (this.mark.health <= 0) {
            this.gameOver();
        }
    }

    checkBossCollisions() {
        // Check Mark's attack hitting Joe
        if (this.mark.attacking && this.mark.attackCooldown === 30) {
            const dx = Math.abs(this.mark.x - this.joe.x);
            const dy = Math.abs(this.mark.y - this.joe.y);

            if (dx < 80 && dy < 80) {
                this.joe.takeDamage(10);
                this.particleSystem.createParticles(
                    this.joe.x + this.joe.width / 2,
                    this.joe.y + this.joe.height / 2,
                    '#ff0000',
                    10
                );
                this.audioManager.playSound('hit');

                // Knockback
                this.joe.x += this.mark.x < this.joe.x ? 20 : -20;
            }
        }

        // Check projectile collisions
        this.joe.projectiles = this.joe.projectiles.filter(proj => {
            if (this.checkCollision(proj, this.mark)) {
                this.mark.takeDamage(proj.damage);
                this.particleSystem.createParticles(
                    this.mark.x + this.mark.width / 2,
                    this.mark.y + this.mark.height / 2,
                    '#ff0000',
                    5
                );
                this.audioManager.playSound('hit');
                return false;
            }
            return proj.x > -50;
        });
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    render(interpolation) {
        // Always clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render based on game state
        if (this.state === GAME_STATES.START) {
            // Start screen is HTML overlay, just show dark background
            return;
        }

        // Render level
        this.levelManager.render(this.renderer, interpolation);

        // Render entities
        if (this.mark) this.mark.render(this.ctx, interpolation);
        if (this.jenny) this.jenny.render(this.ctx, interpolation);

        if (this.state === GAME_STATES.BOSS_FIGHT && this.joe) {
            this.joe.render(this.ctx, interpolation);
            if (this.joe.projectiles) {
                this.joe.projectiles.forEach(proj => {
                    this.renderer.drawProjectile(proj);
                });
            }
        }

        // Render particles
        this.particleSystem.render(this.ctx);

        // Render UI
        if (this.state === GAME_STATES.BOSS_FIGHT) {
            this.renderBossUI();
        }
    }

    renderBossUI() {
        // Health bar is HTML, just ensure it's visible
        if (this.bossHealthBar) {
            this.bossHealthBar.classList.remove('hidden');
        }
        if (this.bossName) {
            this.bossName.classList.remove('hidden');
        }
    }

    updateBossHealthBar() {
        const healthPercent = this.joe.health / this.joe.maxHealth;
        const healthFill = document.getElementById('bossHealthFill');
        if (healthFill) {
            healthFill.style.width = (healthPercent * 100) + '%';
        }
    }

    startDialogue() {
        this.state = GAME_STATES.DIALOGUE;
        this.dialogueIndex = 0;
        this.showDialogue();
    }

    showDialogue() {
        const currentLevel = this.levelManager.getCurrentLevel();
        const dialogue = currentLevel.dialogue;

        if (this.dialogueIndex < dialogue.length) {
            this.dialogueBox.innerHTML = dialogue[this.dialogueIndex] +
                '<br><span style="color: #666; font-size: 8px;">[SPACE or TAP to continue]</span>';
            this.dialogueBox.classList.remove('hidden');
        } else {
            this.endDialogue();
        }
    }

    nextDialogue() {
        this.dialogueIndex++;
        this.showDialogue();
    }

    endDialogue() {
        this.dialogueBox.classList.add('hidden');

        const currentLevelIndex = this.levelManager.currentLevel;

        // Check if we should start boss fight
        if (currentLevelIndex === 3 && this.joe.health > 0) {
            this.startBossFight();
        } else if (currentLevelIndex === 3 && this.joe.health <= 0) {
            this.endGame();
        } else {
            // Progress to next level
            this.levelManager.nextLevel();
            this.resetPlayerPositions();
            this.state = GAME_STATES.PLAYING;
        }
    }

    startBossFight() {
        this.state = GAME_STATES.BOSS_FIGHT;
        if (this.bossHealthBar) this.bossHealthBar.classList.remove('hidden');
        if (this.bossName) this.bossName.classList.remove('hidden');
        this.joe.startFighting();
        this.audioManager.playSound('boss');
    }

    resetPlayerPositions() {
        this.mark.x = 50;
        this.mark.y = 150;
        this.jenny.x = 90;
        this.jenny.y = 150;
    }

    winBossFight() {
        this.joe.projectiles = [];
        this.state = GAME_STATES.DIALOGUE;
        this.dialogueIndex = 0;

        // Set victory dialogue
        this.levelManager.getCurrentLevel().dialogue = [
            "Joe: *collapses* I... I just wanted to be included...",
            "Mark: Mate, you can't force friendship with violence!",
            "Jenny: Though to be fair, that was pretty metal.",
            "Joe: *crying* I spent so long on that wedding game...",
            "Mark: ...You made us a game?",
            "Joe: Yeah... 16-bit style... with spite mechanics...",
            "Jenny: That's... actually kind of sweet?",
            "Mark: Alright, f*** it. You can come to the reception.",
            "Joe: *sniff* Really?",
            "Mark: Yeah, but no more chaos forms, alright?",
            "Joe: Deal! I'll even play bass for Agent Elf!",
            "Mark: Let's not get carried away...",
            "Officiant: *clears throat* Can we PLEASE finish this wedding?",
            "Mark & Jenny: YES! I DO! WE'RE MARRIED!",
            "Everyone: *cheers*",
            "*THE END*"
        ];

        this.showDialogue();
    }

    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        this.audioManager.playSound('death');
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) gameOverScreen.classList.remove('hidden');
    }

    endGame() {
        this.state = GAME_STATES.END;
        const endScreen = document.getElementById('endScreen');
        if (endScreen) endScreen.classList.remove('hidden');
        if (this.bossHealthBar) this.bossHealthBar.classList.add('hidden');
        if (this.bossName) this.bossName.classList.add('hidden');
    }

    // Helper method for particle effects
    createParticleBurst(x, y, count, color) {
        this.particleSystem.createParticles(x, y, color, count);
    }
}