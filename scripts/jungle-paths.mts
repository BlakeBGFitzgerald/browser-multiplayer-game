/**
 * Connectivity check for the jungle grid. Run: npx vite-node scripts/jungle-paths.mts
 * Exits 1 when a camp, road, lane, or pocket is sealed, or a trunk cell is still open.
 */
import { CAMPS } from "../src/game/battlefield.ts";
import {
  CLEARINGS,
  HIDEOUTS,
  JUNGLE_ROUTES,
  TRUNKS,
  hideoutBreaksSight,
  inHideout,
} from "../src/game/jungle.ts";
import {
  BACK_TRACKS,
  JUNGLE_CAMPS,
  LANES,
  along,
  ancientPos,
  fountain,
  isWalkable,
  lanePath,
  findPath,
  towers,
} from "../src/game/map.ts";

const fails: string[] = [];

function ok(cond: boolean, msg: string): void {
  if (!cond) fails.push(msg);
}

function connected(ax: number, ay: number, bx: number, by: number, label: string): void {
  const path = findPath(ax, ay, bx, by);
  const start = path[0];
  const end = path[path.length - 1];
  if (!start || !end) {
    fails.push(`${label} empty`);
    return;
  }
  const same =
    Math.floor(ax / 50) === Math.floor(bx / 50) && Math.floor(ay / 50) === Math.floor(by / 50);
  const startD = Math.hypot(start.x - ax, start.y - ay);
  const endD = Math.hypot(end.x - bx, end.y - by);
  ok(path.length > 1 || same, `${label} no path`);
  ok(startD < 90, `${label} start ${startD.toFixed(0)}`);
  ok(endD < 80, `${label} end ${endD.toFixed(0)}`);
}

for (const c of JUNGLE_CAMPS) ok(isWalkable(c.x, c.y), `camp sealed ${c.name}`);
for (const h of HIDEOUTS) ok(isWalkable(h.x, h.y), `pocket sealed ${h.name}`);
for (const c of CLEARINGS) ok(isWalkable(c.x, c.y), `clearing sealed ${c.name}`);
for (const camp of CAMPS) ok(isWalkable(camp.x, camp.y), `objective sealed ${camp.name}`);
ok(isWalkable(fountain.home.x, fountain.home.y), "home fountain");
ok(isWalkable(fountain.away.x, fountain.away.y), "away fountain");
ok(isWalkable(ancientPos.home.x, ancientPos.home.y), "home ancient");
ok(isWalkable(ancientPos.away.x, ancientPos.away.y), "away ancient");
ok(isWalkable(1300, 1300), "river");

for (const lane of LANES) {
  const path = lanePath.home[lane];
  for (let t = 0; t <= 1; t += 0.02) {
    const p = along(path, t);
    ok(isWalkable(p.x, p.y), `lane ${lane} @ ${t.toFixed(2)}`);
  }
}
for (const tower of towers) ok(isWalkable(tower.pos.x, tower.pos.y), `tower ${tower.team} ${tower.lane} ${tower.tier}`);

for (const t of TRUNKS) ok(!isWalkable(t.x, t.y), `trunk open ${t.cluster} ${t.x},${t.y}`);

connected(fountain.home.x, fountain.home.y, fountain.away.x, fountain.away.y, "fountain to fountain");
for (const c of JUNGLE_CAMPS) {
  connected(c.x, c.y, fountain.home.x, fountain.home.y, `${c.name} to DC`);
  connected(c.x, c.y, fountain.away.x, fountain.away.y, `${c.name} to Seattle`);
}
for (const h of HIDEOUTS) {
  connected(h.x, h.y, h.mouth.x, h.mouth.y, `${h.name} mouth`);
  connected(h.x, h.y, fountain.home.x, fountain.home.y, `${h.name} to DC`);
}
for (const route of JUNGLE_ROUTES) {
  const a = route.path[0]!;
  const b = route.path[route.path.length - 1]!;
  connected(a.x, a.y, b.x, b.y, route.name);
}
for (const track of BACK_TRACKS) {
  const a = track.path[0]!;
  const b = track.path[track.path.length - 1]!;
  connected(a.x, a.y, b.x, b.y, track.name);
}

let sightBroken = 0;
for (const h of HIDEOUTS) {
  ok(inHideout(h.x, h.y)?.name === h.name, `inHideout ${h.name}`);
  const dx = h.x - h.mouth.x;
  const dy = h.y - h.mouth.y;
  const len = Math.hypot(dx, dy) || 1;
  const awayX = h.x + (dx / len) * 280;
  const awayY = h.y + (dy / len) * 280;
  const blocked = hideoutBreaksSight(awayX, awayY, h.x, h.y);
  const mouthOpen = hideoutBreaksSight(h.mouth.x, h.mouth.y, h.x, h.y);
  if (blocked) sightBroken += 1;
  ok(!mouthOpen, `${h.name} mouth still hides`);
  ok(blocked, `${h.name} no vision break from the back`);
}

console.log(
  JSON.stringify(
    {
      trunks: TRUNKS.length,
      sight: TRUNKS.filter((t) => t.sight).length,
      routes: JUNGLE_ROUTES.map((r) => r.name),
      pockets: HIDEOUTS.map((h) => h.name),
      sightBroken,
      fails,
    },
    null,
    2,
  ),
);
if (fails.length) process.exit(1);
