/**
 * One behavior key per originalized ability.
 * The cast resolver in game.ts is the only place these run.
 * Hooli has no key. A repeated signature is a duplicated trick.
 */

import type { CastFx } from "./heroes.ts";

export type MechShape = "line" | "wedge" | "ring" | "ground" | "bolt" | "self" | "unit";
export type MechTiming = "instant" | "windup" | "next" | "pulse" | "expire";
export type MechStatus = "none" | "slow" | "stun" | "taunt" | "mark" | "heavy" | "knock";
export type MechSelf = "none" | "shield" | "decay" | "aspd" | "haste" | "heal" | "stealth" | "boon" | "cleanse";
export type MechTravel = "none" | "dash" | "stop" | "back" | "blink" | "pull" | "knock" | "hook";
export type MechCond = "none" | "first" | "heroes" | "low" | "allies" | "far" | "near" | "marked";

export type MechSpec = {
  id: string;
  shape: MechShape;
  timing: MechTiming;
  status: MechStatus;
  self: MechSelf;
  travel: MechTravel;
  cond: MechCond;
  /** Windup or expire seconds, wedge degrees, or ground radius. */
  span: number;
  budget: CastFx;
};

export function mechSignature(spec: MechSpec): string {
  return [spec.shape, spec.timing, spec.status, spec.self, spec.travel, spec.cond].join("|");
}

/** Same ballpark as the generic cast this ability replaced. */
export function budgetBase(fx: CastFx, ult: boolean): number {
  switch (fx) {
    case "cone":
      return 90;
    case "bolt":
      return ult ? 220 : 100;
    case "nova":
      return ult ? 180 : 120;
    case "stun":
      return 80;
    case "rain":
      return 110;
    case "heal":
      return ult ? 160 : 90;
    case "dashnova":
      return 160;
    case "dash":
      return 70;
    case "slow":
      return 40;
    case "taunt":
      return 30;
    case "shield":
    case "aspd":
      return 0;
    default:
      return 80;
  }
}

function m(
  id: string,
  shape: MechShape,
  timing: MechTiming,
  status: MechStatus,
  self: MechSelf,
  travel: MechTravel,
  cond: MechCond,
  span: number,
  budget: CastFx,
): MechSpec {
  return { id, shape, timing, status, self, travel, cond, span, budget };
}

