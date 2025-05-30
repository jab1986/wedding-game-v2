/**
 * Playing State
 * Main gameplay state with level progression
 */

import { GameState } from './gameState.js';
import { SCREEN, COLORS, COLLISION_LAYERS } from '../constants.js';
import { Mark } from '../entities/mark.js';
import { Jenny } from '../entities/jenny.js';
import { Obstacle } from '../entities/obstacle.js';
import { Objective } from '../entities/objective.js';

export class PlayingState extends GameState {
    init() {
        this.currentLevel = 0;
        this.levels = this.createLevels();
        this.camera = { x: 0, y: 0 };
    }

    onEnter(previousState) {
        // Start or continue game
        if (previousState === 'menu') {
            this.currentLevel = 0;
        }
        
        this.loadLevel(this.currentLevel);
    }

    createLevels() {
        return [
            {
                name: "Amsterdam: City of Poor Decisions",
                background: '#1a1a2e',
                ground: '#16213e',
                music: 'amsterdam_theme',
                objective: { 
                    x: 700, 
                    y: 300, 
                    width: 60, 
                    height: 80, 
                    label: "That Bridge",
                    sprite: 'bridge'
                },
                dialogue: [
                    { speaker: "Mark", text: "Holy s***, Jenny! Remember this place?" },
                    { speaker: "Jenny", text: "How could I forget? You were so high you proposed with a Ring Pop!" },
                    { speaker: "Mark", text: "Hey, it was cherry flavored! Plus the real ring was in my other pocket..." },
                    { speaker: "Jenny", text: "Sure it was, drummer boy. Sure it was." },
                    { speaker: "Mark", text: "...Okay, I bought it the next day. But my love was real, dammit!" },
                    { speaker: "Ghost", text: "*Thomas Shauny's ghost appears* 'Get married already, you muppets!'" },
                    { speaker: "Both", text: "JESUS CHRIST! Let's get out of here!" }
                ],
                obstacles: [
                    { x: 300, y: 250, width: 80, height: 100, type: 'plant', label: 'Questionable Plant' },
                    { x: 500, y: 320, width: 60, height: 30, type: 'sign', label: 'Red Light District' }
                ],
                enemies: []
            },
            {
                name: "London: It's Always F***ing Raining",
                background: '#0f0f0f',
                ground: '#2a2a2a',
                weather: 'rain',
                music: 'london_theme',
                objective: { 
                    x: 700, 
                    y: 300, 
                    width: 80, 
                    height: 100, 
                    label: "Sketchy Pub",
                    sprite: 'pub'
                },
                dialogue: [
                    { speaker: "Jenny", text: "Christ on a bike, this weather!" },
                    { speaker: "Mark", text: "Perfect for a wedding, innit? Nothing says romance like pneumonia." },
                    { speaker: "Jenny", text: "Wait... do you hear that?" },
                    { speaker: "Mark", text: "Hear what?" },
                    { speaker: "Voice", text: "*Distant crying* 'Why wasn't I invited?! WHYYY?!'" },
                    { speaker: "Jenny", text: "...Let's just get to the venue." }
                ],
                obstacles: [
                    { x: 250, y: 200, width: 100, height: 150, type: 'shop', label: 'XXX Shop' },
                    { x: 450, y: 280, width: 40, height: 70, type: 'crime', label: 'Crime Scene' }
                ],
                enemies: [
                    { x: 350, y: 300, type: 'drunk', patrol: true }
                ]
            },
            {
                name: "The Wedding Venue",
                background: '#2e0249',
                ground: '#570861',
                music: 'wedding_theme',
                objective: { 
                    x: 650, 
                    y: 250, 
                    width: 100, 
                    height: 120, 
                    label: "Altar",
                    sprite: 'altar'
                },
                dialogue: [
                    { speaker: "Officiant", text: "Dearly beloved, we are gathered here today—" },
                    { speaker: "SFX", text: "*CRASH*" },
                    { speaker: "???", text: "STOP THIS WEDDING!" },
                    { speaker: "Mark", text: "Who the f*** is that?!" },
                    { speaker: "Joe", text: "IT'S ME, JOE! THE ONE YOU FORGOT!" },
                    { speaker: "Jenny", text: "Joe? Who's Joe?" },
                    { speaker: "Joe", text: "I MADE A GAME FOR YOUR WEDDING BUT GOT NO INVITE!" },
                    { speaker: "Mark", text: "Dude, we don't even know you!" },
                    { speaker: "Joe", text: "THAT'S THE POINT! I WANTED TO BE IN AGENT ELF!" },
                    { speaker: "Joe", text: "BUT NOOOO! NOW I LEAD A LIFE OF CRIME AND SPITE!" },
                    { speaker: "Joe", text: "IF I CAN'T BE HAPPY, NOBODY CAN!" },
                    { speaker: "Mark", text: "This is why we didn't invite you, mate." },
                    { speaker: "Joe", text: "PREPARE TO FACE... DOCTOR CHAOS... NO, WAIT..." },
                    { speaker: "Joe", text: "PROFESSOR MAYHEM... NO, THAT'S TAKEN TOO..." },
                    { speaker: "Joe", text: "F*** IT! JUST CALL ME BITTER JOE!" },
                    { speaker: "System", text: "BOSS FIGHT: DEFEAT JOE TO GET MARRIED!" }
                ],
                obstacles: [
                    { x: 200, y: 230, width: 60, height: 120, type: 'chairs', label: 'Overturned Chairs' },
                    { x: 400, y: 300, width: 60, height: 50, type: 'wine', label: 'Spilled Wine' }
                ],
                enemies: [],
                isBossLevel: true
            }
        ];
    }

