import { sealHero } from "./kits.ts";

export type AbilityKind = "point" | "unit" | "self" | "dash";

export type Attr = "str" | "agi" | "int";

export type Wing = "campus" | "maga" | "antifa" | "wild" | "mma";

export type CastFx =
  | "cone"
  | "dash"
  | "aspd"
  | "nova"
  | "bolt"
  | "slow"
  | "stun"
  | "shield"
  | "taunt"
  | "dashnova"
  | "heal"
  | "rain";

export type Ability = {
  key: "Q" | "W" | "E" | "R";
  name: string;
  blurb: string;
  mana: number;
  cd: number;
  range: number;
  kind: AbilityKind;
  fx: CastFx;
  /** Behavior key in mechs.ts. Absent on protected kits. */
  mech?: string;
};

export type Passive = {
  name: string;
  blurb: string;
};

export type Difficulty = 1 | 2 | 3;

export type RoleBand = "tank" | "fighter" | "assassin" | "mage" | "marksman" | "support" | "controller";

export type PassiveKind =
  | "heat"
  | "vamp"
  | "haste"
  | "mark"
  | "guard"
  | "rage"
  | "link"
  | "ambush"
  | "zone"
  | "tauntwall"
  | "barrage";

export type VoicePack = {
  select: string;
  ult: string;
  death: string;
  win: string;
  kill: string;
  casts: string[];
};

export type HeroDef = {
  id: string;
  name: string;
  title: string;
  role: string;
  attr: Attr;
  color: string;
  hp: number;
  mana: number;
  damage: number;
  range: number;
  ms: number;
  armor: number;
  melee: boolean;
  abilities: Ability[];
  wing: Wing;
  dlc: boolean;
  passive?: Passive;
  difficulty?: Difficulty;
  bio?: string;
  personality?: string;
  style?: string;
  hpRegen?: number;
  manaRegen?: number;
  aspd?: number;
  mr?: number;
  kind?: PassiveKind;
  band?: RoleBand;
  stack?: string;
  voice?: VoicePack;
};

export const ATTRS: { id: Attr; name: string }[] = [
  { id: "str", name: "Strength" },
  { id: "agi", name: "Agility" },
  { id: "int", name: "Intelligence" },
];

export function attrLabel(a: Attr): string {
  return a === "str" ? "Strength" : a === "agi" ? "Agility" : "Intelligence";
}

function A(
  key: Ability["key"],
  name: string,
  blurb: string,
  mana: number,
  cd: number,
  range: number,
  kind: AbilityKind,
  fx: CastFx,
  mech?: string,
): Ability {
  return mech ? { key, name, blurb, mana, cd, range, kind, fx, mech } : { key, name, blurb, mana, cd, range, kind, fx };
}

/** Ranged basic attacks begin at this reach. Melee kits stay under it. */
export const RANGED_BASIC_MIN = 300;

/** Melee reach used when an MMA kit was authored with a ranged basic attack. */
export const MMA_MELEE_RANGE = 145;

/**
 * MMA wing kits use a melee basic attack. An authored melee reach is kept.
 * A ranged reach becomes the melee convention. Classification is the wing, not a name list.
 */
export function withMmaMeleeBasic<T extends { wing: Wing; melee: boolean; range: number }>(h: T): T {
  if (h.wing !== "mma") return h;
  if (h.melee && h.range < RANGED_BASIC_MIN) return h;
  return { ...h, melee: true, range: MMA_MELEE_RANGE };
}

function H(
  id: string,
  name: string,
  title: string,
  role: string,
  attr: Attr,
  color: string,
  hp: number,
  mana: number,
  damage: number,
  range: number,
  ms: number,
  armor: number,
  melee: boolean,
  abilities: Ability[],
  wing: Wing = "campus",
  dlc = false,
  passive?: Passive,
): HeroDef {
  return withMmaMeleeBasic({
    id,
    name,
    title,
    role,
    attr,
    color,
    hp,
    mana,
    damage,
    range,
    ms,
    armor,
    melee,
    abilities,
    wing,
    dlc,
    passive,
  });
}

const STR: HeroDef[] = [
  H("riot", "Riot Cap", "Homecoming Captain", "Carry", "str", "#f0c14a", 720, 280, 52, 130, 312, 4, true, [
    A("Q", "Rally Slash", "Carve a cone of campus riot.", 70, 7, 240, "point", "cone"),
    A("W", "Breakaway", "Dash through the quad.", 65, 11, 320, "dash", "dash"),
    A("E", "Crowd Surge", "Attack faster. Hit harder.", 50, 14, 0, "self", "aspd"),
    A("R", "Uprising", "Detonate school spirit in a blast.", 140, 70, 260, "self", "nova"),
  ]),
  H("mascot", "Mascot", "Living School Spirit", "Tank", "str", "#ff7a45", 880, 300, 44, 140, 300, 6, true, [
    A("Q", "Belly Bump", "Stun the front of the line.", 80, 10, 180, "unit", "stun"),
    A("W", "School Spirit", "Raise a foam-finger shield.", 70, 13, 0, "self", "shield"),
    A("E", "Heckle", "Taunt nearby rivals.", 60, 15, 220, "self", "taunt"),
    A("R", "Homecoming Parade", "Charge, knocking the rival aside.", 130, 80, 380, "dash", "dashnova"),
  ]),
  H("gavel", "Dean's Gavel", "Campus Authority", "Initiator", "str", "#c9a227", 840, 290, 48, 145, 298, 6, true, [
    A("Q", "Gavel Crack", "Stun a rival with the bench.", 85, 11, 170, "unit", "stun"),
    A("W", "Closed Session", "Shield the office door.", 70, 14, 0, "self", "shield"),
    A("E", "Hold the Quad", "Slow a knot of rivals.", 80, 13, 280, "point", "slow"),
    A("R", "Expulsion", "Blast the hearing room.", 150, 80, 240, "self", "nova"),
  ]),
  H("boiler", "Boiler Tech", "Steam Plant", "Tank", "str", "#d26a2c", 900, 270, 46, 140, 292, 7, true, [
    A("Q", "Pipe Burst", "Cone of scalding steam.", 75, 8, 230, "point", "cone"),
    A("W", "Pressure Door", "Raise a plate of armor.", 65, 13, 0, "self", "shield"),
    A("E", "Vent Walk", "Dash through the plant.", 70, 12, 300, "dash", "dash"),
    A("R", "Blowdown", "Detonate the boiler.", 145, 78, 250, "self", "nova"),
  ]),
  H("mason", "Quad Mason", "Brickwork", "Tank", "str", "#b08968", 910, 260, 45, 135, 288, 7, true, [
    A("Q", "Trowel", "Stun with a wet brick.", 80, 10, 165, "unit", "stun"),
    A("W", "Course Wall", "Raise a mortar shield.", 70, 14, 0, "self", "shield"),
    A("E", "Scaffold", "Slow feet in wet cement.", 75, 13, 260, "point", "slow"),
    A("R", "Keystone", "Drop the arch on the lane.", 150, 82, 230, "self", "nova"),
  ]),
  H("janitor", "Night Porter", "Bucket Line", "Support", "str", "#8a9a6a", 860, 310, 42, 140, 296, 5, true, [
    A("Q", "Wet Floor", "Slow a slick of the hall.", 70, 9, 280, "point", "slow"),
    A("W", "Mop Shield", "Raise a wringer of armor.", 65, 13, 0, "self", "shield"),
    A("E", "First Aid Closet", "Heal the nearby line.", 80, 12, 220, "self", "heal"),
    A("R", "Lockdown", "Blast the corridor.", 140, 75, 240, "self", "nova"),
  ]),
  H("coach", "Strength Coach", "Weight Room", "Bruiser", "str", "#e07a3d", 800, 280, 54, 135, 308, 5, true, [
    A("Q", "Plate Swing", "Cone of iron.", 70, 7, 220, "point", "cone"),
    A("W", "PR", "Attack faster after a lift.", 55, 13, 0, "self", "aspd"),
    A("E", "Spotter", "Dash to the rack.", 65, 11, 300, "dash", "dash"),
    A("R", "Max Out", "Nova of dropped plates.", 145, 76, 230, "self", "nova"),
  ]),
  H("bus", "Activity Bus", "Road Block", "Tank", "str", "#3d6ea6", 930, 250, 43, 150, 284, 7, true, [
    A("Q", "Air Brake", "Stun the bumper.", 85, 11, 170, "unit", "stun"),
    A("W", "Yellow Wall", "Raise a bus-side shield.", 70, 14, 0, "self", "shield"),
    A("E", "Pull Out", "Dash down the curb.", 70, 12, 320, "dash", "dash"),
    A("R", "Field Trip", "Charge and detonate.", 150, 84, 360, "dash", "dashnova"),
  ]),
  H("cadet", "Cadet Captain", "ROTC", "Carry", "str", "#5c7a4a", 780, 290, 53, 135, 310, 5, true, [
    A("Q", "Dress Right", "Cone of drill.", 70, 7, 230, "point", "cone"),
    A("W", "Double Time", "Dash the formation.", 65, 11, 310, "dash", "dash"),
    A("E", "Cadence", "Attack faster.", 50, 14, 0, "self", "aspd"),
    A("R", "Pass in Review", "Blast the parade ground.", 145, 74, 250, "self", "nova"),
  ]),
  H("pledge", "House Pledge", "Frat Wall", "Initiator", "str", "#c45c5c", 850, 270, 47, 140, 300, 6, true, [
    A("Q", "Keg Toss", "Stun with a cold barrel.", 80, 10, 175, "unit", "stun"),
    A("W", "Brotherhood", "Taunt the porch.", 60, 15, 220, "self", "taunt"),
    A("E", "Greek Shield", "Raise a lettered wall.", 70, 13, 0, "self", "shield"),
    A("R", "Rush Week", "Charge the lawn.", 140, 80, 370, "dash", "dashnova"),
  ]),
  H("bass", "Bass Drum", "Marching Wall", "Tank", "str", "#6b4a2a", 890, 280, 44, 145, 290, 6, true, [
    A("Q", "Downbeat", "Stun on the one.", 80, 10, 170, "unit", "stun"),
    A("W", "Drumline Wall", "Raise a bass shield.", 70, 14, 0, "self", "shield"),
    A("E", "Cadence Slow", "Slow the rival step.", 75, 13, 270, "point", "slow"),
    A("R", "Halftime", "Nova of the big drum.", 150, 82, 240, "self", "nova"),
  ]),
  H("chef", "Dining Hall", "Meal Plan", "Bruiser", "str", "#d4a017", 820, 300, 49, 140, 302, 5, true, [
    A("Q", "Ladle", "Cone of gravy.", 70, 8, 220, "point", "cone"),
    A("W", "Seconds", "Heal the line.", 80, 12, 210, "self", "heal"),
    A("E", "Tray Armor", "Raise a plastic shield.", 65, 13, 0, "self", "shield"),
    A("R", "Closing Bell", "Blast the servery.", 140, 76, 240, "self", "nova"),
  ]),
];

