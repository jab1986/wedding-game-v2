/**
 * Collision System
 * Handles collision detection and physics for the game
 */

import { COLLISION_LAYERS } from '../constants.js';

export class CollisionSystem {
    constructor() {
        this.spatialGrid = new Map();
        this.gridSize = 64; // Grid cell size for spatial partitioning
        this.collisionPairs = new Set();
    }

    /**
     * Update collision system
     */
    update(entities) {
        // Clear previous frame data
        this.spatialGrid.clear();
        this.collisionPairs.clear();

        // Build spatial grid
        this.buildSpatialGrid(entities);

        // Check collisions
        this.checkCollisions(entities);
    }

    /**
     * Build spatial partitioning grid
     */
    buildSpatialGrid(entities) {
        for (const entity of entities) {
            if (!entity.solid) continue;

            const bounds = entity.getBounds();
            const startX = Math.floor(bounds.left / this.gridSize);
            const endX = Math.floor(bounds.right / this.gridSize);
            const startY = Math.floor(bounds.top / this.gridSize);
            const endY = Math.floor(bounds.bottom / this.gridSize);

            // Add entity to all grid cells it overlaps
            for (let x = startX; x <= endX; x++) {
                for (let y = startY; y <= endY; y++) {
                    const key = `${x},${y}`;
                    if (!this.spatialGrid.has(key)) {
                        this.spatialGrid.set(key, []);
                    }
                    this.spatialGrid.get(key).push(entity);
                }
            }
        }
    }

