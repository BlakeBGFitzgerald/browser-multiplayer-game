/**
 * Ability icon registry. One scene per hero id and slot.
 * A missing key throws. Cooldown and ready states are drawn by the HUD, not baked in.
 */

import { ABILITY_N, Icon, drawOp, type FactionKind, type MatName, type Op } from "./abilityIconDraw.ts";
import { HEROES, isHooliId } from "./heroes.ts";
import { mechById, type MechSpec } from "./mechs.ts";

export { ABILITY_N };

export type AbilitySlot = "P" | "Q" | "W" | "E" | "R";

const BG = "#14110e";

const SCENES: Record<string, Op[]> = {
  "maga-grumptor:P": [["tally", 16, 22, "red", 5, 1]],
  "maga-grumptor:Q": [["mega", 8, 24, "red"], ["wedge", 30, 32, "red", 22, 12]],
  "maga-grumptor:W": [["banners", 8, 16, "red"], ["speed", 40, 34, "#f0c14a"]],
  "maga-grumptor:E": [["gavel", 10, 22, "gold"], ["stars", 44, 22, 0.4], ["podium", 28, 30, "navy"]],
  "maga-grumptor:R": [["burst", 32, 32, "red", 18], ["tally", 8, 36, "gold", 5, 1], ["sparks", 32, 32, "#ffe08a", 10, 0.2]],

  "maga-alexgroans:P": [["papers", 18, 16, "paper", 4], ["folder", 28, 28, "orange"]],
  "maga-alexgroans:Q": [["mega", 8, 22, "orange"], ["bolt", 28, 28, "orange", 22, -0.15]],
  "maga-alexgroans:W": [["drops", 14, 12, "paper", 8], ["papers", 18, 28, "orange", 3]],
  "maga-alexgroans:E": [["glass", 8, 18, "orange"], ["smoke", 34, 28, "white"]],
  "maga-alexgroans:R": [["bomb", 12, 18, "black"], ["papers", 34, 14, "paper", 3], ["sparks", 28, 36, "#ffb020", 8, 0.6]],

  "maga-rogentor:P": [["mic", 14, 14, "gold"], ["mug", 34, 22, "tan"], ["heart", 36, 8, "green", 0.7]],
  "maga-rogentor:Q": [["mic", 10, 16, "gold"], ["bolt", 22, 28, "gold", 26, -0.2]],
  "maga-rogentor:W": [["mug", 8, 18, "tan"], ["mug", 28, 22, "cream"], ["heal", 40, 16, "green", 0.8]],
  "maga-rogentor:E": [["smoke", 18, 20, "white"], ["mic", 38, 28, "gold"]],
  "maga-rogentor:R": [["mic", 22, 8, "gold"], ["burst", 32, 36, "gold", 16], ["sparks", 32, 34, "#fff6c8", 9, 0.1]],

  "maga-quirk:P": [["chevs", 14, 30, "#f0c14a", 3, 10], ["board", 30, 12, "gold"]],
  "maga-quirk:Q": [["board", 6, 18, "gold"], ["wedge", 26, 30, "orange", 24, 11]],
  "maga-quirk:W": [["chevs", 8, 30, "#ffe08a", 4, 11], ["boot", 36, 18, "tan"]],
  "maga-quirk:E": [["board", 8, 16, "cream"], ["speed", 40, 32, "#f0c14a"]],
  "maga-quirk:R": [["chevs", 6, 34, "#fff6c8", 3, 8], ["banners", 28, 10, "gold"], ["sparks", 46, 28, "#ffb020", 7, 1.1]],

  "maga-tommy:P": [["shield", 20, 14, "red", 1.15], ["mega", 34, 28, "black"]],
  "maga-tommy:Q": [["mega", 8, 16, "red"], ["stars", 42, 24, 0.2]],
  "maga-tommy:W": [["camera", 8, 16, "black"], ["smoke", 36, 26, "navy"]],
  "maga-tommy:E": [["mega", 6, 20, "orange"], ["shield", 32, 16, "red", 1]],
  "maga-tommy:R": [["chevs", 6, 36, "#ff7a72", 3, 9], ["boot", 34, 14, "leather"], ["sparks", 46, 30, "#ffe08a", 8, 0.4]],

  "maga-elonmolk:P": [["rocket", 10, 22, "steel"], ["chevs", 36, 28, "#69f0ae", 2, 8]],
  "maga-elonmolk:Q": [["rocket", 8, 20, "steel"], ["flame", 6, 28, 1.2], ["chevs", 36, 24, "#e4eaf0", 2, 8]],
  "maga-elonmolk:W": [["drone", 8, 16, "steel"], ["bolt", 28, 30, "green", 20, 0.4]],
  "maga-elonmolk:E": [["gear", 18, 28, "steel"], ["speed", 44, 30, "#69f0ae"]],
  "maga-elonmolk:R": [["car", 8, 22, "steel"], ["rocket", 30, 12, "white"], ["sparks", 40, 36, "#69f0ae", 8, 0.8]],

  "maga-boris:P": [["bricks", 12, 18, "tan", 3, 3], ["shield", 36, 20, "blue", 0.7]],
  "maga-boris:Q": [["scroll", 6, 16, "gold"], ["wedge", 26, 30, "blue", 24, 12]],
  "maga-boris:W": [["cable", 8, 14], ["chevs", 28, 36, "#8ab4f8", 2, 10]],
  "maga-boris:E": [["bricks", 8, 16, "red", 4, 4], ["shield", 36, 14, "blue", 0.85]],
  "maga-boris:R": [["arch", 10, 12, "tan"], ["burst", 34, 34, "blue", 14], ["sparks", 32, 28, "#ffe08a", 8, 0.3]],

  "maga-brander:P": [["pins", 14, 14], ["gem", 36, 20, "gold", 0.9]],
  "maga-brander:Q": [["mega", 8, 18, "tan"], ["stars", 42, 20, 1.2]],
  "maga-brander:W": [["chain", 8, 18, "steel"], ["smoke", 34, 28, "violet"]],
  "maga-brander:E": [["paw", 10, 16, "orange"], ["heal", 34, 18, "green", 1]],
  "maga-brander:R": [["pins", 8, 12], ["bolt", 22, 28, "red", 24, -0.1], ["sparks", 44, 24, "#ff7a72", 7, 0.9]],

  "maga-vestyt:P": [["hood", 16, 14, "cream"], ["speed", 44, 36, "#f0c14a"]],
  "maga-vestyt:Q": [["book", 6, 16, "black"], ["wedge", 28, 32, "gold", 22, 10]],
  "maga-vestyt:W": [["sneaker", 8, 22, "white", 1], ["chevs", 32, 28, "#ffe08a", 2, 10]],
  "maga-vestyt:E": [["candle", 12, 16], ["candle", 24, 20], ["speed", 44, 32, "#f0c14a"]],
  "maga-vestyt:R": [["rays", 16, 28, "gold"], ["candle", 36, 12], ["sparks", 34, 34, "#fff6c8", 9, 0.15]],

  "maga-steers:P": [["shield", 18, 14, "gold", 1.05], ["mic", 38, 26, "black"]],
  "maga-steers:Q": [["mic", 6, 16, "gold"], ["flame", 28, 28, 1.1], ["wedge", 30, 34, "orange", 20, 9]],
  "maga-steers:W": [["chevs", 8, 30, "#ffe08a", 3, 12], ["board", 34, 12, "gold"]],
  "maga-steers:E": [["rays", 12, 30, "gold"], ["shield", 32, 14, "cream", 0.9]],
  "maga-steers:R": [["mic", 8, 12, "gold"], ["chevs", 28, 36, "#fff6c8", 2, 10], ["sparks", 44, 22, "#ffb020", 8, 0.5]],

  "maga-ricky:P": [["chair", 14, 18, "orange"], ["shield", 40, 16, "steel", 0.55]],
  "maga-ricky:Q": [["chair", 6, 16, "orange"], ["chalk", 28, 28, "white"], ["wedge", 32, 22, "cream", 18, 8]],
  "maga-ricky:W": [["chair", 10, 16, "orange"], ["chevs", 34, 30, "#ffc080", 3, 8]],
  "maga-ricky:E": [["chair", 12, 20, "orange"], ["dome", 36, 22, "steel"]],
  "maga-ricky:R": [["chair", 6, 18, "orange"], ["bell", 32, 10, "gold"], ["sparks", 46, 32, "#ffe08a", 8, 0.7]],

  "maga-hooli:P": [["stud", 14, 28, 0.2], ["stud", 28, 22, -0.4], ["stud", 40, 30, 0.5], ["stars", 46, 16, 0.8]],
  "maga-hooli:Q": [["stud", 12, 30, -0.1], ["bolt", 24, 28, "steel", 24, -0.15]],
  "maga-hooli:W": [["chevs", 8, 34, "#ff9ec4", 3, 9], ["sneaker", 34, 16, "pink", 1]],
  "maga-hooli:E": [["record", 18, 30, "pink"], ["speed", 46, 30, "#ff9ec4"]],
  "maga-hooli:R": [["rifle", 6, 28, 1], ["stud", 46, 26, 0], ["sparks", 50, 24, "#fffef8", 6, 0.2]],

  "maga-bushed:P": [["ranch", 14, 16, "tan"], ["shield", 38, 18, "wood", 0.7]],
  "maga-bushed:Q": [["case", 10, 16, "tan"], ["stars", 42, 22, 0.6]],
  "maga-bushed:W": [["ranch", 8, 14, "wood"], ["shield", 34, 16, "tan", 1]],
  "maga-bushed:E": [["map", 8, 18, "green"], ["smoke", 36, 28, "teal"]],
  "maga-bushed:R": [["arch", 8, 10, "tan"], ["burst", 36, 36, "gold", 14], ["sparks", 32, 30, "#ffe08a", 8, 1.2]],

  "lw-harass:P": [["ribbons", 12, 14, "violet"], ["heal", 40, 28, "green", 0.7]],
  "lw-harass:Q": [["ribbons", 6, 16, "violet"], ["wedge", 26, 32, "pink", 24, 11]],
  "lw-harass:W": [["tape", 8, 22, "gold"], ["smoke", 36, 30, "navy"]],
  "lw-harass:E": [["heal", 18, 18, "green", 1.2], ["dome", 36, 28, "violet"]],
  "lw-harass:R": [["podium", 8, 16, "violet"], ["ribbons", 28, 12, "pink"], ["sparks", 40, 36, "#c8b0f0", 8, 0.4]],

  "lw-sandbags:P": [["mitten", 12, 16, "teal"], ["mitten", 30, 18, "navy"], ["heart", 22, 8, "red", 0.6]],
  "lw-sandbags:Q": [["mitten", 8, 14, "teal"], ["shield", 30, 18, "red", 1]],
  "lw-sandbags:W": [["coins", 8, 16, "gold"], ["stars", 42, 24, 0.9]],
  "lw-sandbags:E": [["rose", 12, 12], ["heal", 34, 20, "green", 1]],
  "lw-sandbags:R": [["flame", 16, 20, 1.6], ["chevs", 30, 36, "#ff7a72", 2, 10], ["sparks", 40, 22, "#ffe08a", 8, 0.25]],

  "lw-bitenten:P": [["heart", 10, 20, "ice", 0.7], ["heart", 26, 16, "blue", 0.7], ["heart", 40, 22, "green", 0.55]],
  "lw-bitenten:Q": [["slick", 10, 24, "ice"], ["smoke", 36, 18, "blue"]],
  "lw-bitenten:W": [["bricks", 8, 16, "steel", 3, 3], ["shield", 36, 18, "navy", 0.9]],
  "lw-bitenten:E": [["scoop", 16, 12], ["heal", 40, 22, "green", 0.75]],
  "lw-bitenten:R": [["eclipse", 30, 28], ["heal", 14, 16, "green", 1.1], ["sparks", 44, 18, "#b8e8f4", 7, 0.5]],

  "lw-odramma:P": [["sun", 32, 30, "gold"]],
  "lw-odramma:Q": [["bolt", 12, 32, "blue", 32, -0.35], ["sun", 44, 16, "gold"]],
  "lw-odramma:W": [["glass", 8, 18, "blue"], ["smoke", 36, 28, "navy"]],
  "lw-odramma:E": [["flame", 16, 22, 1.3], ["heal", 34, 18, "gold", 0.9]],
  "lw-odramma:R": [["sun", 30, 30, "gold"], ["burst", 32, 32, "blue", 16], ["sparks", 32, 32, "#fff6c8", 10, 0.05]],

  "lw-youngturkey:P": [["stack", 12, 22, "green"], ["stack", 28, 18, "gold"], ["stack", 42, 24, "teal"]],
  "lw-youngturkey:Q": [["coins", 8, 14, "gold"], ["smoke", 34, 28, "green"]],
  "lw-youngturkey:W": [["drops", 12, 10, "green", 8], ["leaf", 36, 30, "green", 0.6]],
  "lw-youngturkey:E": [["stack", 8, 20, "green"], ["heal", 32, 16, "teal", 1]],
  "lw-youngturkey:R": [["bolt", 10, 30, "green", 30, -0.2], ["board", 34, 12, "gold"], ["sparks", 46, 28, "#b0e080", 7, 1]],

  "lw-hocking:P": [["chair", 16, 20, "violet"], ["orbit", 40, 22, "ice"]],
  "lw-hocking:Q": [["chair", 6, 22, "violet"], ["spiral", 40, 26, "blue"]],
  "lw-hocking:W": [["chair", 6, 24, "steel"], ["chair", 32, 12, "violet"], ["chevs", 22, 40, "#c8b0f0", 2, 8]],
  "lw-hocking:E": [["chair", 6, 20, "violet"], ["beam", 28, 28, 54, 18, "ice"]],
  "lw-hocking:R": [["hole", 36, 30, 12], ["chair", 6, 22, "violet"], ["sparks", 36, 30, "#c8b0f0", 8, 0.3]],

  "lw-vakxie:P": [["flask", 16, 14, "green"], ["papers", 32, 26, "paper", 2]],
  "lw-vakxie:Q": [["syringe", 8, 18, "green"], ["bolt", 30, 30, "green", 18, 0.2]],
  "lw-vakxie:W": [["chart", 8, 16, "green"], ["smoke", 36, 26, "white"]],
  "lw-vakxie:E": [["flask", 10, 14, "teal"], ["heal", 34, 18, "green", 1]],
  "lw-vakxie:R": [["map", 6, 16, "green"], ["heal", 34, 14, "teal", 1.15], ["syringe", 30, 30, "green"]],

  "lw-climate:P": [["dome", 22, 24, "teal"], ["plant", 34, 18, "green"]],
  "lw-climate:Q": [["stack", 10, 16, "black"], ["smoke", 28, 14, "white"], ["stars", 44, 28, 0.3]],
  "lw-climate:W": [["dome", 30, 26, "orange"], ["flame", 30, 18, 0.9]],
  "lw-climate:E": [["drops", 12, 12, "green", 7], ["plant", 36, 22, "green"]],
  "lw-climate:R": [["thermo", 10, 12, "red"], ["burst", 38, 32, "teal", 14], ["sparks", 38, 30, "#80e0d0", 8, 0.6]],

  "lw-journalist:P": [["folder", 16, 16, "black"], ["camera", 34, 26, "steel"]],
  "lw-journalist:Q": [["papers", 6, 16, "paper", 2], ["bolt", 22, 28, "white", 26, -0.1]],
  "lw-journalist:W": [["glass", 8, 16, "ice"], ["smoke", 34, 28, "navy"]],
  "lw-journalist:E": [["stairs", 8, 16, "tan"], ["chevs", 32, 28, "#eceff1", 2, 10]],
  "lw-journalist:R": [["camera", 8, 14, "black"], ["bolt", 28, 30, "gold", 20, -0.05], ["sparks", 46, 20, "#fffef8", 7, 0.4]],

  "mma-macgregor:P": [["glove", 22, 30, "green", 1, 0.8], ["chevs", 38, 24, "#b0e080", 2, 8]],
  "mma-macgregor:Q": [["glove", 18, 32, "green", 1, 1.2], ["sparks", 48, 28, "#e8ffd0", 6, 0.1]],
  "mma-macgregor:W": [["mega", 12, 18, "green"], ["wedge", 32, 30, "gold", 16, 8]],
  "mma-macgregor:E": [["glove", 10, 28, "red", 1, 0.62], ["arm", 24, 34, "green"], ["stars", 20, 14, 0.7]],
  "mma-macgregor:R": [["glove", 16, 26, "green", 1, 1.25], ["chevs", 36, 38, "#fff6c8", 2, 8], ["sparks", 46, 22, "#ffe08a", 9, 0.35]],

  "mma-nurmagoat:P": [["mat", 12, 28, "red"], ["heart", 34, 12, "red", 0.75]],
  "mma-nurmagoat:Q": [["mat", 8, 32, "red"], ["legs", 16, 10, "navy"], ["stars", 44, 16, 1.4]],
  "mma-nurmagoat:W": [["mat", 8, 30, "navy"], ["torso", 22, 12, "red"], ["smoke", 40, 16, "white"]],
  "mma-nurmagoat:E": [["fence", 8, 12, "steel"], ["chevs", 32, 30, "#ff7a72", 2, -8]],
  "mma-nurmagoat:R": [["fence", 16, 8, "red"], ["burst", 32, 34, "red", 15], ["sparks", 32, 32, "#ffe08a", 8, 0.9]],

  "mma-jonesy:P": [["tally", 10, 22, "gold", 5, 1], ["elbow", 36, 36, "tan", 14]],
  "mma-jonesy:Q": [["elbow", 8, 40, "gold", 28], ["wedge", 22, 24, "tan", 18, 8]],
  "mma-jonesy:W": [["heel", 10, 16, "gold"], ["chevs", 34, 32, "#ffe08a", 2, 9]],
  "mma-jonesy:E": [["elbow", 8, 36, "tan", 16], ["speed", 44, 28, "#f0c14a"]],
  "mma-jonesy:R": [["belt", 8, 16, "gold"], ["burst", 36, 36, "gold", 14], ["sparks", 36, 34, "#fff6c8", 8, 0.2]],

  "mma-adesanyaish:P": [["ghost", 22, 30, "olive"]],
  "mma-adesanyaish:Q": [["ghost", 12, 28, "olive"], ["bolt", 30, 26, "olive", 18, -0.2]],
  "mma-adesanyaish:W": [["speed", 20, 30, "#a8c070"], ["smoke", 38, 22, "olive"]],
  "mma-adesanyaish:E": [["chevs", 10, 24, "#e4f0c8", 2, 12], ["boot", 36, 28, "olive"]],
  "mma-adesanyaish:R": [["glove", 14, 30, "olive", 1, 1.05], ["bolt", 32, 24, "gold", 16, -0.25], ["sparks", 48, 22, "#ffe08a", 7, 1.3]],

  "mma-poirierish:P": [["gem", 22, 16, "ice", 1.3], ["cracks", 20, 28, "white"]],
  "mma-poirierish:Q": [["glove", 12, 30, "tan", 1, 0.85], ["glove", 30, 24, "red", 1, 0.85]],
  "mma-poirierish:W": [["torso", 10, 14, "tan"], ["glove", 28, 28, "red", -1, 0.8], ["stars", 44, 16, 0.5]],
  "mma-poirierish:E": [["gem", 18, 12, "ice", 1.5], ["shield", 34, 22, "white", 0.6]],
  "mma-poirierish:R": [["gem", 16, 10, "ice", 1.2], ["burst", 34, 34, "white", 14], ["sparks", 34, 32, "#fffef8", 9, 0.55]],

  "mma-diazish:P": [["tape", 14, 24, "teal"], ["shield", 36, 14, "teal", 0.7]],
  "mma-diazish:Q": [["glove", 14, 30, "teal", 1, 1.05], ["wedge", 32, 28, "teal", 18, 9]],
  "mma-diazish:W": [["tape", 6, 28, "white"], ["mega", 30, 14, "teal"]],
  "mma-diazish:E": [["heart", 12, 16, "red", 0.9], ["tape", 30, 30, "teal"]],
  "mma-diazish:R": [["burst", 32, 32, "teal", 14], ["pips", 32, 32, "gold", 5], ["sparks", 32, 32, "#d8fff8", 8, 0.15]],

  "wild-icon:P": [["hood", 18, 12, "red"], ["shield", 34, 22, "black", 0.75]],
  "wild-icon:Q": [["boot", 10, 14, "black"], ["cracks", 28, 30, "gold"], ["wedge", 24, 24, "red", 20, 8]],
  "wild-icon:W": [["chain", 8, 16, "gold"], ["shield", 32, 16, "black", 1.05]],
  "wild-icon:E": [["cracks", 10, 20, "white"], ["smoke", 34, 26, "red"]],
  "wild-icon:R": [["hood", 8, 10, "red"], ["burst", 36, 34, "gold", 15], ["sparks", 36, 32, "#ffe08a", 9, 0.45]],

  "wild-enigma:P": [["pins", 20, 16], ["folder", 32, 28, "black"]],
  "wild-enigma:Q": [["folder", 8, 16, "black"], ["smoke", 34, 26, "violet"]],
  "wild-enigma:W": [["chevs", 8, 30, "#c8c8d2", 3, 10], ["folder", 36, 12, "black"]],
  "wild-enigma:E": [["shield", 10, 14, "black", 1], ["shield", 30, 18, "white", 0.85]],
  "wild-enigma:R": [["folder", 8, 14, "black"], ["stars", 40, 22, 1.6], ["sparks", 42, 36, "#c8b0f0", 6, 0.8]],

  "wild-cartoons:P": [["peel", 14, 18, "gold"], ["anvil", 32, 16, "steel"]],
  "wild-cartoons:Q": [["peel", 10, 14, "gold"], ["drops", 28, 18, "red", 5]],
  "wild-cartoons:W": [["anvil", 6, 12, "steel"], ["anvil", 30, 18, "black"], ["stars", 24, 12, 0.2]],
  "wild-cartoons:E": [["chevs", 8, 30, "#ff7a72", 3, 10], ["peel", 38, 12, "gold"]],
  "wild-cartoons:R": [["anvil", 6, 8, "steel"], ["peel", 28, 14, "gold"], ["burst", 36, 38, "red", 12], ["sparks", 40, 28, "#ffe08a", 8, 1.5]],

  "wild-dynasty:P": [["phone", 18, 16, "pink"], ["chevs", 38, 28, "#ff9ec4", 2, 8]],
  "wild-dynasty:Q": [["camera", 8, 14, "pink"], ["bolt", 30, 30, "white", 18, -0.1], ["sparks", 46, 18, "#fffef8", 5, 0.2]],
  "wild-dynasty:W": [["heart", 14, 14, "pink", 1], ["burst", 36, 32, "pink", 10]],
  "wild-dynasty:E": [["phone", 6, 16, "black"], ["chevs", 28, 30, "#ff9ec4", 3, 9]],
  "wild-dynasty:R": [["phone", 6, 12, "pink"], ["cracks", 28, 28, "white"], ["sparks", 44, 22, "#ffe08a", 8, 0.65]],

  "wild-legend:P": [["chair", 14, 18, "gold"], ["heart", 42, 16, "red", 0.65]],
  "wild-legend:Q": [["chair", 6, 20, "gold"], ["hook", 32, 18, "red"], ["stars", 48, 16, 0.4]],
  "wild-legend:W": [["chair", 8, 20, "gold"], ["bubble", 32, 10]],
  "wild-legend:E": [["chair", 8, 16, "gold"], ["chevs", 34, 32, "#ffe08a", 3, 8]],
  "wild-legend:R": [["chair", 6, 18, "gold"], ["burst", 40, 30, "red", 12], ["sparks", 42, 26, "#ffe08a", 8, 0.85]],

  "wild-karen:P": [["receipt", 16, 12, "red"], ["shield", 34, 20, "gold", 0.8]],
  "wild-karen:Q": [["mega", 6, 16, "gold"], ["receipt", 32, 22, "red"]],
  "wild-karen:W": [["bell", 10, 12, "gold"], ["stars", 40, 24, 1.1], ["podium", 28, 30, "tan"]],
  "wild-karen:E": [["mega", 8, 18, "red"], ["wedge", 30, 32, "gold", 20, 10]],
  "wild-karen:R": [["bell", 8, 8, "gold"], ["receipt", 30, 14, "red"], ["burst", 36, 38, "gold", 12]],

  "wild-vegan:P": [["vines", 12, 16, "green"], ["heart", 36, 18, "green", 0.8]],
  "wild-vegan:Q": [["vines", 8, 14, "green"], ["smoke", 36, 26, "olive"]],
  "wild-vegan:W": [["leaf", 12, 20, "green", -0.4], ["heal", 34, 16, "green", 1]],
  "wild-vegan:E": [["leaf", 8, 22, "green", 0.4], ["chevs", 28, 28, "#b0e080", 3, 9]],
  "wild-vegan:R": [["drops", 10, 10, "green", 6], ["plant", 34, 18, "green"], ["leaf", 18, 36, "olive", 1.2]],

  "wild-butter:P": [["wrench", 12, 16, "green"], ["server", 34, 14, "black"]],
  "wild-butter:Q": [["drone", 4, 10, "green"], ["drone", 20, 20, "steel"], ["drops", 12, 32, "green", 4]],
  "wild-butter:W": [["laser", 8, 26, "red"]],
  "wild-butter:E": [["wrench", 8, 16, "gold"], ["gear", 36, 30, "green"], ["speed", 46, 16, "#69f0ae"]],
  "wild-butter:R": [["server", 8, 12, "black"], ["burst", 38, 32, "green", 14], ["sparks", 40, 28, "#69f0ae", 8, 0.4]],

  "wild-cezanne:P": [["palette", 16, 16], ["brush", 34, 28, "violet"]],
  "wild-slush:P": [["hat", 16, 12, "olive"], ["drops", 34, 10, "ice", 7], ["dome", 18, 30, "steel"], ["slick", 36, 34, "ice"]],
  "wild-cezanne:Q": [["palette", 6, 18], ["bolt", 28, 30, "violet", 20, 0.15]],
  "wild-cezanne:W": [["brush", 8, 14, "violet"], ["slick", 28, 30, "pink"]],
  "wild-cezanne:E": [["drops", 12, 12, "violet", 6], ["drops", 22, 24, "gold", 3], ["brush", 38, 28, "red"]],
  "wild-cezanne:R": [["palette", 6, 12], ["burst", 38, 34, "violet", 14], ["sparks", 36, 30, "#f0e4ff", 8, 0.7]],
};

