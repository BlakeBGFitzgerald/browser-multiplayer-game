/**
 * Where an AI hero stands relative to the friendly creep wave.
 * The route graph still does the walking. This only picks the goal.
 */

import { POOL_RADIUS, poolSpawn, type SpawnPt } from "./baseSpawn.ts";

export type FormationRole = "tank" | "melee" | "ranged" | "support";

export type WaveDuty =
  | "WAITING_IN_BASE"
  | "PREPARING"
  | "MOVING_TO_LANE_START"
  | "WAITING_AT_LANE_START"
  | "FOLLOWING_CREEP_WAVE"
  | "APPROACHING_FRONTLINE"
  | "ENGAGING";

export type WaveLeader = {
  x: number;
  y: number;
  /** Distance from this team's fountain. Ahead of the base means past the pool. */
  fromFountain: number;
  /** Distance this creep has walked from the spot it spawned. 0 means it has not moved. */
  advanced: number;
};

export type WaveGoal = {
  duty: WaveDuty;
  x: number;
  y: number;
  /** Close enough to the formation to fight with the wave. */
  atFront: boolean;
};

/** The line has started advancing once its leader has walked this far from spawn. */
export const WAVE_ADVANCE = 40;

/** Past the pool rim. A creep that only shuffles inside the water has not left. */
export const BASE_CLEAR = POOL_RADIUS + 48;

/** How close a hero must be to the formation point to count as with the wave. */
export const APPROACH_DIST = 110;

/** Leader sample period. Spread by id so ten heroes do not rebuild on the same tick. */
export const WAVE_REFRESH_LO = 0.48;
export const WAVE_REFRESH_STEP = 0.08;

const BACK: Record<FormationRole, number> = {
  tank: 46,
  melee: 78,
  ranged: 136,
  support: 170,
};

/** Side step so two heroes on one wave do not share a point or plug the lane. */
const SIDE: Record<FormationRole, number> = {
  tank: 26,
  melee: 42,
  ranged: 30,
  support: 34,
};

/** How far behind the lane entrance each role waits. Still outside the pool. */
export const LANE_HOLD: Record<FormationRole, number> = {
  tank: 16,
  melee: 34,
  ranged: 56,
  support: 76,
};

/**
 * First lane point that is clearly outside the pool.
 * A creep spawn tucked inside the water is not a battle start.
 */
export const LANE_CLEAR = POOL_RADIUS + LANE_HOLD.support + 64;

/** Walk the lane polyline and stop at the first point past the pool. */
export function laneBattleStart(path: readonly SpawnPt[], fountain: SpawnPt, clear = LANE_CLEAR): SpawnPt {
  for (const p of path) {
    if (Math.hypot(p.x - fountain.x, p.y - fountain.y) >= clear) return { x: p.x, y: p.y };
  }
  const last = path[path.length - 1];
  return last ? { x: last.x, y: last.y } : { x: fountain.x, y: fountain.y };
}

/**
 * Waypoints along this lane from the hero toward the goal.
 * Vertices farther from the goal than the hero are dropped, so a refresh
 * cannot send them back through the fountain or across into another lane.
 */
export function laneApproach(hero: SpawnPt, poly: readonly SpawnPt[], goal: SpawnPt): SpawnPt[] {
  const goalPt = { x: goal.x, y: goal.y };
  if (poly.length === 0) return [goalPt];
  const goalD = Math.hypot(goal.x - hero.x, goal.y - hero.y);
  let from = 0;
  let fromD = Infinity;
  let to = 0;
  let toD = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const hd = Math.hypot(p.x - hero.x, p.y - hero.y);
    const gd = Math.hypot(p.x - goal.x, p.y - goal.y);
    if (hd < fromD) {
      fromD = hd;
      from = i;
    }
    if (gd < toD) {
      toD = gd;
      to = i;
    }
  }
  const step = to >= from ? 1 : -1;
  const pts: SpawnPt[] = [];
  for (let i = from; ; i += step) {
    const p = poly[i]!;
    if (Math.hypot(p.x - goal.x, p.y - goal.y) + 20 < goalD) pts.push({ x: p.x, y: p.y });
    if (i === to) break;
  }
  const last = pts[pts.length - 1];
  if (!last || Math.hypot(last.x - goal.x, last.y - goal.y) > 28) pts.push(goalPt);
  while (pts.length > 1 && Math.hypot(pts[0]!.x - hero.x, pts[0]!.y - hero.y) < 36) pts.shift();
  return pts;
}

export function waveRefreshSeconds(id: number): number {
  return WAVE_REFRESH_LO + (Math.abs(id) % 4) * WAVE_REFRESH_STEP;
}

