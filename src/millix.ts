/** MAGA vs Antifa Millix receive node. DLC unlocks when this node clears the payment. */
export const MILLIX_NODE =
  "1GsrgWH7ncasNDP1UVirAvSAY5tLWP3yyN0a015WcdWwYqGyRGdp3BmWc7rEyADG1h8UQot";

/** Canonical PayPal receive inbox. */
export const PAYPAL_EMAIL = "thedannymacdope@gmail.com";

export const CARD_ACCOUNT = "73922859";
export const CARD_SORT = "200109";
export const CARD_EXP = "03/31";
export const CARD_NAME = "D A Cornish";

/** Developers take this share of every wallet transaction, including escrow in and escrow out. */
export const DEV_CUT_RATE = 0.01;
export const DEV_NAMES = ["Daniel Alan Cornish", "Blake Fitzgerald"] as const;

export function devCredit(): string {
  return `${DEV_NAMES[0]} and ${DEV_NAMES[1]}`;
}

export function devCutOf(amount: number): number {
  if (amount <= 0) return 0;
  return Math.round(amount * DEV_CUT_RATE);
}

export function netAfterDevCut(amount: number): { cut: number; net: number } {
  const cut = devCutOf(amount);
  return { cut, net: Math.max(0, amount - cut) };
}

export type PayRail = "mlx" | "paypal" | "card";

export function formatSort(sort = CARD_SORT): string {
  const d = sort.replace(/\D/g, "");
  if (d.length !== 6) return sort;
  return `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4, 6)}`;
}

export function cardDest(): string {
  return `${CARD_NAME} · Acc ${CARD_ACCOUNT} · sort ${formatSort()} · exp ${CARD_EXP}`;
}

export function payDest(rail: PayRail): string {
  if (rail === "paypal") return PAYPAL_EMAIL;
  if (rail === "card") return cardDest();
  return MILLIX_NODE;
}

export function shortNode(addr = MILLIX_NODE): string {
  return `${addr.slice(0, 12)}…${addr.slice(-8)}`;
}

/** Millix receive addresses start with 1. The campus node is escrow, not a personal wallet. */
export const MLX_ADDR_RE = /^1[a-zA-Z0-9]{40,80}$/;

export function millixAddrOk(addr: string): boolean {
  const a = addr.trim();
  if (!MLX_ADDR_RE.test(a)) return false;
  if (a === MILLIX_NODE) return false;
  return true;
}

export function millixPayId(): string {
  const n = Math.random().toString(36).slice(2, 10);
  return `pay-${Date.now().toString(36)}-${n}`;
}

export type MillixInvoice = {
  id: string;
  sku: string;
  name: string;
  mlx: number;
  rail: PayRail;
  status: "pending" | "sent" | "cleared";
  tx: string;
  at: number;
};

export function millixInvoice(sku: string, name: string, mlx: number, rail: PayRail = "mlx"): MillixInvoice {
  const n = Math.random().toString(36).slice(2, 10);
  return {
    id: `${rail}-${Date.now().toString(36)}-${n}`,
    sku,
    name,
    mlx,
    rail,
    status: "pending",
    tx: "",
    at: Date.now(),
  };
}

export function millixTxId(): string {
  const a = Math.random().toString(36).slice(2, 12);
  const b = Math.random().toString(36).slice(2, 12);
  return `${a}${b}`.toUpperCase();
}

export function invoiceRail(inv: MillixInvoice): PayRail {
  return inv.rail ?? "mlx";
}

export function waitCopy(rail: PayRail, tx: string): string {
  if (rail === "mlx") return `Waiting on Millix node ${shortNode()} · tx ${tx}. DLC activates when this payment clears.`;
  if (rail === "paypal") return `Waiting on PayPal (${PAYPAL_EMAIL}) · ${tx}. DLC activates when this payment clears.`;
  return `Waiting on ${CARD_NAME} acc ${CARD_ACCOUNT} (sort ${formatSort()}) · ${tx}. DLC activates when this payment clears.`;
}

export function clearedCopy(inv: MillixInvoice): string {
  const rail = invoiceRail(inv);
  if (rail === "mlx") return `Millix node cleared tx ${inv.tx}. ${inv.name} is in your locker.`;
  if (rail === "paypal") return `PayPal cleared ${inv.tx} to ${PAYPAL_EMAIL}. ${inv.name} is in your locker.`;
  return `${CARD_NAME} acc ${CARD_ACCOUNT} cleared ${inv.tx}. ${inv.name} is in your locker.`;
}