const MOTIF: Record<string, Op> = {
  "maga-grumptor": ["mega", 4, 6, "red"],
  "maga-alexgroans": ["folder", 2, 6, "orange"],
  "maga-rogentor": ["mic", 4, 4, "gold"],
  "maga-quirk": ["board", 2, 4, "gold"],
  "maga-tommy": ["boot", 4, 6, "leather"],
  "maga-elonmolk": ["rocket", 2, 6, "steel"],
  "maga-boris": ["scroll", 2, 4, "gold"],
  "maga-brander": ["paw", 4, 6, "orange"],
  "maga-vestyt": ["book", 2, 4, "black"],
  "maga-steers": ["mug", 4, 6, "tan"],
  "maga-ricky": ["chair", 2, 8, "orange"],
  "maga-bushed": ["ranch", 2, 4, "tan"],
  "lw-harass": ["ribbons", 2, 4, "violet"],
  "lw-sandbags": ["mitten", 2, 6, "teal"],
  "lw-bitenten": ["slick", 2, 8, "ice"],
  "lw-odramma": ["sun", 6, 6, "gold"],
  "lw-youngturkey": ["coins", 2, 6, "gold"],
  "lw-hocking": ["chair", 2, 8, "violet"],
  "lw-vakxie": ["syringe", 2, 4, "green"],
  "lw-climate": ["thermo", 2, 4, "red"],
  "lw-journalist": ["camera", 2, 4, "black"],
  "wild-icon": ["hood", 2, 2, "red"],
  "wild-enigma": ["pins", 8, 6],
  "wild-cartoons": ["peel", 2, 4, "gold"],
  "wild-dynasty": ["phone", 2, 4, "pink"],
  "wild-legend": ["chair", 2, 8, "gold"],
  "wild-karen": ["receipt", 2, 2, "red"],
  "wild-vegan": ["leaf", 2, 6, "green", -0.4],
  "wild-butter": ["wrench", 2, 4, "green"],
  "wild-cezanne": ["brush", 2, 4, "violet"],
  "wild-slush": ["drops", 2, 4, "ice", 5],
  "mma-macgregor": ["glove", 4, 8, "green", 1, 0.85],
  "mma-nurmagoat": ["mat", 2, 10, "red"],
  "mma-jonesy": ["elbow", 2, 12, "gold", 18],
  "mma-adesanyaish": ["ghost", 4, 8, "olive"],
  "mma-poirierish": ["gem", 4, 4, "ice", 1.15],
  "mma-diazish": ["tape", 2, 8, "teal"],
};

