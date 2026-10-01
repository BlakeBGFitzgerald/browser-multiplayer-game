# MAGA vs Antifa

Satirical **10-player browser game**. MAGA vs Antifa. Washington DC vs Seattle. Play in this tab — no client, no launcher, no installer. Developed by **Daniel Alan Cornish** and **Blake Fitzgerald**.

Queue a wait room of **five MAGA seats** vs **five Antifa seats**. **@blake** and **@lilhooligan** sit campus and **swap MAGA/Antifa each game**. **@blake** has the keyboard when he logs in — expert AI stays off until he taps **P**. MAGA still holds **Washington DC**. Antifa still holds **Seattle**. Chat while colors fill, draft a kit, then fight a lane war on **Quad Engine C23**. Ten on the field. The enter page runs a **labeled campus map** on the right under the hanging flag, with a **live 5v5** under it that puts a **hero fight on mid** — both sit the demo and **Watch AI**. Click the match or **Watch AI** for the full screen. The map is three streets cut through cliffed jungle: MAGA **Washington DC** (National Mall, Capitol, reflecting pool, museum blocks, cherry trees, dorms and halls) vs Antifa **Seattle** (Elliott Bay, Space Needle, Pike Place, ferry, crane, dock halls). Named **woods** sit between the lanes, with a **jungle road** on each side (Grove Walk on DC, Thicket Walk on Seattle) and quieter gank cuts behind the streets. A stone bridge carries **mid** over the river. **Top** runs to the top-left corner. **Bot** runs to the bottom-right corner. A **spectator gallery** (five seats) sits under the teams. Seats cost **100,000 Millix** (Millix only). Spectators **type** in chat and cannot **Talk**.

