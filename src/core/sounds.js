export function createSounds() {
  const BGM_VOLUME = 0.16;
  const DUCKED_BGM_VOLUME = 0.055;
  const SUCCESS_BGM_VOLUME = 0.2;
  const VOICE_VOLUME = 0.72;
  const VOICES = {
    happy: "assets/audio/sparky_voice/nyasukeVoice_vol01_ya.wav",
    thinking: "assets/audio/sparky_voice/nyasukeVoice_vol01_ho.wav",
    surprised: "assets/audio/sparky_voice/nyasukeVoice_vol01_mo.wav",
    presentingDomo: "assets/audio/sparky_voice/nyasukeVoice_vol01_domo.wav",
    presentingDomoDomo: "assets/audio/sparky_voice/nyasukeVoice_vol01_domodomo.wav",
  };
  let context;
  let muted = false;
  let musicEnabled = false;
  let musicPaused = false;
  let musicMode = "game";
  let musicFadeFrame;
  let voiceTimer;
  let bgm;
  let successBgm;
  let voice;

  function gameMusic() {
    if (bgm) return bgm;
    bgm = new Audio("assets/audio/bgm/overworld.mp3");
    bgm.loop = true;
    bgm.preload = "metadata";
    bgm.volume = BGM_VOLUME;
    return bgm;
  }

  function successMusic() {
    if (successBgm) return successBgm;
    successBgm = new Audio("assets/audio/bgm/success-loop.mp3");
    successBgm.loop = true;
    successBgm.preload = "metadata";
    successBgm.volume = 0;
    return successBgm;
  }

  function voicePlayer() {
    if (voice) return voice;
    voice = new Audio();
    voice.preload = "none";
    voice.volume = VOICE_VOLUME;
    voice.addEventListener("ended", () => {
      if (bgm) bgm.volume = BGM_VOLUME;
      syncMusic();
    });
    voice.addEventListener("error", () => {
      if (bgm) bgm.volume = BGM_VOLUME;
    });
    return voice;
  }

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

  function stopVoice() {
    window.clearTimeout(voiceTimer);
    voiceTimer = undefined;
    voice?.pause();
    if (voice) voice.currentTime = 0;
    if (musicMode === "game" && bgm) bgm.volume = BGM_VOLUME;
  }

  function cancelMusicFade() {
    if (musicFadeFrame) cancelAnimationFrame(musicFadeFrame);
    musicFadeFrame = undefined;
  }

  function crossfade({ gameVolume, successVolume, duration, complete }) {
    cancelMusicFade();
    const gamePlayer = gameMusic();
    const successPlayer = successMusic();
    const startedAt = performance.now();
    const gameStart = gamePlayer.volume;
    const successStart = successPlayer.volume;
    const validVolume = (value) => Math.max(0, Math.min(1, value));
    const tick = (now) => {
      // Some browsers can supply an animation-frame timestamp fractionally
      // earlier than a performance.now() captured immediately beforehand.
      // Clamp both the timeline and its output so HTMLMediaElement never sees
      // an invalid negative/greater-than-one floating-point volume.
      const progress = Math.max(0, Math.min(1, (now - startedAt) / duration));
      const eased = 1 - (1 - progress) ** 3;
      gamePlayer.volume = validVolume(gameStart + (gameVolume - gameStart) * eased);
      successPlayer.volume = validVolume(successStart + (successVolume - successStart) * eased);
      if (progress < 1) musicFadeFrame = requestAnimationFrame(tick);
      else {
        musicFadeFrame = undefined;
        complete?.();
      }
    };
    musicFadeFrame = requestAnimationFrame(tick);
  }

  function syncMusic() {
    if (muted || !musicEnabled || musicPaused) {
      bgm?.pause();
      successBgm?.pause();
      return;
    }
    if (musicMode === "success") {
      bgm?.pause();
      const player = successMusic();
      player.volume = SUCCESS_BGM_VOLUME;
      player.play().catch(() => {});
    } else {
      successBgm?.pause();
      const player = gameMusic();
      player.volume = !voice || voice.paused ? BGM_VOLUME : DUCKED_BGM_VOLUME;
      player.play().catch(() => {});
    }
  }

  function playVoice(name, delay = 0) {
    if (muted || musicMode !== "game" || !VOICES[name]) return;
    window.clearTimeout(voiceTimer);
    voiceTimer = window.setTimeout(() => {
      if (muted || musicPaused) return;
      const player = voicePlayer();
      const music = gameMusic();
      player.pause();
      player.src = VOICES[name];
      player.currentTime = 0;
      music.volume = DUCKED_BGM_VOLUME;
      player.play().catch(() => {
        music.volume = BGM_VOLUME;
      });
    }, delay);
  }

  return {
    warmSecondaryAudio() {
      const player = successMusic();
      player.preload = "auto";
      player.load();
    },
    setMuted(value) {
      muted = value;
      if (muted) stopVoice();
      syncMusic();
    },
    startMusic() {
      musicEnabled = true;
      musicPaused = false;
      audioContext();
      syncMusic();
    },
    pauseMusic() {
      musicPaused = true;
      cancelMusicFade();
      stopVoice();
      syncMusic();
    },
    resumeMusic() {
      musicPaused = false;
      syncMusic();
    },
    startSuccessMusic() {
      musicMode = "success";
      stopVoice();
      const successPlayer = successMusic();
      const gamePlayer = gameMusic();
      successPlayer.currentTime = 0;
      successPlayer.volume = 0;
      if (muted || !musicEnabled || musicPaused) return syncMusic();
      gamePlayer.play().catch(() => {});
      successPlayer.play().catch(() => {});
      crossfade({
        gameVolume: 0,
        successVolume: SUCCESS_BGM_VOLUME,
        duration: 1400,
        complete: () => gamePlayer.pause(),
      });
    },
    stopSuccessMusic() {
      if (musicMode !== "success") return;
      musicMode = "game";
      const gamePlayer = gameMusic();
      const successPlayer = successMusic();
      if (muted || !musicEnabled || musicPaused) {
        successPlayer.pause();
        successPlayer.currentTime = 0;
        return syncMusic();
      }
      gamePlayer.volume = 0;
      gamePlayer.play().catch(() => {});
      crossfade({
        gameVolume: BGM_VOLUME,
        successVolume: 0,
        duration: 800,
        complete: () => {
          successPlayer.pause();
          successPlayer.currentTime = 0;
        },
      });
    },
    happy() {
      playVoice("happy");
    },
    thinking() {
      playVoice("thinking");
    },
    surprised() {
      playVoice("surprised");
    },
    presentingDomo() {
      playVoice("presentingDomo");
    },
    presentingDomoDomo() {
      playVoice("presentingDomoDomo");
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
