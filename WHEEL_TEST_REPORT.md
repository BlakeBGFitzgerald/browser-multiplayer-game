# SPIN THE WHEEL — FULL ROSTER TEST

Test mode:
SANDBOX (`?wheel-test=1` only)

## Architecture (unchanged production)

The live campus wheel is **not** a three-hero daily rotation. Production `wheelSlices()` is every DLC skin plus a Miss wedge after every two skins. This run measured **156 slices: 104 skins + 52 Miss**. `pickWheelIndex(n)` is equal `Math.floor(Math.random() * n)` — no weight table.

The sandbox **overlays** three live `HEROES` plus **153 `[BOGUS TEST PRIZE]`** miss wedges onto that same slice count. Bogus slices are `miss: true`, never call `grantSkin`, never spend MILLIX, and never write `cu-wallet`. Production `wheel.ts`, DLC prices, roster, and ownership stay put.

This report does **not** call the wheel fair. It compares sandbox spins to the live picker on the configured slice count. Client `Math.random` is the production RNG.

## Summary (1,000,000 spins / day)

Total heroes:
30

Total test days:
10

Heroes per day:
3

Total simulated spins:
10000000

Free heroes tested:
16

DLC heroes tested:
14

MMA DLC tested:
6

Wildcard DLC tested:
8

Heroes missing from rotation:
none

Duplicate heroes:
none

Bogus entries tested:
153

Production wheel slices (unchanged):
156 · skins 104 · miss wedges 52

Expected hero-win rate:
1.9231%
(3 / 156 — not 30%. Production does not put only 10 wedges on the wheel.)

Observed hero-win rate:
1.9241%

Expected bogus-win rate:
98.0769%

Observed bogus-win rate:
98.0759%

Largest odds deviation:
maga-rogentor  Δ -0.0169pp  (exp 0.6410% obs 0.6241%)

Hero with largest positive deviation:
wild-icon  +0.0164pp

Hero with largest negative deviation:
maga-rogentor  -0.0169pp

RNG/weighting anomalies:
none flagged at 1pp / chi critical

Overall test status:
PASS

Live locker (`cu-wallet`) after the run:
untouched (null before and after in the isolated browser)

## 100,000 spins / day (repeatability baseline)

Same 10-day roster, 1,000,000 total sandbox spins, plus a separate 1,000,000-spin production-wheel pass and three 100,000-spin day-1 repeats.

Expected hero-win 1.9231% · observed 1.9109%
Expected bogus-win 98.0769% · observed 98.0891%
Largest hero deviation: lw-bitenten −0.0720pp (washed out at 1M to +0.0069pp)
Production miss: expected 33.3333% · observed 33.3801% · chi 163.21
Repeat day 1: 1.9330% / 1.9150% / 1.8430% hero-win — varies, stays near 1.92%
Live locker untouched: true
Elapsed ~126 ms

## 1,000,000 spins / day — per-day EXPECTED vs OBSERVED

DAY 1 / 10 · 1000000 spins · 3 heroes · 153 bogus · 156 slices
  Grump (FREE/free-maga) pos 19  expected 0.6410%  observed 0.6407%  Δ -0.0003
  Alex Groans (FREE/free-maga) pos 116  expected 0.6410%  observed 0.6382%  Δ -0.0028
  Joe Rogen (FREE/free-maga) pos 100  expected 0.6410%  observed 0.6241%  Δ -0.0169
  HERO WIN  expected 1.9231%  observed 1.9030%
  BOGUS WIN expected 98.0769%  observed 98.0970%
  chi-square 144.72

DAY 2 / 10 · 1000000 spins · 3 heroes · 153 bogus · 156 slices
  Elon Muck (FREE/free-maga) pos 98  expected 0.6410%  observed 0.6464%  Δ 0.0054
  Boris Johnstone (FREE/free-maga) pos 140  expected 0.6410%  observed 0.6274%  Δ -0.0136
  Russell Branded (FREE/free-maga) pos 3  expected 0.6410%  observed 0.6517%  Δ 0.0107
  HERO WIN  expected 1.9231%  observed 1.9255%
  BOGUS WIN expected 98.0769%  observed 98.0745%
  chi-square 145.82

