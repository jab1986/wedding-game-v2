export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    drawCharacter(character, interpolation = 0) {
        if (!character) return;

        const ctx = this.ctx;

        // Simple rectangle representation for now
        ctx.fillStyle = character.color || '#ff0000';
        ctx.fillRect(
            character.x,
            character.y,
            character.width || 32,
            character.height || 48
        );

        // Draw name above character
        if (character.name) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(
                character.name.toUpperCase(),
                character.x + (character.width || 32) / 2,
                character.y - 5
            );
        }
    }

    drawBoss(boss, interpolation = 0) {
        if (!boss) return;

        const ctx = this.ctx;

        // Draw boss as larger rectangle
        ctx.fillStyle = boss.color || '#ff0000';
        ctx.fillRect(
            boss.x,
            boss.y,
            boss.width || 64,
            boss.height || 64
        );

        // Draw boss name
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(
            'JOE',
            boss.x + (boss.width || 64) / 2,
            boss.y - 5
        );
    }

    drawProjectile(projectile) {
        if (!projectile) return;

        const ctx = this.ctx;

        ctx.fillStyle = projectile.color || '#ffff00';
        ctx.fillRect(
            projectile.x,
            projectile.y,
            projectile.width || 8,
            projectile.height || 8
        );
    }
} 