const PAL: Record<string, MatName> = {
  "maga-grumptor": "red",
  "maga-alexgroans": "orange",
  "maga-rogentor": "gold",
  "maga-quirk": "gold",
  "maga-tommy": "red",
  "maga-elonmolk": "steel",
  "maga-boris": "blue",
  "maga-brander": "orange",
  "maga-vestyt": "gold",
  "maga-steers": "gold",
  "maga-ricky": "orange",
  "maga-bushed": "tan",
  "lw-harass": "violet",
  "lw-sandbags": "teal",
  "lw-bitenten": "ice",
  "lw-odramma": "gold",
  "lw-youngturkey": "green",
  "lw-hocking": "violet",
  "lw-vakxie": "green",
  "lw-climate": "teal",
  "lw-journalist": "navy",
  "wild-icon": "red",
  "wild-enigma": "violet",
  "wild-cartoons": "gold",
  "wild-dynasty": "pink",
  "wild-legend": "gold",
  "wild-karen": "red",
  "wild-vegan": "green",
  "wild-butter": "green",
  "wild-cezanne": "violet",
  "wild-slush": "ice",
  "mma-macgregor": "green",
  "mma-nurmagoat": "red",
  "mma-jonesy": "gold",
  "mma-adesanyaish": "olive",
  "mma-poirierish": "ice",
  "mma-diazish": "teal",
};

