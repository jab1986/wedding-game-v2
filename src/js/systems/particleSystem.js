export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createParticles(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                color: color,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * 4 + 2
            });
        }
    }

    update(dt) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.life -= particle.decay;

            return particle.life > 0;
        });
    }

    render(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2,
                particle.size,
                particle.size
            );
            ctx.restore();
        });
    }
} 