const AGI: HeroDef[] = [
  H("spike", "Track Spike", "Lane Carry", "Carry", "agi", "#e8e0a8", 640, 300, 56, 140, 330, 3, true, [
    A("Q", "Start Gun", "Cone off the blocks.", 65, 6, 220, "point", "cone"),
    A("W", "Kick", "Dash the last 100.", 60, 10, 340, "dash", "dash"),
    A("E", "Negative Split", "Attack faster.", 50, 13, 0, "self", "aspd"),
    A("R", "Anchor Leg", "Charge and burst.", 135, 70, 380, "dash", "dashnova"),
  ]),
  H("foil", "Club Foil", "Fencing", "Carry", "agi", "#cfd8dc", 620, 310, 58, 145, 328, 3, true, [
    A("Q", "Lunge", "Stun on the point.", 75, 9, 175, "unit", "stun"),
    A("W", "Fleche", "Dash past the guard.", 65, 11, 320, "dash", "dash"),
    A("E", "Riposte", "Attack faster.", 50, 13, 0, "self", "aspd"),
    A("R", "Touché", "Nova of steel.", 140, 72, 210, "self", "nova"),
  ]),
  H("skate", "Quad Skate", "Roamer", "Roamer", "agi", "#ff6fae", 600, 290, 52, 135, 338, 2, true, [
    A("Q", "Curb Cut", "Cone of a grind.", 65, 7, 210, "point", "cone"),
    A("W", "Kickflip", "Dash the rail.", 60, 9, 350, "dash", "dash"),
    A("E", "Jam", "Attack faster.", 45, 12, 0, "self", "aspd"),
    A("R", "Bowl Run", "Charge the bowl.", 130, 68, 390, "dash", "dashnova"),
  ]),
  H("shot", "Yearbook Shot", "Photographer", "Carry", "agi", "#9ec9d9", 580, 320, 54, 440, 322, 2, false, [
    A("Q", "Flash", "Bolt a portrait.", 75, 5, 600, "unit", "bolt"),
    A("W", "Red Eye", "Slow the subject.", 80, 11, 480, "point", "slow"),
    A("E", "Darkroom", "Dash between frames.", 70, 14, 380, "dash", "dash"),
    A("R", "Cover Shot", "Mark and collect.", 145, 74, 640, "unit", "bolt"),
  ]),
  H("flyer", "Flyer", "Cheer Squad", "Carry", "agi", "#ffb6c1", 610, 300, 53, 140, 334, 2, true, [
    A("Q", "Basket Toss", "Stun on the catch.", 75, 9, 180, "unit", "stun"),
    A("W", "Liberty", "Dash the pyramid.", 65, 10, 330, "dash", "dash"),
    A("E", "Spirit", "Attack faster.", 50, 13, 0, "self", "aspd"),
    A("R", "Stunt Sequence", "Charge and burst.", 135, 70, 360, "dash", "dashnova"),
  ]),
  H("alto", "Marching Alto", "Tempo", "Carry", "agi", "#d4af37", 590, 330, 51, 410, 324, 2, false, [
    A("Q", "Reed Cut", "Bolt a high note.", 75, 5, 560, "unit", "bolt"),
    A("W", "Gliss", "Slow the stand.", 80, 12, 460, "point", "slow"),
    A("E", "Slide", "Dash the form.", 70, 13, 360, "dash", "dash"),
    A("R", "Solo", "Bolt the feature.", 145, 72, 620, "unit", "bolt"),
  ]),
  H("mail", "Mailroom", "Courier", "Roamer", "agi", "#7a8b99", 630, 280, 50, 135, 336, 3, true, [
    A("Q", "Parcel", "Stun with a box.", 75, 9, 170, "unit", "stun"),
    A("W", "Interoffice", "Dash the tunnels.", 60, 9, 360, "dash", "dash"),
    A("E", "Certified", "Attack faster.", 50, 13, 0, "self", "aspd"),
    A("R", "Campus Loop", "Charge the route.", 130, 68, 400, "dash", "dashnova"),
  ]),
  H("intern", "Campaign Intern", "Field Office", "Roamer", "agi", "#c4161c", 650, 290, 51, 140, 326, 3, true, [
    A("Q", "Clip Board", "Cone of flyers.", 65, 7, 220, "point", "cone"),
    A("W", "Canvass", "Dash the block.", 60, 10, 340, "dash", "dash"),
    A("E", "Talking Point", "Taunt the stoop.", 60, 15, 210, "self", "taunt"),
    A("R", "GOTV", "Charge the precinct.", 135, 72, 370, "dash", "dashnova"),
  ]),
  H("bike", "Bike Courier", "Bloc Run", "Roamer", "agi", "#2aa198", 640, 280, 50, 135, 340, 3, true, [
    A("Q", "U-Lock", "Stun a rival wheel.", 80, 10, 165, "unit", "stun"),
    A("W", "Cut Through", "Dash the alley.", 60, 9, 360, "dash", "dash"),
    A("E", "Peloton", "Attack faster.", 50, 12, 0, "self", "aspd"),
    A("R", "Critical Mass", "Charge the street.", 135, 70, 390, "dash", "dashnova"),
  ]),
  H("belfry", "Bell Tower", "Ranged Carry", "Carry", "agi", "#c4b49a", 570, 310, 57, 470, 318, 2, false, [
    A("Q", "Clapper", "Bolt from the belfry.", 80, 5, 640, "unit", "bolt"),
    A("W", "Peal", "Slow the quad below.", 85, 12, 500, "point", "slow"),
    A("E", "Stair Run", "Dash the spiral.", 70, 14, 360, "dash", "dash"),
    A("R", "Noon Bell", "Mark and collect.", 150, 76, 680, "unit", "bolt"),
  ]),
  H("sack", "Hacky Sack", "Juker", "Carry", "agi", "#86c232", 600, 270, 52, 130, 336, 2, true, [
    A("Q", "Footbag", "Stun on a stall.", 70, 9, 165, "unit", "stun"),
    A("W", "Circle", "Dash the hack circle.", 60, 10, 300, "dash", "dash"),
    A("E", "Around the World", "Attack faster.", 45, 12, 0, "self", "aspd"),
    A("R", "Drop", "Nova of the sack.", 130, 68, 200, "self", "nova"),
  ]),
  H("snare", "Drumline Snare", "Tempo", "Carry", "agi", "#e6d5a8", 615, 300, 54, 140, 332, 3, true, [
    A("Q", "Flam", "Cone of sticks.", 65, 6, 210, "point", "cone"),
    A("W", "Parade Step", "Dash the form.", 60, 10, 330, "dash", "dash"),
    A("E", "Roll", "Attack faster.", 50, 13, 0, "self", "aspd"),
    A("R", "Cadence Break", "Charge and burst.", 135, 70, 360, "dash", "dashnova"),
  ]),
];