function shapeStamp(spec: MechSpec, m: MatName, slot: AbilitySlot): Op {
  const ult = slot === "R";
  switch (spec.shape) {
    case "line":
      return ult ? ["beam", 8, 48, 56, 12, m] : ["beam", 10, 44, 54, 16, m];
    case "wedge":
      return ["wedge", 12, 30, m, ult ? 42 : 36, ult ? 18 : 16];
    case "ring":
      return ["burst", 32, 32, m, ult ? 22 : 19];
    case "ground":
      return ["dome", ult ? 30 : 26, ult ? 28 : 24, m];
    case "bolt":
      return ["bolt", 12, 28, m, ult ? 40 : 34, -0.22];
    case "self":
      return ["shield", ult ? 12 : 14, ult ? 6 : 8, m, ult ? 1.72 : 1.46];
    case "unit":
      return ["spiral", ult ? 30 : 28, ult ? 30 : 28, m];
  }
}

/** Same effect, one extra mark, so the ultimate reads heavier than Q W E. */
function ultFlourish(spec: MechSpec, m: MatName): Op {
  switch (spec.shape) {
    case "line":
      return ["sparks", 48, 18, "#fff6e4", 6, 0.35];
    case "wedge":
      return ["sparks", 40, 30, "#fff6e4", 5, 0.15];
    case "ring":
      return ["burst", 32, 32, m, 11];
    case "ground":
      return ["drops", 16, 12, m, 4];
    case "bolt":
      return ["sparks", 46, 16, "#fff6e4", 6, 0.9];
    case "self":
      return ["gem", 26, 16, m, 0.62];
    case "unit":
      return ["sparks", 30, 28, "#fff6e4", 7, 0.55];
  }
}

