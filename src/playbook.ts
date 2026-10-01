import { abilityImg, artImg } from "./game/art";
import { HUMAN_HEROES, attrLabel, wingHeroes, type Ability, type AbilityKind, type CastFx, type HeroDef, type Wing } from "./game/heroes";
import { bandLabel, diffLabel, diffStars, kitPatch } from "./game/kits";

export type Bind = {
  keys: string[];
  does: string;
};

export type BindGroup = {
  id: string;
  heading: string;
  lines: Bind[];
};

export const BIND_GROUPS: BindGroup[] = [
  {
    id: "walk",
    heading: "Camera and walk",
    lines: [
      { keys: ["Arrows"], does: "Pan the camera. The kit keeps moving. Space snaps back onto you." },
      { keys: ["RMB"], does: "Walk to that ground. Drops a locked target." },
      { keys: ["Tap"], does: "On a phone: tap ground to walk. Tap a creep or hero to lock gold brackets." },
      { keys: ["Drag"], does: "On a phone: drag the map to pan. Snap on the HUD puts the camera back on you." },
      { keys: ["LMB"], does: "Walk to that ground, or lock a creep or hero if you click one." },
      { keys: ["Space"], does: "Snap the camera onto your kit. In Watch AI and the enter demo it snaps onto @blake or @lilhooligan." },
      { keys: ["Tab"], does: "Hold to see both teams: level, K/D/A, and creep score. Release to close." },
      { keys: ["F11"], does: "Fullscreen this tab." },
    ],
  },
  {
    id: "target",
    heading: "Targets",
    lines: [
      { keys: ["A"], does: "Choose a target. Hover a creep or hero and tap A to lock them. Gold brackets stay on that one until it dies or you pick someone else. If nothing is under the cursor, A waits for a click." },
      { keys: ["S"], does: "Stop. Drop the path, the lock, and attack-move." },
      { keys: ["Z"], does: "Attack-move. The next click walks there and fights on the way." },
      { keys: ["—"], does: "No lock means auto-attack: your kit hits the nearest rival in range." },
    ],
  },
  {
    id: "cast",
    heading: "Skills",
    lines: [
      { keys: ["Q", "W", "E", "R"], does: "Cast that kit’s four skills. R unlocks at level 6. Click the skill buttons on the HUD if you would rather tap." },
      { keys: ["X"], does: "Also casts Q." },
      { keys: ["C"], does: "Also casts E." },
      { keys: ["F"], does: "Also casts R." },
    ],
  },
  {
    id: "desk",
    heading: "Shop, pause, AI",
    lines: [
      { keys: ["B"], does: "Gift Shop. Stand in your fountain pool to spend match gold." },
      { keys: ["Esc"], does: "Pause. Resume or leave campus from that overlay." },
      { keys: ["P"], does: "Expert AI. Takes the keyboard and plays your kit. Tap P again to take it back." },
      { keys: ["/concede"], does: "If MAGA is losing after 1:30, call a concede vote. Every player on MAGA must vote yes. Bots do not vote. HUD Concede does the same." },
      { keys: ["/yes", "/no"], does: "Vote on a kick in the wait room, or on a concede in a match. HUD Yes / No work too." },
    ],
  },
  {
    id: "voice",
    heading: "Voice and music",
    lines: [
      { keys: ["T"], does: "Hold to talk with your team on the mic." },
      { keys: ["G"], does: "Hold to talk to everyone. Spectators cannot Talk. They type." },
      { keys: ["Mute"], does: "HUD Mute cuts the anthem only. Combat clinks, tings, coin drops, barks, and the ring announcer keep playing. Music On / Off, Next (restarts the anthem), and Volume sit on the bar at the top." },
      { keys: ["Enter with sound"], does: "Browsers keep this tab silent until a click. That first press plays the entrance sting and starts combat, the ring desk, and The Star-Spangled Banner in this tab. Nothing extra to download." },
    ],
  },
];

function kindLabel(kind: AbilityKind): string {
  if (kind === "point") return "Ground";
  if (kind === "unit") return "Target";
  if (kind === "self") return "Self";
  return "Dash";
}

