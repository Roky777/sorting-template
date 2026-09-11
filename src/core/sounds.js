// Tiny synthesized sounds keep the game cheerful without adding heavy audio files.
export function createSounds() {
  let context;
  let muted = false;

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

  return {
    setMuted(value) { muted = value; },
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
  };
}
