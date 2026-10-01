
export type HowtoStep = {
  id: string;
  heading: string;
  body: string;
};

export const HOWTO_STEPS: HowtoStep[] = [
  {
    id: "sound",
    heading: "Wake the tab",
    body: "Browsers keep this tab silent until a click. Tap <strong>Enter with sound</strong>, <strong>Find Game</strong>, Practice, or Custom Game. That press unlocks combat, the desk, and The Star-Spangled Banner. <strong>Play every sound</strong> runs the catalog. Unmute this tab if the OS muted it. HUD Mute later only cuts the anthem. Combat keeps playing.",
  },
  {
    id: "queue",
    heading: "Queue a match",
    body: "Log in with <strong>Facebook</strong> or <strong>Gmail</strong>, or <strong>Sign up with email</strong>, then tap <strong>Find Game</strong>. One click opens the existing wait room and starts searching — MAGA seat 1 in Washington DC vs Antifa in Seattle. Party count and <strong>Cancel Search</strong> sit at the top. <strong>Practice / Training</strong> fills bots and opens draft. <strong>Custom Game</strong> is Watch AI. Chat while colors fill, or tap <strong>Enter draft</strong>. Idle JOINED seats can be kicked. Campus Book in that room takes one 100-gold slip an hour.",
  },
  {
    id: "draft",
    heading: "Lock a kit",
    body: "Thirty-five kits in three bands. <strong>FREE TO PLAY</strong> is eleven Liberty / Tradition (Red) and nine Progress / Equality (Blue). <strong>MMA DLC</strong> is six parody fighters — locked until you buy the pack. <strong>WILDCARDS</strong> are nine unclassified DLC kits. Each card shows name, title, role, difficulty, a short read, the passive, Q W E, and the ultimate. <strong>Random kit</strong> rolls owned kits only — unowned MMA stay out of that pool. The store sells the MMA DLC and the Wildcard Pack. Millix knocks 40% off the standard DLC sticker (the Millix price is 60% of normal). Each kit has four skills on <kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd>. Pick one, lock it, and drop into Washington DC.",
  },
  {
    id: "map",
    heading: "Read the campus",
    body: "The map is three streets through cliffed jungle. MAGA fountain is bottom-left — Washington DC, National Mall, reflecting pool. Seattle fountain is top-right — Elliott Bay, Space Needle, docks. <strong>Top</strong> runs to the top-left corner. <strong>Bot</strong> runs to the bottom-right. <strong>Mid</strong> crosses the river on a stone bridge. Named woods sit between the lanes. Packed-dirt back tracks run behind the streets for ganks. Top and bot have three towers: inner just in front of town, middle midway up the lane, outer near the map corner. Mid has two: an outer tower set back from the river and an inner tower closer to town. There is no middle tower on mid. You cannot skip a tower. The other town opens only after that street’s inner tower is down.",
  },
  {
    id: "fight",
    heading: "Walk, last-hit, fight",
    body: "On a computer: Right-click ground to walk. Arrows pan the camera. <kbd>Space</kbd> snaps back onto you. Last-hit creeps for gold — the coin pops on the killing blow. Walk with the minion line. Hover a creep or hero and tap <kbd>A</kbd> to lock gold brackets on that one. No lock means auto-attack: you hit the nearest rival in range. <kbd>S</kbd> stops. <kbd>Z</kbd> attack-moves. Cast <kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd> — <kbd>X</kbd> is also Q, <kbd>C</kbd> is E, <kbd>F</kbd> is R. <kbd>R</kbd> stays locked until level 6. On a phone: tap ground to walk, tap a creep or hero to lock, drag to pan. Stop / Snap / Lock sit on the HUD. Skill buttons cast Q W E R. Shop is on the bar — stand in the fountain.",
  },
  {
    id: "shop",
    heading: "Spend at the Gift Shop",
    body: "Stand in your fountain pool and tap <kbd>B</kbd>. Six item slots sit on the match HUD. The Gift Shop buys and sells into them. Match gold only — locker coins and Millix stay out of this shelf. Pick a build. The heat bar under the clock shows last-hits, XP to the next level, and the next buy.",
  },
  {
    id: "hud",
    heading: "Read the HUD",
    body: "Clock, <strong>K/D/A</strong>, gold, and <strong>CS</strong> (last-hits) sit on the top bar. K.D.R is your kill-death ratio this match. Pause, Mute, and Concede (when MAGA is losing after 1:30) sit up there too. Hold <kbd>T</kbd> to talk with MAGA on the mic. Hold <kbd>G</kbd> to talk to everyone. Spectators type. They cannot Talk. <kbd>Esc</kbd> pauses. <kbd>P</kbd> hands the kit to expert AI — tap P again to take it back. <kbd>F11</kbd> is fullscreen.",
  },
  {
    id: "win",
    heading: "Raze the other town",
    body: "Take the towers on a street — two on mid, three on top and bot — then destroy Seattle. That is a MAGA win. If Washington DC falls, you lose. First blood and the first tower pay the team. Hero kills stack a streak. Dying on a three-kill streak pays a shutdown. If MAGA is losing after 1:30 — fewer towers, less gold, a weaker town, or a kill deficit — tap <strong>Concede</strong> or type <kbd>/concede</kbd>. Every player on MAGA must vote yes. Bots do not vote. Campus seats auto-yes. One no or a 22-second timeout kills it, then a 40-second wait. A passed vote is a MAGA loss. Show-up coins still pay.",
  },
  {
    id: "watch",
    heading: "Watch without queuing",
    body: "The enter page already runs a live 5v5 with a hero fight on mid. Click that canvas or tap <strong>Watch AI</strong> for the full screen. Space snaps to the fight. Gallery seats (100,000 Millix) sit under the wait-room teams — type in chat, no Talk, no mic. Gallery watches do not flip campus. Kirk Cup and Tangled League are W-L boards, not a different map.",
  },
];

