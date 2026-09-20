// Tiny synthesized sounds keep the game cheerful without adding heavy audio files.
export function createSounds() {
  let context;
  let muted = false;
  let musicEnabled = false;
  let musicTimer;

  function audioContext() {
    if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === "suspended") context.resume();
    return context;
  }

  function tone(frequency, start, duration, { end = frequency, volume = 0.055, type = "sine" } = {}) {
    if (muted) return;
    const ctx = audioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, end), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function playMusicBar() {
    if (muted || !musicEnabled) return;
    const now = audioContext().currentTime + 0.03;
    [261.63, 329.63, 392, 329.63].forEach((frequency, index) => {
      tone(frequency, now + index * 0.62, 0.72, { end: frequency * 1.002, volume: 0.009, type: "sine" });
    });
  }

  function startMusicLoop() {
    window.clearInterval(musicTimer);
    if (muted || !musicEnabled) return;
    playMusicBar();
    musicTimer = window.setInterval(playMusicBar, 2500);
  }

  return {
    setMuted(value) {
      muted = value;
      if (muted) window.clearInterval(musicTimer);
      else startMusicLoop();
    },
    startMusic() {
      musicEnabled = true;
      audioContext();
      startMusicLoop();
    },
    pauseMusic() {
      window.clearInterval(musicTimer);
    },
    resumeMusic() {
      startMusicLoop();
    },
    pickup() {
      const now = audioContext().currentTime;
      tone(420, now, 0.075, { end: 610, volume: 0.025, type: "sine" });
    },
    drop() {
      const now = audioContext().currentTime;
      tone(560, now, 0.11, { end: 330, volume: 0.045, type: "triangle" });
    },
    success() {
      const now = audioContext().currentTime;
      tone(523.25, now, 0.11, { end: 570, volume: 0.05, type: "sine" });
      tone(659.25, now + 0.095, 0.13, { end: 740, volume: 0.055, type: "sine" });
      tone(783.99, now + 0.19, 0.18, { end: 880, volume: 0.05, type: "triangle" });
    },
    retry() {
      const now = audioContext().currentTime;
      tone(290, now, 0.12, { end: 210, volume: 0.035, type: "sine" });
    },
    milestone() {
      const now = audioContext().currentTime;
      tone(880, now, 0.09, { end: 1040, volume: 0.035, type: "sine" });
      tone(1174, now + 0.075, 0.14, { end: 1320, volume: 0.04, type: "triangle" });
    },
    complete(stars = 1) {
      const now = audioContext().currentTime;
      tone(392, now, 0.18, { end: 523.25, volume: 0.045, type: "triangle" });
      tone(523.25, now + 0.15, 0.2, { end: 659.25, volume: 0.05, type: "triangle" });
      for (let index = 0; index < stars; index += 1) {
        const start = now + 0.38 + index * 0.34;
        tone(783.99 + index * 98, start, 0.2, { end: 1046.5 + index * 110, volume: 0.052, type: "sine" });
      }
    },
  };
}