function kindHint(kind: AbilityKind): string {
  if (kind === "point") return "Aim at the ground.";
  if (kind === "unit") return "Needs a rival in range.";
  if (kind === "self") return "Fires on you.";
  return "You travel toward the cursor.";
}

function fxLabel(fx: CastFx): string {
  if (fx === "cone") return "Cone";
  if (fx === "dash") return "Dash";
  if (fx === "aspd") return "Attack speed";
  if (fx === "nova") return "Nova";
  if (fx === "bolt") return "Bolt";
  if (fx === "slow") return "Slow";
  if (fx === "stun") return "Stun";
  if (fx === "shield") return "Shield";
  if (fx === "taunt") return "Taunt";
  if (fx === "dashnova") return "Charge";
  if (fx === "heal") return "Heal";
  return "Rain";
}

function rangeLine(ab: Ability): string {
  if (ab.kind === "self" || ab.range <= 0) return "Self";
  return `${ab.range} range`;
}

function searchBlob(h: HeroDef): string {
  const kit = kitPatch(h.id);
  const abs = h.abilities.map((a) => `${a.key} ${a.name} ${a.blurb}`).join(" ");
  const pas = `${kit.passive.name} ${kit.passive.blurb}`;
  return `${h.id} ${h.name} ${h.title} ${h.role} ${kit.band} ${kit.style} ${attrLabel(h.attr)} ${h.wing} ${h.wing === "mma" ? "dlc mma" : h.dlc ? "dlc wildcard" : ""} ${pas} ${abs} ${kit.bio}`.toLowerCase();
}

function abilityCard(ab: Ability, heroId: string): string {
  const ult = ab.key === "R" ? `<span class="kit-ult">Unlocks at 6</span>` : "";
  return `<article class="kit-ab">
    ${abilityImg(heroId, ab.key, ab.name)}
    <p class="kit-ab-head"><kbd>${ab.key}</kbd><b>${ab.name}</b>${ult}</p>
    <p class="kit-ab-meta">${fxLabel(ab.fx)} · ${kindLabel(ab.kind)} · ${ab.mana} mana · ${ab.cd}s · ${rangeLine(ab)}</p>
    <p>${ab.blurb} ${kindHint(ab.kind)}</p>
  </article>`;
}

function kitCard(h: HeroDef): string {
  const kit = kitPatch(h.id);
  const reach = h.melee ? "Melee" : "Ranged";
  const wing = h.wing === "campus" ? h.attr : h.wing;
  const badge = h.dlc ? `<span class="kit-dlc">DLC</span>` : "";
  return `<article class="kit-card" data-kit="${h.id}" data-attr="${h.attr}" data-wing="${h.wing}" data-search="${searchBlob(h)} ${wing}">
    ${artImg("hero", h.id, h.name, "kit-art")}
    <div class="kit-copy">
    <header>
      <h4>${h.name}${badge}</h4>
      <span class="kit-role">${attrLabel(h.attr)} · ${bandLabel(kit.band)} · ${h.role} · ${reach} · ${diffStars(kit.difficulty)} ${diffLabel(kit.difficulty)}</span>
    </header>
    <p class="kit-title">${h.title}</p>
    <p class="kit-bio">${kit.bio}</p>
    <p class="kit-passive">${abilityImg(h.id, "P", kit.passive.name)}<b>Passive · ${kit.passive.name}</b> ${kit.passive.blurb}</p>
    <p class="lede">${kit.personality} Playstyle: ${kit.style}</p>
    <p class="kit-stats">
      <span>${h.hp} HP</span>
      <span>${kit.hpRegen}/s HP</span>
      <span>${h.mana} mana</span>
      <span>${kit.manaRegen}/s mana</span>
      <span>${h.damage} dmg</span>
      <span>${h.range} atk range</span>
      <span>${h.ms} MS</span>
      <span>${h.armor} armor</span>
      <span>${kit.mr} MR</span>
    </p>
    <div class="kit-skills">${h.abilities.map((a) => abilityCard(a, h.id)).join("")}</div>
    </div>
  </article>`;
}