DAY 3 / 10 · 1000000 spins · 3 heroes · 153 bogus · 156 slices
  Kanye Vest (FREE/free-maga) pos 51  expected 0.6410%  observed 0.6395%  Δ -0.0015
  JP Steers (FREE/free-maga) pos 23  expected 0.6410%  observed 0.6455%  Δ 0.0045
  Kamala Harass (FREE/free-antifa) pos 6  expected 0.6410%  observed 0.6333%  Δ -0.0077
  HERO WIN  expected 1.9231%  observed 1.9183%
  BOGUS WIN expected 98.0769%  observed 98.0817%
  chi-square 157.40

DAY 4 / 10 · 1000000 spins · 3 heroes · 153 bogus · 156 slices
  Bernie Sandbags (FREE/free-antifa) pos 145  expected 0.6410%  observed 0.6440%  Δ 0.0030
  Joe Biten (FREE/free-antifa) pos 98  expected 0.6410%  observed 0.6479%  Δ 0.0069
  Barack O'Drama (FREE/free-antifa) pos 139  expected 0.6410%  observed 0.6341%  Δ -0.0069
  HERO WIN  expected 1.9231%  observed 1.9260%
  BOGUS WIN expected 98.0769%  observed 98.0740%
  chi-square 154.64

DAY 5 / 10 · 1000000 spins · 3 heroes · 153 bogus · 156 slices
  The Young Turkeys (FREE/free-antifa) pos 18  expected 0.6410%  observed 0.6344%  Δ -0.0066
  Stephen Hocking (FREE/free-antifa) pos 144  expected 0.6410%  observed 0.6453%  Δ 0.0043
  Vaxxie Scientist (FREE/free-antifa) pos 34  expected 0.6410%  observed 0.6323%  Δ -0.0087
  HERO WIN  expected 1.9231%  observed 1.9120%
  BOGUS WIN expected 98.0769%  observed 98.0880%
  chi-square 160.25

DAY 6 / 10 · 1000000 spins · 3 heroes · 153 bogus · 156 slices
  Planet Defender (FREE/free-antifa) pos 153  expected 0.6410%  observed 0.6421%  Δ 0.0011
  Conor Macgregor (DLC/mma) pos 146  expected 0.6410%  observed 0.6400%  Δ -0.0010
  Khabib Nurmagoat (DLC/mma) pos 53  expected 0.6410%  observed 0.6382%  Δ -0.0028
  HERO WIN  expected 1.9231%  observed 1.9203%
  BOGUS WIN expected 98.0769%  observed 98.0797%
  chi-square 171.44

DAY 7 / 10 · 1000000 spins · 3 heroes · 153 bogus · 156 slices
  Jon Jonesy (DLC/mma) pos 88  expected 0.6410%  observed 0.6426%  Δ 0.0016
  Israel Adesanya-ish (DLC/mma) pos 26  expected 0.6410%  observed 0.6469%  Δ 0.0059
  Dustin Poirier-ish (DLC/mma) pos 90  expected 0.6410%  observed 0.6408%  Δ -0.0002
  HERO WIN  expected 1.9231%  observed 1.9303%
  BOGUS WIN expected 98.0769%  observed 98.0697%
  chi-square 139.93

DAY 8 / 10 · 1000000 spins · 3 heroes · 153 bogus · 156 slices
  Nate Diaz-ish (DLC/mma) pos 102  expected 0.6410%  observed 0.6316%  Δ -0.0094
  The Icon (DLC/wild) pos 30  expected 0.6410%  observed 0.6574%  Δ 0.0164
  The Enigma (DLC/wild) pos 68  expected 0.6410%  observed 0.6427%  Δ 0.0017
  HERO WIN  expected 1.9231%  observed 1.9317%
  BOGUS WIN expected 98.0769%  observed 98.0683%
  chi-square 163.42