function effectStamps(spec: MechSpec, m: MatName): Op[] {
  const ops: Op[] = [];
  if (spec.timing === "windup") ops.push(["gear", 40, 4, "steel"]);
  if (spec.timing === "next") ops.push(["chevs", 34, 40, "#ffe08a", 3, 7]);
  if (spec.timing === "pulse") ops.push(["drops", 38, 4, m, 6]);
  if (spec.timing === "expire") ops.push(["smoke", 38, 6, "white"]);
  if (spec.status === "slow") ops.push(["slick", 4, 34, "ice"]);
  if (spec.status === "stun") ops.push(["anvil", 36, 4, "steel"]);
  if (spec.status === "taunt") ops.push(["mega", 34, 2, "gold"]);
  if (spec.status === "mark") ops.push(["gem", 40, 4, "gold", 0.75]);
  if (spec.status === "heavy") ops.push(["chain", 4, 32, "steel"]);
  if (spec.status === "knock") ops.push(["cracks", 34, 32, m]);
  if (spec.self === "shield") ops.push(["dome", 36, 24, "steel"]);
  if (spec.self === "decay") ops.push(["bricks", 34, 26, "tan", 3, 2]);
  if (spec.self === "aspd") ops.push(["speed", 44, 34, "#69f0ae"]);
  if (spec.self === "haste") ops.push(["sneaker", 34, 28, m, 1]);
  if (spec.self === "heal") ops.push(["heal", 38, 8, "green", 1]);
  if (spec.self === "stealth") ops.push(["ghost", 36, 8, "white"]);
  if (spec.self === "boon") ops.push(["flame", 40, 6, 1.2]);
  if (spec.self === "cleanse") ops.push(["flask", 34, 4, "teal"]);
  if (spec.travel === "dash") ops.push(["chevs", 2, 40, "#fff6c8", 4, 9]);
  if (spec.travel === "stop") ops.push(["fence", 2, 26, "steel"]);
  if (spec.travel === "back") ops.push(["heel", 4, 30, m]);
  if (spec.travel === "blink") ops.push(["hole", 44, 36, 9]);
  if (spec.travel === "pull") ops.push(["hook", 36, 28, m]);
  if (spec.travel === "knock") ops.push(["boot", 34, 30, "black"]);
  if (spec.travel === "hook") ops.push(["cable", 6, 18]);
  if (spec.cond === "first") ops.push(["pips", 44, 44, "gold", 1]);
  if (spec.cond === "heroes") ops.push(["pips", 42, 42, "cream", 3]);
  if (spec.cond === "low") ops.push(["heart", 40, 34, "red", 0.6]);
  if (spec.cond === "allies") ops.push(["banners", 34, 2, m]);
  if (spec.cond === "far") ops.push(["rocket", 38, 2, "white"]);
  if (spec.cond === "near") ops.push(["mat", 32, 32, "leather"]);
  if (spec.cond === "marked") ops.push(["pins", 40, 6]);
  return ops;
}