/** Shop role to a formation seat. Brawlers stand with the melee line. */
export function formationRole(role: string): FormationRole {
  if (role === "tank") return "tank";
  if (role === "support") return "support";
  if (role === "ranged") return "ranged";
  return "melee";
}

/**
 * The wave has left the fountain when its leader is ahead of the base
 * and has actually walked. A creep that spawned on the lane but has not
 * moved does not release the heroes.
 */
export function waveHasLeft(leader: { fromFountain: number; advanced: number } | null): boolean {
  if (!leader) return false;
  if (leader.advanced < WAVE_ADVANCE) return false;
  if (leader.fromFountain <= BASE_CLEAR) return false;
  return true;
}

/** Behind the leader, along the fountain → leader axis. Never past the leader. */
export function formationPoint(fountain: SpawnPt, leader: SpawnPt, role: FormationRole, slot: number): SpawnPt {
  const dx = leader.x - fountain.x;
  const dy = leader.y - fountain.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = dx / len;
  const ny = dy / len;
  const back = BACK[role];
  const side = ((slot % 3) - 1) * SIDE[role];
  let x = leader.x - nx * back - ny * side;
  let y = leader.y - ny * back + nx * side;
  const along = (x - fountain.x) * nx + (y - fountain.y) * ny;
  const leadAlong = (leader.x - fountain.x) * nx + (leader.y - fountain.y) * ny;
  if (along > leadAlong - 8) {
    const pull = along - (leadAlong - 8);
    x -= nx * pull;
    y -= ny * pull;
  }
  return { x, y };
}

/**
 * Seat just behind the lane entrance, toward the fountain, stepped off the creep line.
 * The entrance itself stays free for the wave.
 */
export function laneStartHold(
  fountain: SpawnPt,
  start: SpawnPt,
  role: FormationRole,
  slot: number,
): SpawnPt {
  const dx = start.x - fountain.x;
  const dy = start.y - fountain.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = dx / len;
  const ny = dy / len;
  const back = LANE_HOLD[role];
  const side = ((slot % 3) - 1) * SIDE[role];
  return {
    x: start.x - nx * back - ny * side,
    y: start.y - ny * back + nx * side,
  };
}

/**
 * Buy in the pool, then walk to this lane's entrance even if no creeps have moved.
 * Follow the wave only after the hero has reached that entrance and the wave has left.
 * A dead hero gets no goal.
 */
export function waveGoal(q: {
  alive: boolean;
  preparing: boolean;
  fountain: SpawnPt;
  seat: number;
  role: FormationRole;
  slot: number;
  laneStart: SpawnPt;
  leader: WaveLeader | null;
  heroX: number;
  heroY: number;
  engaging?: boolean;
}): WaveGoal | null {
  if (!q.alive) return null;
  const pool = poolSpawn(q.fountain, q.seat);
  if (q.preparing) {
    return { duty: "PREPARING", x: pool.x, y: pool.y, atFront: false };
  }
  const hold = laneStartHold(q.fountain, q.laneStart, q.role, q.slot);
  const atLane = Math.hypot(q.heroX - hold.x, q.heroY - hold.y) <= APPROACH_DIST;
  const holdFromBase = Math.hypot(hold.x - q.fountain.x, hold.y - q.fountain.y);
  const heroFromBase = Math.hypot(q.heroX - q.fountain.x, q.heroY - q.fountain.y);
  const pastEntrance = heroFromBase >= holdFromBase - 8;
  if (!waveHasLeft(q.leader) || (!atLane && !pastEntrance)) {
    return {
      duty: atLane ? "WAITING_AT_LANE_START" : "MOVING_TO_LANE_START",
      x: hold.x,
      y: hold.y,
      atFront: false,
    };
  }
  const leader = q.leader!;
  const pt = formationPoint(q.fountain, leader, q.role, q.slot);
  if (q.engaging) {
    return { duty: "ENGAGING", x: pt.x, y: pt.y, atFront: true };
  }
  const near = Math.hypot(q.heroX - pt.x, q.heroY - pt.y) <= APPROACH_DIST;
  return {
    duty: near ? "APPROACHING_FRONTLINE" : "FOLLOWING_CREEP_WAVE",
    x: pt.x,
    y: pt.y,
    atFront: near,
  };
}

/** Junglers walk out with the first wave before they leave for a camp. */
export const JUNGLE_PEEL_AT = 15;

/**
 * Jungle is a later peel. The hero must have stood with a wave once,
 * a friendly wave must still be alive, and that lane must not be in a fight.
 */
export function mayPeelToJungle(
  jungler: boolean,
  joinedWave: boolean,
  laneInFight: boolean,
  waveAlive: boolean,
  clock = JUNGLE_PEEL_AT,
): boolean {
  return jungler && joinedWave && waveAlive && !laneInFight && clock >= JUNGLE_PEEL_AT;
}
