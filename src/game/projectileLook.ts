/**
 * Visual kind for a shot. Ammo wins, then an ability bolt, then the hero's
 * weapon, then a tower, an ancient, or a lane archer. Drawing does not live here.
 */

import { heroWeapon, type WeaponColors, type WeaponType } from "./heroWeapons.ts";
import { SNOWBALL_HERO_ID } from "./heroHeight.ts";

export type ProjectileSource = "hero" | "tower" | "ancient" | "archer" | "spell";

export type ProjectileShot = {
  ammo?: string;
  heroId?: string;
  team?: string;
  source?: string;
  color?: string;
};

export type ProjectileLook = {
  id: string;
  team: "home" | "away";
  dye: string;
  color: string;
  body: string;
  accent: string;
  metal: string;
};

const WEAPON_LOOK: Record<WeaponType, string> = {
  "nerf-launcher": "foam-rocket",
  boom: "mic-capsule",
  "lion-staff": "staff-spark",
  "stud-carbine": "tracer",
  prompter: "paper-slug",
  podium: "sound-bolt",
  rail: "metal-bolt",
  horn: "note-bolt",
  pipette: "green-drop",
  "vine-crossbow": "crossbow-bolt",
  camera: "flash-cube",
  dossier: "paper-scrap",
  flash: "flash-disc",
  drone: "quad-spark",
  palette: "paint-glob",
  "vine-bow": "vine-arrow",
};

const SPARK = "#f0c14a";

function side(team: string | undefined): "home" | "away" {
  return team === "away" ? "away" : "home";
}

function foam(dye: "nerf-blue" | "nerf-orange", team: "home" | "away"): ProjectileLook {
  const blue = dye === "nerf-blue";
  return {
    id: "foam-rocket",
    team,
    dye,
    color: blue ? "#3aa0ff" : "#ff8a1e",
    body: blue ? "#3aa0ff" : "#ff8a1e",
    accent: blue ? "#ff8a1e" : "#3aa0ff",
    metal: blue ? "#d7f1ff" : "#ffd24a",
  };
}

function junk(id: "can" | "bottle", team: "home" | "away"): ProjectileLook {
  const home = team === "home";
  return {
    id,
    team,
    dye: "#fff6e4",
    color: home ? "#6a1014" : "#0c2426",
    body: home ? "#c4161c" : "#128078",
    accent: "#fff6e4",
    metal: home ? "#c9a24a" : "#3ec8c1",
  };
}

function snow(team: "home" | "away"): ProjectileLook {
  return {
    id: "snowball",
    team,
    dye: "#eef6ff",
    color: "#d7e8f4",
    body: "#f7fbff",
    accent: "#c5d6e4",
    metal: "#ffffff",
  };
}

function spark(color: string | undefined, team: "home" | "away"): ProjectileLook {
  const ink = color && color.length > 0 ? color : SPARK;
  return {
    id: "ability-spark",
    team,
    dye: "#fff6e4",
    color: ink,
    body: ink,
    accent: ink,
    metal: "#fff6e4",
  };
}

function fromWeapon(type: WeaponType, colors: WeaponColors, team: "home" | "away", passed?: string): ProjectileLook {
  const id = WEAPON_LOOK[type];
  const base: ProjectileLook = {
    id,
    team,
    dye: colors.accent,
    color: passed && passed.length > 0 ? passed : colors.accent,
    body: colors.body,
    accent: colors.accent,
    metal: colors.metal,
  };
  if (type === "nerf-launcher") return foam("nerf-blue", team);
  if (type === "prompter") {
    return { ...base, body: "#1a3a6e", accent: "#f0c14a", metal: "#f7f1e4", dye: "#fffef8", color: "#f0c14a" };
  }
  if (type === "vine-crossbow" || type === "vine-bow") {
    return { ...base, body: "#6b4226", metal: "#d5dce2", dye: colors.accent, color: "#efe6d6" };
  }
  if (type === "horn") {
    return { ...base, body: "#e6c56a", accent: "#fff1c4", metal: colors.body, dye: "#8a6a28", color: "#e6c56a" };
  }
  if (type === "pipette") {
    return { ...base, body: "#1f8a45", accent: "#7dff9a", metal: "#e7fff3", dye: "#b8ffd0", color: colors.accent };
  }
  if (type === "camera") {
    return { ...base, body: "#1a1c1e", accent: "#ffe14a", metal: "#fff6e4", dye: "#ffffff", color: "#ffe14a" };
  }
  if (type === "dossier") {
    return { ...base, body: "#121216", accent: colors.accent, metal: "#f4efe4", dye: "#fffef8", color: colors.accent };
  }
  if (type === "flash") {
    return { ...base, body: "#fffef8", accent: "#ffe14a", metal: "#fff6e4", dye: "#ffffff", color: "#fffef8" };
  }
  if (type === "stud-carbine") {
    return { ...base, dye: "#fff6e4", color: colors.accent };
  }
  return base;
}

function arrow(team: "home" | "away"): ProjectileLook {
  const home = team === "home";
  return {
    id: home ? "arrow-home" : "arrow-away",
    team,
    body: "#6b4226",
    metal: "#d5dce2",
    accent: home ? "#c4161c" : "#3ec8c1",
    dye: "#fff6e4",
    color: home ? "#2a4fa0" : "#0d5c56",
  };
}

function tower(team: "home" | "away"): ProjectileLook {
  if (team === "home") {
    return {
      id: "tower-pennant",
      team,
      body: "#8a3a28",
      accent: "#c4161c",
      dye: "#fff6e4",
      color: "#2a4fa0",
      metal: "#c9a24a",
    };
  }
  return {
    id: "tower-teal",
    team,
    body: "#0d4a46",
    accent: "#3ec8c1",
    dye: "#d8fff8",
    color: "#147a74",
    metal: "#9ee8e0",
  };
}

function ancient(team: "home" | "away"): ProjectileLook {
  if (team === "home") {
    return {
      id: "capitol-chip",
      team,
      body: "#c9a24a",
      accent: "#c4161c",
      dye: "#fff6e4",
      color: "#f0d078",
      metal: "#8a6a22",
    };
  }
  return {
    id: "needle-splinter",
    team,
    body: "#0d4a46",
    accent: "#3ec8c1",
    dye: "#e8fff8",
    color: "#ff4d8d",
    metal: "#9ee8e0",
  };
}

export function asProjectileSource(raw: string | undefined): ProjectileSource | undefined {
  if (raw === "hero" || raw === "tower" || raw === "ancient" || raw === "archer" || raw === "spell") return raw;
  return undefined;
}

/** Sprite choice for one shot. Unknown shots resolve to a default spark. */
export function projectileLook(shot?: ProjectileShot | null): ProjectileLook {
  const row = shot ?? {};
  const team = side(row.team);
  const ammo = row.ammo;
  if (ammo === "nerf-blue" || ammo === "nerf-orange") return foam(ammo, team);
  if (ammo === "can" || ammo === "bottle") return junk(ammo, team);
  if (row.source === "spell") return spark(row.color, team);
  if (row.heroId === SNOWBALL_HERO_ID) return snow(team);
  if (typeof row.heroId === "string" && row.heroId) {
    const spec = heroWeapon(row.heroId);
    if (spec) return fromWeapon(spec.type, spec.colors, team, row.color);
  }
  if (row.source === "tower") return tower(team);
  if (row.source === "ancient") return ancient(team);
  if (row.source === "archer") return arrow(team);
  return spark(row.color, team);
}
