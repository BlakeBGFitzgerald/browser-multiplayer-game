import { kitPatch } from "./kits.ts";

/** Voice-side multi-kill. Separate from killer.streak and shutdown gold. */
export const KILL_VOICE = {
  window: 12,
  settle: 0.45,
  cooldown: 2.6,
  volume: 1,
  rng: Math.random,
};

const RANK_ORDER = ["penta", "quad", "triple", "double", "kill"] as const;

export type KillRank = (typeof RANK_ORDER)[number];

export type KillPack = Record<KillRank, readonly string[]>;

export type MultiMark = {
  count: number;
  at: number;
};

export type KillCue = {
  unitId: number;
  heroId: string;
  home: boolean;
  n: number;
  playAt: number;
  line?: string;
};

export type KillCredit = {
  unitId: number;
  heroId: string;
  home: boolean;
  playAt: number;
};

function lines(kill: string[], double: string[], triple: string[], quad: string[], penta: string[]): KillPack {
  return { kill, double, triple, quad, penta };
}

export const KILL_PACKS: Record<string, KillPack> = {
  "maga-grumptor": lines(
    ["Grab them by the pussy!"],
    ["Two. Back to back.", "Double. The base saw it."],
    ["Three. They're dropping.", "Triple. Keep the rally hot."],
    ["Four. The whole row.", "Quad. Nobody out-talks this."],
    ["Five. Total domination.", "Penta. The stage is mine."],
  ),
  "maga-quirk": lines(
    ["Told you.", "Write that down."],
    ["Two. The pattern starts.", "Double. Listen closer."],
    ["Three. It's all connected.", "Triple. The whisper's getting loud."],
    ["Four. You can hear it now.", "Quad. The campus is in on it."],
    ["FIVE. THE WHOLE BOARD.", "PENTA. I SAID LOOK."],
  ),
  "maga-tommy": lines(
    ["Down.", "Next."],
    ["Two.", "Again."],
    ["Three. Street's mine.", "Triple. Hold the line."],
    ["Four. Still standing.", "Quad. Keep marching."],
    ["Five. The march holds.", "Penta. Whole road. Mine."],
  ),
  "maga-elonmolk": lines(
    ["Posted.", "Shipped."],
    ["Double deploy.", "Two. Boosters lit."],
    ["Triple launch.", "Three. The timeline spikes."],
    ["Quad burn.", "Four. The rocket's bored."],
    ["Five. Full stack.", "Penta. The feed is mine."],
  ),
  "maga-rogentor": lines(
    ["Wild.", "That's a clip."],
    ["Two guests down.", "Double. Pull that bit."],
    ["Three. The pod's cooking.", "Triple. We're going long."],
    ["Four. This episode's nuts.", "Quad. Stay for the hour."],
    ["Five. Clip the whole show.", "Penta. The mic stays hot."],
  ),
  "maga-alexgroans": lines(
    ["The frogs are gay."],
    ["Two of them. The pond's loud.", "Double. Stay on the line."],
    ["Three. The hour spikes.", "Triple. Turn the booth up."],
    ["Four. The broadcast's nuclear.", "Quad. I'm still on the air."],
    ["Five. The whole show.", "Penta. Nobody hangs up."],
  ),
  "maga-boris": lines(
    ["Sorted.", "Jolly good."],
    ["Two. Splendid mess.", "Double. I say."],
    ["Three. Rather enormous.", "Triple. The chamber roars."],
    ["Four. Bluster wins.", "Quad. What a stunt."],
    ["Five. History, chaps.", "Penta. The whole bally lot."],
  ),
  "maga-brander": lines(
    ["Sponsored.", "And we're back."],
    ["Two. Buy the drop.", "Double feature."],
    ["Three. The brand pops.", "Triple the offer."],
    ["Four. Limited time.", "Quad deal. Huge."],
    ["Five. Sold out.", "Penta. The whole campaign."],
  ),
  "maga-vestyt": lines(
    ["Next.", "Cut."],
    ["Two. Runway.", "Double drop."],
    ["Three. The fit slaps.", "Triple. Chaos."],
    ["Four. Sunday.", "Quad. I changed the show."],
    ["Five. Genius.", "Penta. The whole hall."],
  ),
  "maga-steers": lines(
    ["Ride on.", "Yeehaw."],
    ["Two steers.", "Double herd."],
    ["Three. Round them up.", "Triple. The rope's hot."],
    ["Four. Stampede.", "Quad. Hold the reins."],
    ["Five. Whole ranch.", "Penta. The drive is mine."],
  ),
  "maga-hooli": lines(
    ["Noted.", "Shipped."],
    ["Two. Synergy.", "Double quarter."],
    ["Three. Scale it.", "Triple. The deck updates."],
    ["Four. We close.", "Quad. Market's ours."],
    ["Five. Category king.", "Penta. The board stands."],
  ),
  "maga-ricky": lines(
    ["Got 'em.", "There it is."],
    ["Two. No way.", "Double. C'mon."],
    ["Three. You seeing this?", "Triple. I'm fine."],
    ["Four. This is ridiculous.", "Quad. Still here."],
    ["Five. Tell the boys.", "Penta. The whole yard."],
  ),
  "maga-bushed": lines(
    ["Mission done.", "Appreciate you."],
    ["Two. Stay the course.", "Double. Good folks."],
    ["Three. The ranch holds.", "Triple. We're steady."],
    ["Four. Full briefing.", "Quad. The coalition."],
    ["Five. The surge lands.", "Penta. The whole map holds."],
  ),
  "lw-bitenten": lines(
    ["With me.", "Together."],
    ["Two. Hold the chant.", "Double the line."],
    ["Three. We stay up.", "Triple. Louder."],
    ["Four. The hall's ours.", "Quad. Everybody in."],
    ["Five. The whole room.", "Penta. All together now."],
  ),
  "lw-sandbags": lines(
    ["Bagged.", "One stacked."],
    ["Two sandbags.", "Double. Stack the line."],
    ["Three. Hold the corner.", "Triple the barricade."],
    ["Four. Logistics win.", "Quad. Water's still up."],
    ["Five. The block is set.", "Penta. Whole march supplied."],
  ),
  "lw-odramma": lines(
    ["Look.", "This moment."],
    ["Two. The lawn leans in.", "Double. Rise with it."],
    ["Three. The aisle is listening.", "Triple. Louder on the lawn."],
    ["Four. The speech climbs.", "Quad. History leans."],
    ["Five. The whole campus.", "Penta. The close lands."],
  ),
  "lw-harass": lines(
    ["Ratio.", "Noted."],
    ["Two. Pile on.", "Double tap the quote."],
    ["Three. The thread's moving.", "Triple. Don't reply."],
    ["Four. The quote's buried.", "Quad. It's a pile-on."],
    ["Five. The timeline bends.", "Penta. Whole feed. Mine."],
  ),
  "lw-hocking": lines(
    ["Incorrect.", "Read the note."],
    ["Two errors.", "Double the footnote."],
    ["Three. The model holds.", "Triple. Sit with the math."],
    ["Four. The seminar ends.", "Quad. That paper fails."],
    ["Five. The thesis closes.", "Penta. Whole hall. Quiet."],
  ),
  "lw-youngturkey": lines(
    ["Clip that.", "Posted."],
    ["Two. The panel gasps.", "Double segment."],
    ["Three. I'm trending.", "Triple the take."],
    ["Four. Prime time.", "Quad. Book the hour."],
    ["Five. The chyron's mine.", "Penta. Whole show. Mine."],
  ),
  "lw-vakxie": lines(
    ["Data.", "Confirmed."],
    ["Two. The curve dips.", "Double. The bench agrees."],
    ["Three. Trust the chart.", "Triple the readout."],
    ["Four. Significant.", "Quad. The protocol holds."],
    ["Five. Nationwide.", "Penta. The whole study."],
  ),
  "lw-climate": lines(
    ["Now.", "The clock."],
    ["Two. The alarm doubles.", "Double. Heat's up."],
    ["Three. Act.", "Triple. The dome builds."],
    ["Four. No delay left.", "Quad. The sky answers."],
    ["Five. The planet calls it.", "Penta. Whole weather. Mine."],
  ),
  "lw-journalist": lines(
    ["Breaking.", "Exclusive."],
    ["Two. Developing.", "Double the lede."],
    ["Three. Front page.", "Triple byline."],
    ["Four. Stop the presses.", "Quad. The story's mine."],
    ["Five. Banner headline.", "Penta. The whole edition."],
  ),
  "mma-macgregor": lines(
    ["Who the fook is that guy?"],
    ["Two. Proper scrap.", "Double. The left is busy."],
    ["Three. Dance card's full.", "Triple. The cage looks over."],
    ["Four. Money walk.", "Quad. The octagon knows."],
    ["Five. Notorious night.", "Penta. The whole card. Done."],
  ),
  "mma-nurmagoat": lines(
    ["On the mat.", "Down."],
    ["Two. Stay grounded.", "Double pressure."],
    ["Three. The grind.", "Triple. The fence holds."],
    ["Four. Humble work.", "Quad. No way out."],
    ["Five. The eagle eats.", "Penta. Whole cage. Mine."],
  ),
  "mma-jonesy": lines(
    ["Reach.", "Elbow."],
    ["Two. Long read.", "Double the range."],
    ["Three. I saw that.", "Triple. Fight math."],
    ["Four. Champion's count.", "Quad. The elbows land."],
    ["Five. The bones decide.", "Penta. Whole round. Mine."],
  ),
  "mma-adesanyaish": lines(
    ["Slip.", "Too slow."],
    ["Two. The feint.", "Double step."],
    ["Three. I dance.", "Triple the angle."],
    ["Four. Style wins.", "Quad. Last one gliding."],
    ["Five. The floor is mine.", "Penta. Whole cage. Dancing."],
  ),
  "mma-poirierish": lines(
    ["Good fight.", "You swung."],
    ["Two. Respect.", "Double the heart."],
    ["Three. Still here.", "Triple. War time."],
    ["Four. Diamond hard.", "Quad. The pocket holds."],
    ["Five. The comeback lands.", "Penta. Whole war. Mine."],
  ),
  "mma-diazish": lines(
    ["Whatever.", "Easy work."],
    ["Two. Come on.", "Double. Stockton pace."],
    ["Three. Still talking.", "Triple. I'm loose."],
    ["Four. You look gassed.", "Quad. The stoop's fine."],
    ["Five. The block wins.", "Penta. Whole round. Mine."],
  ),
  "wild-icon": lines(
    ["Iconic.", "Pose."],
    ["Two. The look.", "Double flash."],
    ["Three. Cameras up.", "Triple the aura."],
    ["Four. Main stage.", "Quad. They scream."],
    ["Five. The icon stays.", "Penta. Whole crowd. Mine."],
  ),
  "wild-enigma": lines(
    ["Gone.", "The file."],
    ["Two names.", "Double vanish."],
    ["Three. Unread.", "Triple the dark."],
    ["Four. Leave it shut.", "Quad. The list thins."],
    ["Five. The deep end.", "Penta. Whole archive. Shut."],
  ),
  "wild-cartoons": lines(
    ["Bonk.", "Cut."],
    ["Two. Both of us.", "Double gag."],
    ["Three. The bit lands.", "Triple trouble."],
    ["Four. Absurd.", "Quad. We drew that."],
    ["Five. Cartoon night.", "Penta. Whole episode. Ours."],
  ),
  "wild-dynasty": lines(
    ["Bow.", "Next season."],
    ["Two. The crown.", "Double the drama."],
    ["Three. Royal mess.", "Triple the throne."],
    ["Four. The house trends.", "Quad. Dynasty."],
    ["Five. The house rules.", "Penta. Whole empire. Mine."],
  ),
  "wild-legend": lines(
    ["Legend.", "Bucket."],
    ["Two. Highlight.", "Double the myth."],
    ["Three. They'll replay that.", "Triple. The roar."],
    ["Four. Hall of fame.", "Quad. Unreal."],
    ["Five. The legend grows.", "Penta. Whole arena. Mine."],
  ),
  "wild-karen": lines(
    ["Excuse me.", "That's off."],
    ["Two. I asked already.", "Double complaint."],
    ["Three. Where is the manager.", "Triple. I'm writing this down."],
    ["Four. This counter is done.", "Quad. I am finished asking."],
    ["FIVE. THE WHOLE STORE.", "Penta. Receipt's mine."],
  ),
  "wild-butter": lines(
    ["Patched.", "Ping."],
    ["Two drones.", "Double click."],
    ["Three. Override.", "Triple the swarm."],
    ["Four. Firmware hot.", "Quad. It compiles."],
    ["Five. System down.", "Penta. Whole network. Mine."],
  ),
  "wild-cezanne": lines(
    ["Stroke.", "A study."],
    ["Two tones.", "Double the pigment."],
    ["Three. The still life breaks.", "Triple the canvas."],
    ["Four. The show opens.", "Quad. It sings."],
    ["Five. The masterpiece.", "Penta. Whole gallery. Mine."],
  ),
  "wild-slush": lines(
    ["Packed.", "Snowball."],
    ["Two. Both packed.", "Double the powder."],
    ["Three. Whiteout.", "Triple the lumps."],
    ["Four. The fort holds.", "Quad. Stay cold."],
    ["Five. Avalanche.", "Penta. Whole yard. Mine."],
  ),
  "wild-vegan": lines(
    ["Leafed.", "Compost."],
    ["Two. Roots up.", "Double the greens."],
    ["Three. The harvest.", "Triple. The vines vote."],
    ["Four. Plant law.", "Quad. The garden takes it."],
    ["Five. The menu's plants.", "Penta. Whole field. Mine."],
  ),
};