function wingGroup(wing: Wing, title: string): string {
  const kits = wingHeroes(wing);
  const jump = kits.map((h) => `<a href="#kit-${h.id}">${h.name}</a>`).join("");
  const cards = kits.map((h) => `<div id="kit-${h.id}">${kitCard(h)}</div>`).join("");
  return `<section class="faq-group playbook-group" id="playbook-${wing}" data-group="${wing}">
    <h3>${title} · ${kits.length}</h3>
    <nav class="playbook-names">${jump}</nav>
    <div class="kit-grid">${cards}</div>
  </section>`;
}

function bindTable(g: BindGroup): string {
  const rows = g.lines
    .map((b) => {
      const keys = b.keys.map((k) => (k === "—" ? `<span class="kit-none">Auto</span>` : `<kbd>${k}</kbd>`)).join("");
      return `<div class="bind-row"><div class="bind-keys">${keys}</div><p>${b.does}</p></div>`;
    })
    .join("");
  return `<section class="faq-group" id="playbook-${g.id}">
    <h3>${g.heading}</h3>
    <div class="bind-list">${rows}</div>
  </section>`;
}

export function playbookHtml(): string {
  const toc = [
    `<a href="#playbook-loop">Match</a>`,
    ...BIND_GROUPS.map((g) => `<a href="#playbook-${g.id}">${g.heading}</a>`),
    `<a href="#playbook-maga">Liberty</a>`,
    `<a href="#playbook-antifa">Progress</a>`,
    `<a href="#playbook-mma">MMA</a>`,
    `<a href="#playbook-wild">DLC / Wildcards</a>`,
    `<a href="#playbook-shop">Gift Shop</a>`,
  ].join("");

  return `<nav class="gp-toc" id="playbook-toc">${toc}</nav>
    <section class="faq-group" id="playbook-loop">
      <h3>How a match plays</h3>
      <p class="lede playbook-lede">Last-hit creeps for gold. Walk with the minion line. Top and bot have three towers — inner in front of town, middle midway, outer at the corner. Mid has an outer tower and an inner tower, and no middle tower. Then destroy the other town. MAGA fountain is bottom-left (Washington DC). Seattle fountain is top-right. <kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd> are this kit’s four skills — not camera, not aim. <kbd>A</kbd> chooses a target. <kbd>R</kbd> stays locked until level 6. Spend match gold in the fountain Gift Shop with <kbd>B</kbd>. Open How to play on the enter page for the first-match walkthrough. This page is every bind and every kit.</p>
    </section>
    ${BIND_GROUPS.map(bindTable).join("")}
    <div class="playbook-filter" id="playbook-filter">
      <p class="kicker">Kits</p>
      <p class="lede playbook-lede">Thirty-five playable kits: eleven Liberty / Tradition, nine Progress / Equality, six MMA DLC fighters, and nine unclassified Wildcard DLC kits. Search a name or a move.</p>
      <div class="row">
        <input id="playbook-q" maxlength="40" placeholder="Search kits and skills" autocomplete="off" />
        <button type="button" class="gold" data-attr="all">All</button>
        <button type="button" class="thin" data-attr="maga">Liberty</button>
        <button type="button" class="thin" data-attr="antifa">Progress</button>
        <button type="button" class="thin" data-attr="mma">MMA</button>
        <button type="button" class="thin" data-attr="wild">DLC / Wildcards</button>
      </div>
      <p class="lede" id="playbook-count">${HUMAN_HEROES.length} kits</p>
    </div>
    ${wingGroup("maga", "Liberty / Tradition")}
    ${wingGroup("antifa", "Progress / Equality")}
    ${wingGroup("mma", "MMA DLC")}
    ${wingGroup("wild", "DLC — Unclassified / Wildcards")}
    <p class="lede" id="playbook-empty" hidden>No kit matches that search. Clear the box or tap All.</p>
    <section class="faq-group" id="playbook-shop">
      <h3>Fountain Gift Shop</h3>
      <p class="lede playbook-lede">Stand in your pool and tap <kbd>B</kbd> or the Shop button. Search, categories, component trees, and a recommended build are on the shelf. Six item slots sit on the match HUD. The Gift Shop buys and sells into them. Match gold only — locker coins and Millix stay out of this shelf. Escape closes the shop before pause.</p>
    </section>`;
}
