# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a retro SNES-style wedding game built with vanilla JavaScript, Vite, and modern web technologies. The game targets 256x224 resolution with pixel-perfect rendering and 60 FPS performance.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Serve production build on port 3000
npm run serve
```

## Architecture

### Core Systems
- **GameApp** (`src/js/main.js`): Main application entry point, handles initialization, game loop with fixed timestep (16.67ms), canvas setup, and mobile optimizations
- **Game** (`src/js/game.js`): Core game logic, state management (menu/playing/paused/gameover), entity management, and camera system
- **Entity System** (`src/js/entities/`): Base Entity class with position, movement, sprite rendering, collision detection, and lifecycle management
- **Input System** (`src/js/systems/input.js`): Unified keyboard and touch input with SNES controller mapping (D-pad, A/B buttons)
- **Audio System** (`src/js/systems/audio.js`): Web Audio API implementation with 32kHz sample rate and 8-channel mixing
- **Asset Management** (`src/js/utils/assetLoader.js`): Batch loading, caching, and sprite/tileset creation

### File Structure
- `src/js/entities/`: Game objects (Player, etc.) inheriting from base Entity class
- `src/js/systems/`: Core systems (input, audio) with manager classes
- `src/js/utils/`: Utilities (asset loading, math helpers)
- `src/assets/`: Game assets organized by type (sprites/, tilesets/, music/, sfx/)

### Technical Constraints
- **SNES Specifications**: 256x224 resolution, 60 FPS, 16x16 or 32x32 pixel sprites
- **Mobile-First**: Touch controls, landscape orientation lock, battery efficiency
- **Performance**: Fixed timestep physics, object pooling for particles, no memory leaks
- **PWA Support**: Offline capability, add to home screen, fullscreen display

### Key Patterns
- ES6 modules with index.js barrel exports
- Manager classes for systems (InputManager, AudioManager, AssetLoader)
- Entity-component pattern with base Entity class
- Fixed timestep game loop with interpolation for smooth rendering
- Mobile detection and optimization throughout codebase

### Wedding Game Mechanics
- Player character with 8-directional movement and animation states
- Happiness and Energy stat management (decreases over time, regenerates when idle)
- Ring collection and marriage mechanics as win conditions
- Particle effects and visual feedback for player actions
- Save state persistence (planned feature)

## Mobile Development Notes
- Touch controls with virtual D-pad and action buttons (44px minimum touch targets)
- Orientation lock to landscape, gesture prevention, wake lock to prevent sleep
- Audio context unlock handling for mobile browsers
- Battery-efficient rendering with visibility API auto-pause