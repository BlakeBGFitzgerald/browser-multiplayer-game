export type PatchBlock = {
  name?: string;
  lines: string[];
};

export type PatchSection = {
  id: string;
  heading: string;
  blocks: PatchBlock[];
};

export type Patch = {
  id: string;
  date: string;
  headline: string;
  sections: PatchSection[];
};

export const PATCHES: Patch[] = [
  {
    id: "8.03",
    date: "September 28th, 2026",
    headline: "The nazi bark and Grab them match the other speech.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The Antifa nazi bark and Grump's grab line play at the same loudness as the other spoken lines. Pitch and speed stay. The recording files are unchanged.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "8.02",
    date: "September 28th, 2026",
    headline: "Pheobe uses the Cézanne plate.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Pheobe (wild-cezanne) uses the uploaded Cézanne picture on the draft card, the match bust, and the in-match sprite. The file is /art/heroes/rive-waden.png. Her name stays Pheobe. River Warden still uses that same picture. The bust fits the whole plate so the face and lollipop stay in frame.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "8.01",
    date: "September 28th, 2026",
    headline: "Grump's grab line and the Antifa nazi bark use the supplied clips.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Grump's kill plays the supplied grab-them recording on the desk bus. An Antifa death plays the supplied nazi recording. Conor's kill line stays synthesized. Each clip is classified by id when that voice event starts. Open ?voice=1 to log the detected line, faction, confidence, and gameplay event. A live mic matches those phrases only when the browser reports confidence of at least 0.82. The match does not scan audio every frame.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "8.00",
    date: "September 28th, 2026",
    headline: "Grump and Macgregor call their kills.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "When Grump is credited with a kill, the desk says Grab them by the pussy! When Conor Macgregor is credited with a kill, the desk says Who the fook is that guy? Doubles and higher, first blood, streaks, shutdown, and MAGA death stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.99",
    date: "September 27th, 2026",
    headline: "The ability bar is a bolted steel panel.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The match bar is layered steel with corner bolts. Ability slots sit in inset mounts. Ultimates keep a heavier rim. Cooldown art stays visible.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.98",
    date: "September 27th, 2026",
    headline: "All towers are 5% taller.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Lane towers, ancients, and fountain towers are 5% taller on both sides. They grow up from the same pad.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.97",
    date: "September 27th, 2026",
    headline: "Woods trees stand a little taller.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Oaks and firs in the woods are a little taller on both sides. They grow up from the same spot. Width stays, so the streets and the woods paths stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.96",
    date: "September 27th, 2026",
    headline: "Bots buy in the pool, then walk to their lane and wait for the wave.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Bots buy in the pool, then walk to their lane and wait for the wave.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.94",
    date: "September 27th, 2026",
    headline: "Bot matches use the whole map again.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Bot matches use the whole map again.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.93",
    date: "September 27th, 2026",
    headline: "Bots buy in the pool, then walk to their lane and wait for the wave.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Bots buy in the pool, then walk to their lane and wait for the wave.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.92",
    date: "September 27th, 2026",
    headline: "The match hitches less, and the lanes and pools are easier to read.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The match hitches less, and the lanes and pools are easier to read.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.91",
    date: "September 27th, 2026",
    headline: "The Reality Dynasty walks and swings when she attacks.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The Reality Dynasty walks and swings when she attacks.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.89",
    date: "September 27th, 2026",
    headline: "The Kardashians hero uses the new pink-tracksuit picture at normal hero height.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The Kardashians hero uses the new pink-tracksuit picture at normal hero height.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.88",
    date: "September 27th, 2026",
    headline: "MAGA and Antifa ability pictures are sharper and still readable on cooldown.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "MAGA and Antifa ability pictures are sharper and still readable on cooldown.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.87",
    date: "September 27th, 2026",
    headline: "Each death makes the next respawn a little longer.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Each death makes the next respawn a little longer, up to a cap. A new match starts the count over.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.86",
    date: "September 27th, 2026",
    headline: "Heroes start in their pool, and AI spends its gold on gear that matches its role.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Heroes start in their pool, and AI spends its gold on gear that matches its role.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.85",
    date: "September 27th, 2026",
    headline: "First blood and kill notices play a sound.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "First blood and kill notices play a sound.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.84",
    date: "September 27th, 2026",
    headline: "Placeholder pictures are now detailed pixel art of the real objects.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Ferns, fallen logs, river rocks, and toadstools that were flat stand-ins are now detailed pixel art of the real plants and stones. They stay in the same spots.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.83",
    date: "September 27th, 2026",
    headline: "Sgt. Slush is half size and throws snowballs.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Sgt. Slush is half size and throws snowballs. The snowball leaves the hand. The fort is still a full fight.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.82",
    date: "September 27th, 2026",
    headline: "River Warden uses Pheobe's picture.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "River Warden uses Pheobe's picture. Pheobe still uses it too, and the lollipop still waves when she attacks.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.81",
    date: "September 27th, 2026",
    headline: "Melee fighters and infantry move their arms when they swing.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Melee fighters and infantry move their arms when they swing. Conor punches left and right.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.80",
    date: "September 27th, 2026",
    headline: "Blake is now Blake Fitzgerald.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Blake is now Blake Fitzgerald. The ring desk says the full name. The classified sheet caption matches.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.79",
    date: "September 27th, 2026",
    headline: "AI walks the woods paths, farms jungle camps, and still returns to lane.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "AI walks the woods paths, farms jungle camps, and still returns to lane.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.78",
    date: "September 27th, 2026",
    headline: "AI follows the lanes, buys from the Gift Shop, and only reacts to what their team can see.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "AI follows the lanes, buys from the Gift Shop, and only reacts to what their team can see. Unexplored ground starts dark.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.77",
    date: "September 27th, 2026",
    headline: "Towers stand a little taller than Trump.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Lane towers and base towers stand a little taller than Trump.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.76",
    date: "September 27th, 2026",
    headline: "Each hero's abilities now match that hero.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Each hero's abilities now match that hero, and no two fighters share the same trick. Hooli and Blake Fitzgerald are unchanged.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.75",
    date: "September 27th, 2026",
    headline: "Lane towers and base towers are the same height.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Lane towers and base towers are the same height, 105 pixels.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.74",
    date: "September 27th, 2026",
    headline: "Lane towers are twice as tall. Base towers are half as tall.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Lane towers are twice as tall, and the base towers are half as tall.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.73",
    date: "September 27th, 2026",
    headline: "Each ability has its own picture.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Each ability has its own picture on the bar. Cooldowns still read clearly.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.72",
    date: "September 27th, 2026",
    headline: "Trump, Pheobe, and the MMA fighters are a little shorter.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Trump, Pheobe, and the MMA fighters are a little shorter.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.71",
    date: "September 27th, 2026",
    headline: "Lane towers are taller.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Lane towers are taller so they read on the map, still shorter than heroes.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.70",
    date: "September 27th, 2026",
    headline: "Gift Shop pictures are sharper.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Gift Shop item pictures are sharper and each item looks like itself.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.69",
    date: "September 27th, 2026",
    headline: "Trees stand a little taller.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Trees are a little taller. They grow up from the same spot on the ground. Trunks stay the same thickness, so the streets and the woods paths stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.68",
    date: "September 27th, 2026",
    headline: "MMA heroes alternate punches. A stun shoves them back.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "MMA heroes alternate left and right punches. A stun shakes the hero and shoves them back a step. Damage numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.67",
    date: "September 27th, 2026",
    headline: "Every hero is as tall as Grump. Lane towers share one height.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Every hero is as tall as Grump. Every lane tower is the same height, 0.36 of that. Damage and range stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.66",
    date: "September 27th, 2026",
    headline: "Every hero moves when they attack.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Every hero moves when they attack. A still picture cocks into a swing and returns. Damage stays the same.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.65",
    date: "September 27th, 2026",
    headline: "Hero pictures on the draft cards fit inside the frame.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Hero pictures on the draft cards fit inside the frame, head and feet included.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.64",
    date: "September 27th, 2026",
    headline: "Lane towers are a little smaller.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Lane towers are a little smaller. Mid outer towers on both sides step back from the river. The inner mid towers sit closer to base. Damage and range stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.63",
    date: "September 27th, 2026",
    headline: "Every Gift Shop item has its own picture.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Every Gift Shop item has its own picture. Prices and recipes stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.62",
    date: "September 27th, 2026",
    headline: "MAGA and Antifa infantry and archers are larger.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "MAGA and Antifa infantry and archers are larger. Their damage and health stay the same.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.61",
    date: "September 26th, 2026",
    headline: "Jungle and woods creeps use the new picture.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Jungle and woods creeps use the new picture (the man with the bat and the burning barrel) instead of the placeholder.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.60",
    date: "September 27th, 2026",
    headline: "Cézanne's name on the draft is now Pheobe.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Cézanne's name on the draft is now Pheobe. Picture, kit, and DLC stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.58",
    date: "September 26th, 2026",
    headline: "Rive Waden's plate is in, and the lollipop waves on a basic attack.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Rive Waden's picture replaces the placeholder on Cézanne (wild-cezanne): pink hair, black crop top, ripped jeans, white sneakers, rainbow lollipop. The white background is clear. Feet stay on the ground at the same height as the other supplied heroes. A basic attack waves the lollipop stick once, then it returns to the hold. Her id, stats, abilities, faction, and DLC stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.57",
    date: "September 26th, 2026",
    headline: "AI matches field the full roster. Alex fires when the launcher is up. MAGA heroes call fake news.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "AI matches can field the full roster, including DLC heroes. The player's own draft locks stay.",
              "Alex's rocket leaves when the launcher is up.",
              "MAGA heroes say FAKE NEWS, FAKE NEWS! when they die.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.56",
    date: "September 26th, 2026",
    headline: "The middle tower on mid is gone.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The middle tower on mid is gone for both sides. Outer and inner mid towers stay. Top and bot still have three towers. Take the outer mid tower before the inner one.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.55",
    date: "September 26th, 2026",
    headline: "Lane towers on both sides are twice as large.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Lane towers on both sides are twice as large. Their damage, range, and attack speed stay the same. The ancient and the fountains stay their own size.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.54",
    date: "September 26th, 2026",
    headline: "Shots match the weapon, tower, or archer that fired them.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Shots match the weapon, tower, or archer that fired them. Foam darts stay blue, then orange.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.53",
    date: "September 26th, 2026",
    headline: "The added 128-bit weapons are gone.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The added 128-bit weapons are gone. Heroes keep the weapons already painted in their pictures, including Alex Groans's foam rockets when he fires.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.52",
    date: "September 26th, 2026",
    headline: "Heroes who already hold a weapon in their art do not get a second one drawn on top.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Hooli keeps the rifle in his picture. The Tech keeps the rocket in his hand. A second weapon is not drawn on top of either of them.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.51",
    date: "September 26th, 2026",
    headline: "The red on the MAGA ancient is light blue.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The red on the MAGA ancient is light blue.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.50",
    date: "September 26th, 2026",
    headline: "Six item slots sit on the match HUD. The Gift Shop buys and sells into them.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Six item slots sit on the match HUD. The Gift Shop buys and sells into them.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.49",
    date: "September 26th, 2026",
    headline: "The Gift Shop is open in a match, with build trees and a search box.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The Gift Shop is open in a match, with build trees and a search box. Stand in your fountain and press B or the Shop button. Categories, components, and a recommended build are on the shelf. Escape closes the shop.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.48",
    date: "September 26th, 2026",
    headline: "Each ranged hero holds their own weapon and fires it with their own attack motion.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Each ranged hero holds their own weapon and fires it with their own attack motion. The shot leaves that muzzle. Alex Groans still fires the foam launcher, blue then orange. Melee fighters, Tommy, and Boris keep their swings.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.47",
    date: "September 26th, 2026",
    headline: "Boris swings his red book in melee.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Boris swings his red book in melee.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.46",
    date: "September 26th, 2026",
    headline: "Every playable hero stands as tall as Trump.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Every playable hero stands as tall as Trump.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.45",
    date: "September 26th, 2026",
    headline: "Alex Groans stands as tall as Trump.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Alex Groans stands as tall as Trump. His foam launcher stays in his hands.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.44",
    date: "September 26th, 2026",
    headline: "Battlefield calls sit in the center of the screen.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Battlefield calls, first blood, kill text, and the level popup sit in the center of the screen, then clear.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.43",
    date: "September 26th, 2026",
    headline: "The level popup sits in the center of the screen.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The level popup sits in the center of the screen, then fades.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.42",
    date: "September 26th, 2026",
    headline: "Kill text appears in the center of the screen.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Kill text appears in the center of the screen, then clears.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.40",
    date: "September 26th, 2026",
    headline: "The empty black and gold boxes are gone from the match.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The empty black and gold boxes are gone from the match. The send row no longer sits on the lane. A path choice still shows when you actually reach one.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.39",
    date: "September 26th, 2026",
    headline: "MMA basics are punches. Infantry attacks follow the weapon.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "MMA basics are punches. Left and right alternate, and every third swing is a hook. The fists stay with the hands, and those attacks do not pull out a weapon. Infantry attacks follow the weapon they are holding. Everyone else keeps their attack.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.38",
    date: "September 26th, 2026",
    headline: "The match intro is voice only.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The match intro is voice only. The ring desk still opens each game, and the script is no longer printed on screen.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.37",
    date: "September 26th, 2026",
    headline: "Heroes on foot swing their arms while running.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Heroes on foot swing their arms while running. The arms hang by their sides and alternate with the stride. Wheelchair heroes keep their current pose. A held weapon stays in the hand.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.36",
    date: "September 26th, 2026",
    headline: "The match intro voice is louder.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The match intro voice is louder. The ring desk still opens each game, and you can hear it over the opening sting.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.35",
    date: "September 26th, 2026",
    headline: "Heroes call their own multi-kills.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Every live hero has kill, double, triple, quad, and penta lines. Kills inside twelve seconds climb that voice ladder. A short settle speaks the highest tier in the burst, and the on-screen bark matches the line. Dying clears the ladder for the next life. Streak banners and shutdown gold keep the score clock.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.34",
    date: "September 26th, 2026",
    headline: "Alex Groans fires a foam NERF launcher.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Alex Groans holds a toy NERF launcher. His basic attack and his bolt spells spawn a small foam rocket from the muzzle, alternating blue and orange. Damage, range, and the rest of his kit stay the same. His portrait plate is unchanged.",
            ],
          },
        ],
      },
    ],
  },

  {
    id: "7.32",
    date: "September 26th, 2026",
    headline: "Alex Groans, JP Steers, and Khabib Nurmagoat use their supplied plates.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Alex Groans, JP Steers, and Khabib Nurmagoat use their supplied plates.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.31",
    date: "September 26th, 2026",
    headline: "MMA heroes' basic attacks are melee.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "MMA heroes' basic attacks are melee. They close and strike in melee range. Feints, bolts, and dashes on those kits stay. Other heroes stay as they are.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.30",
    date: "September 26th, 2026",
    headline: "Non-match screens have a Back control.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Non-match screens have a Back control that returns to the previous screen. A live match still uses the leave flow.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.29",
    date: "September 26th, 2026",
    headline: "Each hero can be picked once per match.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Each hero can be picked once per match. A second seat that asks for the same kit is refused. Random and bots take an open kit. The next match starts with a clear pool.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.28",
    date: "September 26th, 2026",
    headline: "Ancients use the shrine picture. Fountains use the tower picture.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Both ancients use that side's shrine picture. Both fountains use that side's tower picture. The MAGA shrine picture is red, white, and blue. Lane towers stay on the tower plates. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.27",
    date: "September 26th, 2026",
    headline: "Health and mana bars sit above the sprite.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Health and mana bars sit above heroes, archers, infantry, and towers. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.26",
    date: "September 26th, 2026",
    headline: "Lane archers and infantry are half an upgraded hero.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Lane archers and infantry on both sides are half the height of an upgraded hero. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.25",
    date: "September 26th, 2026",
    headline: "Antifa towers and the shrine use teal trim.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Antifa towers and the Antifa shrine use teal trim. Stone, black cloth, and candle flames stay. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.24",
    date: "September 26th, 2026",
    headline: "Antifa towers use the antifa tower plate.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Every Antifa lane tower uses the antifa tower plate, the same plate as Seattle. MAGA towers stay on the Trump Tower plate. The Antifa shrine stays the shrine. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.23",
    date: "September 26th, 2026",
    headline: "MAGA towers use the Trump Tower plate.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Every MAGA lane tower uses the Trump Tower plate, the same plate as Washington DC. The MAGA shrine stays the shrine. Seattle and the Antifa towers stay on their own art. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.22",
    date: "September 26th, 2026",
    headline: "Trees and bushes stand taller.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Every tree and bush on the campus grows up from the same spot on the ground. Crowns and shrubs are taller. Width stays, so the streets and the woods paths are the same. Towers, fountains, and kits are unchanged.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.21",
    date: "September 26th, 2026",
    headline: "Supplied plates on the MMA kits, the lane, and both towns.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Conor Macgregor, Dustin Poirier-ish, and Israel Adesanya-ish use their supplied plates. MAGA infantry and archers, and Antifa melee and archers, use theirs. Washington DC is the Trump tower plate. Seattle is the antifa tower plate. Each fountain is that side's shrine plate. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.20",
    date: "September 26th, 2026",
    headline: "Closed beta joins a hosted match.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Closed beta on the enter page takes an invite code and plays the hosted cast match. The server runs the fight. This browser draws it. Find Game still starts a match in this tab. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.19",
    date: "September 26th, 2026",
    headline: "Hold Tab for both teams.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Hold Tab in a match to see Washington DC and Seattle: hero, level, K/D/A, and creep score. Release to close it. The board is in the key list. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.18",
    date: "September 26th, 2026",
    headline: "The left portrait clears the map. Bases show on the bar.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The left portrait sits between the chat and the minimap, and it keeps its aspect. A loaded hero with no kit stays an empty frame instead of borrowing another face. Washington DC and Seattle each have a health pip on the top bar. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.17",
    date: "September 25th, 2026",
    headline: "Hooli bursts three. Every kit has a left portrait.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Hooli's basic attack is one tommy burst: three pellets, three muzzle flashes, one clip. The attack's damage is split across the three shots, and the next burst waits on his attack cooldown. Stud Shot, Stage Dive, Encore, and Sniper Shot stay. A left panel shows the live kit's idle sheet, facing center, and follows whoever is selected. Combat numbers for the roster stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.16",
    date: "September 25th, 2026",
    headline: "Ricky rolls in on the supplied still.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Ricky paints from the supplied wheelchair still on the same sheet rig as the other chairs. Idle breathes. The chair rocks and the wheels turn. He jabs, flashes, flinches, and flops, then the fountain restores the chair. The kit, the cast seat, and the combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.15",
    date: "September 25th, 2026",
    headline: "A cast match. Ten AI, two sides.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Open ?cast-ai=1 for a spectator 5v5. MAGA seats Hooli, Ricky, Steven Hawkin, Joe Rogan, and The Icon. Seattle seats five other live kits. Ricky is a new Liberty yard fighter on the existing pixel painter. Normal Watch AI and the DLC spectator match stay. Combat numbers for the rest of the roster stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.14",
    date: "September 25th, 2026",
    headline: "The woods have walls.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Oaks and firs now stand on the jungle grid. Grove Walk and Thicket Walk stay the main roads. Side cuts, the South Bank Cut, and dead-end pockets sit between them. Camps, lanes, fountains, and the river stay open. A pocket breaks sight from outside its ring. The wider woods veil is unchanged. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.13",
    date: "September 25th, 2026",
    headline: "War drums under the fight.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The battle-drum recording loops on the music bus once a real fight is underway, then fades out when it breaks. One hero or a lane scrap starts it. A single creep does not. Abilities, blasts, and objectives duck it. The anthem still owns the bus when the radio is on. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.12",
    date: "September 25th, 2026",
    headline: "The lane sounds like a fight.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Recorded shots, impacts, and blasts sit on the existing mixer. Hooli's rifle cracks. Artillery hits heavier. Arrows and other ranged kits get a short rush of air. Armor rings, bodies thud, towers and objectives boom. Distant fire thickens from the early game into the late game without turning the master up. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },

  {
    id: "7.10",
    date: "September 25th, 2026",
    headline: "Lane soldiers and camp beasts are drawn to the hero bar.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Infantry, archers, camp creeps, and the big objectives are repainted in the same ink-and-sheen pixel language as the heroes. Red caps, black-bloc hoods, bows, and camp animals stay readable in a wave. Legs step with move speed and plant when a unit stops. Nothing in the fight numbers changed.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.09",
    date: "September 25th, 2026",
    headline: "Less hiss in the fight. Sheet heroes swing their legs.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The compressor was lifting the noise floor, and square-wave hits were carrying harmonics that read as hiss. Makeup gain is off that lift. Harsh oscillators are low-passed at the source. Impact noise is brown, not white. Distant hits fall off, and a fight drops extra creep sounds before it drops abilities.",
              "Supplied-sheet heroes now stride the whole lower half, left leg against right, scaled by move speed and by the skin's own stride. Stephen Hocking and The Legend still roll the chair. Stopping eases back to a planted idle.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.08",
    date: "September 25th, 2026",
    headline: "Quieter fights. Legs keep up.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The fight bed was white noise under a hot compressor. It is now a low rumble, with a shelf cut on the hiss, a limiter so swings do not clip, and a cap on how many noise bursts can stack. Abilities duck the bed. Distant hits fall off. Voices and the anthem stay up.",
              "Walking kits step the feet on the live sheet rig. The stride follows move speed and eases into idle so the legs are not stuck mid-step. Stephen Hocking and The Legend roll the chair wheels instead of walking. Skins still scale their own stride.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.06",
    date: "September 25th, 2026",
    headline: "Living Battlefield. The match changes phase.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The match now moves Early, Mid, Late, and End. The top bar names the phase. A banner calls the change: the battlefield awakens, the shrines wake, the jungle grows stronger, then the Ancient wakes.",
              "Mid game wakes four shrines and puts the River Warden in the river pit. Late game adds Capitol Alpha and Bay Alpha and toughens the camps. End game turns the Warden into the Ancient. Taking one pays gold, experience, and a short damage boon. It does not end the match. A side that is down towers gets a larger bounty.",
              "A dead tower opens a cut: move speed near the ruin. Woods hide heroes from far vision once mid game starts. Ward Flare, Smoke Can, and Campus Lantern are on the mid shelf. Late and end shelves add Crown, Aegis, and Hourglass. The opening eight items stay on the shelf from the first minute.",
              "Levels 4, 7, 9, and 11 ask the player to pick a path. Bots pick for themselves. Standing on your ancient hill adds a little armor, and a little more if your side is down towers.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.05",
    date: "September 25th, 2026",
    headline: "The name is MAGA vs Antifa.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The game name is MAGA vs Antifa on the enter page, the browser tab, the install name, the patch notes, and the free host. The free URL is maga-vs-antifa.vercel.app.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.04",
    date: "September 25th, 2026",
    headline: "Paste waits for the clipboard.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The Paste button was giving up before the desk handed over the clipboard. It now keeps the click, tries the browser paste, then the system clipboard, then the copy you made in this tab. Ctrl+V and Cmd+V are no longer cancelled, so the field can take the browser paste on its own.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.03",
    date: "September 25th, 2026",
    headline: "Paste reaches the field again.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Ctrl+V and Cmd+V no longer throw away the browser paste when this tab already stored an older copy. The in-tab buffer is only the fallback if the field does not change. Paste on Account, handle, Facebook / Gmail, and Millix skips a hidden login or social box and writes into the field that is actually on screen.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.02",
    date: "September 25th, 2026",
    headline: "Every skin walks and swings as itself.",
    sections: [
      {
        id: "skins",
        heading: "Skins",
        blocks: [
          {
            lines: [
              "Equipped skins keep the live rig and the swing clock, and now carry their own idle weight, stride, lean, attack reach, and cast lift. A cape strides and flutters, a hammer winds up, a bolt sprints, a halo floats, gloves reach. Two walkouts that share a look on one hero (sambo wrap against Do Bronx, title belt against the armbar, style gloves against the kick) no longer share a cycle. Impact pixels take the skin tint. Open ?skin-reel=1 to page the shelf. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.01",
    date: "September 25th, 2026",
    headline: "Towers hold a target.",
    sections: [
      {
        id: "towers",
        heading: "Towers",
        blocks: [
          {
            lines: [
              "Towers and ancients shoot an enemy lane minion in range before they will shoot a hero. They keep that target until it dies, leaves range, or becomes invalid. A closer creep does not steal the shot. If an enemy hero damages an allied hero while both stand inside the tower's range, the tower locks that hero immediately, even over minions, and holds them until they die or leave. A second diver does not take the lock while the first is still valid.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "7.00",
    date: "September 25th, 2026",
    headline: "Fifteen doppelganger sheets. Journalist and Plant Power return.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Bernie Sandbags, Joe Biten, Barack O'Drama, Kamala Harass, The Young Turkeys, Vaxxie Scientist, Planet Defender, Progressive Journalist, The Icon, The Enigma, The Cartoons, The Reality Dynasty, The Entitlement, Plant Power, and The Tech now paint from the supplied C42 stills. Group kits (Young Turkeys, Reality Dynasty) sway as one unit so the lineup does not split. Everyone else strides, jabs, casts, and flops on the live rig. IDs, names, stats, and abilities stay. Progressive Journalist and Plant Power rejoin draft so those sheets can lock and play.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.99",
    date: "September 25th, 2026",
    headline: "C42 sheets now walk, jab, cast, and flop on the live rig.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Sheet heroes keep the supplied still as the master. The live C42 painter now derives an eight-phase walk (feet split on the empty column between the legs, torso counter-sway), a jab/recoil on attack, a lift-and-glow on cast and ultimate, a knock on hit, and a flop on death. Stephen Hocking's chair rolls the chassis. IDs, stats, and abilities stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.98",
    date: "September 25th, 2026",
    headline: "Eight C42 hero sheets. Charlie Quirk, Tommy Robinson, and George Bushed return to Liberty.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Stephen Hocking, Charlie Quirk, Tommy Robinson, Elon Muck, Boris Johnstone, Russell Branded, Kanye Vest, and George Bushed now paint from the supplied 96×128 C42 sheets — same nearest-neighbor blit, draft cards, HUD busts, and in-match poses as Grump. IDs, stats, abilities, DLC flags, and names stay. Charlie Quirk, Tommy Robinson, and George Bushed return to the Liberty draft so those sheets can lock and play. Kyle Rightenhouse stays remapped. Combat numbers and the map stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.97",
    date: "September 25th, 2026",
    headline: "C42 world art. Map, towers, and creeps match the hero sheet.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The playable map, river, jungle, city fringe, fountains, gift shops, towers, and lane creeps now paint in the same C42 pixel language as the Grump sheet — hard edges, ink outlines, left-top light, nearest-neighbor blit. Lane layout, collision, pathfinding, tower mechanics, creep stats, DLC, MILLIX, and Hooli access stay. Old gradient ground is no longer the live bake.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.96",
    date: "September 25th, 2026",
    headline: "Paste works in locker fields again.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Paste buttons keep the field focused, so Account, handle, Facebook / Gmail, and Millix receive insert into the box you were typing in. Ctrl+V and Cmd+V write from the event or the in-tab buffer when a preview desk empties the OS clipboard. Copy in this tab still fills that buffer. Clipboard reads time out instead of hanging the Paste button.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.95",
    date: "September 25th, 2026",
    headline: "The Legend and Joe Rogen join the C42 sheet.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "The Legend paints from the supplied wheelchair pixel sheet. Walk is a chair roll on the live rig. Joe Rogen paints from the supplied studio still, rebuilt standing — headphones, black sweater, jeans, sneakers, handheld mic — then walks and casts on the same 96×128 rate as Grump. Draft cards, HUD busts, and match sprites share those sheets. Map, towers, DLC prices, and combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.94",
    date: "September 25th, 2026",
    headline: "C42 pixel rate. Grump uses the supplied sheet.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Grump now paints from the supplied 96×128 pixel-art sheet. Idle, walk, attack, cast, ultimate, hit, and death pose that sheet on the live rig — walk splits the legs, attack keeps the raised finger, blink and hurt sit on the same pixels. Every other live kit, including MMA, Wildcards, and DEV/AI-only Hooli, snaps to the same 128-texel nearest-neighbor rate. Draft cards, HUD busts, ability icons, and match sprites share the sheet. Map, towers, DLC prices, and combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.93",
    date: "September 25th, 2026",
    headline: "C41 roster pass. Distinct faces, coats, props, and bolts.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Every live kit, including MMA, Wildcards, and DEV/AI-only Hooli, gets a C41 illustrated pass on the existing PIXEL_KITS painter. Faces, hair, collars, shoes, jewelry, and signature props are unique. Draft cards, HUD busts, ability icons, promo strips, attack bolts, impacts, and auras share the sheet. Animations keep the live pose clock. Hooli keeps pink mohawk, studded leather, white pumps, Punk Barrage, Sniper Shot, and DEV/AI-only access. Map, towers, DLC prices, and combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.92",
    date: "September 25th, 2026",
    headline: "C40 illustrated heroes. Every kit, portrait, and bolt.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Every live kit leaves the 64×64 C32 nearest-neighbor blit for C40: a 128×128 illustrated painter on the existing PIXEL_KITS, poses, and art pipeline. Faces, hair, coats, props, and gaits stay kit-specific. Draft cards, HUD busts, Skills thumbs, ability icons, promo strips, attack bolts, and impacts share that sheet. Hooli keeps pink mohawk, studded leather, white pumps, and DEV/AI-only access. Map, towers, DLC prices, and combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.91",
    date: "September 25th, 2026",
    headline: "Hooli is DEV/AI-only. Normal lockers cannot pick him.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Hooli stays on the live combat path — Punk Barrage, Sniper Shot, C32 painter — but he is no longer a public Liberty pick. Normal players cannot see him on draft, cannot roll him, cannot unlock or buy him, and cannot steer him. The existing pick validator rejects a Hooli request. AI seats may still lock him. Developers open the existing test tool ?hooli-test=1 (DEV MODE → HERO SELECT → HOOLI) or sit a campus developer locker. Combat numbers, DLC prices, and other kit IDs stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.90",
    date: "September 25th, 2026",
    headline: "Hooli joins Liberty. Punk Barrage and Sniper Shot.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Hooli is a free Liberty / Tradition ranged agility marksman. Pink mohawk, studded leather, white pumps on the existing C32 painter. Punk Barrage is one passive: basic shots splash nearby rivals and a fifth of them bash using the live stun and splash path. Q Stud Shot, W Stage Dive, E Encore, R Sniper Shot. Slightly faster and longer-ranged than the average marksman, thinner on the way in. Combat numbers for the rest of the roster stay. Open ?hooli-test=1 to lock him and start a match.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.89",
    date: "September 25th, 2026",
    headline: "Woods and trash past the map edge. Lane creeps restyled.",
    sections: [
      {
        id: "map",
        heading: "Map",
        blocks: [
          {
            lines: [
              "The black void past the Quad is gone. Camera overshoot now shows a wooded fringe with scattered trash heaps. Playable roads, fountains, towers, and walkability stay.",
            ],
          },
        ],
      },
      {
        id: "creeps",
        heading: "Creeps",
        blocks: [
          {
            lines: [
              "MAGA infantry and MAGA archers wear a redcap. Antifa infantry and Antifa archers are shaded black-bloc. Both teams' archers throw beer cans and bottles instead of arrows. Combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.88",
    date: "September 25th, 2026",
    headline: "Full C32 gameplay cycles on every playable kit.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Every live kit now plays an eight-phase walk, a hit-timed attack, ability and ultimate casts, a hit reaction, and a death flop on the existing C32 painter. Walk follows the live steer flag. Attack impact sits on the existing swing() damage clock. Ult is a stronger cast pose. Combat numbers, DLC prices, and the map stay. Open ?anim-test=1 to cycle the roster, or ?anim-match=1 for Watch AI.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.87",
    date: "September 25th, 2026",
    headline: "Match chat is a name-and-line feed. Assigned colours stay put.",
    sections: [
      {
        id: "systems",
        heading: "Systems",
        blocks: [
          {
            lines: [
              "Wait-room and in-match chat drop the troll-box chrome. Each line is a name, a colon, and the message. The name keeps one assigned colour for the whole match from a fixed accessible palette — not the team colour. A small [RED] / [BLUE] tag marks the side. Type, Talk, T / G mic, /kick, and /concede stay. Open ?chat-test=1 for a fake 10-player feed.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.86",
    date: "September 25th, 2026",
    headline: "Campus wheel sandbox for QA. Live locker stays put.",
    sections: [
      {
        id: "systems",
        heading: "Systems",
        blocks: [
          {
            lines: [
              "A hidden wheel sandbox opens only with ?wheel-test=1. It simulates daily three-hero groups plus bogus miss wedges on the production slice count, uses the live pickWheelIndex, and never writes the live locker or spends MILLIX. The public campus wheel, DLC prices, and hero roster stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.85",
    date: "September 25th, 2026",
    headline: "Lottery sandbox for QA. Live locker stays put.",
    sections: [
      {
        id: "systems",
        heading: "Systems",
        blocks: [
          {
            lines: [
              "A hidden lottery sandbox opens only with ?lotto-test=1. It spends sandbox MLX, runs the existing Quad Lotto and Millix Hourly draw functions, and never writes the live locker. Ticket price, prize table, MILLIX 40% DLC discount, combat, heroes, and the map stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.84",
    date: "September 25th, 2026",
    headline: "C32 256-bit pixel roster. Same kits. Same map.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Every playable kit is now a C32 256-bit pixel pass — 64×64 native art, not a 48×48 upscale. Faces, hair clusters, cloth folds, seams, metal, leather, and props are painted at the higher grid. Idle is ten frames. Walk is ten. Attack is eight. Cast is ten. Hurt, death, and victory pick up extra frames and stronger key poses. Equipped DLC skins sit on the same 64-space. Map, towers, jungle, river, lanes, and combat numbers stay.",
              "Draft cards are a 256px full-body idle of that sheet. HUD busts are the 128px portrait pose. Skills HUD, Skills page, and kit sheets show 64px pixel ability icons — passives included, ultimates framed gold. Bolts, rings, impacts, trails, and auras are denser and still tint per kit. Store and draft shelves carry promotional thumbnails: hero spotlight, ultimate, DLC, and Millix 40% off. Each live kit keeps its own swing, hit, cast, and ultimate voice on the existing mixer. Hover on a pick lifts the portrait and lights the gold rim.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.83",
    date: "September 25th, 2026",
    headline: "The Legend uses the wheelchair pixel template.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "The Legend (Ricky) is restamped from the supplied 128-bit pixel template: dark tuft, glasses, mustache, open mouth, white tee, grey trousers, and a black wheelchair. Idle sits. Walk rolls the wheel. Attack leans and jabs. Cast lifts the hands. KO slumps in the chair. Kit numbers, the rest of the roster, and the map stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.82",
    date: "September 25th, 2026",
    headline: "Grump uses the navy-suit pixel template.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Grump is restamped from the supplied 128-bit pixel template: blond puff, orange skin, navy suit, white collar, red tie, flag pin, black shoes, and the pointing stride. Idle and cast raise the finger. Walk keeps the swagger. Attack jabs. The other twenty-nine kits, the map, and combat numbers stay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.81",
    date: "September 25th, 2026",
    headline: "C28 128-bit pixel roster. Same kits. Same map.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Every playable kit is now a C28 128-bit pixel pass — 48×48 native art, not a 32×32 upscale. Faces, hair, cloth folds, metallic trim, rim light, and props are painted at the higher grid. Idle is eight frames. Walk is eight. Attack is six. Cast is eight. Hurt, death, and victory pick up extra frames. Equipped DLC skins sit on the same 48-space. Map, towers, jungle, river, lanes, and combat numbers stay.",
              "Draft cards are a 192px full-body idle of that sheet. HUD busts are the portrait pose. Skills HUD, Skills page, and kit sheets show pixel ability icons — passives included, ultimates framed gold. Bolts, rings, impacts, trails, and auras are denser and still tint per kit. Store and draft shelves carry promotional thumbnails: hero spotlight, ultimate, DLC, and Millix 40% off. Hover on a pick lifts the portrait and lights the gold rim.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.80",
    date: "September 25th, 2026",
    headline: "Find Game starts the mixer. The match is audible.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Enter with sound, Find Game, Practice, Custom Game, and Lock in all resume the existing Web Audio mixer — they no longer wait on a silent catalog. The Star-Spangled Banner loops on the music bus when Music is On. Combat, desk, and music faders on the sound card hit those buses immediately. HUD Mute still only cuts the anthem. Play every sound is the catalog. Combat stays royalty-free synth in this tab.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.79",
    date: "September 25th, 2026",
    headline: "C24 from the selection card to the skin.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "Every hero surface now uses the C24 32-bit pixel sheet. Draft cards are a 128px full-body idle of the same 32×32 sprite. Skills kit cards match. The HUD bust is the portrait pose. Equipped DLC skins paint on that grid — cape, visor, crown, walkout tape, public-domain hats — on the card, the store shelf, the portrait, and the in-match sprite. Map, towers, and kits stay the same.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.78",
    date: "September 24th, 2026",
    headline: "C24 32-bit pixel heroes. Map and towers stay.",
    sections: [
      {
        id: "heroes",
        heading: "Heroes",
        blocks: [
          {
            lines: [
              "The live thirty-kit roster is a C24 32-bit pixel pass on the existing painters — not a new combat system and not a new map. Each playable hero has its own silhouette, face, outfit, gait, and prop. Idle is six frames. Walk is six. Attack is five. Cast is six. Hurt, death, and victory pick up extra frames. Portraits are a matching bust of the same sprite.",
              "Recognition is in the art: Grump’s orange sweep and long red tie, Elon Muck’s rocket, Joe Rogen’s cans and mic, Alex Groans’ megaphone, Boris’s haystack, Russell Branded’s locks, Kanye Vest’s cream drape and chain, JP Steers’ glasses and gold book, Joe Biten’s silver hair and aviators, Bernie Sandbags’ mittens, Barack O’Drama’s hope ring, Kamala Harass’ bob and pearls, Stephen Hocking’s chair, the Young Turkeys’ two heads, Vaxxie’s flask, Planet Defender’s globe, The Icon’s hood and chain, The Enigma’s mask and file, The Cartoons’ hazard duo, The Reality Dynasty’s glam and flash, The Legend’s bandana and gold, The Entitlement’s bob and shades, The Tech’s visor, Cézanne’s beret, and the six MMA walkouts with their own gloves, sash, belt, staff, and tape.",
              "Basic attacks, bolts, impacts, and ultimates tint and shape to the kit. Towers, lanes, jungle, river, plazas, and the Gift Shop stay environment art.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.77",
    date: "September 24th, 2026",
    headline: "Paste works in locker fields.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Ctrl+V and Cmd+V no longer hit game binds. Copy in this tab is stored here, so Paste still works when the OS clipboard is empty — common on a preview desk. Account, handle, Facebook / Gmail, and the Millix receive field have a Paste button. Copy node writes the same in-tab buffer.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.76",
    date: "September 24th, 2026",
    headline: "Tangled social login is out.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The enter page no longer has Sign up on Tangled, Log in with Tangled, or Tangled’s Sign up with Google. Account is Facebook, Gmail, or sign up with email. MAGA seat 1 takes that locker handle. Tangled browser still pays extra gold in a match. Stats stays a campus W-L board. Millix · DAG still links tangled.com as a Millix wallet browser, not a campus login.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.75",
    date: "September 24th, 2026",
    headline: "Log in with Facebook, Gmail, or sign up with email.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The enter page has an Account locker above Tangled. Log in with Facebook, Log in with Gmail, or Sign up with email. Facebook and Gmail ask for the email on that account — this tab does not open those sites and does not take those passwords. Email signup needs an address and an 8-character password, then Log in with email comes back. MAGA seat 1 takes a handle from the name or the email. The locker stays in this browser.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.74",
    date: "September 24th, 2026",
    headline: "The match is 5v5.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "Five seats a side. Ten on the field. MAGA Washington DC vs Antifa Seattle still seats @blake and @lilhooligan on campus. The wait room, draft, Watch AI, and the enter-page fight all spawn five kits a team — mid, top, bot, then a second top and bot. Party count is 2/10 when campus sits. The ring desk calls ten on the field.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.73",
    date: "September 24th, 2026",
    headline: "The enter page runs the AI match again.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The landing page shows a live 6v6 again — MAGA Washington DC vs Antifa Seattle, hero fight on mid, camera on @blake or @lilhooligan. Click the match or Watch AI for the full screen. The roster-work pause is off.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.72",
    date: "September 24th, 2026",
    headline: "The tab is MAGA vs Antifa.",
    sections: [
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            lines: [
              "The game name on the enter page, the browser tab, the install name, and the ring desk is MAGA vs Antifa. Same 12-player browser match. MAGA still holds Washington DC. Antifa still holds Seattle.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.71",
    date: "September 24th, 2026",
    headline: "Fountain, base, and Gift Shop — four more paint passes.",
    sections: [
      {
        id: "map",
        heading: "Map Update",
        blocks: [
          {
            lines: [
              "Quad Engine ground cache rev 24 is four more environment passes on the pools, the towns, and the Gift Shop. Pass one restamps the plazas after the campus wash so the water stays bright: bigger stone disk, town curtain with merlons, a gate toward mid. Pass two is materials — diamond flagstone, four stone rims, foam lip, deeper well, a taller DC obelisk and a Seattle jet bowl. Pass three dresses the towns: Gift pavilion with a hanging sign, six stalls, planter ring, National Mall wing toward the Capitol, Elliott Bay wing toward the Needle. Pass four is live spray, shop-window glow, and a wood-and-brass Gift Shop shelf with brass corners and larger painted icons.",
              "Same fountain positions. Same buy radius. Same four bag slots. Towers stay environment art. Heroes stay pixel art.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.70",
    date: "September 24th, 2026",
    headline: "Fountain, base, and Gift Shop — four more paint passes.",
    sections: [
      {
        id: "map",
        heading: "Map Update",
        blocks: [
          {
            lines: [
              "Quad Engine ground cache rev 23 is four environment passes on the pools, the towns, and the Gift Shop. Pass one grows the fountain silhouette: bigger water, stepped stone rims, a town curtain with a gate toward mid. Pass two pushes materials — marble checkers, gold or teal inlay, deeper water, a DC obelisk and a Seattle jet. Pass three adds a readable Gift pavilion on each plaza, a longer reflecting pool on the Mall, and a larger harbor basin on Elliott Bay. Pass four is live spray, shop glow, and a wood-and-brass Gift Shop shelf with bigger painted icons.",
              "Same fountain positions. Same buy radius. Same four bag slots. Towers stay environment art. Heroes stay pixel art.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.69",
    date: "September 24th, 2026",
    headline: "Mid towers pull in. Pools, bases, and the Gift Shop get a paint pass.",
    sections: [
      {
        id: "map",
        heading: "Map Update",
        blocks: [
          {
            lines: [
              "Mid-lane keeps move closer to the river. Inner, middle, and outer mid towers sit further toward the center so the mid fight reads as a street, not a hike. Top and bot towers stay put. Same health, range, targeting, and take-order.",
              "Quad Engine ground cache rev 22 paints a deeper fountain pool on both sides — stone rings, gold or teal rims, a Gift kiosk on the plaza, and more jet spray. Washington DC’s reflecting pool and mall colonnade pick up water sheen and steps. Seattle gets a harbor pool on Elliott Bay. The in-match Gift Shop panel and item icons get a gold frame and larger shelf cards. Towers stay environment art.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.68",
    date: "September 24th, 2026",
    headline: "C23 pixel roster. Heroes only. Map stays map.",
    sections: [
      {
        id: "graphics",
        heading: "Graphics Update",
        blocks: [
          {
            lines: [
              "Quad Engine C23 is a four-pass polish of the live 32×32 roster — silhouettes, faces, hair, coats, props, and parody reads — then a cohesion pass so every kit shares one pixel density, 1px ink, and top-left light. Idle is four frames. Walk stride is bigger. Attack is windup, hit, recover. Cast and hurt poses fire from the existing swing/cast/damage clock. Ability rings, bolts, impacts, shields, and trails stay pixel clusters tinted per kit. Portraits are a dedicated head-and-shoulders stamp of the same sprite, used on draft, HUD, store, and DLC. Not a filter. Not a new combat system.",
              "Towers, ancients, jungle, lanes, river, terrain, and map props stay environment art. They are not converted to hero-style pixel sprites. Liberty 8, Progress 8, MMA DLC 6, and Wildcard DLC 8 keep the same IDs and locks. Same thirty kits.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.67",
    date: "September 24th, 2026",
    headline: "C22 pixel roster. Same density. Stronger parody.",
    sections: [
      {
        id: "graphics",
        heading: "Graphics Update",
        blocks: [
          {
            lines: [
              "Quad Engine C22 keeps every live kit on the same 32×32 grid, 1px ink outline, and top-left light. Faces, hair, coats, and props get three-tone clusters instead of flat blocks. Idle breath, four-step walk, attack hit pixels, and cast sparks stay on the existing swing/walk/dead clock. Portraits, HUD, store, and DLC still stamp the same sprite. Not a filter. Not a new combat system.",
              "Parody silhouettes read at gameplay camera: Grump sweep and tie, Muck rocket, Rogentor headset, Groans megaphone, Boris mess, Branded locks, Vest drip, Steers glasses, Biten navy, Sandbags mittens, O'Drama halo, Harass gown, Hocking chair, Young Turkeys dual heads, Vaxxie flask, Planet Defender globe. MMA gloves and walkout shorts stay DLC. Wildcard hood, mask, mascot, glam, beard, pearls, visor, and beret stay DLC. Same thirty IDs.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.66",
    date: "September 24th, 2026",
    headline: "Jungle roads. Primary routes you can read from the fountain.",
    sections: [
      {
        id: "map",
        heading: "Map Update",
        blocks: [
          {
            lines: [
              "Quad Engine ground cache rev 21 paints a jungle road on the existing back tracks. DC’s Grove Walk and Seattle’s Thicket Walk are the primary routes: worn packed earth, rock borders, footprints, and a light wash. Behind Top / Behind Bot stay quieter gank cuts. North Back and East Back stay faint flank tracks. Same walk grid. Same camps. Same AI.",
              "Each camp gets a landmark you can read at gameplay camera — split oak at Mall Oaks, marble basin at Reflecting Grove, fir stone at Rainier Stand, crate stack at Elliott Thicket. Stone gateposts mark base cuts, lane cuts, and river mouths (BASE CUT, TOP CUT, BOT CUT, MID MOUTH on DC; BASE CUT, BAY TOP, RAINIER BOT, RIVER MOUTH on Seattle). The atlas and minimap thicken the jungle road and keep camps as gold or teal pits. Not a neon line. Not a new maze.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.65",
    date: "September 24th, 2026",
    headline: "Quad Engine C21. The whole roster is pixel art.",
    sections: [
      {
        id: "graphics",
        heading: "Graphics Update",
        blocks: [
          {
            lines: [
              "Quad Engine C21 converts every live kit to a native 32×32 pixel sprite. Hard edges, limited palettes, one-pixel ink outlines, nearest-neighbor blit. Idle, walk, attack, hurt, death, and victory stay on the existing swing/walk/dead clock — no new combat system. Ability rings, bolts, impacts, shields, stuns, slows, and dash trails paint as pixel clusters tinted per kit. Not a filter over the old ellipses.",
              "Each of the thirty kits keeps its ID, stats, abilities, draft lock, DLC gate, and voice. Liberty kits read gold trim and parody props: Grump sweep and tie, Elon Muck rocket, Rogentor mic, Groans megaphone, Boris mess, Branded locks, Vest drip, Steers book. Progress kits read teal trim: Biten navy, Sandbags parka, O'Drama halo, Harass gown, Hocking chair, Young Turkeys desk, Vaxxie flask, Planet Defender globe. MMA DLC stays shorts, gloves, sashes, and belts. Wildcard DLC keeps hood, mask, mascot, glam, beard, pearls, visor, and beret. Portraits on draft, HUD, store, and DLC match the in-match sprite.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.64",
    date: "September 24th, 2026",
    headline: "Quad Engine v20. The campus, the keeps, and every kit get a paint pass.",
    sections: [
      {
        id: "graphics",
        heading: "Graphics Update",
        blocks: [
          {
            lines: [
              "Quad Engine v20 rebakes the campus on ground cache rev 20. Territory wash, woods occlusion, lane dashes, river specular, fountain rings, jungle-camp pads, tree contact shadows, and a distant haze sit on top of the v17–v19 bake. Live pass adds river sparkle and fountain motes. Lanes stay cream, jungle stays dark, river stays blue, DC stays gold, Seattle stays teal. Same walkable streets. Same tower spots.",
              "Keeps are a second, third, and fourth art pass on the same collision. Taller sandstone vs steel silhouettes, merlons, brick, a crystal core, a swinging barrel, and team flags. Health drives damage: chips at 75%, missing merlons and holes at 50%, smoke and sparks at 25%, rubble and a cracked gem when the keep falls. Capitol and Needle pick up the same foundation and glow. Bolts and ability rings read at gameplay camera distance.",
              "Every playable kit gets a C20 identity pass — exaggerated parody silhouettes, not photographs. Grump sweep and tie, Elon Muck rocket visor, Rogen and Groans headsets, Boris hair, Branded locks, Vest letters, Steers book, Biten tie, Sandbags mittens, O'Drama aura, Harass hair, Hocking chair and halo, Young Turkeys dual heads, Vaxxie flask, Planet Defender orbit. MMA gloves and walkout stance. Wildcard props stay weirder than the standard roster. Idle breath, status auras, and cast rings sit on the existing combat system. Still canvas. Not Unreal.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.63",
    date: "September 24th, 2026",
    headline: "MMA Fighters DLC. Six parody fighters leave the free roster.",
    sections: [
      {
        id: "mma-dlc",
        heading: "DLC Store Updates",
        blocks: [
          {
            lines: [
              "The six MMA kits — Conor Macgregor, Khabib Nurmagoat, Jon Jonesy, Israel Adesanya-ish, Dustin Poirier-ish, Nate Diaz-ish — move out of free-to-play and into the MMA DLC pack. Same abilities, art, voices, and combat identity. No stat bump. DLC unlocks the roster; it does not pay-to-win.",
              "Draft bands are FREE TO PLAY (16), MMA DLC (6), and WILDCARDS (8). Unowned MMA cards stay locked. Click one and the unlock panel reads UNLOCK THE MMA ROSTER, shows the standard pack price, the Millix price at 60% of that sticker, and 40% OFF WITH MILLIX. BUY WITH MILLIX needs a loaded MLX balance — INSUFFICIENT MILLIX disables the button and cannot go negative. BUY STANDARD uses the existing card rail. OWNED unlocks all six for pick, random, lock-in, and deep links. Bots still fill from the free sixteen. Wildcard DLC stays its own shelf.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.62",
    date: "September 24th, 2026",
    headline: "Thirty kits. Campus generics leave. MMA is a free fight card.",
    sections: [
      {
        id: "roster",
        heading: "Gameplay Update",
        blocks: [
          {
            lines: [
              "The playable pool is thirty. Standard free-to-play is eight Liberty / Tradition and eight Progress / Equality. Kyle Rightenhouse, Charlie Quirk, Tommy Robinson, George Bushed, and Progressive Journalist leave draft, random, bots, and tutorials. The thirty-six campus kits (Riot Cap through Ethics Board) leave the playable pool. IDs stay loadable for art and old saves; they remap onto a live kit.",
              "MMA is a free fight card, not DLC: Conor Macgregor, Khabib Nurmagoat, Jon Jonesy, Israel Adesanya-ish, Dustin Poirier-ish, Nate Diaz-ish. Walkout looks still sell in the store. DLC wildcards shrink to eight: The Icon, The Enigma, The Cartoons, The Reality Dynasty, The Legend, The Entitlement, The Tech, Cézanne. Bots fill from the free twenty-two. Default lock is Grump.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.61",
    date: "September 24th, 2026",
    headline: "Two kit passes. Every hero got a job, then a second look.",
    sections: [
      {
        id: "kits",
        heading: "Gameplay Update",
        blocks: [
          {
            lines: [
              "Pass 1 gave every playable kit a role band, difficulty, short bio, personality, five-plus voice lines, a real passive, and synergy blurbs on Q W E R. Draft cards now show name, title, role, difficulty, the short read, passive, the three basics, and the ultimate. Lock-in still uses the same draft. Random kit sits next to Lock in.",
              "Passives now run on the existing combat loop. Heat kits stack a named resource and spend it on R. Mark kits cash a stamp on the next bolt. Link heals grow with allies in range. Guard pulses a shield under a third health. Rage swings faster when leaking. Haste and ambush kits keep a dash window — woods help the first hit, and a hero kill refunds part of Q and W. Zone kits leave a short slow on rain and ultimates. Taunt-wall kits soak after a taunt. Vamp pays a sliver on hero hits. HP and mana regen, attack period, and magic resist sit on each kit. Ultimates shake the camera and shout a line.",
              "Pass 2 did not just raise numbers. Grump swapped Rally onto W and Executive Order onto E so Controversy builds, then TOTAL DOMINATION spends it. Vaxxie's ultimate is Nationwide Protocol, a stacked heal, not another rain. DLC artillery lost a little ultimate uptime — The Icon and Octo wait longer on the nova, Reality Dynasty's Viral Moment is less frequent — so wildcards stay off the pay-to-win shelf. Campus 36, Liberty 12, Progress 9, and DLC 16 all kept their IDs and CastFx.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.60",
    date: "September 24th, 2026",
    headline: "DLC wildcards remapped. Original kits on familiar combat jobs.",
    sections: [
      {
        id: "dlc",
        heading: "DLC Store Updates",
        blocks: [
          {
            lines: [
              "The sixteen bottom-bar wildcards keep the same IDs. Old display names leave the playable pool: George Floptor, Epsteen, Ricky Berwick, Karen, Vegan Booty, and Butterfield. Draft now shows The Icon, The Enigma, The Cartoons, The Reality Dynasty, The Legend, The Entitlement, Plant Power, The Tech, Bruella, Danny, Price, Cézanne, MetalPak, HattyHats, Octo, and Airosoul.",
              "Each kit uses the existing CastFx on a new job. The Icon is a durable initiator. The Enigma vanishes and debuffs. The Cartoons rain hazards. The Reality Dynasty dashes and bursts. The Legend hooks and rolls. The Entitlement taunts. Plant Power roots and hops. The Tech rains gadgets. Bruella bursts. Danny ambushes. Price steps time. Cézanne paints. MetalPak rockets. HattyHats walks the rail. Octo grabs. Airosoul floats. Same engine. No Dota names, numbers, or art. Campus 36 stay. Bots still fill from campus.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.59",
    date: "September 24th, 2026",
    headline: "Find Game on the enter page. Rage Quit in the match.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The enter page leads with FIND GAME — one click into the existing wait room. Searching for match, party count, and Cancel Search sit on that screen. Practice / Training fills bots and opens draft. Custom Game is Watch AI. Collection and Profile sit under smaller headings. The long campus essay is behind How this campus works.",
              "A red RAGE QUIT button sits on the match top bar and on Pause. One click only opens the confirm: Stay in match or Rage Quit. Confirm uses the same leave path as Leave campus — bag salvage, Book stakes back, halt, enter page. No new penalty. Kyle Rightenhouse spelling. Bernie Sandbags kit names: People Power, Universal Rally, Class Warfare, Revolution, Feel the Bern. Parody names stay uppercase on Liberty, Progress, and DLC cards.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.58",
    date: "September 24th, 2026",
    headline: "Hero roster opens clean. Icon guards. Enigma vanishes.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Hero roster and #draft hide the enter-with-sound gate so the Liberty / Tradition, Progress / Equality, and DLC — Unclassified / Wildcards rows stay readable. The AI demo stays halted. #kit=id starts a local test match on an existing kit, then #draft stops it.",
              "George Floptor (The Icon) is a guardian kit: Timeline stun, Repost shield, Ratio taunt, Main Character nova. Epsteen (The Enigma) Disappear is a dash. Price Fine Print is a dash on a tank. Extra parody marks on Karen, Price, Danny, Cézanne, Butterfield, and Bruella. Same CastFx. No new payment rail.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.57",
    date: "September 24th, 2026",
    headline: "Poster kits get parody faces. Demo match paused for roster work.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The enter-page AI demo and any live Watch AI match halt on load. Click Watch AI when you want a fight again. Draft still has Liberty / Tradition (12), Progress / Equality (9), and DLC — Unclassified / Wildcards (16) on the existing hero system.",
              "Poster and DLC portraits now use kit face overrides, faction frames, hoods, berets, and extra silhouettes — The Icon in streetwear, The Enigma in shades, The Cartoons as a duo, Octo with tentacles, HattyHats stacked, Airosoul with a ring. In-match sprites pick up the same marks. DLC stays a bottom-bar category with a badge. No new payment rail. Hover a card for the Q W E R tip.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.56",
    date: "September 24th, 2026",
    headline: "Wildcard heroes on the DLC shelf. Millix still knocks 40% off.",
    sections: [
      {
        id: "dlc",
        heading: "DLC Store Updates",
        blocks: [
          {
            lines: [
              "The sixteen unclassified wildcard heroes sit on the DLC / Wildcards store tab as playable kits: George Floptor, Epsteen, The Cartoons, The Reality Dynasty, Ricky Berwick, Karen, Vegan Booty, Butterfield, Bruella, Danny, Price, Cézanne, MetalPak, HattyHats, Octo, and Airosoul. Each kit is £1.99 on PayPal or card. Millix knocks 40% off. Draft locks them until the payment clears.",
              "A Wildcard Pack unlocks all sixteen at half the £1.99 shelf, then Millix still knocks 40% off. Kit Bundle still includes these wildcards. Campus 36 and the Liberty / Progress poster rows stay free. Bots still fill from campus.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.55",
    date: "September 24th, 2026",
    headline: "Poster roster aligned. Liberty, Progress, and DLC wildcards.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Draft labels the poster row Liberty / Tradition (12) and Progress / Equality (9). Grump, Kyle Righteoushouse, Alex Groans, Joe Rogen, Charlie Quirk, Tommy Robinson, Elon Muck, Boris Johnstone, Russell Branded, Kanye Vest, JP Steers, and George Bushed sit Liberty. Kamala Harass, Bernie Sandbags, Joe Biten, Barack O'Drama, The Young Turkeys, Stephen Hocking, Vaxxie Scientist, Climate Scientist, and Progressive Journalist sit Progress. Fairer Tomorrow, Love-Not-Hate, and Climate Action Now leave the left-wing row.",
              "Sixteen unclassified wildcards sit in their own bottom-bar category — DLC — Unclassified / Wildcards — with a DLC badge. George Floptor, Epsteen, The Cartoons, The Reality Dynasty, Ricky Berwick, Karen, Vegan Booty, Butterfield, Bruella, Danny, Price, Cézanne, MetalPak, HattyHats, Octo, and Airosoul. Selectable in draft. Not mixed into either main faction. Campus 36 stay free. Bots still fill from campus so Watch AI does not need DLC. Parody. Not affiliated with the people, studios, or parties on the poster.",
            ],
          },
        ],
      },
      {
        id: "dlc",
        heading: "DLC Store Updates",
        blocks: [
          {
            lines: [
              "Store tab DLC / Wildcards lists the sixteen bottom-bar heroes as a playable category, not a new paywall. Kit Bundle still unlocks extra skins and these wildcards. No new payment rail.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.54",
    date: "September 24th, 2026",
    headline: "C18 playable kits. Faces, hair, and kit hats in a match.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Every playable kit is on C18. Skin tone and hair come from the kit, not one peach head. Nose, brow, iris, and a mouth sit on the face. Coats pick up cloth grain, a gold rim, and a second specular. MAGA kits wear a gold sash. Antifa kits wear a teal sash. Wildcards wear a muted sash.",
              "In a match the kit hat, badge, and held item paint on the sprite — visor, headphones, goggles, newsboy, mascot head — so Grumptor, Joe Rogentor, and Cart-Park do not share one red cap. Draft and store portraits use the same painter. Quad Engine v17 campus bake stays. Still canvas. Not Unreal.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.53",
    date: "September 24th, 2026",
    headline: "MAGA and Antifa poster kits. Unclassified wildcards are DLC.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Draft adds the MAGA vs Antifa poster roster. Twelve right-wing kits sit MAGA: Grumptor, Kyleyle Rightenhouse, Alexgroans, Joe Rogentor, Charlie Quirk, Tommy Robinsonson, Elonmolk, Borisjohnstone, Russell Brander, Kenyefe Vestyt, JP Steers, Georgebushed. Twelve left-wing kits sit Antifa: Kamala Harass, Bernie Sandbags, Joe Bitenten, Barack O'Dramma, The Youngturkey, Stephenhocking, Vakxie Scientist, Climate Scientist, Progressive Journalist, Fairer Tomorrow, Love-Not-Hate, Climate Action Now. Campus 36 stay free. Bots still fill from campus so Watch AI does not need DLC.",
              "The bottom-bar unclassified wildcards are playable DLC heroes — Cart-Park, Ken-me, Kim Kardashmoney, Kaiser Sosa, Andrew Tater, Mr Feast, Pew-die, Joe Exotic, George Floptor, Greta Sternberg, The Imposter, Octo-Pus. Locked in draft until the store payment clears. Parody. Not affiliated with the people, studios, or parties on the poster.",
            ],
          },
        ],
      },
      {
        id: "dlc",
        heading: "DLC Store Updates",
        blocks: [
          {
            lines: [
              "Store tab Wildcards sells the twelve bottom-bar heroes as playable kits, not skins painted on Riot Cap. Kit Bundle still unlocks every extra skin and these wildcards. Millix still knocks 40% off.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.52",
    date: "August 28th, 2026",
    headline: "Smoother fight. Same Quad Engine v17, less hitch.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The match holds 60 more often. Bots plan a path a few times a second instead of every frame. The camera follows with a frame-rate-independent lerp. The ground blit clips to what you see. Lamp posts bake into the cache; only nearby glows tick live. One wet-lane shine instead of four. Filmic grain and chromatic are lighter. The enter-page atlas no longer redraws every frame, and the hanging flag no longer reallocates its canvas every tick.",
              "Quad Engine v17 looks the same in a fight. Watch AI and the enter 6v6 run a lighter pass so the rest of the page stays snappy. Still canvas. Not Unreal.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.51",
    date: "August 28th, 2026",
    headline: "Quad Engine v17. The whole campus paints harder.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Quad Engine v17 rebakes the campus: clover and extra grass, woods leaf litter, tree dapple, crosswalks at the fountains, storm drains and curb stones on the streets, a mid compass, Mall pavers, Seattle crates and rope, river foam, hall vents and flags, a bike rack at the gym. Ground cache rev 17.",
              "The live pass adds birds over mid, dock steam on Seattle, paper scraps on DC, and extra fountain sparkle. Keeps pick up a roof ridge. Creeps get visor glass. Bolts leave a longer spark trail. The enter-page map densifies woods and fountain rings. C17 kits stay on this pass. Still canvas. Not Unreal.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.50",
    date: "August 28th, 2026",
    headline: "C17 kits. Playable sprites and DLC skins on Quad Engine v17.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Every playable kit and every extra skin is on C17. In a match the figure reads as a person: neck, ears, iris, brow, hands, belt buckle, cloth grain. Draft and store portraits use the same face and coat. Equipped DLC (capes, visors, public-domain looks, MMA and comics parodies) pick up a denser weave, contact shadow, gold rim, and a second specular so the costume sits on the kit.",
              "Quad Engine v17 is this character pass. The campus bake stays rev 16. Still canvas. Not Unreal.",
            ],
          },
        ],
      },
      {
        id: "dlc",
        heading: "DLC Store Updates",
        blocks: [
          {
            lines: [
              "Every extra skin on the shelf paints on C17. Cloth grain, contact shadow, gold rim, and a second specular. The portrait in the store is the look you wear in a match.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.49",
    date: "August 28th, 2026",
    headline: "Playback test of every sound. Mixer also feeds an HTML audio element.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Enter with sound now plays a labeled catalog of every clip in this tab: proof beep, bell, gong, anthem, coins, minion voices, crit/bash/splash, then each of the 36 kits (swing, hit, skill). A native audio player sits on that overlay so you can see and hear the same mix. Play every sound on the enter page or Sound card runs it again. Stop test closes it.",
              "The mixer also pipes into a hidden HTML audio element. Some browsers never send Web Audio to the speakers, but they will play that element. Unmute this tab if the OS muted it. HUD Mute still only cuts the anthem.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.48",
    date: "August 28th, 2026",
    headline: "Louder mixer. Each kit has its own original battle voice.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Combat and the anthem were too quiet. This tab now uses one audio context, a compressor, and a hotter mix so The Star-Spangled Banner, last-hit coins, and fights actually come through after Enter with sound. Nothing to download.",
              "Each of the 36 kits has its own original swing, hit, and skill sting — Riot Cap steel, Dean's Gavel wood, Lab Burner glass, Yearbook Shot shutter, Bell Tower bronze, Drumline Snare crack, and the rest of the roster. Minions keep infantry ticks, archer tings, and jungle hog. Still royalty-free synth in this tab. Sound card Test combat plays a few of those voices. HUD Mute still only cuts the anthem.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.47",
    date: "August 28th, 2026",
    headline: "Anthem in this tab. Royalty-free battle hits and a coin on every kill.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "In-game music no longer waits on Spotify. Click Enter with sound and The Star-Spangled Banner plays in this tab — public domain, no file to download. Music On / Off, Volume, and HUD Mute still control it. Next restarts the anthem. Combat is louder: hero clinks, minion tings, and a coin drop on every last-hit and every hero kill. All of that is royalty-free synth. Link Spotify still pays the one-time +1,000 gold if you want the locker bonus.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.46",
    date: "August 28th, 2026",
    headline: "Full computer-browser page. Preview no longer looks like a phone.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The desk is a full computer-browser page: title and Play on the left, campus map and live 6v6 on the right, keybinds, music bar, bag. A skinny preview pane still shows that desk, scaled to fit — it does not switch to Stop / Snap / Lock. Only a phone browser (iPhone / Android phone) gets the compact touch HUD. Click Play or Watch AI and the match is still full-page in this tab.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.45",
    date: "August 28th, 2026",
    headline: "Computer browser is the desk. Phone still plays.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "This is a computer-browser game first. Keyboard, mouse, keybinds, the music bar, bag, and live chat stay on a desk window — even if that window is narrow. A phone browser still works: tap to walk, drag to pan, Stop / Snap / Lock on the bar, compact HUD, music and Support tucked so the map fits. iPad-size landscape keeps the desk. This is not a native app.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.44",
    date: "August 27th, 2026",
    headline: "Royalty-free fight bed. Crit, bash, and splash have their own stings.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Combat is still synthesized in this tab — oscillators and noise, no sample pack, no extra license. Fights now sit on a looping bed that swells when kits clash on camera. Distant pings fill the gaps between swings. Red Pen crits, Bike U-Lock bashes, and Cafeteria Tray splashes each have their own sting. Skills and tower falls hit heavier. Sound card Test combat plays the whole sting. The radio is still Lil Hooligan. Campus holds that catalog. HUD Mute still only cuts the music.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.43",
    date: "August 27th, 2026",
    headline: "Phone browser. Tap to walk, drag to pan, skills on the bar.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "A phone browser can play a match. Tap ground to walk. Tap a creep or hero to lock. Drag to pan. Stop, Snap, and Lock sit on the HUD next to Shop. Skill buttons are the Q W E R. The enter page hides the long blurb so Play and Watch AI fit. Music, Support, and Sound card hide during a match — Mute stays on the top bar.",
              "A keyboard and mouse is still the better desk. Hold T and G for the mic. This is not a native app.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.42",
    date: "August 27th, 2026",
    headline: "Top and bot outers sit on the map corners.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Top and bot still have three towers a street. Inner stands just in front of town. Middle sits midway up the lane. The first tower — outer — sits near the map corner: top-left on top, bottom-right on bot. MAGA and Seattle outers keep enough space that they cannot shoot each other around the corner. Mid is unchanged: outer still toward the river.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.41",
    date: "August 27th, 2026",
    headline: "Gift Shop builds. Splash, crit, and bash sit on the fountain shelf.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The fountain Gift Shop still holds four bag slots. Plates stay: Track Cleats, Annotated Text, Meal Plan, Lab Coat, Dean's List. Three new build items sit next to them. Skills still does not proc these — auto-attacks do.",
            ],
          },
        ],
      },
      {
        id: "items",
        heading: "Item Updates",
        blocks: [
          {
            name: "Cafeteria Tray",
            lines: [
              "860 gold. +12 damage. Auto-attacks splash 50% of the hit onto nearby rivals in a short radius. Does not splash towers or the town.",
            ],
          },
          {
            name: "Red Pen",
            lines: ["940 gold. +16 damage. 22% chance to crit for 185% damage. CRIT floats in orange."],
          },
          {
            name: "Bike U-Lock",
            lines: [
              "900 gold. +14 damage. 18% chance to bash and stun for 1.1 seconds. A 2.3-second cooldown keeps it from locking a kit forever.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.40",
    date: "August 27th, 2026",
    headline: "How to play. A first-match walkthrough on the enter page.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "How to play sits next to Skills and FAQ. Nine steps from Enter with sound through wait room, draft, streets, last-hits, Gift Shop, HUD, razing Seattle, and Watch AI. A campus sketch shows MAGA bottom-left and Seattle top-right. Play in browser, Watch AI, Skills, and FAQ jump from the bottom of that page.",
              "Skills stays the bind list and every kit’s Q W E R. FAQ and Campus Desk point here. The enter-page keys line names the walkthrough.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.39",
    date: "August 27th, 2026",
    headline: "Enter with sound. The tab was silent until a click.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Browsers keep this tab silent until a click. Click Enter with sound on the way in. That press plays a ring-desk sting — bell, fanfare, gong — and starts combat on the live 6v6. Play in browser still opens the match with the ring announcer.",
              "A suspended mixer used to swallow the first clink. Combat now plays as soon as the context wakes. Sound card faders stay on this locker. HUD Mute still only cuts Lil Hooligan.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.38",
    date: "August 27th, 2026",
    headline: "Concede vote. MAGA can GG if they are losing.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "If MAGA is losing after 1:30, Concede sits on the HUD. Type /concede in the match chat. Every player on MAGA must vote yes — bots do not vote. Campus seats on that side auto-yes. One no or a 22-second timeout kills it, then a 40-second wait.",
              "Losing means fewer towers, less gold, a weaker town, or a kill deficit. Spectators, Watch AI, and the enter-page demo cannot call it. A passed vote is a MAGA loss. Seattle holds. Show-up coins still pay.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.37",
    date: "August 27th, 2026",
    headline: "Skins. Volume, weave, and a harder rim.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Every extra skin paints with volume now: radial cloth, a drop under each piece, fabric weave on coats and capes, and a gold rim finish so the look sits on the kit like Quad Engine paint, not a sticker.",
              "Hats take a brim shadow and a side button. Goggles take temples, a bridge, and glass shine. Capes fold with a clasp. Crowns pick up jewels. Hide grows fur. Mikey and Minnie get inner ears, buttons, and a tail.",
            ],
          },
        ],
      },
      {
        id: "dlc",
        heading: "DLC Store Updates",
        blocks: [
          {
            lines: [
              "Store portraits use the same costume plate and painter as the sprite in a match. What you buy is what you wear.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.36",
    date: "August 27th, 2026",
    headline: "Playable skins. Same paint as the kits.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "An extra skin on the field is a Quad Engine costume now, not a sticker. Equipped looks pick up kit-weight outlines, a tinted cloth coat, stitch, and rim gleam so a cape or visor sits on the sprite the same way the kits sit on the map.",
              "Store portraits stay on that painter. Full-body looks (Mikey, Pooh, hide, parade cape, and the rest of that shelf) scale up to cover the kit instead of floating as a thin overlay.",
            ],
          },
        ],
      },
      {
        id: "dlc",
        heading: "DLC Store Updates",
        blocks: [
          {
            lines: [
              "Every extra skin on the shelf paints with the same cloth and gleam as Quad Engine v16. The portrait in the store is the look you wear in a match.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.35",
    date: "August 27th, 2026",
    headline: "Sound card. Combat, desk, and music on their own faders.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Open Sound card from the enter page or the Sound button bottom-left. Click Start audio so this tab can play — browsers keep the mixer dead until a click.",
              "Combat, the ring desk, and Lil Hooligan each have a fader and a meter. Test combat and Test desk prove the buses. HUD Mute still only cuts the music. Faders stay on this locker.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.34",
    date: "August 27th, 2026",
    headline: "Three towers a street.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Top, mid, and bot each have three towers now: outer toward the river, middle, then inner by the town. Eighteen keeps on the map. Inner is bigger and hits harder.",
              "Take them in order on that street. A middle or inner keep ignores hits until the one in front of it is down. The town stays closed until an inner tower falls. The desk calls which keep dropped.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.33",
    date: "August 27th, 2026",
    headline: "@blake sits campus again. He plays when he wants.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The wait room auto-seats @blake opposite @lilhooligan again. They swap MAGA and Antifa after each real match or Watch AI. Gallery watches do not flip them. Neither campus seat can be kicked.",
              "@blake keeps the keyboard when he logs in. Expert AI stays off until he taps P. @lilhooligan still starts on expert autoplay. Tangled login for @blake stays open — @lilhooligan still cannot be claimed.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.32",
    date: "August 27th, 2026",
    headline: "Free host. Site name is MAGA vs Antifa.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "MAGA vs Antifa is set up for a free server: Vercel Hobby. Click Publish in this chat to put the tab live. Matches stay free.",
              "The site name, tab title, and install name are MAGA vs Antifa. The free URL is maga-vs-antifa.vercel.app — Vercel cannot put a space in a host, so the hyphen is the domain form of the name. A custom .com is optional later in Vercel if you buy it.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.31",
    date: "August 27th, 2026",
    headline: "Hero fight. Watch AI hunts kits, not just creeps.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Watch AI and the enter-page 6v6 put both mid pairs on the river so you see kits fighting kits from the first seconds. Expert AI hunts an enemy hero in range instead of hiding behind last-hits. The camera stays on the clash. Space still snaps back.",
              "Bots in a real match use the same brain: they take the fight when a rival is in range, and only last-hit if the creep is about to die and the rival is still far. They still will not dive a keep without a wave.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.30",
    date: "August 27th, 2026",
    headline: "Quad Engine v16. The whole campus paints harder.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Quad Engine v16 rebakes the campus: extra grass and wildflowers, tar seams and manholes on the streets, fountain rings, moss on rocks, Mall steps, and Seattle dock pilings. Ground cache rev 16.",
              "The live pass adds wet-lane shine, more Seattle rain, cherry petals on DC, maple leaves at mid, extra woods fireflies, and a glow under every keep. Kits pick up vest stitch, hat gleam, and outlined kit marks. Creeps get visor glass and boot shine. Keeps get brick grout, window frames, and ivy. Bolts leave a longer spark trail. Draft portraits outline the body. The enter-page map densifies woods and fountain rings. Still canvas. Not Unreal.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.29",
    date: "August 27th, 2026",
    headline: "DLC skins. Cloth, rims, gleam.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Extra skins pick up the same paint as Quad Engine kits: dark outlines, cloth gradients, rim gleam, and a tinted chest wash so a cape or visor reads as a costume, not a sticker. Capes fold and flutter. Goggles and masks take lens shine. Sashes, hoods, belts, and public-domain looks (pie-eye mouse, Hatter card, and the rest of the shelf) match the portrait in the store and the sprite in a match.",
              "Draft portraits and locker art use the same painter. Still canvas. Not Unreal.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.28",
    date: "August 27th, 2026",
    headline: "Heat. Last-hits pop. Wins pay. Queue again.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Last-hits now pop gold on the creep. Five, ten, twenty, thirty last-hits pay a bonus. Hero kills stack a streak the desk calls: two for two, hat trick, on fire, campus godlike. Breaking a three-kill streak pays a shutdown bounty. First blood and the first tower share gold with the team.",
              "A heat bar under the clock shows last-hits, XP to the next level, and the next Gift Shop buy. Creeps are worth a little more. Waves come a little faster.",
              "A real match pays locker coins: 48 on a win, 16 if you show up and lose. First win of the day pays +32. A win streak stacks +12 a game, cap five. Three daily quests sit on the enter page and reset at midnight — last-hits, kills, a tower, a win, or two matches. Finish all three for a sweep bonus. Watch AI and the gallery do not take locker coins.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.27",
    date: "August 27th, 2026",
    headline: "Skills & Controls. Every kit, every bind.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Skills sits on the enter page. It lists every control this tab actually uses — walk, target, Q W E R, shop, pause, mic — then all 36 kits with mana, cooldown, range, and how each skill aims.",
              "Search a kit name or a move. Strength, Agility, and Intelligence filter the list. R unlocks at level 6. X casts Q, C casts E, F casts R. Fountain Gift Shop items sit at the bottom. FAQ points here.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.26",
    date: "August 27th, 2026",
    headline: "Quad Engine v15. Denser campus. Clearer fight.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Quad Engine v15 rebakes the campus: extra grass, fountain paver grout, tar cracks on the streets, dorms and halls off DC and Seattle, more flowers and street arrows. Ground cache rev 15.",
              "The live pass adds Seattle rain, DC dust, more fireflies, wet lane shine, and pulsing keep windows. Kits pick up collars, chest stripes, and boot shine. Creeps get visor glint. Keeps get doors and battlement caps. Bolts leave a longer trail. The enter-page map labels the same streets with denser woods and fountain rings. Not Unreal.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.25",
    date: "August 27th, 2026",
    headline: "Link Spotify. +1,000 gold once.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Link Spotify sits on the Lil Hooligan bar. It opens Spotify. Come back to this tab and the locker pays +1,000 gold once.",
              "If you are in a real match, that gold also hits your kit. Watch AI, the gallery, and the enter demo do not take the match gold. Linking again does not pay again. This tab does not take a Spotify password.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.24",
    date: "August 27th, 2026",
    headline: "Gallery watches. Pause sits on top. Q is a skill, not aim.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Sitting in the gallery no longer hands you MAGA seat 1. Watch this match is type-only: no keyboard, no Gift Shop, no Expert AI. The camera stays on the fight.",
              "Watch AI clicks no longer yank MAGA’s first kit while the camera follows @blake or @lilhooligan. P still takes the keyboard and snaps onto your hero.",
              "@lilhooligan still swaps MAGA/Antifa after a real match or Watch AI. A gallery watch does not flip campus.",
              "Pause, victory, and defeat sit over the map so Resume and Queue again are on screen. Control copy matches the binds: A chooses a target, Q W E R are skills.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.23",
    date: "August 27th, 2026",
    headline: "Every extra skin is £1.99, or 40% off with Millix.",
    sections: [
      {
        id: "store",
        heading: "DLC Store Updates",
        blocks: [
          {
            lines: [
              "PayPal and card are £1.99 a skin. Millix knocks 40% off that sticker on the fiatleak peg (1,000,000 MLX = $0.18). Send to the campus node from this locker or from your Millix wallet.",
              "Kit Bundle is half the £1.99 shelf, then Millix still knocks 40% off. Spectator seats stay 100,000 MLX, Millix only. 1% of every payment still goes to Daniel Alan Cornish and Blake Fitzgerald.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.22",
    date: "August 27th, 2026",
    headline: "Millix · DAG page. What Millix is, and how the graph works.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Millix · DAG is its own page from the enter page. Millix is not a blockchain and not an ERC-20. It is a directed acyclic graph. A live sketch shows a transaction hop from sender to proxy to peers to rest. Arrows only go forward.",
              "The page covers genesis (20 January 2020), equal nodes, random proxy fees, sharding, hibernation, the campus escrow node, 40% off DLC, and links to millix.org, millix.com, fiatleak.com, and tangled.com. This game is not millix.org.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.21",
    date: "August 27th, 2026",
    headline: "Campus Desk. Support chat in the corner.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Support opens Campus Desk — a chat in the corner on every page, including a match. It answers from the FAQ in this tab: play, Millix, DLC, Tangled, seats, music. Tap a topic or type. Desk is typing shows while it looks up the answer.",
              "Email this thread opens mail to thedannymacdope@gmail.com for Daniel Alan Cornish and Blake Fitzgerald. The thread stays in this locker. Escape closes the desk. It is not wait-room Talk and not the match mic.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.20",
    date: "August 27th, 2026",
    headline: "Watch AI and the demo follow @blake or @lilhooligan.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The enter-page 6v6 and Watch AI now seat both @blake and @lilhooligan on opposite sides. The camera follows one of them. If they go down, it swaps to the other. Space snaps back onto that star. A gold ring marks who you are following.",
              "This is AI and demo only. The wait room still does not clock @blake in — he logs in with his own user when he plays a real match. Gallery Watch this match still follows the fight cluster.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.19",
    date: "August 27th, 2026",
    headline: "More UFC parodies. Bonesaw, Perera, Mash-vidal, and friends.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Twelve more MMA parody looks join Cokehead McGregor and Ronda Lousy. Jon Bonesaw, Alex Perera, Jorge Mash-vidal, Max Holler-way, Valentina Shev-check, Justin Gate-jee, Dustin Poor-ier, Charles Olive-her, Islam Make-chev, Tony Fergus-off, Daniel Core-me, Sean Strict-land.",
              "The DLC Store adds an MMA tab. Kit Bundle and the campus wheel include all of them. Parody names only. Not affiliated with UFC or any fighter.",
            ],
          },
        ],
      },
      {
        id: "store",
        heading: "DLC Store Updates",
        blocks: [
          {
            name: "MMA parodies",
            lines: [
              "Jon Bonesaw on Quad Mason. Alex Perera on Dining Hall. Jorge Mash-vidal on Quad Skate. Max Holler-way on Yearbook Shot.",
              "Valentina Shev-check on Flyer. Justin Gate-jee on Bike Courier. Dustin Poor-ier on Bell Tower. Charles Olive-her on Hacky Sack.",
              "Islam Make-chev on Drumline Snare. Tony Fergus-off on Campus Radio. Daniel Core-me on Student Paper. Sean Strict-land on Lecture Hall.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.18",
    date: "August 27th, 2026",
    headline: "@blake joins on his own. @lilhooligan still sits campus.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The wait room no longer clocks @blake in with @lilhooligan. @lilhooligan still sits campus every match and swaps MAGA/Antifa after a real game or Watch AI. @blake adds his own user when he plays — Tangled login is open for that name.",
              "@lilhooligan still cannot be kicked or claimed as a campus handle. @blake is a player seat: idle kick works, Tangled League records his games, and expert autoplay is there once he has joined.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.17",
    date: "August 27th, 2026",
    headline: "Song names scroll across the music bar.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The Lil Hooligan bar crawls the track name, album, and artist instead of clipping the title. Music On keeps the ticker looping. Music Off and catalog-done stay still. Mute and volume 0 still name the song.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.16",
    date: "August 27th, 2026",
    headline: "Quad Engine v13, then v14. Two graphics passes.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Quad Engine v13 rebakes the campus: extra trees, lane hedges, Seattle maples, planters and kiosks, denser grass and cliff moss, river reeds and lily pads, oil on the streets, more of the National Mall and Elliott Bay. Ground cache rev 14.",
              "Quad Engine v14 is the live pass on top of that bake. Thicker kit silhouettes, eye shine, belt buckle, weapon gleam. Creep visors and boot plates. Keep brick and window glow. More god rays off DC, thicker Seattle mist, extra fountain spray and fireflies, heavier film grain and bloom. Not Unreal.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.15",
    date: "August 27th, 2026",
    headline: "Public-domain DLC: Pooh, Alice, Holmes, and more.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The DLC Store adds a Public domain tab. Twelve literary and Steamboat-era looks join Mikey Mouse: Minnie Mouse, Winnie-the-Pooh, Tigger, Alice, Mad Hatter, Cheshire Cat, Sherlock Holmes, Count Dracula, Frankenstein, Felix the Cat, Dorothy Gale, Robin Hood.",
              "These are public-domain characters — 1928 mouse, 1926 Pooh, Wonderland, Doyle, Stoker, Shelley, Oz, Felix 1919 — not later studio designs. Dorothy wears silver shoes. Kit Bundle and the campus wheel include all of them.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14z",
    date: "August 27th, 2026",
    headline: "Quad Lotto tickets are 100,000 Millix.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "A Quad Lotto ticket is 100,000 MLX. Millix only — no coins, no PayPal, no card. Load Millix in the store if the locker is short. 1% (1,000 MLX) of every ticket still goes to Daniel Alan Cornish and Blake Fitzgerald.",
              "Payouts are Millix too, same ratios as the old coin table: two hits 40,000 MLX, three 160,000, four 500,000, five 1,800,000, six is the 8,000,000 jackpot. 1% of every payout to the developers.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14y",
    date: "August 27th, 2026",
    headline: "Mikey Mouse. Public domain Steamboat-era skin.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Mascot gets Mikey Mouse in the DLC Store. Steamboat-era look: round black ears, pie-cut eyes, two-button shorts, big shoes. The 1928 mouse is public domain. Not a later Disney design.",
              "Kit Bundle still unlocks every extra skin, including Mikey. The campus wheel can land him. 720 coins, or 40% off with Millix.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14x",
    date: "August 27th, 2026",
    headline: "Arrow pan, skip clock, and leftover wheel spins.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Arrow keys pan the camera. They were on the enter page and in the FAQ but the view stayed locked on your kit. Pan drops follow. Space snaps back onto your hero — C still casts E, it does not recenter.",
              "Next was unlocking in the first seconds of a Lil Hooligan track when Spotify reported milliseconds, then locking again. The skip clock now reads that timestamp as playback time. Short tracks still play out.",
              "A leftover campus-wheel index from before Miss wedges could award the first skin or land off the wheel. Stale pending spins pick a real slice. Sit MAGA no longer dumps you out of the gallery when MAGA is already full. Skill keys typed in the wait room no longer fire on lock-in.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14w",
    date: "August 27th, 2026",
    headline: "Developers take 1% of every escrow transaction.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Daniel Alan Cornish and Blake Fitzgerald take 1% of every escrow in and every escrow out. Millix Hourly: your stake into the campus node, the other twenty-one Millix stakes, and every prize the node pays — not only yours.",
              "Quad Market listings sit in escrow until they sell. 1% of that sale still goes to the developers. Millix that rolls over to the next hour stays in escrow and is not cut again until it pays out.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14v",
    date: "August 27th, 2026",
    headline: "Campus wheel. Not every spin is a winner.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The campus wheel still stamps one free spin a day. Miss wedges now sit on the wheel. Land Miss and you get nothing — no skin, no coins.",
              "About one spin in three misses. A skin you do not own still drops in the locker. A skin you already own still pays 80 coins.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14u",
    date: "August 27th, 2026",
    headline: "Next stays locked until a song has played 35 seconds.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Lil Hooligan tracks play at least 35 seconds before Next unlocks. The button counts down. Shorter songs play out.",
              "Mute, Music Off, and volume at zero freeze that clock. The song has to actually play.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14t",
    date: "August 27th, 2026",
    headline: "@blake and @lilhooligan swap MAGA and Antifa each game.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "@blake and @lilhooligan still sit every match, one per side. After a real match or Watch AI, they swap. If @blake was MAGA this game, @lilhooligan is MAGA next. Opening the wait room without playing does not flip them.",
              "MAGA still holds Washington DC. Antifa still holds Seattle. The enter-page demo follows whoever sits those fountains this game.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14s",
    date: "August 27th, 2026",
    headline: "Campus wheel. One spin a day. Stamped when you hit Spin.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The campus wheel is one free spin a day. The locker stamps it the moment you hit Spin, so a refresh does not buy a second spin.",
              "After you spin, the button counts down to local midnight. That is when the next free spin unlocks.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14r",
    date: "August 27th, 2026",
    headline: "Marvel and DC parody skins on the DLC shelf.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Twenty-four parody looks land in the DLC Store: twelve Marvel, twelve DC. Shields, webs, cowls, lassos, bolts, hammers, claws, lanterns, and gauntlets paint on the field.",
              "Parody names only. Not affiliated with Marvel, DC, Disney, or Warner. Kit Bundle is 5,000 coins and still unlocks every extra skin.",
            ],
          },
        ],
      },
      {
        id: "store",
        heading: "DLC Store Updates",
        blocks: [
          {
            name: "Marvel parodies",
            lines: [
              "Captain Amerigo, Quad-Crawler, Irony Man, Incredible Sulk, Floor, Wolver-dine.",
              "Dead Fool, Doctor Strange Hours, Black Window, Low-key, They-nos, Hawk-eye.",
            ],
          },
          {
            name: "DC parodies",
            lines: [
              "Brat-Man, Man of Steal, Wonder Hours, The Flush, Aqua-janitor, Quad Joker.",
              "Harley Twin, Cat-stacks, Dean Luthor, Shazam-class, Cy-board, Green Lamp.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14q",
    date: "August 27th, 2026",
    headline: "MMA parody skins on the DLC shelf.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Twelve MMA parody looks land in the DLC Store. Gloves, belts, cauliflower ear, fight shorts, and tape paint on the field and in portraits.",
              "Kit Bundle is 3,600 coins and still unlocks every extra skin, including the new parodies. Strength Coach, House Pledge, and Club Foil join the shelf.",
            ],
          },
        ],
      },
      {
        id: "store",
        heading: "DLC Store Updates",
        blocks: [
          {
            name: "MMA parodies",
            lines: [
              "Cokehead McGregor on Riot Cap. Ronda Lousy on Dean's Gavel. Brock Lesnear on Mascot. Chuck Lidless on Strength Coach.",
              "Khabib Nurma-go-bed on Night Desk. Holly Holm-run on Track Spike. Nate Diazn't on House Pledge. Israel A-this-anya on Cadet Captain.",
              "Sean O'Mally on Campaign Intern. Francis No-canoe on Boiler Tech. Amanda Noons on Resident Advisor. Zhang Way-lee on Club Foil.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14p",
    date: "August 27th, 2026",
    headline: "Millix Hourly rolls over when a place has no winner.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Millix Hourly no longer always pays three people. A place can come up empty. That share stays in escrow and rolls into the next hour’s pot.",
              "If nobody hits, the whole pot rolls over. 1st still takes 50%, 2nd 30%, 3rd 20% of the pot that hour — stakes plus rolled-over Millix.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14o",
    date: "August 27th, 2026",
    headline: "More DLC. Nine kits on the shelf.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The DLC Store adds eighteen extra skins. Riot Cap, Night Desk, and Mascot each get two more looks. Dean's Gavel, Boiler Tech, Cadet Captain, Track Spike, Campaign Intern, and Resident Advisor join the shelf.",
              "Store tabs are All, Strength, Agility, Intelligence, Gallery, and Bundle. The campus wheel spins the whole catalog. Kit Bundle is 2,800 coins and still unlocks every extra skin.",
            ],
          },
        ],
      },
      {
        id: "store",
        heading: "DLC Store Updates",
        blocks: [
          {
            name: "Riot Cap",
            lines: ["Stars Sash and Capitol Plume sit next to Eagle Hat, Parade Cape, and Night Captain."],
          },
          {
            name: "Night Desk",
            lines: ["Stack Hood and Overdue Halo sit next to Stack Mask, Midnight Spine, and Overdue Red."],
          },
          {
            name: "Mascot",
            lines: ["Letterman Sash and Spirit Goggles sit next to Foam Crown, Spirit Cape, and Rally Hide."],
          },
          {
            name: "New kits",
            lines: [
              "Dean's Gavel: Bench Sash, Expulsion Badge.",
              "Boiler Tech: Steam Goggles, Pressure Hide.",
              "Cadet Captain: Dress Plume, Drill Sash.",
              "Track Spike: Lane Wrap, Gold Spikes.",
              "Campaign Intern: Field Band, Yard Sign Cape.",
              "Resident Advisor: Duty Badge, Quiet Hours Hood.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14n",
    date: "August 27th, 2026",
    headline: "Mute cuts Lil Hooligan. Combat keeps playing.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Mute on the match HUD now silences the soundtrack. Unmute brings Lil Hooligan back if Music is On.",
              "Melee clinks, arrow tings, barks, and the ring announcer keep playing while the music is muted.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14m",
    date: "August 27th, 2026",
    headline: "Lil Hooligan sits on a bar across the top, with the track name.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Spotify controls moved to a bar across the top of the screen: Music On / Off, Next, Volume, and the track name.",
              "Tracks still opens the catalog and the Spotify embed. Mute on the HUD still only cuts combat.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14l",
    date: "August 27th, 2026",
    headline: "Campus wheel. One free DLC skin a day.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The DLC Store has a campus wheel. One free spin a day. Land an extra skin for Riot Cap, Night Desk, or Mascot and it drops in the locker with no payment.",
              "If that skin is already yours, the locker pays 80 coins instead. Come back tomorrow for another spin.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14k",
    date: "August 27th, 2026",
    headline: "Lil Hooligan has a Volume slider on screen.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The soundtrack dock now has a Volume slider. Drag it to set Lil Hooligan’s level. Zero mutes the music. The setting stays on this locker.",
              "Mute on the HUD still only cuts melee clinks, tings, barks, and the ring announcer. Music On / Off is unchanged.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14j",
    date: "August 27th, 2026",
    headline: "Millix Hourly pays 1st, 2nd, and 3rd from escrow.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Save a personal Millix receive address on Lotto. Hourly stakes sit in escrow on the campus node until the hour settles.",
              "When there is a winner, the node pays three places automatically — 1st 50%, 2nd 30%, 3rd 20%. If you have no wallet saved, the prize stays in escrow until you save one, then it sends.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14i",
    date: "August 27th, 2026",
    headline: "Quad Engine paints more of the campus and the kits.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The map bake is denser: lawn tufts, cherry trees on the Mall, hydrants and cans on the curb, sidewalk pavers, storm drains, cliff moss, river ripples and lily pads, extra Seattle towers and a crane, toadstools in the woods.",
              "Kits, creeps, and towers pick up more silhouette — belts, boots, brick, visor shine, hog tusks, bolt sparks, fountain spray, and fireflies under the canopy. Quad Engine v12.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14h",
    date: "August 27th, 2026",
    headline: "Only Lil Hooligan plays. Campus holds the rights.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The soundtrack is Lil Hooligan only. Campus holds the rights to this music. The dock loads his tracks one at a time — Spotify related artists do not follow.",
              "Music On / Off still does not touch Mute. His catalog plays in order, once a day, then the next track. Next skips to the next Lil Hooligan song.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14g",
    date: "August 27th, 2026",
    headline: "Woods and back tracks cut behind the streets.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Six named woods sit between the lanes: Mall Oaks Woods, Reflecting Grove Woods, and Capitol Copse on the MAGA DC side; Rainier Woods, Elliott Woods, and Bay Copse on the Antifa Seattle side. Dense trees, a dark floor, and a canopy over the dirt.",
              "Back tracks are walkable packed dirt behind the streets — Behind Top, North Back, Behind Bot, East Back, Grove Walk, Thicket Walk. They connect the groves for ganks. Quad Engine v11. The atlas and minimap label both.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14f",
    date: "August 27th, 2026",
    headline: "The campus map is painted denser.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Streets now show sidewalks, gold lane arrows, manholes, cracks, and benches. The river has reeds, pylons, and a railed stone bridge. Fountain plazas sit on cobbles inside a hedge ring.",
              "Washington DC gained more of the Mall — a second museum block, hedges, benches, and another monument shaft. Seattle gained a ferry on Elliott Bay, a second pier, Pike Place awnings, and streetcar rails. Jungle camps have stumps and toadstools. Quad Engine v10.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14e",
    date: "August 27th, 2026",
    headline: "Every kit and fountain item has a portrait.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Draft, HUD, shop, bag, Quad Market, and the DLC store show a portrait for each of the 36 kits and an icon for each fountain item — Track Cleats, Annotated Text, Meal Plan, Lab Coat, Dean's List.",
              "On the field each kit wears its own mark: visor, mascot head, gavel, hardhat, foil mask, camera, flask, headphones, and the rest. You can tell Riot Cap from Night Desk from Mascot at a glance.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14d",
    date: "August 27th, 2026",
    headline: "Lil Hooligan on Spotify. Music On or Off. Once a day.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Lil Hooligan plays from Spotify in the corner. Music On / Off is its own switch — Mute still only cuts melee clinks, tings, barks, and the ring announcer.",
              "The known catalog plays in order, then the next track. One pass a day. After the last song it stops until tomorrow, or until you hit Music On again. Next skips. Click once so the browser lets Spotify play.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14c",
    date: "August 27th, 2026",
    headline: "Tangled League: a ladder for verified @usernames.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Open Tangled League from the enter page. Log in with a live Tangled username, then win a match. Each claimed @name keeps its own W-L, points, K/D/A, and K.D.R. Three points a win.",
              "Campus circuit names sit the board. @blake and @lilhooligan already sit. Spectators and Watch AI do not count. Kirk Cup now tracks MAGA vs Antifa on this locker too.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14b",
    date: "August 27th, 2026",
    headline: "Each Tangled user claims once. Saved @usernames stay for next login.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Log in with a live Tangled username and that @name is claimed on this locker — +250 coins, one time. Log in again as the same user and the claim does not fire.",
              "Every verified @username stays on the enter page. Log out, come back, tap the saved name. @blake and @lilhooligan already sit campus and cannot be claimed.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14a",
    date: "August 27th, 2026",
    headline: "Spectators cannot Talk on the mic.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Gallery seats type only. T and G do not open team mic or all mic from the stands. Sitting spec hangs up the microphone if it was live.",
              "Players still hold T for MAGA and G for everyone.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.14",
    date: "August 27th, 2026",
    headline: "Hold T to talk with your team on the mic. Hold G to talk to everyone.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Hold T for team mic. MAGA hears you. Hold G for all mic — both towns hear you. Allow the microphone the first time. Words land in chat when this browser can transcribe them. Wait-room buttons Hold T and Hold G do the same thing.",
              "Spectators type. They cannot Talk on the mic.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13z",
    date: "August 27th, 2026",
    headline: "Click once for sound. The enter-page demo plays after that.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Browsers keep the audio context suspended until a click or a key. The first gesture now resumes it, and the enter-page 6v6 clinks and tings after that click. A steel hit confirms the desk is live.",
              "Mute / Unmute on the HUD. The old Sound on label was the mute switch — that is gone.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13y",
    date: "August 27th, 2026",
    headline: "A chooses the creep or hero you want to hit.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Hover a creep or a hero and tap A to lock that target. If nothing is under the cursor, A waits — click the unit, or click ground to attack-move. Tap A again to cancel.",
              "Auto-attack still fills in when you have no lock. Clicking a unit still works. Z is attack-move. S stops.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13x",
    date: "August 27th, 2026",
    headline: "Click a creep or a hero to choose that target.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Auto-attack still swings at whoever is in range. Click a creep or a hero to lock that one — gold brackets sit on them, and the HUD reads Target · that name. Your kit chases the lock until it dies or you pick someone else.",
              "Hover shows dashed brackets on the unit under the cursor. S or a click on the ground drops the lock and auto-attack takes over again.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13w",
    date: "August 27th, 2026",
    headline: "Your kit auto-attacks enemy creeps and heroes in range.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Stand next to a creep wave or an enemy hero and your kit swings on its own. Heroes in range come first, then the weakest creep. It will not auto-hit towers or chase a target you did not click.",
              "Right-click ground to walk — the swing pauses until you arrive. S stops. Z (or A) is attack-move: walk that way and hit creeps and heroes along the path. Click a unit to lock that target.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13v",
    date: "August 27th, 2026",
    headline: "Lane steel: clinks and tings on minions and heroes, plus a louder ring desk.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Melee hits clink. Arrows and spells ting. Heroes hit heavier steel; the minion line ticks faster. Nearby fights are louder.",
              "Every match still opens with the ring announcer — bell, spoken desk, then a gong on FIGHT. First blood, towers, and the winner hit the desk too. Sound on the HUD mutes it. The enter-page demo stays quiet.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13u",
    date: "August 27th, 2026",
    headline: "Sign up with Google on the enter page. That path stays at 192 gold/min.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The enter page has Sign up with Google. It opens Tangled's Google continue. After you pick a username there, come back and Log in with Tangled.",
              "Google signup does not raise gold. Extra gold is Tangled browser only (384 vs 192). A Tangled.com referrer no longer counts as Tangled browser.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13t",
    date: "August 27th, 2026",
    headline: "Log in with Tangled checks username.tangled.com before MAGA seat 1 takes the name.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The enter page now verifies a Tangled username against that live profile. No profile at username.tangled.com, no login. A typed @tangleduser does not get in unless that page is a real profile.",
              "@blake and @lilhooligan still pass as campus. This tab never takes a Tangled password. Logging in still does not raise gold — that stays Tangled browser only.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13s",
    date: "August 27th, 2026",
    headline: "Enter-page demo is a full 6v6 that follows @blake or @lilhooligan.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The entrance screen runs a full MAGA vs Antifa match: @blake, @lilhooligan, and ten extra AI. The camera follows one of those two. If they go down, it swaps to the other.",
              "Click the live strip to watch it full screen.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13r",
    date: "August 27th, 2026",
    headline: "Gameplay details sit on the right of the enter page, under the hanging flag.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The enter page right rail sits under the hanging flag: how you win, last-hits, streets, jungle, a labeled campus map, then the live 12-AI match. The flag drapes the top-right instead of covering the map.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13q",
    date: "August 27th, 2026",
    headline: "Campus map on the enter page fills the right side.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The labeled campus map stretches across the right rail under the flag. Streets, fountains, and camps read larger. The live AI strip stays under it.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13p",
    date: "August 27th, 2026",
    headline: "Labeled campus map on the enter page, under the hanging flag.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The enter page now shows a labeled campus map on the right, under the burning flag: MAGA Washington DC, Antifa Seattle, top/mid/bot streets, jungle camps, and both fountains.",
              "The live 12-AI match sits under that map. Click the match to watch it full screen.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13o",
    date: "August 27th, 2026",
    headline: "Every match opens with a ring announcer.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Each game gets a ring-desk intro: MAGA Washington DC and Blake Fitzgerald versus Antifa Seattle and Lil Hooligan, then FIGHT. The desk also calls first blood, towers, and the winner.",
              "Sound on the HUD mutes the announcer with everything else. The enter-page demo stays quiet.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13n",
    date: "August 27th, 2026",
    headline: "@blake sits MAGA and @lilhooligan sits Antifa every match — five player seats a side.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "@blake is MAGA every game. @lilhooligan is Antifa every game. They sit when the wait room opens. They cannot be kicked.",
              "You need five player seats a team. Twelve still take the field. Fill remaining with bots still pads the open seats around them.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13m",
    date: "August 27th, 2026",
    headline: "Quad Engine v9: god rays, silhouettes, and a heavier filmic grade.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Quad Engine v9: volumetric shafts off the DC fountain, thicker Seattle mist, extra river caustics, kit silhouettes and shoulder pads, facing flip on the body (nameplates stay upright), additive hit sparks, dirt-corner filmic. Not Unreal.",
              "Ground bake rev 9 adds cliff contact shadow. Kits read larger. The rest of the fight is the same.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13l",
    date: "August 27th, 2026",
    headline: "Quad Engine v8: additive bloom, kit rims, grain, and a heavier filmic grade.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Quad Engine v8: lamp bloom, cape and rim light on kits, tick-marked HP bars, glowing bolts, pulsing walk marker, film grain and chromatic grade. Not Unreal.",
              "Ground still caches the campus. This pass is the live lighting and post on top of that bake.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13k",
    date: "August 27th, 2026",
    headline: "Developers take 1% of every bet — Book, Hourly, and Lotto.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Daniel Alan Cornish and Blake Fitzgerald take 1% of every Campus Book stake and every Book payout. Lost slips still leave the 1% stake cut with the developers.",
              "Millix Hourly: 1% of your 50 MLX, 1% of the other twenty-one Millix stakes that hour, and 1% of every payout. Quad Lotto tickets and prizes still cut 1%.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13j",
    date: "August 27th, 2026",
    headline: "Hero deaths say Ahhh Fake news or You fucking nazi — and you can read it.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Kill a MAGA hero and the bark is Ahhh Fake news. Kill an Antifa hero and the bark is You fucking nazi.",
              "The line sits over the body and in the kill feed. Speech still takes the mic. Mute still cancels it.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13i",
    date: "August 27th, 2026",
    headline: "Millix receive node moved to the new campus wallet.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Send Millix to 1GsrgWH7ncasNDP1UVirAvSAY5tLWP3yyN0a015WcdWwYqGyRGdp3BmWc7rEyADG1h8UQot. DLC, gallery seats, packs, lotto, and Hourly still unlock when that node clears.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13h",
    date: "August 27th, 2026",
    headline: "Campus map: cliffed jungle, river bridge, fountain roads, and town districts.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Jungle sits on cliffed high ground. Streets cut through. A stone bridge carries mid over the river. Fountain plazas connect to every lane.",
              "Washington DC now has a reflecting pool and mall colonnade. Seattle has Elliott Bay, Pike Place, and a denser skyline. Tower pads and campfires mark the holds.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13g",
    date: "August 27th, 2026",
    headline: "Quad Engine v7: denser sprites, kit bodies, keeps, and a heavier filmic grade.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Quad Engine v7: gold selection rings, legs and kit hats, mana bars, isometric keeps, lamp wash, filmic grade. Not Unreal.",
              "Heroes lean into the walk. Strength kits carry an axe, Agility a bow, Intelligence a staff. Creeps keep shields and visors.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13f",
    date: "August 27th, 2026",
    headline: "Outer lanes run to the corners. Top left, bot right.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Top street now hugs the top-left corner. Bot street hugs the bottom-right corner. Mid stays the diagonal between Washington DC and Seattle.",
              "The river crosses mid the other way, through the jungle. Jungle camps sit in the pockets between the lanes.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13e",
    date: "August 27th, 2026",
    headline: "Live 12-AI match on the enter page. Expert brains on every bot.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The enter page runs a live MAGA vs Antifa match with expert AI on all twelve kits. Click it, or Watch AI, to take it full screen.",
              "Bots in a real match now use the same expert brain: last-hits, fights, and shops. You still take the keyboard on MAGA seat 1.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13d",
    date: "August 27th, 2026",
    headline: "Campus Book: three markets, 100 gold a slip, one bet per hour.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Campus Book still has three markets: which town holds, under/over 8:00, and who takes the first tower.",
              "A slip is 100 gold. One bet per hour. Replace that pick until the match starts.",
              "No 50 or 250 stakes. Gold only — not MLX. 1% of stakes and payouts still goes to Daniel Alan Cornish and Blake Fitzgerald.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13c",
    date: "August 27th, 2026",
    headline: "Spectator gallery holds five seats.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The wait-room gallery is five seats. Seat 1 stays open for a paying spectator; the other four fill from the stands.",
              "A spectator seat still costs 100,000 Millix. Millix only. Type in chat. You cannot Talk.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13b",
    date: "August 27th, 2026",
    headline: "Quad Market lists unwanted skins and leftover fountain items.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Open Quad Market from the enter page. List a DLC skin you do not want, or a leftover fountain item from a match.",
              "Campus listings sit on the board. Buy with coins. 1% of every sale goes to Daniel Alan Cornish and Blake Fitzgerald.",
              "A listed good is escrowed. Pull it back, or wait — a campus buyer usually takes it in about 14 seconds.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13a",
    date: "August 27th, 2026",
    headline: "Kick vote for idle players in the wait room and in-match.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "JOINED seats that sit silent for 8 seconds go idle. Click IDLE or type /kick name. Majority of the room (at least 2) passes it. A bot sits.",
              "Spectators cannot vote. /yes and /no work while a vote is open.",
              "In a match, 22 seconds with no orders starts an idle kick on you. Take the keyboard or expert AI takes your kit.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.13",
    date: "August 27th, 2026",
    headline: "Draft opens 36 kits: Strength 12, Agility 12, Intelligence 12.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The draft is three groups of twelve original kits. MAGA and Antifa share the pool.",
              "Strength holds the line. Agility runs the carry. Intelligence nukes and supports.",
              "Riot Cap, Night Desk, and Mascot stay. New campus kits fill the rest. Extra skins still sit on those three.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12z",
    date: "August 27th, 2026",
    headline: "Sign up on Tangled social from the enter page.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The enter page Tangled box now has Sign up on Tangled and Log in on Tangled.",
              "Sign up opens tangled.com/register. Log in opens tangled.com/login. After you have a username there, type it into this tab — still no Tangled password.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12y",
    date: "August 27th, 2026",
    headline: "MAGA deaths bark Fake news. Antifa deaths bark nazi.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "When a MAGA hero drops, the bark is Ahhh. Fake news! — a low US-male spoken line, not a recording.",
              "When an Antifa hero drops, the bark is You fuckin nazi!",
              "Death lines take the mic over kill taunts. Mute still cancels speech.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12x",
    date: "August 27th, 2026",
    headline: "Heroes and minions taunt, clash, and bark in lane.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Melee swings clash. Archers twang. Jungle hogs snarl. Hits throw sparks.",
              "MAGA and Antifa heroes shout taunts on a fight and on a kill. Minion lines bark when a wave leaves the fountain.",
              "Mute still silences Web Audio and spoken taunts.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12w",
    date: "August 27th, 2026",
    headline: "Streets, jungle camps, and creeps painted into the map.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Lanes are streets now: asphalt, curbs, dashed center lines, and crosswalks at mid and the outer lanes.",
              "Jungle trails cut between the streets. Four camps sit in the groves — Mall Oaks, Reflecting Grove, Rainier Stand, Elliott Thicket — with hog creeps that leash and respawn.",
              "Lane infantry and archers draw as MAGA visor kits vs Antifa bloc kits. Last-hit them or pull a camp for gold.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12v",
    date: "August 27th, 2026",
    headline: "Heroes read bigger on the Midwars map.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Kits draw larger in lane. Hats, capes, and nameplates scale with the body.",
              "Minimap dots for heroes are a touch bigger so you can pick your color in a teamfight.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12u",
    date: "August 27th, 2026",
    headline: "1% of every PayPal payment and every card charge goes to the developers.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Daniel Alan Cornish and Blake Fitzgerald take 1% of every PayPal payment and every card charge.",
              "PayPal still goes to thedannymacdope@gmail.com. Card still goes to D A Cornish, account 73922859, sort 20-01-09, exp 03/31.",
              "PayPal and card are external. They no longer spend this tab’s coins. The 1% is taken from the payment, not on top of the price.",
              "The store locker line now splits the cut: coins, MLX, PayPal, and card.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12t",
    date: "August 27th, 2026",
    headline: "Campus Book. Bet MAGA vs Antifa in the wait room.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Campus Book opens in the wait room. Even 1.90 on three markets: which town holds, under/over 8:00, and who takes the first tower.",
              "Stake 50, 100, or 250 coins or MLX. One slip per market. Replace a pick until the match starts. The book locks on lock-in, Watch this match, or Watch AI play from the wait room.",
              "Payouts land when a town falls. Leave the wait room or leave campus mid-match and the stake comes back.",
              "Daniel Alan Cornish and Blake Fitzgerald take 1% of every stake and every payout. Watch AI from the enter page skips the wait room, so it skips the book.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12s",
    date: "August 27th, 2026",
    headline: "Cleaner Midwars map. Quad Engine paints Washington DC and Seattle.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The map is still Midwars: MAGA Washington DC vs Antifa Seattle. Lanes, fountains, and towns stay where they were.",
              "Quad Engine now caches the ground: mall lawn vs evergreen jungle, dirt lanes with curbs, a river through mid, and a Kirk Cup plaza.",
              "Washington DC has a Capitol dome, monument, and reflecting fountain. Seattle has a Space Needle, glass towers, and Pike Place on Elliott Bay.",
              "Towers are brick and gold on MAGA, steel and teal on Antifa. Street lamps and fountain ripples stay live.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12r",
    date: "August 27th, 2026",
    headline: "In-tab FAQ.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Open FAQ from the enter page. Play, chat and seats, Tangled, store and Millix, lotto, clans, and this tab.",
              "Patches still cover what changed. The FAQ covers how the current build works.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12q",
    date: "August 27th, 2026",
    headline: "Millix Hourly lottery. Three winners every hour.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Millix users enter Millix Hourly from Lotto. One draw every hour. Three people win.",
              "Stake 50 MLX once per hour. The pot is every stake that hour — you plus twenty-one other Millix users on the node.",
              "1st takes 50% of the pot, 2nd takes 30%, 3rd takes 20%. Qualify by holding MLX, clearing a Millix payment, or logging in on Tangled.",
              "Daniel Alan Cornish and Blake Fitzgerald take 1% of every stake and every payout.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12p",
    date: "August 27th, 2026",
    headline: "Tangled social login. Tangled browser still earns more gold per minute.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Tangled social users log in on the enter page with their Tangled username. MAGA seat 1 carries that name. This tab stores the username locally — no Tangled password.",
              "Play MAGA vs Antifa in Tangled browser and the local hero drips 384 gold/min. Other browsers stay at 192 gold/min.",
              "The HUD shows tangled 384/min when the browser bonus is on. Logging in with a Tangled username does not by itself raise gold.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12o",
    date: "August 27th, 2026",
    headline: "Spectator seats type in chat and cannot talk. 100,000 Millix.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "The wait room has a six-seat spectator gallery under MAGA and Antifa.",
              "A spectator seat costs 100,000 Millix. Millix only — no PayPal, no card.",
              "Spectators type in chat. They cannot Talk. Players still Talk or Type.",
              "Sit in the gallery, then Watch this match. Camera follows the fight. Type from the stands.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12n",
    date: "August 27th, 2026",
    headline: "The developers are Daniel Alan Cornish and Blake Fitzgerald.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "MAGA vs Antifa is developed by Daniel Alan Cornish and Blake Fitzgerald.",
              "The 1% cut on every transaction goes to those two.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12m",
    date: "August 27th, 2026",
    headline: "Developers take 1% of every transaction.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "1% of every DLC payment, Millix pack, Quad Lotto ticket, and lotto payout is collected as a developer cut.",
              "The store and lotto pages show coins and MLX collected so far.",
              "Matches stay free. The 1% comes out of the transaction, not on top of the price.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12l",
    date: "August 27th, 2026",
    headline: "Watch AI plays a full 12-seat match with expert brains on every hero.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Watch AI on the enter page jumps straight into Washington DC vs Seattle. Expert AI last-hits, fights, and shops on all twelve seats.",
              "The camera follows the fight. P or Expert AI on the HUD takes the keyboard.",
              "The wait room has Watch AI play if the lobby is already filling.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12k",
    date: "August 27th, 2026",
    headline: "PayPal inbox locked to thedannymacdope@gmail.com.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Every PayPal DLC payment goes to thedannymacdope@gmail.com. No other inbox.",
              "The locker waits until that PayPal address clears.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12j",
    date: "August 27th, 2026",
    headline: "Tangled browser users earn more gold per minute.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Play MAGA vs Antifa in Tangled browser and the local hero drips 384 gold/min (6.4/s).",
              "Other browsers stay at 192 gold/min (3.2/s).",
              "The HUD shows tangled 384/min when the bonus is on.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12i",
    date: "August 27th, 2026",
    headline: "PayPal to thedannymacdope@gmail.com. Card to D A Cornish, account 73922859 sort 20-01-09 exp 03/31.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "PayPal DLC payments go to thedannymacdope@gmail.com. The locker waits until PayPal clears.",
              "Card DLC payments go to D A Cornish, account 73922859, sort 20-01-09, exp 03/31. The locker waits until that account clears.",
              "Millix still pays the store node at 40% off.",
            ],
          },
        ],
      },
      {
        id: "store",
        heading: "DLC Store Updates",
        blocks: [
          {
            lines: [
              "The card pay box now shows the receive account, same as the Millix node and PayPal inbox.",
              "Buyer card numbers are still not stored.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12h",
    date: "August 27th, 2026",
    headline: "@blake and @lilhooligan get expert autoplay. P toggles the keyboard.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "@blake and @lilhooligan can hand the keyboard to expert autoplay. On by default for those handles.",
              "P or the Expert AI HUD button toggles autoplay. A click or ability takes the keyboard for 5 seconds, then expert AI resumes unless you turn it off.",
            ],
          },
        ],
      },
      {
        id: "creeps",
        heading: "Lane Creep Updates",
        blocks: [
          {
            name: "Infantry",
            lines: ["Still walk the front of the minion line. Expert AI holds behind them instead of overextending into empty towers."],
          },
          {
            name: "Archer",
            lines: ["Still hold behind infantry. Expert last-hits wait until the creep is in kill range instead of auto-pushing the wave."],
          },
        ],
      },
      {
        id: "items",
        heading: "Item Updates",
        blocks: [
          {
            name: "Dean's List",
            lines: ["Expert autoplay buys this after Annotated Text on Riot Cap and Night Desk."],
          },
          {
            name: "Meal Plan",
            lines: ["Mascot expert autoplay buys Meal Plan and Lab Coat before damage items."],
          },
        ],
      },
      {
        id: "heroes",
        heading: "Hero Updates",
        blocks: [
          {
            name: "Riot Cap",
            lines: [
              "Expert AI: Breakaway toward the fountain when fleeing.",
              "Uprising now used when two rival heroes are in the blast.",
              "Crowd Surge before a close fight.",
            ],
          },
          {
            name: "Night Desk",
            lines: [
              "Expert AI: Collection Due on a low rival.",
              "Overdue Stamp used to secure last hits when no hero is in range.",
              "Stack Walk toward the fountain when fleeing.",
            ],
          },
          {
            name: "Mascot",
            lines: [
              "Expert AI: School Spirit when health drops under 55%.",
              "Heckle when two rivals are close. Homecoming Parade to gap-close.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12g",
    date: "August 27th, 2026",
    headline: "@blake and @lilhooligan join the wait room.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Set a handle on the enter page. MAGA seat 1 carries that tag.",
              "@blake and @lilhooligan join the wait room on their own if you are not already one of them.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12f",
    date: "August 27th, 2026",
    headline: "PayPal and card DLC unlock on clear, same as the Millix node.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "DLC stays locked until the payment clears — Millix node, PayPal, or card.",
              "Millix is still 40% off. PayPal and card are full price.",
              "PayPal inbox: thedannymacdope@gmail.com.",
            ],
          },
        ],
      },
      {
        id: "store",
        heading: "DLC Store Updates",
        blocks: [
          {
            lines: [
              "Three rails on every extra skin: Millix micropay, PayPal, card.",
              "Copy in the pay box follows the rail you picked.",
              "Card numbers are not stored. Skins drop into the locker after clear.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12e",
    date: "August 21st, 2026",
    headline: "Play with your friends, wait less for a game, and a new Legendary for Riot Cap.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "12-seat queue fills faster. Fill remaining with bots is instant.",
              "This tab still runs every empty color as AI.",
            ],
          },
        ],
      },
      {
        id: "store",
        heading: "DLC Store Updates",
        blocks: [{ name: "Parade Cape", lines: ["Legendary homecoming cape for Riot Cap is in the locker shelves."] }],
      },
    ],
  },
  {
    id: "6.12d",
    date: "August 15th, 2026",
    headline: "Quad Engine v6 lighting pass, hats and hair, lamp lights, and filmic post.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Quad Engine v6: lane specular, fountain glow, tree canopy, filmic post. Not Unreal.",
              "Hero kits now draw hats and hair. Infantry carry shields. Archers carry bows.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.12c",
    date: "August 7th, 2026",
    headline: "A new Legendary Mascot, a pass over fountain healing, and steadier Midwars spawns.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Healing pools on both ends of the lane. Super easy.",
              "Gold drips to every hero all match.",
              "Steadier Midwars wave spawns.",
            ],
          },
        ],
      },
      {
        id: "heroes",
        heading: "Hero Updates",
        blocks: [{ name: "Mascot", lines: ["Spirit Cape legendary is on the DLC shelf."] }],
      },
    ],
  },
  {
    id: "6.12b",
    date: "July 30th, 2026",
    headline: "Night Desk joins the Seattle roster, filmic post, and Millix vouchers.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Millix is a micropayment: 40% off every extra skin.",
              "Card is the full-price rail. Matches remain free.",
            ],
          },
        ],
      },
      {
        id: "heroes",
        heading: "Hero Updates",
        blocks: [{ name: "Night Desk", lines: ["Joins the Seattle roster as the nuker kit."] }],
      },
    ],
  },
  {
    id: "6.12a",
    date: "July 20th, 2026",
    headline: "The in-tab Gift Shop, Banning Pick returns to Midwars, and a smoother wait room.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Draft locks a kit after the 12-seat room is full.",
              "Banning Pick beat returns to Midwars. This tab still runs empty colors as AI.",
            ],
          },
        ],
      },
      {
        id: "items",
        heading: "Item Updates",
        blocks: [{ lines: ["Gift Shop is B at the fountain. Track Cleats, Annotated Text, Meal Plan, Lab Coat, Dean's List."] }],
      },
    ],
  },
  {
    id: "6.12",
    date: "July 15th, 2026",
    headline: "A massive balance patch, one-wallet coins/MLX, Unranked Midwars, and the Parade Cape.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "K.D.R sits gold on the HUD next to K/D/A.",
              "Assists count from a 12-second damage window and nearby allies.",
              "Passive gold drip is on for the whole match.",
              "One wallet for coins and MLX. Unranked Midwars in this tab.",
            ],
          },
        ],
      },
      {
        id: "creeps",
        heading: "Lane Creep Updates",
        blocks: [
          {
            name: "Infantry",
            lines: ["Three infantry walk the front of each wave."],
          },
          {
            name: "Archer",
            lines: ["One archer behind, two every third wave."],
          },
        ],
      },
      {
        id: "heroes",
        heading: "Hero Updates",
        blocks: [
          { name: "Riot Cap", lines: ["Carry kit. Rally Slash, Breakaway, Crowd Surge, Uprising."] },
          { name: "Night Desk", lines: ["Nuker kit. Overdue Stamp, Silence in the Stacks, Stack Walk, Collection Due."] },
          { name: "Mascot", lines: ["Tank kit. Belly Bump, School Spirit, Heckle, Homecoming Parade."] },
        ],
      },
    ],
  },
  {
    id: "6.11",
    date: "May 22nd, 2026",
    headline: "Midwars overhaul, Quad Lotto, account vanity, and the hanging flag on the enter page.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Two towns: Washington DC (MAGA) and Seattle (Antifa).",
              "Destroy the other ancient to take the Kirk Cup beat.",
              "Quad Lotto: six from forty. Hanging ripped flag on the enter page.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "6.10a",
    date: "April 9th, 2026",
    headline: "Lane-war grammar restored, big balance pass, and fountain items that can grant hero levels.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: [
              "Lane war still reads last hits, denies, towers, then the ancient.",
              "Original kits — not affiliated with Dota, HoN, or any commercial publisher.",
            ],
          },
        ],
      },
      {
        id: "items",
        heading: "Item Updates",
        blocks: [{ lines: ["Fountain items can grant hero levels."] }],
      },
    ],
  },
  {
    id: "6.09",
    date: "January 19th, 2026",
    headline: "Ranked Kirk Cup, notification overhaul, and immediate match submit in this tab.",
    sections: [
      {
        id: "general",
        heading: "General Updates",
        blocks: [
          {
            lines: ["Browser game. No client to install. Play in this tab.", "Kirk Cup standings live on this machine."],
          },
        ],
      },
    ],
  },
];
