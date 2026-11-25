// Pixel Tower Defense — Web Audio Synthesizer
// Pure procedural 8-bit / 16-bit sound effects (Zero external audio file dependencies)

const AudioService = {
    ctx: null,
    muted: false,

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    },

    playTone(freq, type = 'square', duration = 0.1, gainVal = 0.1) {
        if (this.muted) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Audio policy ignore
        }
    },

    playPlaceSound() {
        this.playTone(320, 'sine', 0.08, 0.15);
        setTimeout(() => this.playTone(480, 'triangle', 0.1, 0.15), 60);
    },

    playShootSound(damageType) {
        if (damageType === 'Magical') {
            this.playTone(600, 'sine', 0.1, 0.08);
        } else {
            this.playTone(180, 'square', 0.06, 0.08);
        }
    },

    playHitSound() {
        this.playTone(120, 'sawtooth', 0.08, 0.08);
    },

    playUpgradeSound() {
        this.playTone(400, 'sine', 0.08, 0.12);
        setTimeout(() => this.playTone(600, 'sine', 0.08, 0.12), 70);
        setTimeout(() => this.playTone(800, 'sine', 0.15, 0.15), 140);
    },

    playSummonSound(rarity) {
        if (rarity === 'Mythic' || rarity === 'Secret') {
            // Epic fanfare
            [440, 554, 659, 880, 1108].forEach((f, idx) => {
                setTimeout(() => this.playTone(f, 'triangle', 0.25, 0.2), idx * 100);
            });
        } else if (rarity === 'Legendary') {
            [350, 440, 523, 700].forEach((f, idx) => {
                setTimeout(() => this.playTone(f, 'sine', 0.2, 0.15), idx * 90);
            });
        } else {
            this.playTone(520, 'sine', 0.15, 0.1);
        }
    },

    playSellSound() {
        this.playTone(650, 'triangle', 0.08, 0.12);
        setTimeout(() => this.playTone(420, 'triangle', 0.12, 0.12), 70);
    },

    playPurchaseSound() {
        this.playTone(520, 'sine', 0.08, 0.12);
        setTimeout(() => this.playTone(780, 'triangle', 0.12, 0.15), 60);
    },

    playVictorySound() {
        [523, 659, 784, 1046].forEach((f, idx) => {
            setTimeout(() => this.playTone(f, 'square', 0.3, 0.15), idx * 120);
        });
    },

    playDefeatSound() {
        [400, 350, 300, 220].forEach((f, idx) => {
            setTimeout(() => this.playTone(f, 'sawtooth', 0.25, 0.15), idx * 130);
        });
    }
};

if (typeof window !== 'undefined') {
    window.AudioService = AudioService;
}
