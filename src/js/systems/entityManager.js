/**
 * Entity Manager
 * Manages entity lifecycle, updates, and queries
 */

export class EntityManager {
    constructor() {
        this.entities = new Map();
        this.entitiesByType = new Map();
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
        this.nextId = 1;
        this.isUpdating = false;
    }

    /**
     * Add entity to manager
     */
    addEntity(entity) {
        // Assign unique ID if not present
        if (!entity.id) {
            entity.id = this.nextId++;
        }

        // Queue entity if we're currently updating
        if (this.isUpdating) {
            this.entitiesToAdd.push(entity);
            return entity;
        }

        // Add to main collection
        this.entities.set(entity.id, entity);

        // Add to type collection
        if (!this.entitiesByType.has(entity.type)) {
            this.entitiesByType.set(entity.type, new Set());
        }
        this.entitiesByType.get(entity.type).add(entity);

        // Call entity's onAdded lifecycle method
        if (entity.onAdded) {
            entity.onAdded(this);
        }

        return entity;
    }

    /**
     * Remove entity from manager
     */
    removeEntity(entity) {
        if (!entity || !this.entities.has(entity.id)) return;

        // Queue removal if we're currently updating
        if (this.isUpdating) {
            this.entitiesToRemove.push(entity);
            return;
        }

        // Call entity's onRemoved lifecycle method
        if (entity.onRemoved) {
            entity.onRemoved(this);
        }

        // Remove from collections
        this.entities.delete(entity.id);
        
        const typeSet = this.entitiesByType.get(entity.type);
        if (typeSet) {
            typeSet.delete(entity);
            if (typeSet.size === 0) {
                this.entitiesByType.delete(entity.type);
            }
        }
    }

    /**
     * Get entity by ID
     */
    getEntity(id) {
        return this.entities.get(id);
    }

    /**
     * Get all entities
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }

    /**
     * Get entities by type
     */
    getEntitiesByType(type) {
        const typeSet = this.entitiesByType.get(type);
        return typeSet ? Array.from(typeSet) : [];
    }

    /**
     * Get entities by multiple types
     */
    getEntitiesByTypes(...types) {
        const results = [];
        for (const type of types) {
            results.push(...this.getEntitiesByType(type));
        }
        return results;
    }

    /**
     * Query entities with a predicate function
     */
    queryEntities(predicate) {
        const results = [];
        for (const entity of this.entities.values()) {
            if (predicate(entity)) {
                results.push(entity);
            }
        }
        return results;
    }

    /**
     * Find first entity matching predicate
     */
    findEntity(predicate) {
        for (const entity of this.entities.values()) {
            if (predicate(entity)) {
                return entity;
            }
        }
        return null;
    }

    /**
     * Get entities within radius of a point
     */
    getEntitiesInRadius(x, y, radius, filter = null) {
        const radiusSquared = radius * radius;
        const results = [];

        for (const entity of this.entities.values()) {
            if (filter && !filter(entity)) continue;

            const dx = entity.x - x;
            const dy = entity.y - y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared <= radiusSquared) {
                results.push({
                    entity,
                    distance: Math.sqrt(distanceSquared)
                });
            }
        }

        // Sort by distance
        results.sort((a, b) => a.distance - b.distance);
        return results.map(r => r.entity);
    }

    /**
     * Get entities within a rectangle
     */
    getEntitiesInRect(x, y, width, height, filter = null) {
        const results = [];

        for (const entity of this.entities.values()) {
            if (filter && !filter(entity)) continue;

            const bounds = entity.getBounds();
            if (bounds.right >= x && bounds.left <= x + width &&
                bounds.bottom >= y && bounds.top <= y + height) {
                results.push(entity);
            }
        }

        return results;
    }

    /**
     * Update all entities
     */
    update(deltaTime) {
        this.isUpdating = true;

        // Update all active entities
        for (const entity of this.entities.values()) {
            if (!entity.isActive) continue;

            entity.update(deltaTime);

            // Mark dead entities for removal
            if (entity.isDead) {
                this.entitiesToRemove.push(entity);
            }
        }

        this.isUpdating = false;

        // Process queued additions
        for (const entity of this.entitiesToAdd) {
            this.addEntity(entity);
        }
        this.entitiesToAdd = [];

        // Process queued removals
        for (const entity of this.entitiesToRemove) {
            this.removeEntity(entity);
        }
        this.entitiesToRemove = [];
    }

    /**
     * Render all visible entities
     */
    render(ctx, interpolation = 0, camera = { x: 0, y: 0 }) {
        // Get all visible entities
        const visibleEntities = this.queryEntities(entity => entity.isVisible);

        // Sort by depth (z-order)
        visibleEntities.sort((a, b) => (a.depth || 0) - (b.depth || 0));

        // Render each entity
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        for (const entity of visibleEntities) {
            // Frustum culling - skip entities outside camera view
            const bounds = entity.getBounds();
            if (bounds.right < camera.x || 
                bounds.left > camera.x + ctx.canvas.width ||
                bounds.bottom < camera.y || 
                bounds.top > camera.y + ctx.canvas.height) {
                continue;
            }

            entity.render(ctx, interpolation);
        }

        ctx.restore();
    }

    /**
     * Clear all entities
     */
    clear() {
        // Call onRemoved for all entities
        for (const entity of this.entities.values()) {
            if (entity.onRemoved) {
                entity.onRemoved(this);
            }
        }

        this.entities.clear();
        this.entitiesByType.clear();
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
    }

    /**
     * Get statistics about entities
     */
    getStats() {
        const stats = {
            total: this.entities.size,
            active: 0,
            visible: 0,
            byType: {}
        };

        for (const entity of this.entities.values()) {
            if (entity.isActive) stats.active++;
            if (entity.isVisible) stats.visible++;
        }

        for (const [type, entities] of this.entitiesByType) {
            stats.byType[type] = entities.size;
        }

        return stats;
    }

    /**
     * Serialize entities for save/load
     */
    serialize() {
        const data = [];
        for (const entity of this.entities.values()) {
            if (entity.serialize) {
                data.push({
                    type: entity.type,
                    data: entity.serialize()
                });
            }
        }
        return data;
    }

    /**
     * Deserialize entities from save data
     */
    deserialize(data, entityFactory) {
        this.clear();

        for (const item of data) {
            const entity = entityFactory.create(item.type, item.data);
            if (entity) {
                this.addEntity(entity);
            }
        }
    }
}