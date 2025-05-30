/**
 * Asset Loader - Handles loading and caching of game assets
 * Optimized for SNES-style games with proper error handling
 */

export class AssetLoader {
    constructor() {
        // Asset storage
        this.images = new Map();
        this.audio = new Map();
        this.data = new Map();

        // Loading state
        this.loadingPromises = new Map();
        this.loadedAssets = new Set();
        this.failedAssets = new Set();

        // Cache settings
        this.maxCacheSize = 50 * 1024 * 1024; // 50MB cache limit
        this.currentCacheSize = 0;

        console.log('📦 Asset loader initialized');
    }

    /**
     * Load an asset by type
     */
    async load(type, path, name) {
        const cacheKey = `${type}:${path}`;

        // Return existing promise if already loading
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        // Return cached asset if already loaded
        if (this.loadedAssets.has(cacheKey)) {
            return this.getAsset(type, name);
        }

        // Create loading promise
        const loadingPromise = this.loadAsset(type, path, name);
        this.loadingPromises.set(cacheKey, loadingPromise);

        try {
            const asset = await loadingPromise;
            this.loadedAssets.add(cacheKey);
            this.loadingPromises.delete(cacheKey);
            return asset;
        } catch (error) {
            this.failedAssets.add(cacheKey);
            this.loadingPromises.delete(cacheKey);
            throw error;
        }
    }

    /**
     * Load asset by type
     */
    async loadAsset(type, path, name) {
        switch (type) {
            case 'image':
                return this.loadImage(path, name);
            case 'audio':
                return this.loadAudio(path, name);
            case 'json':
                return this.loadJSON(path, name);
            case 'text':
                return this.loadText(path, name);
            default:
                throw new Error(`Unknown asset type: ${type}`);
        }
    }

    /**
     * Load image asset
     */
    async loadImage(path, name) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                // Store image
                this.images.set(name, img);

                // Update cache size (rough estimate)
                this.currentCacheSize += img.width * img.height * 4; // RGBA

