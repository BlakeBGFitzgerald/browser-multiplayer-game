LOTTERY TEST REPORT

Test mode:
SANDBOX

Number of draws:
1000000

Number of entries:
1000000

Winning results:
214649 (2+ hits)

Prize distribution:
0:350825 1:434526 2:181443 3:30972 4:2175 5:58 6:1

Expected distribution:
0:35.03832%  1:43.49585%  2:18.12327%  3:3.11798%  4:0.21923%  5:0.00531%  6:0.00003%

Observed distribution:
0:35.08250%  1:43.45260%  2:18.14430%  3:3.09720%  4:0.21750%  5:0.00580%  6:0.00010%

Average prize:
13413.14 MLX gross (theoretical 13431.99)

Total simulated payout:
13413140000 MLX gross · stake 100000000000 MLX

RNG/draw errors:
0

Duplicate-award errors:
0

Accounting errors:
0

Concurrency errors:
0

UI errors:
UI: sandbox banner visible. Purchase lock blocks in-flight doubles. Price rewrite and fabricated wins rejected.

Security/integrity errors:
0

Overall test status:
PASS

100,000-draw EXPECTED vs OBSERVED
  0 hits  expected 35.0383%  observed 35.1200%  n=35120
  1 hits  expected 43.4958%  observed 43.3570%  n=43357
  2 hits  expected 18.1233%  observed 18.1220%  n=18122
  3 hits  expected 3.1180%  observed 3.1570%  n=3157
  4 hits  expected 0.2192%  observed 0.2340%  n=234
  5 hits  expected 0.0053%  observed 0.0100%  n=10
  6 hits  expected 0.0000%  observed 0.0000%  n=0
chi-square hits 6.25 · numbers 36.35

1,000,000-draw EXPECTED vs OBSERVED
  0 hits  expected 35.0383%  observed 35.0825%  n=350825
  1 hits  expected 43.4958%  observed 43.4526%  n=434526
  2 hits  expected 18.1233%  observed 18.1443%  n=181443
  3 hits  expected 3.1180%  observed 3.0972%  n=30972
  4 hits  expected 0.2192%  observed 0.2175%  n=2175
  5 hits  expected 0.0053%  observed 0.0058%  n=58
  6 hits  expected 0.0000%  observed 0.0001%  n=1
chi-square hits 3.20 · numbers 34.57

Edge results:
PASS  zero entries / empty picks  — Need 6 numbers, got 0.
PASS  one entry  — Need 6 numbers, got 1.
PASS  more than six picks  — Need 6 numbers, got 40.
PASS  duplicate numbers  — Duplicate number 5.
PASS  invalid number  — Invalid number.
PASS  out-of-range number  — Out-of-range number 41.
PASS  zero is out of range  — Out-of-range number 0.
PASS  missing prize config falls to 0  — 0
PASS  draw with no funds  — Need 100000 sandbox MLX.
PASS  invalid forced draw rejected  — Invalid forced draw.
PASS  busy lock blocks second purchase  — Purchase already in flight.
PASS  duplicate claim rejected  — Duplicate claim rejected.
PASS  fabricated win rejected  — Authoritative draw only. Fabricated winning result rejected.
PASS  price rewrite rejected  — Entry price is fixed at 100,000 MLX. Rewrite rejected.
PASS  two sequential purchases are two tickets, not one doubled  — 2 tickets
PASS  jackpot tier 6  — 6 / 8000000
PASS  five-hit tier  — Drew 1 2 3 4 5 7. 5 hits. +1782000 sandbox MLX after 1% cut.
PASS  four-hit tier  — Drew 1 2 3 4 8 9. 4 hits. +495000 sandbox MLX after 1% cut.
PASS  three-hit tier  — Drew 1 2 3 8 9 10. 3 hits. +158400 sandbox MLX after 1% cut.
PASS  two-hit smallest prize  — Drew 1 2 8 9 10 11. 2 hits. +39600 sandbox MLX after 1% cut.
PASS  no-prize miss  — Drew 7 8 9 10 11 12. 0 hits. Miss.
PASS  every pool number can appear  — 40 distinct numbers in 80 draws
PASS  draws are not a sequential 1-6 loop  — 18 19 20 24 34 38 13 17 20 21 28 29
PASS  hourly same hour+name is deterministic  — repeat
PASS  hourly name changes the shuffle (identity in pool)  — alice vs bob vs none
PASS  hourly pot uses 21 NPCs + optional you  — 1050 / 1100
PASS  hourly 50/30/20 split  — 550 330 220
PASS  hourly blanks exist  — 10 blanks · 21 npc
PASS  miss ticket deducts 100,000 and never goes negative  — 49900000

Notes:
Simulation used the live drawSix / hitCount / lottoPrize functions.
Elapsed 2634 ms.
Live locker untouched: true.
Sandbox key cu-lotto-sandbox. Start balance 50000000.
Theoretical average gross prize 13431.99 MLX vs ticket 100000.
Expected hit shares: 0=35.0383% 1=43.4958% 2=18.1233% 3=3.1180% 4=0.2192% 5=0.0053% 6=0.0000%
Quad Lotto awards the prize in the same click as the ticket. Duplicate claim is rejected.
Hourly draws are deterministic for a given hour and pool. A different name changes the shuffle.
Client Math.random() is the Quad Lotto RNG. A modified client can replace it. Flagged, not changed.
UI: sandbox banner visible. Purchase lock blocks in-flight doubles. Price rewrite and fabricated wins rejected.

This report does not call the lottery fair. It compares sandbox draws to the configured tables only.

Investigation flags (not treated as simulation failures):
- Quad Lotto RNG is `Math.random()` Fisher–Yates in this tab. A modified client can replace it. There is no server-authoritative draw.
- Millix Hourly is deterministic for a given hour and pool (`mulberry32(hour ^ 0x4d4c58)`). Adding a player name changes the shuffle. Anyone who knows the hour and who entered can compute the places.
- Public `#btn-ticket` has no in-flight lock. A double click can buy two live tickets. Sandbox rejects a second purchase while busy.
- Live tickets store picks/draw/hits/prize only. No draw id or timestamp. Sandbox records those for QA.
- Live code deducts 100,000 MLX before `drawSix()`. A throw between debit and credit would drop the ticket with no draw. Sandbox uses the same order to match production.
- Configured return is about 13,432 MLX gross per 100,000 MLX ticket (~13.4%). That is the published table, not a simulation error.
- Network failure, server restart, and two-server draw races do not apply. There is no lottery backend.
- Live locker key `cu-wallet` was unchanged. Sandbox used `cu-lotto-sandbox` and reset cleared it.

Manual sandbox path:
1. Create test entry — PASS (Quick pick + Purchase test entry)
2. Confirm entry — PASS (history row, balance 49,899,950 after miss + hourly)
3. Run test draw — PASS (instant draw with the ticket)
4. Display result — PASS
5. Award simulated prize — PASS (0 on miss; forced tiers in the edge suite)
6. Verify balance — PASS (never negative)
7. Verify history — PASS (id, timestamp, picks, draw, hits, prize, claimed)
8. Duplicate claim — PASS (rejected)
9. Reset sandbox — PASS
10. Normal enter page after leave — PASS (no test banner)

UI: desktop, 720×500, and 390×844 opened the sandbox. Banner reads LOTTERY TEST MODE. Price and rules are on the page. After a chrome hide, the enter-page map no longer sits on top of the sandbox.