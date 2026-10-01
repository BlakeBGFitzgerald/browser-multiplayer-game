export type Order =
  | { kind: "move"; x: number; y: number }
  | { kind: "attack"; id: number }
  | { kind: "attack-move"; x: number; y: number }
  | { kind: "choose"; x?: number; y?: number }
  | { kind: "stop" }
  | { kind: "ability"; slot: number; x?: number; y?: number }
  | { kind: "buy"; id: string }
  | { kind: "sell"; index: number }
  | { kind: "bag"; index: number }
  | { kind: "mile"; which: "a" | "b" };

export type Cam = { x: number; y: number; zoom: number };

type TouchDrag = { id: number; x: number; y: number; dragged: boolean };

export class Input {
  mx = 0;
  my = 0;
  attackMove = false;
  private order: Order | null = null;
  private shopQueued = false;
  private pauseQueued = false;
  private centerQueued = false;
  private autoplayQueued = false;
  private panAcc = { x: 0, y: 0 };
  private touch: TouchDrag | null = null;
  private readonly held = new Set<string>();
  private readonly canvas: HTMLCanvasElement;
  private readonly cam: () => Cam;

  constructor(canvas: HTMLCanvasElement, cam: () => Cam, listen = true) {
    this.canvas = canvas;
    this.cam = cam;
    if (!listen) return;
    canvas.style.touchAction = "none";
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("pointermove", (e) => this.onMove(e));
    canvas.addEventListener("pointerdown", (e) => this.onDown(e));
    canvas.addEventListener("pointerup", (e) => this.onUp(e));
    canvas.addEventListener("pointercancel", (e) => this.onUp(e));
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable], #desk, #account-box, #social-box")) return;
      if (document.body.classList.contains("desk-open")) return;
      if (this.canvas.hidden) return;
      if (e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "ArrowUp" || e.code === "ArrowDown") {
        e.preventDefault();
        this.held.add(e.code);
        return;
      }
      if (e.code === "KeyS") this.order = { kind: "stop" };
      if (e.code === "KeyA") {
        e.preventDefault();
        this.order = { kind: "choose" };
      }
      if (e.code === "KeyZ") this.attackMove = true;
      if (e.code === "KeyB") this.shopQueued = true;
      if (e.code === "Space") {
        e.preventDefault();
        this.centerQueued = true;
      }
      if (e.code === "Escape") this.pauseQueued = true;
      if (e.code === "KeyP") this.autoplayQueued = true;
      const slot = { KeyQ: 0, KeyW: 1, KeyE: 2, KeyR: 3, KeyX: 0, KeyC: 2, KeyF: 3 }[e.code];
      if (slot !== undefined) this.order = { kind: "ability", slot };
    });
    window.addEventListener("keyup", (e) => {
      this.held.delete(e.code);
    });
    window.addEventListener("blur", () => this.held.clear());
  }

  /** Arrow pan. Unfollows the kit until Space snaps back. */
  pan(): { x: number; y: number } {
    if (this.canvas.hidden) {
      this.held.clear();
      return { x: 0, y: 0 };
    }
    let x = 0;
    let y = 0;
    if (this.held.has("ArrowLeft")) x -= 1;
    if (this.held.has("ArrowRight")) x += 1;
    if (this.held.has("ArrowUp")) y -= 1;
    if (this.held.has("ArrowDown")) y += 1;
    if (x && y) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }
    return { x, y };
  }

  consumePanDelta(): { x: number; y: number } {
    const d = this.panAcc;
    this.panAcc = { x: 0, y: 0 };
    return d;
  }

  flush(): void {
    this.order = null;
    this.shopQueued = false;
    this.pauseQueued = false;
    this.centerQueued = false;
    this.autoplayQueued = false;
    this.attackMove = false;
    this.panAcc = { x: 0, y: 0 };
    this.touch = null;
    this.held.clear();
  }

  world(): { x: number; y: number } {
    const c = this.cam();
    const r = this.canvas.getBoundingClientRect();
    const x = this.mx - r.left;
    const y = this.my - r.top;
    return {
      x: c.x + (x - r.width / 2) / c.zoom,
      y: c.y + (y - r.height / 2) / c.zoom,
    };
  }

  consumeOrder(): Order | null {
    const o = this.order;
    this.order = null;
    return o;
  }

  consumeShop(): boolean {
    const v = this.shopQueued;
    this.shopQueued = false;
    return v;
  }

  consumePause(): boolean {
    const v = this.pauseQueued;
    this.pauseQueued = false;
    return v;
  }

  consumeCenter(): boolean {
    const v = this.centerQueued;
    this.centerQueued = false;
    return v;
  }

  consumeAutoplay(): boolean {
    const v = this.autoplayQueued;
    this.autoplayQueued = false;
    return v;
  }

  queue(order: Order): void {
    this.order = order;
  }

  requestCenter(): void {
    this.centerQueued = true;
  }

  requestStop(): void {
    this.order = { kind: "stop" };
  }

  requestLock(): void {
    this.order = { kind: "choose" };
  }

  private finger(e: PointerEvent): boolean {
    return e.pointerType === "touch" || e.pointerType === "pen";
  }

  private track(e: PointerEvent): void {
    this.mx = e.clientX;
    this.my = e.clientY;
  }

  private issueWalk(): void {
    const w = this.world();
    this.order = this.attackMove
      ? { kind: "attack-move", x: w.x, y: w.y }
      : { kind: "move", x: w.x, y: w.y };
    this.attackMove = false;
  }

  private onDown(e: PointerEvent): void {
    this.track(e);
    if (this.finger(e)) {
      e.preventDefault();
      this.touch = { id: e.pointerId, x: e.clientX, y: e.clientY, dragged: false };
      try {
        this.canvas.setPointerCapture(e.pointerId);
      } catch {
        /* older WebKit */
      }
      return;
    }
    const w = this.world();
    if (e.button === 2) {
      this.order = this.attackMove
        ? { kind: "attack-move", x: w.x, y: w.y }
        : { kind: "move", x: w.x, y: w.y };
      this.attackMove = false;
    } else if (e.button === 0) {
      this.issueWalk();
    }
  }

  private onMove(e: PointerEvent): void {
    this.track(e);
    if (!this.touch || e.pointerId !== this.touch.id) return;
    const dx = e.clientX - this.touch.x;
    const dy = e.clientY - this.touch.y;
    if (!this.touch.dragged && Math.hypot(dx, dy) > 14) this.touch.dragged = true;
    if (!this.touch.dragged) return;
    const z = Math.max(0.2, this.cam().zoom);
    this.panAcc.x -= dx / z;
    this.panAcc.y -= dy / z;
    this.touch.x = e.clientX;
    this.touch.y = e.clientY;
  }

  private onUp(e: PointerEvent): void {
    if (!this.touch || e.pointerId !== this.touch.id) return;
    this.track(e);
    if (!this.touch.dragged) this.issueWalk();
    this.touch = null;
  }
}