                console.log(`🖼️ Loaded image: ${name} (${img.width}x${img.height})`);
                resolve(img);
            };

            img.onerror = () => {
                const error = new Error(`Failed to load image: ${path}`);
                console.error('❌', error.message);
                reject(error);
            };

            // Set crossOrigin for CORS
            img.crossOrigin = 'anonymous';
            img.src = path;
        });
    }

    /**
     * Load audio asset
     */
    async loadAudio(path, name) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();

            // Store audio data
            this.audio.set(name, {
                buffer: arrayBuffer,
                path: path,
                size: arrayBuffer.byteLength
            });

            // Update cache size
            this.currentCacheSize += arrayBuffer.byteLength;

            console.log(`🔊 Loaded audio: ${name} (${(arrayBuffer.byteLength / 1024).toFixed(1)}KB)`);
            return arrayBuffer;

        } catch (error) {
            const errorMsg = `Failed to load audio: ${path} - ${error.message}`;
            console.error('❌', errorMsg);
            throw new Error(errorMsg);
        }
    }

    /**
     * Load JSON data
     */
    async loadJSON(path, name) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const jsonData = await response.json();

            // Store JSON data
            this.data.set(name, jsonData);

            // Update cache size (rough estimate)
            this.currentCacheSize += JSON.stringify(jsonData).length * 2; // UTF-16

            console.log(`📄 Loaded JSON: ${name}`);
            return jsonData;

        } catch (error) {
            const errorMsg = `Failed to load JSON: ${path} - ${error.message}`;
            console.error('❌', errorMsg);
            throw new Error(errorMsg);
        }
    }

    /**
     * Load text file
     */
    async loadText(path, name) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();

            // Store text data
            this.data.set(name, text);

            // Update cache size
            this.currentCacheSize += text.length * 2; // UTF-16

            console.log(`📝 Loaded text: ${name}`);
            return text;

        } catch (error) {
            const errorMsg = `Failed to load text: ${path} - ${error.message}`;
            console.error('❌', errorMsg);
            throw new Error(errorMsg);
        }
    }

    /**
     * Load multiple assets
     */
    async loadMultiple(assets) {
        const promises = assets.map(asset =>
            this.load(asset.type, asset.path, asset.name)
        );

        try {
            const results = await Promise.allSettled(promises);

            // Log results
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            console.log(`📦 Batch load complete: ${successful} successful, ${failed} failed`);

            // Return results with error info
            return results.map((result, index) => ({
                asset: assets[index],
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason : null
            }));

        } catch (error) {
            console.error('❌ Batch load failed:', error);
            throw error;
        }
    }

    /**
     * Get loaded asset
     */
    getAsset(type, name) {
        switch (type) {
            case 'image':
                return this.images.get(name);
            case 'audio':
                return this.audio.get(name);
            case 'json':
            case 'text':
                return this.data.get(name);
            default:
                return null;
        }
    }

    /**
     * Check if asset is loaded
     */
    isLoaded(type, name) {
        return this.getAsset(type, name) !== undefined;
    }

    /**
     * Get loading progress
     */
    getProgress() {
        const total = this.loadedAssets.size + this.failedAssets.size + this.loadingPromises.size;
        const completed = this.loadedAssets.size + this.failedAssets.size;

        return {
            total,
            completed,
            loading: this.loadingPromises.size,
            failed: this.failedAssets.size,
            percentage: total > 0 ? (completed / total) * 100 : 0
        };
    }

    /**
     * Create sprite from image
     */
    createSprite(imageName, x = 0, y = 0, width = null, height = null) {
        const image = this.images.get(imageName);
        if (!image) {
            console.warn(`⚠️ Image not found: ${imageName}`);
            return null;
        }

        return {
            image,
            x,
            y,
            width: width || image.width,
            height: height || image.height,

            // Render method
            render(ctx, dx, dy, dw = null, dh = null) {
                ctx.drawImage(
                    this.image,
                    this.x, this.y, this.width, this.height,
                    dx, dy, dw || this.width, dh || this.height
                );
            }
        };
    }

    /**
     * Create tileset from image
     */
    createTileset(imageName, tileWidth, tileHeight) {
        const image = this.images.get(imageName);
        if (!image) {
            console.warn(`⚠️ Image not found: ${imageName}`);
            return null;
        }

        const tilesX = Math.floor(image.width / tileWidth);
        const tilesY = Math.floor(image.height / tileHeight);
        const tiles = [];

        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                tiles.push({
                    id: y * tilesX + x,
                    x: x * tileWidth,
                    y: y * tileHeight,
                    width: tileWidth,
                    height: tileHeight
                });
            }
        }

        return {
            image,
            tileWidth,
            tileHeight,
            tilesX,
            tilesY,
            tiles,

            // Get tile by ID
            getTile(id) {
                return this.tiles[id] || null;
            },

            // Render tile
            renderTile(ctx, tileId, dx, dy, scale = 1) {
                const tile = this.getTile(tileId);
                if (!tile) return;

                ctx.drawImage(
                    this.image,
                    tile.x, tile.y, tile.width, tile.height,
                    dx, dy, tile.width * scale, tile.height * scale
                );
            }
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.images.clear();
        this.audio.clear();
        this.data.clear();
        this.loadedAssets.clear();
        this.failedAssets.clear();
        this.loadingPromises.clear();
        this.currentCacheSize = 0;

        console.log('🗑️ Asset cache cleared');
    }

    /**
     * Get cache info
     */
    getCacheInfo() {
        return {
            images: this.images.size,
            audio: this.audio.size,
            data: this.data.size,
            totalAssets: this.loadedAssets.size,
            failedAssets: this.failedAssets.size,
            currentSize: this.currentCacheSize,
            maxSize: this.maxCacheSize,
            usage: (this.currentCacheSize / this.maxCacheSize) * 100
        };
    }

    /**
     * Preload common assets
     */
    async preloadCommon() {
        const commonAssets = [
            // Add your common assets here
            // { type: 'image', path: '/src/assets/sprites/common.png', name: 'common' },
        ];

        if (commonAssets.length === 0) {
            console.log('📦 No common assets to preload');
            return [];
        }

        console.log('📦 Preloading common assets...');
        return this.loadMultiple(commonAssets);
    }
} 