const INT: HeroDef[] = [
  H("desk", "Night Desk", "Graveyard-Shift Librarian", "Nuker", "int", "#7ec8ff", 560, 420, 41, 430, 295, 2, false, [
    A("Q", "Overdue Stamp", "Hurl a glowing date stamp.", 80, 5, 620, "unit", "bolt"),
    A("W", "Silence in the Stacks", "Slow enemies in a hush.", 90, 12, 500, "point", "slow"),
    A("E", "Stack Walk", "Blink between shelves.", 75, 16, 420, "dash", "dash"),
    A("R", "Collection Due", "Mark a rival, then collect.", 150, 75, 650, "unit", "bolt"),
  ]),
  H("ra", "Resident Advisor", "Hall Desk", "Support", "int", "#a78bfa", 600, 400, 40, 380, 300, 3, false, [
    A("Q", "Write-Up", "Bolt a policy.", 80, 6, 540, "unit", "bolt"),
    A("W", "Quiet Hours", "Slow the hall.", 85, 12, 460, "point", "slow"),
    A("E", "Duty Round", "Heal the floor.", 80, 11, 240, "self", "heal"),
    A("R", "Fire Drill", "Nova the stairwell.", 145, 78, 230, "self", "nova"),
  ]),
  H("chem", "Lab Burner", "Chem Bench", "Nuker", "int", "#5ad45a", 540, 440, 43, 420, 298, 2, false, [
    A("Q", "Pipette", "Bolt a reagent.", 85, 5, 600, "unit", "bolt"),
    A("W", "Fume Hood", "Slow a cloud.", 90, 12, 480, "point", "slow"),
    A("E", "Spill", "Rain acid on a point.", 95, 10, 500, "point", "rain"),
    A("R", "Exothermic", "Detonate the bench.", 155, 76, 240, "self", "nova"),
  ]),
  H("debate", "Debate Chair", "Forensics", "Disable", "int", "#8ab4f8", 570, 430, 42, 400, 302, 2, false, [
    A("Q", "Point of Order", "Stun a speaker.", 85, 10, 360, "unit", "stun"),
    A("W", "Rebuttal", "Bolt the case.", 80, 6, 560, "unit", "bolt"),
    A("E", "Time", "Slow the floor.", 85, 12, 450, "point", "slow"),
    A("R", "Ballot", "Mark and collect.", 150, 74, 620, "unit", "bolt"),
  ]),
  H("radio", "Campus Radio", "Late Slot", "Support", "int", "#f06292", 580, 410, 39, 390, 304, 2, false, [
    A("Q", "Call-In", "Bolt the request line.", 80, 6, 560, "unit", "bolt"),
    A("W", "Static", "Slow the band.", 85, 12, 470, "point", "slow"),
    A("E", "Dedication", "Heal the listeners.", 80, 12, 250, "self", "heal"),
    A("R", "Sign-Off", "Nova the booth.", 145, 78, 230, "self", "nova"),
  ]),
  H("counsel", "Wellness Desk", "Counseling", "Support", "int", "#80cbc4", 610, 400, 38, 360, 296, 3, false, [
    A("Q", "Intake", "Bolt a form.", 75, 6, 520, "unit", "bolt"),
    A("W", "Grounding", "Slow a panic.", 80, 11, 440, "point", "slow"),
    A("E", "Session", "Heal the circle.", 85, 10, 240, "self", "heal"),
    A("R", "Crisis Line", "Big heal and hush.", 140, 80, 260, "self", "heal"),
  ]),
  H("ta", "Teaching Assistant", "Office Hours", "Nuker", "int", "#90caf9", 550, 430, 42, 410, 300, 2, false, [
    A("Q", "Red Pen", "Bolt a margin.", 80, 5, 580, "unit", "bolt"),
    A("W", "Extension", "Slow the deadline.", 85, 12, 470, "point", "slow"),
    A("E", "Whiteboard", "Rain notes on a point.", 90, 10, 480, "point", "rain"),
    A("R", "Curve", "Mark and collect.", 150, 74, 630, "unit", "bolt"),
  ]),
  H("press", "Student Paper", "Op-Ed", "Nuker", "int", "#eceff1", 560, 420, 44, 440, 297, 2, false, [
    A("Q", "Lead", "Bolt a headline.", 80, 5, 600, "unit", "bolt"),
    A("W", "Retraction", "Slow the copy.", 85, 12, 490, "point", "slow"),
    A("E", "Press Run", "Dash the basement.", 75, 14, 400, "dash", "dash"),
    A("R", "Front Page", "Mark and collect.", 150, 75, 650, "unit", "bolt"),
  ]),
  H("term", "Lab Terminal", "CS Lab", "Nuker", "int", "#69f0ae", 530, 450, 45, 430, 306, 1, false, [
    A("Q", "Compile", "Bolt an error.", 85, 5, 610, "unit", "bolt"),
    A("W", "Lag", "Slow the lab.", 90, 12, 480, "point", "slow"),
    A("E", "SSH", "Dash a hop.", 75, 14, 420, "dash", "dash"),
    A("R", "Kernel Panic", "Detonate the rack.", 155, 76, 230, "self", "nova"),
  ]),
  H("lecture", "Lecture Hall", "100-Level", "Nuker", "int", "#ffe082", 590, 410, 40, 400, 294, 2, false, [
    A("Q", "Clicker", "Bolt a slide.", 80, 6, 560, "unit", "bolt"),
    A("W", "Dim the House", "Slow the seats.", 85, 12, 500, "point", "slow"),
    A("E", "Laser", "Rain a pointer on a point.", 90, 10, 500, "point", "rain"),
    A("R", "Final", "Nova the hall.", 150, 78, 250, "self", "nova"),
  ]),
  H("reg", "Registrar", "Records", "Disable", "int", "#b0bec5", 600, 400, 39, 380, 292, 3, false, [
    A("Q", "Hold", "Stun a transcript.", 85, 10, 340, "unit", "stun"),
    A("W", "Add/Drop", "Slow the line.", 80, 12, 450, "point", "slow"),
    A("E", "Seal", "Raise a records shield.", 70, 14, 0, "self", "shield"),
    A("R", "Expunge", "Mark and collect.", 150, 80, 600, "unit", "bolt"),
  ]),
  H("ethics", "Ethics Board", "Review", "Support", "int", "#ce93d8", 580, 420, 40, 390, 298, 2, false, [
    A("Q", "Citation", "Bolt a case.", 80, 6, 550, "unit", "bolt"),
    A("W", "Recusal", "Slow the panel.", 85, 12, 460, "point", "slow"),
    A("E", "Finding", "Heal the room.", 80, 12, 230, "self", "heal"),
    A("R", "Sanction", "Nova the chamber.", 145, 78, 230, "self", "nova"),
  ]),
];