export function howtoHtml(): string {
  const toc = [
    ...HOWTO_STEPS.map((s) => `<a href="#howto-${s.id}">${s.heading}</a>`),
    `<a href="#howto-shop">Gift Shop</a>`,
    `<a href="#howto-keys">Binds</a>`,
  ].join("");
  const steps = HOWTO_STEPS.map(
    (s, i) => `<li class="howto-step" id="howto-${s.id}">
      <span class="howto-n">${i + 1}</span>
      <div>
        <h3>${s.heading}</h3>
        <p>${s.body}</p>
      </div>
    </li>`,
  ).join("");
  return `<nav class="gp-toc" id="howto-toc">${toc}</nav>
    <p class="lede playbook-lede">You play MAGA in this tab. No launcher. Last-hit, take towers, raze Seattle. Skills is every bind and every kit. FAQ is the short answers. This page is the first match.</p>
    <div class="howto-map" aria-hidden="true">
      <div class="howto-town away">Seattle · Antifa fountain</div>
      <div class="howto-lanes">
        <span>Top · outer at the top-left corner</span>
        <span>Mid · stone bridge</span>
        <span>Bot · outer at the bottom-right corner</span>
      </div>
      <div class="howto-town home">Washington DC · MAGA fountain</div>
    </div>
    <ol class="howto-steps">${steps}</ol>
    <section class="faq-group" id="howto-shop">
      <h3>Fountain Gift Shop</h3>
      <p class="lede playbook-lede">Stand in your pool and tap <kbd>B</kbd> or the Shop button. Search, categories, component trees, and a recommended build are on the shelf. Match gold only. Escape closes the shop before pause.</p>
    </section>
    <section class="faq-group" id="howto-keys">
      <h3>Binds you need on minute one</h3>
      <div class="bind-list">
        <div class="bind-row"><div class="bind-keys"><kbd>RMB</kbd></div><p>Walk to that ground.</p></div>
        <div class="bind-row"><div class="bind-keys"><kbd>A</kbd></div><p>Lock a creep or hero. Gold brackets stay on that one.</p></div>
        <div class="bind-row"><div class="bind-keys"><kbd>Q</kbd><kbd>W</kbd><kbd>E</kbd><kbd>R</kbd></div><p>This kit’s four skills. R at level 6.</p></div>
        <div class="bind-row"><div class="bind-keys"><kbd>B</kbd></div><p>Gift Shop. Stand in the fountain pool.</p></div>
        <div class="bind-row"><div class="bind-keys"><kbd>Space</kbd></div><p>Snap the camera onto you.</p></div>
      </div>
      <p class="lede playbook-lede">Every other bind — camera, attack-move, mic, concede, Mute — lives on Skills.</p>
    </section>
    <div class="howto-cta">
      <button type="button" class="red" data-howto="play">Find Game</button>
      <button type="button" class="gold" data-howto="watch">Watch AI</button>
      <button type="button" class="gold" data-howto="skills">Skills</button>
      <button type="button" class="thin" data-howto="faq">FAQ</button>
    </div>`;
}
