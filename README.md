# Wedding Game - SNES Style 💒

A retro SNES-style wedding game built with vanilla JavaScript, Vite, and modern web technologies. Experience the charm of 16-bit era gaming with pixel-perfect graphics, authentic audio, and responsive mobile controls.

## 🎮 Features

### SNES Authenticity
- **256x224 resolution** with pixel-perfect rendering
- **16-color palette** limitations per sprite
- **60 FPS** fixed timestep game loop
- **SNES-style audio** with Web Audio API
- **Mode 7-inspired** effects for special scenes

### Mobile-First Design
- **Touch controls** with virtual D-pad and action buttons
- **Landscape orientation** lock
- **PWA support** for app-like experience
- **Battery-efficient** rendering
- **Auto-pause** on visibility change

### Game Features
- **Player character** with 8-directional movement
- **Animation system** with state-based sprites
- **Wedding mechanics** (ring collection, marriage, happiness)
- **Energy and happiness** stat management
- **Particle effects** and visual feedback
- **Save state persistence** (coming soon)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd wedding-game-v2

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:3000`

### Build for Production

```bash
# Build optimized version
npm run build

# Preview production build
npm run preview
```

## 🎯 Controls

### Keyboard
- **Arrow Keys / WASD**: Move player
- **Z / Space**: Action button (A)
- **X / Shift**: Dance button (B)
- **Enter**: Start game / Confirm
- **Escape**: Pause / Menu

### Mobile Touch
- **Virtual D-Pad**: Movement
- **A Button**: Action/Interact
- **B Button**: Dance/Secondary action

## 📁 Project Structure

```
wedding-game-v2/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── favicon.ico           # Game icon
├── src/
│   ├── assets/               # Game assets
│   │   ├── sprites/          # Character and object sprites
│   │   ├── tilesets/         # Background tilesets
│   │   ├── music/            # Background music
│   │   └── sfx/              # Sound effects
│   ├── css/
│   │   └── game.css          # SNES-style CSS with mobile optimization
│   └── js/
│       ├── main.js           # Application entry point
│       ├── game.js           # Core game logic
│       ├── entities/         # Game objects
│       │   ├── entity.js     # Base entity class
│       │   ├── player.js     # Player character
│       │   └── index.js      # Entity exports
│       ├── systems/          # Game systems
│       │   ├── input.js      # Input management
│       │   ├── audio.js      # Audio management
│       │   └── index.js      # System exports
│       └── utils/            # Utilities
│           ├── assetLoader.js # Asset loading
│           ├── math.js       # Math utilities
│           └── index.js      # Utility exports
├── index.html                # Main HTML file
├── package.json              # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── .cursorrules             # Development guidelines
```

## 🎨 Development Guidelines

### SNES Specifications
- **Resolution**: 256x224 pixels (4:3 aspect ratio)
- **Colors**: Maximum 256 colors per scene
- **Sprites**: 16x16 or 32x32 pixel sprites
- **Tiles**: 16x16 pixel tiles for backgrounds
- **Animation**: 12 FPS for character animations
- **Audio**: 32kHz sample rate, 8 channels

### Code Standards
- **ES6 modules** for organization
- **Functions under 50 lines**
- **Comprehensive commenting**
- **Object pools** for particles/projectiles
- **Fixed timestep physics** (16.67ms)

### Performance Requirements
- **60 FPS** on iPhone 8+
- **Touch response** under 100ms
- **Memory efficient** (no leaks after 10min)
- **5MB maximum** initial load
- **Batch rendering** for sprites

## 🎮 Game Architecture

### Entity System
All game objects inherit from the base `Entity` class:
- **Position and movement** with interpolation
- **Sprite rendering** with animation support
- **Collision detection** with layers and masks
- **Lifecycle management** (update/render/destroy)

### Input System
Unified input handling for keyboard and touch:
- **SNES controller mapping** (D-pad, A/B, Start/Select)
- **Touch control integration**
- **Input state tracking** (current/previous frame)
- **Event system** for input callbacks

### Audio System
SNES-authentic audio with modern web APIs:
- **Web Audio API** implementation
- **32kHz sample rate** matching SNES
- **8-channel mixing**
- **Mobile audio unlocking**
- **Dynamic music layers**

### Asset Management
Efficient loading and caching:
- **Batch loading** with progress tracking
- **Smart caching** with size limits
- **Sprite and tileset** creation helpers
- **Error handling** with retry logic

## 🎯 Wedding Game Mechanics

### Player Stats
- **Happiness**: Decreases over time, increases with positive actions
- **Energy**: Depletes with movement, regenerates when idle
- **Ring Status**: Required for marriage
- **Marriage Status**: Win condition

### Game Flow
1. **Menu Screen**: Start game, view controls
2. **Gameplay**: Move around, collect ring, find partner
3. **Wedding**: Complete ceremony to win
4. **Game Over**: Happiness reaches zero

### Actions
- **Movement**: 8-directional with smooth animation
- **Dancing**: Increases happiness, shows particle effects
- **Ring Collection**: Enables marriage option
- **Interaction**: Context-sensitive actions

## 🔧 Customization

### Adding New Entities
```javascript
import { Entity } from './entities/entity.js';

export class MyEntity extends Entity {
    constructor(x, y) {
        super(x, y);
        this.type = 'myentity';
        // Custom properties
    }
    
    onUpdate(deltaTime) {
        // Custom update logic
    }
}
```

### Adding Audio
```javascript
// Load audio file
await audioManager.loadAudio('/path/to/sound.mp3', 'soundName', 'sfx');

// Play sound
audioManager.playSound('soundName', volume, pitch, loop);
```

### Adding Sprites
```javascript
// Load sprite image
await assetLoader.load('image', '/path/to/sprite.png', 'spriteName');

// Create sprite
const sprite = assetLoader.createSprite('spriteName', x, y, width, height);
entity.setSprite(sprite);
```

## 📱 Mobile Optimization

### Touch Controls
- **44px minimum** touch targets
- **Visual feedback** on press
- **Gesture prevention** (zoom, scroll)
- **Orientation lock** to landscape

### Performance
- **Battery efficient** rendering
- **Wake lock** to prevent sleep
- **Visibility API** for auto-pause
- **Memory management** for long sessions

### PWA Features
- **Offline capable** (when assets cached)
- **Add to home screen**
- **Fullscreen display**
- **App-like experience**

## 🐛 Debugging

### Debug Mode
Enable debug rendering:
```javascript
window.DEBUG_ENTITIES = true; // Show entity bounds and vectors
```

### Console Commands
```javascript
// Access game instance
window.GameApp.game.player.happiness = 100;
window.GameApp.game.player.pickupRing();
window.GameApp.game.player.marry();
```

### Performance Monitoring
- Check browser DevTools Performance tab
- Monitor memory usage over time
- Verify 60 FPS in game loop
- Test touch responsiveness

## 🤝 Contributing

1. Follow the `.cursorrules` development guidelines
2. Test on both desktop and mobile
3. Maintain SNES authenticity
4. Keep performance optimized
5. Document new features

## 📄 License

This project is licensed under the ISC License.

## 🎉 Credits

Made with ❤️ using:
- **Vite** for build tooling
- **Web Audio API** for authentic sound
- **Canvas 2D** for pixel-perfect rendering
- **PWA** technologies for mobile experience

---

*Experience the magic of retro gaming with modern web technology! 🎮✨* 