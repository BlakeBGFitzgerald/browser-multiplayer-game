import { isPlayable, liveHeroId, MMA_LIVE_IDS } from "./game/heroes";

export type SkinLook =
  | "eagle"
  | "mask"
  | "cape"
  | "crown"
  | "visor"
  | "hide"
  | "stamp"
  | "spine"
  | "parade"
  | "sash"
  | "hood"
  | "goggles"
  | "band"
  | "badge"
  | "plume"
  | "wrap"
  | "halo"
  | "gloves"
  | "belt"
  | "ear"
  | "shorts"
  | "tape"
  | "cowl"
  | "web"
  | "shield"
  | "hammer"
  | "bolt"
  | "lasso"
  | "lantern"
  | "claws"
  | "gauntlet"
  | "mouse"
  | "minnie"
  | "pooh"
  | "tigger"
  | "alice"
  | "hatter"
  | "grin"
  | "holmes"
  | "drac"
  | "neckbolts"
  | "felix"
  | "oz"
  | "robin";

export type DlcSkin = {
  id: string;
  hero: string;
  name: string;
  blurb: string;
  coins: number;
  look: SkinLook;
  tint: string;
};

export const DLC: DlcSkin[] = [
  { id: "hat-eagle", hero: "riot", name: "Eagle Hat", blurb: "Riot Cap sideline hat. MAGA gold brim.", coins: 400, look: "eagle", tint: "#f0c14a" },
  { id: "riot-parade", hero: "riot", name: "Parade Cape", blurb: "Homecoming cape for the carry.", coins: 700, look: "parade", tint: "#e8c45a" },
  { id: "riot-night", hero: "riot", name: "Night Captain", blurb: "Black visor, red brim. Night game kit.", coins: 500, look: "visor", tint: "#c4161c" },
  { id: "riot-stars", hero: "riot", name: "Stars Sash", blurb: "Red sash. Lawn-sign gold on the hip.", coins: 600, look: "sash", tint: "#c4161c" },
  { id: "riot-plume", hero: "riot", name: "Capitol Plume", blurb: "White plume on the visor. Mall-side dress kit.", coins: 650, look: "plume", tint: "#efe6d6" },
  { id: "hat-mask", hero: "desk", name: "Stack Mask", blurb: "Night Desk stack-mask. Antifa night kit.", coins: 400, look: "mask", tint: "#7ec8ff" },
  { id: "desk-spine", hero: "desk", name: "Midnight Spine", blurb: "Purple overdue jacket for the nuker.", coins: 550, look: "spine", tint: "#b08cff" },
  { id: "desk-overdue", hero: "desk", name: "Overdue Red", blurb: "Date-stamp red for late fees.", coins: 500, look: "stamp", tint: "#ff5a5a" },
  { id: "desk-hood", hero: "desk", name: "Stack Hood", blurb: "Graveyard-shift hood. Quiet stacks.", coins: 520, look: "hood", tint: "#3ec8c1" },
  { id: "desk-halo", hero: "desk", name: "Overdue Halo", blurb: "Late-fee ring over the desk lamp.", coins: 480, look: "halo", tint: "#ffb347" },
  { id: "mascot-foam", hero: "mascot", name: "Foam Crown", blurb: "Foam-finger crown. School spirit.", coins: 450, look: "crown", tint: "#ff7a45" },
  { id: "cape-gold", hero: "mascot", name: "Spirit Cape", blurb: "Gold parade cape on the tank.", coins: 700, look: "cape", tint: "#ffd27a" },
  { id: "mascot-rally", hero: "mascot", name: "Rally Hide", blurb: "Heavy hide. Looks like a marching mascot.", coins: 500, look: "hide", tint: "#d45c2c" },
  { id: "mascot-sash", hero: "mascot", name: "Letterman Sash", blurb: "Homecoming letters across the chest.", coins: 560, look: "sash", tint: "#ffd27a" },
  { id: "mascot-gog", hero: "mascot", name: "Spirit Goggles", blurb: "Foam-pit goggles. Keep the paint off.", coins: 500, look: "goggles", tint: "#ff7a45" },
  { id: "gavel-sash", hero: "gavel", name: "Bench Sash", blurb: "Closed-session gold on the initiator.", coins: 520, look: "sash", tint: "#c9a227" },
  { id: "gavel-badge", hero: "gavel", name: "Expulsion Badge", blurb: "Dean’s seal on the robe.", coins: 640, look: "badge", tint: "#c4161c" },
  { id: "boiler-gog", hero: "boiler", name: "Steam Goggles", blurb: "Plant-floor lenses. Keep the burst off.", coins: 480, look: "goggles", tint: "#d26a2c" },
  { id: "boiler-hide", hero: "boiler", name: "Pressure Hide", blurb: "Boiler-plate wrap for the tank.", coins: 540, look: "hide", tint: "#8a4030" },
  { id: "cadet-plume", hero: "cadet", name: "Dress Plume", blurb: "ROTC dress hat. Drill-day white.", coins: 560, look: "plume", tint: "#efe6d6" },
  { id: "cadet-sash", hero: "cadet", name: "Drill Sash", blurb: "Parade gold across the cadet.", coins: 500, look: "sash", tint: "#c9a24a" },
  { id: "spike-wrap", hero: "spike", name: "Lane Wrap", blurb: "Track tape on the calves.", coins: 480, look: "wrap", tint: "#e8e0a8" },
  { id: "spike-visor", hero: "spike", name: "Gold Spikes", blurb: "Meet-day visor. Lane one gold.", coins: 620, look: "visor", tint: "#f0c14a" },
  { id: "intern-band", hero: "intern", name: "Field Band", blurb: "Clipboard crew. Lawn-sign red.", coins: 450, look: "band", tint: "#c4161c" },
  { id: "intern-cape", hero: "intern", name: "Yard Sign Cape", blurb: "Corrugated cape. Vote here.", coins: 700, look: "cape", tint: "#efe6d6" },
  { id: "ra-badge", hero: "ra", name: "Duty Badge", blurb: "Hall-desk clip. Quiet hours.", coins: 520, look: "badge", tint: "#a78bfa" },
  { id: "ra-hood", hero: "ra", name: "Quiet Hours Hood", blurb: "After-curfew hood on the support.", coins: 560, look: "hood", tint: "#6b5b95" },
  { id: "mma-mcgregor", hero: "mma-macgregor", name: "Walk-Out Gloves", blurb: "Conor Macgregor walkout. MMA DLC kit look. Parody.", coins: 750, look: "gloves", tint: "#1b6b3a" },
  { id: "mma-lousy", hero: "mma-jonesy", name: "Ronda Lousy", blurb: "Armbar belt on Jonesy. Extra walkout. Parody.", coins: 720, look: "belt", tint: "#c9a227" },
  { id: "mma-lesnear", hero: "mma-nurmagoat", name: "Brock Lesnear", blurb: "Suplex shorts on Nurmagoat. Extra walkout. Parody.", coins: 680, look: "shorts", tint: "#c4161c" },
  { id: "mma-lidless", hero: "mma-poirierish", name: "Chuck Lidless", blurb: "Cauliflower ear on Poirier-ish. Extra walkout. Parody.", coins: 640, look: "ear", tint: "#e07a3d" },
  { id: "mma-khabib", hero: "mma-nurmagoat", name: "Sambo Wrap", blurb: "Khabib Nurmagoat walkout. MMA DLC kit look. Parody.", coins: 700, look: "wrap", tint: "#c4161c" },
  { id: "mma-holm", hero: "mma-adesanyaish", name: "Holly Holm-run", blurb: "Kickband on Adesanya-ish. Extra walkout. Parody.", coins: 620, look: "band", tint: "#efe6d6" },
  { id: "mma-diaznt", hero: "mma-diazish", name: "Stockton Tape", blurb: "Nate Diaz-ish walkout. MMA DLC kit look. Parody.", coins: 600, look: "tape", tint: "#2aa198" },
  { id: "mma-adesanya", hero: "mma-adesanyaish", name: "Style Gloves", blurb: "Israel Adesanya-ish walkout. MMA DLC kit look. Parody.", coins: 660, look: "gloves", tint: "#5c7a4a" },
  { id: "mma-omalley", hero: "mma-macgregor", name: "Sean O'Mally", blurb: "Showtime shorts on Macgregor. Extra walkout. Parody.", coins: 640, look: "shorts", tint: "#ff6fae" },
  { id: "mma-ngannou", hero: "mma-nurmagoat", name: "Francis No-canoe", blurb: "Power belt on Nurmagoat. Extra walkout. Parody.", coins: 700, look: "belt", tint: "#d26a2c" },
  { id: "mma-nunes", hero: "mma-adesanyaish", name: "Amanda Noons", blurb: "Lioness ear on Adesanya-ish. Extra walkout. Parody.", coins: 650, look: "ear", tint: "#a78bfa" },
  { id: "mma-weili", hero: "mma-jonesy", name: "Zhang Way-lee", blurb: "Champ tape on Jonesy. Extra walkout. Parody.", coins: 630, look: "tape", tint: "#cfd8dc" },
  { id: "mma-bonesaw", hero: "mma-jonesy", name: "Title Belt", blurb: "Jon Jonesy walkout. MMA DLC kit look. Parody.", coins: 740, look: "belt", tint: "#c9a24a" },
  { id: "mma-perera", hero: "mma-adesanyaish", name: "Alex Perera", blurb: "Kick gloves on Adesanya-ish. Extra walkout. Parody.", coins: 720, look: "gloves", tint: "#d4a017" },
  { id: "mma-mashvidal", hero: "mma-diazish", name: "Jorge Mash-vidal", blurb: "BMF tape on Diaz-ish. Extra walkout. Parody.", coins: 680, look: "tape", tint: "#ff6fae" },
  { id: "mma-hollerway", hero: "mma-macgregor", name: "Max Holler-way", blurb: "Volume band on Macgregor. Extra walkout. Parody.", coins: 660, look: "band", tint: "#9ec9d9" },
  { id: "mma-shevcheck", hero: "mma-adesanyaish", name: "Valentina Shev-check", blurb: "Bullet wrap on Adesanya-ish. Extra walkout. Parody.", coins: 700, look: "wrap", tint: "#ffb6c1" },
  { id: "mma-gatejee", hero: "mma-diazish", name: "Justin Gate-jee", blurb: "Cauliflower ear on Diaz-ish. Extra walkout. Parody.", coins: 670, look: "ear", tint: "#2aa198" },
  { id: "mma-poorer", hero: "mma-poirierish", name: "Diamond Gloves", blurb: "Dustin Poirier-ish walkout. MMA DLC kit look. Parody.", coins: 680, look: "gloves", tint: "#c4b49a" },
  { id: "mma-oliveher", hero: "mma-nurmagoat", name: "Charles Olive-her", blurb: "Do Bronx wrap on Nurmagoat. Extra walkout. Parody.", coins: 690, look: "wrap", tint: "#86c232" },
  { id: "mma-makechev", hero: "mma-nurmagoat", name: "Islam Make-chev", blurb: "Sambo belt on Nurmagoat. Extra walkout. Parody.", coins: 730, look: "belt", tint: "#e6d5a8" },
  { id: "mma-fergusoff", hero: "mma-macgregor", name: "Tony Fergus-off", blurb: "El Cucuy ear on Macgregor. Extra walkout. Parody.", coins: 640, look: "ear", tint: "#f06292" },
  { id: "mma-coreme", hero: "mma-jonesy", name: "Daniel Core-me", blurb: "DC belt on Jonesy. Extra walkout. Parody.", coins: 710, look: "belt", tint: "#eceff1" },
  { id: "mma-strictland", hero: "mma-poirierish", name: "Sean Strict-land", blurb: "Point-fight band on Poirier-ish. Extra walkout. Parody.", coins: 650, look: "band", tint: "#ffe082" },
  { id: "wild-icon", hero: "wild-icon", name: "The Icon", blurb: "Streetwear tank. Unclassified DLC. Parody.", coins: 720, look: "stamp", tint: "#c45c5c" },
  { id: "wild-enigma", hero: "wild-enigma", name: "The Enigma", blurb: "Dark-file controller. Unclassified DLC. Parody.", coins: 730, look: "cowl", tint: "#3a3a48" },
  { id: "wild-cartoons", hero: "wild-cartoons", name: "The Cartoons", blurb: "Hazard duo. Unclassified DLC. Parody. Not South Park.", coins: 740, look: "crown", tint: "#c4161c" },
  { id: "wild-dynasty", hero: "wild-dynasty", name: "The Reality Dynasty", blurb: "Trending caster. Unclassified DLC. Parody.", coins: 760, look: "sash", tint: "#ff6fae" },
  { id: "wild-legend", hero: "wild-legend", name: "The Legend", blurb: "Melee disruptor. Unclassified DLC. Parody.", coins: 740, look: "badge", tint: "#f0c14a" },
  { id: "wild-karen", hero: "wild-karen", name: "The Entitlement", blurb: "Taunt tank. Unclassified DLC. Parody.", coins: 700, look: "badge", tint: "#c9a24a" },
  { id: "wild-vegan", hero: "wild-vegan", name: "Plant Power", blurb: "Nature support. Unclassified DLC. Parody.", coins: 700, look: "halo", tint: "#5ad45a" },
  { id: "wild-butter", hero: "wild-butter", name: "The Tech", blurb: "Gadget artillery. Unclassified DLC. Parody.", coins: 710, look: "visor", tint: "#69f0ae" },
  { id: "wild-bruella", hero: "wild-bruella", name: "Bruella", blurb: "Chaos fighter. Unclassified DLC. Parody.", coins: 720, look: "mask", tint: "#7a4a9a" },
  { id: "wild-danny", hero: "wild-danny", name: "Danny", blurb: "Ambush assassin. Unclassified DLC. Parody.", coins: 680, look: "hood", tint: "#7a8b99" },
  { id: "wild-price", hero: "wild-price", name: "Price", blurb: "Time carry. Unclassified DLC. Parody.", coins: 690, look: "badge", tint: "#b0bec5" },
  { id: "wild-cezanne", hero: "wild-cezanne", name: "Pheobe", blurb: "Paint controller. Unclassified DLC. Parody.", coins: 700, look: "halo", tint: "#ce93d8" },
  { id: "wild-metalpak", hero: "wild-metalpak", name: "MetalPak", blurb: "Ranged gadgets. Unclassified DLC. Parody.", coins: 720, look: "gauntlet", tint: "#d26a2c" },
  { id: "wild-hatty", hero: "wild-hatty", name: "HattyHats", blurb: "Runway marksman. Unclassified DLC. Parody.", coins: 710, look: "plume", tint: "#ff6fae" },
  { id: "wild-octo", hero: "wild-octo", name: "Octo", blurb: "???? tank. Unclassified DLC. Parody.", coins: 690, look: "claws", tint: "#7a4a9a" },
  { id: "wild-airosoul", hero: "wild-airosoul", name: "Airosoul", blurb: "Vibe support. Unclassified DLC. Parody.", coins: 700, look: "hood", tint: "#80cbc4" },
  { id: "mv-cap", hero: "riot", name: "Captain Amerigo", blurb: "Lawn-sign shield. Parody. Not Marvel.", coins: 780, look: "shield", tint: "#c4161c" },
  { id: "mv-spid", hero: "spike", name: "Quad-Crawler", blurb: "Web on the lane. Parody. Not Marvel.", coins: 760, look: "web", tint: "#c4161c" },
  { id: "mv-iron", hero: "intern", name: "Irony Man", blurb: "Arc visor. Field-office gold. Parody. Not Marvel.", coins: 800, look: "visor", tint: "#c9a24a" },
  { id: "mv-hulk", hero: "mascot", name: "Incredible Sulk", blurb: "Foam claws. Parody. Not Marvel.", coins: 740, look: "claws", tint: "#5ad45a" },
  { id: "mv-thor", hero: "coach", name: "Floor", blurb: "Weight-room hammer. Parody. Not Marvel.", coins: 720, look: "hammer", tint: "#c9a24a" },
  { id: "mv-wolv", hero: "foil", name: "Wolver-dine", blurb: "Adamant foil. Parody. Not Marvel.", coins: 750, look: "claws", tint: "#cfd8dc" },
  { id: "mv-dead", hero: "term", name: "Dead Fool", blurb: "Red mask. CS lab chatter. Parody. Not Marvel.", coins: 700, look: "mask", tint: "#c4161c" },
  { id: "mv-strange", hero: "desk", name: "Doctor Strange Hours", blurb: "Late-fee halo. Parody. Not Marvel.", coins: 730, look: "halo", tint: "#b08cff" },
  { id: "mv-widow", hero: "ra", name: "Black Window", blurb: "Hall-desk goggles. Parody. Not Marvel.", coins: 710, look: "goggles", tint: "#3a3a48" },
  { id: "mv-loki", hero: "radio", name: "Low-key", blurb: "Mischief hood. Late slot. Parody. Not Marvel.", coins: 690, look: "hood", tint: "#7a4a9a" },
  { id: "mv-thanos", hero: "lecture", name: "They-nos", blurb: "100-level gauntlet. Parody. Not Marvel.", coins: 820, look: "gauntlet", tint: "#7a4a9a" },
  { id: "mv-hawk", hero: "shot", name: "Hawk-eye", blurb: "Yearbook aim band. Parody. Not Marvel.", coins: 680, look: "band", tint: "#9ec9d9" },
  { id: "dc-bat", hero: "cadet", name: "Brat-Man", blurb: "ROTC cowl. Parody. Not DC.", coins: 800, look: "cowl", tint: "#1a120c" },
  { id: "dc-super", hero: "boiler", name: "Man of Steal", blurb: "Plant-floor cape. Parody. Not DC.", coins: 780, look: "cape", tint: "#c4161c" },
  { id: "dc-ww", hero: "flyer", name: "Wonder Hours", blurb: "Cheer-squad lasso. Parody. Not DC.", coins: 760, look: "lasso", tint: "#c9a24a" },
  { id: "dc-flash", hero: "bike", name: "The Flush", blurb: "Bloc-run bolt. Parody. Not DC.", coins: 740, look: "bolt", tint: "#c4161c" },
  { id: "dc-aqua", hero: "janitor", name: "Aqua-janitor", blurb: "Fountain sash. Parody. Not DC.", coins: 700, look: "sash", tint: "#3d6ea6" },
  { id: "dc-joker", hero: "press", name: "Quad Joker", blurb: "Op-ed stamp. Parody. Not DC.", coins: 720, look: "stamp", tint: "#3ec8c1" },
  { id: "dc-harley", hero: "skate", name: "Harley Twin", blurb: "Quad-skate shorts. Parody. Not DC.", coins: 710, look: "shorts", tint: "#ff6fae" },
  { id: "dc-cat", hero: "ethics", name: "Cat-stacks", blurb: "Review-board ear. Parody. Not DC.", coins: 690, look: "ear", tint: "#ce93d8" },
  { id: "dc-lex", hero: "gavel", name: "Dean Luthor", blurb: "Bald badge. Parody. Not DC.", coins: 770, look: "badge", tint: "#b0bec5" },
  { id: "dc-shazam", hero: "ta", name: "Shazam-class", blurb: "Office-hours plume. Parody. Not DC.", coins: 730, look: "plume", tint: "#ffe082" },
  { id: "dc-cyborg", hero: "bus", name: "Cy-board", blurb: "Road-block visor. Parody. Not DC.", coins: 700, look: "visor", tint: "#69f0ae" },
  { id: "dc-lamp", hero: "counsel", name: "Green Lamp", blurb: "Wellness lantern. Parody. Not DC.", coins: 750, look: "lantern", tint: "#5ad45a" },
  {
    id: "pd-mikey",
    hero: "mascot",
    name: "Mikey Mouse",
    blurb: "Steamboat-era mouse. Round ears, pie eyes, two-button shorts. Public domain 1928.",
    coins: 720,
    look: "mouse",
    tint: "#111111",
  },
  {
    id: "pd-minnie",
    hero: "flyer",
    name: "Minnie Mouse",
    blurb: "Steamboat-era mouse with a bow. Public domain 1928. Not a later Disney design.",
    coins: 720,
    look: "minnie",
    tint: "#ff6fae",
  },
  {
    id: "pd-pooh",
    hero: "chef",
    name: "Winnie-the-Pooh",
    blurb: "Shepard-era bear. Round ears, honey pot. Public domain 1926.",
    coins: 700,
    look: "pooh",
    tint: "#f0c14a",
  },
  {
    id: "pd-tigger",
    hero: "spike",
    name: "Tigger",
    blurb: "Bouncy stripes from The House at Pooh Corner. Public domain 1928.",
    coins: 700,
    look: "tigger",
    tint: "#e07a3d",
  },
  {
    id: "pd-alice",
    hero: "intern",
    name: "Alice",
    blurb: "Wonderland pinafore and headband. Tenniel-era. Public domain 1865.",
    coins: 680,
    look: "alice",
    tint: "#7ec8ff",
  },
  {
    id: "pd-hatter",
    hero: "lecture",
    name: "Mad Hatter",
    blurb: "Tall hat, 10/6 card. Wonderland. Public domain 1865.",
    coins: 680,
    look: "hatter",
    tint: "#c4161c",
  },
  {
    id: "pd-cheshire",
    hero: "radio",
    name: "Cheshire Cat",
    blurb: "The grin stays. Wonderland. Public domain 1865.",
    coins: 690,
    look: "grin",
    tint: "#c9a24a",
  },
  {
    id: "pd-holmes",
    hero: "desk",
    name: "Sherlock Holmes",
    blurb: "Deerstalker and pipe. Doyle. Public domain.",
    coins: 710,
    look: "holmes",
    tint: "#5a4a3a",
  },
  {
    id: "pd-drac",
    hero: "ra",
    name: "Count Dracula",
    blurb: "High collar, fangs. Stoker 1897. Public domain.",
    coins: 720,
    look: "drac",
    tint: "#c4161c",
  },
  {
    id: "pd-frank",
    hero: "boiler",
    name: "Frankenstein",
    blurb: "Flat head, neck bolts. Shelley 1818. Public domain. The creature, not the doctor.",
    coins: 720,
    look: "neckbolts",
    tint: "#5ad45a",
  },
  {
    id: "pd-felix",
    hero: "skate",
    name: "Felix the Cat",
    blurb: "Black cat, wide grin. Silent-era. Public domain 1919.",
    coins: 680,
    look: "felix",
    tint: "#111111",
  },
  {
    id: "pd-dorothy",
    hero: "cadet",
    name: "Dorothy Gale",
    blurb: "Gingham and silver shoes. Baum’s Oz, 1900. Public domain. Not ruby — those came later.",
    coins: 680,
    look: "oz",
    tint: "#c9a24a",
  },
  {
    id: "pd-robin",
    hero: "shot",
    name: "Robin Hood",
    blurb: "Feathered cap. Ballad outlaw. Public domain.",
    coins: 690,
    look: "robin",
    tint: "#3fa34a",
  },
];