function notch(id: string, m: MatName): Op {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i) * (i + 2);
  return ["tally", 44, 8 + (n % 6) * 2, m, 3 + (n % 4), n % 2 === 0 ? 1 : -1];
}

function originalScene(heroId: string, spec: MechSpec, slot: AbilitySlot): Op[] {
  const m = PAL[heroId] ?? "gold";
  const motif = MOTIF[heroId];
  const ops: Op[] = motif ? [motif, shapeStamp(spec, m, slot)] : [shapeStamp(spec, m, slot)];
  if (slot === "R") ops.push(ultFlourish(spec, m));
  ops.push(...effectStamps(spec, m));
  ops.push(notch(spec.id, m));
  return ops;
}

for (const hero of HEROES) {
  if (isHooliId(hero.id)) continue;
  for (const ability of hero.abilities) {
    if (!ability.mech) continue;
    SCENES[`${hero.id}:${ability.key}`] = originalScene(hero.id, mechById(ability.mech), ability.key);
  }
}

function factionOf(heroId: string): FactionKind {
  const wing = HEROES.find((h) => h.id === heroId)?.wing;
  if (wing === "maga") return "maga";
  if (wing === "antifa") return "antifa";
  return "neutral";
}

function paintScene(key: string): Icon {
  const ops = SCENES[key];
  if (!ops) throw new Error(`missing ability icon: ${key}`);
  const icon = new Icon();
  for (const op of ops) drawOp(icon, op);
  if (key.startsWith("maga-hooli:")) {
    icon.fit();
    return icon;
  }
  icon.fit(4);
  icon.punch();
  icon.etch();
  return icon;
}

