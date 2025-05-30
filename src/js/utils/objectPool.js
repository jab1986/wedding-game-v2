/**
 * Object Pool
 * Manages reusable objects to reduce garbage collection
 */

export class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.available = [];
        this.active = new Set();

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.available.push(this.createFn());
        }
    }

    /**
     * Get an object from the pool
     */
    acquire(...args) {
        let obj;

        if (this.available.length > 0) {
            obj = this.available.pop();
        } else {
            obj = this.createFn();
        }

        // Reset and initialize the object
        this.resetFn(obj, ...args);
        this.active.add(obj);

        return obj;
    }

    /**
     * Return an object to the pool
     */
    release(obj) {
        if (!this.active.has(obj)) return;

        this.active.delete(obj);
        this.available.push(obj);
    }

    /**
     * Release all active objects
     */
    releaseAll() {
        for (const obj of this.active) {
            this.available.push(obj);
        }
        this.active.clear();
    }

    /**
     * Get pool statistics
     */
    getStats() {
        return {
            available: this.available.length,
            active: this.active.size,
            total: this.available.length + this.active.size
        };
    }

    /**
     * Clear the pool
     */
    clear() {
        this.available = [];
        this.active.clear();
    }
}

/**
 * Particle Pool - Specialized pool for particle effects
 */
export class ParticlePool extends ObjectPool {
    constructor(initialSize = 50) {
        super(
            // Create function
            () => ({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                life: 0,
                maxLife: 0,
                size: 1,
                color: '#FFFFFF',
                alpha: 1,
                isDead: false
            }),
            // Reset function
            (particle, x, y, vx, vy, life, size, color) => {
                particle.x = x;
                particle.y = y;
                particle.vx = vx;
                particle.vy = vy;
                particle.life = life;
                particle.maxLife = life;
                particle.size = size || 1;
                particle.color = color || '#FFFFFF';
                particle.alpha = 1;
                particle.isDead = false;
            },
            initialSize
        );
    }

    /**
     * Update all active particles
     */
    updateAll(deltaTime) {
        const toRelease = [];

        for (const particle of this.active) {
            // Update position
            particle.x += particle.vx * deltaTime / 1000;
            particle.y += particle.vy * deltaTime / 1000;

            // Update life
            particle.life -= deltaTime;
            
            // Update alpha based on life
            particle.alpha = Math.max(0, particle.life / particle.maxLife);

            // Mark dead particles
            if (particle.life <= 0) {
                particle.isDead = true;
                toRelease.push(particle);
            }
        }

        // Release dead particles
        for (const particle of toRelease) {
            this.release(particle);
        }
    }

    /**
     * Render all active particles
     */
    renderAll(ctx, camera = { x: 0, y: 0 }) {
        ctx.save();

        for (const particle of this.active) {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            
            const screenX = particle.x - camera.x;
            const screenY = particle.y - camera.y;

            // Simple square particle
            ctx.fillRect(
                screenX - particle.size / 2,
                screenY - particle.size / 2,
                particle.size,
                particle.size
            );
        }

        ctx.restore();
    }
}

/**
 * Projectile Pool - Specialized pool for projectiles
 */
export class ProjectilePool extends ObjectPool {
    constructor(initialSize = 20) {
        super(
            // Create function
            () => ({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                damage: 0,
                owner: null,
                type: 'projectile',
                width: 8,
                height: 8,
                isDead: false,
                lifetime: 0,
                maxLifetime: 0
            }),
            // Reset function
            (projectile, x, y, vx, vy, damage, owner, lifetime = 2000) => {
                projectile.x = x;
                projectile.y = y;
                projectile.vx = vx;
                projectile.vy = vy;
                projectile.damage = damage;
                projectile.owner = owner;
                projectile.isDead = false;
                projectile.lifetime = lifetime;
                projectile.maxLifetime = lifetime;
            },
            initialSize
        );
    }

    /**
     * Update all active projectiles
     */
    updateAll(deltaTime, collisionSystem, entityManager) {
        const toRelease = [];

        for (const projectile of this.active) {
            // Update position
            projectile.x += projectile.vx * deltaTime / 1000;
            projectile.y += projectile.vy * deltaTime / 1000;

            // Update lifetime
            projectile.lifetime -= deltaTime;

            // Check if out of bounds or expired
            if (projectile.lifetime <= 0 ||
                projectile.x < -50 || projectile.x > 306 ||
                projectile.y < -50 || projectile.y > 274) {
                projectile.isDead = true;
                toRelease.push(projectile);
                continue;
            }

            // Check collisions
            const hit = collisionSystem.pointInSolid(
                projectile.x + projectile.width / 2,
                projectile.y + projectile.height / 2
            );

            if (hit && hit !== projectile.owner) {
                // Apply damage if entity has health
                if (hit.health !== undefined) {
                    hit.health -= projectile.damage;
                }

                // Mark projectile for removal
                projectile.isDead = true;
                toRelease.push(projectile);
            }
        }

        // Release dead projectiles
        for (const projectile of toRelease) {
            this.release(projectile);
        }
    }

    /**
     * Render all active projectiles
     */
    renderAll(ctx, camera = { x: 0, y: 0 }) {
        ctx.save();
        ctx.fillStyle = '#FFFF00'; // Yellow projectiles

        for (const projectile of this.active) {
            const screenX = projectile.x - camera.x;
            const screenY = projectile.y - camera.y;

            // Simple projectile rendering
            ctx.fillRect(screenX, screenY, projectile.width, projectile.height);
        }

        ctx.restore();
    }
}

/**
 * Generic pool factory
 */
export class PoolFactory {
    static pools = new Map();

    /**
     * Create or get a pool for a specific type
     */
    static getPool(type, createFn, resetFn, initialSize = 10) {
        if (!this.pools.has(type)) {
            this.pools.set(type, new ObjectPool(createFn, resetFn, initialSize));
        }
        return this.pools.get(type);
    }

    /**
     * Clear all pools
     */
    static clearAll() {
        for (const pool of this.pools.values()) {
            pool.clear();
        }
        this.pools.clear();
    }

    /**
     * Get statistics for all pools
     */
    static getAllStats() {
        const stats = {};
        for (const [type, pool] of this.pools) {
            stats[type] = pool.getStats();
        }
        return stats;
    }
}