export const BUNDLE_ID = "kit-22";
export const WILD_PACK_ID = "wild-pack";
export const MMA_PACK_ID = "mma-pack";

/** Every extra skin. PayPal and card. */
export const SKIN_GBP = 1.99;
export const SKIN_PENCE = 199;
/** Millix knocks this fraction off the sticker. */
export const MLX_OFF = 0.4;
/** 1,000,000 MLX = $0.18 (fiatleak). Locker treats the £ sticker on that peg. */
export const FIATLEAK_USD_PER_MILLION = 0.18;

/** Millix-only gallery seat. Type in chat. Cannot talk. */
export const SPEC_ID = "spec-seat";
export const SPEC_MLX = 100_000;
export const SPEC_NAME = "Spectator Seat";

export function formatGbp(pence: number): string {
  return `£${(Math.max(0, pence) / 100).toFixed(2)}`;
}

export function gbpToMlx(gbp: number): number {
  if (gbp <= 0) return 0;
  return Math.max(1, Math.round((gbp / FIATLEAK_USD_PER_MILLION) * 1_000_000));
}

export function mlxOffGbp(gbp: number): number {
  return gbpToMlx(gbp * (1 - MLX_OFF));
}

export function skinMlx(): number {
  return mlxOffGbp(SKIN_GBP);
}

