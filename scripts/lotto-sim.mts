import { writeFileSync } from "node:fs";
import { expectedPrizeGross, formatReport, runEdgeSuite, simulateDraws } from "../src/lottoCore.ts";

const fixed = [1, 2, 3, 4, 5, 6];
const t0 = Date.now();
const sim100k = simulateDraws(100_000, fixed, `cli-100k-${t0}`);
const sim1m = simulateDraws(1_000_000, fixed, `cli-1m-${t0}`);
const edges = runEdgeSuite();
const ms = Date.now() - t0;
const notes = [
  "CLI used the same drawSix / hitCount / lottoPrize as the game.",
  `Elapsed ${ms} ms.`,
  "Live locker was not opened. No cu-wallet I/O in this process.",
  `Theoretical average gross prize ${expectedPrizeGross().toFixed(2)} MLX.`,
  "UI: open ?lotto-test=1 for the marked sandbox page.",
  "Client Math.random() is the Quad Lotto RNG. Hourly is deterministic per hour and pool.",
];
const text = formatReport(sim100k, sim1m, edges, notes);
writeFileSync(new URL("../LOTTERY_TEST_REPORT.md", import.meta.url), text);
process.stdout.write(`${text}\n\nWrote LOTTERY_TEST_REPORT.md in ${ms} ms.\n`);