const MAGA_WING: HeroDef[] = [
  H("maga-grumptor", "Grump", "The Tweeter", "Tank / Fighter", "str", "#c4161c", 800, 300, 52, 135, 304, 6, true, [
    A("Q", "CAPS LOCK", "A line of all-caps. The first rival is shoved and slowed.", 70, 7, 240, "point", "cone", "grump-caps"),
    A("W", "Rally the Base", "You and nearby allies hit harder for a short rally.", 50, 13, 0, "self", "aspd", "grump-rally"),
    A("E", "Executive Order", "A late order stuns heroes in a small circle.", 85, 11, 170, "point", "stun", "grump-order"),
    A("R", "TOTAL DOMINATION", "A blast now, then a knock. Spends Controversy.", 150, 76, 250, "self", "nova", "grump-dom"),
  ], "maga", false, { name: "Controversy", blurb: "Q, W, and E stack Controversy. At five, range and damage jump. R spends the stack." }),
  H("maga-kyleyle", "Kyle Rightenhouse", "The Self-Defense Hero", "Fighter / Marksman", "agi", "#efe6d6", 650, 290, 56, 150, 328, 4, true, [
    A("Q", "Counterfire", "Stun the sidewalk.", 75, 9, 175, "unit", "stun"),
    A("W", "Crossing", "Dash past the line.", 60, 10, 340, "dash", "dash"),
    A("E", "Ready Position", "Raise a self-defense shield.", 65, 13, 0, "self", "shield"),
    A("R", "Stand Your Ground", "Charge and burst.", 135, 70, 380, "dash", "dashnova"),
  ], "maga", false, { name: "Self-Defense", blurb: "A clean counter. Stun on Q, then the charge." }),
  H("maga-alexgroans", "Alex Groans", "The Truth Bomber", "Mage / Artillery", "int", "#e07a3d", 540, 440, 45, 460, 296, 2, false, [
    A("Q", "Hot Mic", "A far bolt that plants a mark. Close targets barely feel it.", 80, 5, 620, "unit", "bolt", "alex-mic"),
    A("W", "Info Dump", "Papers hit a point, then a second wave slows whoever stayed.", 95, 10, 500, "point", "rain", "alex-dump"),
    A("E", "Commercial Break", "The break lands late and pins feet hard.", 85, 12, 480, "point", "slow", "alex-break"),
    A("R", "Truth Bomb", "A bolt sticks, then stuns. Louder if the target is marked.", 150, 76, 680, "unit", "bolt", "alex-bomb"),
  ], "maga", false, { name: "Long Range", blurb: "Artillery kit. Bolts from the back of the street." }),
  H("maga-rogentor", "Joe Rogen", "The Podcast King", "Controller / Fighter", "int", "#c9a24a", 630, 400, 41, 380, 304, 3, false, [
    A("Q", "Hot Take", "A question bolt that tugs the guest toward the mic and slows them.", 75, 6, 540, "unit", "bolt", "rogen-take"),
    A("W", "Guest Appearance", "Heal the studio, then a second sip for whoever stayed.", 80, 11, 240, "self", "heal", "rogen-guest"),
    A("E", "Studio Smoke", "A smoke patch slows the spot. Joe drops out of sight for a beat.", 85, 12, 460, "point", "slow", "rogen-smoke"),
    A("R", "THREE-HOUR MONOLOGUE", "Two pulses. Heroes in the booth are forced to listen.", 145, 78, 230, "self", "nova", "rogen-mono"),
  ], "maga", false, { name: "Long Form", blurb: "The bit runs long. Heal and slow hold the room." }),
  H("maga-quirk", "Charlie Quirk", "The Youth Motivator", "Support / Fighter", "agi", "#f0c14a", 640, 310, 52, 140, 326, 3, true, [
    A("Q", "Prove Me Wrong", "A tight take. The first rival in the cone is marked.", 65, 6, 220, "point", "cone", "quirk-prove"),
    A("W", "Campus Tour", "Dash and stop on the first body. That one is slowed.", 60, 10, 340, "dash", "dash", "quirk-tour"),
    A("E", "Talking Point", "The next swing hits harder, then the point is spent.", 50, 13, 0, "self", "aspd", "quirk-point"),
    A("R", "Midterm Rally", "Charge through the lawn, stun the line, and patch nearby allies.", 135, 72, 370, "dash", "dashnova", "quirk-mid"),
  ], "maga", false, { name: "Motivate", blurb: "Buff the swing. Attack-speed on E." }),
  H("maga-tommy", "Tommy Robinson", "The People's Voice", "Fighter / Tank", "str", "#8a4030", 850, 270, 48, 140, 298, 6, true, [
    A("Q", "March Call", "Yank a hero into the march and force them to face you.", 80, 10, 170, "unit", "stun", "tommy-call"),
    A("W", "Broadcast Ban", "A late strip of the lane that pins feet hard.", 80, 13, 280, "point", "slow", "tommy-ban"),
    A("E", "Crowd Chant", "Taunt the knot and raise a chant shield.", 60, 15, 220, "self", "taunt", "tommy-chant"),
    A("R", "People's March", "Charge the street and shove everyone along the path.", 140, 80, 370, "dash", "dashnova", "tommy-march"),
  ], "maga", false, { name: "Rally", blurb: "Crowd control. Stun, slow, taunt, then the charge." }),
  H("maga-elonmolk", "Elon Muck", "The Tech Visionary", "Assassin / Marksman", "agi", "#cfd8dc", 600, 300, 54, 145, 340, 2, true, [
    A("Q", "Rocket Dash", "Blink off the pad. A slow is left where the rocket stood.", 60, 9, 360, "dash", "dash", "elon-pad"),
    A("W", "Cyber Drone", "A late gadget bolt that marks whoever it finds.", 75, 6, 520, "unit", "bolt", "elon-drone"),
    A("E", "Autonomous Mode", "Attack faster, then a small pop when the mode ends.", 45, 12, 0, "self", "aspd", "elon-auto"),
    A("R", "FULL SELF-DRIVE", "Drive, stop on the first body, and stun them twice.", 130, 68, 400, "dash", "dashnova", "elon-drive"),
  ], "maga", false, { name: "Beta Release", blurb: "Unpredictable gadgets. Dash, bolt, then the drive." }),
  H("maga-boris", "Boris Johnstone", "The Brexit Boss", "Tank / Controller", "str", "#3d6ea6", 860, 290, 48, 145, 296, 6, true, [
    A("Q", "Latin Bluster", "A speech cone that slows rivals on the far side of the cast.", 70, 8, 230, "point", "cone", "boris-latin"),
    A("W", "Zip Wire", "Zip along the wire and stop on the first body.", 70, 12, 320, "dash", "dash", "boris-zip"),
    A("E", "Party Wall", "A barrier that holds, then bursts outward when it ends.", 70, 14, 0, "self", "shield", "boris-wall"),
    A("R", "Get Brexit Done", "Blast the chamber and shove everyone out of it.", 145, 78, 240, "self", "nova", "boris-done"),
  ], "maga", false, { name: "Barrier", blurb: "Walls and separation. Shield holds the street." }),
  H("maga-brander", "Russell Branded", "The Free Thinker", "Mage / Support", "int", "#b08968", 570, 430, 43, 400, 300, 2, false, [
    A("Q", "Awaken", "The point lands late. A marked rival is stunned harder.", 85, 10, 340, "unit", "stun", "brander-wake"),
    A("W", "Cancel Slow", "Slow a spot and drag the panel into it.", 80, 12, 450, "point", "slow", "brander-cancel"),
    A("E", "Lion Diet", "Heal. The meal is larger when he is hurt.", 80, 12, 230, "self", "heal", "brander-lion"),
    A("R", "Conspiracy Hour", "The next staff hit plants the mark and cashes it.", 150, 80, 600, "self", "bolt", "brander-hour"),
  ], "maga", false, { name: "Unpredictable", blurb: "Stun, slow, heal. The kit changes topic." }),
  H("maga-vestyt", "Kanye Vest", "The Culture Icon", "Assassin / Fighter", "str", "#5c3317", 760, 280, 55, 135, 316, 4, true, [
    A("Q", "Closed Verse", "The next swing shoves a cone.", 70, 7, 230, "self", "cone", "vest-verse"),
    A("W", "Yeezy Cut", "Step back off the drop and drop out of sight.", 65, 11, 310, "dash", "dash", "vest-cut"),
    A("E", "Service", "Attack faster. The full tempo only hits when the coat is torn.", 50, 14, 0, "self", "aspd", "vest-service"),
    A("R", "Sunday Service", "The hall charges, then stuns and heals nearby allies.", 145, 74, 250, "self", "nova", "vest-sunday"),
  ], "maga", false, { name: "Momentum", blurb: "High risk. Fast swing, then the nova." }),
  H("maga-steers", "JP Steers", "The Comedy Warrior", "Support / Controller", "agi", "#d4af37", 610, 300, 53, 135, 332, 3, true, [
    A("Q", "Roast", "The front of the bit is forced to watch.", 65, 7, 210, "point", "cone", "steers-roast"),
    A("W", "Crowd Work", "Dash the aisle and slow rivals on the far side of the walk.", 60, 10, 330, "dash", "dash", "steers-aisle"),
    A("E", "Special", "Taunt the room, then the bit lands a second time.", 60, 15, 210, "self", "taunt", "steers-special"),
    A("R", "Hour Special", "Charge, then the tag stuns along the path a moment later.", 135, 70, 360, "dash", "dashnova", "steers-hour"),
  ], "maga", false, { name: "Crowd Work", blurb: "Comedy CC. Taunt, then the charge." }),
  H("maga-ricky", "Ricky", "Legend", "Fighter", "str", "#c45c2a", 780, 280, 50, 140, 310, 5, true, [
    A("Q", "Yard Line", "A chalk strip that pins feet hard. He stays in the chair.", 70, 7, 230, "point", "cone", "ricky-line"),
    A("W", "Cut Across", "Roll the gap and brace a shield as the chair crosses.", 60, 10, 340, "dash", "dash", "ricky-cut"),
    A("E", "Chin Up", "A chair brace. Thicker when he is hurt.", 65, 13, 0, "self", "shield", "ricky-chin"),
    A("R", "Last Bell", "Roll and stop on the first hero. The bell stuns them.", 135, 72, 370, "dash", "dashnova", "ricky-bell"),
  ], "maga", false, { name: "Second Wind", blurb: "Under a third health the chair braces once." }),
  H("maga-hooli", "Hooli", "Pink Spike", "Marksman", "agi", "#ff4da6", 560, 300, 58, 460, 348, 2, false, [
    A("Q", "Stud Shot", "Bolt a silver stud. Fast and mean.", 55, 5, 560, "unit", "bolt"),
    A("W", "Stage Dive", "Dash the pit. Next stride is free.", 55, 8, 380, "dash", "dash"),
    A("E", "Encore", "Attack faster. The set speeds up.", 40, 11, 0, "self", "aspd"),
    A("R", "Sniper Shot", "Stop. Aim. One long stud.", 140, 72, 720, "unit", "bolt"),
  ], "maga", false, { name: "Punk Barrage", blurb: "Basic shots splash nearby rivals. A fifth of them bash." }),
  H("maga-bushed", "George Bushed", "The Reliable Republican", "Tank / Support", "str", "#6b4a2a", 920, 270, 44, 140, 286, 7, true, [
    A("Q", "Mission", "Stun the briefing and shove them off the porch.", 80, 10, 165, "unit", "stun", "bush-mission"),
    A("W", "Ranch Wall", "A ranch shield for him and the allies on the porch.", 70, 14, 0, "self", "shield", "bush-wall"),
    A("E", "Coalition", "A slow patch that pulses, and allies inside it are patched.", 75, 13, 260, "point", "slow", "bush-coalition"),
    A("R", "Surge", "The arch drops late and shields the lane.", 150, 82, 230, "self", "nova", "bush-surge"),
  ], "maga", false, { name: "Protection", blurb: "Team shield and slow. The tank holds." }),
];

