/** Computer browser keeps the full desk page. Only a phone UA gets the compact HUD. */

const PHONE_UA = /iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i;
const ANDROID_PHONE = /Android/i;
const ANDROID_MOBILE = /Mobile/i;

export function isPhoneShell(): boolean {
  const ua = navigator.userAgent;
  if (/iPad/i.test(ua)) return false;
  if (PHONE_UA.test(ua)) return true;
  return ANDROID_PHONE.test(ua) && ANDROID_MOBILE.test(ua);
}

const PHONE_VIEWPORT =
  "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
const DESK_WIDTH = 1280;

export function syncShell(): void {
  const phone = isPhoneShell();
  const playing = document.body.classList.contains("in-play");
  document.documentElement.classList.toggle("phone", phone);
  document.documentElement.classList.toggle("desk", !phone);
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta) meta.setAttribute("content", phone ? PHONE_VIEWPORT : `width=${DESK_WIDTH}`);
  const root = document.documentElement;
  if (phone || playing) {
    root.style.zoom = "";
    return;
  }
  const w = window.innerWidth;
  root.style.zoom = w > 0 && w < DESK_WIDTH ? String(w / DESK_WIDTH) : "";
}
