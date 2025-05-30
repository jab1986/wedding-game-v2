/**
 * Math Utilities - SNES Game Math Functions
 * Common mathematical operations for game development
 */

export class MathUtils {
    /**
     * Clamp value between min and max
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Linear interpolation
     */
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Smooth step interpolation
     */
    static smoothStep(start, end, t) {
        t = this.clamp((t - start) / (end - start), 0, 1);
        return t * t * (3 - 2 * t);
    }

    /**
     * Distance between two points
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Squared distance (faster, no sqrt)
     */
    static distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    /**
     * Angle between two points (in radians)
     */
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Normalize angle to 0-2π range
     */
    static normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }

    /**
     * Convert degrees to radians
     */
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convert radians to degrees
     */
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Random integer between min and max (inclusive)
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Random float between min and max
     */
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Random boolean with given probability
     */
    static randomBool(probability = 0.5) {
        return Math.random() < probability;
    }

    /**
     * Pick random element from array
     */
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Check if point is inside rectangle
     */
    static pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    /**
     * Check if two rectangles overlap
     */
    static rectOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    /**
     * Check if point is inside circle
     */
    static pointInCircle(px, py, cx, cy, radius) {
        return this.distanceSquared(px, py, cx, cy) <= radius * radius;
    }

    /**
     * Wrap value around bounds (for screen wrapping)
     */
    static wrap(value, min, max) {
        const range = max - min;
        if (value < min) return max - (min - value) % range;
        if (value >= max) return min + (value - max) % range;
        return value;
    }

    /**
     * Snap value to grid
     */
    static snapToGrid(value, gridSize) {
        return Math.round(value / gridSize) * gridSize;
    }

    /**
     * Ease in (quadratic)
     */
    static easeIn(t) {
        return t * t;
    }

    /**
     * Ease out (quadratic)
     */
    static easeOut(t) {
        return 1 - (1 - t) * (1 - t);
    }

    /**
     * Ease in-out (quadratic)
     */
    static easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
    }

    /**
     * Bounce ease out
     */
    static bounceOut(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }

    /**
     * Move towards target with max distance
     */
    static moveTowards(current, target, maxDelta) {
        const diff = target - current;
        if (Math.abs(diff) <= maxDelta) {
            return target;
        }
        return current + Math.sign(diff) * maxDelta;
    }

    /**
     * Rotate towards target angle with max rotation
     */
    static rotateTowards(current, target, maxDelta) {
        const diff = this.normalizeAngle(target - current);
        const adjustedDiff = diff > Math.PI ? diff - Math.PI * 2 : diff;

        if (Math.abs(adjustedDiff) <= maxDelta) {
            return target;
        }

        return this.normalizeAngle(current + Math.sign(adjustedDiff) * maxDelta);
    }

    /**
     * Calculate 2D vector magnitude
     */
    static vectorMagnitude(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    /**
     * Normalize 2D vector
     */
    static normalizeVector(x, y) {
        const magnitude = this.vectorMagnitude(x, y);
        if (magnitude === 0) return { x: 0, y: 0 };
        return { x: x / magnitude, y: y / magnitude };
    }

    /**
     * Dot product of two 2D vectors
     */
    static dotProduct(x1, y1, x2, y2) {
        return x1 * x2 + y1 * y2;
    }

    /**
     * Cross product of two 2D vectors (returns scalar)
     */
    static crossProduct(x1, y1, x2, y2) {
        return x1 * y2 - y1 * x2;
    }

    /**
     * Reflect vector off surface normal
     */
    static reflect(vx, vy, nx, ny) {
        const dot = this.dotProduct(vx, vy, nx, ny);
        return {
            x: vx - 2 * dot * nx,
            y: vy - 2 * dot * ny
        };
    }
} 