const ANTIFA_WING: HeroDef[] = [
  H("lw-harass", "Kamala Harass", "The Border Champion", "Mage / Controller", "int", "#a78bfa", 590, 410, 42, 400, 302, 2, false, [
    A("Q", "Cackle Cut", "A laugh cone that slows and heals the allies standing in it.", 70, 8, 230, "point", "cone", "harass-cackle"),
    A("W", "Border Brief", "A tape line. The first rival across it is pinned hard.", 85, 12, 450, "point", "slow", "harass-tape"),
    A("E", "Unburdened", "Heal the circle now, and again when the sentence ends.", 80, 12, 230, "self", "heal", "harass-unburden"),
    A("R", "Word Salad", "Two pulses of the podium. The second slows whoever stayed.", 145, 78, 230, "self", "nova", "harass-salad"),
  ], "antifa", false, { name: "Word Salad", blurb: "The sentence never lands. Slow and heal hold the street." }),
  H("lw-sandbags", "Bernie Sandbags", "The People's Senator", "Tank / Support", "str", "#3ec8c1", 880, 300, 44, 140, 296, 6, true, [
    A("Q", "Universal Rally", "Taunt the knot and heal the line that answered.", 60, 15, 220, "self", "taunt", "sand-rally"),
    A("W", "Class Warfare", "Tug the donor in and stun them.", 80, 10, 180, "unit", "stun", "sand-class"),
    A("E", "Revolution", "Heal, then a second wave. Both are larger when he is hurt.", 80, 12, 220, "self", "heal", "sand-rev"),
    A("R", "Feel the Bern", "Charge, shove the path, and heal allies at the end of it.", 130, 80, 380, "dash", "dashnova", "sand-bern"),
  ], "antifa", false, { name: "People Power", blurb: "Team kit. Rally, stun, heal, then the charge." }),
  H("lw-bitenten", "Joe Biten", "The Unity Guy", "Support / Tank", "str", "#7ec8ff", 860, 310, 42, 140, 294, 5, true, [
    A("Q", "Come On Man", "A slick that pins feet hard and shoves the hall.", 70, 9, 280, "point", "slow", "biten-slick"),
    A("W", "Basement", "The shield shows up a beat late.", 65, 13, 0, "self", "shield", "biten-base"),
    A("E", "Ice Cream", "Heal the most hurt ally in reach. One cone.", 80, 12, 220, "self", "heal", "biten-ice"),
    A("R", "Dark Brandon", "A big heal, then heroes around him are stunned when it ends.", 140, 80, 260, "self", "heal", "biten-brandon"),
  ], "antifa", false, { name: "Unity Link", blurb: "Heals, a shield, and a slow. The team stays up." }),
  H("lw-odramma", "Barack O'Drama", "The Hope Dealer", "Mage / Support", "int", "#3d6ea6", 590, 420, 43, 420, 300, 2, false, [
    A("Q", "Yes We Can", "A hope bolt. Nearby allies get a short stride.", 80, 6, 560, "unit", "bolt", "drama-yes"),
    A("W", "Teleprompter", "The prompt lands late, and only on the far side of the cast.", 85, 12, 470, "point", "slow", "drama-prompt"),
    A("E", "Fired Up", "The next hit heals him.", 80, 12, 250, "self", "heal", "drama-fired"),
    A("R", "Hope Dealer", "Blast the lawn, mark it, and heal the allies in it.", 150, 78, 250, "self", "nova", "drama-hope"),
  ], "antifa", false, { name: "Hope", blurb: "Inspirational buffs. Heal the room, then the blast." }),
  H("lw-youngturkey", "The Young Turkeys", "The Progressive Crew", "Controller / Summoner", "int", "#69f0ae", 600, 410, 40, 380, 300, 3, false, [
    A("Q", "Tax the Rich", "A slogan zone slows heroes, then the bill comes due.", 80, 11, 440, "point", "slow", "turk-tax"),
    A("W", "Green New", "Rain that hits twice, and only the far side of the cast.", 90, 10, 480, "point", "rain", "turk-green"),
    A("E", "Squad Care", "Heal the crew and give them a short stride.", 85, 10, 240, "self", "heal", "turk-squad"),
    A("R", "How Dare", "A late bolt that stuns heroes.", 150, 74, 620, "unit", "bolt", "turk-dare"),
  ], "antifa", false, { name: "The Crew", blurb: "Zones, not bodies. Rain and slow stand in for the summons." }),
  H("lw-hocking", "Stephen Hocking", "The Cosmic Mind", "Artillery Mage", "int", "#b0bec5", 540, 450, 45, 430, 298, 1, false, [
    A("Q", "Gravity Well", "A well that pins feet hard and pulls the lab inward. He stays seated.", 90, 12, 480, "point", "slow", "hock-well"),
    A("W", "Quantum Drift", "A seated blink. He drops out of sight on the hop.", 75, 14, 420, "dash", "dash", "hock-drift"),
    A("E", "Cosmic Beam", "A beam. The first body on it is marked.", 85, 5, 610, "point", "bolt", "hock-beam"),
    A("R", "BLACK HOLE", "The hole opens late and pulls the rack in.", 155, 76, 230, "self", "nova", "hock-hole"),
  ], "antifa", false, { name: "Event Horizon", blurb: "Artillery from the back. Slow, dash, then the hole." }),
  H("lw-vakxie", "Vaxxie Scientist", "The Facts Matter", "Support / Mage", "int", "#5ad45a", 550, 440, 43, 420, 298, 2, false, [
    A("Q", "Dose", "A bolt that pins feet hard. A marked rival is hit again as a stun.", 85, 5, 600, "unit", "bolt", "vax-dose"),
    A("W", "Flatten", "A late line of facts that slows the curve.", 90, 12, 480, "point", "slow", "vax-flat"),
    A("E", "Peer Review", "Cleanse and heal the bench, then a second review.", 80, 12, 230, "self", "heal", "vax-peer"),
    A("R", "Nationwide Protocol", "A heal zone that pays again when the protocol expires.", 140, 80, 260, "point", "heal", "vax-nation"),
  ], "antifa", false, { name: "Peer Review", blurb: "Buffs, debuffs, and a read on the enemy." }),
  H("lw-climate", "Planet Defender", "The Weather Desk", "Controller / Mage", "int", "#80cbc4", 570, 430, 42, 400, 300, 2, false, [
    A("Q", "Carbon", "Stun a far speaker. Up close it only clips them.", 85, 10, 360, "unit", "stun", "clim-carbon"),
    A("W", "Heat Dome", "A dome that pins feet, then pops when the heat breaks.", 85, 12, 450, "point", "slow", "clim-dome"),
    A("E", "Green Cover", "Plants hit a point, slow it, and heal allies standing there.", 90, 10, 500, "point", "rain", "clim-cover"),
    A("R", "1.5 Degrees", "Two blasts. The second shoves the hall out.", 150, 78, 250, "self", "nova", "clim-degree"),
  ], "antifa", false, { name: "Weather Desk", blurb: "Wind, plants, and a dome. The map changes." }),
  H("lw-journalist", "Progressive Journalist", "The Truth Seeker", "Marksman / Scout", "agi", "#eceff1", 580, 320, 54, 440, 320, 2, false, [
    A("Q", "Leak", "A far headline that marks and shoves. Close copy barely prints.", 80, 5, 600, "unit", "bolt", "jour-leak"),
    A("W", "Fact Check", "Slow a spot. Only heroes are held to the correction.", 85, 12, 490, "point", "slow", "jour-check"),
    A("E", "Source Run", "Dash away. The stride is longer when the source is hurt.", 75, 14, 400, "dash", "dash", "jour-run"),
    A("R", "Exclusive", "The bolt sticks, then pins a marked target hard.", 150, 75, 650, "unit", "bolt", "jour-exclusive"),
  ], "antifa", false, { name: "Source", blurb: "Ranged scout. Bolt, slow, then the dash." }),
];

