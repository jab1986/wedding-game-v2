export class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = 0;
        this.levels = [
            {
                name: "The Wedding Begins",
                dialogue: [
                    "Mark: Alright Jenny, let's get this wedding started!",
                    "Jenny: I can't believe we're actually doing this!",
                    "Mark: After all the chaos we've been through...",
                    "Jenny: Speaking of chaos, where's Joe?",
                    "Mark: Probably setting up his drums somewhere..."
                ],
                objective: { type: 'reach', x: 400, y: 300, width: 50, height: 50 }
            },
            {
                name: "The Ceremony",
                dialogue: [
                    "Officiant: Dearly beloved, we are gathered here today...",
                    "Mark: *whispers* This is really happening!",
                    "Jenny: *whispers back* I love you, you beautiful disaster!",
                    "*CRASH* *BANG* *CYMBAL*",
                    "Everyone: What was that?!"
                ],
                objective: { type: 'reach', x: 500, y: 200, width: 50, height: 50 }
            },
            {
                name: "Joe Appears",
                dialogue: [
                    "Joe: *bursts through the wall* SURPRISE!",
                    "Mark: Joe?! What the hell are you doing?!",
                    "Joe: I wasn't invited to the wedding!",
                    "Jenny: That's because you're completely mental!",
                    "Joe: I'll show you mental! *transforms into chaos form*",
                    "Mark: Oh f***... here we go again..."
                ],
                objective: { type: 'reach', x: 600, y: 150, width: 50, height: 50 }
            },
            {
                name: "Boss Fight",
                dialogue: [
                    "Joe: You can't have a wedding without the CHAOS DRUMMER!",
                    "Mark: We're getting married whether you like it or not!",
                    "Jenny: Let's finish this once and for all!"
                ],
                objective: { type: 'defeat_boss' }
            }
        ];
    }

    getCurrentLevel() {
        return this.levels[this.currentLevel] || this.levels[0];
    }

    checkObjective(player) {
        const level = this.getCurrentLevel();
        if (!level.objective) return false;

        if (level.objective.type === 'reach') {
            const obj = level.objective;
            return player.x < obj.x + obj.width &&
                player.x + (player.width || 32) > obj.x &&
                player.y < obj.y + obj.height &&
                player.y + (player.height || 48) > obj.y;
        }

        return false;
    }

    nextLevel() {
        if (this.currentLevel < this.levels.length - 1) {
            this.currentLevel++;
        }
    }

    render(renderer, interpolation) {
        // Draw simple background
        const ctx = renderer.ctx;

        // Clear with dark background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw simple ground
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(0, ctx.canvas.height - 100, ctx.canvas.width, 100);

        // Draw objective area if current level has one
        const level = this.getCurrentLevel();
        if (level.objective && level.objective.type === 'reach') {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.fillRect(
                level.objective.x,
                level.objective.y,
                level.objective.width,
                level.objective.height
            );

            // Draw objective text
            ctx.fillStyle = '#00ff00';
            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(
                'GOAL',
                level.objective.x + level.objective.width / 2,
                level.objective.y - 5
            );
        }
    }
} 