DAY 9 / 10 · 1000000 spins · 3 heroes · 153 bogus · 156 slices
  The Cartoons (DLC/wild) pos 36  expected 0.6410%  observed 0.6447%  Δ 0.0037
  The Reality Dynasty (DLC/wild) pos 70  expected 0.6410%  observed 0.6552%  Δ 0.0142
  The Legend (DLC/wild) pos 68  expected 0.6410%  observed 0.6414%  Δ 0.0004
  HERO WIN  expected 1.9231%  observed 1.9413%
  BOGUS WIN expected 98.0769%  observed 98.0587%
  chi-square 166.93

DAY 10 / 10 · 1000000 spins · 3 heroes · 153 bogus · 156 slices
  The Entitlement (DLC/wild) pos 5  expected 0.6410%  observed 0.6381%  Δ -0.0029
  The Tech (DLC/wild) pos 19  expected 0.6410%  observed 0.6492%  Δ 0.0082
  Cézanne (DLC/wild) pos 2  expected 0.6410%  observed 0.6452%  Δ 0.0042
  HERO WIN  expected 1.9231%  observed 1.9325%
  BOGUS WIN expected 98.0769%  observed 98.0675%
  chi-square 167.70

Production wheel 1,000,000 spins (skins + Miss, equal pickWheelIndex):
miss expected 33.3333%  observed 33.2843%  chi 155.84

Repeat 100,000-spin days (3 runs, day 1 only):
RUN 1: hero-win 1.9860% · bogus 98.0140% · chi 153.98
RUN 2: hero-win 1.9180% · bogus 98.0820% · chi 168.85
RUN 3: hero-win 1.9010% · bogus 98.0990% · chi 132.79

## Rotation fairness

every live hero scheduled exactly once (30 / 30)
final day is a full group of 3
roster 30 % 3 == 0 — no remainder day; the 0/1/2-hero remainder paths still pass in the edge suite

## Cross-day wins per hero

Each hero appeared on exactly one simulated day (1,000,000 spin opportunities). Expected per-hero rate is 1/156 ≈ 0.6410%.

  maga-grumptor  Grump  FREE/free-maga  wins 6407  observed 0.6407%  Δ -0.0003
  maga-alexgroans  Alex Groans  FREE/free-maga  wins 6382  observed 0.6382%  Δ -0.0028
  maga-rogentor  Joe Rogen  FREE/free-maga  wins 6241  observed 0.6241%  Δ -0.0169
  maga-elonmolk  Elon Muck  FREE/free-maga  wins 6464  observed 0.6464%  Δ 0.0054
  maga-boris  Boris Johnstone  FREE/free-maga  wins 6274  observed 0.6274%  Δ -0.0136
  maga-brander  Russell Branded  FREE/free-maga  wins 6517  observed 0.6517%  Δ 0.0107
  maga-vestyt  Kanye Vest  FREE/free-maga  wins 6395  observed 0.6395%  Δ -0.0015
  maga-steers  JP Steers  FREE/free-maga  wins 6455  observed 0.6455%  Δ 0.0045
  lw-harass  Kamala Harass  FREE/free-antifa  wins 6333  observed 0.6333%  Δ -0.0077
  lw-sandbags  Bernie Sandbags  FREE/free-antifa  wins 6440  observed 0.6440%  Δ 0.0030
  lw-bitenten  Joe Biten  FREE/free-antifa  wins 6479  observed 0.6479%  Δ 0.0069
  lw-odramma  Barack O'Drama  FREE/free-antifa  wins 6341  observed 0.6341%  Δ -0.0069
  lw-youngturkey  The Young Turkeys  FREE/free-antifa  wins 6344  observed 0.6344%  Δ -0.0066
  lw-hocking  Stephen Hocking  FREE/free-antifa  wins 6453  observed 0.6453%  Δ 0.0043
  lw-vakxie  Vaxxie Scientist  FREE/free-antifa  wins 6323  observed 0.6323%  Δ -0.0087
  lw-climate  Planet Defender  FREE/free-antifa  wins 6421  observed 0.6421%  Δ 0.0011
  mma-macgregor  Conor Macgregor  DLC/mma  wins 6400  observed 0.6400%  Δ -0.0010
  mma-nurmagoat  Khabib Nurmagoat  DLC/mma  wins 6382  observed 0.6382%  Δ -0.0028
  mma-jonesy  Jon Jonesy  DLC/mma  wins 6426  observed 0.6426%  Δ 0.0016
  mma-adesanyaish  Israel Adesanya-ish  DLC/mma  wins 6469  observed 0.6469%  Δ 0.0059
  mma-poirierish  Dustin Poirier-ish  DLC/mma  wins 6408  observed 0.6408%  Δ -0.0002
  mma-diazish  Nate Diaz-ish  DLC/mma  wins 6316  observed 0.6316%  Δ -0.0094
  wild-icon  The Icon  DLC/wild  wins 6574  observed 0.6574%  Δ 0.0164
  wild-enigma  The Enigma  DLC/wild  wins 6427  observed 0.6427%  Δ 0.0017
  wild-cartoons  The Cartoons  DLC/wild  wins 6447  observed 0.6447%  Δ 0.0037
  wild-dynasty  The Reality Dynasty  DLC/wild  wins 6552  observed 0.6552%  Δ 0.0142
  wild-legend  The Legend  DLC/wild  wins 6414  observed 0.6414%  Δ 0.0004
  wild-karen  The Entitlement  DLC/wild  wins 6381  observed 0.6381%  Δ -0.0029
  wild-butter  The Tech  DLC/wild  wins 6492  observed 0.6492%  Δ 0.0082
  wild-cezanne  Cézanne  DLC/wild  wins 6452  observed 0.6452%  Δ 0.0042