const WILD_DLC: HeroDef[] = [
  H("wild-icon", "The Icon", "Streetwear Tank", "Tank / Initiator", "str", "#c45c5c", 920, 280, 48, 140, 286, 7, true, [
    A("Q", "Ground Shock", "A close stomp. Nearby rivals are stunned and shoved.", 75, 8, 240, "point", "cone", "icon-stomp"),
    A("W", "Iron Will", "A heavy shield that decays, thicker when the fit is torn.", 70, 13, 0, "self", "shield", "icon-will"),
    A("E", "Crowd Control", "Pin the close knot. The far crowd walks.", 80, 12, 280, "point", "slow", "icon-crowd"),
    A("R", "The Rally", "The lawn answers late: a taunt, a shield for allies, then the blast.", 155, 84, 250, "self", "nova", "icon-rally"),
  ], "wild", true, { name: "Iconic Presence", blurb: "Durable initiator. Space for the team, then the blast." }),
  H("wild-enigma", "The Enigma", "Dark File", "Controller / Support", "int", "#3a3a48", 600, 420, 38, 400, 300, 3, false, [
    A("Q", "Black File", "Slow a name. A marked name is held longer.", 85, 11, 460, "unit", "slow", "enig-file"),
    A("W", "Vanishing Act", "Drop out of sight, then blink when the file closes.", 70, 12, 340, "dash", "dash", "enig-vanish"),
    A("E", "Double Life", "A file shield, then a second layer a beat later.", 70, 14, 0, "self", "shield", "enig-life"),
    A("R", "The Deep End", "A late pull. The last hero on the list is stunned at your feet.", 150, 80, 360, "unit", "stun", "enig-deep"),
  ], "wild", true, { name: "Hidden Connections", blurb: "Debuffs and a vanish. The file never opens." }),
  H("wild-cartoons", "The Cartoons", "Hazard Duo", "Controller / Specialist", "int", "#c4161c", 640, 380, 42, 200, 298, 4, true, [
    A("Q", "Cartoon Trap", "A hazard sits, then stuns the first body still in it.", 95, 10, 500, "point", "rain", "toon-trap"),
    A("W", "Double Trouble", "Stun, then a second stun on the same gag.", 80, 10, 170, "unit", "stun", "toon-double"),
    A("E", "Cutaway", "Blink past the far side of the gag.", 60, 10, 320, "dash", "dash", "toon-cut"),
    A("R", "Absurdity", "Two blasts. Heroes are shoved on the second frame.", 145, 78, 250, "self", "nova", "toon-absurd"),
  ], "wild", true, { name: "Fourth Wall", blurb: "Traps and a cutaway. Two voices, one kit." }),
  H("wild-dynasty", "The Reality Dynasty", "Trending Caster", "Mage / Assassin", "agi", "#ff6fae", 580, 320, 52, 420, 340, 2, false, [
    A("Q", "Selfie Flash", "A flash bolt that slows and shoves the one in frame.", 75, 5, 600, "unit", "bolt", "dyn-flash"),
    A("W", "Viral Moment", "A small blast that gives her a stride.", 90, 14, 210, "self", "nova", "dyn-viral"),
    A("E", "Fame Dash", "Dash and mark everyone she passes.", 70, 9, 380, "dash", "dash", "dyn-fame"),
    A("R", "Break the Internet", "She holds, then charges and stuns the path.", 140, 70, 400, "dash", "dashnova", "dyn-break"),
  ], "wild", true, { name: "Trending", blurb: "Mobile burst. Flash, dash, then the trend." }),
  H("wild-legend", "The Legend", "Disruptor", "Fighter / Disruptor", "str", "#f0c14a", 860, 300, 50, 150, 298, 6, true, [
    A("Q", "Comedy Hook", "Pull a rival onto the chair and stun them. A sliver of health comes back.", 85, 10, 175, "unit", "stun", "leg-hook"),
    A("W", "Uncomfortable Silence", "Pin heroes' feet. Minions keep walking.", 80, 12, 280, "point", "slow", "leg-silence"),
    A("E", "Roll With It", "Roll the chair backward and brace a shield. He stays seated.", 60, 10, 320, "dash", "dash", "leg-roll"),
    A("R", "Absolute Chaos", "Roll, stop, and shove twice.", 140, 76, 380, "dash", "dashnova", "leg-chaos"),
  ], "wild", true, { name: "The Legend", blurb: "Close-range hook and a roll. High survivability." }),
  H("wild-karen", "The Entitlement", "Frontline Taunt", "Tank / Controller", "str", "#c9a24a", 900, 280, 48, 140, 292, 7, true, [
    A("Q", "Complaint", "Taunt the room and pull them to the counter.", 60, 14, 220, "self", "taunt", "karen-complain"),
    A("W", "Demand Service", "Stun the desk. Louder when she is already furious.", 85, 10, 170, "unit", "stun", "karen-demand"),
    A("E", "Excuse Me", "The voice arrives late and shoves the first rival.", 70, 7, 230, "point", "cone", "karen-excuse"),
    A("R", "Manager Summoned", "Blast the counter, then a taunt and a shield when the manager arrives.", 150, 80, 240, "self", "nova", "karen-manager"),
  ], "wild", true, { name: "I Want To Speak To Your Manager", blurb: "Forces the fight. Taunt, then the counter." }),
  H("wild-vegan", "Plant Power", "Nature Desk", "Controller / Support", "int", "#5ad45a", 590, 420, 40, 400, 304, 2, false, [
    A("Q", "Sprout", "Close vines pin feet hard and pull the knot in.", 85, 11, 450, "point", "slow", "veg-sprout"),
    A("W", "Vegan Vigor", "The next hit heals you and a nearby ally.", 85, 10, 240, "self", "heal", "veg-vigor"),
    A("E", "Green Wave", "Hop and leave a slow trail of vines.", 75, 12, 420, "dash", "dash", "veg-wave"),
    A("R", "Planetary Harvest", "Plants fall late. Allies in the patch are fed.", 95, 10, 520, "point", "rain", "veg-harvest"),
  ], "wild", true, { name: "Plant Power", blurb: "Roots, a heal, and a hop. Nature holds the lane." }),
  H("wild-butter", "The Tech", "Gadget Artillery", "Mage / Artillery", "int", "#69f0ae", 540, 450, 44, 440, 300, 2, false, [
    A("Q", "Drone Swarm", "Gadgets hit twice and mark the patch.", 95, 10, 520, "point", "rain", "but-swarm"),
    A("W", "Laser Pointer", "A beam. Only the first body on it is cut.", 80, 5, 620, "point", "bolt", "but-laser"),
    A("E", "Emergency Patch", "Attack faster while hurt, then a pop when the patch ends.", 45, 11, 0, "self", "aspd", "but-patch"),
    A("R", "System Override", "The rack detonates late and leaves a slow.", 155, 74, 240, "self", "nova", "but-over"),
  ], "wild", true, { name: "Beta Build", blurb: "Long-range gadgets. Rain, bolt, then the override." }),
  H("wild-bruella", "Bruella", "Chaos Fighter", "Fighter / Assassin", "str", "#7a4a9a", 780, 290, 54, 140, 316, 5, true, [
    A("Q", "Chaos Strike", "Cone of a random swing.", 70, 7, 230, "point", "cone"),
    A("W", "Mirror Self", "Dash a copy through the lane.", 65, 10, 330, "dash", "dash"),
    A("E", "Unpredictable", "Stun the briefing.", 80, 10, 170, "unit", "stun"),
    A("R", "Total Meltdown", "Charge and burst.", 140, 72, 380, "dash", "dashnova"),
  ], "wild", true, { name: "Chaos Energy", blurb: "Confusion and burst. The swing changes sides." }),
  H("wild-danny", "Danny", "Who Is Danny?", "Assassin", "agi", "#7a8b99", 600, 280, 54, 135, 338, 2, true, [
    A("Q", "Mystery Strike", "Stun from nowhere.", 75, 8, 170, "unit", "stun"),
    A("W", "Disappear", "Dash the tunnels.", 60, 8, 380, "dash", "dash"),
    A("E", "Unknown Origin", "Attack faster after the vanish.", 50, 12, 0, "self", "aspd"),
    A("R", "Who Saw That?", "Charge the ambush.", 130, 68, 400, "dash", "dashnova"),
  ], "wild", true, { name: "Who Is Danny?", blurb: "Stealth feel on a dash. Stun, vanish, burst." }),
  H("wild-price", "Price", "????", "Carry / Controller", "agi", "#b0bec5", 640, 300, 53, 150, 328, 3, true, [
    A("Q", "Time Step", "Dash a frame ahead.", 60, 9, 360, "dash", "dash"),
    A("W", "Temporal Glitch", "Stun the clock.", 80, 10, 170, "unit", "stun"),
    A("E", "Unidentified", "Slow feet in wet time.", 75, 12, 280, "point", "slow"),
    A("R", "????", "Nova. Nobody booked this window.", 150, 78, 240, "self", "nova"),
  ], "wild", true, { name: "Unknown", blurb: "Time steps and a glitch. The ult stays unlabeled." }),
  H("wild-cezanne", "Pheobe", "Paint Controller", "Mage / Controller", "int", "#ce93d8", 570, 430, 42, 410, 298, 2, false, [
    A("Q", "Paint Splash", "A pigment bolt that slows. The lollipop swing is still the basic.", 80, 6, 560, "unit", "bolt", "pho-splash"),
    A("W", "Brushstroke", "A stroke line that slows the panel.", 85, 12, 460, "point", "slow", "pho-stroke"),
    A("E", "Masterpiece", "Pigment sits, then marks whoever is still in the study.", 90, 10, 500, "point", "rain", "pho-master"),
    A("R", "Final Exhibition", "A blast now, then a second mark when the show closes.", 145, 78, 230, "self", "nova", "pho-show"),
  ], "wild", true, { name: "Artistic Vision", blurb: "Marks and zones. Paint the lane, then the show." }),
  H("wild-metalpak", "MetalPak", "Full Volume", "Marksman", "agi", "#d26a2c", 610, 300, 55, 380, 324, 3, false, [
    A("Q", "Metal Burst", "Cone of iron.", 70, 7, 240, "point", "cone"),
    A("W", "Amplifier", "Attack faster after a lift.", 50, 12, 0, "self", "aspd"),
    A("E", "Riff Rocket", "Bolt a rocket.", 80, 6, 560, "unit", "bolt"),
    A("R", "Massive Solo", "Rain the drop on a point.", 95, 10, 500, "point", "rain"),
  ], "wild", true, { name: "Full Volume", blurb: "Ranged rockets and a solo. Sustained damage." }),
  H("wild-hatty", "HattyHats", "Runway Carry", "Marksman / Mobility", "agi", "#ff6fae", 600, 290, 54, 400, 338, 2, false, [
    A("Q", "Hat Throw", "Bolt a brim.", 75, 5, 600, "unit", "bolt"),
    A("W", "Fashion Flash", "Attack faster.", 45, 12, 0, "self", "aspd"),
    A("E", "Catwalk", "Dash the rail.", 60, 8, 380, "dash", "dash"),
    A("R", "Main Character Energy", "Charge the bowl.", 130, 68, 400, "dash", "dashnova"),
  ], "wild", true, { name: "Signature Style", blurb: "Mobile marksman. Throw, dash, then the walk." }),
  H("wild-octo", "Octo", "????", "Tank / Controller", "str", "#7a4a9a", 880, 300, 46, 160, 290, 7, true, [
    A("Q", "Tentacle", "Stun a limb on the lane.", 85, 10, 180, "unit", "stun"),
    A("W", "Octo-Grab", "Slow a cloud of arms.", 85, 12, 280, "point", "slow"),
    A("E", "What Is That?", "Cone of a question.", 70, 8, 230, "point", "cone"),
    A("R", "Octopus Mode", "Nova. The strangest teamfight.", 155, 84, 240, "self", "nova"),
  ], "wild", true, { name: "????", blurb: "Tentacles and a grab. Intentionally unexplained." }),
  H("wild-airosoul", "Airosoul", "Good Vibes", "Support / Mage", "int", "#80cbc4", 580, 420, 40, 390, 312, 2, false, [
    A("Q", "Soul Orb", "Bolt the request line.", 80, 6, 560, "unit", "bolt"),
    A("W", "Vibe Link", "Heal the listeners.", 80, 11, 250, "self", "heal"),
    A("E", "Float", "Dash a hop between frames.", 75, 12, 400, "dash", "dash"),
    A("R", "Ascension", "Nova the booth.", 145, 78, 230, "self", "nova"),
  ], "wild", true, { name: "Good Vibes", blurb: "Link and a float. Support that changes key." }),
  H("wild-slush", "Sgt. Slush", "Snow Detail", "Marksman", "agi", "#4a6b38", 570, 330, 51, 430, 312, 3, false, [
    A("Q", "Lump", "A packed snowball. Someone already in the pocket is slowed.", 75, 6, 480, "unit", "bolt", "slush-lump"),
    A("W", "Drift", "A drift sits, then pins the feet still standing in it.", 80, 12, 460, "point", "slow", "slush-drift"),
    A("E", "Fresh Tracks", "The snow packs underfoot and he moves faster.", 55, 14, 0, "self", "aspd", "slush-tracks"),
    A("R", "Avalanche", "The hill comes down late and shoves the yard.", 145, 76, 250, "self", "nova", "slush-slide"),
  ], "wild", true, { name: "Powder", blurb: "A takedown refunds the first two tricks. A dash leaves fresh tracks." }),
];