    /**
     * Check for collisions using spatial grid
     */
    checkCollisions(entities) {
        const checked = new Set();

        for (const entity of entities) {
            if (!entity.solid) continue;

            const bounds = entity.getBounds();
            const centerX = Math.floor(bounds.centerX / this.gridSize);
            const centerY = Math.floor(bounds.centerY / this.gridSize);

            // Check neighboring cells
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const key = `${centerX + dx},${centerY + dy}`;
                    const cellEntities = this.spatialGrid.get(key);

                    if (!cellEntities) continue;

                    for (const other of cellEntities) {
                        if (entity === other) continue;

                        // Create unique pair ID to avoid duplicate checks
                        const pairId = entity.id < other.id ? 
                            `${entity.id}-${other.id}` : 
                            `${other.id}-${entity.id}`;

                        if (checked.has(pairId)) continue;
                        checked.add(pairId);

                        // Check if entities can collide based on layers
                        if (!this.canCollide(entity, other)) continue;

                        // Perform collision test
                        if (this.testCollision(entity, other)) {
                            this.resolveCollision(entity, other);
                            
                            // Notify entities of collision
                            entity.onCollision(other);
                            other.onCollision(entity);

                            // Store collision pair
                            this.collisionPairs.add([entity, other]);
                        }
                    }
                }
            }
        }
    }

    /**
     * Check if two entities can collide based on layers
     */
    canCollide(entity1, entity2) {
        return (entity1.collisionMask & entity2.collisionLayer) !== 0 &&
               (entity2.collisionMask & entity1.collisionLayer) !== 0;
    }

    /**
     * Test AABB collision between two entities
     */
    testCollision(entity1, entity2) {
        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();

        return bounds1.left < bounds2.right &&
               bounds1.right > bounds2.left &&
               bounds1.top < bounds2.bottom &&
               bounds1.bottom > bounds2.top;
    }

    /**
     * Resolve collision between two entities
     */
    resolveCollision(entity1, entity2) {
        // Skip if either entity is a trigger
        if (entity1.isTrigger || entity2.isTrigger) return;

        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();

        // Calculate overlap
        const overlapX = Math.min(bounds1.right - bounds2.left, bounds2.right - bounds1.left);
        const overlapY = Math.min(bounds1.bottom - bounds2.top, bounds2.bottom - bounds1.top);

        // Separate entities along the axis of least penetration
        if (overlapX < overlapY) {
            // Horizontal separation
            const sign = bounds1.centerX < bounds2.centerX ? -1 : 1;
            const separation = overlapX * sign;

            // Move entities based on their mass (if defined) or equally
            const mass1 = entity1.mass || 1;
            const mass2 = entity2.mass || 1;
            const totalMass = mass1 + mass2;

            if (!entity1.isStatic) {
                entity1.x += separation * (mass2 / totalMass);
            }
            if (!entity2.isStatic) {
                entity2.x -= separation * (mass1 / totalMass);
            }

            // Apply velocity changes
            if (!entity1.isStatic && !entity2.isStatic) {
                const v1 = entity1.vx;
                const v2 = entity2.vx;
                entity1.vx = v2;
                entity2.vx = v1;
            } else if (!entity1.isStatic) {
                entity1.vx = -entity1.vx * entity1.bounciness || 0;
            } else if (!entity2.isStatic) {
                entity2.vx = -entity2.vx * entity2.bounciness || 0;
            }
        } else {
            // Vertical separation
            const sign = bounds1.centerY < bounds2.centerY ? -1 : 1;
            const separation = overlapY * sign;

            // Move entities based on their mass (if defined) or equally
            const mass1 = entity1.mass || 1;
            const mass2 = entity2.mass || 1;
            const totalMass = mass1 + mass2;

            if (!entity1.isStatic) {
                entity1.y += separation * (mass2 / totalMass);
            }
            if (!entity2.isStatic) {
                entity2.y -= separation * (mass1 / totalMass);
            }

            // Apply velocity changes
            if (!entity1.isStatic && !entity2.isStatic) {
                const v1 = entity1.vy;
                const v2 = entity2.vy;
                entity1.vy = v2;
                entity2.vy = v1;
            } else if (!entity1.isStatic) {
                entity1.vy = -entity1.vy * entity1.bounciness || 0;
            } else if (!entity2.isStatic) {
                entity2.vy = -entity2.vy * entity2.bounciness || 0;
            }
        }
    }

    /**
     * Ray cast collision detection
     */
    raycast(origin, direction, maxDistance = Infinity, layerMask = COLLISION_LAYERS.ALL) {
        const normalizedDir = this.normalizeVector(direction);
        const hits = [];

        // Step through ray
        const stepSize = this.gridSize / 2;
        const steps = Math.min(maxDistance / stepSize, 100);

        for (let i = 0; i < steps; i++) {
            const x = origin.x + normalizedDir.x * i * stepSize;
            const y = origin.y + normalizedDir.y * i * stepSize;

            // Check entities at this position
            const gridX = Math.floor(x / this.gridSize);
            const gridY = Math.floor(y / this.gridSize);
            const key = `${gridX},${gridY}`;
            const entities = this.spatialGrid.get(key);

            if (!entities) continue;

            for (const entity of entities) {
                if (!entity.solid) continue;
                if ((entity.collisionLayer & layerMask) === 0) continue;

                const bounds = entity.getBounds();
                if (x >= bounds.left && x <= bounds.right &&
                    y >= bounds.top && y <= bounds.bottom) {
                    hits.push({
                        entity,
                        point: { x, y },
                        distance: Math.sqrt((x - origin.x) ** 2 + (y - origin.y) ** 2)
                    });
                }
            }
        }

        // Sort by distance
        hits.sort((a, b) => a.distance - b.distance);
        return hits;
    }

    /**
     * Check if a point is inside any solid entity
     */
    pointInSolid(x, y, layerMask = COLLISION_LAYERS.ALL) {
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        const key = `${gridX},${gridY}`;
        const entities = this.spatialGrid.get(key);

        if (!entities) return null;

        for (const entity of entities) {
            if (!entity.solid) continue;
            if ((entity.collisionLayer & layerMask) === 0) continue;

            const bounds = entity.getBounds();
            if (x >= bounds.left && x <= bounds.right &&
                y >= bounds.top && y <= bounds.bottom) {
                return entity;
            }
        }

        return null;
    }

    /**
     * Get all entities in a rectangular area
     */
    getEntitiesInRect(x, y, width, height, layerMask = COLLISION_LAYERS.ALL) {
        const results = [];
        const startX = Math.floor(x / this.gridSize);
        const endX = Math.floor((x + width) / this.gridSize);
        const startY = Math.floor(y / this.gridSize);
        const endY = Math.floor((y + height) / this.gridSize);

        const seen = new Set();

        for (let gx = startX; gx <= endX; gx++) {
            for (let gy = startY; gy <= endY; gy++) {
                const key = `${gx},${gy}`;
                const entities = this.spatialGrid.get(key);

                if (!entities) continue;

                for (const entity of entities) {
                    if (seen.has(entity)) continue;
                    seen.add(entity);

                    if ((entity.collisionLayer & layerMask) === 0) continue;

                    const bounds = entity.getBounds();
                    if (bounds.right >= x && bounds.left <= x + width &&
                        bounds.bottom >= y && bounds.top <= y + height) {
                        results.push(entity);
                    }
                }
            }
        }

        return results;
    }

    /**
     * Normalize a vector
     */
    normalizeVector(vector) {
        const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);
        if (magnitude === 0) return { x: 0, y: 0 };
        return {
            x: vector.x / magnitude,
            y: vector.y / magnitude
        };
    }

    /**
     * Debug render collision bounds
     */
    debugRender(ctx, camera = { x: 0, y: 0 }) {
        // Render spatial grid
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.lineWidth = 1;

        for (const [key, entities] of this.spatialGrid) {
            if (entities.length === 0) continue;

            const [x, y] = key.split(',').map(Number);
            ctx.strokeRect(
                x * this.gridSize - camera.x,
                y * this.gridSize - camera.y,
                this.gridSize,
                this.gridSize
            );
        }

        // Render collision pairs
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;

        for (const [entity1, entity2] of this.collisionPairs) {
            const bounds1 = entity1.getBounds();
            const bounds2 = entity2.getBounds();

            ctx.beginPath();
            ctx.moveTo(bounds1.centerX - camera.x, bounds1.centerY - camera.y);
            ctx.lineTo(bounds2.centerX - camera.x, bounds2.centerY - camera.y);
            ctx.stroke();
        }
    }
}