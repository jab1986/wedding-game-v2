/**
 * Game State Management
 * Base class for all game states
 */

export class GameState {
    constructor(game) {
        this.game = game;
        this.isInitialized = false;
    }

    /**
     * Called when entering this state
     */
    enter(previousState = null) {
        if (!this.isInitialized) {
            this.init();
            this.isInitialized = true;
        }
        this.onEnter(previousState);
    }

    /**
     * Called when leaving this state
     */
    exit(nextState = null) {
        this.onExit(nextState);
    }

    /**
     * Initialize state (called once)
     */
    init() {
        // Override in subclasses
    }

    /**
     * Called each time state is entered
     */
    onEnter(previousState) {
        // Override in subclasses
    }

    /**
     * Called each time state is exited
     */
    onExit(nextState) {
        // Override in subclasses
    }

    /**
     * Update state logic
     */
    update(deltaTime) {
        // Override in subclasses
    }

    /**
     * Render state
     */
    render(ctx, interpolation) {
        // Override in subclasses
    }

    /**
     * Handle input
     */
    handleInput(action, pressed) {
        // Override in subclasses
    }
}