const MMA_WING: HeroDef[] = [
  H("mma-macgregor", "Conor Macgregor", "The Notorious", "Assassin / Fighter", "agi", "#1b6b3a", 620, 280, 58, 145, 336, 3, true, [
    A("Q", "Left Hand", "The next punch adds a straight-left cone. The basic still alternates hands.", 65, 6, 220, "self", "cone", "mac-left"),
    A("W", "Talk Smack", "Taunt heroes in the cage. Minions can look away.", 55, 13, 210, "self", "taunt", "mac-smack"),
    A("E", "Counter Strike", "Stun a rival and raise a small guard.", 75, 9, 170, "unit", "stun", "mac-counter"),
    A("R", "Precision Finish", "Dash, stop on the chin, and the next punch hits harder.", 135, 70, 380, "dash", "dashnova", "mac-finish"),
  ], "mma", true, { name: "Notorious", blurb: "First hit after a dash is the left. Woods make it cleaner." }),
  H("mma-nurmagoat", "Khabib Nurmagoat", "Sambo Eagle", "Fighter / Controller", "str", "#c4161c", 840, 270, 50, 140, 300, 6, true, [
    A("Q", "Takedown", "Hook a rival onto the mat and stun them.", 80, 9, 170, "unit", "stun", "khab-take"),
    A("W", "Ground Control", "A close hold that pins feet, then pins them again.", 80, 12, 260, "point", "slow", "khab-ground"),
    A("E", "Cage Pressure", "Taunt, then shove them into the fence.", 60, 14, 220, "self", "taunt", "khab-cage"),
    A("R", "No Escape", "A blast that pulls the cage in and stuns it.", 145, 78, 230, "self", "nova", "khab-escape"),
  ], "mma", true, { name: "Undefeated Energy", blurb: "Hero hits pay a sliver back. The grind never ends." }),
  H("mma-jonesy", "Jon Jonesy", "Bones", "Fighter / Controller", "str", "#c9a24a", 800, 290, 52, 165, 312, 5, true, [
    A("Q", "Elbow Range", "A long cone. The far edge is slowed and shoved.", 70, 7, 260, "point", "cone", "jones-elbow"),
    A("W", "Spinning Attack", "Spin through and shove the close bodies on the path.", 65, 11, 320, "dash", "dash", "jones-spin"),
    A("E", "Fight IQ", "Attack faster. The next elbow marks the read.", 50, 13, 0, "self", "aspd", "jones-iq"),
    A("R", "Champion's Round", "Blast the cage, then a knock. Louder when he is hurt.", 145, 76, 250, "self", "nova", "jones-champ"),
  ], "mma", true, { name: "Reach Advantage", blurb: "Spells stack Reach. At five, the elbows get longer. R spends it." }),
  H("mma-adesanyaish", "Israel Adesanya-ish", "Stylebender", "Mage / Assassin", "agi", "#5c7a4a", 600, 320, 54, 145, 332, 2, true, [
    A("Q", "Feint", "A light jab that marks. A marked target eats the real bolt.", 75, 5, 560, "unit", "bolt", "ade-feint"),
    A("W", "Distance Control", "Slow the far pocket and shove them off the angle.", 80, 11, 460, "point", "slow", "ade-distance"),
    A("E", "Counter Step", "Step back. If they are marked, the step leaves a slow.", 60, 9, 360, "dash", "dash", "ade-step"),
    A("R", "Last Style Standing", "A late bolt. A marked target is stunned when it lands.", 145, 74, 640, "unit", "bolt", "ade-style"),
  ], "mma", true, { name: "Stylebender", blurb: "Slows stamp a Feint. The next bolt is the real one." }),
  H("mma-poirierish", "Dustin Poirier-ish", "The Diamond", "Fighter / Marksman", "str", "#c4b49a", 780, 290, 56, 150, 318, 5, true, [
    A("Q", "Combination", "A cone that hits, then hits again.", 70, 7, 220, "point", "cone", "poi-combo"),
    A("W", "Body Shot", "A liver stun, only if they are already in the pocket.", 80, 10, 170, "unit", "stun", "poi-body"),
    A("E", "Hardened", "Two beats of a cracking shield, thicker when he is hurt.", 65, 13, 0, "self", "shield", "poi-hard"),
    A("R", "Diamond Comeback", "A blast, and the next punches hit harder when he is hurt.", 145, 74, 240, "self", "nova", "poi-back"),
  ], "mma", true, { name: "Diamond Will", blurb: "Under 40% health the pocket speeds up. Comebacks land." }),
  H("mma-diazish", "Nate Diaz-ish", "Stockton", "Fighter / Tank", "str", "#2aa198", 880, 280, 46, 145, 298, 6, true, [
    A("Q", "Pressure", "A close jab cone that slows the pocket.", 70, 8, 230, "point", "cone", "diaz-pressure"),
    A("W", "Come At Me", "Taunt and tape a shield. The taunt ticks again when the tape ends.", 60, 14, 220, "self", "taunt", "diaz-come"),
    A("E", "Never Tired", "Heal now, and again if he is still hurt when the round ticks.", 80, 11, 220, "self", "heal", "diaz-tired"),
    A("R", "Five Round War", "Two blasts. He heals on them when the fight is late and he is hurt.", 145, 80, 240, "self", "nova", "diaz-war"),
  ], "mma", true, { name: "Stockton Energy", blurb: "Taunt raises a tape shield. Heals grow if the room stays." }),
];

const MAGA_LIVE_IDS = [
  "maga-grumptor",
  "maga-quirk",
  "maga-tommy",
  "maga-elonmolk",
  "maga-rogentor",
  "maga-alexgroans",
  "maga-boris",
  "maga-brander",
  "maga-vestyt",
  "maga-steers",
  "maga-hooli",
  "maga-ricky",
  "maga-bushed",
];

/** Spectator cast. MAGA seats these five. Seattle seats the other five. */
export const CAST_HOME = ["maga-hooli", "maga-ricky", "lw-hocking", "maga-rogentor", "wild-icon"] as const;
export const CAST_AWAY = ["lw-sandbags", "lw-journalist", "lw-harass", "lw-odramma", "lw-climate"] as const;
const ANTIFA_LIVE_IDS = [
  "lw-bitenten",
  "lw-sandbags",
  "lw-odramma",
  "lw-harass",
  "lw-hocking",
  "lw-youngturkey",
  "lw-vakxie",
  "lw-climate",
  "lw-journalist",
];
export const MMA_LIVE_IDS = [
  "mma-macgregor",
  "mma-nurmagoat",
  "mma-jonesy",
  "mma-adesanyaish",
  "mma-poirierish",
  "mma-diazish",
];
const WILD_LIVE_IDS = [
  "wild-icon",
  "wild-enigma",
  "wild-cartoons",
  "wild-dynasty",
  "wild-legend",
  "wild-karen",
  "wild-butter",
  "wild-cezanne",
  "wild-vegan",
  "wild-slush",
];

/** Retired kits stay loadable for art, skins, and old saves. Not in draft. */
export const ROSTER_MIGRATION: { id: string; name: string; fate: string }[] = [
  { id: "riot", name: "Riot Cap", fate: "REMOVED · campus generic → Grump" },
  { id: "mascot", name: "Mascot", fate: "REMOVED · campus generic" },
  { id: "gavel", name: "Dean's Gavel", fate: "REMOVED · campus generic" },
  { id: "boiler", name: "Boiler Tech", fate: "REMOVED · campus generic" },
  { id: "mason", name: "Quad Mason", fate: "REMOVED · campus generic" },
  { id: "janitor", name: "Night Porter", fate: "REMOVED · campus generic" },
  { id: "coach", name: "Strength Coach", fate: "REMOVED · campus generic" },
  { id: "bus", name: "Activity Bus", fate: "REMOVED · campus generic" },
  { id: "cadet", name: "Cadet Captain", fate: "REMOVED · campus generic" },
  { id: "pledge", name: "House Pledge", fate: "REMOVED · campus generic" },
  { id: "bass", name: "Bass Drum", fate: "REMOVED · campus generic" },
  { id: "chef", name: "Dining Hall", fate: "REMOVED · campus generic" },
  { id: "spike", name: "Track Spike", fate: "REMOVED · campus generic" },
  { id: "foil", name: "Club Foil", fate: "REMOVED · campus generic" },
  { id: "skate", name: "Quad Skate", fate: "REMOVED · campus generic" },
  { id: "shot", name: "Yearbook Shot", fate: "REMOVED · campus generic" },
  { id: "flyer", name: "Flyer", fate: "REMOVED · campus generic" },
  { id: "alto", name: "Marching Alto", fate: "REMOVED · campus generic" },
  { id: "mail", name: "Mailroom", fate: "REMOVED · campus generic" },
  { id: "intern", name: "Campaign Intern", fate: "REMOVED · campus generic" },
  { id: "bike", name: "Bike Courier", fate: "REMOVED · campus generic" },
  { id: "belfry", name: "Bell Tower", fate: "REMOVED · campus generic" },
  { id: "sack", name: "Hacky Sack", fate: "REMOVED · campus generic" },
  { id: "snare", name: "Drumline Snare", fate: "REMOVED · campus generic" },
  { id: "desk", name: "Night Desk", fate: "REMOVED · campus generic" },
  { id: "ra", name: "Resident Advisor", fate: "REMOVED · campus generic" },
  { id: "chem", name: "Lab Burner", fate: "REMOVED · campus generic" },
  { id: "debate", name: "Debate Chair", fate: "REMOVED · campus generic" },
  { id: "radio", name: "Campus Radio", fate: "REMOVED · campus generic" },
  { id: "counsel", name: "Wellness Desk", fate: "REMOVED · campus generic" },
  { id: "ta", name: "Teaching Assistant", fate: "REMOVED · campus generic" },
  { id: "press", name: "Student Paper", fate: "REMOVED · campus generic" },
  { id: "term", name: "Lab Terminal", fate: "REMOVED · campus generic" },
  { id: "lecture", name: "Lecture Hall", fate: "REMOVED · campus generic" },
  { id: "reg", name: "Registrar", fate: "REMOVED · campus generic" },
  { id: "ethics", name: "Ethics Board", fate: "REMOVED · campus generic" },
  { id: "maga-kyleyle", name: "Kyle Rightenhouse", fate: "REMOVED · extra Liberty → Kanye Vest" },
  { id: "wild-bruella", name: "Bruella", fate: "REMOVED · extra wildcard" },
  { id: "wild-danny", name: "Danny", fate: "REMOVED · extra wildcard" },
  { id: "wild-price", name: "Price", fate: "REMOVED · extra wildcard" },
  { id: "wild-metalpak", name: "MetalPak", fate: "REMOVED · extra wildcard" },
  { id: "wild-hatty", name: "HattyHats", fate: "REMOVED · extra wildcard" },
  { id: "wild-octo", name: "Octo", fate: "REMOVED · extra wildcard" },
  { id: "wild-airosoul", name: "Airosoul", fate: "REMOVED · extra wildcard" },
  { id: "mma-mcgregor", name: "Cokehead McGregor (skin)", fate: "REMOUNTED · Conor Macgregor walkout" },
  { id: "mma-khabib", name: "Khabib Nurma-go-bed (skin)", fate: "REMOUNTED · Khabib Nurmagoat walkout" },
  { id: "mma-bonesaw", name: "Jon Bonesaw (skin)", fate: "REMOUNTED · Jon Jonesy walkout" },
  { id: "mma-adesanya", name: "Israel A-this-anya (skin)", fate: "REMOUNTED · Israel Adesanya-ish walkout" },
  { id: "mma-poorer", name: "Dustin Poor-ier (skin)", fate: "REMOUNTED · Dustin Poirier-ish walkout" },
  { id: "mma-diaznt", name: "Nate Diazn't (skin)", fate: "REMOUNTED · Nate Diaz-ish walkout" },
];

