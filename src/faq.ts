import { mlxAmt, SPEC_MLX } from "./dlc";
import {
  CARD_ACCOUNT,
  CARD_EXP,
  CARD_NAME,
  PAYPAL_EMAIL,
  cardDest,
  devCredit,
  shortNode,
} from "./millix";
import { MLX_STAKE, MLX_WINNERS, NPC_MILLIX } from "./millixLotto";
import { baseGoldMin, tangledGoldMin } from "./tangled";

export type FaqItem = {
  q: string;
  a: string;
};

export type FaqGroup = {
  id: string;
  heading: string;
  items: FaqItem[];
};

export const FAQ: FaqGroup[] = [
  {
    id: "play",
    heading: "Play",
    items: [
      {
        q: "What is MAGA vs Antifa?",
        a: "A satirical 10-player browser game. MAGA holds Washington DC. Antifa holds Seattle. Five seats a side. You play in this tab — no launcher, no installer, no client. Original kits on Quad Engine C23 — campus bake rev 24 with readable jungle roads, environment-art keeps, fountain plazas restamped after the wash, and a C42 pixel roster. Grump uses the supplied pixel-art sheet. Selection cards, store skins, HUD busts, ability icons, promotional thumbs, and in-match sprites share that sheet. Equipped extra skins tint the same painter. Not affiliated with Dota, Heroes of Newerth, Valve, or any commercial publisher.",
      },
      {
        q: "Who developed it?",
        a: `${devCredit()} developed MAGA vs Antifa. They take 1% of every wallet transaction, including every escrow in and every escrow out.`,
      },
      {
        q: "Where is How to play?",
        a: "How to play on the enter page walks the first match: Enter with sound, wait room, draft, streets, last-hits, Gift Shop, HUD, and how MAGA wins. Skills is the bind list and every kit’s Q W E R. FAQ is these short answers. Campus Desk answers from this FAQ.",
      },
      {
        q: "How do I start a match?",
        a: "Find Game is the large red button on the enter page. One click opens the wait room and starts searching. @blake and @lilhooligan sit campus and swap MAGA and Antifa after each real game or Custom Game (Watch AI). @blake has the keyboard when he logs in — expert AI stays off until he taps P. MAGA still holds Washington DC. Antifa still holds Seattle. Five seats a side — ten on the field. Cancel Search leaves the queue. Practice / Training fills bots and opens draft. Lock a kit to enter Washington DC.",
      },
      {
        q: "How do Watch AI and the enter-page demo work?",
        a: "The enter page runs a live 5v5 with @blake and @lilhooligan on opposite sides and extra AI on the other seats. Mid starts as a hero fight — kits hunt kits, not just last-hits. The camera sticks to the clash; if a star goes down it swaps to the other. Click the match or Watch AI to take that fight full screen. Space snaps to the fight. The wait room also auto-seats both of them. @blake has the keyboard when he logs in. Gallery Watch this match still follows the fight, not a star.",
      },
      {
        q: "How many heroes are there?",
        a: "Thirty-five playable kits. FREE TO PLAY is eleven Liberty / Tradition (Grump, Charlie Quirk, Tommy Robinson, Elon Muck, Joe Rogen, Alex Groans, Boris Johnstone, Russell Branded, Kanye Vest, JP Steers, George Bushed) and nine Progress / Equality (Joe Biten, Bernie Sandbags, Barack O'Drama, Kamala Harass, Stephen Hocking, The Young Turkeys, Vaxxie Scientist, Planet Defender, Progressive Journalist). MMA DLC is six parody fighters: Conor Macgregor, Khabib Nurmagoat, Jon Jonesy, Israel Adesanya-ish, Dustin Poirier-ish, Nate Diaz-ish — locked until you buy the MMA pack. Nine Wildcard DLC kits sit at the bottom: The Icon, The Enigma, The Cartoons, The Reality Dynasty, The Legend, The Entitlement, The Tech, Pheobe, Plant Power. Campus generics and extra poster kits left the playable pool. Parody.",
      },
      {
        q: "Do fountain items have pictures?",
        a: "Yes. Track Cleats, Annotated Text, Meal Plan, Lab Coat, Dean's List, Cafeteria Tray, Red Pen, and Bike U-Lock each have an icon in the fountain shop and in your bag. Quad Market listings show the same pictures.",
      },
      {
        q: "What do splash, crit, and bash items do?",
        a: "The Gift Shop buys and sells into six item slots on the match HUD. Cafeteria Tray splashes 50% of an auto-attack onto nearby rivals — not towers, not the town. Red Pen is a 22% chance to crit for 185% damage. Bike U-Lock is an 18% chance to bash and stun for 1.1 seconds, with a short cooldown so it cannot lock a kit forever. Skills do not proc these. Bots buy them too.",
      },
      {
        q: "What does the map look like?",
        a: "Three lanes. Top and bot have three towers: inner just in front of town, middle midway up the lane, outer near the map corner — top-left on top, bottom-right on bot. Mid has an outer tower set back from the river and an inner tower closer to town. There is no middle tower on mid. Take them in order, then raze the other town. MAGA holds Washington DC on the National Mall — Capitol dome, monument, reflecting fountain, museum blocks, hedges, benches, and cherry trees. Antifa holds Seattle on Elliott Bay — Space Needle, glass towers, Pike Place, a ferry, a crane, and a second pier. Streets have sidewalks, gold arrows, manholes, storm drains, hydrants, and cans. The river has reeds, pylons, lily pads, and a railed bridge. Top street runs to the top-left corner. Bot street runs to the bottom-right corner. Mid cuts the diagonal. Named woods sit between the lanes — Mall Oaks Woods, Reflecting Grove Woods, Capitol Copse on MAGA DC; Rainier Woods, Elliott Woods, Bay Copse on Antifa Seattle — with back tracks of packed dirt behind the streets for ganks. Jungle camps still sit in the groves: Mall Oaks, Reflecting Grove, Rainier Stand, Elliott Thicket. Walk with the minion line. Destroy the other town. The enter page shows gameplay details and this map on the right, under the hanging flag.",
      },
      {
        q: "What is the win condition?",
        a: "Walk with the minion line: three infantry up front, one or two archers behind. Last-hit creeps. Top and bot have three towers — inner in front of town, middle midway, outer at the corner. Mid has an outer tower and an inner tower. Then destroy the other town. HUD shows K/D/A and K.D.R.",
      },
      {
        q: "Who announces the match?",
        a: "Every game opens with a ring-desk announcer in a Bruce Buffer cadence — MAGA Washington DC and whoever sits that fountain this game versus Antifa Seattle and the other campus name, then a gong on FIGHT. The desk also calls first blood, fallen towers, and the winner. A bell hits under the spoken lines so the desk still lands if speech is late. Click Enter with sound, Find Game, Practice, or Custom Game so the browser starts audio — the enter-page demo then clinks and tings too, with a looping fight bed under the clash. Combat is royalty-free synth in this tab — no sample pack. For now the soundtrack is The Star-Spangled Banner in this tab — public domain, no download. Open Sound card to set combat, desk, and music. Mute / Unmute from the HUD cuts the anthem. Combat clinks, tings, coin drops, barks, and the ring announcer keep playing. Music On / Off, Next (restarts the anthem), Volume, and the song name scrolling across the bar at the top.",
      },
      {
        q: "Can I play on a phone?",
        a: "Yes. This is a computer-browser game first — full page with keyboard, mouse, keybinds, music bar, bag, and live chat. A skinny window or preview still shows that desk. A phone browser still plays: tap ground to walk, tap a creep or hero to lock, drag to pan. Snap puts the camera back on you. Stop drops the path. Lock is the A-key. Skill buttons on the bar cast Q W E R. Shop is on the bar — stand in the fountain. Pause and Mute sit on the top bar. A keyboard and mouse is the better desk. This is not a native app.",
      },
      {
        q: "What are the controls?",
        a: "Open Skills on the enter page for every bind and every kit. In a match: Arrows pan the camera. Right-click walk. On a phone: tap ground to walk, tap a creep or hero to lock, drag to pan. Stop / Snap / Lock sit on the HUD. A chooses the target: hover a creep or hero and tap A to lock them, or tap A then click. Gold brackets lock that one, and your kit chases it until it dies or you pick someone else. Auto-attack fills in when you have no lock. S and a ground click drop the lock. Z attack-move. Q W E R skills — X C F also cast the same slots (X is Q, C is E, F is R). Hold T to talk with MAGA over the mic. Hold G to talk to everyone. B Gift Shop (stand in the fountain to spend match gold). P expert autoplay. Space snap camera — in Watch AI and the enter-page demo it snaps onto @blake or @lilhooligan. F11 fullscreen. Esc pause. Mute / Unmute on the HUD cuts the anthem. Melee clinks, arrow tings, coin drops on every kill, taunts, death lines, the ring announcer, and spoken barks keep playing. Music On / Off, Next (restarts the anthem), and Volume sit on the bar across the top. Kill a MAGA hero and they go down with Ahhh Fake news. Kill an Antifa hero and they go down with You fucking nazi.",
      },
      {
        q: "Where do I read every skill?",
        a: "How to play walks the first match. Skills on the enter page lists every control this tab uses, then every kit’s Q W E R — Liberty 8, Progress 8, MMA DLC 6, Wildcard DLC 8. R unlocks at level 6. Search a kit name or a move. Filter Liberty, Progress, MMA, or DLC / Wildcards.",
      },
      {
        q: "How do I get better at this?",
        a: "Last-hit creeps. Gold pops on the last-hit. Five, ten, twenty last-hits pay a bonus. Hero kills stack a streak — two, three, five, then campus godlike. Dying on a three-kill streak pays the rival a shutdown bounty. First blood and the first tower pay the team. The heat bar under the clock shows last-hits, XP to the next level, and the next Gift Shop buy. Win a match for locker coins. First win of the day pays extra. A win streak stacks. Loss still pays show-up gold. Three daily quests sit on the enter page and reset at midnight.",
      },
      {
        q: "Do matches cost coins or Millix?",
        a: "Matches are free. Extra skins are £1.99 on PayPal or card, or 40% off with Millix. The MMA DLC pack uses the same rails: standard price on PayPal or card, Millix at 60% of that sticker — the UI says 40% OFF WITH MILLIX. Coins and MLX also buy spectator seats, Millix packs, Quad Lotto tickets, Millix Hourly stakes, Campus Book slips, and Quad Market listings. The campus wheel on the DLC Store is one free spin a day. Not every spin is a winner.",
      },
      {
        q: "How does the background music work?",
        a: "For now the soundtrack is The Star-Spangled Banner, played in this tab. The composition is public domain. No file to download. Spotify does not have to load. Music On / Off, Next (restarts the anthem), Volume, and HUD Mute still work. Combat is loud enough to hear: each kit has its own original hit, minions tick, and a coin drops on every kill — royalty-free synth, no sample pack. Link Spotify still pays +1,000 gold once if you want that locker bonus.",
      },
      {
        q: "Does linking Spotify pay gold?",
        a: "Yes. Link Spotify on the music bar. That opens Spotify (login if you need it). Come back to this tab and the locker pays +1,000 gold once. If you are in a real match, that gold also hits your kit. Watch AI, the gallery, and the enter demo do not take the match gold — the locker still does. Linking again does not pay again. This tab does not take a Spotify password.",
      },
      {
        q: "Why is there no sound?",
        a: "Click Enter with sound, Find Game, Practice, or Custom Game. That click resumes the mixer in this tab — combat, the desk, and The Star-Spangled Banner. Play every sound on the enter page or Sound card runs the catalog. Unmute this tab if the OS muted it. Nothing extra to download.",
      },
      {
        q: "What is the sound card?",
        a: "Browsers keep this tab silent until a click. Click Enter with sound, Find Game, Practice, or Custom Game — that press starts combat, the ring desk, The Star-Spangled Banner, and an entrance sting. Nothing extra to download. Open Sound card to set the three faders. Test combat plays kit voices plus a coin drop. Test desk proves the announcer bus. Combat is royalty-free synth in this tab — oscillators and noise, no sample pack. Settings stay on this locker. HUD Mute still only cuts the anthem. Combat and the desk keep playing.",
      },
      {
        q: "Are the battle sounds royalty-free?",
        a: "Yes. Combat, the looping fight bed, coin drops on every kill, desk bells, and barks are generated in this tab with oscillators and noise. Each of the thirty-five playable kits has its own original swing, hit, and skill sting. Minions have infantry, archer, and jungle voices. Nothing is sampled from a commercial library. The background music for now is The Star-Spangled Banner — public domain, also played in this tab, no download. HUD Mute cuts the anthem. Combat keeps playing.",
      },
    ],
  },
  {
    id: "chat",
    heading: "Chat and seats",
    items: [
      {
        q: "What is the difference between Talk and Type?",
        a: "Players can Talk or Type in wait-room chat. Hold T to talk with your team over the mic. Hold G to talk to everyone. The red Talk button still sends typed Talk. Spectators Type only. They cannot Talk. They cannot MIC TALK. Enter sends Type.",
      },
      {
        q: "How do spectator seats work?",
        a: `The wait room has a five-seat gallery under MAGA and Antifa. A spectator seat costs ${mlxAmt(SPEC_MLX)} MLX, Millix only — no PayPal, no card. Sit in the gallery, then Watch this match. Type from the stands. You do not control a hero. You cannot Talk on the mic. Expert AI and the Gift Shop stay off.`,
      },
      {
        q: "What happens to MAGA seat 1 if I sit in the gallery?",
        a: "You leave the MAGA roster. Sit MAGA seat 1 to play again. @blake and @lilhooligan stay in on campus and swap after each game. Watch AI play still runs a full 10-AI match and is not the gallery.",
      },
      {
        q: "Why are @blake and @lilhooligan already in the wait room?",
        a: "@blake and @lilhooligan sit campus every match and swap MAGA/Antifa after a real match or Watch AI. Opening the wait room without playing does not flip them. @blake plays when he wants — expert AI is off until he taps P. MAGA still holds Washington DC. Antifa still holds Seattle. Five seats a side — ten on the field. Neither campus seat can be kicked. Fill remaining with bots still pads the other seats.",
      },
      {
        q: "How do I kick an idle player?",
        a: "In the wait room, a JOINED seat goes IDLE after 8 seconds of silence. Click that seat or type /kick name. You vote yes. The rest of the room needs a majority (at least 2). /yes and /no also work. Spectators cannot vote. @blake and @lilhooligan cannot be kicked. A passed kick sits a bot. In a match, if you sit on the keyboard for 22 seconds, your team starts an idle kick — Take the keyboard or expert AI takes your kit.",
      },
      {
        q: "How do we concede a losing game?",
        a: "If MAGA is losing after 1:30 — fewer towers, less gold, a weaker town, or a kill deficit — open Concede on the HUD or type /concede. Every player on MAGA must vote yes. Bots do not vote. Campus seats on MAGA auto-yes. One no or a 22-second timeout kills the vote, then a 40-second wait. Spectators, Watch AI, and the enter-page demo cannot call it. A passed concede is a MAGA loss. Seattle holds.",
      },
    ],
  },
  {
    id: "tangled",
    heading: "Tangled",
    items: [
      {
        q: "Can I log in with Tangled?",
        a: "No. The enter page no longer has Tangled social login. Log in with Facebook, Gmail, or sign up with email. MAGA seat 1 takes that locker handle.",
      },
      {
        q: "Does Tangled browser earn more gold?",
        a: `Play in Tangled browser and the local hero drips ${tangledGoldMin()} gold per minute. Other browsers stay at ${baseGoldMin()} gold per minute, including Facebook, Gmail, and email lockers in Chrome or Safari. The HUD shows tangled ${tangledGoldMin()}/min only when the Tangled browser bonus is on. Coming back from tangled.com does not turn that bonus on.`,
      },
    ],
  },
  {
    id: "store",
    heading: "Store and Millix",
    items: [
      {
        q: "What is Millix?",
        a: "Millix (MLX) is a cryptocurrency on a directed acyclic graph — a DAG — not a blockchain and not an ERC-20. Open Millix · DAG from the enter page. Protocol facts follow millix.org. This game is not millix.org. Campus takes Millix for DLC at 40% off the £1.99 sticker, spectator seats, Quad Lotto, and Millix Hourly. 1,000,000 MLX = $0.18 on the fiatleak peg this locker prints.",
      },
      {
        q: "What is a DAG?",
        a: "Directed acyclic graph. Directed: every edge has a direction. Acyclic: those edges never loop back. Graph: many nodes and paths, not one chain of blocks. Millix also calls this a tangle. A sender picks a random proxy node; peers validate; after about ten minutes a transaction hibernates. Open Millix · DAG for the live graph and the millix.org links.",
      },
      {
        q: "How do I buy DLC?",
        a: `Extra skins are £1.99 on PayPal or card, or 40% off with Millix — send MLX to node ${shortNode()}. PayPal £1.99 goes to ${PAYPAL_EMAIL}; 1% of that PayPal payment goes to ${devCredit()}. Card £1.99 goes to ${cardDest()}; 1% of that card charge goes to ${devCredit()}. Load Millix in the store: 100 coins → 500 MLX, or send from your Millix wallet if this tab is short. The campus wheel on the DLC Store is free — one spin a day. Miss pays nothing. A skin if you do not own it. 80 coins if you do.`,
      },
      {
        q: "How does the campus wheel work?",
        a: "Open the DLC Store. One free spin a day. The locker stamps the spin when you hit Spin — refreshing the tab does not get you another. Not every spin is a winner. Dark Miss wedges pay nothing. The rest of the wheel is every extra skin on the shelf — campus looks, MMA parodies, Marvel parodies, DC parodies, and public-domain characters. Land a skin you do not own and it drops in the locker with no payment. Land a skin you already own and the locker pays 80 coins instead. The button counts down to midnight for the next spin.",
      },
      {
        q: "How does Quad Market work?",
        a: "Open Quad Market from the enter page. List a DLC skin you own or a leftover fountain item from a match. Campus players post skins and items too. Buy with coins. A listed good is held in escrow until it sells — a campus buyer usually takes your listing in about 14 seconds — or you pull it back. 1% of every escrowed sale goes to the developers. Leftover fountain items from a match drop into your locker.",
      },
      {
        q: "Where does card money go?",
        a: `${CARD_NAME}, account ${CARD_ACCOUNT}, sort 20-01-09, exp ${CARD_EXP}. ${devCredit()} take 1% of every card charge. The locker waits until that account clears. This tab does not store full card numbers.`,
      },
      {
        q: "What is the 1% cut?",
        a: `${devCredit()} take 1% of every bet: Campus Book stakes and payouts, Millix Hourly stakes (yours and the other Millix users that hour), Millix Hourly payouts, Quad Lotto tickets, and Quad Lotto payouts. They take 1% of every escrow transaction: stakes into the campus Millix node, prizes paid out of that node (every place that hits, not only yours), and Quad Market listings that sell. They also take 1% of every PayPal payment, every card charge, every Millix DLC send, spectator seat, and Millix pack. Matches stay free. The 1% comes out of the payment, not on top.`,
      },
    ],
  },
  {
    id: "lotto",
    heading: "Lotto and Campus Book",
    items: [
      {
        q: "How does Millix Hourly work?",
        a: `For Millix users. One draw every hour. Up to ${MLX_WINNERS} people win. Stake ${MLX_STAKE} MLX once per hour. That stake sits in escrow on the campus Millix node until the hour settles. The pot is every stake that hour — you plus ${NPC_MILLIX.length} other Millix users on the node — plus any Millix that rolled over. 1st takes 50%, 2nd takes 30%, 3rd takes 20%. If a place has no winner, that share stays in escrow and rolls into the next hour. If nobody hits, the whole pot rolls over. The node pays winning wallets automatically. Qualify by holding MLX, clearing a Millix payment, or logging in on Tangled. ${devCredit()} take 1% of every escrow in and every escrow out that hour — your stake, the other Millix stakes, and every prize the node pays.`,
      },
      {
        q: "How do I get paid if I win Millix Hourly?",
        a: `Save a personal Millix receive address on Lotto. The campus node holds the pot in escrow. When the hour settles, 1st, 2nd, and 3rd are paid from escrow to each winner’s wallet. ${devCredit()} take 1% of that escrow out. If a place has no winner, that Millix rolls into the next hour. If you have no address saved, your prize stays on the node until you save one, then it sends. Do not save the campus node as your wallet — that address is escrow, not yours.`,
      },
      {
        q: "How does Quad Lotto work?",
        a: "Pick six numbers from 1 to 40, or Quick pick. A ticket is 100,000 MLX, Millix only. Two hits pay 40,000 MLX, three 160,000, four 500,000, five 1,800,000, six is the 8,000,000 MLX jackpot. Draw is in this tab. Load Millix in the store if the locker is short.",
      },
      {
        q: "How does Campus Book work?",
        a: "Open in the wait room. Even 1.90 on three markets: MAGA Washington DC vs Antifa Seattle, under/over 8:00, and who takes the first tower. A slip is 100 gold. One bet per hour — pick one market, or wait until the next hour for another. Replace that pick until the match starts. The book locks when you lock in, watch from the gallery, or Watch AI play from the wait room. Pays when a town falls. Leave the wait room and the stake comes back. 1% of every bet — every stake and every payout — goes to the developers.",
      },
    ],
  },
  {
    id: "locker",
    heading: "Account",
    items: [
      {
        q: "How do I log in?",
        a: "On the enter page, Log in with Facebook, Log in with Gmail, or Sign up with email. Facebook and Gmail ask for the email on that account — this tab does not open Facebook or Google and does not take those passwords. Sign up with email needs an address and an 8-character password. Already have that locker? Open Log in with email. Paste on the locker inserts into the field you last typed in. Copy in this tab, then Paste, or Ctrl+V / Cmd+V in a field. Some preview desks block the OS clipboard; Paste still uses what you copied in this tab. MAGA seat 1 takes a handle from the name or the email. The locker stays in this browser. Clearing site data wipes it.",
      },
      {
        q: "Can I log in with Facebook?",
        a: "Yes. Log in with Facebook on the enter page. Type the email on that Facebook, then continue. First time makes a locker. Next time is the same email. This tab does not take a Facebook password and does not open facebook.com.",
      },
      {
        q: "Can I log in with Gmail?",
        a: "Yes. Log in with Gmail on the enter page. Type the @gmail.com on that account, then continue. First time makes a locker. Next time is the same email. This tab does not take a Google password. Gmail login stays at 192 gold per minute. Extra gold is Tangled browser only (384).",
      },
      {
        q: "How do I sign up with email?",
        a: "Sign up with email on the enter page: display name, email, password, confirm. Password needs 8 characters. Create account stores a hash on this locker — not a server. Already have that locker? Log in with email. Log out leaves coins and skins. Facebook or Gmail can attach to the same email later.",
      },
    ],
  },
  {
    id: "account",
    heading: "Clans, league, and this tab",
    items: [
      {
        q: "What are clans?",
        a: "House clans live on this machine: Rally Crimson, Bike Rack Bloc, West Piazza Press. Found your own tag. It shows on MAGA seat 1.",
      },
      {
        q: "What is the Kirk Cup?",
        a: "League standings for this browser. Washington DC MAGA vs Seattle Antifa. Real matches on this locker count. Spectators and Watch AI do not.",
      },
      {
        q: "What is Tangled League?",
        a: "A campus circuit W-L board. Names on that season sit the list. Your locker handle is on Kirk Cup. @lilhooligan already sits. @blake plays when he wants. Open Stats from the enter page.",
      },
      {
        q: "Where is my locker stored?",
        a: "Coins, MLX, your Millix receive address, Hourly escrow, rollover, and payouts, skins, handle, Facebook / Gmail / email locker, whether Spotify is linked and the one-time +1,000 gold, Kirk Cup, clans, tickets, invoices, Campus Book slips, Quad Market listings, leftover fountain items, campus wheel day, music volume, Sound card combat and desk faders, and Campus Desk threads stay in this browser’s local storage. Clearing site data wipes the locker.",
      },
      {
        q: "Where are patch notes?",
        a: "Open Patches. Same layout beat as Dota 2 patches: a live Gameplay Update, then Previous Updates. MAGA vs Antifa is original kits — not affiliated with Valve.",
      },
      {
        q: "How do I contact support?",
        a: `Open Campus Desk from Support on the enter page or the Support button in the corner. The desk answers from the FAQ in this tab. For a human, tap Email this thread — that opens mail to ${PAYPAL_EMAIL} for ${devCredit()}. The desk is not wait-room Talk and not the match mic. Escape closes it.`,
      },
      {
        q: "Is this on a free server? What is the domain?",
        a: "Yes. Matches are free, and the site is set up for Vercel Hobby — the free host. Click Publish in this chat to put MAGA vs Antifa live. The site name is MAGA vs Antifa. The free URL is maga-vs-antifa.vercel.app. Vercel cannot put a space in a host, so the hyphen is the domain form of the name. A custom .com is optional later in Vercel if you buy it.",
      },
    ],
  },
];