/** Kit Bundle: every extra skin at half the £1.99 shelf. */
export function bundlePence(): number {
  return Math.max(SKIN_PENCE, Math.round(DLC.length * SKIN_PENCE * 0.5));
}

export function bundleMlx(): number {
  return mlxOffGbp(bundlePence() / 100);
}

export function mlxAmt(n: number): string {
  return n.toLocaleString("en-US");
}

/** 1,000,000 MLX = $0.18 (fiatleak). Millix is a micropayment. */
export function mlxFiat(mlx: number): string {
  const usd = (mlx / 1_000_000) * 0.18;
  if (usd < 0.01) return `$${usd.toFixed(6)}`;
  return `$${usd.toFixed(2)}`;
}

export function skinById(id: string): DlcSkin | undefined {
  return DLC.find((s) => s.id === id);
}

export function skinsForHero(hero: string): DlcSkin[] {
  return DLC.filter((s) => s.hero === hero);
}

export function isPdSkin(id: string): boolean {
  return id.startsWith("pd-");
}

export function pdSkins(): DlcSkin[] {
  return DLC.filter((s) => isPdSkin(s.id));
}

export function isMmaSkin(id: string): boolean {
  return id.startsWith("mma-") && id !== MMA_PACK_ID;
}

export function mmaSkins(): DlcSkin[] {
  return DLC.filter((s) => isMmaSkin(s.id));
}