export const RETIRE_MAP: Record<string, string> = {
  riot: "maga-grumptor",
  mascot: "lw-sandbags",
  gavel: "maga-boris",
  boiler: "mma-nurmagoat",
  mason: "mma-jonesy",
  janitor: "lw-bitenten",
  coach: "mma-poirierish",
  bus: "maga-boris",
  cadet: "maga-vestyt",
  pledge: "mma-diazish",
  bass: "maga-steers",
  chef: "mma-poirierish",
  spike: "mma-macgregor",
  foil: "mma-adesanyaish",
  skate: "mma-macgregor",
  shot: "maga-alexgroans",
  flyer: "lw-harass",
  alto: "maga-rogentor",
  mail: "maga-elonmolk",
  intern: "maga-steers",
  bike: "mma-macgregor",
  belfry: "lw-hocking",
  sack: "mma-diazish",
  snare: "mma-jonesy",
  desk: "lw-hocking",
  ra: "lw-vakxie",
  chem: "lw-vakxie",
  debate: "maga-brander",
  radio: "maga-rogentor",
  counsel: "lw-bitenten",
  ta: "lw-odramma",
  press: "lw-odramma",
  term: "maga-elonmolk",
  lecture: "lw-youngturkey",
  reg: "maga-boris",
  ethics: "lw-vakxie",
  "maga-kyleyle": "maga-vestyt",
  "wild-bruella": "wild-dynasty",
  "wild-danny": "wild-dynasty",
  "wild-price": "wild-enigma",
  "wild-metalpak": "wild-butter",
  "wild-hatty": "wild-dynasty",
  "wild-octo": "wild-icon",
  "wild-airosoul": "wild-cezanne",
};

export const DEFAULT_KIT = "maga-grumptor";
export const HOOLI_ID = "maga-hooli";

export function isHooliId(id: string): boolean {
  return id === HOOLI_ID;
}

/** Hooli is live, but only developers and AI may select him. */
export function isDevAiOnlyHero(id: string): boolean {
  return isHooliId(id);
}

export const CAMPUS: HeroDef[] = [...STR, ...AGI, ...INT].map(sealHero);
const MAGA_LIVE = MAGA_WING.filter((h) => MAGA_LIVE_IDS.includes(h.id)).map(sealHero);
const MAGA_CUT = MAGA_WING.filter((h) => !MAGA_LIVE_IDS.includes(h.id)).map(sealHero);
const ANTIFA_LIVE = ANTIFA_WING.filter((h) => ANTIFA_LIVE_IDS.includes(h.id)).map(sealHero);
const ANTIFA_CUT = ANTIFA_WING.filter((h) => !ANTIFA_LIVE_IDS.includes(h.id)).map(sealHero);
const WILD_LIVE = WILD_DLC.filter((h) => WILD_LIVE_IDS.includes(h.id)).map(sealHero);
const WILD_CUT = WILD_DLC.filter((h) => !WILD_LIVE_IDS.includes(h.id)).map(sealHero);
const MMA_LIVE = MMA_WING.filter((h) => MMA_LIVE_IDS.includes(h.id)).map(sealHero);

export const RETIRED_HEROES: HeroDef[] = [...CAMPUS, ...MAGA_CUT, ...ANTIFA_CUT, ...WILD_CUT];
export const HEROES: HeroDef[] = [...MAGA_LIVE, ...ANTIFA_LIVE, ...MMA_LIVE, ...WILD_LIVE];
export const FREE_HEROES: HeroDef[] = HEROES.filter((h) => !h.dlc);
/** Public draft / random / matchmaking pool. Hooli is out. */
export const HUMAN_HEROES: HeroDef[] = HEROES.filter((h) => !isDevAiOnlyHero(h.id));
export const HUMAN_FREE_HEROES: HeroDef[] = HUMAN_HEROES.filter((h) => !h.dlc);
/** AI and developer/test pool. Hooli is in. */
export const AI_HERO_POOL: HeroDef[] = HEROES;
export const AI_FREE_HEROES: HeroDef[] = FREE_HEROES;

export function heroById(id: string): HeroDef {
  const found = HEROES.find((h) => h.id === id) ?? RETIRED_HEROES.find((h) => h.id === id) ?? HEROES[0]!;
  return withMmaMeleeBasic(found);
}

/** Reject a human Hooli pick. Developers pass allowDevAi. */
export function authorizeHumanHero(id: string, allowDevAi = false): string {
  const live = liveHeroId(id);
  if (isDevAiOnlyHero(live) && !allowDevAi) return DEFAULT_KIT;
  return isPlayable(live) ? live : DEFAULT_KIT;
}

export function isPlayable(id: string): boolean {
  return HEROES.some((h) => h.id === id);
}

export function isMmaHero(id: string): boolean {
  return HEROES.some((h) => h.id === id && h.wing === "mma");
}

export function liveHeroId(id: string): string {
  if (isPlayable(id)) return id;
  return RETIRE_MAP[id] ?? DEFAULT_KIT;
}

export function heroesByAttr(attr: Attr): HeroDef[] {
  return HEROES.filter((h) => h.attr === attr);
}

export function wingHeroes(wing: Wing, pool: readonly HeroDef[] = HUMAN_HEROES): HeroDef[] {
  return pool.filter((h) => h.wing === wing);
}

/** Uniform shuffle inside one attribute. DLC is eligible and not weighted. */
function aiAttrSlice(pool: HeroDef[], attr: Attr): HeroDef[] {
  const slice = pool.filter((h) => h.attr === attr);
  for (let i = slice.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = slice[i]!;
    slice[i] = slice[j]!;
    slice[j] = swap;
  }
  return slice;
}

/** Five DLC kits for a spectator match. MMA and wildcards only. */
export function dlcMatchKits(): HeroDef[] {
  const pool = HEROES.filter((h) => h.dlc);
  const mix: HeroDef[] = [];
  for (const attr of ATTRS) {
    const slice = pool.filter((h) => h.attr === attr.id);
    for (let i = 0; i < 2 && mix.length < 5; i++) {
      const next = slice[i];
      if (next && !mix.some((h) => h.id === next.id)) mix.push(next);
    }
  }
  for (const h of pool) {
    if (mix.length >= 5) break;
    if (!mix.some((x) => x.id === h.id)) mix.push(h);
  }
  return mix.slice(0, 5);
}

export function matchKits(pick: HeroDef): HeroDef[] {
  const mix: HeroDef[] = [pick];
  const pool = AI_HERO_POOL.filter((h) => h.id !== pick.id);
  for (const attr of ATTRS) {
    const need = pick.attr === attr.id ? 1 : 2;
    const slice = aiAttrSlice(pool, attr.id);
    for (let i = 0; i < need && mix.length < 5; i++) {
      const next = slice[i];
      if (next && !mix.some((h) => h.id === next.id)) mix.push(next);
    }
  }
  for (const h of pool) {
    if (mix.length >= 5) break;
    if (!mix.some((x) => x.id === h.id)) mix.push(h);
  }
  return mix.slice(0, 5);
}

export type ItemUnlock = "early" | "mid" | "late" | "end";

export type ItemDef = {
  id: string;
  name: string;
  cost: number;
  blurb: string;
  hp?: number;
  damage?: number;
  armor?: number;
  ms?: number;
  splash?: number;
  splashR?: number;
  crit?: number;
  critX?: number;
  bash?: number;
  bashT?: number;
  /** Shelf gate. Omitted items stay on the opening shelf. */
  unlock?: ItemUnlock;
  /** Click the slot to use it. Stackable consumes share a slot. */
  consume?: "ward" | "smoke";
  /** Click the bag slot to fire it. */
  active?: "haste" | "shield" | "heal";
  activeCd?: number;
  /** Click heal, added to current health. */
  heal?: number;
  /** Same id shares a slot up to maxStack. */
  stackable?: boolean;
  maxStack?: number;
  /** Refund for one. Omitted items sell for SELL_RATIO of cost. */
  sellValue?: number;
  /** Quick-buy places each of these. The whole buy fails if they do not fit. */
  recipe?: string[];
  /** Radius that reveals stealth. */
  trueSight?: number;
};

export const ITEMS: ItemDef[] = [
  { id: "cleats", name: "Track Cleats", cost: 320, blurb: "+35 move speed", ms: 35 },
  { id: "text", name: "Annotated Text", cost: 430, blurb: "+18 damage", damage: 18 },
  { id: "meal", name: "Meal Plan", cost: 520, blurb: "+180 health", hp: 180 },
  { id: "coat", name: "Lab Coat", cost: 480, blurb: "+7 armor", armor: 7 },
  { id: "dean", name: "Dean's List", cost: 980, blurb: "+28 damage, +90 health", damage: 28, hp: 90 },
  { id: "tray", name: "Cafeteria Tray", cost: 860, blurb: "Splash 50% of the hit onto nearby rivals. +12 damage", damage: 12, splash: 0.5, splashR: 170 },
  { id: "pen", name: "Red Pen", cost: 940, blurb: "22% chance to crit for 185% damage. +16 damage", damage: 16, crit: 0.22, critX: 1.85 },
  { id: "ulock", name: "Bike U-Lock", cost: 900, blurb: "18% chance to bash. 1.1s stun. +14 damage", damage: 14, bash: 0.18, bashT: 1.1 },
  { id: "flare", name: "Ward Flare", cost: 80, blurb: "Consumable. Drops a ward at your feet. Reveals stealth.", unlock: "mid", consume: "ward", stackable: true, maxStack: 3 },
  { id: "smoke", name: "Smoke Can", cost: 90, blurb: "Consumable. You fade for 5s. Woods and smoke hide you from far vision.", unlock: "mid", consume: "smoke", stackable: true, maxStack: 3 },
  { id: "lantern", name: "Campus Lantern", cost: 640, blurb: "True sight nearby. +4 armor.", unlock: "mid", armor: 4, trueSight: 220 },
  { id: "plate", name: "Barricade Plate", cost: 760, blurb: "Defensive. +120 health, +8 armor.", unlock: "mid", hp: 120, armor: 8 },
  { id: "banner", name: "Mall Banner", cost: 820, blurb: "Active. A short haste. +8 damage.", unlock: "mid", damage: 8, active: "haste", activeCd: 18 },
  { id: "crown", name: "Capitol Crown", cost: 1550, blurb: "Late damage. +20 damage, +8% crit.", unlock: "late", damage: 20, crit: 0.08, critX: 1.7 },
  { id: "aegis", name: "Needle Aegis", cost: 1480, blurb: "Late defense. +240 health, +6 armor.", unlock: "late", hp: 240, armor: 6 },
  { id: "hourglass", name: "Hourglass", cost: 1320, blurb: "Active. A fat shield. +40 health.", unlock: "end", hp: 40, active: "shield", activeCd: 22 },
];
