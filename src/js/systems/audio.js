/**
 * Audio Manager - Handles SNES-style audio
 * Web Audio API with mobile compatibility
 */

export class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;

        // Audio state
        this.isUnlocked = false;
        this.isMuted = false;
        this.masterVolume = 1.0;
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;

        // Audio sources
        this.sounds = new Map();
        this.music = new Map();
        this.currentMusic = null;
        this.musicSource = null;

        // SNES audio specifications
        this.sampleRate = 32000; // SNES sample rate
        this.channels = 8; // SNES sound channels

        this.init();
    }

    /**
     * Initialize audio system
     */
    async init() {
        try {
            // Create audio context
            this.context = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.sampleRate
            });

            // Create gain nodes
            this.masterGain = this.context.createGain();
            this.musicGain = this.context.createGain();
            this.sfxGain = this.context.createGain();

            // Connect gain nodes
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.context.destination);

            // Set initial volumes
            this.updateVolumes();

            console.log('🔊 Audio manager initialized');

        } catch (error) {
            console.warn('⚠️ Audio initialization failed:', error);
        }
    }

    /**
     * Unlock audio context (required for mobile)
     */
    unlock() {
        if (this.isUnlocked || !this.context) return;

        // Resume audio context
        if (this.context.state === 'suspended') {
            this.context.resume().then(() => {
                this.isUnlocked = true;
                console.log('🔊 Audio context unlocked');
            });
        } else {
            this.isUnlocked = true;
        }
    }

    /**
     * Load audio file
     */
    async loadAudio(url, name, type = 'sfx') {
        if (!this.context) return null;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

            const audioData = {
                buffer: audioBuffer,
                type: type,
                volume: 1.0
            };

            if (type === 'music') {
                this.music.set(name, audioData);
            } else {
                this.sounds.set(name, audioData);
            }

            console.log(`🔊 Loaded ${type}: ${name}`);
            return audioData;

        } catch (error) {
            console.warn(`⚠️ Failed to load audio: ${url}`, error);
            return null;
        }
    }

    /**
     * Play sound effect
     */
    playSound(name, volume = 1.0, pitch = 1.0, loop = false) {
        if (!this.context || !this.isUnlocked || this.isMuted) return null;

        const sound = this.sounds.get(name);
        if (!sound) {
            console.warn(`⚠️ Sound not found: ${name}`);
            return null;
        }

        try {
            // Create source
            const source = this.context.createBufferSource();
            source.buffer = sound.buffer;
            source.loop = loop;

            // Create gain for this instance
            const gain = this.context.createGain();
            gain.gain.value = volume * sound.volume;

            // Apply pitch (playback rate)
            source.playbackRate.value = pitch;

            // Connect nodes
            source.connect(gain);
            gain.connect(this.sfxGain);

            // Play
            source.start();

            return source;

        } catch (error) {
            console.warn(`⚠️ Failed to play sound: ${name}`, error);
            return null;
        }
    }

    /**
     * Play music (with looping)
     */
    playMusic(name, volume = 1.0, fadeIn = false) {
        if (!this.context || !this.isUnlocked) return;

        // Stop current music
        this.stopMusic();

        const music = this.music.get(name);
        if (!music) {
            console.warn(`⚠️ Music not found: ${name}`);
            return;
        }

        try {
            // Create source
            this.musicSource = this.context.createBufferSource();
            this.musicSource.buffer = music.buffer;
            this.musicSource.loop = true;

            // Create gain for this music
            const musicInstanceGain = this.context.createGain();
            musicInstanceGain.gain.value = fadeIn ? 0 : volume * music.volume;

            // Connect nodes
            this.musicSource.connect(musicInstanceGain);
            musicInstanceGain.connect(this.musicGain);

            // Fade in if requested
            if (fadeIn) {
                musicInstanceGain.gain.linearRampToValueAtTime(
                    volume * music.volume,
                    this.context.currentTime + 2.0
                );
            }

            // Play
            this.musicSource.start();
            this.currentMusic = name;

            console.log(`🎵 Playing music: ${name}`);

        } catch (error) {
            console.warn(`⚠️ Failed to play music: ${name}`, error);
        }
    }

    /**
     * Stop current music
     */
    stopMusic(fadeOut = false) {
        if (!this.musicSource) return;

        try {
            if (fadeOut && this.context) {
                // Fade out over 1 second
                const gain = this.musicSource.connect(this.context.createGain());
                gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 1.0);

                setTimeout(() => {
                    if (this.musicSource) {
                        this.musicSource.stop();
                        this.musicSource = null;
                        this.currentMusic = null;
                    }
                }, 1000);
            } else {
                this.musicSource.stop();
                this.musicSource = null;
                this.currentMusic = null;
            }

        } catch (error) {
            console.warn('⚠️ Error stopping music:', error);
            this.musicSource = null;
            this.currentMusic = null;
        }
    }

    /**
     * Pause all audio
     */
    pauseAll() {
        if (!this.context) return;

        this.context.suspend();
    }

    /**
     * Resume all audio
     */
    resumeAll() {
        if (!this.context) return;

        this.context.resume();
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    /**
     * Set SFX volume
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateVolumes();
        return this.isMuted;
    }

    /**
     * Start default background music
     */
    startMusic() {
        // For now, just unlock audio context and create a simple background tone
        this.unlock();

        // Create a simple background music using square waves
        if (this.context && this.isUnlocked) {
            // Play a simple chord progression
            this.createSquareWave(220, 2.0, 0.1); // A
            setTimeout(() => this.createSquareWave(261.63, 2.0, 0.1), 2000); // C
            setTimeout(() => this.createSquareWave(329.63, 2.0, 0.1), 4000); // E
            setTimeout(() => this.createSquareWave(220, 2.0, 0.1), 6000); // A
        }
    }

    /**
     * Update volume levels
     */
    updateVolumes() {
        if (!this.masterGain || !this.musicGain || !this.sfxGain) return;

        const masterVol = this.isMuted ? 0 : this.masterVolume;

        this.masterGain.gain.value = masterVol;
        this.musicGain.gain.value = this.musicVolume;
        this.sfxGain.gain.value = this.sfxVolume;
    }

    /**
     * Create SNES-style square wave
     */
    createSquareWave(frequency, duration, volume = 0.3) {
        if (!this.context || !this.isUnlocked) return null;

        try {
            // Create oscillator
            const oscillator = this.context.createOscillator();
            oscillator.type = 'square';
            oscillator.frequency.value = frequency;

            // Create gain
            const gain = this.context.createGain();
            gain.gain.value = volume;

            // Envelope (ADSR)
            const now = this.context.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(volume, now + 0.01); // Attack
            gain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.1); // Decay
            gain.gain.setValueAtTime(volume * 0.7, now + duration - 0.1); // Sustain
            gain.gain.linearRampToValueAtTime(0, now + duration); // Release

            // Connect and play
            oscillator.connect(gain);
            gain.connect(this.sfxGain);

            oscillator.start(now);
            oscillator.stop(now + duration);

            return oscillator;

        } catch (error) {
            console.warn('⚠️ Failed to create square wave:', error);
            return null;
        }
    }

    /**
     * Create SNES-style noise
     */
    createNoise(duration, volume = 0.2) {
        if (!this.context || !this.isUnlocked) return null;

        try {
            // Create buffer for noise
            const bufferSize = this.context.sampleRate * duration;
            const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
            const data = buffer.getChannelData(0);

            // Generate white noise
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * volume;
            }

            // Create source
            const source = this.context.createBufferSource();
            source.buffer = buffer;

            // Create filter for SNES-style noise
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 8000; // SNES noise filter

            // Connect and play
            source.connect(filter);
            filter.connect(this.sfxGain);

            source.start();

            return source;

        } catch (error) {
            console.warn('⚠️ Failed to create noise:', error);
            return null;
        }
    }

    /**
     * Get audio context state
     */
    getState() {
        return {
            isUnlocked: this.isUnlocked,
            isMuted: this.isMuted,
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            currentMusic: this.currentMusic,
            contextState: this.context?.state || 'closed'
        };
    }

    /**
     * Cleanup audio manager
     */
    destroy() {
        this.stopMusic();

        if (this.context) {
            this.context.close();
        }

        this.sounds.clear();
        this.music.clear();
    }
} 