const PLAYABLE_WILD = new Set([
  "wild-icon",
  "wild-enigma",
  "wild-cartoons",
  "wild-dynasty",
  "wild-legend",
  "wild-karen",
  "wild-butter",
  "wild-cezanne",
  "wild-vegan",
]);

export function isWildSkin(id: string): boolean {
  return id.startsWith("wild-") && id !== WILD_PACK_ID;
}

export function wildSkins(): DlcSkin[] {
  return DLC.filter((s) => isWildSkin(s.id) && PLAYABLE_WILD.has(s.hero));
}

/** Nine unclassified wildcards at half the £1.99 shelf. Millix still knocks 40% off. */
export function wildPackPence(): number {
  return Math.max(SKIN_PENCE, Math.round(wildSkins().length * SKIN_PENCE * 0.5));
}

export function wildPackMlx(): number {
  return mlxOffGbp(wildPackPence() / 100);
}

/** Six MMA DLC heroes at half the £1.99 shelf. Millix still knocks 40% off that sticker. */
export function mmaPackPence(): number {
  return Math.max(SKIN_PENCE, Math.round(MMA_LIVE_IDS.length * SKIN_PENCE * 0.5));
}

export function mmaPackMlx(): number {
  return mlxOffGbp(mmaPackPence() / 100);
}

export function mlxOffLabel(): string {
  return `${Math.round(MLX_OFF * 100)}% OFF WITH MILLIX`;
}

/** Hero ids that have extra skins, in catalog order. Wildcard DLC is its own shelf. */
export function dlcHeroIds(): string[] {
  const out: string[] = [];
  for (const s of DLC) {
    if (isWildSkin(s.id)) continue;
    if (isMmaSkin(s.id)) continue;
    if (!out.includes(s.hero)) out.push(s.hero);
  }
  return out;
}

for (const s of DLC) {
  if (s.hero === "all") continue;
  if (isWildSkin(s.id)) continue;
  if (!isPlayable(s.hero)) s.hero = liveHeroId(s.hero);
}