No hero was favoured or disadvantaged beyond sampling noise. DLC vs FREE did not change the landing rate.

## Random position assignment

Production does **not** shuffle slice order (DLC list + Miss). The sandbox picks three unique slots with `pickWheelIndex` so the overlay can measure whether visual position changes 1/N.

10,000 day-1 rebuilds · placement chi 420.37 (df ≈ 465) — consistent with uniform unique slots.
Longest same-index run in 100,000 spins: 3 (expected ~2.3). Longest hero-win run: 3.

## Edge suite

PASS  zero heroes
PASS  one hero
PASS  two heroes
PASS  three heroes
PASS  four heroes last day remainder (days 2, last maga-elonmolk)
PASS  roster divisible by 3 or remainder kept (30 heroes · 10 days)
PASS  DLC-only MMA group (6)
PASS  free-only group (16)
PASS  no missing live heroes
PASS  no duplicate schedule
PASS  scheduled count equals roster (30 / 30)
PASS  day wheel matches production slice count (156)
PASS  exactly three real heroes on a full day (3 heroes · 153 bogus)
PASS  bogus never maps a live hero id
PASS  final day keeps remainder heroes
PASS  empty wheel pick is 0
PASS  invalid index clamp uses live picker
PASS  no duplicate hero ids in registry
PASS  single-slice wheel always 0
PASS  missing hero definition
PASS  missing hero asset (PIXEL_KITS covers live roster)
PASS  duplicate wheel entry (bogus ids unique)
PASS  invalid wheel entry clamp
PASS  empty wheel stays empty
PASS  zero-weight / weighted odds not in production (equal 1/N)
PASS  blank hero id fails safely on the test wheel
PASS  duplicate hero id in a test roster is flagged

Retired / placeholder / debug kits stay out of the rotation because they are not in `HEROES`. The production wheel does not treat them as playable prizes.

## Cleanup

- Bogus prizes exist only inside the sandbox overlay. They are not in production `wheelSlices()`.
- Reset / Leave test mode deletes `cu-wheel-sandbox`.
- Simulated day and spin counters do not touch the campus calendar.
- Live locker, MILLIX, ownership, DLC prices, hero balance, and matchmaking were not written.

## How to re-run

Open [http://127.0.0.1:43147/?wheel-test=1](http://127.0.0.1:43147/?wheel-test=1). Use **100,000 spins / day** or **1,000,000 spins / day**. Normal players never see this page.