export function abilityPainterIds(): string[] {
  return Object.keys(SCENES);
}

export function abilityRgba(heroId: string, slot: string, bg = BG): Uint8ClampedArray {
  const key = `${heroId}:${slot}`;
  if (slot !== "P" && slot !== "Q" && slot !== "W" && slot !== "E" && slot !== "R") {
    throw new Error(`missing ability icon: ${key}`);
  }
  const icon = paintScene(key);
  if (!isHooliId(heroId)) {
    const kind = factionOf(heroId);
    icon.outline(kind);
    icon.underpaint(kind, slot === "R");
  }
  icon.frame(slot);
  if (!isHooliId(heroId)) icon.factionAccent(factionOf(heroId), slot);
  const [br, bgc, bb] = hexRgb(bg);
  const out = new Uint8ClampedArray(ABILITY_N * ABILITY_N * 4);
  for (let y = 0; y < ABILITY_N; y++) {
    for (let x = 0; x < ABILITY_N; x++) {
      const c = icon.buf[y]![x];
      const [r, g, b] = c ? hexRgb(c) : [br, bgc, bb];
      const i = (y * ABILITY_N + x) * 4;
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = 255;
    }
  }
  return out;
}

function hexRgb(c: string): [number, number, number] {
  const h = c.startsWith("#") ? c.slice(1) : c;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/**
 * HUD cooldown is a darken of this bitmap (CSS brightness 0.78, saturate 0.92).
 * It is not a second picture.
 */
export function hudCooldownRgba(ready: Uint8ClampedArray): Uint8ClampedArray {
  const out = new Uint8ClampedArray(ready.length);
  for (let i = 0; i < ready.length; i += 4) {
    const r = ready[i]!;
    const g = ready[i + 1]!;
    const b = ready[i + 2]!;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const sat = 0.92;
    const br = 0.78;
    out[i] = clamp8((l + (r - l) * sat) * br);
    out[i + 1] = clamp8((l + (g - l) * sat) * br);
    out[i + 2] = clamp8((l + (b - l) * sat) * br);
    out[i + 3] = ready[i + 3]!;
  }
  return out;
}

function clamp8(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}
