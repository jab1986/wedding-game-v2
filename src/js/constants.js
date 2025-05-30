// src/js/constants.js

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const GAME_STATES = {
    START: 'start',
    PLAYING: 'playing',
    DIALOGUE: 'dialogue',
    BOSS_FIGHT: 'boss_fight',
    END: 'end',
    GAME_OVER: 'game_over'
};

export const PHYSICS = {
    GRAVITY: 980,
    JUMP_VELOCITY: -500,
    PLAYER_SPEED: 180,
    JENNY_FOLLOW_SPEED: 144,
    JENNY_FOLLOW_DISTANCE: 50
};

export const COLORS = {
    MARK: {
        BODY: '#000000',
        ACCENT: '#8b00ff',
        SKIN: '#fdbcb4'
    },
    JENNY: {
        BODY: '#228b22',
        ACCENT: '#ffd700',
        SKIN: '#fdbcb4',
        HAIR: '#654321'
    },
    JOE: {
        NORMAL: '#4169e1',
        TRANSFORMED: '#ff0000',
        SKIN: '#fdbcb4'
    }
};

export const COMBAT = {
    MARK_DAMAGE: 10,
    MARK_ATTACK_COOLDOWN: 30,
    JOE_HEALTH: 100,
    JOE_PHASE2_THRESHOLD: 50,
    PROJECTILE_SPEED: 300,
    PROJECTILE_DAMAGE: 10,
    PROJECTILE_DAMAGE_PHASE2: 15
};

export const PLAYER = {
    WIDTH: 32,
    HEIGHT: 48,
    SPEED: 120,
    MAX_SPEED: 180,
    ACCELERATION: 800,
    INITIAL_HAPPINESS: 100,
    INITIAL_ENERGY: 100,
    ENERGY_DECAY_RATE: 0.1,
    ENERGY_REGEN_RATE: 0.2,
    HAPPINESS_DECAY_RATE: 0.05
};

export const COLLISION_LAYERS = {
    NONE: 0,
    PLAYER: 1,
    ENEMY: 2,
    WALL: 4,
    ITEM: 8,
    TRIGGER: 16,
    ALL: 255
};

export const ANIMATION_SPEEDS = {
    IDLE: 8,
    WALK: 12,
    RUN: 16,
    DANCE: 6
};