## Play

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43147](http://127.0.0.1:43147).

Cast QA only: [http://127.0.0.1:43147/?cast-ai=1](http://127.0.0.1:43147/?cast-ai=1) starts a spectator 5v5. MAGA is Hooli, Ricky (the supplied wheelchair still), Steven Hawkin (the Stephen Hocking kit), Joe Rogan (the Joe Rogen kit), and The Icon. Seattle is Bernie Sandbags, Progressive Journalist, Kamala Harass, Barack O'Drama, and Planet Defender. Normal Watch AI is unchanged.

Lottery QA only: [http://127.0.0.1:43147/?lotto-test=1](http://127.0.0.1:43147/?lotto-test=1) opens a **LOTTERY TEST MODE** sandbox. It spends sandbox MLX and never writes the live locker. Wheel QA only: [http://127.0.0.1:43147/?wheel-test=1](http://127.0.0.1:43147/?wheel-test=1) opens a **SPIN THE WHEEL — TEST MODE** sandbox. It rotates the live 35-hero roster in groups of three, fills the remaining production wedges with `[BOGUS TEST PRIZE]` misses, and never writes the live locker or spends MILLIX. Chat QA only: [http://127.0.0.1:43147/?chat-test=1](http://127.0.0.1:43147/?chat-test=1) opens a fake 10-player match and fills the existing chat with test lines so name colours can be checked. Animation QA only: [http://127.0.0.1:43147/?anim-test=1](http://127.0.0.1:43147/?anim-test=1) cycles idle / walk / attack / cast / ult / hit / death on every playable kit using the live C42 blit. [http://127.0.0.1:43147/?anim-match=1](http://127.0.0.1:43147/?anim-match=1) opens Watch AI so those cycles run in a real match. Hooli is **DEV/AI-only**. Normal lockers cannot draft, roll, buy, or steer him. Developer QA: [http://127.0.0.1:43147/?hooli-test=1](http://127.0.0.1:43147/?hooli-test=1) is **DEV MODE → HERO SELECT → HOOLI** and starts a bot match on the live combat path. AI seats may still lock Hooli. Normal players do not see those controls. **Log in with Facebook**, **Log in with Gmail**, or **Sign up with email** on the enter page — the locker stays in this browser (no Facebook or Google password). This is a **computer-browser** game first — keyboard and mouse. A **phone browser** still plays: tap to walk, tap a kit to lock, drag to pan, skill buttons on the bar. **How to play** walks the first match. **Skills** lists every control, the **36 campus kits**, **12 Liberty / Tradition** and **9 Progress / Equality** poster kits, and the **16 DLC wildcard** heroes. **Daily heat** on the enter page is three quests plus win-streak coins. **Millix · DAG** is its own page — what Millix is, how the graph works, campus node, links. **Support** in the corner opens **Campus Desk**. In-tab **FAQ** has the same answers in a list. **Patches** follow the [Dota 2 patches](https://www.dota2.com/patches) layout: a live Gameplay Update, then Previous Updates. Original kits — not affiliated with Valve. Parody poster names — not affiliated with the people on the poster.

## Free host

Find Game still plays inside this tab. A static host can serve that page. It cannot run the closed-beta match: that match is a long-lived Node process on TCP port **43148**. Vercel, Netlify, and Workers are the wrong place for it. See [docs/CLOSED-BETA.md](docs/CLOSED-BETA.md) for the server, invite codes, and which free VM options can actually stay up.

## Closed beta

```bash
npm run server:check
bash scripts/beta-server.sh start
```

Open [http://127.0.0.1:43147](http://127.0.0.1:43147), choose **Closed beta**, and use `local-beta` only while the server is bound to loopback and `ENVIRONMENT` is not `production`. `local-admin` can start the match and take Hooli's seat. Health: `bash scripts/beta-server.sh health`.

## Loop

**How to play** in the tab is the walkthrough. Short version:

1. **Find Game** is the large red button on the enter page. One click opens the wait room with **@blake** and **@lilhooligan** already in on campus. They swap MAGA/Antifa after each real match or Custom Game (Watch AI). **@blake** plays when he wants — the keyboard stays his until he taps **P**. Five seats a side. **Cancel Search** leaves the queue. **Practice / Training** fills bots and opens draft. **Watch AI** skips the queue, seats both of them, and puts a **hero fight on mid** with expert AI on every seat.
2. Chat: players **Talk** or **Type**. Spectators **Type** only. Idle JOINED seats can be **kicked** (`/kick name`). Or **Fill remaining with bots**, then **Enter draft**. Buy a gallery seat in the DLC Store, then **Sit in gallery** and **Watch this match**. If MAGA is losing after 1:30, **Concede** on the HUD or `/concede` — every MAGA player must vote yes.
3. Lock a kit from the **thirty-five** on the board: **FREE TO PLAY** is **11 Liberty / Tradition** (Red) and **9 Progress / Equality** (Blue). **MMA DLC** is **6** parody fighters — locked until you buy the pack. **WILDCARDS** are **9** unclassified DLC kits. Each card shows role, difficulty, passive, Q W E, and the ultimate. **Random kit** rolls owned kits only. The store sells the MMA DLC (Millix is **60%** of the standard pack price — **40% OFF WITH MILLIX**) and the Wildcard Pack. MAGA holds **Washington DC**. Antifa holds **Seattle**.
4. Walk with the **minion line**: MAGA **redcap** infantry and Antifa **black-bloc** infantry, with archers behind throwing **beer cans and bottles**. The land past the Quad is woods and trash heaps, not a black void. Pull **jungle camps** in the named woods between streets — walk the **jungle road** and gank cuts behind the lanes. Last-hit, take **three towers a street** — inner in front of town, middle midway, outer at the **top-left** and **bottom-right** corners on those streets — then destroy the other town. HUD shows **K/D/A** and gold **K.D.R**. Fountain Gift Shop (**B** in the pool) has four slots: plates plus **Cafeteria Tray** (splash), **Red Pen** (crit), and **Bike U-Lock** (bash). **Log in with Facebook, Gmail, or sign up with email** on the enter page. This locker stays at **192 gold/min**. **Tangled browser** users drip **384 gold/min**. **@lilhooligan** gets **expert autoplay**. **@blake** has the keyboard when he logs in (toggle with **P**).

## Jungle trees

Woods between the streets are a fixed tree layout in `src/game/jungle.ts`. The walk grid in `src/game/map.ts` carves the routes, then closes one cell under each solid trunk. Lanes, fountains, ancients, the river, camps, and objective clearings stay open. Grove Walk and Thicket Walk stay the main roads. Side cuts, dead ends, and the South Bank Cut are the extra paths. Pockets (Oak Pocket, Reflecting Nook, Capitol Hollow, North Spur, Rainier Blind, Elliott Pocket, Fir Nook) are small clearings with one mouth. A pocket breaks sight from outside the ring. Standing in the mouth, or inside the same pocket, does not. The wider woods veil after the early game is unchanged. Trunks do not grant stealth by themselves.

To add a path, append a `JungleRoute` (`side`, `dead`, or `alt`) and set `radius` to the open corridor in pixels. To add a pocket, append a `Hideout` and a route that ends on it. `mouth` is the entrance the ring faces. `clear` is open ground. To add or move a tree line, edit a `TreeCluster` or the shoulder spacing inside `buildJungleTrees`. `sight: false` blocks walking only. `solid: false` does not close a walkable cell. To remove something, delete that row and reload. Nothing in this layout is rerolled per match. Check the grid with `npx vite-node scripts/jungle-paths.mts`.

## Account

**Log in with Facebook**, **Log in with Gmail**, or **Sign up with email**. There is no Tangled social login. Extra gold is **Tangled browser** only (**384 gold/min**). Facebook, Gmail, and email lockers in Chrome or Safari stay at **192 gold/min**.

## Economy

Matches are free. Open the **DLC Store** for the **MMA Fighters DLC** (six playable parody fighters: Conor Macgregor, Khabib Nurmagoat, Jon Jonesy, Israel Adesanya-ish, Dustin Poirier-ish, Nate Diaz-ish), extra skins, and the **nine playable wildcard heroes** (**The Icon**, **The Enigma**, **The Cartoons**, **The Reality Dynasty**, and the rest), plus MMA walkouts, Marvel / DC parodies, public-domain characters including **Mikey Mouse**, **Winnie-the-Pooh**, **Alice**, and **Sherlock Holmes**, and a bundle. The MMA pack uses the same shelf formula as other packs (six heroes at half the £1.99 sticker). Millix is **60% of that standard price** — the card says **40% OFF WITH MILLIX**. The **DLC / Wildcards** tab sells each kit at **£1.99**, or **40% off with Millix**. A **Wildcard Pack** unlocks all nine at half the shelf, then Millix still knocks 40% off. Unowned MMA kits cannot be picked, rolled, or deep-linked. Playable kits paint on **C42** — illustrated sprites with unique faces, outfits, gaits, ability icons, promotional thumbs, and matching portraits. Draft cards, Skills kit cards, store skins, HUD busts, and the in-match sprite share that sheet. Equipped extra skins tint the same painter. Campus bake is **Quad Engine C23 rev 24** — fountain plazas, DC and Seattle bases, and the Gift Shop restamped after the wash. Towers and the map stay environment art. **Each extra skin is £1.99** on PayPal or card, or **40% off with Millix**. The store also has a **campus wheel**: one free spin a day, stamped when you hit Spin. **Not every spin is a winner.** Miss pays nothing. Land a skin you do not own and it drops in the locker. Land one you already own and the locker pays 80 coins. Next spin after local midnight.

- **Millix** (40% off the **£1.99** sticker): send MLX to node `1GsrgWH7ncasNDP1UVirAvSAY5tLWP3yyN0a015WcdWwYqGyRGdp3BmWc7rEyADG1h8UQot`. Unlock when the node clears. Open **Millix · DAG** on the enter page for what Millix is and how the graph works.
- **PayPal** (**£1.99** a skin): pay `thedannymacdope@gmail.com`. **1%** of every PayPal payment goes to Daniel Alan Cornish and Blake Fitzgerald. Unlock when PayPal clears.
- **Card** (**£1.99** a skin): charge the card. Funds go to **D A Cornish**, account `73922859`, sort `20-01-09`, exp `03/31`. **1%** of every card charge goes to the developers. Unlock when that account clears.

- **Spectator seat** (100,000 MLX, Millix only): wait-room gallery. Type in chat. Cannot talk. Send MLX to the Millix node even if this tab is short on loaded MLX. 1% (1,000 MLX) goes to the developers.

**Daniel Alan Cornish** and **Blake Fitzgerald** take **1%** of every PayPal payment, every card charge, and every in-tab transaction (Millix DLC, spectator seats, Millix packs, Quad Lotto tickets and payouts, Millix Hourly stakes and payouts, Campus Book stakes and payouts, Quad Market sales). They take **1% of every escrow transaction**: Millix Hourly in and out of the campus node, and Quad Market listings that sell.

## Millix and the DAG

Millix (MLX) is a cryptocurrency on a **directed acyclic graph**, not a blockchain and not an ERC-20 token. Open **Millix · DAG** from the enter page for a live sketch: arrows only go forward, a random **proxy** node takes the fee, peers validate, then the transaction **hibernates**. Protocol notes follow [millix.org](https://www.millix.org/). This game is not millix.org.

- Genesis **20 January 2020**. All Millix was created then — not mined. millix.org does not sell it.
- Buy/sell and the explorer live at [millix.com](https://millix.com/). Fiat peg on this locker: **1,000,000 MLX = $0.18** ([fiatleak.com](https://fiatleak.com/)).
- [Tangled](https://tangled.com/) can run a Millix wallet. It is not a campus login.
- Campus escrow node is **not** your wallet. Save a personal receive address (starts with `1`) on Lotto for Hourly prizes.

## Quad Market

Open **Quad Market** from the enter page. List a DLC skin you do not want, or a leftover fountain item from a match. Campus listings sit on the board. Buy with coins. A listed good is held in escrow until a campus buyer takes it (about 14 seconds) or you pull it back. **1%** of every escrowed sale goes to Daniel Alan Cornish and Blake Fitzgerald.

## Campus Book

The wait room opens **Campus Book**. Even **1.90** on three markets:

- **Match winner** — MAGA Washington DC vs Antifa Seattle
- **Clock** — under / over 8:00
- **First tower** — which side takes the first tower

Stake **100 gold** a slip. Three markets each match. **One bet per hour** — pick one market, replace it until the match starts, then wait until the next hour for another. The book locks on lock-in, Watch this match, or Watch AI play from the wait room. Payouts land when a town falls. Leave the wait room (or leave campus mid-match) and the stake comes back. Watch AI from the enter page skips the wait room, so it skips the book. **1% of every bet** (stake and payout) goes to Daniel Alan Cornish and Blake Fitzgerald.

## Clans and Quad Lotto

Join **Rally Crimson**, **Bike Rack Bloc**, or **West Piazza Press**, or found a tag. It shows on MAGA seat 1.

**Quad Lotto**: pick six numbers from 1–40 (or Quick pick). A ticket is **100,000 MLX**, Millix only. Two hits pay 40,000 MLX, three 160,000, four 500,000, five 1,800,000, six is 8,000,000.

**Millix Hourly**: for Millix users. One draw every hour. Up to three winners. Stake 50 MLX to enter that hour. The stake sits in **escrow** on the campus Millix node (`1GsrgWH7ncasNDP1UVirAvSAY5tLWP3yyN0a015WcdWwYqGyRGdp3BmWc7rEyADG1h8UQot`) until the hour settles. Pot is every stake (you plus 21 other Millix users) plus Millix that rolled over. **1st 50%**, **2nd 30%**, **3rd 20%**, paid automatically to each winner’s Millix wallet. If a place has no winner, that share rolls into the next hour. If nobody hits, the whole pot rolls over. Save your receive address on Lotto. If you win with no wallet saved, the prize stays in escrow until you save one, then it sends. Qualify by holding MLX or clearing a Millix payment. **1% of every escrow in and every escrow out** that hour — your stake, the other twenty-one stakes, and every prize the node pays — goes to the developers.

## FAQ

Open **FAQ** in the tab for the full list. Short version:

- **Browser game.** MAGA holds Washington DC. Antifa holds Seattle. No client.
- **Free host.** Vercel Hobby. Site name is **MAGA vs Antifa**. Free URL is `maga-vs-antifa.vercel.app`. A custom .com is optional later if you buy it.
- **Matches are free.** Extra skins are **£1.99** on PayPal or card, or **40% off with Millix**. Spectator seats, lotto, Millix Hourly, and Campus Book use coins or MLX. The DLC Store wheel is one free spin a day. Not every spin is a winner.
- **Talk vs Type.** Players can both. Spectators type only. Gallery seats are 100,000 MLX, Millix only.
- **Account.** Facebook, Gmail, or email on the enter page. No Tangled social login. This locker is 192 gold/min. Tangled browser is 384.
- **Millix Hourly.** Millix users. 50 MLX stake held in escrow on the campus node. 1% of every escrow in and every escrow out to the developers. Up to three winners every hour. Vacant places roll Millix into the next pot. 50/30/20 split, auto-paid to your Millix wallet.
- **Campus Book.** Wait room. Three markets, 100 gold a slip, one bet per hour. Even 1.90 on the town, the clock, and first tower. Locks when the match starts. 1% of every bet to the developers.
- **1%.** Daniel Alan Cornish and Blake Fitzgerald take 1% of every bet (Campus Book, Millix Hourly including the other Millix users, Quad Lotto), **1% of every escrow transaction**, and 1% of every PayPal payment, card charge, and in-tab wallet transaction.
- **Locker.** This browser’s local storage. Clearing site data wipes it.
- **Anthem.** For now the soundtrack is **The Star-Spangled Banner**, played in this tab. The composition is public domain. No file to download. Spotify does not have to load. Music On / Off, Next (restarts the anthem), Volume, and the song name scrolling across a bar at the top. **Link Spotify** on that bar still pays **+1,000 gold once**. Mute on the HUD cuts the anthem. Combat keeps playing.
- **Sound card.** Mixer bottom-left. Click **Enter with sound**, **Find Game**, Practice, or Custom Game so the browser starts audio — that press plays the entrance sting and the anthem. Then set combat, desk, and music. Each kit has its own original swing, hit, and skill sting. Minions tick. A coin drops on every kill. All of that is royalty-free synth in this tab (oscillators and noise, no sample pack). Faders stay on this locker. **Play every sound** is the catalog.

## Controls

Arrows pan · RMB walk · A a creep or hero to lock that target · auto-attack if you have no lock · Z attack-move · hold T team mic · hold G all mic · Q W E R skills · B gift shop · Space snap camera · Esc pause. Click **Enter with sound** or **Find Game** so the browser starts audio — the entrance sting and The Star-Spangled Banner play on that press. Mute / Unmute cuts the anthem. Combat clinks, tings, coin drops, barks, and the ring announcer keep playing. Music On / Off, Next (restarts the anthem), and Volume sit on the bar across the top. Spectators type. They cannot Talk on the mic.
