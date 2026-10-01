/** In-tab clipboard. Preview and remote desks often block the OS paste. */

const STORE = "cu-clip";
const SKIP = new Set(["hidden", "range", "checkbox", "radio", "file", "button", "submit", "reset", "image"]);
let mem = "";
let lastField: HTMLInputElement | HTMLTextAreaElement | null = null;
let wired = false;

export function rememberClip(text: string): void {
  if (!text) return;
  mem = text;
  try {
    sessionStorage.setItem(STORE, text);
  } catch {
    /* private mode */
  }
}

export function clipMem(): string {
  if (mem) return mem;
  try {
    return sessionStorage.getItem(STORE) ?? "";
  } catch {
    return "";
  }
}

export async function writeClip(text: string): Promise<boolean> {
  rememberClip(text);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function osClip(ms = 1000): Promise<string> {
  if (!navigator.clipboard?.readText) return Promise.resolve("");
  return new Promise((resolve) => {
    let done = false;
    const finish = (t: string) => {
      if (done) return;
      done = true;
      resolve(t);
    };
    const timer = window.setTimeout(() => finish(""), ms);
    try {
      Promise.resolve(navigator.clipboard.readText())
        .then((t) => {
          window.clearTimeout(timer);
          finish((t ?? "").trim() ? (t ?? "") : "");
        })
        .catch(() => {
          window.clearTimeout(timer);
          finish("");
        });
    } catch {
      window.clearTimeout(timer);
      finish("");
    }
  });
}

/** Some desks only allow the synchronous paste command during the click. */
function commandPaste(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  const before = el.value;
  const start = el.selectionStart;
  try {
    el.focus();
    document.execCommand("paste");
  } catch {
    return false;
  }
  return el.value !== before || el.selectionStart !== start;
}

export async function readClip(): Promise<string> {
  const buf = clipMem();
  const t = await osClip();
  if (t) {
    rememberClip(t);
    return t;
  }
  return buf;
}

export function insertClip(el: HTMLInputElement | HTMLTextAreaElement, text: string): void {
  if (!usable(el)) return;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  const cap = el.maxLength > 0 ? el.maxLength : 1_000_000;
  const next = `${el.value.slice(0, start)}${text}${el.value.slice(end)}`.slice(0, cap);
  el.value = next;
  const caret = Math.min(start + text.length, next.length);
  try {
    el.setSelectionRange(caret, caret);
  } catch {
    /* type=email in older WebKit */
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

export async function pasteInto(el: HTMLInputElement | HTMLTextAreaElement): Promise<boolean> {
  if (!usable(el)) return false;
  el.focus();
  if (commandPaste(el)) return true;
  const buf = clipMem();
  const live = await osClip();
  const text = live || buf;
  if (!text) return false;
  if (live) rememberClip(live);
  el.focus();
  insertClip(el, text);
  return true;
}

function fieldLike(el: EventTarget | null): el is HTMLInputElement | HTMLTextAreaElement {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}

function usable(el: EventTarget | null): el is HTMLInputElement | HTMLTextAreaElement {
  return fieldLike(el) && !el.disabled && !el.readOnly && !SKIP.has(el.type);
}

/** Hidden login and social fields stay in the DOM. Pasting into them looks like a dead button. */
function shown(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (!el.isConnected) return false;
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    if (n.hidden) return false;
  }
  return true;
}

function clipText(e: ClipboardEvent): string {
  const data = e.clipboardData;
  if (!data) return "";
  return data.getData("text/plain") || data.getData("text") || "";
}

function rememberFromField(el: HTMLInputElement | HTMLTextAreaElement): void {
  const a = el.selectionStart ?? 0;
  const b = el.selectionEnd ?? 0;
  if (b > a) rememberClip(el.value.slice(a, b));
}

export function bindFieldPaste(el: HTMLInputElement | HTMLTextAreaElement): void {
  if (!usable(el) || el.dataset.cuClip === "1") return;
  el.dataset.cuClip = "1";
  el.addEventListener("focus", () => {
    lastField = el;
  });
}

export function holdPasteFocus(btn: HTMLElement): void {
  btn.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });
}

export function wirePageClip(): void {
  if (wired) return;
  wired = true;

  document.addEventListener(
    "focusin",
    (e) => {
      if (usable(e.target)) lastField = e.target;
    },
    true,
  );

  document.addEventListener(
    "copy",
    (e) => {
      const data = clipText(e);
      if (data) {
        rememberClip(data);
        return;
      }
      const sel = document.getSelection()?.toString();
      if (sel) {
        rememberClip(sel);
        return;
      }
      const el = usable(e.target) ? e.target : lastTypedField();
      if (el) rememberFromField(el);
    },
    true,
  );

  document.addEventListener(
    "cut",
    (e) => {
      const data = clipText(e);
      if (data) {
        rememberClip(data);
        return;
      }
      const el = usable(e.target) ? e.target : lastTypedField();
      if (el) rememberFromField(el);
    },
    true,
  );

  document.addEventListener(
    "paste",
    (e) => {
      const data = clipText(e);
      if (data) rememberClip(data);
      const el = usable(e.target) ? e.target : lastTypedField();
      if (!el) return;
      const before = el.value;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      window.setTimeout(() => {
        if (el.value !== before || el.selectionStart !== start || el.selectionEnd !== end) return;
        const text = data || clipMem();
        if (!text) return;
        el.focus();
        insertClip(el, text);
      }, 40);
    },
    true,
  );

  document.addEventListener(
    "keydown",
    (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const copy = e.code === "KeyC" || e.code === "KeyX" || e.key === "c" || e.key === "C" || e.key === "x" || e.key === "X";
      if (copy && usable(e.target)) rememberFromField(e.target);
    },
    true,
  );

  for (const el of document.querySelectorAll("input, textarea")) {
    bindFieldPaste(el as HTMLInputElement | HTMLTextAreaElement);
  }
}

export function typingTarget(e: Event): boolean {
  const t = e.target as HTMLElement | null;
  return Boolean(t?.closest("input, textarea, [contenteditable], #desk, #account-box, #social-box, #handle-form, #mlx-pay-form"));
}

export function lastTypedField(): HTMLInputElement | HTMLTextAreaElement | null {
  const a = document.activeElement;
  if (usable(a) && shown(a)) return a;
  if (lastField && shown(lastField) && usable(lastField)) return lastField;
  return null;
}
