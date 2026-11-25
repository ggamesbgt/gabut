'use strict';

// Short synthetic effects. Audio starts only after the player enables it.
function bindAnnoyingSound(button) {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  let context, enabled = false, lastPlayed = -Infinity;
  const effects = {
    move: [540, 270, .075, 'square'],
    point: [380, 940, .13, 'triangle'],
    miss: [210, 58, .24, 'sawtooth'],
    win: [300, 1180, .27, 'triangle']
  };
  function play(effect) {
    if (!enabled || context?.state !== 'running') return;
    const now = context.currentTime;
    if (effect === 'move' && now - lastPlayed < .085) return;
    lastPlayed = now;
    const [start, end, length, wave] = effects[effect];
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(start, now);
    oscillator.frequency.exponentialRampToValueAtTime(end, now + length);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.055, now + .009);
    gain.gain.exponentialRampToValueAtTime(.0001, now + length);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + length + .01);
  }
  function update() {
    button.setAttribute('aria-pressed', String(enabled));
    button.textContent = 'Bunyi usil: ' + (enabled ? 'ON' : 'OFF');
  }
  if (!AudioEngine) {
    button.disabled = true;
    button.textContent = 'Bunyi tidak tersedia';
    return () => {};
  }
  button.onclick = async () => {
    enabled = !enabled;
    update();
    if (!enabled) { await context?.suspend().catch(() => {}); return; }
    try {
      context ??= new AudioEngine();
      await context.resume();
      play('point');
    } catch {
      enabled = false;
      update();
    }
  };
  return play;
}
