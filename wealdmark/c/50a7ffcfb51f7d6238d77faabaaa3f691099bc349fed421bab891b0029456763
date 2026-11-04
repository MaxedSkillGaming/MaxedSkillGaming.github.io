/**
 * Which cell of the Kenney Roguelike Characters sheet (hero-layers.png) draws what.
 * Cells are [column, row]. scripts/hero-contact-sheet.py draws the labelled grid these were read from.
 * Tier 1 to 4 shows by choosing a different cell, so there is no tint code.
 */
(typeof window !== 'undefined' ? window : globalThis).HERO_CATALOG = {
  sheet: 'hero-layers.png',
  cell: 16,
  stride: 17,
  // Bare bodies: column 0 male, column 1 female. Rows 0 to 2 are light, tan and brown skin.
  // The game's six tones share them: the two lightest, the two middle, the two darkest.
  body: {
    m: [[0, 0], [0, 0], [0, 1], [0, 1], [0, 2], [0, 2]],
    f: [[1, 0], [1, 0], [1, 1], [1, 1], [1, 2], [1, 2]],
  },
  // Bare bodies need clothes: brown trousers and boots, and a plain shirt per colour family
  // (orange, teal, purple, green, grey) for figures with no body armor.
  legs: [3, 1],
  shirt: [[7, 0], [11, 0], [15, 0], [7, 5], [11, 5]],
  hair: {
    m: [[19, 0], [21, 0], [23, 0], [25, 0], [19, 4], [23, 4], [19, 2], [21, 2]],
    f: [[20, 0], [20, 1], [22, 1], [24, 1], [26, 1], [20, 4], [20, 5], [22, 5]],
  },
  // The plain brimmed hats in row 8 (none, orange, teal, green).
  hat: [null, [28, 8], [29, 8], [31, 8]],
  helm: {
    soft_leather_head: [30, 8],
    hard_leather_head: [30, 2],
    chain_head: [28, 0],
    mithril_head: [28, 1],
    foremans_hardhat: [30, 3],
  },
  armor: {
    soft_leather_body: [7, 4],
    hard_leather_body: [9, 4],
    chain_body: [10, 5],
    mithril_body: [10, 0],
  },
  cloak: {
    soft_leather_cloak: [10, 6],
    hard_leather_cloak: [6, 1],
    chain_cloak: [14, 6],
    mithril_cloak: [10, 1],
  },
  shield: {
    soft_leather_offhand: [34, 0],
    hard_leather_offhand: [34, 1],
    chain_offhand: [38, 1],
    mithril_offhand: [38, 6],
    nutcracker_buckler: [33, 0],
    tidal_aegis: [38, 7],
  },
  // One cell per tier. The crossbow has no shape of its own and uses the second bow column.
  weapon: {
    blade: [[43, 6], [44, 6], [45, 6], [46, 6]],
    dagger: [[43, 7], [44, 7], [45, 7], [46, 7]],
    bow: [[52, 0], [53, 0], [52, 2], [52, 4]],
    crossbow: [[53, 1], [53, 2], [53, 3], [53, 4]],
    staff: [[42, 0], [42, 3], [42, 1], [42, 2]],
    mace: [[47, 6], [47, 0], [47, 4], [47, 8]],
    spear: [[49, 6], [49, 0], [49, 4], [49, 8]],
  },
  // The sheet has no guns and no bone mask: figures holding or wearing these keep the code art.
  codeArt: ['bronze_pistol', 'iron_pistol', 'steel_pistol', 'mithril_pistol', 'pickmans_bone_mask'],
};