export function rankFor(n: number): KillRank {
  if (n >= 5) return "penta";
  if (n >= 4) return "quad";
  if (n >= 3) return "triple";
  if (n >= 2) return "double";
  return "kill";
}

export function nextMultiCount(prev: MultiMark | undefined, now: number, window = KILL_VOICE.window): MultiMark {
  const at = Number.isFinite(now) ? now : 0;
  const span = Number.isFinite(window) ? window : KILL_VOICE.window;
  if (!prev || !Number.isFinite(prev.at) || !Number.isFinite(prev.count) || at - prev.at > span) {
    return { count: 1, at };
  }
  return { count: prev.count + 1, at };
}

function indexFor(rng: () => number, length: number): number {
  if (length <= 1) return 0;
  let raw = 0;
  try {
    raw = rng();
  } catch {
    return 0;
  }
  if (!Number.isFinite(raw)) return 0;
  const scaled = Math.floor(raw * length);
  if (!Number.isFinite(scaled) || scaled < 0) return 0;
  return scaled >= length ? length - 1 : scaled;
}

function fallbackKill(heroId: string): string {
  try {
    const line = kitPatch(heroId).voice.kill;
    return line.trim() ? line : "Stay down.";
  } catch {
    return "Stay down.";
  }
}

/** Walk penta → quad → triple → double → kill, then the kit kill line. */
export function pickKillLine(
  heroId: string,
  n: number,
  rng: () => number = KILL_VOICE.rng,
  pack?: Partial<Record<KillRank, readonly string[]>> | null,
): string {
  const fallback = fallbackKill(heroId);
  try {
    const source = pack === undefined ? KILL_PACKS[heroId] : pack ?? undefined;
    const start = Math.max(0, RANK_ORDER.indexOf(rankFor(n)));
    for (let i = start; i < RANK_ORDER.length; i++) {
      const rank = RANK_ORDER[i]!;
      const pool = (source?.[rank] ?? []).filter((line) => line.trim().length > 0);
      if (!pool.length) continue;
      return pool[indexFor(rng, pool.length)] ?? fallback;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/** Upgrade an unplayed cue for the same unit while playAt is still ahead. */
export function queueKillCue(queue: readonly KillCue[], cue: KillCue, now: number): KillCue[] {
  const next = queue.map((row) => ({ ...row }));
  const open = next.find((row) => row.unitId === cue.unitId && row.playAt > now);
  if (open) {
    open.n = cue.n;
    open.heroId = cue.heroId;
    open.home = cue.home;
    open.line = undefined;
    return next;
  }
  const playAt = cue.playAt > now ? cue.playAt : now + KILL_VOICE.settle;
  next.push({
    unitId: cue.unitId,
    heroId: cue.heroId,
    home: cue.home,
    n: cue.n,
    playAt,
  });
  return next;
}

/**
 * Assists leave the ladder and the cue queue alone.
 * Killers climb the voice count and queue or upgrade one cue.
 */
export function creditVoiceMulti(
  role: "killer" | "assist",
  prev: MultiMark | undefined,
  now: number,
  queue: readonly KillCue[],
  cue: KillCredit,
): { mark: MultiMark | undefined; queue: readonly KillCue[] } {
  if (role !== "killer") return { mark: prev, queue };
  const mark = nextMultiCount(prev, now);
  return {
    mark,
    queue: queueKillCue(
      queue,
      {
        unitId: cue.unitId,
        heroId: cue.heroId,
        home: cue.home,
        n: mark.count,
        playAt: cue.playAt,
      },
      now,
    ),
  };
}
