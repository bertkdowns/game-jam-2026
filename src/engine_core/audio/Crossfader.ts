type MultiTrackOptions = {
  loop?: boolean;
  /** seconds; tiny scheduling lead to keep starts tight */
  startSafetySec?: number;
  /** default fade time for convenience methods */
  defaultFadeSec?: number;
  /** optional AudioContext latency hint */
  latencyHint?: AudioContextLatencyCategory | number;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Equal-power crossfade weights (perceived loudness stays steadier) */
function equalPowerPair(x: number) {
  const t = clamp(x, 0, 1);
  const from = Math.cos(t * 0.5 * Math.PI);
  const to = Math.cos((1 - t) * 0.5 * Math.PI);
  return { from, to };
}

export class MultiTrackCrossfader {
  private ctx: AudioContext;
  private destination: AudioNode;

  private urls: string[];
  private buffers: (AudioBuffer | null)[] = [];
  private gains: GainNode[] = [];

  private sources: (AudioBufferSourceNode | null)[] = [];

  private loop: boolean;
  private startSafetySec: number;
  private defaultFadeSec: number;

  // playback state (shared timeline so tracks remain aligned)
  private isPlaying = false;
  private startTime = 0; // ctx time when started
  private offset = 0; // seconds into track when started/resumed
  private currentIndex = 0;
  private masterGain: GainNode;
  private isMuted = false;

  constructor(urls: string[], opts: MultiTrackOptions = {}) {
    if (!urls.length) throw new Error("Provide at least one track url.");
    this.urls = urls.slice();

    this.ctx = new AudioContext({ latencyHint: opts.latencyHint });
    // Create master gain node for mute functionality
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1;
    this.masterGain.connect(this.ctx.destination);
    this.destination = this.masterGain;

    this.loop = opts.loop ?? true;
    this.startSafetySec = opts.startSafetySec ?? 0.01;
    this.defaultFadeSec = opts.defaultFadeSec ?? 1.0;
  }

  /** Load & decode all tracks */
  async load(): Promise<void> {
    console.log("Loading audio tracks...");
    const decoded = await Promise.all(this.urls.map((u) => this.loadBuffer(u)));
    this.buffers = decoded;
    console.log("Audio tracks loaded");
    // create one gain per track, initially silent
    this.gains = decoded.map(() => {
      const g = this.ctx.createGain();
      g.gain.value = 0;
      g.connect(this.destination);
      return g;
    });

    // default: track 0 audible
    this.currentIndex = 0;
    this.gains[0].gain.value = 1;
  }

  /** Start playback (starts ALL sources together for tight sync) */
  async play(): Promise<void> {
    console.log("Playing audio tracks...");
    this.assertLoaded();

    if (this.ctx.state !== "running") await this.ctx.resume();
    if (this.isPlaying) return;

    this.sources = this.buffers.map((buf, i) => {
      const s = this.ctx.createBufferSource();
      s.buffer = buf!;
      s.loop = this.loop;
      s.connect(this.gains[i]);
      return s;
    });

    const now = this.ctx.currentTime;
    const when = now + this.startSafetySec;

    this.startTime = when;
    this.sources.forEach((s) => s!.start(when, this.offset));
    this.isPlaying = true;
  }

  /** Pause (keeps offset for resume) */
  pause(): void {
    if (!this.isPlaying) return;

    const now = this.ctx.currentTime;
    const elapsed = Math.max(0, now - this.startTime);
    this.offset += elapsed;

    this.stopSources();
    this.isPlaying = false;
  }

  /** Stop and reset to beginning */
  stop(): void {
    this.stopSources();
    this.isPlaying = false;
    this.offset = 0;
    this.startTime = 0;
  }

  /** Which track is currently "selected" */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Fade from the current track to `newIndex`.
   * - If `newIndex` is already current, this is a no-op (or you can set duration 0 to snap).
   */
  fadeTo(newIndex: number, durationSec = this.defaultFadeSec): void {
    this.assertLoaded();
    const target = clamp(newIndex, 0, this.gains.length - 1);

    const fromIdx = this.currentIndex;
    const toIdx = target;
    if (fromIdx === toIdx) return;

    const t0 = this.ctx.currentTime;
    const t1 = t0 + Math.max(0, durationSec);

    // Cancel scheduled ramps on BOTH tracks for predictable behavior.
    // (We leave other tracks at whatever they are—typically 0.)
    this.gains[fromIdx].gain.cancelScheduledValues(t0);
    this.gains[toIdx].gain.cancelScheduledValues(t0);

    // Start from current instantaneous gains
    const fromStart = this.gains[fromIdx].gain.value;
    const toStart = this.gains[toIdx].gain.value;

    this.gains[fromIdx].gain.setValueAtTime(fromStart, t0);
    this.gains[toIdx].gain.setValueAtTime(toStart, t0);

    // Equal-power endpoints: from -> 0, to -> 1
    // We ramp in gain space; equal-power curve is about endpoints/ratio.
    // If you want a *perfect* equal-power curve over time, use the optional
    // setCurveCrossfade() method below.
    this.gains[fromIdx].gain.linearRampToValueAtTime(0, t1);
    this.gains[toIdx].gain.linearRampToValueAtTime(1, t1);

    // Ensure all other tracks are at 0 (optional but usually desired)
    for (let i = 0; i < this.gains.length; i++) {
      if (i === fromIdx || i === toIdx) continue;
      this.gains[i].gain.cancelScheduledValues(t0);
      this.gains[i].gain.setValueAtTime(0, t0);
    }

    this.currentIndex = toIdx;
  }

  /**
   * Snap immediately to a track (no fade)
   */
  select(newIndex: number): void {
    this.assertLoaded();
    const idx = clamp(newIndex, 0, this.gains.length - 1);
    for (let i = 0; i < this.gains.length; i++) {
      this.gains[i].gain.setValueAtTime(
        i === idx ? 1 : 0,
        this.ctx.currentTime
      );
    }
    this.currentIndex = idx;
  }

  /**
   * Optional: true equal-power curve over time using setValueCurveAtTime.
   * This costs a little more but keeps perceived loudness steadier during the fade.
   */
  fadeToEqualPower(
    newIndex: number,
    durationSec = this.defaultFadeSec,
    steps = 128
  ): void {
    this.assertLoaded();
    const target = clamp(newIndex, 0, this.gains.length - 1);
    const fromIdx = this.currentIndex;
    const toIdx = target;
    if (fromIdx === toIdx) return;

    const t0 = this.ctx.currentTime;
    const dur = Math.max(0, durationSec);

    const fromCurve = new Float32Array(steps);
    const toCurve = new Float32Array(steps);

    for (let i = 0; i < steps; i++) {
      const x = steps === 1 ? 1 : i / (steps - 1);
      const g = equalPowerPair(x);
      fromCurve[i] = g.from;
      toCurve[i] = g.to;
    }

    // Cancel prior schedules
    this.gains[fromIdx].gain.cancelScheduledValues(t0);
    this.gains[toIdx].gain.cancelScheduledValues(t0);

    // Start curves from *current* values by snapping first, then applying curve
    // (This keeps behavior predictable if you interrupt fades.)
    this.gains[fromIdx].gain.setValueAtTime(this.gains[fromIdx].gain.value, t0);
    this.gains[toIdx].gain.setValueAtTime(this.gains[toIdx].gain.value, t0);

    // Important: curves are absolute values. We want from->0 and to->1.
    // So we set the gains to 1 and apply curves directly.
    this.gains[fromIdx].gain.setValueAtTime(1, t0);
    this.gains[toIdx].gain.setValueAtTime(0, t0);

    this.gains[fromIdx].gain.setValueCurveAtTime(fromCurve, t0, dur);
    this.gains[toIdx].gain.setValueCurveAtTime(toCurve, t0, dur);

    // Others to 0
    for (let i = 0; i < this.gains.length; i++) {
      if (i === fromIdx || i === toIdx) continue;
      this.gains[i].gain.cancelScheduledValues(t0);
      this.gains[i].gain.setValueAtTime(0, t0);
    }

    this.currentIndex = toIdx;
  }

  /**
   * Add a new track at runtime (load + create gain).
   * Returns the new index.
   */
  async addTrack(url: string): Promise<number> {
    const buf = await this.loadBuffer(url);
    this.urls.push(url);
    this.buffers.push(buf);

    const g = this.ctx.createGain();
    g.gain.value = 0;
    g.connect(this.destination);
    this.gains.push(g);

    // If currently playing, we must also start a new source aligned to current offset.
    if (this.isPlaying) {
      const s = this.ctx.createBufferSource();
      s.buffer = buf;
      s.loop = this.loop;
      s.connect(g);

      // compute current offset into timeline
      const now = this.ctx.currentTime;
      const elapsed = Math.max(0, now - this.startTime);
      const startAtOffset = this.offset + elapsed;

      // schedule immediately with tiny safety
      s.start(now + this.startSafetySec, startAtOffset);
      this.sources.push(s);
    } else {
      this.sources.push(null);
    }

    return this.gains.length - 1;
  }

  /**
   * Mute or unmute all audio
   */
  mute(muted: boolean): void {
    this.isMuted = muted;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(muted ? 0 : 1, now);
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.mute(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Get current mute state
   */
  getMuted(): boolean {
    return this.isMuted;
  }

  /** Connect output to another node instead of destination */
  connect(node: AudioNode): void {
    this.gains.forEach((g) => {
      try {
        g.disconnect();
      } catch (error) { console.error(error); }
      g.connect(node);
    });
  }

  async dispose(): Promise<void> {
    this.stop();
    await this.ctx.close();
  }

  // ---------- internals ----------

  private assertLoaded(): void {
    if (
      !this.buffers.length ||
      this.buffers.some((b) => !b) ||
      !this.gains.length
    ) {
      throw new Error("Call load() before using playback/fade controls.");
    }
  }

  private async loadBuffer(url: string): Promise<AudioBuffer> {
    const res = await fetch(url);
    if (!res.ok)
      throw new Error(
        `Failed to fetch ${url}: ${res.status} ${res.statusText}`
      );
    const ab = await res.arrayBuffer();
    return await this.ctx.decodeAudioData(ab);
  }

  private stopSources(): void {
    for (const s of this.sources) {
      if (!s) continue;
      try {
        s.stop();
      } catch (error) { console.error(error); }
      try {
        s.disconnect();
      } catch (error) { console.error(error); }
    }
    this.sources = this.sources.map(() => null);
  }
}
