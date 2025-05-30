import { COLORS, PHYSICS } from '../constants.js';

export class SimplePlayer {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.width = 32;
        this.height = 48;
        this.vx = 0;
        this.vy = 0;
        this.speed = PHYSICS.PLAYER_SPEED;
        this.health = 100;
        this.maxHealth = 100;
        this.attacking = false;
        this.attackCooldown = 0;

        // Set color based on character
        if (name === 'mark') {
            this.color = COLORS.MARK.BODY;
        } else if (name === 'jenny') {
            this.color = COLORS.JENNY.BODY;
        } else {
            this.color = '#ffffff';
        }

        // Jenny follows Mark
        this.followTarget = null;
        this.followDistance = PHYSICS.JENNY_FOLLOW_DISTANCE;
        this.followSpeed = PHYSICS.JENNY_FOLLOW_SPEED;
    }

    setFollowTarget(target) {
        this.followTarget = target;
    }

    update(dt, inputManager, levelManager) {
        // Handle input for Mark, or follow behavior for Jenny
        if (this.name === 'mark' && inputManager) {
            this.handleInput(inputManager);
        } else if (this.followTarget) {
            this.handleFollowBehavior(dt);
        }

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Keep on screen
        this.x = Math.max(0, Math.min(this.x, 800 - this.width));
        this.y = Math.max(0, Math.min(this.y, 600 - this.height));

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        // Reset attacking flag
        if (this.attackCooldown === 0) {
            this.attacking = false;
        }
    }

    handleInput(inputManager) {
        this.vx = 0;
        this.vy = 0;

        // Movement
        if (inputManager.keys.ArrowLeft || inputManager.keys.KeyA) {
            this.vx = -this.speed;
        }
        if (inputManager.keys.ArrowRight || inputManager.keys.KeyD) {
            this.vx = this.speed;
        }
        if (inputManager.keys.ArrowUp || inputManager.keys.KeyW) {
            this.vy = -this.speed;
        }
        if (inputManager.keys.ArrowDown || inputManager.keys.KeyS) {
            this.vy = this.speed;
        }

        // Attack
        if ((inputManager.keys.Space || inputManager.keys.Enter) && this.attackCooldown === 0) {
            this.attack();
        }
    }

    handleFollowBehavior(dt) {
        if (!this.followTarget) return;

        const dx = this.followTarget.x - this.x;
        const dy = this.followTarget.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.followDistance) {
            const moveX = (dx / distance) * this.followSpeed;
            const moveY = (dy / distance) * this.followSpeed;

            this.vx = moveX;
            this.vy = moveY;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
    }

    attack() {
        this.attacking = true;
        this.attackCooldown = 30; // frames
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
} 