    loadLevel(levelIndex) {
        const level = this.levels[levelIndex];
        
        // Clear entities
        this.game.entityManager.clear();
        
        // Create Mark (player)
        this.mark = new Mark(100, 300, this.game.inputManager, this.game);
        this.game.entityManager.addEntity(this.mark);
        this.game.player = this.mark;
        
        // Create Jenny (AI companion)
        this.jenny = new Jenny(140, 300, this.mark);
        this.game.entityManager.addEntity(this.jenny);
        
        // Create obstacles
        level.obstacles.forEach(obs => {
            const obstacle = new Obstacle(obs.x, obs.y, obs.width, obs.height, obs.type, obs.label);
            this.game.entityManager.addEntity(obstacle);
        });
        
        // Create objective
        if (level.objective) {
            this.objective = new Objective(
                level.objective.x,
                level.objective.y,
                level.objective.width,
                level.objective.height,
                level.objective.label,
                () => this.onObjectiveReached()
            );
            this.game.entityManager.addEntity(this.objective);
        }
        
        // Set level data
        this.currentLevelData = level;
        
        // Play level music
        if (level.music) {
            this.game.audioManager.playMusic(level.music);
        }
    }

    onObjectiveReached() {
        // Trigger dialogue for current level
        this.game.changeState('dialogue', {
            dialogue: this.currentLevelData.dialogue,
            onComplete: () => {
                if (this.currentLevelData.isBossLevel) {
                    // Start boss fight
                    this.game.changeState('boss');
                } else {
                    // Next level
                    this.nextLevel();
                }
            }
        });
    }

    nextLevel() {
        this.currentLevel++;
        
        if (this.currentLevel >= this.levels.length) {
            // Game complete!
            this.game.changeState('ending');
        } else {
            this.loadLevel(this.currentLevel);
            this.game.changeState('playing');
        }
    }

    update(deltaTime) {
        // Update camera to follow player
        if (this.mark) {
            const targetX = this.mark.x - SCREEN.WIDTH / 2;
            const targetY = this.mark.y - SCREEN.HEIGHT / 2;
            
            this.camera.x += (targetX - this.camera.x) * 0.1;
            this.camera.y += (targetY - this.camera.y) * 0.1;
            
            // Clamp camera
            this.camera.x = Math.max(0, Math.min(800 - SCREEN.WIDTH, this.camera.x));
            this.camera.y = Math.max(0, Math.min(600 - SCREEN.HEIGHT, this.camera.y));
        }
    }

    render(ctx, interpolation) {
        const level = this.currentLevelData;
        
        // Background
        ctx.fillStyle = level.background;
        ctx.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);
        
        // Ground
        ctx.fillStyle = level.ground;
        ctx.fillRect(0, SCREEN.HEIGHT - 50, SCREEN.WIDTH, 50);
        
        // Weather effects
        if (level.weather === 'rain') {
            this.renderRain(ctx);
        }
        
        // Level name
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '10px monospace';
        ctx.fillText(level.name, 10, 20);
        
        // Player stats
        if (this.mark) {
            this.renderPlayerStats(ctx);
        }
    }

    renderRain(ctx) {
        ctx.strokeStyle = 'rgba(200, 200, 255, 0.4)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * SCREEN.WIDTH;
            const y = Math.random() * SCREEN.HEIGHT;
            const length = Math.random() * 10 + 5;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 2, y + length);
            ctx.stroke();
        }
    }

    renderPlayerStats(ctx) {
        // Health
        ctx.fillStyle = COLORS.RED;
        ctx.fillRect(10, 30, this.mark.health, 5);
        ctx.strokeStyle = COLORS.WHITE;
        ctx.strokeRect(10, 30, 100, 5);
        
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '6px monospace';
        ctx.fillText('HEALTH', 10, 28);
    }

    handleInput(action, pressed) {
        // Input is handled by the player entity
    }
}