export const MECHS: Record<string, MechSpec> = Object.fromEntries(
  (
    [
      m("grump-caps", "line", "instant", "slow", "none", "knock", "first", 36, "cone"),
      m("grump-rally", "self", "instant", "none", "boon", "none", "allies", 0, "aspd"),
      m("grump-order", "ground", "windup", "stun", "none", "none", "heroes", 0.55, "stun"),
      m("grump-dom", "ring", "expire", "none", "none", "knock", "none", 0.7, "nova"),

      m("alex-mic", "bolt", "instant", "mark", "none", "none", "far", 0, "bolt"),
      m("alex-dump", "ground", "pulse", "slow", "none", "none", "none", 150, "rain"),
      m("alex-break", "ground", "windup", "heavy", "none", "none", "none", 0.6, "slow"),
      m("alex-bomb", "bolt", "expire", "stun", "none", "none", "marked", 0.8, "bolt"),

      m("rogen-take", "bolt", "instant", "slow", "none", "pull", "none", 0, "bolt"),
      m("rogen-guest", "self", "pulse", "none", "heal", "none", "allies", 0, "heal"),
      m("rogen-smoke", "ground", "instant", "slow", "stealth", "none", "none", 160, "slow"),
      m("rogen-mono", "ring", "pulse", "taunt", "none", "none", "heroes", 0, "nova"),

      m("quirk-prove", "wedge", "instant", "mark", "none", "none", "first", 50, "cone"),
      m("quirk-tour", "line", "instant", "slow", "none", "stop", "first", 0, "dash"),
      m("quirk-point", "self", "next", "none", "boon", "none", "none", 0, "aspd"),
      m("quirk-mid", "line", "instant", "stun", "none", "dash", "allies", 0, "dashnova"),

      m("tommy-call", "unit", "instant", "taunt", "none", "pull", "heroes", 0, "stun"),
      m("tommy-ban", "line", "windup", "heavy", "none", "none", "none", 0.55, "slow"),
      m("tommy-chant", "self", "instant", "taunt", "shield", "none", "none", 0, "taunt"),
      m("tommy-march", "line", "instant", "knock", "none", "dash", "none", 0, "dashnova"),

      m("elon-pad", "self", "instant", "none", "none", "blink", "none", 0, "dash"),
      m("elon-drone", "bolt", "windup", "mark", "none", "none", "none", 0.45, "bolt"),
      m("elon-auto", "self", "expire", "none", "aspd", "none", "none", 4, "aspd"),
      m("elon-drive", "unit", "pulse", "stun", "none", "stop", "first", 0, "dashnova"),

      m("boris-latin", "wedge", "instant", "slow", "none", "none", "far", 55, "cone"),
      m("boris-zip", "unit", "instant", "none", "none", "stop", "first", 0, "dash"),
      m("boris-wall", "self", "expire", "none", "decay", "none", "none", 3.2, "shield"),
      m("boris-done", "ring", "instant", "knock", "none", "knock", "none", 0, "nova"),

      m("brander-wake", "unit", "windup", "stun", "none", "none", "marked", 0.5, "stun"),
      m("brander-cancel", "ground", "instant", "slow", "none", "pull", "none", 150, "slow"),
      m("brander-lion", "self", "instant", "none", "heal", "none", "low", 0, "heal"),
      m("brander-hour", "bolt", "next", "mark", "none", "none", "none", 0, "bolt"),

      m("vest-verse", "wedge", "next", "none", "none", "knock", "none", 60, "cone"),
      m("vest-cut", "self", "instant", "none", "stealth", "back", "none", 0, "dash"),
      m("vest-service", "self", "instant", "none", "aspd", "none", "low", 0, "aspd"),
      m("vest-sunday", "ring", "windup", "stun", "heal", "none", "allies", 0.65, "nova"),

      m("steers-roast", "wedge", "instant", "taunt", "none", "none", "first", 48, "cone"),
      m("steers-aisle", "line", "instant", "slow", "none", "dash", "far", 0, "dash"),
      m("steers-special", "self", "pulse", "taunt", "none", "none", "none", 0, "taunt"),
      m("steers-hour", "line", "expire", "stun", "none", "dash", "none", 0.6, "dashnova"),

      m("ricky-line", "line", "instant", "heavy", "none", "none", "none", 0, "cone"),
      m("ricky-cut", "self", "instant", "none", "shield", "dash", "none", 0, "dash"),
      m("ricky-chin", "self", "instant", "none", "shield", "none", "low", 0, "shield"),
      m("ricky-bell", "unit", "instant", "stun", "none", "stop", "heroes", 0, "dashnova"),

      m("bush-mission", "unit", "instant", "stun", "none", "knock", "none", 0, "stun"),
      m("bush-wall", "self", "instant", "none", "shield", "none", "allies", 0, "shield"),
      m("bush-coalition", "ground", "pulse", "slow", "none", "none", "allies", 160, "slow"),
      m("bush-surge", "ring", "windup", "none", "shield", "none", "allies", 0.7, "nova"),

      m("harass-cackle", "wedge", "instant", "slow", "heal", "none", "allies", 62, "cone"),
      m("harass-tape", "line", "instant", "heavy", "none", "none", "first", 0, "slow"),
      m("harass-unburden", "self", "expire", "none", "heal", "none", "allies", 1.2, "heal"),
      m("harass-salad", "ring", "pulse", "slow", "none", "none", "none", 0, "nova"),

      m("sand-rally", "self", "instant", "taunt", "heal", "none", "allies", 0, "taunt"),
      m("sand-class", "unit", "instant", "stun", "none", "pull", "none", 0, "stun"),
      m("sand-rev", "self", "pulse", "none", "heal", "none", "low", 0, "heal"),
      m("sand-bern", "line", "instant", "knock", "heal", "dash", "allies", 0, "dashnova"),

      m("biten-slick", "ground", "instant", "heavy", "none", "knock", "none", 150, "slow"),
      m("biten-base", "self", "windup", "none", "shield", "none", "none", 0.45, "shield"),
      m("biten-ice", "self", "instant", "none", "heal", "none", "first", 0, "heal"),
      m("biten-brandon", "ring", "expire", "stun", "heal", "none", "heroes", 0.8, "heal"),

      m("drama-yes", "bolt", "instant", "none", "haste", "none", "allies", 0, "bolt"),
      m("drama-prompt", "ground", "windup", "slow", "none", "none", "far", 0.55, "slow"),
      m("drama-fired", "self", "next", "none", "heal", "none", "none", 0, "heal"),
      m("drama-hope", "ring", "instant", "mark", "heal", "none", "allies", 0, "nova"),

      m("turk-tax", "ground", "expire", "slow", "none", "none", "heroes", 1.1, "slow"),
      m("turk-green", "ground", "pulse", "none", "none", "none", "far", 160, "rain"),
      m("turk-squad", "self", "instant", "none", "haste", "none", "allies", 0, "heal"),
      m("turk-dare", "bolt", "windup", "stun", "none", "none", "heroes", 0.4, "bolt"),

      m("hock-well", "ground", "instant", "heavy", "none", "pull", "none", 170, "slow"),
      m("hock-drift", "self", "instant", "none", "stealth", "blink", "none", 0, "dash"),
      m("hock-beam", "line", "instant", "mark", "none", "none", "first", 0, "bolt"),
      m("hock-hole", "ring", "windup", "none", "none", "pull", "none", 0.6, "nova"),

      m("vax-dose", "bolt", "instant", "heavy", "none", "none", "marked", 0, "bolt"),
      m("vax-flat", "line", "windup", "slow", "none", "none", "none", 0.5, "slow"),
      m("vax-peer", "self", "pulse", "none", "cleanse", "none", "allies", 0, "heal"),
      m("vax-nation", "ground", "expire", "none", "heal", "none", "allies", 1.3, "heal"),

      m("clim-carbon", "unit", "instant", "stun", "none", "none", "far", 0, "stun"),
      m("clim-dome", "ground", "expire", "heavy", "none", "none", "none", 1.15, "slow"),
      m("clim-cover", "ground", "instant", "slow", "heal", "none", "allies", 160, "rain"),
      m("clim-degree", "ring", "pulse", "knock", "none", "knock", "none", 0, "nova"),

      m("jour-leak", "bolt", "instant", "mark", "none", "knock", "far", 0, "bolt"),
      m("jour-check", "ground", "instant", "slow", "none", "none", "heroes", 160, "slow"),
      m("jour-run", "self", "instant", "none", "haste", "back", "low", 0, "dash"),
      m("jour-exclusive", "bolt", "expire", "heavy", "none", "none", "marked", 0.75, "bolt"),

      m("icon-stomp", "wedge", "instant", "stun", "none", "knock", "near", 70, "cone"),
      m("icon-will", "self", "instant", "none", "decay", "none", "low", 0, "shield"),
      m("icon-crowd", "ground", "instant", "heavy", "none", "none", "near", 140, "slow"),
      m("icon-rally", "ring", "windup", "taunt", "shield", "none", "allies", 0.6, "nova"),

      m("enig-file", "unit", "instant", "slow", "none", "none", "marked", 0, "slow"),
      m("enig-vanish", "self", "expire", "none", "stealth", "blink", "none", 0.35, "dash"),
      m("enig-life", "self", "pulse", "none", "shield", "none", "none", 0, "shield"),
      m("enig-deep", "unit", "windup", "stun", "none", "pull", "heroes", 0.6, "stun"),

      m("toon-trap", "ground", "expire", "stun", "none", "none", "first", 0.9, "rain"),
      m("toon-double", "unit", "pulse", "stun", "none", "none", "none", 0, "stun"),
      m("toon-cut", "self", "instant", "none", "none", "blink", "far", 0, "dash"),
      m("toon-absurd", "ring", "pulse", "knock", "none", "none", "heroes", 0, "nova"),

      m("dyn-flash", "bolt", "instant", "slow", "none", "knock", "first", 0, "bolt"),
      m("dyn-viral", "ring", "instant", "none", "haste", "none", "none", 0, "nova"),
      m("dyn-fame", "line", "instant", "mark", "none", "dash", "none", 0, "dash"),
      m("dyn-break", "line", "windup", "stun", "none", "dash", "none", 0.35, "dashnova"),

      m("leg-hook", "unit", "instant", "stun", "heal", "hook", "none", 0, "stun"),
      m("leg-silence", "ground", "instant", "heavy", "none", "none", "heroes", 150, "slow"),
      m("leg-roll", "self", "instant", "none", "shield", "back", "none", 0, "dash"),
      m("leg-chaos", "unit", "pulse", "knock", "none", "stop", "none", 0, "dashnova"),

      m("karen-complain", "self", "instant", "taunt", "none", "pull", "none", 0, "taunt"),
      m("karen-demand", "unit", "instant", "stun", "none", "none", "low", 0, "stun"),
      m("karen-excuse", "wedge", "windup", "knock", "none", "knock", "first", 0.4, "cone"),
      m("karen-manager", "ring", "expire", "taunt", "shield", "none", "none", 0.85, "nova"),

      m("veg-sprout", "ground", "instant", "heavy", "none", "pull", "near", 140, "slow"),
      m("veg-vigor", "self", "next", "none", "heal", "none", "allies", 0, "heal"),
      m("veg-wave", "line", "instant", "slow", "none", "dash", "none", 0, "dash"),
      m("veg-harvest", "ground", "windup", "none", "heal", "none", "allies", 0.5, "rain"),

      m("but-swarm", "ground", "pulse", "mark", "none", "none", "none", 160, "rain"),
      m("but-laser", "line", "instant", "none", "none", "none", "first", 0, "bolt"),
      m("but-patch", "self", "expire", "none", "aspd", "none", "low", 4, "aspd"),
      m("but-over", "ring", "windup", "slow", "none", "none", "none", 0.55, "nova"),

      m("pho-splash", "bolt", "instant", "slow", "none", "none", "none", 0, "bolt"),
      m("pho-stroke", "line", "instant", "slow", "none", "none", "none", 0, "slow"),
      m("pho-master", "ground", "expire", "mark", "none", "none", "none", 1, "rain"),
      m("pho-show", "ring", "expire", "mark", "none", "none", "none", 0.7, "nova"),

      m("mac-left", "wedge", "next", "none", "none", "none", "none", 40, "cone"),
      m("mac-smack", "self", "instant", "taunt", "none", "none", "heroes", 0, "taunt"),
      m("mac-counter", "unit", "instant", "stun", "shield", "none", "none", 0, "stun"),
      m("mac-finish", "unit", "instant", "none", "boon", "stop", "first", 0, "dashnova"),

      m("khab-take", "unit", "instant", "stun", "none", "hook", "none", 0, "stun"),
      m("khab-ground", "ground", "pulse", "heavy", "none", "none", "near", 140, "slow"),
      m("khab-cage", "self", "instant", "taunt", "none", "knock", "none", 0, "taunt"),
      m("khab-escape", "ring", "instant", "stun", "none", "pull", "none", 0, "nova"),

      m("jones-elbow", "wedge", "instant", "slow", "none", "knock", "far", 34, "cone"),
      m("jones-spin", "line", "instant", "knock", "none", "dash", "near", 0, "dash"),
      m("jones-iq", "self", "next", "mark", "aspd", "none", "none", 0, "aspd"),
      m("jones-champ", "ring", "expire", "knock", "none", "none", "low", 0.75, "nova"),

      m("ade-feint", "bolt", "instant", "none", "none", "none", "marked", 0, "bolt"),
      m("ade-distance", "ground", "instant", "slow", "none", "knock", "far", 150, "slow"),
      m("ade-step", "self", "instant", "slow", "none", "back", "marked", 0, "dash"),
      m("ade-style", "bolt", "windup", "stun", "none", "none", "marked", 0.35, "bolt"),

      m("poi-combo", "wedge", "pulse", "none", "none", "none", "none", 58, "cone"),
      m("poi-body", "unit", "instant", "stun", "none", "none", "near", 0, "stun"),
      m("poi-hard", "self", "pulse", "none", "decay", "none", "low", 0, "shield"),
      m("poi-back", "ring", "instant", "none", "boon", "none", "low", 0, "nova"),

      m("diaz-pressure", "wedge", "instant", "slow", "none", "none", "near", 64, "cone"),
      m("diaz-come", "self", "expire", "taunt", "shield", "none", "none", 1.4, "taunt"),
      m("diaz-tired", "self", "expire", "none", "heal", "none", "low", 1.1, "heal"),
      m("diaz-war", "ring", "pulse", "none", "heal", "none", "low", 0, "nova"),

      m("slush-lump", "bolt", "instant", "slow", "none", "none", "near", 0, "bolt"),
      m("slush-drift", "ground", "windup", "slow", "none", "none", "none", 0.55, "slow"),
      m("slush-tracks", "self", "instant", "none", "haste", "none", "none", 0, "aspd"),
      m("slush-slide", "ring", "expire", "knock", "none", "knock", "none", 0.75, "nova"),
    ] as MechSpec[]
  ).map((spec) => [spec.id, spec]),
);

export function mechById(id: string): MechSpec {
  const spec = MECHS[id];
  if (!spec) throw new Error(`missing ability mechanic: ${id}`);
  return spec;
}

/** How the existing AI should aim this trick. */
export function mechIntent(spec: MechSpec): "dash" | "save" | "buff" | "taunt" | "slow" | "off" {
  if (spec.travel === "dash" || spec.travel === "stop" || spec.travel === "back" || spec.travel === "blink") return "dash";
  if (spec.self === "shield" || spec.self === "decay" || spec.self === "heal" || spec.self === "stealth" || spec.self === "cleanse") return "save";
  if (spec.self === "aspd" || spec.self === "haste" || spec.self === "boon" || spec.timing === "next") return "buff";
  if (spec.status === "taunt") return "taunt";
  if (spec.status === "slow" || spec.status === "heavy") return "slow";
  return "off";
}
