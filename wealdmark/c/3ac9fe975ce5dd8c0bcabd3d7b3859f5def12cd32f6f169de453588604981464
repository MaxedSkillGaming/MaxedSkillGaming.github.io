'use strict';

/* Heroes of the Wealdmark. Copyright (c) 2026 Maxed Skill Gaming. All rights reserved. */

/**
 * The world view: draws the map, players, and monsters on a canvas; plays turn-based fights
 * on the same tiles; and shows skills, bag, wallet, and sound panels. All truth comes from
 * the server. This file only shows it and turns clicks and keys into requests.
 */
(function () {
  const TILE = 16;
  const WATERMARK = 'Heroes of the Wealdmark © 2026 Maxed Skill Gaming';
  const BUBBLE_MS = 6000;
  const LOG_LINES = 80;
  const MOVE_STEP_MS = 130;
  const MAX_LEVEL = 100;
  const PANELS = ['panel-skills', 'panel-bag', 'panel-equip', 'panel-stats', 'panel-look', 'panel-sound', 'panel-journal', 'panel-loot', 'panel-world', 'panel-trades', 'panel-party', 'panel-merc', 'panel-dungeon'];
  /** Iron bits each hero pays to enter a dungeon run. Matches the server's default. */
  const DUNGEON_FEE = 25;
  const TOWN_PANELS = ['dialog', 'panel-shop', 'panel-storage', 'panel-station', 'panel-perks', 'panel-anchor'];
  const ROW_LEVELS = [1, 8, 16, 24, 32, 40];
  const TREE_NAMES = ['melee', 'range', 'magic', 'defense'];
  let treeTab = 'melee';
  const SKILLS = ['melee', 'defense', 'range', 'magic', 'mining', 'forestry', 'fishing', 'hunting', 'smithing', 'cooking', 'crafting'];
  /** Name and one-line description for every hero ability (docs/combat-and-gear-draft.md, section 3). */
  const ABILITY_INFO = {
    punch: ['Punch', '100% damage to an adjacent enemy. Fists, since you hold no weapon.'],
    slash: ['Slash', '100% damage to an adjacent enemy.'],
    pine_nut_throw: ['Pine Nut Throw', 'A thrown pine nut. The Mind Goblin never runs out.'],
    pick_throw: ['Pick Throw', 'A mining pick thrown from five tiles away. The Foreman Below has a rack of them.'],
    wretch_bite: ['Wretch Bite', 'A bite that poisons. The venom ticks for three rounds.'],
    crushing_strike: ['Crushing Strike', 'A boss marks tiles after its turn. Anyone still standing on one when its next turn starts loses a quarter of their health, armor or not.'],
    dust_cloud: ['Dust Cloud', 'A choking cloud of rock dust. Halves your mana regeneration for two rounds.'],
    wing_buffet: ['Wing Buffet', 'Leathery wings in your face. Blinded: your attacks lose 30 points of hit chance for two rounds. Spells can miss while you are blinded.'],
    gore: ['Gore', 'A tusk blow. Stone boars charge and strike first.'],
    multi_strike: ['Multi Strike', '85% damage to up to 4 enemies in the 3 by 3 block in front of you.'],
    power_strike: ['Power Strike', '200% damage to an adjacent enemy.'],
    rend: ['Rend', '100% damage now, then bleed for 60% over 3 rounds.'],
    sunder_strike: ['Sunder Strike', '100% damage and 2 stacks of Sunder (5% less armor each, up to 5).'],
    war_cry: ['War Cry', '+15% damage dealt for 5 rounds.'],
    whirlwind: ['Whirlwind', '110% damage to every enemy on the 8 tiles around you.'],
    execute: ['Execute', '150% damage, or 300% against a target under 30% health.'],
    shot: ['Shot', '100% damage to one enemy within 6 tiles.'],
    multi_shot: ['Multi Shot', '85% damage to up to 4 enemies within 6 tiles.'],
    aimed_shot: ['Aimed Shot', '200% damage within 6 tiles. Cannot miss.'],
    poison_arrow: ['Poison Arrow', '90% damage now, then poison for 80% over 3 rounds. Poison ignores armor.'],
    snare: ['Snare', '100% damage; the target moves 2 fewer tiles for 2 turns.'],
    rain_of_arrows: ['Rain of Arrows', '105% damage to every enemy in a 3 by 3 area within 6 tiles.'],
    backstep: ['Backstep', 'Run up to 4 tiles away from the nearest enemy and dodge 20% more until your next turn.'],
    deadeye: ['Deadeye', 'Your next shot deals 350% damage and always crits.'],
    fireball: ['Fireball', '100% fire damage to one enemy within 5 tiles.'],
    ice_storm: ['Ice Storm', '95% damage to every enemy in a 3 by 3 area within 5 tiles; they move 2 fewer tiles next turn.'],
    heal: ['Heal', 'Restore 30% of your max health.'],
    mana_shield: ['Mana Shield', 'For 3 rounds, damage drains mana instead of health (1 mana per 2 damage).'],
    chain_lightning: ['Chain Lightning', '130%, 105%, then 80% damage on up to 3 enemies, each within 4 tiles of the last.'],
    arcane_surge: ['Arcane Surge', 'For 3 rounds: +40% spell damage and triple mana regen. Then you are exhausted (-20% damage) for 3 rounds.'],
    shield_bash: ['Shield Bash', '80% damage; the target cannot move on its next turn (bosses: 50% chance).'],
    fortify: ['Fortify', '15% less damage taken for 10 rounds.'],
    second_wind: ['Second Wind', 'Restore 25% of your max health over 3 rounds.'],
    parry: ['Parry', 'Negate the next melee hit against you and answer it with 100% damage.'],
    stoneskin: ['Stoneskin', 'Absorb damage worth 20% of your max health for 2 rounds.'],
    retaliate: ['Retaliate', 'For 2 rounds, reflect 30% of the damage you take.'],
    extra_shot: ['Extra shot', 'A second arrow from a lucky bow, at the same target.'],
    execute_shot: ['Execute shot', 'A pistol shot that finishes a wounded enemy.'],
    unbreakable: ['Unbreakable', 'For 2 rounds take 50% less damage, and you cannot drop below 1 health in the first.'],
  };
  const ABILITY_NAMES = Object.fromEntries(Object.entries(ABILITY_INFO).map(([k, v]) => [k, v[0]]));
  /** The attack every hero has for their weapon, used when nothing else is selected. */
  const BASIC_ATTACKS = ['punch', 'slash', 'shot', 'fireball'];
  const BOSS_SCALE = { mind_goblin: 1.7, foreman_below: 1.6, skrit: 1.5, harl_dunmarsh: 1.5, ghashul: 1.5, ethelgar: 1.6, morwenna_pickman: 1.7, drowned_voice: 1.3, nyth_ael: 1.6, ambrose_silt: 1.6, prince_elrenor: 1.8 };
const DEBUFFS = new Set(['stunned', 'stagger', 'slow', 'bleed', 'poison', 'burn', 'sunder', 'exhaust', 'dust_choked', 'blinded']);
  const TIER_LEVELS = [1, 10, 20, 30];
  /** Procedural 24px icons for abilities and statuses, drawn once and cached as data URLs. */
  const poly = (c, pts) => {
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
  };
  const ICON_SHAPES = {
    sword: (c) => { poly(c, [[5, 19], [15, 5], [19, 5], [19, 9], [7, 21]]); poly(c, [[3, 15], [9, 21], [8, 22], [2, 16]]); },
    arrow: (c) => { c.lineWidth = 3; c.beginPath(); c.moveTo(4, 20); c.lineTo(15, 9); c.stroke(); poly(c, [[21, 3], [21, 13], [11, 3]]); },
    flame: (c) => { c.beginPath(); c.moveTo(12, 2); c.bezierCurveTo(21, 10, 20, 21, 12, 22); c.bezierCurveTo(4, 21, 3, 14, 8, 9); c.bezierCurveTo(9, 12, 11, 11, 12, 2); c.fill(); },
    snow: (c) => { c.lineWidth = 2.5; for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; c.beginPath(); c.moveTo(12 - Math.cos(a) * 9, 12 - Math.sin(a) * 9); c.lineTo(12 + Math.cos(a) * 9, 12 + Math.sin(a) * 9); c.stroke(); } },
    bolt: (c) => poly(c, [[14, 2], [5, 13], [11, 13], [9, 22], [19, 9], [13, 9]]),
    cross: (c) => { c.fillRect(9, 3, 6, 18); c.fillRect(3, 9, 18, 6); },
    shield: (c) => poly(c, [[12, 3], [20, 6], [19, 14], [12, 21], [5, 14], [4, 6]]),
    up: (c) => poly(c, [[12, 3], [21, 12], [15, 12], [15, 21], [9, 21], [9, 12], [3, 12]]),
    down: (c) => poly(c, [[12, 21], [21, 12], [15, 12], [15, 3], [9, 3], [9, 12], [3, 12]]),
    drop: (c) => { c.beginPath(); c.moveTo(12, 3); c.bezierCurveTo(20, 12, 19, 22, 12, 22); c.bezierCurveTo(5, 22, 4, 12, 12, 3); c.fill(); },
    fist: (c) => { c.fillRect(5, 9, 14, 11); for (let i = 0; i < 4; i++) c.fillRect(5 + i * 4, 5, 3, 5); },
    burst: (c) => { c.lineWidth = 2.5; c.beginPath(); c.arc(12, 12, 6, 0, Math.PI * 2); c.stroke(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; c.beginPath(); c.moveTo(12 + Math.cos(a) * 8.5, 12 + Math.sin(a) * 8.5); c.lineTo(12 + Math.cos(a) * 11, 12 + Math.sin(a) * 11); c.stroke(); } },
    eye: (c) => { c.beginPath(); c.moveTo(2, 12); c.quadraticCurveTo(12, 2, 22, 12); c.quadraticCurveTo(12, 22, 2, 12); c.fill(); c.fillStyle = '#0c0912'; c.beginPath(); c.arc(12, 12, 3.5, 0, Math.PI * 2); c.fill(); },
  };
  /** [shape, colour] per ability; anything not listed gets a plain burst. */
  const ABILITY_ICON = {
    punch: ['fist', '#e0b48c'], slash: ['sword', '#cfd6e4'], pine_nut_throw: ['drop', '#b08a52'], pick_throw: ['arrow', '#b0b6c4'],
    wretch_bite: ['drop', '#7bd88f'], crushing_strike: ['fist', '#e07070'], dust_cloud: ['burst', '#c8b090'], wing_buffet: ['burst', '#9aa0c0'], gore: ['sword', '#d8c8a0'],
    multi_strike: ['sword', '#f0a070'], power_strike: ['sword', '#f0c860'], rend: ['sword', '#e05a5a'], sunder_strike: ['shield', '#e05a5a'], war_cry: ['up', '#f0c860'],
    whirlwind: ['burst', '#cfd6e4'], execute: ['sword', '#ff6a6a'], shot: ['arrow', '#9ad87b'], multi_shot: ['arrow', '#c8e87b'], aimed_shot: ['arrow', '#f0c860'],
    poison_arrow: ['arrow', '#7bd88f'], snare: ['down', '#9ad8e8'], rain_of_arrows: ['burst', '#9ad87b'], backstep: ['up', '#7ab0f0'], deadeye: ['eye', '#f0c860'],
    fireball: ['flame', '#ff9a4a'], ice_storm: ['snow', '#8ae0ff'], heal: ['cross', '#7bd88f'], mana_shield: ['shield', '#6a9ef0'], chain_lightning: ['bolt', '#ffe36a'],
    arcane_surge: ['bolt', '#c08aff'], shield_bash: ['shield', '#cfd6e4'], fortify: ['shield', '#7ab0f0'], second_wind: ['cross', '#9ae8c0'], parry: ['shield', '#f0c860'],
    stoneskin: ['shield', '#a8a8b8'], retaliate: ['burst', '#ff9a4a'], unbreakable: ['shield', '#f0c860'], summon_familiar: ['burst', '#c08aff'],
  };
  const STATUS_ICON = {
    stagger: ['down', '#e0b48c'], slow: ['down', '#9ad8e8'], bleed: ['drop', '#e05a5a'], poison: ['drop', '#7bd88f'], burn: ['flame', '#ff9a4a'], sunder: ['shield', '#e05a5a'],
    exhaust: ['down', '#e07070'], dust_choked: ['burst', '#c8b090'], blinded: ['eye', '#e07070'], war_cry: ['up', '#f0c860'], deadeye: ['eye', '#f0c860'],
    mana_shield: ['shield', '#6a9ef0'], arcane_surge: ['bolt', '#c08aff'], fortify: ['shield', '#7ab0f0'], retaliate: ['burst', '#ff9a4a'], parry: ['shield', '#f0c860'],
    stoneskin: ['shield', '#a8a8b8'], unbreakable: ['shield', '#f0c860'], stunned: ['bolt', '#f0e060'], stun_immune: ['shield', '#c8c0e0'],
  };
  const iconCache = new Map();
  function iconUrl([shape, color]) {
    const key = shape + color;
    let url = iconCache.get(key);
    if (!url) {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 24;
      const c = cv.getContext('2d');
      c.fillStyle = '#17112a';
      c.fillRect(0, 0, 24, 24);
      c.strokeStyle = color;
      c.globalAlpha = 0.5;
      c.lineWidth = 2;
      c.strokeRect(1, 1, 22, 22);
      c.globalAlpha = 1;
      c.fillStyle = color;
      c.strokeStyle = color;
      c.lineCap = 'round';
      c.save();
      c.translate(3, 3);
      c.scale(0.75, 0.75);
      (ICON_SHAPES[shape] || ICON_SHAPES.burst)(c);
      c.restore();
      url = cv.toDataURL();
      iconCache.set(key, url);
    }
    return url;
  }
  const abilityIcon = (id) => iconUrl(ABILITY_ICON[id] || ['burst', '#c9b8f0']);
  const statusIcon = (id) => iconUrl(STATUS_ICON[id] || (DEBUFFS.has(id) ? ['down', '#e07070'] : ['up', '#7bd88f']));
  /** Equipment layout, three across: the figure's head, body, and legs down the middle. */
  const PAPERDOLL = ['weapon2', 'head', 'amulet', 'weapon', 'body', 'offhand', 'cloak', 'legs', 'belt', 'ring', 'boon', null];
  const SLOT_LABELS = [
    ['weapon', 'Weapon'],
    ['weapon2', 'Swap weapon'],
    ['offhand', 'Offhand'],
    ['head', 'Head'],
    ['body', 'Body'],
    ['legs', 'Legs'],
    ['cloak', 'Cloak'],
    ['amulet', 'Amulet'],
    ['ring', 'Ring'],
    ['belt', 'Belt'],
    ['boon', 'Boon'],
  ];
  const WEAPON_BLURB = {
    blade: 'Deals 5% more damage.',
    dagger: 'Two actions per turn. 25% chance to make the target bleed for 10% of weapon damage a round, for 5 rounds. Enemy armor is 40% more effective against it.',
    mace: '10% chance to critically hit.',
    spear: 'Two-handed: no shield. Hits harder than a one-handed weapon. 20% chance to block an attack.',
    bow: 'Range 6, +8 accuracy, +5% critical chance and a 10% chance to shoot an extra arrow.',
    crossbow: '15% chance to stun the target for 3 rounds, then it cannot be stunned for 3 rounds. Bosses cannot be stunned.',
    pistol: 'One-handed. Ctrl-click a second pistol in your bag to hold one in each hand and shoot twice a turn. 2% chance to finish an enemy under 30% health (not bosses).',
    staff: 'Range 5. Enemy armor is only 60% as effective against spells.',
  };
  const ELEMENT_BLURB = {
    air: 'Air: 10% chance to dodge an attack.',
    fire: 'Fire: spells deal 10% more damage.',
    water: 'Water: 5% chance when hit to heal 15% of your health, at most once every 5 rounds.',
    earth: 'Earth: take 10% less damage.',
  };
  const ELEMENT_COLOR = { air: '#c8e8ff', fire: '#ff7a3a', water: '#4a9aff', earth: '#a0804a' };
  const CLASS_SKILL = { blade: 'melee', dagger: 'melee', mace: 'melee', spear: 'melee', bow: 'range', crossbow: 'range', pistol: 'range', staff: 'magic' };
  const ERRORS = {
    no_path: "You can't walk there.",
    in_fight: "You can't do that in a fight.",
    cast_cancelled: 'The portal fizzles. Stay still and out of combat to cast it.',
    busy: 'That target is already in a fight.',
    safe_zone: "You can't start a fight in town.",
    not_in_fight: 'You are not in a fight.',
    illegal_action: "You can't do that right now.",
    hands: 'Your hands are full. A spear needs both hands (no shield), and a pistol goes in the off hand only beside another pistol.',
    no_item: "You can't use that.",
    level_too_low: 'Your level is too low to use that.',
    bad_skill: "You can't raise that skill yet.",
    cannot_afford: "You can't afford that.",
    too_far: "You're too far away.",
    no_tool: 'You need a different tool for that.',
    bag_full: 'Your bag is full.',
    storage_full: 'Your storage is full.',
    no_space: 'There is no room for that.',
    missing_items: 'You are missing some of the required materials.',
    no_party: 'You are not in a party.',
    not_leader: 'Only the party leader can do that.',
    party_full: 'The party is full.',
    unknown_hero: 'No hero by that name is online.',
    no_dungeon: 'There is no dungeon gate near you.',
  };

  const $ = (id) => document.getElementById(id);
  const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const xpForLevel = (l) => (l <= 1 ? 0 : l <= 20 ? Math.round((25 * Math.pow(l - 1, 2.4)) / 5) * 5 : Math.round((25 * Math.pow(19, 2.4) * Math.pow((l - 1) / 19, 3.6)) / 5) * 5);
  const pretty = (id) => id.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
  /** Your chance to land a weapon swing on a foe of `foeLevel` (spells never miss unless blinded). Null until the gear arrives. */
  function myHitChance(foeLevel) {
    const g = G && G.gearInfo;
    if (!g) return null;
    const lvl = (G.stats && G.stats.combatLevel) || 1;
    const me = G.fight && G.fight.actors.get(G.selfId);
    const pen = me && me.statuses.some((s) => s.id === 'blinded') ? 0.3 : 0;
    if (g.weapon.cls === 'staff') return Math.min(1, Math.max(0.05, 1 - pen));
    const acc = g.accuracy + (g.weapon.cls === 'bow' ? 8 : 0);
    return Math.min(0.95, Math.max(0.05, 0.75 + (acc + lvl - foeLevel) * 0.015 - pen));
  }
  const pctText = (v) => `${Math.round(v * 100)}%`;
  /** Plain text for a foe's standing against you: hit chance, and whether it still teaches you anything. */
  function foeNote(foeLevel) {
    const lvl = (G.stats && G.stats.combatLevel) || 1;
    const hit = myHitChance(foeLevel);
    const parts = [];
    if (hit !== null) parts.push(`${pctText(hit)} chance to hit`);
    if (foeLevel <= lvl - 10) parts.push('too weak to give experience');
    return parts.join(', ');
  }
  const VEC = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };

  function dirToward(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'E' : 'W';
    return dy >= 0 ? 'S' : 'N';
  }

  function front3x3(pos, dir) {
    const [vx, vy] = VEC[dir];
    const px = vy !== 0 ? 1 : 0;
    const py = vx !== 0 ? 1 : 0;
    const tiles = [];
    for (let depth = 1; depth <= 3; depth++) for (let w = -1; w <= 1; w++) tiles.push({ x: pos.x + vx * depth + px * w, y: pos.y + vy * depth + py * w });
    return tiles;
  }

  let G = null; // the running game, if any
  const early = []; // messages that arrive before the game view is ready

  // ---- sprites

  function hash(s) {
    let h = 2166136261;
    for (const c of s) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  const SKIN_TONES = ['#f6d3b3', '#e8b98e', '#cf9768', '#a9724a', '#7d4e32', '#553221'];
  const OUTLINE = '#2a1a14';

  /** '#rrggbb' scaled toward black (f < 1) or white (f > 1). */
  function tint(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const ch = (v) => Math.max(0, Math.min(255, Math.round(f <= 1 ? v * f : v + (255 - v) * (f - 1))));
    return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
  }

  function hsl2hex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  /** What a hero looks like: the chosen body shape and skin tone, with clothes and hair picked from the name. */
  function look(name, chosen) {
    const h = hash(name);
    const tone = SKIN_TONES[chosen ? chosen.skin : (h >> 4) % 4] || SKIN_TONES[1];
    const hue = h % 360;
    const hairHue = 10 + ((h >> 8) % 40);
    const hairL = 18 + ((h >> 16) % 28);
    return {
      hat: (h >> 24) % 4,
      g: chosen ? chosen.g : (h >> 20) % 2 ? 'f' : 'm',
      skin: tone,
      skinIx: SKIN_TONES.indexOf(tone),
      hairSeed: h >>> 12,
      skinShade: tint(tone, 0.82),
      body: hsl2hex(hue, 50, 46),
      bodyShade: hsl2hex(hue, 50, 34),
      bodyLight: hsl2hex(hue, 55, 58),
      trim: hsl2hex(hue, 40, 26),
      hair: hsl2hex(hairHue, 45, hairL),
      hairShade: hsl2hex(hairHue, 45, Math.max(6, hairL - 8)),
      hairLight: hsl2hex(hairHue, 50, hairL + 12),
    };
  }

  const spriteCache = new Map();

  /**
   * Paint a sprite on a 20x20 canvas (the 16x16 tile plus a 2 pixel margin) with `paint(r)`, then wrap
   * every filled pixel in a dark outline. Cached by key.
   */
  function sprite(key, paint, size = 20) {
    let c = spriteCache.get(key);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    paint((x, y, w, h, color) => {
      g.fillStyle = color;
      g.fillRect(x + 2, y + 2, w, h);
    });
    const d = g.getImageData(0, 0, size, size).data;
    const solid = (x, y) => x >= 0 && y >= 0 && x < size && y < size && d[(y * size + x) * 4 + 3] > 0;
    const out = [];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) out.push([x, y]);
    g.fillStyle = OUTLINE;
    for (const [x, y] of out) g.fillRect(x, y, 1, 1);
    if (spriteCache.size > 400) spriteCache.clear();
    spriteCache.set(key, c);
    return c;
  }

  function blit(ctx, c, x, y, s, bob) {
    // A sprite canvas has a 2 pixel margin; its inner area always covers one 16 pixel tile, whatever its detail.
    const k = 16 / (c.width - 4);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'rgba(20,10,5,0.28)';
    ctx.beginPath();
    ctx.ellipse(x + 8 * s, y + 15.2 * s, 5.5 * s, 1.9 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(c, Math.round(x - 2 * k * s), Math.round(y + (bob - 2 * k) * s), c.width * k * s, c.width * k * s);
  }

  /**
   * A hero on a 24x24 grid, shown in one tile: a big head, dark eyes with a single highlight, headgear that
   * changes the outline, and the weapon and shield in hand. `step` lifts one foot while walking.
   */
  function drawFigure(ctx, x, y, s, l, step, bob, held) {
    held = held || {};
    // The Kenney paper-doll first; it returns null for a figure it cannot dress (or while the sheet loads).
    const kenney = window.heroLayers && window.heroLayers.paint(l, held, step);
    if (kenney) {
      blit(ctx, kenney, x, y, s, bob);
      return;
    }
    const key = ['p4', l.g, l.skin, l.body, l.hair, l.hat, step, held.wid || '', held.element || '', held.oid || '', held.hid || '', held.bid || '', held.cid || ''].join('|');
    const c = sprite(key, (r) => {
      const fem = l.g === 'f';
      const boot = '#4a2e1c';
      const pant = '#3a3048';
      if (held.cid) paintCloak(r, held.cid);
      r(9, 18, 3, 3, pant);
      r(13, 18, 3, 3, pant);
      r(8, 21 - (step === 1 ? 1 : 0), 4, 2, boot);
      r(13, 21 - (step === 2 ? 1 : 0), 4, 2, boot);
      if (fem) {
        r(8, 12, 9, 4, l.body);
        r(7, 16, 11, 3, l.body);
        r(7, 18, 11, 1, l.bodyShade);
        r(8, 12, 4, 3, l.bodyLight);
        r(14, 13, 3, 3, l.bodyShade);
        r(8, 15, 9, 1, l.trim);
      } else {
        r(8, 12, 9, 7, l.body);
        r(8, 12, 4, 3, l.bodyLight);
        r(14, 13, 3, 6, l.bodyShade);
        r(8, 18, 9, 1, l.bodyShade);
        r(8, 17, 9, 1, l.trim);
        r(11, 17, 3, 1, '#e8c860');
      }
      r(6, 12, 2, 5, l.body);
      r(17, 12, 2, 5, l.bodyShade);
      r(6, 17, 2, 2, l.skin);
      r(17, 17, 2, 2, l.skinShade);
      if (held.bid) paintBody(r, held.bid, fem);
      if (held.cid) paintClasp(r, held.cid);
      // head
      r(6, 3, 12, 9, l.skin);
      r(7, 2, 10, 1, l.skin);
      r(7, 12, 10, 1, l.skinShade);
      r(17, 4, 1, 7, l.skinShade);
      // hair
      r(7, 0, 10, 1, l.hair);
      r(6, 1, 12, 3, l.hair);
      r(5, 3, 1, 5, l.hair);
      r(18, 3, 1, 5, l.hairShade);
      r(8, 1, 4, 1, l.hairLight);
      r(6, 4, 12, 1, l.hair);
      if (fem) {
        r(5, 8, 2, 6, l.hair);
        r(17, 8, 2, 6, l.hairShade);
        r(15, 0, 3, 2, '#e8506a');
      } else {
        r(8, 5, 2, 1, l.hair);
        r(14, 5, 2, 1, l.hair);
      }
      // headgear
      if (held.hid) paintHelm(r, held.hid);
      else if (l.hat === 1) {
        r(5, 0, 14, 5, l.body);
        r(5, 5, 2, 7, l.body);
        r(17, 5, 2, 7, l.bodyShade);
        r(7, 5, 10, 1, l.trim);
        r(7, 0, 5, 2, l.bodyLight);
      } else if (l.hat === 2) {
        r(5, 1, 14, 3, '#b8402c');
        r(3, 4, 18, 2, '#8a2c1c');
        r(7, 1, 5, 1, '#d86a4c');
        r(17, -1, 2, 5, '#f4f0dc');
        r(19, 0, 1, 3, '#d8d4c0');
      } else if (l.hat === 3) {
        r(6, 0, 12, 5, '#a8aebc');
        r(5, 3, 1, 5, '#8a90a0');
        r(18, 3, 1, 5, '#6e7484');
        r(8, 1, 4, 1, '#d8dce8');
        r(3, 0, 2, 4, '#efe4c4');
        r(19, 0, 2, 4, '#d8caa4');
        r(11, 5, 3, 3, '#8a90a0');
      }
      // face
      r(9, 7, 2, 3, '#1a1426');
      r(14, 7, 2, 3, '#1a1426');
      r(9, 7, 1, 1, '#ffffff');
      r(14, 7, 1, 1, '#ffffff');
      r(11, 10, 3, 1, '#a8705a');
      r(8, 10, 2, 1, '#e89a8a');
      r(15, 10, 2, 1, '#d88a7a');
      if (held.hid === 'pickmans_bone_mask') paintMask(r);
      // held gear
      if (held.weapon) paintWeapon(r, held.weapon, held.wid);
      if (held.offPistol) {
        r(17, 13, 6, 2, '#5a5f70');
        r(17, 15, 2, 4, '#6a4020');
      }
      if (held.shield) paintShield(r, held.oid);
    }, 28);
    blit(ctx, c, x, y, s, bob);
  }

  /** Monsters in the same 16x16 tile, rounder and shaded like the people. */
  function drawMonster(ctx, mon, x, y, s, step, bob) {
    const c = sprite(`m|${mon}|${step}`, (r) => {
      if (mon === 'moss_imp') {
        r(4, 13 - (step === 1 ? 1 : 0), 3, 2, '#2c4a24');
        r(9, 13 - (step === 2 ? 1 : 0), 3, 2, '#2c4a24');
        r(12, 11, 3, 1, '#4a8a3c');
        r(14, 9, 1, 3, '#4a8a3c');
        r(3, 6, 10, 8, '#5a9a4a');
        r(3, 6, 4, 4, '#74b862');
        r(10, 8, 3, 6, '#467a38');
        r(1, 7, 2, 4, '#4a8a3c');
        r(13, 7, 2, 4, '#3c6c30');
        r(4, 8, 8, 1, '#6ab056');
        r(4, 1, 8, 6, '#6fb25a');
        r(4, 1, 8, 2, '#86cc70');
        r(10, 3, 2, 4, '#58983f');
        r(2, 2, 2, 3, '#6fb25a');
        r(12, 2, 2, 3, '#58983f');
        r(3, 0, 1, 2, '#e8dcb4');
        r(12, 0, 1, 2, '#d0c498');
        r(5, 3, 2, 2, '#2a1010');
        r(9, 3, 2, 2, '#2a1010');
        r(5, 3, 1, 1, '#ff9a6a');
        r(9, 3, 1, 1, '#ff9a6a');
        r(6, 6, 4, 1, '#2c4a24');
        r(7, 6, 1, 1, '#ffffff');
      } else if (mon === 'glowcap_crawler') {
        r(2, 12, 1, 3 - (step === 1 ? 1 : 0), '#2a2040');
        r(5, 12, 1, 3 - (step === 2 ? 1 : 0), '#2a2040');
        r(9, 12, 1, 3 - (step === 1 ? 1 : 0), '#2a2040');
        r(12, 12, 1, 3 - (step === 2 ? 1 : 0), '#2a2040');
        r(2, 8, 12, 5, '#4a3a6a');
        r(2, 8, 12, 1, '#5e4c82');
        r(3, 12, 10, 1, '#382c52');
        r(1, 3, 14, 6, '#7a5cc8');
        r(3, 2, 10, 2, '#8e70dc');
        r(5, 1, 6, 1, '#a58ae8');
        r(1, 7, 14, 1, '#5c42a4');
        r(4, 4, 2, 2, '#c8f8ff');
        r(9, 3, 2, 2, '#c8f8ff');
        r(12, 5, 2, 1, '#ffeb9a');
        r(2, 6, 1, 1, '#ff8a8a');
        r(5, 10, 2, 2, '#2a1a40');
        r(9, 10, 2, 2, '#2a1a40');
        r(5, 10, 1, 1, '#c8f8ff');
        r(9, 10, 1, 1, '#c8f8ff');
      } else if (mon === 'gnasher') {
        r(3, 13 - (step === 1 ? 1 : 0), 3, 2, '#4a3e32');
        r(10, 13 - (step === 2 ? 1 : 0), 3, 2, '#4a3e32');
        r(0, 8, 3, 1, '#6a5a4a');
        r(0, 7, 1, 2, '#6a5a4a');
        r(2, 6, 10, 8, '#8a7a66');
        r(2, 6, 10, 2, '#a09078');
        r(8, 9, 4, 5, '#706250');
        r(3, 5, 1, 2, '#6a5a4a');
        r(5, 4, 1, 3, '#6a5a4a');
        r(7, 4, 1, 3, '#6a5a4a');
        r(9, 5, 1, 2, '#6a5a4a');
        r(9, 2, 6, 7, '#9a8a76');
        r(9, 2, 6, 2, '#b2a28c');
        r(14, 6, 1, 3, '#7a6a56');
        r(10, 3, 2, 1, '#6a5a4a');
        r(11, 4, 2, 2, '#2a1010');
        r(11, 4, 1, 1, '#ff9a6a');
        r(10, 8, 1, 2, '#ffffff');
        r(13, 8, 1, 2, '#ffffff');
        r(11, 8, 2, 1, '#3a2c22');
      } else if (mon === 'sellsword' || mon === 'archer' || mon === 'mage') {
        const tunic = mon === 'sellsword' ? '#a83a3a' : mon === 'archer' ? '#3a8a4a' : '#4a5ac8';
        const light = mon === 'sellsword' ? '#d86a6a' : mon === 'archer' ? '#6ac87a' : '#8a9aff';
        r(5, 13 - (step === 1 ? 1 : 0), 2, 2, '#3a2a1a');
        r(9, 13 - (step === 2 ? 1 : 0), 2, 2, '#3a2a1a');
        r(4, 6, 8, 7, tunic);
        r(4, 6, 3, 3, light);
        r(4, 11, 8, 1, '#2a1a10');
        r(5, 2, 6, 5, '#e8b88a');
        if (mon === 'mage') {
          r(4, 1, 8, 2, tunic);
          r(6, -1, 4, 3, tunic);
          r(12, 3, 1, 10, '#8a5a2c');
          r(11, 2, 3, 2, '#ffe66a');
        } else if (mon === 'archer') {
          r(4, 1, 8, 3, '#2a5a30');
          r(12, 3, 1, 10, '#8a5a2c');
          r(13, 4, 1, 8, '#ece8d6');
        } else {
          r(4, 1, 8, 3, '#8a8a94');
          r(5, 1, 6, 1, '#c8c8d4');
          r(12, 2, 1, 9, '#c8c8d4');
          r(11, 10, 3, 1, '#d8b04a');
        }
        r(6, 4, 1, 1, '#2a1a10');
        r(9, 4, 1, 1, '#2a1a10');
      } else if (mon === 'familiar') {
        r(4, 13 - (step === 1 ? 1 : 0), 3, 2, '#4a2e7a');
        r(9, 13 - (step === 2 ? 1 : 0), 3, 2, '#4a2e7a');
        r(4, 6, 8, 8, '#7a5ce0');
        r(4, 6, 4, 3, '#a58aff');
        r(9, 9, 3, 5, '#5a40b0');
        r(3, 1, 3, 4, '#a58aff');
        r(10, 1, 3, 4, '#5a40b0');
        r(4, 3, 8, 5, '#8e72f0');
        r(5, 4, 2, 2, '#fff8c0');
        r(9, 4, 2, 2, '#fff8c0');
        r(6, 7, 4, 1, '#2a1a50');
        r(6, 14, 4, 1, '#c8f0ff');
      } else if (mon === 'sump_rat' || mon === 'skrit') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(0, 10, 4, 1, '#c8908a');
        r(0, 9, 1, 1, '#c8908a');
        r(4, 13 - fl, 2, 2, '#4a3a30');
        r(9, 13 - fr, 2, 2, '#4a3a30');
        r(3, 8, 9, 5, '#7a6a5a');
        r(3, 8, 9, 1, '#968470');
        r(8, 11, 4, 2, '#605246');
        r(11, 7, 4, 4, '#8a7a68');
        r(11, 7, 4, 1, '#a49480');
        r(14, 9, 2, 2, '#e8a0a0');
        r(12, 8, 1, 1, '#ff4a3a');
        r(10, 5, 2, 3, '#c8908a');
        r(14, 8, 2, 1, '#d8d0c0');
        r(13, 10, 1, 1, '#f4ecd0');
        if (mon === 'skrit') {
          r(10, 4, 5, 2, '#d8b040');
          r(10, 3, 1, 1, '#d8b040');
          r(12, 3, 1, 1, '#f4d868');
          r(14, 3, 1, 1, '#d8b040');
        }
      } else if (mon === 'harl_dunmarsh') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(4, 13 - fl, 3, 2, '#2a2420');
        r(9, 13 - fr, 3, 2, '#2a2420');
        r(4, 6, 8, 8, '#5a5048');
        r(4, 6, 8, 2, '#766a5e');
        r(4, 12, 8, 1, '#3a322c');
        r(7, 7, 2, 6, '#8a7a30');
        r(2, 7, 2, 5, '#c89a78');
        r(12, 6, 2, 5, '#c89a78');
        r(13, 2, 1, 10, '#6a4426');
        r(11, 2, 5, 2, '#9aa0aa');
        r(5, 2, 6, 5, '#c89a78');
        r(5, 5, 6, 3, '#8a8478');
        r(4, 6, 1, 2, '#8a8478');
        r(11, 6, 1, 2, '#8a8478');
        r(6, 3, 1, 1, '#1a1410');
        r(9, 3, 1, 1, '#1a1410');
        r(4, 1, 8, 2, '#6a6258');
        r(7, 0, 2, 2, '#ffe46a');
        r(7, 0, 2, 1, '#ffffff');
        r(2, 13, 3, 1, '#b4a890');
        r(11, 4, 1, 1, '#b4a890');
      } else if (mon === 'cave_bat') {
        const up = step === 1;
        r(6, 6, 4, 6, '#3a2c4a');
        r(6, 6, 4, 1, '#54406a');
        r(5, 3, 6, 4, '#4a3a5c');
        r(5, 1, 1, 3, '#4a3a5c');
        r(10, 1, 1, 3, '#4a3a5c');
        r(6, 4, 1, 1, '#ff5a4a');
        r(9, 4, 1, 1, '#ff5a4a');
        r(7, 6, 1, 1, '#ffffff');
        r(8, 6, 1, 1, '#ffffff');
        r(7, 12, 2, 2, '#2a2038');
        if (up) {
          r(0, 2, 6, 5, '#2c2238');
          r(10, 2, 6, 5, '#2c2238');
          r(0, 2, 2, 3, '#54406a');
          r(14, 2, 2, 3, '#54406a');
          r(2, 6, 3, 2, '#3a2c4a');
          r(11, 6, 3, 2, '#3a2c4a');
        } else {
          r(0, 7, 6, 3, '#2c2238');
          r(10, 7, 6, 3, '#2c2238');
          r(0, 9, 2, 3, '#54406a');
          r(14, 9, 2, 3, '#54406a');
          r(2, 10, 3, 2, '#3a2c4a');
          r(11, 10, 3, 2, '#3a2c4a');
        }
      } else if (mon === 'bog_wretch') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(5, 13 - fl, 2, 2, '#3a4a48');
        r(9, 13 - fr, 2, 2, '#3a4a48');
        r(4, 6, 8, 8, '#5a4a3a');
        r(4, 6, 3, 3, '#7a6650');
        r(4, 12, 8, 1, '#3a2c22');
        r(2, 7, 2, 6, '#8aa8a0');
        r(12, 7, 2, 6, '#6a8880');
        r(2, 12, 2, 2, '#a4c4bc');
        r(12, 12, 2, 2, '#82a49c');
        r(5, 1, 6, 6, '#8aa8a0');
        r(5, 1, 6, 2, '#a4c4bc');
        r(4, 0, 8, 2, '#8a7a3a');
        r(7, 0, 2, 1, '#ffe88a');
        r(6, 3, 2, 2, '#0a1a20');
        r(9, 3, 2, 2, '#0a1a20');
        r(6, 3, 1, 1, '#8affea');
        r(9, 3, 1, 1, '#8affea');
        r(6, 5, 4, 1, '#1a2a2a');
        r(5, 7, 1, 2, '#6ac8e8');
        r(10, 8, 1, 2, '#6ac8e8');
      } else if (mon === 'stone_boar') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(3, 12 - fl, 2, 3, '#4a423a');
        r(6, 12 - fr, 2, 3, '#3a342e');
        r(9, 12 - fl, 2, 3, '#4a423a');
        r(12, 12 - fr, 2, 3, '#3a342e');
        r(1, 7, 1, 3, '#5a524a');
        r(2, 6, 11, 7, '#7a7268');
        r(2, 12, 11, 1, '#5a524a');
        r(3, 5, 9, 2, '#9a9488');
        r(4, 5, 2, 1, '#b4aea2');
        r(3, 4, 2, 1, '#6a6258');
        r(6, 4, 2, 1, '#6a6258');
        r(9, 4, 2, 1, '#6a6258');
        r(11, 6, 4, 6, '#6a625a');
        r(14, 9, 2, 3, '#8a7a70');
        r(15, 10, 1, 1, '#2a1a1a');
        r(13, 11, 1, 2, '#f4ecd0');
        r(14, 12, 1, 1, '#f4ecd0');
        r(12, 7, 1, 1, '#ff6a3a');
        r(11, 4, 2, 2, '#5a524a');
      } else if (mon === 'dire_wolf') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(3, 12 - fl, 2, 3, '#3c3c44');
        r(5, 12 - fr, 2, 3, '#2c2c34');
        r(9, 12 - fr, 2, 3, '#3c3c44');
        r(11, 12 - fl, 2, 3, '#2c2c34');
        r(0, 6, 2, 2, '#5a5a64');
        r(1, 7, 3, 2, '#6a6a74');
        r(2, 6, 10, 7, '#6a6a76');
        r(2, 12, 10, 1, '#4a4a54');
        r(3, 5, 8, 2, '#8a8a96');
        r(4, 4, 2, 1, '#9a9aa6');
        r(7, 4, 2, 1, '#9a9aa6');
        r(5, 8, 5, 2, '#52525c');
        r(11, 5, 4, 6, '#5e5e6a');
        r(14, 8, 2, 3, '#4a4a54');
        r(15, 9, 1, 1, '#14141a');
        r(12, 4, 1, 2, '#46464e');
        r(14, 4, 1, 2, '#46464e');
        r(12, 6, 1, 1, '#ffd23a');
        r(13, 11, 1, 2, '#f4f0e0');
        r(15, 11, 1, 1, '#f4f0e0');
      } else if (mon === 'wisp_hound') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(3, 12 - fl, 2, 3, '#24305a');
        r(5, 12 - fr, 2, 3, '#1c2648');
        r(9, 12 - fr, 2, 3, '#24305a');
        r(11, 12 - fl, 2, 3, '#1c2648');
        r(0, 4 - fl, 2, 4, '#8ee8ff');
        r(1, 6, 2, 2, '#58b8e8');
        r(2, 6, 10, 7, '#34448a');
        r(2, 12, 10, 1, '#222e60');
        r(3, 4, 9, 3, '#8ee8ff');
        r(4, 3, 3, 1, '#c8f8ff');
        r(8, 3, 3, 1, '#c8f8ff');
        r(5, 2 + fr, 2, 1, '#e8fcff');
        r(5, 8, 5, 2, '#4a5ca8');
        r(11, 5, 4, 6, '#3e4e96');
        r(14, 8, 2, 3, '#2a3670');
        r(15, 9, 1, 1, '#0a0e20');
        r(12, 4, 1, 2, '#58b8e8');
        r(12, 6, 2, 1, '#ffffff');
        r(13, 11, 1, 2, '#c8f8ff');
      } else if (mon === 'grave_wolf') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(3, 12 - fl, 2, 3, '#24242c');
        r(5, 12 - fr, 2, 3, '#3a3a42');
        r(9, 12 - fr, 2, 3, '#24242c');
        r(11, 12 - fl, 2, 3, '#3a3a42');
        r(0, 6, 2, 2, '#3a3a42');
        r(1, 7, 3, 2, '#4a4a50');
        r(2, 6, 10, 7, '#4a4a50');
        r(2, 12, 10, 1, '#24242c');
        r(3, 5, 8, 2, '#3a3a42');
        r(5, 8, 5, 2, '#24242c');
        r(11, 5, 4, 6, '#4a4a50');
        r(14, 8, 2, 3, '#3a3a42');
        r(15, 9, 1, 1, '#0a0a10');
        r(12, 4, 1, 2, '#24242c');
        r(14, 4, 1, 2, '#24242c');
        r(12, 6, 1, 1, '#9affb0');
        r(13, 11, 1, 2, '#e8e8d8');
        r(15, 11, 1, 1, '#e8e8d8');
      } else if (mon === 'ghashul') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(3, 12 - fl, 2, 3, '#1a1220');
        r(5, 12 - fr, 2, 3, '#2e2034');
        r(9, 12 - fr, 2, 3, '#1a1220');
        r(11, 12 - fl, 2, 3, '#2e2034');
        r(0, 6, 2, 2, '#2e2034');
        r(1, 7, 3, 2, '#3a2a3e');
        r(2, 6, 10, 7, '#3a2a3e');
        r(2, 12, 10, 1, '#1a1220');
        r(3, 5, 8, 2, '#2e2034');
        r(5, 8, 5, 2, '#1a1220');
        r(11, 5, 4, 6, '#3a2a3e');
        r(14, 8, 2, 3, '#2e2034');
        r(15, 9, 1, 1, '#0a0a10');
        r(12, 4, 1, 2, '#1a1220');
        r(14, 4, 1, 2, '#1a1220');
        r(12, 6, 1, 1, '#c070ff');
        r(13, 11, 1, 2, '#f0e8f0');
        r(15, 11, 1, 1, '#f0e8f0');
      } else if (mon === 'barrow_wight') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(4, 13 - fl, 3, 2, '#6a7a78');
        r(9, 13 - fr, 3, 2, '#6a7a78');
        r(3, 6, 10, 8, '#3a4a48');
        r(3, 6, 4, 3, '#6a7a78');
        r(3, 12, 10, 1, '#14141a');
        r(7, 8, 2, 5, '#6a7a78');
        r(1, 7, 2, 5, '#c8d0c0');
        r(13, 7, 2, 5, '#c8d0c0');
        r(5, 1, 6, 6, '#c8d0c0');
        r(5, 1, 6, 1, '#ffffff');
        r(6, 3, 2, 2, '#0a0a10');
        r(9, 3, 2, 2, '#0a0a10');
        r(6, 3, 1, 1, '#9affb0');
        r(9, 3, 1, 1, '#9affb0');
        r(7, 6, 3, 1, '#0a0a10');
      } else if (mon === 'ethelgar') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(4, 13 - fl, 3, 2, '#8a8a96');
        r(9, 13 - fr, 3, 2, '#8a8a96');
        r(3, 6, 10, 8, '#5a5a64');
        r(3, 6, 4, 3, '#8a8a96');
        r(3, 12, 10, 1, '#14141a');
        r(7, 8, 2, 5, '#8a8a96');
        r(1, 7, 2, 5, '#d8d8c8');
        r(13, 7, 2, 5, '#d8d8c8');
        r(5, 1, 6, 6, '#d8d8c8');
        r(5, 1, 6, 1, '#ffffff');
        r(6, 3, 2, 2, '#0a0a10');
        r(9, 3, 2, 2, '#0a0a10');
        r(6, 3, 1, 1, '#ffd23a');
        r(9, 3, 1, 1, '#ffd23a');
        r(7, 6, 3, 1, '#0a0a10');
        r(0, 4, 2, 9, '#8a8a96');
        r(13, 3, 1, 10, '#c4cad2');
        r(3, 0, 10, 2, '#7a7a86');
      } else if (mon === 'morwenna_pickman') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(4, 13 - fl, 3, 2, '#e8e0d0');
        r(9, 13 - fr, 3, 2, '#e8e0d0');
        r(3, 6, 10, 8, '#2a2a40');
        r(3, 6, 4, 3, '#e8e0d0');
        r(3, 12, 10, 1, '#14141a');
        r(7, 8, 2, 5, '#e8e0d0');
        r(1, 7, 2, 5, '#e8e0d0');
        r(13, 7, 2, 5, '#e8e0d0');
        r(5, 1, 6, 6, '#e8e0d0');
        r(5, 1, 6, 1, '#ffffff');
        r(6, 3, 2, 2, '#0a0a10');
        r(9, 3, 2, 2, '#0a0a10');
        r(6, 3, 1, 1, '#c070ff');
        r(9, 3, 1, 1, '#c070ff');
        r(7, 6, 3, 1, '#0a0a10');
        r(3, 0, 10, 2, '#e8e0d0');
        r(4, 0, 2, 3, '#c8c0b0');
        r(10, 0, 2, 3, '#c8c0b0');
        r(14, 2, 1, 11, '#6a4426');
        r(13, 1, 3, 2, '#9affb0');
      } else if (mon === 'mere_eel') {
        const w = step === 1 ? 1 : 0;
        r(0, 10 - w, 3, 2, '#2a4a52');
        r(2, 9 + w, 3, 3, '#34606a');
        r(4, 8 - w, 3, 3, '#2a4a52');
        r(6, 8 + w, 3, 3, '#34606a');
        r(8, 7 - w, 3, 3, '#2a4a52');
        r(10, 6, 4, 4, '#3e7480');
        r(10, 6, 4, 1, '#6aa8b4');
        r(14, 7, 2, 2, '#2a4a52');
        r(15, 8, 1, 1, '#d8f0f4');
        r(12, 7, 1, 1, '#ffe05a');
        r(2, 11, 8, 1, '#1c343a');
      } else if (mon === 'drowned_sailor') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(4, 13 - fl, 3, 2, '#506a68');
        r(9, 13 - fr, 3, 2, '#506a68');
        r(3, 6, 10, 8, '#2a4a4a');
        r(3, 6, 4, 3, '#506a68');
        r(3, 12, 10, 1, '#101820');
        r(7, 8, 2, 5, '#506a68');
        r(1, 7, 2, 5, '#8aa89c');
        r(13, 7, 2, 5, '#8aa89c');
        r(5, 1, 6, 6, '#8aa89c');
        r(5, 1, 6, 1, '#ffffff');
        r(6, 3, 2, 2, '#081018');
        r(9, 3, 2, 2, '#081018');
        r(6, 3, 1, 1, '#9affd8');
        r(9, 3, 1, 1, '#9affd8');
        r(7, 6, 3, 1, '#081018');
        r(3, 0, 10, 2, '#1c343a');
        r(1, 12, 2, 2, '#506a68');
      } else if (mon === 'drowned_voice') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(4, 13 - fl, 3, 2, '#7a7aa0');
        r(9, 13 - fr, 3, 2, '#7a7aa0');
        r(3, 6, 10, 8, '#3a3a5a');
        r(3, 6, 4, 3, '#7a7aa0');
        r(3, 12, 10, 1, '#101820');
        r(7, 8, 2, 5, '#7a7aa0');
        r(1, 7, 2, 5, '#b8c0d8');
        r(13, 7, 2, 5, '#b8c0d8');
        r(5, 1, 6, 6, '#b8c0d8');
        r(5, 1, 6, 1, '#ffffff');
        r(6, 3, 2, 2, '#081018');
        r(9, 3, 2, 2, '#081018');
        r(6, 3, 1, 1, '#d8e0ff');
        r(9, 3, 1, 1, '#d8e0ff');
        r(7, 6, 3, 1, '#081018');
        r(4, 0, 8, 1, '#7a7aa0');
        r(2, 3, 1, 4, '#b8c0d8');
        r(13, 3, 1, 4, '#b8c0d8');
      } else if (mon === 'nyth_ael') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(4, 13 - fl, 3, 2, '#d8c878');
        r(9, 13 - fr, 3, 2, '#d8c878');
        r(3, 6, 10, 8, '#1c4a52');
        r(3, 6, 4, 3, '#d8c878');
        r(3, 12, 10, 1, '#101820');
        r(7, 8, 2, 5, '#d8c878');
        r(1, 7, 2, 5, '#7aa8a0');
        r(13, 7, 2, 5, '#7aa8a0');
        r(5, 1, 6, 6, '#7aa8a0');
        r(5, 1, 6, 1, '#ffffff');
        r(6, 3, 2, 2, '#081018');
        r(9, 3, 2, 2, '#081018');
        r(6, 3, 1, 1, '#ffe05a');
        r(9, 3, 1, 1, '#ffe05a');
        r(7, 6, 3, 1, '#081018');
        r(3, 0, 10, 2, '#d8c878');
        r(2, 2, 2, 3, '#d8c878');
        r(12, 2, 2, 3, '#d8c878');
        r(14, 3, 1, 10, '#6a4426');
        r(13, 2, 3, 2, '#7ae8d8');
      } else if (mon === 'ambrose_silt') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(4, 13 - fl, 3, 2, '#8a8a6a');
        r(9, 13 - fr, 3, 2, '#8a8a6a');
        r(3, 6, 10, 8, '#4a4a3a');
        r(3, 6, 4, 3, '#8a8a6a');
        r(3, 12, 10, 1, '#101820');
        r(7, 8, 2, 5, '#8a8a6a');
        r(1, 7, 2, 5, '#c8c8a8');
        r(13, 7, 2, 5, '#c8c8a8');
        r(5, 1, 6, 6, '#c8c8a8');
        r(5, 1, 6, 1, '#ffffff');
        r(6, 3, 2, 2, '#081018');
        r(9, 3, 2, 2, '#081018');
        r(6, 3, 1, 1, '#ffd23a');
        r(9, 3, 1, 1, '#ffd23a');
        r(7, 6, 3, 1, '#081018');
        r(3, 0, 10, 2, '#6a6a4a');
        r(0, 6, 2, 8, '#8a8a6a');
        r(3, 13, 10, 1, '#c8c8a8');
      } else if (mon === 'prince_elrenor') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(4, 13 - fl, 3, 2, '#d8d8f0');
        r(9, 13 - fr, 3, 2, '#d8d8f0');
        r(3, 6, 10, 8, '#1c2a5a');
        r(3, 6, 4, 3, '#d8d8f0');
        r(3, 12, 10, 1, '#101820');
        r(7, 8, 2, 5, '#d8d8f0');
        r(1, 7, 2, 5, '#a8b8d8');
        r(13, 7, 2, 5, '#a8b8d8');
        r(5, 1, 6, 6, '#a8b8d8');
        r(5, 1, 6, 1, '#ffffff');
        r(6, 3, 2, 2, '#081018');
        r(9, 3, 2, 2, '#081018');
        r(6, 3, 1, 1, '#7affe8');
        r(9, 3, 1, 1, '#7affe8');
        r(7, 6, 3, 1, '#081018');
        r(4, 0, 8, 2, '#f0d860');
        r(4, -1, 2, 2, '#f0d860');
        r(7, -1, 2, 2, '#f0d860');
        r(10, -1, 2, 2, '#f0d860');
        r(14, 2, 1, 11, '#c0c8d8');
        r(13, 1, 3, 2, '#7affe8');
      } else if (mon === 'foreman_below') {
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(4, 13 - fl, 3, 2, '#2a3836');
        r(9, 13 - fr, 3, 2, '#2a3836');
        r(3, 6, 10, 8, '#4a4036');
        r(3, 6, 4, 3, '#62564a');
        r(3, 12, 10, 1, '#2a2018');
        r(7, 7, 1, 1, '#c8a050');
        r(7, 9, 1, 1, '#c8a050');
        r(7, 11, 1, 1, '#c8a050');
        r(1, 7, 2, 5, '#7aa49c');
        r(13, 5, 2, 5, '#5a847c');
        r(13, 3, 1, 10, '#6a4426');
        r(11, 2, 5, 2, '#9aa0aa');
        r(11, 2, 5, 1, '#c4cad2');
        r(4, 1, 8, 6, '#7aa49c');
        r(4, 1, 8, 2, '#98c4bc');
        r(10, 3, 2, 4, '#5a847c');
        r(5, 4, 6, 3, '#2a4a3a');
        r(4, 6, 1, 3, '#2a4a3a');
        r(11, 6, 1, 3, '#2a4a3a');
        r(5, 3, 2, 2, '#0a1a20');
        r(9, 3, 2, 2, '#0a1a20');
        r(5, 3, 1, 1, '#8affea');
        r(9, 3, 1, 1, '#8affea');
        r(3, 0, 10, 2, '#8a7a3a');
        r(3, 0, 10, 1, '#a89850');
        r(7, 0, 2, 1, '#ffe88a');
        r(4, 8, 1, 3, '#6ac8e8');
        r(11, 9, 1, 3, '#6ac8e8');
      } else if (mon === 'pinegrub_goblin' || mon === 'nutcracker_goblin' || mon === 'mind_goblin') {
        const boss = mon === 'mind_goblin';
        const pal = boss
          ? { m: '#7a9a3c', l: '#98b850', d: '#566e28', cloth: '#5a3a24', clothL: '#7a5232' }
          : mon === 'pinegrub_goblin'
            ? { m: '#6a9a48', l: '#86b862', d: '#4a7434', cloth: '#6a4a2c', clothL: '#8a6238' }
            : { m: '#8a9a4c', l: '#a6b868', d: '#667432', cloth: '#4a4a5c', clothL: '#62627a' };
        const fl = step === 1 ? 1 : 0;
        const fr = step === 2 ? 1 : 0;
        r(4, 13 - fl, 3, 2, pal.d);
        r(9, 13 - fr, 3, 2, pal.d);
        r(3, 6, 10, 8, pal.cloth);
        r(3, 6, 4, 3, pal.clothL);
        r(3, 12, 10, 1, '#2a1a10');
        if (boss) {
          r(2, 7, 12, 7, pal.m);
          r(2, 7, 5, 3, pal.l);
          r(9, 10, 5, 4, pal.d);
          r(5, 11, 6, 1, '#2a1a10');
          r(7, 10, 2, 2, '#d8b04a');
        }
        r(1, 7, 2, 4, pal.m);
        r(13, 7, 2, 4, pal.d);
        r(0, 2, 4, 3, pal.m);
        r(12, 2, 4, 3, pal.d);
        r(0, 3, 2, 1, pal.l);
        r(4, 1, 8, 6, pal.m);
        r(4, 1, 8, 2, pal.l);
        r(10, 3, 2, 4, pal.d);
        r(4, 3, 3, 2, '#fff2b0');
        r(9, 3, 3, 2, '#fff2b0');
        r(5, 4, 1, 1, '#c82820');
        r(10, 4, 1, 1, '#c82820');
        r(4, 2, 3, 1, '#2a1a10');
        r(9, 2, 3, 1, '#2a1a10');
        r(7, 4, 2, 2, pal.d);
        r(5, 6, 6, 1, '#2a1010');
        r(5, 5, 1, 2, '#f4ecc8');
        r(10, 5, 1, 2, '#f4ecc8');
        if (boss) {
          r(5, 1, 1, 1, pal.d);
          r(9, 0, 2, 1, pal.d);
          r(3, 4, 1, 1, pal.d);
          r(12, 5, 1, 1, pal.l);
          r(13, 9, 3, 3, '#a8764a');
          r(14, 9, 1, 1, '#d8a46a');
          r(13, 8, 2, 1, '#6a4426');
        } else if (mon === 'pinegrub_goblin') {
          r(13, 8, 2, 4, '#a0743c');
          r(12, 7, 4, 2, '#6a4426');
          r(13, 5, 2, 2, '#4a7a34');
        } else {
          r(13, 3, 2, 9, '#8a5a2c');
          r(12, 2, 4, 3, '#6a6a76');
          r(12, 2, 4, 1, '#9a9aa6');
        }
      } else {
        r(3, 3, 10, 10, '#c04040');
        r(3, 3, 10, 2, '#d85a5a');
      }
    });
    if (BOSS_SCALE[mon]) {
      ctx.save();
      const bx = x + 8 * s;
      const by = y + 15 * s;
      ctx.translate(bx, by);
      ctx.scale(BOSS_SCALE[mon], BOSS_SCALE[mon]);
      ctx.translate(-bx, -by);
      blit(ctx, c, x, y, s, bob);
      ctx.restore();
      return;
    }
    blit(ctx, c, x, y, s, bob);
  }

  /** What a hero visibly holds. Only your own gear is known to the client, so others show a plain blade. */

  // ---- people, resources, and stations of the towns

  const HATS = { none: 0, hood: 1, feather: 2, helm: 3 };

  /** The same figure the players use, dressed in the NPC's own colors. */
  function npcLook(def) {
    if (def.figure) return def.figure;
    const k = def.look;
    const tone = SKIN_TONES[k.skin] || SKIN_TONES[1];
    def.figure = {
      hat: HATS[k.hat] || 0, g: k.g, skin: tone, skinIx: SKIN_TONES[k.skin] ? k.skin : 1, hairSeed: hash(String(def.id || def.name || '')) >>> 12, skinShade: tint(tone, 0.82),
      body: k.cloth, bodyShade: tint(k.cloth, 0.75), bodyLight: tint(k.cloth, 1.25), trim: k.accent,
      hair: k.hair, hairShade: tint(k.hair, 0.75), hairLight: tint(k.hair, 1.25),
    };
    return def.figure;
  }

  /** A tile-sized sprite drawn right on its tile, with no ground shadow. */
  function blitTile(ctx, c, x, y, s) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(c, Math.round(x - 2 * s), Math.round(y - 2 * s), c.width * s, c.height * s);
  }

  function paintNode(r, node, depleted, phase) {
    const base = node.tint;
    const dark = tint(base, 0.6);
    const light = tint(base, 1.35);
    if (node.art === 'tree') {
      const birch = node.id === 'birch_tree';
      const wood = birch ? '#e4e0d4' : '#6a4426';
      const woodDark = birch ? '#a8a49a' : '#4e301a';
      const wide = node.id === 'oak_tree' ? 4 : 3;
      if (depleted) {
        r(8 - wide, 11, wide * 2, 5, wood);
        r(8 - wide, 11, wide * 2, 1, '#d2a870');
        r(7, 11, 3, 1, '#b88850');
        r(8 - wide, 15, wide * 2, 1, woodDark);
        return;
      }
      r(8 - Math.floor(wide / 2) - 1, 9, wide, 7, wood);
      r(8 + Math.floor(wide / 2) - 1, 9, 1, 7, woodDark);
      if (birch) {
        r(7, 11, 1, 1, '#2a2a2a');
        r(8, 13, 1, 1, '#2a2a2a');
      }
      const rows = [[5, 10], [3, 12], [2, 13], [1, 14], [1, 14], [1, 14], [1, 14], [1, 14], [2, 13], [3, 12]];
      rows.forEach(([a, b], y) => r(a, y, b - a + 1, 1, y >= 8 ? dark : base));
      for (let y = 2; y < 8; y++) r(12, y, 2, 1, dark);
      r(4, 2, 3, 2, light);
      r(8, 1, 3, 1, light);
      r(3, 5, 2, 1, light);
      r(7, 5, 2, 1, dark);
      r(10, 7, 2, 1, dark);
      if (node.id === 'willow_tree') {
        r(2, 10, 1, 4, base);
        r(4, 11, 1, 3, base);
        r(11, 11, 1, 3, base);
        r(13, 10, 1, 4, base);
      }
    } else if (node.art === 'rock') {
      const rows = [[5, 10], [3, 12], [2, 13], [2, 13], [2, 13], [2, 13], [2, 13], [2, 13], [3, 12], [4, 11]];
      if (depleted) {
        r(3, 12, 10, 3, '#5c5c68');
        r(5, 11, 6, 1, '#6e6e7a');
        r(4, 12, 2, 1, '#8a8a94');
        r(9, 13, 2, 1, '#8a8a94');
        return;
      }
      rows.forEach(([a, b], i) => r(a, 4 + i, b - a + 1, 1, i >= 7 ? '#5c5c68' : '#8a8a94'));
      for (let i = 0; i < 6; i++) r(11, 5 + i, 2, 1, '#5c5c68');
      r(4, 5, 4, 1, '#b4b4be');
      r(3, 6, 2, 2, '#b4b4be');
      for (const [x, y] of [[4, 8], [9, 6], [7, 10], [11, 9]]) {
        r(x, y, 2, 2, base);
        r(x, y, 1, 1, light);
      }
    } else if (node.art === 'fish') {
      r(5, 9, 5, 2, '#2e5a7c');
      r(10, 9, 2, 1, '#2e5a7c');
      r(10, 11, 2, 1, '#2e5a7c');
      r(6, 9, 1, 1, '#9ad0e8');
      const rx = [3, 5, 7][phase];
      const ry = [1, 2, 3][phase];
      const c = phase === 2 ? tint(base, 0.8) : base;
      r(8 - rx + 1, 9 - ry, rx * 2 - 1, 1, c);
      r(8 - rx + 1, 9 + ry + 1, rx * 2 - 1, 1, c);
      r(8 - rx, 9 - ry + 1, 1, ry * 2, c);
      r(8 + rx, 9 - ry + 1, 1, ry * 2, c);
      if (phase === 1) {
        r(7, 4, 3, 1, '#e8f4fa');
        r(6, 5, 1, 1, '#cfe8f0');
        r(10, 5, 1, 1, '#cfe8f0');
      }
    } else {
      const rows = [[5, 10], [3, 12], [2, 13], [2, 13], [2, 13], [2, 13]];
      rows.forEach(([a, b], i) => r(a, 8 + i, b - a + 1, 1, i > 3 ? dark : base));
      r(4, 9, 3, 1, light);
      if (depleted) {
        r(5, 11, 6, 1, dark);
      } else {
        r(5, 11, 6, 3, '#1a1008');
        r(6, 10, 4, 1, '#1a1008');
        r(6, 13, 4, 1, dark);
      }
      r(1, 13, 2, 2, '#4a8a3c');
      r(13, 13, 2, 2, '#4a8a3c');
      r(2, 12, 1, 1, '#6aae54');
    }
  }

  function drawNode(ctx, node, depleted, x, y, s, now) {
    const phase = node.art === 'fish' ? Math.floor(now / 420) % 3 : 0;
    const c = sprite(`n|${node.id}|${depleted ? 1 : 0}|${phase}`, (r) => paintNode(r, node, depleted, phase));
    blitTile(ctx, c, x, y, s);
  }

  function paintStation(r, id, phase) {
    if (id === 'anchor') {
      r(2, 13, 12, 2, '#4a4a56');
      r(3, 11, 10, 3, '#6a6a76');
      r(3, 11, 10, 1, '#8a8a96');
      r(6, 5, 4, 7, '#7a7a86');
      r(6, 5, 1, 7, '#9a9aa6');
      r(7, 7, 2, 1, '#3a3a46');
      r(7, 9, 2, 1, '#3a3a46');
      r(7, 0 + phase, 2, 5, '#5ec8ff');
      r(6, 1 + phase, 4, 3, '#9ae6ff');
      r(7, 1 + phase, 1, 2, '#ffffff');
      r(phase ? 3 : 12, 4, 1, 1, '#bff0ff');
      r(phase ? 12 : 3, 7, 1, 1, '#8fdcff');
    } else if (id === 'furnace') {
      r(2, 3, 12, 12, '#7a7a84');
      r(2, 3, 12, 2, '#9a9aa4');
      r(12, 5, 2, 10, '#5c5c68');
      r(10, 0, 3, 4, '#5c5c68');
      r(5, 7, 6, 8, '#1a1210');
      r(5, 7, 6, 1, '#454552');
      r(6, 10, 4, 4, phase ? '#ff8a2a' : '#ff7a1a');
      r(7, 9 + phase, 2, 3, '#ffd84a');
      r(11, 1 - phase, 1, 1, '#b0b0b8');
    } else if (id === 'anvil') {
      r(4, 11, 8, 5, '#6a4426');
      r(4, 11, 8, 1, '#8a5a30');
      r(2, 6, 12, 3, '#5c6270');
      r(0, 6, 3, 2, '#6c7280');
      r(4, 9, 8, 2, '#454a56');
      r(3, 6, 10, 1, '#a0a8b8');
      r(12, 3, 1, 3, '#8a5a2c');
      r(11, 2, 3, 2, '#9aa0aa');
    } else if (id === 'range') {
      r(2, 5, 12, 10, '#4a4046');
      r(2, 4, 12, 2, '#2a2428');
      r(2, 5, 12, 1, '#5a5058');
      r(5, 9, 6, 5, '#1a1210');
      r(6, 11, 4, 3, phase ? '#ff8a2a' : '#ff7a1a');
      r(7, 10 + phase, 2, 2, '#ffd84a');
      r(4, 1, 8, 3, '#8a8a94');
      r(4, 1, 8, 1, '#b4b4be');
      r(12, 2, 2, 1, '#6a4426');
    } else if (id === 'bench') {
      r(1, 7, 14, 3, '#a8743c');
      r(1, 7, 14, 1, '#c89050');
      r(2, 10, 2, 5, '#6a4426');
      r(12, 10, 2, 5, '#6a4426');
      r(4, 13, 8, 1, '#6a4426');
      r(3, 4, 1, 3, '#8a5a2c');
      r(2, 4, 3, 1, '#9aa0aa');
      r(7, 6, 6, 1, '#c0c4cc');
      r(12, 5, 2, 1, '#8a5a2c');
    } else if (id === 'bellstone') {
      const glow = phase ? '#9aeaff' : '#5ac8e8';
      r(3, 13, 10, 3, '#454a5c');
      r(5, 1, 6, 13, '#5a6a8a');
      r(6, 0, 4, 1, '#5a6a8a');
      r(5, 1, 1, 13, '#7a8aaa');
      r(10, 2, 1, 12, '#3a4666');
      r(7, 3, 2, 1, glow);
      r(7, 6, 2, 1, glow);
      r(6, 9, 4, 1, glow);
      r(7, 11, 2, 1, glow);
    } else if (id === 'crown_stand') {
      r(4, 8, 8, 7, '#8a7a5a');
      r(3, 7, 10, 2, '#c8b078');
      r(3, 7, 10, 1, '#e0cc98');
      r(5, 5, 6, 3, '#7a1a2a');
      r(5, 5, 6, 1, '#9a2a3a');
      r(7, 6, 2, 1, '#5a0a1a');
      r(4, 14, 8, 1, '#6a5a3a');
    } else if (id.startsWith('sign_')) {
      const warn = id === 'sign_warren' || id === 'sign_delve';
      r(7, 7, 2, 8, '#6a4426');
      r(7, 7, 1, 8, '#8a5a30');
      r(2, 2, 12, 6, warn ? '#7a2a22' : '#8a5a2c');
      r(3, 3, 10, 4, warn ? '#c84a3a' : '#c8965a');
      r(4, 4, 8, 1, warn ? '#f4e4c8' : '#5a3a1c');
      r(4, 6, 6, 1, warn ? '#f4e4c8' : '#5a3a1c');
    } else if (id === 'ruin_stone' || id.startsWith('lore_') || id.startsWith('egg_') || id.startsWith('secret_')) {
      r(4, 4, 8, 11, '#8a8680');
      r(4, 4, 8, 2, '#aaa69c');
      r(9, 6, 3, 9, '#6a6660');
      r(5, 8, 5, 1, '#4a4640');
      r(5, 11, 4, 1, '#4a4640');
      r(3, 14, 10, 1, '#5a564e');
    } else if (id === 'signal_stone') {
      r(3, 10, 10, 5, '#6a6660');
      r(3, 10, 10, 1, '#8a867e');
      r(4, 6, 8, 5, '#4a4640');
      r(5, 6, 6, 1, '#2a2622');
      r(5, 7, 6, 3, '#1a1612');
      r(6, 8, 1, 1, '#5a3a24');
      r(9, 7, 1, 1, '#3a2a1c');
      r(2, 13, 1, 2, '#8a5a30');
    } else if (id === 'notice_board' || id === 'dunhollow_board') {
      r(2, 6, 2, 9, '#6a4426');
      r(12, 6, 2, 9, '#6a4426');
      r(1, 1, 14, 9, '#8a5a2c');
      r(2, 2, 12, 7, '#a8743c');
      r(3, 3, 4, 5, '#efe6d0');
      r(8, 3, 4, 3, '#e8dcb8');
      r(9, 7, 4, 1, '#efe6d0');
      r(4, 3, 1, 1, '#c83030');
      r(9, 3, 1, 1, '#c83030');
    } else {
      r(2, 6, 12, 9, '#8a8a94');
      r(2, 6, 12, 2, '#b4b4be');
      r(4, 8, 8, 4, '#3a78c0');
      r(5, 8, 3, 1, '#6aaaf0');
      r(2, 1, 2, 7, '#6a4426');
      r(12, 1, 2, 7, '#6a4426');
      r(1, 0, 14, 2, '#8a5a2c');
      r(8, 2, 1, 4, '#c8b078');
      r(7, 6, 3, 2, '#6a4426');
    }
  }

  function drawStation(ctx, id, x, y, s, now) {
    const phase = Math.floor(now / 260) % 2;
    const moving = id === 'furnace' || id === 'range' || id === 'bellstone' || id === 'anchor';
    const c = sprite(`s|${id}|${moving ? phase : 0}`, (r) => paintStation(r, id, phase));
    blitTile(ctx, c, x, y, s);
  }

  // ---- gear looks: every worn item draws from its own id. Metal follows the tier, wood follows the name, leather and mail follow the set.

  const GEAR_METALS = [
    null,
    { m: '#c07a38', l: '#e8b068', d: '#7a4a1c', trim: '#8a5a2c' }, // bronze
    { m: '#9aa0ae', l: '#c8ccd8', d: '#5e6272', trim: '#5e6272' }, // iron
    { m: '#dfe6f2', l: '#ffffff', d: '#98a2b8', trim: '#c89a3c' }, // steel
    { m: '#8ad8f0', l: '#e8fcff', d: '#3c8cb4', trim: '#e8c050' }, // mithril
  ];
  const GEAR_WOODS = {
    pine: ['#c09858', '#8a6a38'], birch: ['#e4d8b8', '#b8a880'], oak: ['#8a5a2c', '#5e3a1a'], willow: ['#7a9858', '#4e6a38'],
    hazel: ['#a8743c', '#6e4822'], rowan: ['#9a4a3a', '#6a2c22'], yew: ['#5e4a3a', '#382a20'], elder: ['#7a5a8e', '#4e3a60'],
  };
  const TIER_WOOD = ['', 'hazel', 'oak', 'yew', 'elder'];
  const STAFF_ORB = { hazel: '#8ad06a', rowan: '#e0505a', yew: '#b08ae0', elder: '#f4f0dc' };

  function itemDef(id) {
    return id && G && G.data ? G.data.items.get(id) || null : null;
  }

  function woodOf(id, tier) {
    const first = String(id).split('_')[0];
    return GEAR_WOODS[GEAR_WOODS[first] ? first : TIER_WOOD[tier] || 'oak'];
  }

  /** The held-gear description the figure sprite is cut from. `g` holds item ids: w, o, h, b, c. */
  function gearHeld(g) {
    const w = itemDef(g.w);
    const o = itemDef(g.o);
    return {
      weapon: w ? w.weaponClass || 'blade' : null,
      wid: w ? g.w : '',
      wt: w ? w.tier || 1 : 1,
      element: w && w.element ? w.element : '',
      shield: Boolean(o && o.kind === 'armor'),
      offPistol: Boolean(o && o.weaponClass === 'pistol'),
      oid: o ? g.o : '',
      hid: itemDef(g.h) ? g.h : '',
      bid: itemDef(g.b) ? g.b : '',
      cid: itemDef(g.c) ? g.c : '',
    };
  }

  function paintWeapon(r, cls, id) {
    const def = itemDef(id) || {};
    const t = Math.max(1, Math.min(4, def.tier || 1));
    const M = GEAR_METALS[t];
    const [w, wd] = woodOf(id, t);
    const gold = '#c89a3c';
    const leather = '#6a4020';
    if (cls === 'blade') {
      const len = 9 + t;
      const top = 17 - len;
      r(4, top, 2, len, M.m);
      r(4, top, 1, len, M.l);
      r(5, top + 2, 1, len - 2, M.d);
      r(4, top, 2, 1, M.l);
      if (t === 4) r(3, top + 3, 1, 3, '#e8fcff66');
      r(t >= 3 ? 2 : 3, 17, t >= 3 ? 6 : 4, 1, t >= 3 ? M.trim : wd);
      if (t === 2) r(3, 17, 4, 1, M.d);
      r(4, 18, 2, 2, leather);
      if (t >= 3) r(4, 20, 2, 1, t === 4 ? '#ff6aa0' : gold);
    } else if (cls === 'dagger') {
      const len = 3 + t;
      r(4, 17 - len, 2, len, M.m);
      r(4, 17 - len, 1, len, M.l);
      if (t >= 2) r(5, 18 - len, 1, len - 1, M.d);
      r(3, 17, 4, 1, t >= 3 ? M.trim : wd);
      r(4, 18, 2, 2, t === 4 ? '#3c3060' : leather);
      if (t === 4) r(4, 20, 2, 1, '#ff6aa0');
    } else if (cls === 'bow') {
      const tip = t >= 2 ? M.trim : w;
      r(3, 5, 2, 1, w);
      r(2, 6, 2, 10, w);
      r(3, 16, 2, 1, w);
      r(2, 6, 1, 10, wd);
      r(5, 6, 1, 10, '#ece8d6');
      if (t >= 2) {
        r(3, 4, 2, 1, tip);
        r(3, 17, 2, 1, tip);
        r(2, 10, 2, 2, t === 2 ? '#c89a3c' : '#4a3018');
      }
      if (t >= 3) r(1, 9, 1, 4, w);
      if (t === 4) r(4, 8, 1, 1, '#9affc0');
    } else if (cls === 'mace') {
      const hammer = String(id).includes('hammer');
      r(4, 8, 2, 11, w);
      r(4, 8, 1, 11, wd);
      if (hammer) {
        r(1, 3, 8, 4, M.m);
        r(1, 3, 8, 1, M.l);
        r(1, 6, 8, 1, M.d);
        r(4, 1, 2, 2, M.l);
        r(0, 4, 1, 2, M.d);
        r(9, 4, 1, 2, M.d);
        r(3, 7, 4, 1, M.trim);
        if (t === 4) r(4, 4, 2, 2, '#e8fcff');
      } else {
        r(2, 3, 6, 5, M.m);
        r(2, 3, 6, 1, M.l);
        r(2, 7, 6, 1, M.d);
        r(4, 2, 2, 1, M.l);
        r(1, 5, 1, 1, M.l);
        r(8, 5, 1, 1, M.l);
        r(3, 8, 4, 1, M.d);
        if (t === 2) r(3, 5, 4, 1, M.d);
      }
    } else if (cls === 'spear') {
      r(4, 3, 2, 18, w);
      r(4, 3, 1, 18, wd);
      const head = [null, [4, 1, 2, 3], [3, 0, 4, 4], [3, 0, 4, 4], [3, -1, 4, 5]][t];
      r(head[0], head[1], head[2], head[3], M.m);
      r(head[0], head[1], 1, head[3], M.l);
      r(4, head[1], 2, 1, M.l);
      if (t === 1) r(4, 4, 2, 1, leather);
      if (t === 2) {
        r(3, 4, 4, 1, M.d);
        r(3, 5, 1, 2, '#b8402c');
        r(6, 5, 1, 2, '#b8402c');
      }
      if (t >= 3) r(3, 4, 4, 1, gold);
      if (t === 4) {
        r(2, 2, 1, 2, '#e8fcff66');
        r(7, 2, 1, 2, '#e8fcff66');
        r(4, 5, 2, 1, '#ff6aa0');
      }
    } else if (cls === 'crossbow') {
      r(2, 9, 8, 2, wd);
      r(1, 6, 2, 4, w);
      r(9, 6, 2, 4, w);
      r(3, 5, 6, 1, '#ece8d6');
      r(5, 8, 2, 4, '#4a3018');
      if (t >= 2) {
        r(1, 5, 2, 1, M.m);
        r(9, 5, 2, 1, M.m);
        r(3, 9, 6, 1, w);
      }
      if (t >= 3) r(5, 7, 2, 1, gold);
      if (t === 4) r(3, 7, 6, 1, M.l);
    } else if (cls === 'pistol') {
      const barrel = 4 + t;
      r(9 - barrel, 9, barrel, 2, M.d);
      r(9 - barrel, 9, barrel, 1, M.m);
      r(8 - barrel, 8, 3, 1, M.l);
      r(7, 11, 2, 4, w);
      r(7, 11, 1, 4, wd);
      if (t >= 3) r(5, 9, 1, 2, M.trim);
      if (t === 4) r(9 - barrel, 8, 1, 1, '#ff6aa0');
    } else if (cls === 'staff') {
      const orb = ELEMENT_COLOR[def.element] || STAFF_ORB[String(id).split('_')[0]] || '#5ac8ff';
      r(4, 5, 2, 16, w);
      r(4, 5, 1, 16, wd);
      if (t === 1) {
        r(3, 1, 4, 4, orb);
        r(4, 2, 1, 1, '#ffffff');
      } else if (t === 2) {
        r(2, 0, 6, 5, orb);
        r(3, 1, 2, 1, '#ffffff');
        r(2, 5, 6, 1, '#c89a3c');
      } else if (t === 3) {
        r(2, 0, 6, 5, orb);
        r(3, 1, 2, 1, '#ffffff');
        r(1, 1, 1, 4, '#c89a3c');
        r(8, 1, 1, 4, '#c89a3c');
        r(3, 5, 4, 1, '#c89a3c');
      } else {
        r(2, 0, 6, 5, orb);
        r(3, 1, 2, 2, '#ffffff');
        r(1, 0, 1, 5, '#e8c050');
        r(8, 0, 1, 5, '#e8c050');
        r(3, 5, 4, 1, '#e8c050');
        r(0, 2, 1, 1, orb);
        r(9, 2, 1, 1, orb);
        r(5, -1, 1, 1, orb);
      }
      r(5, 3, 2, 1, '#00000044');
    }
  }

  /** The offhand, drawn on the right arm. Each set has its own shield; a few named items have their own. */
  function paintShield(r, id) {
    const def = itemDef(id) || {};
    const t = Math.max(1, Math.min(4, def.tier || 1));
    if (id === 'nutcracker_buckler') {
      r(18, 13, 3, 1, '#8a5a2c');
      r(17, 14, 5, 5, '#a8743c');
      r(18, 19, 3, 1, '#6e4822');
      r(19, 14, 1, 5, '#4a2e14');
      r(17, 16, 5, 1, '#e8a040');
      r(18, 15, 1, 1, '#d8c890');
      r(20, 17, 1, 1, '#d8c890');
    } else if (id === 'tidal_aegis') {
      r(18, 13, 3, 1, '#2a7a8c');
      r(17, 14, 5, 5, '#3aa0b0');
      r(18, 19, 3, 1, '#2a7a8c');
      r(17, 14, 5, 1, '#b8f0f0');
      r(17, 16, 2, 1, '#e8fcff');
      r(19, 17, 2, 1, '#e8fcff');
      r(19, 15, 1, 1, '#e8fcff');
      r(19, 16, 1, 1, '#f4f0dc');
      r(21, 15, 1, 3, '#1c5a6a');
    } else if (t === 1) {
      r(18, 13, 3, 1, '#a0703c');
      r(17, 14, 5, 5, '#a0703c');
      r(18, 19, 3, 1, '#7a4e2a');
      r(18, 15, 1, 3, '#b88450');
      r(19, 16, 1, 1, '#d8c890');
      r(21, 14, 1, 5, '#7a4e2a');
    } else if (t === 2) {
      r(18, 13, 3, 1, '#9aa0ae');
      r(17, 14, 5, 5, '#5e3a1e');
      r(18, 19, 3, 1, '#9aa0ae');
      r(17, 14, 1, 5, '#9aa0ae');
      r(21, 14, 1, 5, '#7a808e');
      r(18, 15, 1, 1, '#c8ccd8');
      r(20, 15, 1, 1, '#c8ccd8');
      r(18, 17, 1, 1, '#c8ccd8');
      r(20, 17, 1, 1, '#c8ccd8');
      r(19, 16, 1, 1, '#e8c860');
    } else if (t === 3) {
      r(17, 13, 5, 1, '#c8ccd8');
      r(17, 14, 5, 4, '#8a90a0');
      r(18, 18, 3, 1, '#8a90a0');
      r(19, 19, 1, 1, '#6e7484');
      r(19, 14, 1, 5, '#dfe6f2');
      r(17, 16, 5, 1, '#dfe6f2');
      r(17, 14, 1, 1, '#5e6272');
      r(21, 14, 1, 1, '#5e6272');
      r(18, 15, 1, 1, '#5e6272');
      r(20, 17, 1, 1, '#5e6272');
    } else {
      r(17, 13, 5, 1, '#e8c050');
      r(17, 14, 5, 4, '#5cb8e0');
      r(18, 18, 3, 1, '#5cb8e0');
      r(19, 19, 1, 1, '#3c8cb4');
      r(17, 14, 1, 4, '#8ad8f0');
      r(21, 14, 1, 4, '#3c8cb4');
      r(19, 14, 1, 4, '#e8fcff');
      r(18, 15, 3, 1, '#e8c050');
      r(19, 16, 1, 1, '#ff6aa0');
    }
  }

  /** Cloak, painted behind the hero so only the flare shows beside the arms and below the hem of the tunic. */
  function paintCloak(r, id) {
    const t = Math.max(1, Math.min(4, (itemDef(id) || {}).tier || 1));
    const [m, d, l] = [['#7a4e2a', '#5a3a1e', '#9a6a3a'], ['#4e3018', '#33200e', '#6a4428'], ['#6a7080', '#4a5060', '#9aa0b0'], ['#2a6aa8', '#1c4a80', '#5cb8e0']][t - 1];
    r(6, 11, 13, 9, m);
    r(5, 15, 15, 6, m);
    r(5, 20, 15, 1, d);
    r(5, 15, 1, 5, d);
    r(19, 15, 1, 5, d);
    r(7, 11, 11, 1, l);
    if (t === 2) {
      r(6, 17, 1, 3, d);
      r(18, 17, 1, 3, d);
    }
    if (t === 3) for (let x = 5; x < 20; x += 2) r(x, 20, 1, 1, l);
    if (t === 4) {
      r(5, 21, 15, 1, '#e8c050');
      r(5, 15, 1, 6, '#e8c050');
      r(19, 15, 1, 6, '#e8c050');
    }
  }

  /** The clasp that holds the cloak, over the shoulders. */
  function paintClasp(r, id) {
    const t = (itemDef(id) || {}).tier || 1;
    r(10, 12, 5, 1, t === 4 ? '#e8c050' : t === 3 ? '#c8ccd8' : '#3a2410');
    r(12, 12, 1, 1, t === 4 ? '#ff6aa0' : '#e8c860');
  }

  /** Body armor over the tunic: arms and torso, with a skirt for the dress-shaped build. */
  function paintBody(r, id, fem) {
    const t = Math.max(1, Math.min(4, (itemDef(id) || {}).tier || 1));
    const skirt = (c) => fem && r(7, 16, 11, 3, c);
    const belt = fem ? 15 : 17;
    if (t === 1) {
      r(8, 12, 9, fem ? 4 : 7, '#8a5a30');
      skirt('#8a5a30');
      r(6, 12, 2, 5, '#7a4e2a');
      r(17, 12, 2, 5, '#5e3c1e');
      r(8, 12, 4, 2, '#a87642');
      r(12, 13, 1, fem ? 3 : 5, '#d8c898');
      r(8, belt, 9, 1, '#5e3c1e');
    } else if (t === 2) {
      r(8, 12, 9, fem ? 4 : 7, '#5e3a1e');
      skirt('#4a2e14');
      r(6, 12, 2, 5, '#4a2e14');
      r(17, 12, 2, 5, '#33200e');
      r(5, 11, 3, 2, '#7a4e2a');
      r(17, 11, 3, 2, '#5e3c1e');
      for (const [x, y] of [[9, 13], [15, 13], [9, 15], [15, 15], [12, 14]]) r(x, y, 1, 1, '#c8ccd8');
      r(8, belt, 9, 1, '#33200e');
      r(11, belt, 3, 1, '#e8c860');
    } else if (t === 3) {
      r(8, 12, 9, fem ? 4 : 7, '#8a90a0');
      skirt('#7a808e');
      r(6, 12, 2, 5, '#8a90a0');
      r(17, 12, 2, 5, '#6e7484');
      for (let y = 12; y < (fem ? 16 : 19); y++) for (let x = 8 + (y % 2); x < 17; x += 2) r(x, y, 1, 1, '#c8ccd8');
      for (let y = 12; y < 17; y += 2) {
        r(6, y, 1, 1, '#c8ccd8');
        r(17, y + 1, 1, 1, '#a0a6b6');
      }
      if (fem) for (let x = 8; x < 18; x += 2) r(x, 17, 1, 1, '#c8ccd8');
      r(8, belt, 9, 1, '#5e6272');
      r(11, belt, 3, 1, '#c89a3c');
    } else {
      r(8, 12, 9, fem ? 4 : 7, '#5cb8e0');
      skirt('#3c8cb4');
      r(6, 12, 2, 5, '#5cb8e0');
      r(17, 12, 2, 5, '#3c8cb4');
      r(5, 11, 3, 3, '#8ad8f0');
      r(17, 11, 3, 3, '#5aa8d0');
      r(5, 11, 3, 1, '#e8fcff');
      r(17, 11, 3, 1, '#e8fcff');
      r(8, 12, 9, 1, '#e8c050');
      r(9, 13, 3, 2, '#e8fcff');
      r(12, 13, 1, fem ? 3 : 5, '#e8c050');
      r(12, 14, 1, 2, '#ff6aa0');
      r(8, belt, 9, 1, '#e8c050');
    }
  }

  /** Headgear drawn over the hair. The bone mask gets its face part from paintMask, after the face. */
  function paintHelm(r, id) {
    if (id === 'pickmans_bone_mask') {
      r(6, 0, 12, 3, '#d8d0b8');
      r(5, 2, 2, 4, '#d8d0b8');
      r(17, 2, 2, 4, '#b8b09a');
      r(7, 0, 4, 1, '#f4f0dc');
      r(4, 0, 2, 3, '#ece4cc');
      r(18, 0, 2, 3, '#ece4cc');
    } else if (id === 'foremans_hardhat') {
      r(5, 0, 14, 4, '#f0c020');
      r(4, 4, 16, 1, '#d8a010');
      r(11, 0, 2, 4, '#d8a010');
      r(7, 1, 4, 1, '#fff0a0');
      r(10, 1, 4, 3, '#fffbe0');
      r(11, 2, 2, 1, '#ffd860');
    } else {
      const t = (itemDef(id) || {}).tier || 1;
      if (t === 1) {
        r(6, 0, 12, 4, '#8a5a30');
        r(5, 3, 1, 3, '#7a4e2a');
        r(18, 3, 1, 3, '#5e3c1e');
        r(6, 4, 12, 1, '#6a4020');
        r(8, 1, 4, 1, '#a87642');
        r(13, 2, 3, 1, '#d8c898');
      } else if (t === 2) {
        r(5, 0, 14, 5, '#5e3a1e');
        r(5, 5, 2, 6, '#4a2e14');
        r(17, 5, 2, 6, '#33200e');
        r(6, 4, 12, 1, '#33200e');
        r(7, 1, 4, 1, '#7a4e2a');
        for (const x of [7, 11, 15]) r(x, 2, 1, 1, '#c8ccd8');
      } else if (t === 3) {
        r(5, 0, 14, 5, '#8a90a0');
        r(5, 5, 2, 8, '#8a90a0');
        r(17, 5, 2, 8, '#6e7484');
        r(7, 12, 10, 1, '#6e7484');
        for (let y = 0; y < 13; y += 2) {
          r(5 + (y % 4 ? 1 : 0), y, 1, 1, '#c8ccd8');
          r(17 + (y % 4 ? 0 : 1), y + 1, 1, 1, '#a0a6b6');
        }
        for (let x = 6; x < 18; x += 2) r(x, 1, 1, 1, '#c8ccd8');
        r(6, 4, 12, 1, '#5e6272');
      } else {
        r(5, 0, 14, 5, '#8ad8f0');
        r(5, 5, 2, 6, '#5cb8e0');
        r(17, 5, 2, 6, '#3c8cb4');
        r(5, 4, 14, 1, '#e8c050');
        r(7, 0, 5, 1, '#e8fcff');
        r(11, 5, 3, 3, '#5cb8e0');
        r(3, 0, 2, 4, '#efe4c4');
        r(19, 0, 2, 4, '#d8caa4');
        r(11, 1, 3, 2, '#ff6aa0');
        r(11, -1, 3, 1, '#e8c050');
      }
    }
  }

  /** The pickman's mask covers the lower face and leaves dark sockets where the eyes are. */
  function paintMask(r) {
    r(6, 5, 12, 7, '#ece4cc');
    r(17, 5, 1, 7, '#b8b09a');
    r(8, 6, 3, 3, '#1a1426');
    r(14, 6, 3, 3, '#1a1426');
    r(9, 7, 1, 1, '#ff7a3a');
    r(15, 7, 1, 1, '#ff7a3a');
    r(12, 9, 1, 2, '#8a8470');
    r(8, 11, 9, 1, '#fffdf0');
    for (let x = 9; x < 17; x += 2) r(x, 11, 1, 1, '#8a8470');
  }

  // ---- companions: cosmetic followers drawn in code on the same 16 pixel tile. They face right; the draw flips them.

  const PETS = [
    { id: 'fox', name: 'Fox kit' },
    { id: 'cat', name: 'Hearth cat' },
    { id: 'owl', name: 'Barn owl' },
    { id: 'slime', name: 'Moss slime' },
    { id: 'wisp', name: 'Lantern wisp' },
    { id: 'drake', name: 'Ember drake' },
  ];

  function paintPet(r, id, step) {
    const up = (n) => (step === n ? 1 : 0);
    if (id === 'fox') {
      r(0, 8, 4, 3, '#e07a30');
      r(0, 8, 2, 2, '#f4f0dc');
      r(3, 9, 8, 4, '#e07a30');
      r(4, 12, 6, 1, '#f4e8d0');
      r(9, 6, 5, 5, '#e07a30');
      r(13, 8, 2, 2, '#f4e8d0');
      r(14, 8, 1, 1, '#1a1426');
      r(9, 4, 2, 3, '#e07a30');
      r(12, 4, 2, 3, '#c8602a');
      r(10, 5, 1, 1, '#3a2018');
      r(11, 8, 1, 1, '#1a1426');
      r(4, 13 - up(1), 2, 2, '#5a2e14');
      r(9, 13 - up(2), 2, 2, '#5a2e14');
    } else if (id === 'cat') {
      r(1, 5, 2, 6, '#8a8e98');
      r(1, 5, 2, 1, '#e8eaf0');
      r(2, 10, 3, 2, '#8a8e98');
      r(3, 9, 8, 4, '#8a8e98');
      r(5, 9, 1, 3, '#60646e');
      r(8, 9, 1, 3, '#60646e');
      r(4, 12, 6, 1, '#e8eaf0');
      r(9, 6, 5, 5, '#9a9ea8');
      r(9, 4, 2, 3, '#8a8e98');
      r(12, 4, 2, 3, '#8a8e98');
      r(10, 5, 1, 1, '#e89aa0');
      r(11, 7, 1, 1, '#7ae85a');
      r(13, 7, 1, 1, '#7ae85a');
      r(12, 9, 1, 1, '#e89aa0');
      r(4, 13 - up(2), 2, 2, '#60646e');
      r(9, 13 - up(1), 2, 2, '#60646e');
    } else if (id === 'owl') {
      r(3, 8, 2, 5, '#7a5430');
      r(11, 8, 2, 5, '#6a4624');
      r(4, 4, 8, 10, '#9a7048');
      r(6, 8, 4, 5, '#e8d8b0');
      r(4, 2, 2, 3, '#7a5430');
      r(10, 2, 2, 3, '#6a4624');
      r(5, 5, 3, 3, '#f4f0dc');
      r(9, 5, 3, 3, '#f4f0dc');
      r(6, 6, 1, 2, '#1a1426');
      r(10, 6, 1, 2, '#1a1426');
      r(7, 8, 2, 2, '#e8a020');
      r(5, 14, 2, 1, '#e8a020');
      r(9, 14, 2, 1, '#e8a020');
      if (step) r(2, 9, 1, 3, '#7a5430');
    } else if (id === 'slime') {
      const sq = step ? 1 : 0;
      r(3, 9 + sq, 10, 5 - sq, '#5ad08a');
      r(4, 8 + sq, 8, 1, '#5ad08a');
      r(5, 7 + sq, 6, 1, '#7ae8a8');
      r(4, 13, 8, 1, '#3aa066');
      r(5, 8 + sq, 2, 1, '#c8ffe0');
      r(5, 10 + sq, 2, 2, '#1a2a20');
      r(9, 10 + sq, 2, 2, '#1a2a20');
      r(5, 10 + sq, 1, 1, '#ffffff');
      r(9, 10 + sq, 1, 1, '#ffffff');
      r(7, 12 + sq, 2, 1, '#3aa066');
      r(2, 12, 1, 2, '#3aa066');
    } else if (id === 'wisp') {
      r(5, 4, 6, 6, '#8ae0ff');
      r(6, 3, 4, 1, '#8ae0ff');
      r(6, 5, 4, 4, '#e8fcff');
      r(7, 10, 2, 2, '#8ae0ff');
      r(7, 12 + up(1), 1, 1, '#5ac8ff');
      r(4, 6, 1, 3, '#8ae0ff88');
      r(11, 6, 1, 3, '#8ae0ff88');
      r(7, 6, 1, 2, '#1a1426');
      r(9, 6, 1, 2, '#1a1426');
      if (step) {
        r(3, 5, 1, 1, '#e8fcffcc');
        r(12, 8, 1, 1, '#e8fcffcc');
      } else {
        r(12, 4, 1, 1, '#e8fcffcc');
        r(3, 8, 1, 1, '#e8fcffcc');
      }
    } else if (id === 'drake') {
      r(0, 10, 4, 2, '#c04a3a');
      r(0, 9, 1, 1, '#f0c880');
      r(3, 9, 8, 4, '#c04a3a');
      r(4, 12, 6, 1, '#f0c880');
      r(4, 5 + up(1), 4, 4, '#8a2c20');
      r(5, 6 + up(1), 2, 2, '#d85a48');
      r(10, 6, 4, 4, '#c04a3a');
      r(13, 7, 2, 2, '#c04a3a');
      r(14, 8, 1, 1, '#1a1426');
      r(10, 4, 1, 2, '#f0e0b0');
      r(12, 4, 1, 2, '#f0e0b0');
      r(12, 7, 1, 1, '#ffe060');
      r(4, 13 - up(1), 2, 2, '#8a2c20');
      r(9, 13 - up(2), 2, 2, '#8a2c20');
    }
  }

  function drawPet(ctx, id, x, y, s, step, face, lift) {
    const c = sprite(`pet|${id}|${step}`, (r) => paintPet(r, id, step));
    ctx.fillStyle = 'rgba(20,10,5,0.28)';
    ctx.beginPath();
    ctx.ellipse(x + 8 * s, y + 14.6 * s, 4.2 * s, 1.4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    if (face < 0) {
      ctx.save();
      ctx.translate(2 * (x + 8 * s), 0);
      ctx.scale(-1, 1);
      blitTile(ctx, c, x, y + lift * s, s);
      ctx.restore();
    } else blitTile(ctx, c, x, y + lift * s, s);
  }

  /**
   * One companion per hero that has one, trailing a little behind. Followers live only in the client: the
   * server just says which pet a hero owns. Hidden players keep their pets hidden too.
   */
  function petsFor(list, now) {
    if (!G.pets) G.pets = new Map();
    const dt = Math.min(0.1, G.petClock ? (now - G.petClock) / 1000 : 0);
    G.petClock = now;
    const out = [];
    const seen = new Set();
    for (const r of list) {
      if (r.kind !== 'player') continue;
      const e = G.entities.get(r.id);
      const pet = e && e.pet;
      if (!pet || hidden({ kind: 'player', id: r.id })) continue;
      seen.add(r.id);
      let p = G.pets.get(r.id);
      if (!p) {
        p = { x: r.x - 0.7, y: r.y + 0.2, ox: r.x, heading: 1, face: 1 };
        G.pets.set(r.id, p);
      }
      if (Math.abs(r.x - p.ox) > 0.02) p.heading = r.x > p.ox ? 1 : -1;
      p.ox = r.x;
      const tx = r.x - 0.7 * p.heading;
      const ty = r.y + 0.2;
      const dx = tx - p.x;
      const dy = ty - p.y;
      const dist = Math.hypot(dx, dy);
      let moving = false;
      if (dist > 6) {
        p.x = tx;
        p.y = ty;
      } else if (dist > 0.06) {
        const v = Math.min(dist, Math.min(dist * 6, 5.5) * dt);
        p.x += (dx / dist) * v;
        p.y += (dy / dist) * v;
        moving = dist > 0.2;
      }
      if (Math.abs(dx) > 0.03) p.face = dx > 0 ? 1 : -1;
      const step = moving ? (Math.floor(now / 140) % 2) + 1 : 0;
      const lift = pet === 'wisp' ? -3 + Math.sin(now / 300) * 1.2 : pet === 'owl' && !moving ? Math.sin(now / 900) * 0.3 : moving && step === 1 ? -0.8 : 0;
      out.push({ id: `pet${r.id}`, kind: 'pet', pet, x: p.x, y: p.y, step, face: p.face, lift, alpha: r.alpha });
    }
    for (const id of [...G.pets.keys()]) if (!seen.has(id)) G.pets.delete(id);
    return out;
  }

  function heldGear(id) {
    if (id === G.selfId) {
      const eq = (G.inv && G.inv.equipment) || {};
      const idOf = (ref) => (ref ? ref.id : undefined);
      return gearHeld({ w: idOf(eq.weapon), o: idOf(eq.offhand), h: idOf(eq.head), b: idOf(eq.body), c: idOf(eq.cloak) });
    }
    const e = G.entities.get(id);
    return gearHeld((e && e.gear) || {});
  }

  // ---- state

  function makeEntity(v, now) {
    return {
      id: v.id,
      name: v.name,
      kind: v.kind || 'player',
      level: v.level || 1,
      mon: v.mon,
      ref: v.ref,
      depleted: Boolean(v.depleted),
      title: v.title,
      gear: v.gear,
      pet: v.pet,
      fight: Boolean(v.fight),
      x: v.x,
      y: v.y,
      fx: v.x,
      fy: v.y,
      tx: v.x,
      ty: v.y,
      start: now,
      look: look(v.name, v.look),
      chosen: v.look,
      say: null,
      sayUntil: 0,
    };
  }

  function worldPos(e, now) {
    const t = Math.min(1, Math.max(0, (now - e.start) / G.tickMs));
    return { x: e.fx + (e.tx - e.fx) * t, y: e.fy + (e.ty - e.fy) * t, moving: t < 1 && (e.fx !== e.tx || e.fy !== e.ty) };
  }

  function zoneAt(map, x, y) {
    let found = null;
    for (const z of map.zones) if (x >= z.x && y >= z.y && x < z.x + z.w && y < z.y + z.h) found = z;
    return found;
  }

  const KIND_LABEL = { safe: 'Safe', road: 'Road', wilds: 'Wilds', dungeon: 'Dungeon' };

  function addLog(text, cls) {
    const li = document.createElement('li');
    if (cls) li.className = cls;
    li.textContent = text;
    const log = $('chatlog');
    log.appendChild(li);
    while (log.children.length > LOG_LINES) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
  }

  // One-time tips for a new hero. Each shows once per install and is remembered in localStorage.
  const HINTS = {
    walk: 'Tip: click the ground to walk. Scroll or press + and - to zoom, M shows the whole map.',
    monster: 'Tip: click a monster to fight it. Shift-click looks at it without attacking.',
    fight: 'Tip: pick an ability, then click your target. An action ends your turn, so choose well.',
    bag: 'Tip: open the Bag to equip gear. Better weapons change your abilities.',
    defeat: 'Tip: defeat costs a tenth of your iron bits. Your gear and skills are safe.',
    town: 'Tip: click a person to talk, a tree or rock to gather, a furnace or anvil to craft. J opens your journal.',
  };
  function hint(key) {
    let seen = {};
    try {
      seen = JSON.parse(localStorage.getItem('wealdmark.hints') || '{}');
    } catch {
      /* storage can be unavailable; hints then show each session */
    }
    if (seen[key] || !HINTS[key]) return;
    seen[key] = 1;
    try {
      localStorage.setItem('wealdmark.hints', JSON.stringify(seen));
    } catch {
      /* ignore */
    }
    addLog(HINTS[key], 'hint');
  }

  let toastTimer = 0;
  function toast(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  const play = (name) => window.wealdmarkAudio && window.wealdmarkAudio.play(name);
  const myCombat = () => (G.stats ? G.stats.combatLevel : 1);

  // ---- server messages

  function handle(msg) {
    if (!G) return early.push(msg);
    const now = performance.now();
    switch (msg.t) {
      case 'state':
        return onState(msg, now);
      case 'stats':
        G.stats = msg;
        if (!$('panel-dungeon').classList.contains('hidden')) renderDungeon();
        hint('walk');
        setTimeout(() => hint('monster'), 6000);
        setTimeout(() => hint('town'), 14000);
        renderStats();
        return refreshTown();
      case 'checkpoint':
        return toast(`Checkpoint set: ${msg.name === 'spawn' ? 'Bellstone Plaza' : pretty(msg.name)}. You wake here after a sign-out or a death.`);
      case 'portal':
        return onPortal(msg, now);
      case 'cast':
        openPortal(msg.ticks * G.tickMs, now);
        {
          const secs = Math.round((msg.ticks * 600) / 1000);
          const dest = G.anchorTravel;
          G.anchorTravel = null;
          return toast(dest ? `Travelling to ${dest}. Stay still for ${secs} seconds.` : `Casting the town portal. Stay still for ${secs} seconds.`);
        }
      case 'look': {
        const me = G.self();
        if (me) {
          me.chosen = msg.look;
          me.look = look(me.name, msg.look);
        }
        return;
      }
      case 'pet': {
        const me = G.self();
        if (me) me.pet = msg.id || undefined;
        return renderLook();
      }
      case 'inventory':
        G.inv = msg;
        if (msg.items && msg.items.some((i) => i && i.rarity)) hint('bag');
        renderBag();
        renderJournal();
        return refreshTown();
      case 'fight.start':
        hint('fight');
        return startFight(msg, now);
      case 'fight.update':
        return onFightUpdate(msg);
      case 'fight.end':
        if (G.fight) G.fight.end = msg;
        if (msg.outcome === 'defeat') hint('defeat');
        return;
      case 'loot':
        return onLoot(msg);
      case 'merc':
        G.merc = msg;
        return renderMerc();
      case 'log':
        return addLog(msg.text, msg.cls);
      case 'party':
        G.party = msg.leader == null || !msg.members.length ? null : msg;
        if (G.party) G.invite = null;
        renderDungeon();
        return renderParty();
      case 'party.invite':
        G.invite = msg.from;
        toast(`${msg.from} invites you to a party. Open the Party window (P) to answer.`);
        play('click');
        return renderParty();
      case 'dialog':
        return onDialog(msg);
      case 'shop':
        return onShop(msg);
      case 'storage':
        return onStorage(msg);
      case 'station':
        return onStation(msg);
      case 'perks':
        return onPerks(msg);
      case 'anchors':
        G.anchors = msg.list;
        if (G.town && G.town.kind === 'anchor') renderAnchor();
        return;
      case 'anchor_open':
        G.town = { kind: 'anchor', id: msg.id };
        showTown('panel-anchor');
        return renderAnchor();
      case 'busy':
        return onBusy(msg);
      case 'quests':
        return onQuests(msg);
      case 'close':
        return closeTown(false);
      case 'error':
        if (msg.code === 'cast_cancelled' && G.portal && G.portal.stage === 'open') G.portal = null;
        play('error');
        return toast(ERRORS[msg.code] || `Server: ${msg.code}`);
    }
  }

  function onState(msg, now) {
    for (const v of msg.enter) G.entities.set(v.id, makeEntity(v, now));
    for (const m of msg.move) {
      const e = G.entities.get(m.id);
      if (!e) continue;
      const p = worldPos(e, now);
      // A jump of more than a few tiles is a teleport, not a walk: appear there instead of sliding across the map.
      const jump = Math.abs(m.x - p.x) + Math.abs(m.y - p.y) > 4;
      e.fx = jump ? m.x : p.x;
      e.fy = jump ? m.y : p.y;
      e.tx = m.x;
      e.ty = m.y;
      e.x = m.x;
      e.y = m.y;
      e.start = now;
      if (jump && m.id === G.selfId && G.portal) G.portal.landed = now;
      else if (m.id === G.selfId && !G.fight) play('step');
    }
    for (const id of msg.leave) G.entities.delete(id);
    for (const f of msg.fight) {
      const e = G.entities.get(f.id);
      if (e) e.fight = f.on;
    }
    for (const c of msg.chat) {
      const e = G.entities.get(c.id);
      if (e) {
        e.say = c.text;
        e.sayUntil = now + BUBBLE_MS;
      }
      addLog(`${c.name}: ${c.text}`, c.id === G.selfId ? 'mine' : '');
    }
    if (G.dest) {
      const me = G.self();
      if (me.x === G.dest.x && me.y === G.dest.y) G.dest = null;
    }
  }

  // ---- fights

  const lowerName = (n) => (n.startsWith('The ') ? n.toLowerCase() : n);
  const who = (id) => {
    if (id === G.selfId) return 'You';
    const a = G.fight.actors.get(id);
    if (!a) return 'Something';
    return a.side === 'hero' || / the /.test(a.name) ? a.name : `The ${a.name}`;
  };

  function makeActor(a) {
    return { ...a, mon: a.mon || a.sprite, look: a.side === 'hero' && !a.sprite ? look(a.name, (G.entities.get(a.id) || {}).chosen) : null, anim: null, lunge: null, flash: 0, fade: 1 };
  }

  function syncFromState(state) {
    const f = G.fight;
    for (const a of state.actors) {
      const have = f.actors.get(a.id);
      if (!have) {
        f.actors.set(a.id, makeActor(a));
        continue;
      }
      have.hp = a.hp;
      have.maxHp = a.maxHp;
      have.mana = a.mana;
      have.maxMana = a.maxMana;
      have.alive = a.alive;
      have.statuses = a.statuses;
      have.facing = a.facing;
      if (!have.anim) have.pos = a.pos;
    }
    f.round = state.round;
    f.order = state.order;
    f.turn = state.turn;
    f.outcome = state.outcome;
  }

  function startFight(msg, now) {
    G.fight = { id: msg.id, actors: new Map(), queue: [], until: now, pending: null, selected: null, options: null, end: null, round: 0, order: [], turn: null, outcome: null, hover: null, result: null };
    syncFromState(msg.state);
    G.fight.options = null;
    G.fight.mates = msg.state.actors.filter((a) => a.side === 'hero' && a.id !== G.selfId).map((a) => a.name);
    G.dest = null;
    if (G.auto && bossFight()) {
      setAuto(false);
      toast('Auto combat is off: not available against bosses and minibosses.');
    }
    addLog('A fight begins!', 'round');
    $('turns').classList.remove('hidden');
    $('fightbar').classList.remove('hidden');
    renderFightUi();
  }

  function onFightUpdate(msg) {
    const f = G.fight;
    if (!f) return;
    for (const ev of msg.events) f.queue.push(ev);
    f.pending = { state: msg.state, options: msg.options };
  }

  function eventDuration(ev) {
    switch (ev.type) {
      case 'move':
        return ev.path.length * MOVE_STEP_MS + 60;
      case 'ability':
        return 240;
      case 'hit':
        return 420;
      case 'miss':
        return 330;
      case 'heal':
      case 'mana':
        return 420;
      case 'death':
        return 520;
      case 'flee':
        return 420;
      case 'guard':
      case 'status':
      case 'swap':
        return 260;
      case 'dot':
        return 420;
      case 'parry':
        return 330;
      case 'end':
        return 300;
      default:
        return 0;
    }
  }

  function floater(id, text, color) {
    const a = G.fight.actors.get(id);
    if (!a) return;
    const p = a.anim ? a.anim.from : a.pos;
    G.floaters.push({ x: p.x, y: p.y, text, color, t0: performance.now() });
  }

  function applyEvent(ev, now) {
    const f = G.fight;
    const act = (id) => f.actors.get(id);
    switch (ev.type) {
      case 'round':
        f.round = ev.round;
        addLog(`Round ${ev.round}`, 'round');
        break;
      case 'mark':
        f.marks = (f.marks || []).concat(ev.tiles.map((t) => ({ owner: ev.owner, x: t.x, y: t.y })));
        addLog(`${who(ev.owner)} raises its weapon: the marked ground will be crushed on its next turn. Step off it.`, 'bad');
        break;
      case 'turn':
        f.marks = (f.marks || []).filter((m) => m.owner !== ev.actor);
        f.turnActor = ev.actor;
        renderTurns();
        break;
      case 'regen': {
        const a = act(ev.actor);
        if (a) {
          a.hp = Math.min(a.maxHp, a.hp + ev.hp);
          a.mana = Math.min(a.maxMana, a.mana + ev.mana);
        }
        break;
      }
      case 'move': {
        const a = act(ev.actor);
        if (!a || ev.path.length === 0) break;
        a.anim = { from: a.pos, path: ev.path, t0: now };
        if (ev.actor === G.selfId || manhattan(act(G.selfId).pos, a.pos) < 12) play('step');
        break;
      }
      case 'ability': {
        const a = act(ev.actor);
        const name = ABILITY_NAMES[ev.ability] || pretty(ev.ability);
        if (a && ev.targets[0] !== undefined) {
          const t = act(ev.targets[0]);
          if (t && (ev.ability === 'pine_nut_throw' || ev.ability === 'pick_throw')) G.shots.push({ from: { ...a.pos }, to: { ...t.pos }, t0: now, kind: ev.ability });
          else if (t) a.lunge = { dir: dirToward(a.pos, t.pos), t0: now };
        }
        if (ev.targets.length === 0) {
          addLog(`${who(ev.actor)} use${ev.actor === G.selfId ? '' : 's'} ${name}.`);
          play('buff');
        } else {
          addLog(`${who(ev.actor)} ${ev.actor === G.selfId ? 'use' : 'uses'} ${name}.`);
          play('swing');
        }
        break;
      }
      case 'hit': {
        const t = act(ev.target);
        if (t) {
          t.hp = ev.hp;
          t.flash = now;
        }
        floater(ev.target, ev.crit ? `${ev.damage}!` : String(ev.damage), ev.target === G.selfId ? '#ff7a7a' : ev.crit ? '#ffb347' : '#ffe066');
        if (ev.ability === 'crushing_strike') {
          addLog(`The marked ground is crushed. ${who(ev.target)} ${ev.target === G.selfId ? 'take' : 'takes'} ${ev.damage}.`, ev.target === G.selfId ? 'bad' : 'mine');
          play(ev.target === G.selfId ? 'hurt' : 'hit');
          break;
        }
        addLog(
          `${who(ev.source)} ${ev.source === G.selfId ? 'hit' : 'hits'} ${ev.target === G.selfId ? 'you' : lowerName(who(ev.target))} for ${ev.damage}${ev.crit ? ' (critical)' : ''}${ev.prevented > 0 ? `, ${ev.prevented} stopped` : ''}.`,
          ev.source === G.selfId ? 'mine' : 'bad',
        );
        play(ev.source === G.selfId ? 'hit' : 'hurt');
        break;
      }
      case 'miss':
        floater(ev.target, ev.blocked ? 'Block' : ev.dodged ? 'Dodge' : 'Miss', ev.blocked ? '#9ad8e8' : '#c8c0e0');
        addLog(`${who(ev.source)} ${ev.source === G.selfId ? 'miss' : 'misses'} ${ev.target === G.selfId ? 'you' : lowerName(who(ev.target))}${ev.dodged ? ' (dodged)' : ev.blocked ? ' (blocked)' : ''}.`);
        play('miss');
        break;
      case 'heal': {
        const a = act(ev.actor);
        if (a) a.hp = ev.hp;
        floater(ev.actor, `+${ev.amount}`, '#7bd88f');
        addLog(`${who(ev.actor)} recover${ev.actor === G.selfId ? '' : 's'} ${ev.amount} health.`, 'mine');
        play('heal');
        break;
      }
      case 'mana': {
        const a = act(ev.actor);
        if (a) a.mana = ev.mana;
        floater(ev.actor, `+${ev.amount}`, '#6aa0ff');
        addLog(`${who(ev.actor)} recover${ev.actor === G.selfId ? '' : 's'} ${ev.amount} mana.`, 'mine');
        play('heal');
        break;
      }
      case 'status': {
        const a = act(ev.actor);
        if (a) a.statuses = a.statuses.filter((s) => s.id !== ev.status).concat([{ id: ev.status, rounds: ev.rounds }]);
        const you = ev.actor === G.selfId;
        if (ev.status === 'phase_shield') addLog(`${who(ev.actor)} ${you ? 'raise' : 'raises'} a shield. Break it within ${ev.rounds} rounds or it heals.`, you ? 'mine' : 'bad');
        else if (ev.status === 'stagger') addLog(`${who(ev.actor)} ${you ? 'are' : 'is'} staggered.`);
        else if (ev.status === 'stunned') addLog(`${who(ev.actor)} ${you ? 'are' : 'is'} stunned and cannot act for ${ev.rounds} rounds.`, you ? 'bad' : 'mine');
        else if (ev.status === 'stun_immune') addLog(`${who(ev.actor)} ${you ? 'shake' : 'shakes'} off the stun and cannot be stunned for ${ev.rounds} rounds.`);
        else if (ev.status === 'enrage') addLog(`${who(ev.actor)} ${you ? 'fly' : 'flies'} into a rage: more damage, more speed.`, you ? 'bad' : 'mine');
        else if (DEBUFFS.has(ev.status)) addLog(`${who(ev.actor)} ${you ? 'are' : 'is'} afflicted: ${pretty(ev.status)}.`, you ? 'bad' : 'mine');
        else addLog(`${who(ev.actor)} ${you ? 'gain' : 'gains'} ${pretty(ev.status)}.`);
        break;
      }
      case 'dot': {
        const a = act(ev.actor);
        if (a) {
          a.hp = ev.hp;
          a.flash = now;
        }
        floater(ev.actor, String(ev.damage), { poison: '#8be28b', bleed: '#ff6b6b', burn: '#ffa24a' }[ev.status] || '#ffe066');
        addLog(`${ev.actor === G.selfId ? 'You take' : `${who(ev.actor)} takes`} ${ev.damage} from ${ev.status}.`, ev.actor === G.selfId ? 'bad' : 'mine');
        play('hurt');
        break;
      }
      case 'parry':
        floater(ev.actor, 'Parry', '#9ec7ff');
        addLog(`${who(ev.actor)} ${ev.actor === G.selfId ? 'parry' : 'parries'} ${who(ev.source)}.`);
        play('guard');
        break;
      case 'swap': {
        const a = act(ev.actor);
        if (a) a.lunge = null;
        addLog(`${who(ev.actor)} ${ev.actor === G.selfId ? 'swap' : 'swaps'} weapons.`);
        play('click');
        break;
      }
      case 'guard':
        floater(ev.actor, 'Guard', '#9ec7ff');
        addLog(`${who(ev.actor)} ${ev.actor === G.selfId ? 'guard' : 'guards'}.`);
        play('guard');
        break;
      case 'spawn':
        if (!G.fight.actors.has(ev.actor.id)) G.fight.actors.set(ev.actor.id, makeActor(ev.actor));
        addLog(`${who(ev.actor.ownerId)} call${ev.actor.ownerId === G.selfId ? '' : 's'} a familiar.`, 'mine');
        play('buff');
        break;
      case 'death': {
        f.marks = (f.marks || []).filter((m) => m.owner !== ev.actor);
        const a = act(ev.actor);
        if (a) a.alive = false;
        addLog(ev.actor === G.selfId ? 'You fall.' : `${who(ev.actor)} falls.`, ev.actor === G.selfId ? 'bad' : 'mine');
        play('death');
        break;
      }
      case 'flee':
        addLog(ev.success ? 'You escaped.' : 'You failed to escape.');
        play('flee');
        break;
      case 'end':
        break;
    }
  }

  function actorPos(a, now) {
    if (a.anim) {
      const e = now - a.anim.t0;
      const i = Math.floor(e / MOVE_STEP_MS);
      if (i >= a.anim.path.length) {
        a.pos = a.anim.path[a.anim.path.length - 1];
        a.anim = null;
      } else {
        const from = i === 0 ? a.anim.from : a.anim.path[i - 1];
        const to = a.anim.path[i];
        const t = (e - i * MOVE_STEP_MS) / MOVE_STEP_MS;
        return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, moving: true };
      }
    }
    return { x: a.pos.x, y: a.pos.y, moving: false };
  }

  /** Plays queued events one at a time, then hands control back to the player. */
  function runFightQueue(now) {
    const f = G.fight;
    if (now < f.until) return;
    if (f.queue.length) {
      const ev = f.queue.shift();
      applyEvent(ev, now);
      f.until = now + eventDuration(ev);
      return;
    }
    if (f.pending) {
      const { state, options } = f.pending;
      f.pending = null;
      syncFromState(state);
      f.options = options;
      if (options && options.actor === G.selfId) f.baseSel = f.selected = basicOf(options);
      renderFightUi();
      if (options && options.actor === G.selfId) scheduleAuto();
    }
    if (f.end && !f.options && !f.pending) finishFight();
  }

  function finishFight() {
    const f = G.fight;
    const end = f.end;
    G.fight = null;
    $('turns').classList.add('hidden');
    $('fightbar').classList.add('hidden');
    $('toast').classList.remove('show');

    // The outcome and everything gained go to the chat log, one line each. No window to close.
    const head = end.outcome === 'victory' ? 'Victory!' : end.outcome === 'defeat' ? 'Defeated.' : 'You got away.';
    addLog(head, end.outcome === 'victory' ? 'win' : end.outcome === 'defeat' ? 'bad' : 'round');
    const xp = Object.values(end.xp).reduce((sum, v) => sum + (v > 0 ? v : 0), 0);
    if (xp > 0) addLog(`You gain ${xp} experience.`, 'round');
    for (const lu of end.levelUps) addLog(lu.skill === 'combat' ? `You reached combat level ${lu.level}. Press K to spend your skill points.` : `Your ${pretty(lu.skill)} level has increased to ${lu.level}.`, 'levelup');
    const mates = f.mates || [];
    if (end.loot.iron_bits > 0) addLog(mates.length ? `You take ${end.loot.iron_bits} iron bits, your share by damage dealt alongside ${mates.join(', ')}.` : `You find ${end.loot.iron_bits} iron bits.`, 'loot');
    else if (mates.length && end.outcome === 'victory') addLog('The loot was split by damage dealt, and your share came to no iron bits.', 'loot');
    for (const it of end.loot.items || []) addLog(`You find ${itemName(it)}.`, `loot ${it.rarity || ''}`.trim());
    if (end.penalty && end.penalty.iron_bits > 0) addLog(`You lose ${end.penalty.iron_bits} iron bits.`, 'bad');
    if (end.outcome === 'defeat') addLog('You wake at the bellstone, weary but whole.', 'round');
    if (end.outcome === 'fled') addLog('You escaped from the fight.', 'round');
    play(end.outcome === 'victory' ? 'victory' : end.outcome === 'defeat' ? 'defeat' : 'flee');
    if (end.levelUps.length) setTimeout(() => play('level'), 700);
    if (end.loot.iron_bits > 0 || (end.loot.items && end.loot.items.length)) setTimeout(() => play('coin'), 400);
    if (lootCount(G.loot.fight)) showLoot('fight');
  }

  // ---- mercenaries

  function renderMerc() {
    const box = $('merc-body');
    if (!box || !G.merc) return;
    box.textContent = '';
    const m = G.merc.merc;
    if (m) {
      const offer = G.merc.offers.find((o) => o.kind === m.kind);
      box.appendChild(el('p', '', `${offer ? offer.name : pretty(m.kind)} under contract: ${m.fights} ${m.fights === 1 ? 'fight' : 'fights'} left.`));
      const b = el('button', 'act', 'Let go');
      b.type = 'button';
      b.addEventListener('click', () => window.wealdmark.send({ t: 'merc', op: 'dismiss' }));
      box.appendChild(b);
      return;
    }
    box.appendChild(walletLine());
    for (const o of G.merc.offers) {
      const row = el('div', 'lootrow');
      row.append(el('span', 'name', `${o.name}: ${o.blurb}`));
      const b = el('button', 'act', `Hire, ${o.cost} gold`);
      b.type = 'button';
      b.addEventListener('click', () => window.wealdmark.send({ t: 'merc', op: 'hire', kind: o.kind }));
      row.appendChild(b);
      box.appendChild(row);
    }
  }

  // ---- loot window: drops wait here until the hero takes them

  const lootCount = (pile) => (pile ? pile.items.length + (pile.iron_bits > 0 ? 1 : 0) : 0);

  function onLoot(msg) {
    const had = lootCount(G.loot[msg.pool]);
    G.loot[msg.pool] = msg;
    const n = lootCount(msg);
    const want = G.lootWanted != null;
    if (n) {
      // New drops open the window once the fight animation is over; an answer to the Loot button opens it at once.
      if ((n > had || want) && !G.fight) showLoot(msg.pool);
      else if (G.lootView === msg.pool) renderLoot();
    } else if (G.lootView === msg.pool) {
      const other = G.loot[msg.pool === 'fight' ? 'box' : 'fight'];
      if (lootCount(other)) showLoot(other.pool);
      else hideLoot();
    }
    if (want) G.lootWanted = null;
    const waiting = lootCount(G.loot.fight) > 0;
    $('btn-loot').classList.toggle('hidden', !waiting);
    $('menu-btn').classList.toggle('alert', waiting);
  }

  function hideLoot() {
    const panel = $('panel-loot');
    if (!panel.classList.contains('hidden')) togglePanel('panel-loot');
    G.lootView = null;
  }

  function showLoot(pool) {
    G.lootView = pool;
    if ($('panel-loot').classList.contains('hidden')) togglePanel('panel-loot');
    renderLoot();
  }

  function renderLoot() {
    const pool = G.lootView;
    const pile = pool && G.loot[pool];
    if (!pile) return;
    $('loot-title').textContent = pool === 'box' ? `Lost and found, ${pile.town || 'town'}` : 'Loot';
    $('loot-note').textContent = pool === 'box' ? 'You were disconnected before taking these. Nothing is lost.' : 'Close this window to take them later. The Loot button in the menu brings it back.';
    const body = $('loot-body');
    body.textContent = '';
    const take = (index) => window.wealdmark.send({ t: 'loot', op: 'take', pool, index });
    const row = (icon, name, cls, index) => {
      const r = el('div', 'lootrow');
      r.append(icon, el('span', 'name' + (cls ? ` ${cls}` : ''), name));
      const b = el('button', 'act', 'Take');
      b.type = 'button';
      b.addEventListener('click', () => take(index));
      r.appendChild(b);
      return r;
    };
    if (pile.iron_bits > 0) {
      const coin = el('span', 'lootbits', 'ib');
      body.appendChild(row(coin, `${pile.iron_bits} iron bits`, '', -1));
    }
    pile.items.forEach((ref, i) => {
      const slot = slotButton(ref, () => take(i));
      body.appendChild(row(slot, `${itemName(ref)}${ref.qty > 1 ? ` x${ref.qty}` : ''}`, ref.rarity || '', i));
    });
    if (!lootCount(pile)) body.appendChild(el('p', 'muted', 'Nothing left.'));
    $('loot-all').disabled = !lootCount(pile);
  }

  function openLootWindow() {
    const pool = lootCount(G.loot.fight) ? 'fight' : lootCount(G.loot.box) ? 'box' : null;
    G.lootWanted = pool || 'box';
    window.wealdmark.send({ t: 'loot', op: 'open' });
  }

  // ---- fight controls

  const isMyTurn = () => Boolean(G.fight && G.fight.options && G.fight.options.actor === G.selfId && !G.fight.queue.length);
  const hero = () => G.fight.actors.get(G.selfId);

  // ---- auto combat: plays the hero's turns for you. Never in boss or miniboss fights.

  const isBossActor = (a) => Boolean(a.boss || (a.mon && G.data && G.data.monsters.get(a.mon)?.miniboss));
  const bossFight = () => Boolean(G.fight) && [...G.fight.actors.values()].some((a) => a.side === 'enemy' && isBossActor(a));
  const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

  function renderAutoBtn() {
    G.barSig = null;
    const b = $('auto-btn');
    if (!b) return;
    const blocked = bossFight();
    b.disabled = blocked;
    b.classList.toggle('selected', Boolean(G.auto) && !blocked);
    b.textContent = G.auto && !blocked ? 'X Combat: Auto' : 'X Combat: Manual';
    b.title = blocked ? 'Auto combat is not available against bosses and minibosses.' : 'Switch between Auto and Manual (X). Auto plays your turns: heals and buffs, eats when hurt, attacks with the strongest ability in reach, otherwise walks toward the nearest enemy. You can still pick an ability yourself on any turn and Auto stays on.';
  }

  function setAuto(on) {
    G.auto = on;
    clearTimeout(G.autoTimer);
    G.autoTimer = null;
    renderAutoBtn();
    if (on && G.fight) scheduleAuto();
  }

  function toggleAuto() {
    if (!G) return;
    if (G.fight && bossFight()) return toast('Auto combat is not available against bosses and minibosses.');
    setAuto(!G.auto);
    toast(G.auto ? 'Auto combat on. Press X to turn it off.' : 'Auto combat off. Press X to turn it on.');
  }

  function scheduleAuto() {
    if (!G.auto || G.autoTimer) return;
    G.autoTimer = setTimeout(autoStep, 450);
  }

  /**
   * Self abilities auto combat casts for you. heal: used when hurt (below the share of max health). buff: used once while a
   * fight is on, when its status is not already running. summon: used when you have no familiar out.
   */
  const AUTO_SELF = {
    heal: { kind: 'heal', below: 0.6 },
    second_wind: { kind: 'heal', below: 0.7 },
    stoneskin: { kind: 'heal', below: 0.8 },
    unbreakable: { kind: 'buff', status: 'unbreakable', below: 0.35 },
    war_cry: { kind: 'buff', status: 'war_cry' },
    deadeye: { kind: 'buff', status: 'deadeye' },
    mana_shield: { kind: 'buff', status: 'mana_shield' },
    arcane_surge: { kind: 'buff', status: 'arcane_surge' },
    fortify: { kind: 'buff', status: 'fortify' },
    retaliate: { kind: 'buff', status: 'retaliate', near: true },
    parry: { kind: 'buff', status: 'parry', near: true },
    summon_familiar: { kind: 'summon' },
  };

  /** A heal or buff worth casting now, or null. Heals come first when hurt; the rest wait until a foe is close. */
  function autoSelf(o, h, foes) {
    const pct = h.hp / h.maxHp;
    const has = (id) => h.statuses.some((st) => st.id === id);
    const close = foes.some((fo) => manhattan(fo.pos, h.pos) <= 3);
    let pick = null;
    for (const a of o.abilities) {
      const rule = AUTO_SELF[a.id];
      if (!rule || !a.usable) continue;
      let rank = 0;
      if (rule.kind === 'heal' && pct < rule.below) rank = 3;
      else if (rule.kind === 'buff' && rule.below && pct < rule.below && !has(rule.status)) rank = 3;
      else if (rule.kind === 'buff' && !rule.below && !has(rule.status) && (rule.near ? foes.some((fo) => manhattan(fo.pos, h.pos) === 1) : close)) rank = 1;
      else if (rule.kind === 'summon' && close && ![...G.fight.actors.values()].some((x) => x.alive && x.ownerId === G.selfId)) rank = 2;
      if (rank && (!pick || rank > pick.rank)) pick = { rank, id: a.id };
    }
    return pick ? { t: 'ability', id: pick.id } : null;
  }

  /** The best thing to do with the action this turn, or null. Strength is guessed from the mana cost, and hitting more enemies counts for more. */
  function autoPick(o, h, foes) {
    let best = null;
    for (const a of o.abilities) {
      if (!a.usable) continue;
      const range = a.range || 1;
      let act = null;
      let hits = 1;
      const near = [...foes].sort((p, q) => manhattan(p.pos, h.pos) - manhattan(q.pos, h.pos))[0];
      switch (a.shape) {
        case 'adjacent':
          if (manhattan(near.pos, h.pos) === 1) act = { t: 'ability', id: a.id, target: near.id };
          break;
        case 'ranged':
        case 'chain':
          if (manhattan(near.pos, h.pos) <= range) act = { t: 'ability', id: a.id, target: near.id };
          break;
        case 'multi':
          if (manhattan(near.pos, h.pos) <= range) {
            act = { t: 'ability', id: a.id, target: near.id };
            hits = Math.min(a.maxTargets || 1, foes.filter((f) => manhattan(f.pos, h.pos) <= range).length);
          }
          break;
        case 'front3x3': {
          const close = foes.filter((f) => cheb(f.pos, h.pos) <= 2);
          if (manhattan(near.pos, h.pos) === 1 && close.length >= 2) {
            act = { t: 'ability', id: a.id, dir: dirToward(h.pos, near.pos) };
            hits = Math.min(a.maxTargets || 1, close.length);
          }
          break;
        }
        case 'ring': {
          const around = foes.filter((f) => cheb(f.pos, h.pos) === 1);
          if (around.length >= 2) {
            act = { t: 'ability', id: a.id };
            hits = around.length;
          }
          break;
        }
        case 'area': {
          const rad = a.radius || 1;
          let top = null;
          for (const f of foes) {
            if (manhattan(f.pos, h.pos) > range) continue;
            const n = foes.filter((g) => cheb(g.pos, f.pos) <= rad).length;
            if (!top || n > top.n) top = { at: f.pos, n };
          }
          if (top && top.n >= 2) {
            act = { t: 'ability', id: a.id, at: { x: top.at.x, y: top.at.y } };
            hits = top.n;
          }
          break;
        }
        default:
          break;
      }
      if (!act) continue;
      const score = hits * (1 + a.mana / 20);
      if (!best || score > best.score) best = { act, score };
    }
    return best ? best.act : null;
  }

  function autoStep() {
    if (!G) return;
    G.autoTimer = null;
    if (!G.auto || !isMyTurn()) return;
    // You picked an ability yourself this turn: let you finish it. Auto stays on and takes the next turn.
    if (G.fight.selected !== G.fight.baseSel) return;
    if (bossFight()) {
      setAuto(false);
      return toast('Auto combat is off: not available against bosses and minibosses.');
    }
    const f = G.fight;
    const o = f.options;
    const h = hero();
    const foes = [...f.actors.values()].filter((a) => a.side === 'enemy' && a.alive);
    if (!h || foes.length === 0) return sendFight({ t: 'end' });

    if (!o.acted) {
      const pct = h.hp / h.maxHp;
      const self = autoSelf(o, h, foes);
      if (self && pct < 0.6) return sendFight(self);
      if (pct < 0.45 && foodSlot() >= 0) return sendFight({ t: 'eat', slot: foodSlot() });
      if (pct < 0.2 && foodSlot() < 0) return sendFight({ t: 'flee' });
      if (self) return sendFight(self);
      const pick = autoPick(o, h, foes);
      if (pick) return sendFight(pick);
    }
    if (o.moveLeft > 0) {
      const near = [...foes].sort((p, q) => manhattan(p.pos, h.pos) - manhattan(q.pos, h.pos))[0];
      const here = manhattan(near.pos, h.pos);
      const step = [...o.reach].sort((p, q) => manhattan(p, near.pos) - manhattan(q, near.pos))[0];
      if (step && manhattan(step, near.pos) < here) return sendFight({ t: 'move', to: { x: step.x, y: step.y } });
    }
    sendFight({ t: 'end' });
  }

  function sendFight(action) {
    if (!isMyTurn()) return;
    G.fight.options = null;
    renderFightUi();
    window.wealdmark.send({ t: 'fight', action });
  }

  const basicOf = (options) => (options.abilities.find((a) => BASIC_ATTACKS.includes(a.id)) || options.abilities[0] || {}).id || null;

  function aimHint(opt) {
    switch (opt.shape) {
      case 'front3x3':
        return 'Click toward the enemies to strike a 3 by 3 area in front of you.';
      case 'area':
        return `Click a tile within ${opt.range} tiles.`;
      case 'ranged':
      case 'chain':
        return `Click an enemy within ${opt.range} tiles.`;
      case 'multi':
        return `Click an enemy within ${opt.range} tiles. The nearest others are hit too.`;
      default:
        return 'Click an adjacent enemy.';
    }
  }

  function selectAbility(id) {
    if (!isMyTurn()) return;
    const opt = G.fight.options.abilities.find((a) => a.id === id);
    if (!opt) return;
    if (!opt.usable) return toast(opt.reason === 'mana' ? 'Not enough mana.' : opt.reason === 'cooldown' ? `Ready in ${opt.cooldown} rounds.` : opt.reason === 'acted' ? 'You have already acted this turn.' : 'No enemy in reach.');
    play('click');
    if (opt.shape === 'self' || opt.shape === 'ring') return sendFight({ t: 'ability', id });
    G.fight.selected = id;
    renderFightUi();
    toast(aimHint(opt));
  }

  function foodSlot() {
    if (!G.inv || !G.data) return -1;
    return G.inv.items.findIndex((s) => s && G.data.items.get(s.id)?.kind === 'food');
  }

  function fightTileClick(t) {
    if (!isMyTurn()) return;
    const f = G.fight;
    const h = hero();
    const target = [...f.actors.values()].find((a) => a.side === 'enemy' && a.alive && a.pos.x === t.x && a.pos.y === t.y);
    let sel = f.options.abilities.find((a) => a.id === f.selected);
    if (!sel || !sel.usable) sel = f.options.abilities.find((a) => a.id === basicOf(f.options) && a.usable);

    if (sel) {
      const range = sel.range || 1;
      switch (sel.shape) {
        case 'front3x3':
          return sendFight({ t: 'ability', id: sel.id, dir: dirToward(h.pos, target ? target.pos : t) });
        case 'area':
          if (manhattan(h.pos, t) > range) return toast(`Out of range. The limit is ${range} tiles.`);
          return sendFight({ t: 'ability', id: sel.id, at: { x: t.x, y: t.y } });
        case 'adjacent':
          if (target) {
            if (manhattan(h.pos, target.pos) !== 1) return toast('Too far away. Move next to the target first.');
            return sendFight({ t: 'ability', id: sel.id, target: target.id });
          }
          break;
        case 'ranged':
        case 'multi':
        case 'chain':
          if (target) {
            if (manhattan(h.pos, target.pos) > range) return toast(`Out of range. The limit is ${range} tiles. Move closer.`);
            return sendFight({ t: 'ability', id: sel.id, target: target.id });
          }
          break;
        default:
          break;
      }
    }
    if (target) return toast(sel ? 'Pick a different ability, or move.' : "You can't attack right now.");
    if (f.options.reach.some((p) => p.x === t.x && p.y === t.y)) return sendFight({ t: 'move', to: { x: t.x, y: t.y } });
    toast("You can't move there.");
  }

  function fightKey(key) {
    if (!isMyTurn()) return false;
    const f = G.fight;
    const k = key.length === 1 ? key.toLowerCase() : key;
    if (/^[0-9]$/.test(k)) {
      if (k !== '0' && k !== '9') useBarSlot(Number(k) - 1, true);
      return true;
    }
    if (k === 'q') {
      if (!f.options.canSwap) toast(f.options.acted ? 'You have already acted this turn.' : 'You have no second weapon. Shift-click a weapon in your bag to place it in the swap slot.');
      else sendFight({ t: 'swap' });
      return true;
    }
    if (k === 'g') return sendFight({ t: 'guard' }), true;
    if (k === 'f') return sendFight({ t: 'flee' }), true;
    if (k === ' ') return sendFight({ t: 'end' }), true;
    if (k === 'e') {
      const slot = foodSlot();
      if (slot < 0) toast('You have no food.');
      else sendFight({ t: 'eat', slot });
      return true;
    }
    const dir = { ArrowUp: 'N', ArrowDown: 'S', ArrowLeft: 'W', ArrowRight: 'E', w: 'N', s: 'S', a: 'W', d: 'E' }[k];
    if (dir) {
      const h = hero();
      const to = { x: h.pos.x + VEC[dir][0], y: h.pos.y + VEC[dir][1] };
      const enemy = [...f.actors.values()].find((a) => a.side === 'enemy' && a.alive && a.pos.x === to.x && a.pos.y === to.y);
      if (enemy) fightTileClick(to);
      else if (f.options.reach.some((p) => p.x === to.x && p.y === to.y)) sendFight({ t: 'move', to });
      else toast("You can't move there.");
      return true;
    }
    return false;
  }

  // ---- fight and panel UI

  function renderTurns() {
    const f = G.fight;
    if (!f) return;
    const el = $('turns');
    el.textContent = '';
    for (const id of f.order) {
      const a = f.actors.get(id);
      if (!a || !a.alive) continue;
      const chip = document.createElement('span');
      chip.className = 'chip ' + a.side + (id === f.turnActor ? ' active' : '');
      const nm = document.createElement('div');
      nm.textContent = id === G.selfId ? 'You' : a.name;
      chip.appendChild(nm);
      if (a.statuses.length) {
        const row = document.createElement('div');
        row.className = 'chip-status';
        for (const st of a.statuses) {
          const tag = document.createElement('span');
          tag.className = 'st ' + (DEBUFFS.has(st.id) ? 'debuff' : 'buff');
          const ic = new Image();
          ic.src = statusIcon(st.id);
          ic.alt = '';
          tag.append(ic, document.createTextNode(`${pretty(st.id)} ${st.rounds}`));
          row.appendChild(tag);
        }
        chip.appendChild(row);
      }
      el.appendChild(chip);
    }
  }

  function renderFightUi() {
    const f = G.fight;
    if (!f) return;
    renderTurns();
    renderBuffs();
    renderAutoBtn();
    const info = $('fightinfo');
    const h = hero();
    const opts = f.options;
    info.textContent =
      `Round ${f.round}: ` +
      (opts && opts.actor === G.selfId ? `Your turn, ${opts.moveLeft} moves left` : 'Waiting for the other side');

    const box = $('actions');
    const util = $('fight-util');
    box.textContent = '';
    for (const x of util.querySelectorAll('.x')) x.remove();
    if (!opts || opts.actor !== G.selfId) return;
    const extra = (label, onClick, disabled) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'act x';
      b.textContent = label;
      b.disabled = Boolean(disabled);
      b.addEventListener('click', onClick);
      util.appendChild(b);
    };
    if (opts.canSwap || G.inv?.equipment?.weapon2) extra('Q Swap weapon', () => (opts.canSwap ? sendFight({ t: 'swap' }) : toast('You have already acted this turn.')), !opts.canSwap);
    extra('G Guard', () => sendFight({ t: 'guard' }), opts.acted);
    extra('E Eat', () => (foodSlot() < 0 ? toast('You have no food.') : sendFight({ t: 'eat', slot: foodSlot() })), opts.acted);
    extra('F Flee', () => sendFight({ t: 'flee' }), opts.acted);
    extra('Space End turn', () => sendFight({ t: 'end' }), false);
  }

  /** The hero's own buffs and debuffs as icons with rounds left, under the vitals. */
  function renderBuffs() {
    const box = $('buffs');
    box.textContent = '';
    const h = G.fight && hero();
    if (!h) return;
    for (const st of h.statuses) {
      const b = el('span', 'buff ' + (DEBUFFS.has(st.id) ? 'debuff' : 'good'));
      const img = new Image();
      img.src = statusIcon(st.id);
      img.alt = '';
      b.title = `${pretty(st.id)}, ${st.rounds} rounds left`;
      b.append(img, el('span', 'n', String(st.rounds)));
      box.appendChild(b);
    }
  }

  /** Thin experience bar under mana. */
  function renderXpBar() {
    const s = G.stats;
    if (!s) return;
    const xp = (s.skills.combat && s.skills.combat.xp) || 0;
    const cur = xpForLevel(s.combatLevel);
    const next = xpForLevel(s.combatLevel + 1);
    const max = s.combatLevel >= MAX_LEVEL;
    $('xp-fill').style.width = `${max ? 100 : Math.max(0, Math.min(100, ((xp - cur) / Math.max(1, next - cur)) * 100))}%`;
    const bar = $('xp-fill').parentElement;
    if (renderXpBar.last !== undefined && xp > renderXpBar.last) {
      bar.classList.remove('gain');
      void bar.offsetWidth;
      bar.classList.add('gain');
    }
    renderXpBar.last = xp;
    $('xp-text').textContent = max ? `Level ${s.combatLevel}` : `Level ${s.combatLevel}  ${xp - cur}/${next - cur} XP`;
  }

  /** Show an element's title text at once instead of after the browser's long delay. */
  function setupTips() {
    const tip = document.createElement('div');
    tip.id = 'ui-tip';
    tip.className = 'hidden';
    document.body.appendChild(tip);
    let cur = null;
    const place = (ev) => {
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      const x = Math.min(ev.clientX + 14, window.innerWidth - w - 6);
      const y = ev.clientY + 18 + h > window.innerHeight ? ev.clientY - h - 10 : ev.clientY + 18;
      tip.style.left = `${Math.max(4, x)}px`;
      tip.style.top = `${Math.max(4, y)}px`;
    };
    const hide = () => { cur = null; tip.classList.add('hidden'); };
    on(document, 'pointerover', (ev) => {
      const el = ev.target.closest && ev.target.closest('[title], [data-tip]');
      if (!el || !el.closest('#gameview')) { hide(); return; }
      if (el.hasAttribute('title')) {
        el.dataset.tip = el.getAttribute('title');
        el.removeAttribute('title');
      }
      if (!el.dataset.tip) { hide(); return; }
      cur = el;
      tip.textContent = el.dataset.tip;
      tip.style.zoom = String(uiScale());
      tip.classList.remove('hidden');
      place(ev);
    });
    on(document, 'pointermove', (ev) => {
      if (!cur) return;
      if (cur.hasAttribute('title')) {
        cur.dataset.tip = cur.getAttribute('title');
        cur.removeAttribute('title');
        tip.textContent = cur.dataset.tip;
      }
      place(ev);
    });
    on(document, 'pointerout', (ev) => { if (cur && !cur.contains(ev.relatedTarget)) hide(); });
    on(document, 'pointerdown', hide);
  }

  /** Corner map: the ground around the hero, with dots for people, monsters and townsfolk. */
  const MM = { span: 41, px: 3, key: null, base: null };
  const rview = { map: true };

  /** The UI scale for this window: 1 up to 1500x720, growing with the window to 1.75. */
  function uiScale() {
    return Number(getComputedStyle(document.documentElement).getPropertyValue('--ui')) || 1;
  }
  function updateUiScale() {
    const ui = Math.max(1, Math.min(1.75, Math.min(window.innerWidth / 1500, window.innerHeight / 720)));
    const fine = window.matchMedia('(pointer: fine)').matches;
    document.documentElement.classList.toggle('wide-hud', window.innerWidth / ui >= 1360 && fine);
    document.documentElement.classList.toggle('narrow-hud', window.innerWidth / ui < 1620);
    const root = document.documentElement.style;
    root.setProperty('--ui', ui.toFixed(3));
    // vw and vh are not shrunk by the zoom, so give the layout the window size in its own (scaled) units.
    root.setProperty('--vw', `${(window.innerWidth / ui).toFixed(1)}px`);
    root.setProperty('--vh', `${(window.innerHeight / ui).toFixed(1)}px`);
  }

  /**
   * Let the player drag a box by its handle. Positions are kept in the box's own (scaled) units.
   * `done` runs when the drag ends.
   */
  function dragBox(box, handle, done) {
    handle.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return;
      ev.preventDefault();
      const z = uiScale();
      const parent = box.offsetParent || document.body;
      const pr = parent.getBoundingClientRect();
      const r = box.getBoundingClientRect();
      const startX = ev.clientX;
      const startY = ev.clientY;
      const left0 = (r.left - pr.left) / z;
      const top0 = (r.top - pr.top) / z;
      box.style.right = 'auto';
      box.style.bottom = 'auto';
      box.dataset.moved = '1';
      const move = (e) => {
        const maxL = Math.max(0, pr.width / z - 60);
        const maxT = Math.max(0, pr.height / z - 30);
        box.style.left = `${Math.min(Math.max(0, left0 + (e.clientX - startX) / z), maxL)}px`;
        box.style.top = `${Math.min(Math.max(0, top0 + (e.clientY - startY) / z), maxT)}px`;
      };
      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', up);
        if (done) done();
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', up);
    });
  }

  /** A box the player can move and resize, remembered between visits. */
  function floatBox(id, key) {
    const box = $(id);
    const store = `wealdmark.float.${key}`;
    const save = () => {
      if (box.classList.contains('off') || box.classList.contains('hidden') || !box.offsetWidth) return;
      const z = uiScale();
      const pr = (box.offsetParent || document.body).getBoundingClientRect();
      const r = box.getBoundingClientRect();
      try {
        localStorage.setItem(store, JSON.stringify({ l: (r.left - pr.left) / z, t: (r.top - pr.top) / z, w: r.width / z, h: r.height / z }));
      } catch {
        /* blocked storage */
      }
    };
    try {
      const v = JSON.parse(localStorage.getItem(store));
      if (v && [v.l, v.t, v.w, v.h].every(Number.isFinite)) {
        box.style.right = 'auto';
        box.style.left = `${Math.max(0, v.l)}px`;
        box.style.top = `${Math.max(0, v.t)}px`;
        box.style.width = `${Math.max(90, v.w)}px`;
        box.style.height = `${Math.max(60, v.h)}px`;
      }
    } catch {
      /* nothing saved */
    }
    dragBox(box, box.querySelector('.fgrip'), save);
    if (typeof ResizeObserver === 'function') {
      let t = null;
      new ResizeObserver(() => {
        clearTimeout(t);
        t = setTimeout(save, 300);
      }).observe(box);
    }
  }

  /** The map and quest list: show or hide each, drag by the title, resize from the corner. */
  function setupCorner() {
    updateUiScale();
    window.addEventListener('resize', updateUiScale);
    try {
      Object.assign(rview, JSON.parse(localStorage.getItem('wealdmark.corner')) || {});
    } catch {
      /* no saved choice */
    }
    const apply = () => {
      $('mapbox').classList.toggle('off', !rview.map);
      $('r-map').classList.toggle('off', !rview.map);
      try {
        localStorage.setItem('wealdmark.corner', JSON.stringify({ map: rview.map }));
      } catch {
        /* blocked storage */
      }
    };
    on($('r-map'), 'click', () => ((rview.map = !rview.map), apply()));
    on($('r-world'), 'click', () => {
      togglePanel('panel-world');
      G.worldKey = null;
      renderWorld(true);
    });
    floatBox('mapbox', 'map');
    apply();
  }
  function renderMinimap(map) {
    const cv = $('minimap');
    const c = cv.getContext('2d');
    if (MM.key !== map) {
      MM.key = map;
      MM.base = document.createElement('canvas');
      MM.base.width = map.width;
      MM.base.height = map.height;
      const b = MM.base.getContext('2d');
      b.fillStyle = '#0c0912';
      b.fillRect(0, 0, map.width, map.height);
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          b.fillStyle = map.blocked[y][x] === '1' ? '#2a2236' : '#4d7a52';
          b.fillRect(x, y, 1, 1);
        }
      }
      for (const z of map.zones) {
        b.fillStyle = z.kind === 'safe' ? 'rgba(240,200,96,0.22)' : 'rgba(224,90,90,0.12)';
        b.fillRect(z.x, z.y, z.w, z.h);
      }
    }
    const me = G.self();
    if (!me) return;
    const half = (MM.span - 1) / 2;
    const ox = Math.round(me.x) - half;
    const oy = Math.round(me.y) - half;
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#0c0912';
    c.fillRect(0, 0, cv.width, cv.height);
    c.drawImage(MM.base, ox, oy, MM.span, MM.span, 0, 0, MM.span * MM.px, MM.span * MM.px);
    for (const e of G.entities.values()) {
      if (hidden(e)) continue;
      const col = e.id === G.selfId ? '#ffffff' : e.kind === 'player' ? '#6ab0ff' : e.kind === 'monster' ? '#ff6a6a' : e.kind === 'npc' ? '#f0c860' : null;
      if (!col) continue;
      const x = Math.round(e.x) - ox;
      const y = Math.round(e.y) - oy;
      if (x < 0 || y < 0 || x >= MM.span || y >= MM.span) continue;
      c.fillStyle = '#000';
      c.fillRect(x * MM.px - 1, y * MM.px - 1, MM.px + 2, MM.px + 2);
      c.fillStyle = col;
      c.fillRect(x * MM.px, y * MM.px, MM.px, MM.px);
    }
    // Jobs on offer or ready to hand in, for anyone inside the view.
    c.textAlign = 'center';
    c.font = 'bold 10px "Courier New", monospace';
    for (const n of map.npcs || []) {
      const mark = questMark(n.npc);
      if (!mark) continue;
      const x = n.x - ox;
      const y = n.y - oy;
      if (x < 0 || y < 0 || x >= MM.span || y >= MM.span) continue;
      c.fillStyle = '#000';
      c.fillRect(x * MM.px - 3, y * MM.px - 8, 10, 11);
      c.fillStyle = mark === '?' ? '#7bd88f' : '#ffd84a';
      c.fillText(mark, x * MM.px + 2, y * MM.px + 1);
    }
  }

  /** What the world map can show, in legend order. Each has a colour, a one-letter badge, and a test. */
  const WORLD_KINDS = [
    { id: 'quest', label: 'Jobs', color: '#ffd84a', badge: '!' },
    { id: 'shop', label: 'Stores', color: '#e6b34a', badge: '$' },
    { id: 'smith', label: 'Smithing', color: '#e07a3a', badge: 'S' },
    { id: 'cook', label: 'Cooking', color: '#d85a5a', badge: 'C' },
    { id: 'craft', label: 'Crafting', color: '#b072e6', badge: 'W' },
    { id: 'inn', label: 'Inns and storage', color: '#6ab0ff', badge: 'I' },
    { id: 'bell', label: 'Bellstones', color: '#9fe8c8', badge: 'B' },
    { id: 'tree', label: 'Woodcutting', color: '#5aa04a', badge: 'T' },
    { id: 'rock', label: 'Mining', color: '#a8a8b8', badge: 'M' },
    { id: 'fish', label: 'Fishing', color: '#4a9fe0', badge: 'F' },
    { id: 'warren', label: 'Hunting', color: '#b8885a', badge: 'H' },
  ];
  const worldHidden = new Set();

  function worldPoints() {
    const map = G.map;
    const pts = [];
    const npcs = G.data.npcs;
    for (const n of map.npcs || []) {
      const def = npcs.get(n.npc);
      if (!def) continue;
      const svc = new Set((def.services || []).map((s) => s.kind));
      if (questMark(n.npc)) pts.push({ k: 'quest', x: n.x, y: n.y, name: def.name, mark: questMark(n.npc) });
      if (svc.has('shop')) pts.push({ k: 'shop', x: n.x, y: n.y, name: def.name });
      if (svc.has('inn') || svc.has('storage')) pts.push({ k: 'inn', x: n.x, y: n.y, name: def.name });
    }
    for (const s of map.stations || []) {
      const def = G.data.stations.get(s.station);
      if (!def) continue;
      if (def.kind === 'bell') pts.push({ k: 'bell', x: s.x, y: s.y, name: def.name });
      else if (def.kind === 'craft') pts.push({ k: def.skill === 'smithing' ? 'smith' : def.skill === 'cooking' ? 'cook' : 'craft', x: s.x, y: s.y, name: def.name });
    }
    const art = { tree: 'tree', rock: 'rock', fish: 'fish', warren: 'warren' };
    for (const n of map.nodes || []) {
      const def = G.data.nodes.get(n.node);
      const k = def && art[def.art];
      if (k) pts.push({ k, x: n.x, y: n.y, name: def.name });
    }
    return pts;
  }

  /** The whole map on one canvas, with places of interest and the hero. Redrawn when something it shows changes. */
  function renderWorld(force) {
    const panel = $('panel-world');
    if (!panel || panel.classList.contains('hidden') || !G || !G.map || !G.data) return;
    const me = G.self();
    const marks = JSON.stringify([(G.map.npcs || []).map((n) => questMark(n.npc) || ''), [...worldHidden], me ? [Math.round(me.x / 2), Math.round(me.y / 2)] : 0]);
    if (!force && marks === G.worldKey) return;
    G.worldKey = marks;
    const map = G.map;
    const px = 3;
    const cv = $('worldmap');
    if (cv.width !== map.width * px) {
      cv.width = map.width * px;
      cv.height = map.height * px;
      G.worldBase = null;
    }
    if (!G.worldBase) {
      const b = document.createElement('canvas');
      b.width = cv.width;
      b.height = cv.height;
      const c = b.getContext('2d');
      c.fillStyle = '#0c0912';
      c.fillRect(0, 0, b.width, b.height);
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const gid = map.layers.ground[y * map.width + x];
          c.fillStyle = gid === 4 ? '#2c5a8a' : map.blocked[y][x] === '1' ? '#2a2236' : '#4d7a52';
          c.fillRect(x * px, y * px, px, px);
        }
      }
      for (const z of map.zones) {
        c.fillStyle = z.kind === 'safe' ? 'rgba(240,200,96,0.22)' : 'rgba(224,90,90,0.10)';
        c.fillRect(z.x * px, z.y * px, z.w * px, z.h * px);
      }
      c.textAlign = 'center';
      c.font = 'bold 11px "Courier New", monospace';
      for (const z of map.zones) {
        if (z.kind !== 'safe') continue;
        const tx = (z.x + z.w / 2) * px;
        const ty = z.y * px - 3;
        c.lineWidth = 3;
        c.strokeStyle = '#000';
        c.strokeText(z.name, tx, ty);
        c.fillStyle = '#f0d890';
        c.fillText(z.name, tx, ty);
      }
      G.worldBase = b;
    }
    const ctx = cv.getContext('2d');
    ctx.drawImage(G.worldBase, 0, 0);
    ctx.textAlign = 'center';
    ctx.font = 'bold 8px "Courier New", monospace';
    const kinds = new Map(WORLD_KINDS.map((k) => [k.id, k]));
    for (const p of worldPoints()) {
      if (worldHidden.has(p.k)) continue;
      const k = kinds.get(p.k);
      const cx = p.x * px + px / 2;
      const cy = p.y * px + px / 2;
      const natural = p.k === 'tree' || p.k === 'rock' || p.k === 'fish' || p.k === 'warren';
      if (natural) {
        ctx.fillStyle = '#000';
        ctx.fillRect(cx - 3, cy - 3, 6, 6);
        ctx.fillStyle = k.color;
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
      } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(cx - 5, cy - 5, 10, 10);
        ctx.fillStyle = k.color;
        ctx.fillRect(cx - 4, cy - 4, 8, 8);
        ctx.fillStyle = '#17112a';
        ctx.fillText(p.k === 'quest' ? p.mark : k.badge, cx, cy + 3);
      }
    }
    if (me) {
      const cx = Math.round(me.x) * px + px / 2;
      const cy = Math.round(me.y) * px + px / 2;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e6b34a';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      if (force) {
        const sc = $('world-scroll');
        sc.scrollTop = Math.max(0, cy - sc.clientHeight / 2);
      }
    }
    const legend = $('world-legend');
    if (!legend.childElementCount) {
      for (const k of WORLD_KINDS) {
        const b = el('button', 'wl');
        b.type = 'button';
        const sw = el('span', 'wsw', k.badge);
        sw.style.background = k.color;
        b.append(sw, document.createTextNode(k.label));
        b.addEventListener('click', () => {
          if (worldHidden.has(k.id)) worldHidden.delete(k.id);
          else worldHidden.add(k.id);
          b.classList.toggle('off', worldHidden.has(k.id));
          renderWorld(true);
        });
        legend.appendChild(b);
      }
    }
  }

  /** Keep the journal's progress lines current as the bag and kills change. */
  let trackerKey = '';
  function renderTracker() {
    if (!G.data || !G.quests) return;
    const states = questStates();
    const key = JSON.stringify([...G.data.quests.values()].map((q) => {
      const st = states.get(q.id);
      if (!st || st.done || !q.steps[st.step]) return [q.id, st ? 'done' : 0];
      return [q.id, st.step, progressText(q.steps[st.step].need, st), needMet(q.steps[st.step].need, st)];
    }));
    if (key === trackerKey) return;
    trackerKey = key;
    renderJournal();
  }

  /** Quests the player has switched off in the journal; every other active quest counts as tracked. */
  function untrackedQuests() {
    const me = G.self();
    try {
      return new Set(JSON.parse(localStorage.getItem(`wealdmark.untracked.${me ? me.name : ''}`)) || []);
    } catch {
      return new Set();
    }
  }
  function setTracked(id, on) {
    const me = G.self();
    const set = untrackedQuests();
    if (on) set.delete(id);
    else set.add(id);
    try {
      localStorage.setItem(`wealdmark.untracked.${me ? me.name : ''}`, JSON.stringify([...set]));
    } catch {
      /* blocked storage: the choice lasts until the page closes */
    }
    renderJournal();
  }

  // ---- bottom bar: globes, action bar, quick slots

  const BAR_SLOTS = 8;
  const STYLES = ['melee', 'range', 'magic'];
  /** Which skill tree each ability belongs to, for filling and filtering the three bars. */
  const ABILITY_STYLE = {};
  for (const [style, ids] of Object.entries({
    melee: ['punch', 'slash', 'multi_strike', 'power_strike', 'rend', 'sunder_strike', 'war_cry', 'whirlwind', 'execute'],
    range: ['shot', 'multi_shot', 'aimed_shot', 'poison_arrow', 'snare', 'rain_of_arrows', 'backstep', 'deadeye'],
    magic: ['fireball', 'ice_storm', 'mana_shield', 'chain_lightning', 'arcane_surge'],
    defense: ['shield_bash', 'fortify', 'second_wind', 'parry', 'stoneskin', 'retaliate', 'unbreakable', 'heal'],
  })) for (const id of ids) ABILITY_STYLE[id] = style;
  /** Quick slots beside the globes. `item` is the default item; 'any' means the first food in the bag. */
  const QUICK = [
    { id: 'hp', key: 'h', label: 'Health potion or food', item: 'minor_health_potion', match: (d) => (d.kind === 'potion' && d.heal && !d.mana) || d.kind === 'food' },
    { id: 'food', key: 'u', label: 'Food', item: 'any', match: (d) => d.kind === 'food' },
    { id: 'mp', key: 'n', label: 'Mana potion', item: 'minor_mana_potion', match: (d) => d.kind === 'potion' && d.mana },
  ];

  function barState() {
    const me = G.self();
    const key = `wealdmark.bar.${me ? me.name : ''}`;
    if (G.bar && G.bar.key === key) return G.bar;
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(key));
    } catch {
      saved = null;
    }
    const bars = {};
    for (const s of STYLES) bars[s] = saved && saved.bars && Array.isArray(saved.bars[s]) ? saved.bars[s] : null;
    G.bar = { key, bars, quick: (saved && saved.quick) || {} };
    return G.bar;
  }

  function saveBar() {
    try {
      localStorage.setItem(G.bar.key, JSON.stringify({ bars: G.bar.bars, quick: G.bar.quick }));
    } catch {
      /* private window or blocked storage: the layout lasts until the page closes */
    }
  }

  const heldWeapon = () => (G.inv && G.inv.equipment && G.inv.equipment.weapon) || null;

  /** Every ability the hero has unlocked: the basic attacks, then each skill with a rank in it. */
  function unlockedAbilities() {
    const ids = [...BASIC_ATTACKS];
    const ranks = (G.stats && G.stats.ranks) || {};
    for (const id of Object.keys(ranks)) if (ranks[id] > 0 && ABILITY_INFO[id] && !ids.includes(id)) ids.push(id);
    return ids;
  }

  function weaponClassOf(ref) {
    const def = ref && G.data && G.data.items.get(ref.id);
    return (def && def.weaponClass) || null;
  }

  /** Which bar is showing: the one for the weapon in hand. Fists count as melee. */
  const barStyle = () => CLASS_SKILL[weaponClassOf(heldWeapon())] || 'melee';

  /** A bar until the player changes it: that style's basic attack and abilities, then defense abilities. */
  function defaultBar(style) {
    const basic = { melee: heldWeapon() ? 'slash' : 'punch', range: 'shot', magic: 'fireball' }[style];
    const have = unlockedAbilities().filter((id) => !BASIC_ATTACKS.includes(id));
    const ids = [basic, ...have.filter((id) => ABILITY_STYLE[id] === style), ...have.filter((id) => ABILITY_STYLE[id] === 'defense')];
    return ids.slice(0, BAR_SLOTS).map((id) => ({ k: 'ability', id }));
  }

  const barSlots = (style = barStyle()) => {
    const slots = barState().bars[style] || defaultBar(style);
    return Array.from({ length: BAR_SLOTS }, (_, i) => slots[i] || null);
  };

  /** Inventory index of the first stack of an item, or of any food. */
  function bagIndex(item) {
    if (!G.inv || !G.data) return -1;
    if (item === 'any') return foodSlot();
    return G.inv.items.findIndex((s) => s && s.id === item);
  }

  function bagCountOf(item) {
    if (!G.inv || !G.data) return 0;
    return G.inv.items.reduce((n, s) => (s && (item === 'any' ? G.data.items.get(s.id)?.kind === 'food' : s.id === item) ? n + s.qty : n), 0);
  }

  const quickItem = (q) => {
    const set = barState().quick;
    return q.id in set ? set[q.id] : q.item;
  };

  function useBarSlot(i, fromKey) {
    const entry = barSlots()[i];
    if (!entry) return fromKey ? undefined : openBarPicker('bar', i);
    if (entry.k === 'weapon') {
      const idx = bagIndex(entry.id);
      const held = heldWeapon();
      if (held && held.id === entry.id) return toast('You are already holding it.');
      if (G.fight) {
        if (!isMyTurn()) return toast('Not your turn to act.');
        const alt = G.inv && G.inv.equipment && G.inv.equipment.weapon2;
        if (alt && alt.id === entry.id) return G.fight.options.canSwap ? sendFight({ t: 'swap' }) : toast('You have already acted this turn.');
        return toast('In a fight you can only swap to the weapon in your swap slot.');
      }
      if (idx < 0) return toast(G.inv && G.inv.equipment && G.inv.equipment.weapon2 && G.inv.equipment.weapon2.id === entry.id ? 'That weapon is in your swap slot. Take it off in Gear (E) to hold it.' : 'That weapon is not in your bag.');
      return window.wealdmark.send({ t: 'equip', slot: idx });
    }
    const info = ABILITY_INFO[entry.id];
    if (!G.fight) return fromKey ? undefined : openBarPicker('bar', i);
    if (!isMyTurn()) return toast('Not your turn to act.');
    const opt = G.fight.options.abilities.find((a) => a.id === entry.id);
    if (!opt) return toast(`${info ? info[0] : 'That ability'} needs a different weapon or shield.`);
    if (opt.reason === 'buff') return toast('Another buff of that kind is still running. Only one damage buff and one defensive buff can be held at a time.');
    selectAbility(entry.id);
  }

  function useQuick(q) {
    const item = quickItem(q);
    const idx = item ? bagIndex(item) : -1;
    if (!item) return openBarPicker('quick', q.id);
    if (idx < 0) return toast(`You have none of that. Click the slot to change it.`);
    if (G.fight) {
      if (!isMyTurn() || G.fight.options.acted) return toast('Not your turn to act.');
      return sendFight({ t: 'eat', slot: idx });
    }
    window.wealdmark.send({ t: 'use', slot: idx });
  }

  function closeBarPicker() {
    const p = $('bar-picker');
    if (p) p.classList.add('hidden');
  }

  /** A small list above a slot: pick what goes in it. */
  function openBarPicker(kind, which) {
    const box = $('bar-picker');
    box.textContent = '';
    const b = barState();
    const choose = (apply) => {
      apply();
      saveBar();
      closeBarPicker();
      G.barSig = null;
      renderBar();
    };
    const row = (label, icon, onPick) => {
      const r = el('button', 'pick');
      r.type = 'button';
      if (icon) r.appendChild(icon);
      r.appendChild(document.createTextNode(label));
      r.addEventListener('click', onPick);
      box.appendChild(r);
    };
    const itemImg = (def) => {
      const cv = iconCanvas(def);
      cv.className = 'icon';
      return cv;
    };
    if (kind === 'bar') {
      const style = barStyle();
      box.appendChild(el('h4', '', `${style[0].toUpperCase()}${style.slice(1)} bar, slot ${which + 1}`));
      const put = (entry) => choose(() => {
        const slots = barSlots(style);
        b.bars[style] = slots.slice();
        b.bars[style][which] = entry;
      });
      for (const id of unlockedAbilities()) {
        const img = new Image();
        img.src = abilityIcon(id);
        row(ABILITY_NAMES[id] || pretty(id), img, () => {
          const need = ABILITY_STYLE[id];
          if ((need === 'melee' || need === 'range' || need === 'magic') && need !== style) {
            toast('You can not use that ability with your current weapon.');
            return;
          }
          put({ k: 'ability', id });
        });
      }
      const seen = new Set();
      const weapons = [];
      for (const ref of [...((G.inv && G.inv.items) || []), heldWeapon(), G.inv && G.inv.equipment && G.inv.equipment.weapon2]) {
        const def = ref && G.data && G.data.items.get(ref.id);
        if (def && def.kind === 'weapon' && !seen.has(def.id)) {
          seen.add(def.id);
          weapons.push(def);
        }
      }
      for (const def of weapons) row(`${def.name} (weapon)`, itemImg(def), () => put({ k: 'weapon', id: def.id }));
      row('Clear this slot', null, () => put(null));
    } else {
      const q = QUICK.find((x) => x.id === which);
      box.appendChild(el('h4', '', q.label));
      const put = (item) => choose(() => (b.quick[q.id] = item));
      if (q.id === 'food') row('Any food in my bag', null, () => put('any'));
      const have = new Map();
      for (const ref of (G.inv && G.inv.items) || []) {
        const def = ref && G.data && G.data.items.get(ref.id);
        if (def && q.match(def)) have.set(def.id, (have.get(def.id) || 0) + ref.qty);
      }
      for (const [id, n] of have) row(`${itemName({ id })} x${n}`, itemImg(G.data.items.get(id)), () => put(id));
      if (!have.size) box.appendChild(el('p', 'muted', 'Nothing in your bag fits here.'));
      row('Clear this slot', null, () => put(''));
    }
    box.classList.remove('hidden');
  }

  function barSlotEl(i, entry) {
    const b = el('button', 'bslot' + (entry ? '' : ' empty'));
    b.type = 'button';
    b.dataset.i = String(i);
    const key = el('span', 'hk', String(i + 1));
    if (entry) {
      let on = true;
      if (entry.k === 'weapon') {
        const def = G.data && G.data.items.get(entry.id);
        if (def) {
          const cv = iconCanvas(def);
          cv.className = 'icon';
          b.appendChild(cv);
          b.title = `${def.name}. Click to hold it. Right-click to change.`;
        }
        const held = heldWeapon();
        if (held && held.id === entry.id) b.classList.add('held');
        if (!bagCountOf(entry.id) && !(held && held.id === entry.id)) on = false;
      } else {
        const img = new Image();
        img.src = abilityIcon(entry.id);
        img.alt = '';
        b.appendChild(img);
        const info = ABILITY_INFO[entry.id];
        const opt = G.fight && G.fight.options ? G.fight.options.abilities.find((a) => a.id === entry.id) : null;
        const lines = [info ? `${info[0]}: ${info[1]}` : entry.id];
        if (G.fight) {
          if (!opt) {
            on = false;
            lines.push('Needs a different weapon or shield.');
          } else {
            if (opt.mana) {
              b.appendChild(el('span', 'cost', String(opt.mana)));
              lines.push(`Costs ${opt.mana} mana.`);
            }
            if (!opt.usable) on = false;
            if (opt.reason === 'buff') lines.push('Another buff of that kind is running.');
            if (opt.cooldown) b.appendChild(el('span', 'cd', String(opt.cooldown)));
            if (G.fight.selected === entry.id) b.classList.add('selected');
          }
        }
        lines.push(G.fight ? 'Right-click to change.' : 'Click or right-click to change this slot.');
        b.title = lines.join('\n');
      }
      if (!on) b.classList.add('off');
    } else b.title = 'Empty. Click to choose an ability or weapon.';
    b.appendChild(key);
    b.addEventListener('click', () => useBarSlot(i, false));
    return b;
  }

  function wirePicker(btn, open) {
    let timer = null;
    btn.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
      open();
    });
    btn.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType === 'mouse') return;
      timer = setTimeout(() => {
        timer = null;
        btn.dataset.long = '1';
        open();
      }, 500);
    });
    for (const t of ['pointerup', 'pointerleave', 'pointercancel']) btn.addEventListener(t, () => timer && (clearTimeout(timer), (timer = null)));
    btn.addEventListener(
      'click',
      (ev) => {
        if (btn.dataset.long) {
          delete btn.dataset.long;
          ev.stopImmediatePropagation();
        }
      },
      true,
    );
  }

  /** Go to the previous (dir -1) or next (+1) bar whose weapon you can reach: in a fight only the swap slot counts. */
  function switchBar(style, dir) {
    const alt = G.inv && G.inv.equipment && G.inv.equipment.weapon2;
    for (let step = 1; step < STYLES.length; step++) {
      const want = STYLES[(STYLES.indexOf(style) + dir * step + STYLES.length * 2) % STYLES.length];
      if (G.fight) {
        if (alt && (CLASS_SKILL[weaponClassOf(alt)] || 'melee') === want) {
          if (!isMyTurn()) return toast('Not your turn to act.');
          return G.fight.options.canSwap ? sendFight({ t: 'swap' }) : toast('You have already acted this turn.');
        }
        continue;
      }
      const idx = ((G.inv && G.inv.items) || []).findIndex((s) => {
        const def = s && G.data.items.get(s.id);
        return def && def.kind === 'weapon' && CLASS_SKILL[def.weaponClass] === want;
      });
      if (idx >= 0) return window.wealdmark.send({ t: 'equip', slot: idx });
    }
    toast(G.fight ? 'Your swap slot has no weapon for another bar.' : 'You carry no weapon for another bar.');
  }

  /** One marker for the bar that is up (1 melee, 2 ranged, 3 magic), with arrows to change it. */
  function barSwitcher(style) {
    const n = STYLES.indexOf(style) + 1;
    const box = el('div', 'barsw');
    const mk = (cls, text, dir, title) => {
      const b = el('button', cls, text);
      b.type = 'button';
      b.title = title;
      if (dir) b.addEventListener('click', () => switchBar(style, dir));
      return b;
    };
    box.append(
      mk('up', '▲', -1, 'Previous ability bar. The bar follows the weapon in your hand.'),
      mk('num', String(n), 0, `Ability bar ${n} of 3: ${style}.`),
      mk('down', '▼', 1, 'Next ability bar. The bar follows the weapon in your hand.'),
    );
    return box;
  }

  /** Rebuild the bar only when something it shows has changed. */
  function renderBar() {
    const host = $('hotbar');
    if (!host || !G.data) return;
    const style = barStyle();
    const slots = barSlots(style);
    const opts = G.fight && G.fight.options;
    const sig = JSON.stringify([
      style,
      slots,
      G.auto && !bossFight(),
      bossFight(),
      opts ? [opts.actor, opts.acted, G.fight.selected, opts.abilities.map((a) => [a.id, a.usable, a.cooldown, a.mana])] : 0,
      heldWeapon() && heldWeapon().id,
      G.inv && G.inv.equipment && G.inv.equipment.weapon2 && G.inv.equipment.weapon2.id,
      G.inv ? G.inv.items.map((s) => s && s.id + s.qty) : 0,
      QUICK.map(quickItem),
    ]);
    if (sig === G.barSig) return;
    G.barSig = sig;
    host.textContent = '';
    host.dataset.style = style;
    slots.forEach((entry, i) => {
      const b = barSlotEl(i, entry);
      wirePicker(b, () => openBarPicker('bar', i));
      host.appendChild(b);
    });
    const auto = el('button', 'sslot auto' + (G.auto && !bossFight() ? ' on' : ''));
    auto.type = 'button';
    auto.disabled = false;
    auto.append(el('b', '', 'AUTO'), el('span', 'st', G.auto && !bossFight() ? 'ON' : 'OFF'), el('span', 'hk', 'X'));
    auto.title = bossFight() ? 'Auto combat is not available against bosses and minibosses.' : 'Auto combat (X). Auto plays your turns: heals and buffs, eats when hurt, attacks with the strongest ability in reach, otherwise walks toward the nearest enemy. It stays on between fights until you turn it off.';
    auto.addEventListener('click', toggleAuto);
    const left = $('side-l');
    const right = $('side-r');
    left.textContent = '';
    right.textContent = '';
    left.append(auto);

    const alt = G.inv && G.inv.equipment && G.inv.equipment.weapon2;
    const swap = el('button', 'sslot swap' + (alt ? '' : ' off'));
    swap.type = 'button';
    const altDef = alt && G.data.items.get(alt.id);
    if (altDef) {
      const cv = iconCanvas(altDef);
      cv.className = 'icon';
      swap.appendChild(cv);
    } else swap.appendChild(el('span', 'plus', 'Swap'));
    swap.appendChild(el('span', 'hk', 'Q'));
    swap.title = alt ? `Swap to ${altDef ? altDef.name : 'your second weapon'} (Q). In a fight it uses your action.` : 'Swap weapon (Q). Shift-click a weapon in your bag to place it in the swap slot.';
    swap.addEventListener('click', () => {
      if (G.fight) {
        if (!isMyTurn()) return toast('Not your turn to act.');
        if (!G.fight.options.canSwap) return toast(G.fight.options.acted ? 'You have already acted this turn.' : 'You have no second weapon. Shift-click a weapon in your bag to place it in the swap slot.');
        return sendFight({ t: 'swap' });
      }
      toast('You can swap weapons in a fight. Out of one, change your weapon in Gear (E) or from the bar.');
    });
    right.append(swap, barSwitcher(style));

    for (const q of QUICK) {
      const slot = document.querySelector(`.qslot[data-q="${q.id}"]`);
      if (!slot) continue;
      slot.textContent = '';
      const item = quickItem(q);
      const def = item && item !== 'any' && G.data.items.get(item);
      const n = item ? bagCountOf(item) : 0;
      if (item === 'any') {
        const first = G.inv && G.inv.items.find((s) => s && G.data.items.get(s.id)?.kind === 'food');
        const fd = first && G.data.items.get(first.id);
        if (fd) {
          const cv = iconCanvas(fd);
          cv.className = 'icon';
          slot.appendChild(cv);
        } else slot.appendChild(el('span', 'plus', 'Food'));
      } else if (def) {
        const cv = iconCanvas(def);
        cv.className = 'icon';
        slot.appendChild(cv);
      } else slot.appendChild(el('span', 'plus', '+'));
      slot.classList.toggle('off', Boolean(item) && n === 0);
      if (item) slot.appendChild(el('span', 'cnt', String(n)));
      slot.appendChild(el('span', 'hk', q.key.toUpperCase()));
      slot.title = `${q.label}${item ? (item === 'any' ? ': the first food in your bag' : `: ${def ? def.name : item}`) : ': empty'}. Click to use. Right-click to change.`;
    }
  }

  function setupBar() {
    for (const q of QUICK) {
      const slot = document.querySelector(`.qslot[data-q="${q.id}"]`);
      if (!slot) continue;
      slot.addEventListener('click', () => useQuick(q));
      wirePicker(slot, () => openBarPicker('quick', q.id));
    }
    on(document, 'pointerdown', (ev) => {
      const p = $('bar-picker');
      if (p && !p.classList.contains('hidden') && !p.contains(ev.target) && !ev.target.closest('.bslot, .qslot')) closeBarPicker();
    });
  }

  function renderGlobes(hp, maxHp, mp, maxMp) {
    $('globe-hp').style.setProperty('--fill', `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%`);
    $('globe-mp').style.setProperty('--fill', `${Math.max(0, Math.min(100, (mp / maxMp) * 100))}%`);
    $('globe-hp-text').textContent = `${hp}/${maxHp}`;
    $('globe-mp-text').textContent = `${mp}/${maxMp}`;
  }

  function renderStats() {
    const s = G.stats;
    if (!s) return;
    $('w-iron').textContent = String(s.wallet.iron_bits);
    $('w-gold').textContent = String(s.wallet.gold_coins);
    $('w-favor').textContent = String(s.wallet.favor_tokens);
    const xp = (s.skills.combat && s.skills.combat.xp) || 0;
    const cur = xpForLevel(s.combatLevel);
    const next = xpForLevel(s.combatLevel + 1);
    $('combat-level').textContent = s.combatLevel >= MAX_LEVEL ? `Level ${s.combatLevel} (max)` : `Level ${s.combatLevel}: ${xp - cur} / ${next - cur} XP`;
    const vit = $('stats-vitals');
    vit.textContent = '';
    const vh = document.createElement('h3');
    vh.textContent = 'Character';
    const vl = document.createElement('dl');
    for (const [k, v] of [
      ['Level', String(s.combatLevel)],
      ['Experience', String(xp)],
      ['Health', `${s.hp} / ${s.maxHp}`],
      ['Mana', `${s.mana} / ${s.maxMana}`],
      ['Skill points', String(s.points)],
    ]) {
      const dt = document.createElement('dt');
      dt.textContent = k;
      const dd = document.createElement('dd');
      dd.textContent = v;
      vl.append(dt, dd);
    }
    vit.append(vh, vl);
    $('level-bar').firstElementChild.style.width = s.combatLevel >= MAX_LEVEL ? '100%' : `${Math.min(100, ((xp - cur) / (next - cur)) * 100)}%`;
    renderTree();
    renderTrades();
  }

  /** The Trades window: every gathering and crafting skill with its level and progress. */
  function renderTrades() {
    const s = G.stats;
    const box = $('trades-body');
    if (!s || !box) return;
    box.textContent = '';
    for (const id of Object.keys(SKILL_LABEL)) {
      const e = s.skills[id] || { xp: 0, level: 1 };
      const cap = e.level >= WORK_CAP;
      const cur = xpForLevel(e.level);
      const next = xpForLevel(e.level + 1);
      const row = document.createElement('div');
      row.className = 'trade-row';
      const top = document.createElement('div');
      top.className = 'top';
      const name = document.createElement('span');
      name.textContent = SKILL_LABEL[id];
      const lv = document.createElement('b');
      lv.textContent = cap ? `Level ${e.level} (max)` : `Level ${e.level}`;
      top.append(name, lv);
      const bar = document.createElement('div');
      bar.className = 'trade-bar';
      const fill = document.createElement('div');
      fill.style.width = cap ? '100%' : `${Math.max(0, Math.min(100, ((e.xp - cur) / (next - cur)) * 100))}%`;
      bar.appendChild(fill);
      const note = document.createElement('div');
      note.className = 'muted';
      note.textContent = cap ? `${e.xp} XP` : `${e.xp - cur} / ${next - cur} XP to level ${e.level + 1}`;
      row.append(top, bar, note);
      box.appendChild(row);
    }
  }

  /** The skill tree screen: four tabs, six rows of two skills, a point to spend on each. */
  function renderTree() {
    const s = G.stats;
    if (!s || !G.data) return;
    const trees = G.data.trees || [];
    const ranks = s.ranks || {};
    const byId = new Map(trees.map((t) => [t.id, t]));
    $('skill-points').textContent = `${s.points} skill point${s.points === 1 ? '' : 's'} to spend`;
    const tabs = $('tree-tabs');
    tabs.textContent = '';
    for (const name of TREE_NAMES) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = pretty(name);
      b.className = name === treeTab ? 'on' : '';
      b.onclick = () => {
        treeTab = name;
        renderTree();
      };
      tabs.appendChild(b);
    }
    const grid = $('tree-grid');
    grid.textContent = '';
    for (let row = 0; row < 6; row++) {
      const lv = document.createElement('span');
      lv.className = 'lv';
      lv.textContent = `Lv ${ROW_LEVELS[row]}`;
      grid.appendChild(lv);
      for (let col = 0; col < 2; col++) {
        const sk = trees.find((t) => t.tree === treeTab && t.row === row && t.col === col);
        if (!sk) {
          const gap = document.createElement('span');
          gap.className = 'spacer';
          grid.appendChild(gap);
          continue;
        }
        const rank = ranks[sk.id] || 0;
        const rowLocked = s.combatLevel < ROW_LEVELS[row];
        const missing = sk.needs.filter((n) => !(ranks[n] > 0)).map((n) => (byId.get(n) || { name: n }).name);
        const locked = sk.planned || rowLocked || missing.length > 0;
        const canSpend = !locked && s.points > 0 && rank < 10;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'node' + (sk.passive ? ' passive' : '') + (rank > 0 ? ' ranked' : '') + (canSpend ? ' ready' : '') + (locked ? ' locked' : '');
        const name = document.createElement('span');
        name.textContent = sk.name;
        const r = document.createElement('b');
        r.textContent = sk.planned ? 'soon' : `${rank}/10`;
        b.append(name, r);
        const tip = [sk.name + (sk.passive ? ' (passive)' : ''), sk.blurb];
        if (sk.needs.length) tip.push(`Needs: ${sk.needs.map((n) => (byId.get(n) || { name: n }).name).join(', ')}`);
        if (rowLocked) tip.push(`Opens at level ${ROW_LEVELS[row]}`);
        else if (missing.length) tip.push(`Raise first: ${missing.join(', ')}`);
        if (!sk.passive && !sk.planned) tip.push('Each rank adds 6% damage and 3% mana cost. Ranks 5 and 10 shorten the cooldown.');
        b.title = tip.join('\n');
        b.onclick = () => {
          if (G.fight) return toast("You can't change skills in a fight.");
          if (canSpend) window.wealdmark.send({ t: 'spend', skill: sk.id });
          else if (sk.planned) toast('This skill is coming in a future update.');
          else if (rank >= 10) toast('This skill is already at its maximum rank.');
          else if (rowLocked) toast(`Opens at level ${ROW_LEVELS[row]}.`);
          else if (missing.length) toast(`Raise ${missing.join(' and ')} before unlocking this skill.`);
          else toast('You have no skill points to spend.');
        };
        grid.appendChild(b);
      }
    }
    const respec = $('respec');
    respec.textContent = s.respecCost ? `Respec (${s.respecCost} iron bits)` : 'Respec (free)';
    respec.onclick = () => {
      if (G.fight) return toast("You can't change skills in a fight.");
      window.wealdmark.send({ t: 'respec' });
    };
  }

  const itemName = (ref) => {
    const def = G.data && G.data.items.get(ref.id);
    return `${def ? def.name : pretty(ref.id)}${ref.rarity && ref.rarity !== 'basic' ? ` (${ref.rarity})` : ''}`;
  };

  function modText(m) {
    const spec = G.data && G.data.mods && G.data.mods[m.m];
    if (!spec) return `${m.m} tier ${m.t}`;
    return `+${spec.tiers[m.t - 1]}${spec.unit} ${spec.label}`;
  }

  /** Mirrors LEGENDARY_POWERS in the shared gear module. */
  const POWER_TEXT = {
    unmoving: ['Unmoving', 'Immune to stagger and slow.', '-1 tile of movement.'],
    thorns: ['Thorns', 'Reflects 20% of the melee damage you take back at the attacker.', '-15% damage dealt.'],
  };

  function itemTip(ref) {
    const def = G.data && G.data.items.get(ref.id);
    if (!def) return ref.id;
    const lines = [itemName(ref)];
    if (def.kind === 'weapon') {
      lines.push(`${def.element ? `${pretty(def.element)} ` : ''}${pretty(def.weaponClass || 'blade')}, power ${def.weaponPower}${def.weaponClass === 'dagger' ? ', two actions a turn' : ''}${def.twoHanded ? ', two-handed' : ''}`);
      if (WEAPON_BLURB[def.weaponClass]) lines.push(WEAPON_BLURB[def.weaponClass]);
      if (def.element && ELEMENT_BLURB[def.element]) lines.push(ELEMENT_BLURB[def.element]);
    }
    if (def.kind === 'armor') {
      lines.push(`${pretty(def.slot || 'armor')}${def.armor ? `, armor ${def.armor}` : ''}`);
      if (def.flatReduction) lines.push(`Blocks ${def.flatReduction} damage from every hit`);
      if (def.blockChance) lines.push(`${Math.round(def.blockChance * 100)}% chance to block a physical hit, then a 3 round pause. Total block is capped at 75%.`);
    }
    if (def.kind === 'food' || def.kind === 'potion') lines.push([def.heal ? `Restores ${def.heal} health` : '', def.mana ? `Restores ${def.mana} mana` : ''].filter(Boolean).join(', '));
    else if (def.kind === 'tool') lines.push(`${pretty(def.toolType)}, tier ${def.tier}. Kept in your bag; it is not worn.`);
    else if (def.kind === 'material') lines.push('Crafting material');
    else {
      lines.push(`Tier ${def.tier}: needs level ${TIER_LEVELS[def.tier - 1]}`);
    }
    if (def.value) lines.push(`Worth ${def.value} iron bits`);
    if (def.bossOnly) lines.push('Dropped only by dungeon bosses.');
    else if (def.dropOnly) lines.push('Monster drop only. Not sold in shops.');
    const power = def.power && POWER_TEXT[def.power];
    if (power) lines.push(`Power, ${power[0]}: ${power[1]} Cost: ${power[2]}`);
    for (const m of ref.mods || []) lines.push(modText(m));
    return lines.join('\n');
  }

  /** The equipment screen's totals: what the worn gear adds up to. */
  function renderGear(g) {
    const box = $('gear-stats');
    box.textContent = '';
    if (!g) return;
    const pct = (v) => `${Math.round(v * 1000) / 10}%`;
    const rows = [
      ['Armor', `${g.armor} (${pct(g.armor / (g.armor + 100))} less damage)`],
      ['Shield block', g.flatReduction ? `${g.flatReduction} off every hit` : 'none'],
      ['Block chance', pct(g.block || 0)],
      ['Weapon', g.weapon.cls ? `${pretty(g.weapon.cls)}, max hit ${g.weapon.maxHit}${g.weapon.actions > 1 ? ` x${g.weapon.actions}` : ''}` : `Fists, max hit ${g.weapon.maxHit}`],
      ['Damage', `${g.damagePct >= 0 ? '+' : ''}${pct(g.damagePct)}`],
      ['Crit chance', pct(g.critChance)],
      ['Crit damage', `+${pct(g.critDamage)}`],
      ['Accuracy', `+${g.accuracy}`],
      ['Hit chance', g.weapon.cls === 'staff' ? '100% (spells never miss)' : `${pct(myHitChance((G.stats && G.stats.combatLevel) || 1))} against level ${(G.stats && G.stats.combatLevel) || 1}`],
      ['Dodge', pct(g.dodge)],
      ['Life leech', pct(g.leech)],
      ['Bonus health', `+${g.maxHp}`],
      ['Bonus mana', `+${g.maxMana}`],
      ['Speed', `${g.speed > 0 ? '+' : ''}${g.speed}`],
    ];
    const h = document.createElement('h3');
    h.textContent = 'Combat bonuses';
    const dl = document.createElement('dl');
    for (const [k, v] of rows) {
      const dt = document.createElement('dt');
      dt.textContent = k;
      const dd = document.createElement('dd');
      dd.textContent = v;
      dl.append(dt, dd);
    }
    box.append(h, dl);
    if (g.weapon.cls && WEAPON_BLURB[g.weapon.cls]) {
      const p = document.createElement('p');
      p.textContent = WEAPON_BLURB[g.weapon.cls];
      box.appendChild(p);
    }
  }

  // ---- item icons: drawn in code, one per item, tinted by material and tier

  const METALS = [
    { l: '#e8a060', m: '#c8803c', d: '#8a5020' }, // bronze
    { l: '#c4cad2', m: '#9aa0aa', d: '#656c78' }, // iron
    { l: '#eef4ff', m: '#c8d4e4', d: '#8494ac' }, // steel
    { l: '#b8e4ff', m: '#6ab8ff', d: '#3a78c0' }, // mithril
  ];
  const LEATHERS = [
    { l: '#c08a52', m: '#9a6a3a', d: '#6a4424' }, // soft leather
    { l: '#a2683c', m: '#7a4a2a', d: '#4e2e18' }, // hardened leather
    { l: '#c4cad2', m: '#9aa0aa', d: '#656c78' }, // chain
    { l: '#b8e4ff', m: '#6ab8ff', d: '#3a78c0' }, // mithril
  ];
  const WOODS = [
    { l: '#e8cc8c', m: '#c8a868', d: '#8a6c38' }, // pine, hazel
    { l: '#f6ecd0', m: '#e0d4b4', d: '#a89c7c' }, // birch, rowan
    { l: '#bc9058', m: '#9a7040', d: '#684a28' }, // oak, yew
    { l: '#a0c078', m: '#7a9a58', d: '#4e6a38' }, // willow, elder
  ];
  const ORBS = ['#ff9a5a', '#ffe66a', '#7ae87a', '#c88aff'];
  const AMULETS = [
    { l: '#f0b090', m: '#c87850', d: '#8a4a30' }, // copper
    { l: '#f4f4fc', m: '#c4c8d8', d: '#8a90a8' }, // silver
    { l: '#fff0a0', m: '#f0c030', d: '#b07818' }, // gold
    { l: '#e8f8ff', m: '#a8d8ff', d: '#6a9ad0' }, // moonsilver
  ];
  const GEMS = ['#e04a4a', '#4a8aff', '#4ae080', '#c85aff'];

  const LOG_COLORS = { pine: '#a0743c', birch: '#e4dcc8', oak: '#8a5a2c', willow: '#b8a070' };
  const ORE_COLORS = { copper: '#c8803c', tin: '#b8c0d0', iron: '#8a6a58', moonsilver: '#bfe4ff', coal: '#38343c' };
  const BAR_METAL = { bronze: 0, iron: 1, steel: 2, moonsilver: 3 };
  const HIDE_COLORS = { soft_leather: '#b88a5a', hard_leather: '#8a5a34', stagskin: '#a07a4a', shadowhide: '#4a3a5a' };
  const FISH_COLORS = { shrimp: '#f08a7a', trout: '#8aa890', salmon: '#f09060', tuna: '#6a88a8' };

  /** Tools, materials, and the food that is not a plain roll. Returns true when it drew something. */
  function paintWorkItem(r, def) {
    const t = Math.max(0, Math.min(3, (def.tier || 1) - 1));
    const id = def.id;
    if (def.kind === 'tool') {
      const m = METALS[t];
      const w = WOODS[t];
      if (def.toolType === 'axe') {
        r(7, 4, 2, 11, w.m);
        r(7, 4, 1, 11, w.l);
        r(8, 1, 5, 6, m.m);
        r(8, 1, 5, 1, m.l);
        r(12, 2, 1, 4, m.l);
        r(8, 6, 5, 1, m.d);
      } else if (def.toolType === 'pickaxe') {
        r(7, 3, 2, 12, w.m);
        r(7, 3, 1, 12, w.l);
        r(2, 2, 12, 2, m.m);
        r(2, 2, 12, 1, m.l);
        r(1, 3, 2, 2, m.m);
        r(13, 3, 2, 2, m.m);
        r(1, 5, 1, 1, m.d);
        r(14, 5, 1, 1, m.d);
      } else if (def.toolType === 'rod') {
        for (let i = 0; i < 12; i++) r(2 + i, 13 - i, 2, 1, i % 4 === 3 ? w.d : w.m);
        r(14, 2, 1, 7, '#ece8d6');
        r(13, 9, 2, 1, '#c0c4cc');
        r(13, 10, 1, 1, '#c0c4cc');
        if (t === 3) {
          r(12, 0, 4, 3, '#ffe66a');
          r(13, 1, 2, 1, '#ffffff');
        }
        r(2, 13, 3, 2, '#6a4020');
      } else {
        const rope = ['#c8a468', '#a8844a', '#d8d4c0', '#7a6a9a'][t];
        if (id.includes('net')) {
          for (let y = 3; y <= 12; y += 3) r(2, y, 12, 1, rope);
          for (let x = 2; x <= 13; x += 3) r(x, 3, 1, 10, rope);
          r(2, 2, 12, 1, '#6a4426');
        } else if (id.includes('pit')) {
          r(2, 6, 12, 7, '#2a1a10');
          r(2, 5, 12, 1, '#8a5a30');
          r(2, 13, 12, 1, '#8a5a30');
          for (let x = 3; x <= 12; x += 3) r(x, 6, 1, 6, rope);
        } else {
          r(4, 3, 8, 1, rope);
          r(3, 4, 1, 8, rope);
          r(12, 4, 1, 8, rope);
          r(4, 12, 8, 1, rope);
          r(7, 12, 2, 3, '#6a4426');
          r(8, 4, 5, 1, rope);
        }
      }
      return true;
    }
    if (def.kind === 'material') {
      if (id.endsWith('_logs')) {
        const col = LOG_COLORS[id.replace('_logs', '')] || '#a0743c';
        for (const [x, y, w] of [[1, 9, 12], [3, 5, 12], [1, 12, 12]]) {
          r(x, y, w, 3, col);
          r(x, y, w, 1, tint(col, 1.25));
          r(x + w - 1, y, 1, 3, '#d8b878');
          r(x + w - 2, y + 1, 1, 1, '#a88858');
        }
        return true;
      }
      if (id.endsWith('_ore') || id === 'coal') {
        const col = ORE_COLORS[id === 'coal' ? 'coal' : id.replace('_ore', '')] || '#8a8a94';
        r(3, 5, 10, 8, '#8a8a94');
        r(5, 3, 6, 2, '#8a8a94');
        r(3, 5, 4, 1, '#b4b4be');
        r(10, 9, 3, 4, '#5c5c68');
        for (const [x, y] of [[4, 7], [8, 6], [6, 10], [10, 8]]) r(x, y, 2, 2, col);
        r(4, 7, 1, 1, tint(col, 1.4));
        r(8, 6, 1, 1, tint(col, 1.4));
        return true;
      }
      if (id.endsWith('_bar')) {
        const m = METALS[BAR_METAL[id.replace('_bar', '')] || 0];
        r(2, 8, 12, 5, m.m);
        r(4, 6, 9, 2, m.l);
        r(2, 8, 12, 1, m.l);
        r(12, 8, 2, 5, m.d);
        r(2, 12, 12, 1, m.d);
        return true;
      }
      if (HIDE_COLORS[id]) {
        const c = HIDE_COLORS[id];
        r(3, 3, 10, 10, c);
        r(2, 5, 12, 6, c);
        r(3, 3, 4, 3, tint(c, 1.25));
        r(9, 9, 4, 4, tint(c, 0.75));
        r(1, 4, 2, 2, c);
        r(13, 4, 2, 2, c);
        r(1, 11, 2, 2, tint(c, 0.75));
        r(13, 11, 2, 2, tint(c, 0.75));
        return true;
      }
      if (id.startsWith('raw_') && FISH_COLORS[id.slice(4)]) {
        const c = FISH_COLORS[id.slice(4)];
        r(2, 6, 9, 5, c);
        r(3, 5, 6, 1, tint(c, 1.2));
        r(11, 5, 3, 7, c);
        r(1, 7, 1, 3, tint(c, 0.7));
        r(4, 8, 1, 1, '#2a1a14');
        r(5, 10, 5, 1, tint(c, 0.75));
        return true;
      }
      if (id === 'raw_rabbit') {
        r(3, 5, 9, 7, '#d86a6a');
        r(4, 4, 6, 1, '#e88a8a');
        r(11, 7, 3, 3, '#f0e8d0');
        r(5, 9, 5, 1, '#b04a4a');
        return true;
      }
      r(3, 3, 10, 10, '#8a8a9a');
      return true;
    }
    if (def.kind === 'food') {
      if (id === 'bread') {
        r(2, 6, 12, 7, '#c88a44');
        r(3, 5, 10, 1, '#d8a460');
        r(2, 12, 12, 1, '#98642c');
        for (const x of [4, 7, 10]) r(x, 7, 1, 3, '#e8c488');
        return true;
      }
      if (id === 'cooked_rabbit') {
        r(3, 5, 8, 7, '#b86a34');
        r(4, 4, 5, 1, '#d88a4a');
        r(10, 8, 4, 2, '#f0e8d0');
        r(13, 7, 2, 4, '#f0e8d0');
        r(5, 9, 4, 1, '#8a4a22');
        return true;
      }
      if (id.startsWith('cooked_')) {
        const c = { shrimp: '#e8884a', trout: '#b88a5a', salmon: '#e8885a', tuna: '#a8745a' }[id.slice(7)] || '#e8884a';
        r(2, 6, 9, 5, c);
        r(3, 5, 6, 1, tint(c, 1.25));
        r(11, 5, 3, 7, tint(c, 0.85));
        r(4, 8, 1, 1, '#2a1a14');
        r(4, 9, 6, 1, tint(c, 0.7));
        r(2, 11, 9, 1, '#f8f4e8');
        return true;
      }
    }
    return false;
  }

  /** Items whose icon would otherwise match a sibling: named gear, curios, and the lesser potions. */
  const UNIQUE_ICONS = {
    pine_nuts: (r) => {
      for (const [x, y] of [[3, 8], [8, 5], [8, 10]]) {
        r(x, y, 4, 5, '#8a5a2c');
        r(x, y, 2, 3, '#b8803c');
        r(x + 1, y + 4, 2, 1, '#4a2a14');
      }
    },
    crew_note: (r) => {
      r(3, 2, 10, 12, '#e8dcb0');
      r(3, 2, 10, 1, '#fff4cc');
      for (let i = 0; i < 4; i++) r(5, 4 + i * 2, 6 - (i % 2) * 2, 1, '#8a7a5a');
      r(9, 10, 3, 3, '#b03a2a');
      r(10, 11, 1, 1, '#e87a5a');
    },
    wolf_pelt: (r) => {
      r(3, 3, 10, 10, '#7a7a84');
      r(2, 5, 1, 4, '#7a7a84');
      r(13, 6, 1, 4, '#7a7a84');
      r(4, 13, 3, 2, '#7a7a84');
      r(9, 13, 3, 2, '#7a7a84');
      r(4, 4, 4, 3, '#a8a8b4');
      r(8, 8, 4, 3, '#56565e');
      r(5, 9, 2, 2, '#56565e');
    },
    grave_dust: (r) => {
      r(6, 5, 4, 2, '#cfc8b4');
      r(4, 7, 8, 2, '#b8b0a0');
      r(2, 9, 12, 3, '#9a927f');
      r(2, 12, 12, 1, '#6e6858');
      r(6, 3, 1, 1, '#e8e2cc');
      r(9, 2, 1, 1, '#e8e2cc');
      r(11, 4, 1, 1, '#cfc8b4');
    },
    drowned_coin: (r) => {
      r(5, 3, 6, 10, '#c8b050');
      r(3, 5, 10, 6, '#c8b050');
      r(5, 4, 3, 2, '#f0dc78');
      r(5, 9, 4, 3, '#3a8a6a');
      r(9, 6, 3, 2, '#3a8a6a');
      r(7, 6, 2, 4, '#8a7a30');
    },
    eel_skin: (r) => {
      for (let i = 0; i < 11; i++) {
        r(2 + i, 11 - i, 3, 2, i % 2 ? '#2f5a52' : '#3f7a6c');
        r(2 + i, 10 - i, 3, 1, '#7ab8a4');
      }
      r(12, 1, 2, 2, '#1a2a28');
    },
    teleport_crystal: (r) => {
      r(7, 1, 2, 2, '#c8b8ff');
      r(5, 3, 6, 3, '#8a6aff');
      r(4, 6, 8, 3, '#6a4ae0');
      r(5, 9, 6, 3, '#5a3ac0');
      r(7, 12, 2, 2, '#3a2a90');
      r(6, 4, 2, 4, '#d8ccff');
      r(2, 7, 1, 1, '#c8b8ff');
      r(13, 5, 1, 1, '#c8b8ff');
    },
    foremans_pick: (r) => {
      r(7, 3, 2, 12, '#a0642c');
      r(7, 3, 1, 12, '#c8803c');
      r(2, 2, 12, 2, '#e8b020');
      r(2, 2, 12, 1, '#ffd84a');
      r(1, 3, 2, 3, '#e8b020');
      r(13, 3, 2, 3, '#e8b020');
      r(6, 5, 4, 1, '#3a3a44');
    },
    pickmans_bone_mask: (r) => {
      r(4, 2, 8, 9, '#e8e4d0');
      r(3, 4, 1, 5, '#e8e4d0');
      r(12, 4, 1, 5, '#cfc8b0');
      r(5, 5, 2, 3, '#2a2420');
      r(9, 5, 2, 3, '#2a2420');
      r(7, 8, 2, 1, '#2a2420');
      r(5, 11, 6, 3, '#e8e4d0');
      for (const x of [6, 8, 10]) r(x, 11, 1, 3, '#2a2420');
      r(5, 2, 3, 1, '#fffbe8');
    },
    tidal_aegis: (r) => {
      r(3, 2, 10, 9, '#3a78b8');
      r(4, 11, 8, 2, '#3a78b8');
      r(6, 13, 4, 1, '#3a78b8');
      r(3, 2, 10, 1, '#9fd0f0');
      r(3, 2, 1, 9, '#9fd0f0');
      r(12, 3, 1, 8, '#245888');
      for (const [x, y] of [[4, 5], [7, 5], [10, 5], [5, 8], [8, 8]]) {
        r(x, y, 2, 1, '#cfeaff');
        r(x + 1, y + 1, 1, 1, '#cfeaff');
      }
    },
  };

  /** A ring: a band, a stone, and a mark of its own. */
  function ringIcon(band, bandLight, stone, mark) {
    return (r) => {
      r(4, 6, 8, 8, band);
      r(5, 7, 6, 6, '#00000000');
      r(5, 7, 6, 6, '#241a30');
      r(4, 6, 8, 1, bandLight);
      r(4, 6, 1, 8, bandLight);
      r(5, 7, 6, 6, 'rgba(0,0,0,0)');
      r(5, 8, 6, 4, '#241a30');
      if (stone) {
        r(6, 3, 4, 4, stone);
        r(6, 3, 2, 2, '#ffffffaa');
      }
      if (mark === 'tally') for (const x of [5, 7, 9]) r(x, 12, 1, 2, bandLight);
      if (mark === 'nut') {
        r(6, 3, 4, 4, '#8a5a2c');
        r(6, 3, 2, 2, '#b8803c');
      }
      if (mark === 'gold') r(4, 13, 8, 1, '#d8b04a');
    };
  }

  /** A belt or sash laid flat, with a buckle or a knot. */
  function beltIcon(strap, light, buckle, detail) {
    return (r) => {
      r(1, 6, 14, 4, strap);
      r(1, 6, 14, 1, light);
      r(1, 9, 14, 1, '#00000055');
      r(6, 5, 4, 6, buckle);
      r(7, 6, 2, 4, '#241a30');
      if (detail === 'studs') for (const x of [2, 4, 11, 13]) r(x, 7, 1, 2, '#d8d8e4');
      if (detail === 'knot') {
        r(10, 9, 3, 5, strap);
        r(11, 11, 2, 4, light);
      }
      if (detail === 'tools') {
        r(2, 10, 2, 3, '#8a8a94');
        r(12, 10, 2, 3, '#8a8a94');
      }
      if (detail === 'bone') for (const x of [2, 4, 11, 13]) r(x, 7, 1, 2, '#f4f0dc');
      if (detail === 'wave') for (const x of [2, 4, 11, 13]) r(x, 8, 2, 1, '#cfeaff');
    };
  }

  /** A boon: a charm on a cord. */
  function boonIcon(gem, light, shape) {
    return (r) => {
      r(7, 0, 2, 5, '#6a4020');
      r(6, 4, 4, 1, '#d8b04a');
      if (shape === 'flame') {
        r(6, 5, 4, 8, gem);
        r(5, 8, 6, 4, gem);
        r(7, 5, 2, 3, light);
        r(7, 9, 2, 3, '#ffe08a');
      } else if (shape === 'drop') {
        r(7, 5, 2, 2, gem);
        r(6, 7, 4, 2, gem);
        r(5, 9, 6, 4, gem);
        r(6, 13, 4, 1, gem);
        r(6, 8, 2, 3, light);
      } else if (shape === 'swirl') {
        r(4, 6, 8, 7, gem);
        r(6, 8, 4, 3, '#241a30');
        r(7, 9, 2, 1, light);
        r(4, 6, 8, 1, light);
      } else if (shape === 'cairn') {
        r(5, 10, 6, 3, '#8a8a94');
        r(6, 7, 4, 3, '#a8a8b4');
        r(7, 5, 2, 2, '#c8c8d4');
        r(5, 10, 6, 1, '#b8b8c4');
      } else {
        r(7, 5, 2, 8, gem);
        r(5, 7, 2, 4, gem);
        r(9, 7, 2, 4, light);
        r(7, 5, 2, 2, light);
      }
    };
  }

  Object.assign(UNIQUE_ICONS, {
    silver_loop: ringIcon('#c8ccd8', '#f0f2fa', null, ''),
    nutshell_ring: ringIcon('#8a5a2c', '#b8803c', null, 'nut'),
    tally_ring: ringIcon('#6a6a74', '#a8a8b4', null, 'tally'),
    moonglass_ring: ringIcon('#d8d8e8', '#ffffff', '#9fd0ff', ''),
    pickman_ring: ringIcon('#7a5a40', '#b08a60', '#f08a2a', ''),
    elrenor_ring: ringIcon('#d8b04a', '#fff0a0', '#4ae080', 'gold'),
    studded_belt: beltIcon('#6a4020', '#8a5a2c', '#c8c8d4', 'studs'),
    mind_goblin_sash: beltIcon('#3a8a4a', '#6ac87a', '#d8b04a', 'knot'),
    foremans_belt: beltIcon('#c88a20', '#f0b84a', '#8a8a94', 'tools'),
    guard_belt: beltIcon('#4a4a58', '#7a7a8a', '#d8b04a', ''),
    bone_sash: beltIcon('#cfc8b0', '#f4f0dc', '#8a8470', 'bone'),
    tide_sash: beltIcon('#2f8a9a', '#6ac8d8', '#d8b04a', 'wave'),
    ember_boon: boonIcon('#e8602a', '#ffa05a', 'flame'),
    goblin_wit_boon: boonIcon('#5ab84a', '#a0f08a', 'swirl'),
    sump_boon: boonIcon('#7a6a3a', '#b8a060', 'drop'),
    tide_boon: boonIcon('#3a78d8', '#8ab4f0', 'drop'),
    cairn_boon: boonIcon('#8a8a94', '#c8c8d4', 'cairn'),
    mere_boon: boonIcon('#2f8a6a', '#6ac8a4', 'reed'),
  });

  /** The lesser potions are smaller bottles; the full ones carry a gold cap. */
  function potionIcon(def) {
    const mana = Boolean(def.mana);
    const small = /^minor_/.test(def.id);
    const liquid = mana ? '#4a7fd8' : '#d84a4a';
    const light = mana ? '#8ab4f0' : '#f08a8a';
    return (r) => {
      if (small) {
        r(7, 4, 2, 2, '#8a6a44');
        r(6, 6, 4, 1, '#cfd6e4');
        r(5, 7, 6, 6, '#cfd6e4');
        r(6, 8, 4, 4, liquid);
        r(6, 8, 1, 3, light);
      } else {
        r(6, 1, 4, 2, '#d8b04a');
        r(7, 3, 2, 2, '#cfd6e4');
        r(3, 5, 10, 9, '#cfd6e4');
        r(4, 6, 8, 7, liquid);
        r(4, 6, 2, 5, light);
        r(10, 9, 2, 3, '#00000033');
      }
    };
  }

  function paintItem(r, def) {
    const unique = UNIQUE_ICONS[def.id] || (def.kind === 'potion' ? potionIcon(def) : null);
    if (unique) return unique(r);
    const t = Math.max(0, Math.min(3, (def.tier || 1) - 1));
    if (paintWorkItem(r, def)) return;
    if (def.kind === 'potion') {
      const liquid = def.mana ? '#4a7fd8' : '#d84a4a';
      const light = def.mana ? '#8ab4f0' : '#f08a8a';
      r(6, 2, 4, 2, '#8a6a44');
      r(7, 4, 2, 2, '#cfd6e4');
      r(4, 6, 8, 8, '#cfd6e4');
      r(5, 7, 6, 6, liquid);
      r(5, 7, 2, 4, light);
      return;
    }
    if (def.kind === 'food') {
      r(3, 7, 10, 5, '#e8884a');
      r(4, 6, 7, 1, '#f4a468');
      r(11, 8, 3, 3, '#e8884a');
      r(5, 9, 6, 1, '#c8602c');
      r(12, 7, 2, 1, '#f4a468');
      r(4, 8, 1, 1, '#2a1a14');
      return;
    }
    if (def.kind === 'weapon') {
      const cls = def.weaponClass || 'blade';
      if (cls === 'blade' || cls === 'dagger') {
        const m = METALS[t];
        const long = cls === 'blade';
        const top = long ? 0 : 3;
        r(7, top, 2, 10 - top, m.m);
        r(7, top, 1, 10 - top, m.l);
        r(8, top + 1, 1, 9 - top, m.d);
        r(7, top - 1 < 0 ? 0 : top - 1, 2, 1, m.l);
        r(4, 10, 8, 1, '#d8b04a');
        r(4, 11, 8, 1, '#8a6a20');
        r(7, 11, 2, 3, '#6a4020');
        r(6, 14, 4, 1, '#d8b04a');
      } else if (cls === 'bow') {
        const w = WOODS[t];
        r(9, 1, 2, 2, w.m);
        r(7, 3, 2, 2, w.m);
        r(6, 5, 2, 6, w.l);
        r(7, 11, 2, 2, w.m);
        r(9, 13, 2, 2, w.d);
        r(11, 3, 1, 10, '#ece8d6');
        r(7, 7, 5, 2, '#a02828');
      } else if (cls === 'mace') {
        const m = METALS[t];
        r(7, 6, 2, 9, '#6a4020');
        r(4, 1, 8, 6, m.m);
        r(4, 1, 8, 1, m.l);
        r(4, 6, 8, 1, m.d);
        r(7, 0, 2, 1, m.l);
        r(6, 14, 4, 1, '#d8b04a');
      } else if (cls === 'spear') {
        const m = METALS[t];
        r(7, 4, 2, 11, '#8a5a2c');
        r(7, 4, 1, 11, '#b07a3c');
        r(6, 0, 4, 5, m.m);
        r(7, 0, 2, 1, m.l);
        r(5, 4, 6, 1, '#d8b04a');
      } else if (cls === 'crossbow') {
        const w = WOODS[t];
        r(2, 5, 12, 1, '#ece8d6');
        r(1, 4, 2, 3, w.m);
        r(13, 4, 2, 3, w.m);
        r(6, 5, 4, 9, w.m);
        r(7, 5, 1, 9, w.l);
        r(7, 3, 2, 4, '#a02828');
      } else if (cls === 'pistol') {
        const m = METALS[t];
        r(2, 5, 10, 3, m.m);
        r(2, 5, 10, 1, m.l);
        r(10, 4, 3, 2, m.d);
        r(4, 8, 3, 6, '#6a4020');
        r(3, 12, 5, 1, '#4a3018');
      } else {
        const w = WOODS[t];
        r(7, 5, 2, 10, w.m);
        r(7, 5, 1, 10, w.l);
        r(5, 0, 6, 5, def.element ? ELEMENT_COLOR[def.element] : ORBS[t]);
        r(6, 0, 4, 1, '#ffffff');
        r(5, 3, 6, 2, '#ffffff88');
        r(6, 5, 4, 1, w.d);
      }
      return;
    }
    const slot = def.slot;
    const k = def.id.startsWith('soft_') ? 0 : def.id.startsWith('hard_') ? 1 : def.id.startsWith('chain_') ? 2 : 3;
    const c = slot === 'amulet' || slot === 'ring' || slot === 'belt' || slot === 'boon' ? AMULETS[t] : LEATHERS[k];
    if (slot === 'body') {
      r(4, 3, 8, 11, c.m);
      r(1, 3, 3, 6, c.m);
      r(12, 3, 3, 6, c.d);
      r(6, 3, 4, 2, c.d);
      r(4, 3, 3, 4, c.l);
      r(4, 10, 8, 1, '#4a3020');
      r(7, 10, 2, 1, '#d8b04a');
      r(4, 13, 8, 1, c.d);
    } else if (slot === 'legs') {
      r(4, 1, 8, 3, c.m);
      r(4, 4, 3, 9, c.l);
      r(9, 4, 3, 9, c.d);
      r(7, 4, 2, 4, c.m);
      r(3, 13, 4, 2, '#4a3020');
      r(9, 13, 4, 2, '#4a3020');
    } else if (slot === 'head') {
      r(4, 2, 8, 8, c.m);
      r(3, 4, 1, 6, c.m);
      r(12, 4, 1, 6, c.d);
      r(5, 2, 4, 3, c.l);
      r(3, 10, 10, 2, c.d);
      if (t >= 2) {
        r(7, 5, 2, 6, c.d);
        r(7, 0, 2, 3, '#c83030');
      }
    } else if (slot === 'offhand') {
      if (t < 2) {
        r(3, 3, 10, 10, c.m);
        r(2, 5, 12, 6, c.m);
        r(3, 3, 4, 4, c.l);
        r(8, 8, 5, 5, c.d);
        r(7, 7, 2, 2, '#d8b04a');
      } else {
        r(3, 1, 10, 9, c.m);
        r(4, 10, 8, 2, c.m);
        r(6, 12, 4, 2, c.d);
        r(3, 1, 4, 5, c.l);
        r(9, 4, 4, 6, c.d);
        r(7, 5, 2, 3, '#d8b04a');
      }
    } else if (slot === 'cloak') {
      r(3, 2, 10, 12, c.m);
      r(2, 5, 12, 9, c.m);
      r(3, 2, 3, 8, c.l);
      r(10, 5, 3, 9, c.d);
      r(2, 13, 12, 1, c.d);
      r(7, 2, 2, 2, '#d8b04a');
    } else if (slot === 'amulet') {
      r(4, 1, 1, 5, '#8a7a60');
      r(11, 1, 1, 5, '#8a7a60');
      r(5, 6, 1, 2, '#8a7a60');
      r(10, 6, 1, 2, '#8a7a60');
      r(6, 8, 4, 1, '#8a7a60');
      r(5, 9, 6, 5, c.m);
      r(5, 9, 3, 2, c.l);
      r(8, 11, 3, 3, c.d);
      r(7, 10, 2, 3, GEMS[t]);
    } else if (slot === 'ring') {
      r(5, 6, 6, 1, c.l);
      r(4, 7, 1, 5, c.m);
      r(11, 7, 1, 5, c.d);
      r(5, 12, 6, 1, c.d);
      r(6, 3, 4, 3, GEMS[t]);
      r(7, 3, 2, 1, '#ffffff');
    } else if (slot === 'belt') {
      r(1, 6, 14, 5, '#6a4426');
      r(1, 6, 14, 1, '#8a5a34');
      r(1, 10, 14, 1, '#4a2e18');
      r(5, 5, 6, 7, c.m);
      r(5, 5, 6, 1, c.l);
      r(7, 7, 2, 3, GEMS[t]);
      for (const x of [2, 12]) r(x, 8, 1, 1, c.l);
    } else if (slot === 'boon') {
      r(7, 1, 2, 4, '#8a7a60');
      r(4, 5, 8, 9, c.m);
      r(4, 5, 8, 2, c.l);
      r(10, 8, 2, 6, c.d);
      r(7, 7, 2, 4, GEMS[t]);
      r(6, 9, 4, 1, GEMS[t]);
      r(7, 7, 1, 1, '#ffffff');
    } else {
      r(3, 3, 10, 10, '#8a8a9a');
    }
  }

  /** A 20x20 canvas holding the item's icon, with the usual dark outline. */
  function itemIcon(def) {
    return sprite(`i|${def.id}`, (r) => paintItem(r, def));
  }

  function slotButton(ref, onClick, label, ghost) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot' + (ref ? '' : ' empty') + (ref && ref.rarity ? ` ${ref.rarity}` : '');
    if (ref) {
      const def = G.data && G.data.items.get(ref.id);
      if (def) {
        const src = itemIcon(def);
        const cv = document.createElement('canvas');
        cv.width = src.width;
        cv.height = src.height;
        cv.getContext('2d').drawImage(src, 0, 0);
        cv.className = 'icon';
        b.appendChild(cv);
        b.setAttribute('aria-label', def.name);
      } else {
        b.textContent = pretty(ref.id);
      }
      b.title = itemTip(ref);
      if (ref.qty > 1) {
        const q = document.createElement('i');
        q.textContent = String(ref.qty);
        b.appendChild(q);
      }
      b.addEventListener('click', onClick);
    } else {
      if (ghost) {
        const fake = ghost === 'weapon' || ghost === 'weapon2'
          ? { id: `ghost_${ghost}`, kind: 'weapon', weaponClass: 'blade', tier: 1 }
          : { id: `ghost_${ghost}`, kind: 'armor', slot: ghost, tier: 2 };
        b.appendChild(iconCanvas(fake));
      }
      const t = document.createElement('span');
      t.className = 'slot-name';
      t.textContent = label || '';
      b.appendChild(t);
      b.disabled = true;
    }
    return b;
  }

  function renderBag() {
    const inv = G.inv;
    if (!inv) return;
    const equip = $('equip');
    equip.textContent = '';
    for (const slot of PAPERDOLL) {
      if (!slot) {
        const gap = document.createElement('span');
        equip.appendChild(gap);
        continue;
      }
      const label = (SLOT_LABELS.find((l) => l[0] === slot) || [slot, slot])[1];
      equip.appendChild(slotButton(inv.equipment[slot], () => (G.fight ? toast("You can't change gear in a fight.") : window.wealdmark.send({ t: 'unequip', slot })), label, slot));
    }
    const belt = $('toolbelt');
    if (belt) {
      belt.textContent = '';
      for (const [type, label] of [['axe', 'Axe'], ['pickaxe', 'Pickaxe'], ['rod', 'Rod'], ['snare', 'Snare']]) {
        const ref = inv.toolbelt ? inv.toolbelt[type] : null;
        belt.appendChild(slotButton(ref, () => window.wealdmark.send({ t: 'unbelt', tool: type }), label));
      }
    }
    G.gearInfo = inv.gear || null;
    renderGear(inv.gear);
    const grid = $('bag-grid');
    grid.textContent = '';
    inv.items.forEach((ref, i) => {
      grid.appendChild(
        slotButton(ref, (ev) => {
          const def = G.data && G.data.items.get(ref.id);
          if (!def) return;
          if (def.kind === 'food' || def.kind === 'potion') {
            if (G.fight) {
              if (isMyTurn() && !G.fight.options.acted) sendFight({ t: 'eat', slot: i });
              else toast('Not your turn to act.');
            } else window.wealdmark.send({ t: 'use', slot: i });
          } else if (def.kind === 'tool') window.wealdmark.send({ t: 'belt', slot: i });
          else if (G.fight) toast("You can't change gear in a fight.");
          else window.wealdmark.send({ t: 'equip', slot: i, ...(ev.shiftKey && def.kind === 'weapon' ? { alt: true } : {}), ...(ev.ctrlKey && def.kind === 'weapon' && def.weaponClass === 'pistol' ? { off: true } : {}) });
        }),
      );
    });
  }

  /** Free teleport to Bellstone Plaza. The server refuses it in a fight. */
  function goToTown() {
    if (G.fight) return toast("You can't do that in a fight.");
    window.wealdmark.send({ t: 'teleport' });
  }

  function buildLookPanel() {
    const row = $('look-skin');
    row.textContent = '';
    SKIN_TONES.forEach((tone, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.style.background = tone;
      b.title = `Skin tone ${i + 1}`;
      b.dataset.skin = String(i);
      b.addEventListener('click', () => chooseLook({ skin: i }));
      row.appendChild(b);
    });
    const pets = $('look-pet');
    pets.textContent = '';
    for (const pet of [{ id: '', name: 'No companion' }, ...PETS]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = pet.name;
      b.dataset.pet = pet.id;
      b.addEventListener('click', () => {
        const me = G && G.self();
        if (me) me.pet = pet.id || undefined;
        renderLook();
        window.wealdmark.send({ t: 'pet', id: pet.id || null });
      });
      pets.appendChild(b);
    }
  }

  function chooseLook(change) {
    const me = G.self();
    const cur = (me && me.chosen) || { g: me ? me.look.g : 'm', skin: Math.max(0, SKIN_TONES.indexOf(me ? me.look.skin : SKIN_TONES[1])) };
    const next = { ...cur, ...change };
    me.chosen = next;
    me.look = look(me.name, next);
    renderLook();
    window.wealdmark.send({ t: 'look', look: next });
  }

  function renderLook() {
    const me = G && G.self();
    if (!me) return;
    $('look-gender').textContent = `Body shape: ${me.look.g === 'f' ? 'female' : 'male'}. Chosen at sign-up; it cannot be changed.`;
    for (const b of $('look-skin').querySelectorAll('button')) b.classList.toggle('on', SKIN_TONES[Number(b.dataset.skin)] === me.look.skin);
    for (const b of $('look-pet').querySelectorAll('button')) b.classList.toggle('on', (b.dataset.pet || '') === (me.pet || ''));
    const c = $('look-preview');
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    drawFigure(ctx, 8, 8, 4, me.look, 0, 0, heldGear(G.selfId));
  }

  // Up to three windows stay open at once. A fourth closes the one opened longest ago.
  const MAX_WINDOWS = 3;
  const WORK_CAP = 30;
  const openOrder = [];
  let zTop = 20;

  /** New windows open on the right, directly under the map and the quest list. */
  function placeWindow(el) {
    if (el.dataset.moved) return;
    const z = uiScale();
    const pr = (el.offsetParent || document.body).getBoundingClientRect();
    let bottom = 56;
    for (const id of ['mapbox']) {
      const b = $(id);
      if (b && b.offsetWidth) bottom = Math.max(bottom, (b.getBoundingClientRect().bottom - pr.top) / z);
    }
    if (el.id === 'panel-trades') {
      // Opens in the middle of the screen, like the crafting box.
      el.style.right = 'auto';
      el.style.left = `${Math.max(0, (pr.width / z - el.offsetWidth) / 2)}px`;
      el.style.top = `${Math.max(8, (pr.height / z - el.offsetHeight) / 2)}px`;
      return;
    }
    const slot = Math.max(0, openOrder.indexOf(el.id));
    const top = bottom + 6 + slot * 28;
    el.style.left = 'auto';
    el.style.right = `${10 + slot * 24}px`;
    el.style.top = `${top}px`;
    el.style.maxHeight = `${Math.max(160, pr.height / z - top - 8)}px`;
  }

  function raise(el) {
    el.style.zIndex = String(++zTop);
  }

  function togglePanel(id) {
    const el = $(id);
    const i = openOrder.indexOf(id);
    if (i >= 0 || !el.classList.contains('hidden')) {
      if (i >= 0) openOrder.splice(i, 1);
      el.classList.add('hidden');
    } else {
      while (openOrder.length >= MAX_WINDOWS) $(openOrder.shift()).classList.add('hidden');
      openOrder.push(id);
      el.classList.remove('hidden');
      placeWindow(el);
      raise(el);
    }
    play('click');
  }

  function closePanels() {
    for (const p of PANELS) $(p).classList.add('hidden');
    openOrder.length = 0;
  }

  /** Windows drag by their title and resize from the bottom-right corner (CSS resize). */
  function setupWindows() {
    for (const p of [...PANELS, ...TOWN_PANELS]) {
      const el = $(p);
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'xbtn';
      x.textContent = '\u00d7';
      x.title = 'Close';
      x.setAttribute('aria-label', 'Close');
      x.addEventListener('pointerdown', (e) => e.stopPropagation());
      x.addEventListener('click', () => {
        if (PANELS.includes(p)) {
          const i = openOrder.indexOf(p);
          if (i >= 0) openOrder.splice(i, 1);
          el.classList.add('hidden');
          play('click');
        } else closeTown(true);
      });
      el.insertBefore(x, el.firstChild);
      if (!el.classList.contains('side')) continue;
      el.addEventListener('pointerdown', () => raise(el));
      // The instructions sit behind a ? next to the close button instead of taking up room in the window.
      const helps = [...el.querySelectorAll(':scope > p.muted:not([id])')];
      if (helps.length) {
        for (const hp of helps) hp.classList.add('help', 'hidden');
        const q = document.createElement('button');
        q.type = 'button';
        q.className = 'xbtn qbtn';
        q.textContent = '?';
        q.title = 'Show or hide the instructions';
        q.setAttribute('aria-label', 'Instructions');
        q.addEventListener('pointerdown', (e) => e.stopPropagation());
        q.addEventListener('click', () => {
          for (const hp of helps) hp.classList.toggle('hidden');
          play('click');
        });
        el.insertBefore(q, x.nextSibling);
      }
      // Remember where the player put each window and how big they made it (in the window's own scaled units).
      const wkey = `wealdmark.win2.${p}`;
      const saveWin = () => {
        if (el.classList.contains('hidden') || !el.offsetWidth || window.matchMedia('(pointer: coarse), (max-width: 760px)').matches) return;
        const z = uiScale();
        const pr = (el.offsetParent || document.body).getBoundingClientRect();
        const r = el.getBoundingClientRect();
        try {
          localStorage.setItem(wkey, JSON.stringify({ l: (r.left - pr.left) / z, t: (r.top - pr.top) / z, w: r.width / z, h: r.height / z }));
        } catch {
          /* blocked storage: the layout lasts until the page closes */
        }
      };
      try {
        const sv = JSON.parse(localStorage.getItem(wkey));
        if (sv && [sv.l, sv.t, sv.w, sv.h].every(Number.isFinite)) {
          el.style.right = 'auto';
          el.style.left = `${Math.max(0, sv.l)}px`;
          el.style.top = `${Math.max(0, sv.t)}px`;
          el.style.width = `${Math.max(200, sv.w)}px`;
          el.style.height = `${Math.max(90, sv.h)}px`;
          el.dataset.moved = '1';
        }
      } catch {
        /* no saved layout */
      }
      if (typeof ResizeObserver === 'function') {
        let t = null;
        new ResizeObserver(() => {
          clearTimeout(t);
          t = setTimeout(saveWin, 300);
        }).observe(el);
      }
      const bar = el.querySelector('h2');
      if (!bar) continue;
      bar.classList.add('grip');
      dragBox(el, bar, saveWin);
    }
  }

  /** Clear the chat after a yes, and resize it by dragging the corner at its top right. */
  function setupChat() {
    const nav = $('chatnav');
    const idle = () => {
      nav.textContent = '';
      const b = el('button', '', 'Clear');
      b.type = 'button';
      b.title = 'Clear the chat';
      b.addEventListener('click', ask);
      nav.appendChild(b);
    };
    const ask = () => {
      nav.textContent = '';
      const yes = el('button', '', 'Yes, clear');
      const no = el('button', '', 'No');
      yes.type = no.type = 'button';
      yes.addEventListener('click', () => {
        $('chatlog').textContent = '';
        idle();
      });
      no.addEventListener('click', idle);
      nav.append(el('span', 'ask', 'Clear the whole chat?'), yes, no);
    };
    idle();

    const chat = $('chat');
    const store = 'wealdmark.chatsize';
    try {
      const v = JSON.parse(localStorage.getItem(store));
      if (v && Number.isFinite(v.w) && Number.isFinite(v.h)) {
        chat.style.width = `${Math.max(200, v.w)}px`;
        chat.style.height = `${Math.max(110, v.h)}px`;
      }
    } catch {
      /* nothing saved */
    }
    $('chat-grip').addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return;
      ev.preventDefault();
      const z = uiScale();
      const w0 = chat.getBoundingClientRect().width / z;
      const h0 = chat.getBoundingClientRect().height / z;
      const x0 = ev.clientX;
      const y0 = ev.clientY;
      const move = (e) => {
        chat.style.width = `${Math.max(200, Math.min(window.innerWidth / z - 40, w0 + (e.clientX - x0) / z))}px`;
        chat.style.height = `${Math.max(110, Math.min(window.innerHeight / z - 100, h0 - (e.clientY - y0) / z))}px`;
      };
      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', up);
        try {
          localStorage.setItem(store, JSON.stringify({ w: chat.getBoundingClientRect().width / z, h: chat.getBoundingClientRect().height / z }));
        } catch {
          /* blocked storage */
        }
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', up);
    });
  }

  function setupSound() {
    const s = window.wealdmarkAudio.settings;
    $('vol-master').value = s.master;
    $('vol-sfx').value = s.sfx;
    $('vol-music').value = s.music;
    $('mute').checked = s.muted;
    $('hide-others').checked = hideOthers.on;
  }

  // ---- talking, shopping, storage, crafting, and the journal

  const SKILL_LABEL = { forestry: 'Forestry', mining: 'Mining', fishing: 'Fishing', hunting: 'Hunting', smithing: 'Smithing', cooking: 'Cooking', crafting: 'Crafting' };
  const CUR_NAME = { iron_bits: 'iron bits', gold_coins: 'gold coins', favor_tokens: 'favor tokens' };
  const CUR_CLASS = { iron_bits: 'iron', gold_coins: 'gold', favor_tokens: 'favor' };
  // Mirrors the server: a shop pays 40% of an item's value, more for rolled gear.
  const SELL_RATE = 0.4;
  const RARITY_VALUE = { basic: 1, magic: 1.6, rare: 3, legendary: 8 };
  const GOLD_RATE = 100;

  const townOpen = () => TOWN_PANELS.some((p) => !$(p).classList.contains('hidden'));
  const skillLevel = (skill) => (G.stats && G.stats.skills[skill] ? G.stats.skills[skill].level : 1);

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function iconCanvas(def) {
    const src = itemIcon(def);
    const cv = document.createElement('canvas');
    cv.width = src.width;
    cv.height = src.height;
    cv.getContext('2d').drawImage(src, 0, 0);
    cv.className = 'icon';
    return cv;
  }

  function price(amount, cur) {
    const span = el('span', 'price');
    span.append(el('span', `coin ${CUR_CLASS[cur]}`), document.createTextNode(String(amount)));
    return span;
  }

  function sellPrice(ref) {
    const def = G.data && G.data.items.get(ref.id);
    if (!def || !def.value) return 0;
    return Math.max(1, Math.floor(def.value * SELL_RATE * (RARITY_VALUE[ref.rarity || 'basic'] || 1)));
  }

  function showTown(id) {
    for (const p of TOWN_PANELS) $(p).classList.toggle('hidden', p !== id);
    if (id !== 'dialog') closePanels();
    play('click');
  }

  /** Hide every town panel. `tell` also lets the server know, so it stops waiting on you. */
  function closeTown(tell) {
    const was = townOpen();
    for (const p of TOWN_PANELS) $(p).classList.add('hidden');
    G.town = null;
    if (was && tell) window.wealdmark.send({ t: 'close' });
  }

  function walletLine() {
    const w = (G.stats && G.stats.wallet) || { iron_bits: 0, gold_coins: 0, favor_tokens: 0 };
    const line = el('div', 'wallet-line');
    for (const cur of ['iron_bits', 'gold_coins', 'favor_tokens']) line.append(price(w[cur], cur));
    return line;
  }

  // dialogue

  function onDialog(msg) {
    const npc = G.data.npcs.get(msg.npc);
    const st = G.data.stations.get(msg.npc);
    $('dlg-name').textContent = npc ? npc.name : st ? st.name : pretty(msg.npc);
    $('dlg-role').textContent = npc ? npc.role : '';
    const lines = $('dlg-lines');
    lines.textContent = '';
    for (const l of msg.lines) lines.appendChild(el('p', '', l));
    const opts = $('dlg-options');
    opts.textContent = '';
    msg.options.forEach((o, i) => {
      const b = el('button', 'opt', `${i + 1}. ${o.label}`);
      b.type = 'button';
      b.dataset.option = o.id;
      b.addEventListener('click', () => {
        play('click');
        window.wealdmark.send({ t: 'choose', option: o.id });
      });
      opts.appendChild(b);
    });
    G.town = { kind: 'dialog', npc: msg.npc };
    showTown('dialog');
  }

  // shop

  function onShop(msg) {
    G.town = { kind: 'shop', shop: msg.shop };
    G.shopTab = 'buy';
    showTown('panel-shop');
    renderShop();
  }

  function renderShop() {
    const shop = G.data.shops.get(G.town.shop);
    if (!shop) return;
    $('shop-title').textContent = shop.name;
    const box = $('shop-body');
    box.textContent = '';
    box.appendChild(walletLine());
    const tabs = el('div', 'tabs');
    tabs.setAttribute('role', 'tablist');
    for (const [key, label] of [['buy', 'Buy'], ['sell', 'Sell']]) {
      const t = el('button', '', label);
      t.type = 'button';
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-selected', String(G.shopTab === key));
      t.addEventListener('click', () => {
        if (G.shopTab === key) return;
        G.shopTab = key;
        play('click');
        renderShop();
      });
      tabs.appendChild(t);
    }
    box.appendChild(tabs);
    if (G.shopTab === 'sell') return renderShopSell(box);
    const w = (G.stats && G.stats.wallet) || {};
    for (const e of shop.stock) {
      const def = G.data.items.get(e.item);
      if (!def) continue;
      const row = el('button', 'row-item');
      row.type = 'button';
      row.title = itemTip({ id: e.item, qty: 1 });
      if ((w[e.cur] || 0) < e.price) row.classList.add('poor');
      row.append(iconCanvas(def), el('span', 'name', def.name), price(e.price, e.cur));
      if (G.shopSel === e.item) row.classList.add('sel');
      row.addEventListener('click', () => {
        G.shopSel = e.item;
        renderShop();
      });
      box.appendChild(row);
    }
    const picked = shop.stock.find((e) => e.item === G.shopSel);
    if (picked && G.data.items.get(picked.item)) {
      const pdef = G.data.items.get(picked.item);
      const bar = el('div', '');
      bar.id = 'shop-buy';
      bar.appendChild(el('p', 'buy-title', `${pdef.name}: how many?`));
      const line = el('div', 'buy-row');
      for (const n of [1, 5, 10]) {
        const b = el('button', 'act', `Buy ${n}`);
        b.type = 'button';
        b.addEventListener('click', () => askBuy(picked, pdef, n));
        line.appendChild(b);
      }
      const amount = el('input');
      amount.type = 'number';
      amount.min = '1';
      amount.max = '99';
      amount.value = String(G.shopX || 1);
      amount.setAttribute('aria-label', 'Amount');
      amount.addEventListener('input', () => (G.shopX = amount.value));
      const bx = el('button', 'act', 'Buy X');
      bx.type = 'button';
      bx.addEventListener('click', () => {
        const n = Math.floor(Number(amount.value));
        if (!Number.isFinite(n) || n < 1 || n > 99) return toast('Choose an amount from 1 to 99.');
        askBuy(picked, pdef, n);
      });
      line.append(amount, bx);
      bar.appendChild(line);
      box.appendChild(bar);
    }
    box.appendChild(el('p', 'muted', 'Click an item to choose how many to buy.'));
  }

  function renderShopSell(box) {
    let any = false;
    if (G.inv) {
      G.inv.items.forEach((ref, i) => {
        if (!ref) return;
        const each = sellPrice(ref);
        const def = G.data.items.get(ref.id);
        if (!def || each <= 0) return;
        any = true;
        const row = el('button', 'row-item');
        row.type = 'button';
        row.title = itemTip(ref);
        row.append(iconCanvas(def), el('span', 'name', `${itemName(ref)}${ref.qty > 1 ? ` x${ref.qty}` : ''}`), price(each, 'iron_bits'));
        row.addEventListener('click', (ev) => window.wealdmark.send({ t: 'sell', slot: i, qty: ev.shiftKey ? ref.qty : 1 }));
        box.appendChild(row);
      });
    }
    if (!any) box.appendChild(el('p', 'muted', 'Nothing in your bag sells here.'));
    box.appendChild(el('p', 'muted', 'Click an item to sell one. Shift-click sells the whole stack.'));
  }

  function closeBuyConfirm() {
    $('buy-confirm').classList.add('hidden');
    G.buyPending = null;
  }

  /** Ask before spending: "Do you want to purchase 1 Reed rod for 16 iron bits?" with Yes and No. */
  function askBuy(entry, def, qty) {
    const total = entry.price * qty;
    const have = ((G.stats && G.stats.wallet) || {})[entry.cur] || 0;
    $('bc-text').textContent = `Do you want to purchase ${qty} ${def.name} for ${total} ${CUR_NAME[entry.cur]}?`;
    const poor = have < total;
    $('bc-note').textContent = poor ? `You only have ${have} ${CUR_NAME[entry.cur]}.` : '';
    $('bc-yes').disabled = poor;
    G.buyPending = poor ? null : { item: entry.item, qty };
    $('buy-confirm').classList.remove('hidden');
    play('click');
  }

  // storage

  function onStorage(msg) {
    G.storage = msg;
    G.town = { kind: 'storage' };
    showTown('panel-storage');
    renderStorage();
  }

  function renderStorage() {
    if (!G.storage) return;
    const box = $('storage-body');
    box.textContent = '';
    box.appendChild(walletLine());

    const ex = el('div', 'exchange');
    const w = (G.stats && G.stats.wallet) || { iron_bits: 0, gold_coins: 0 };
    const exBtn = (label, ok, msg) => {
      const b = el('button', 'act', label);
      b.type = 'button';
      b.disabled = !ok;
      b.addEventListener('click', () => window.wealdmark.send(msg));
      ex.appendChild(b);
    };
    exBtn('100 iron to 1 gold', w.iron_bits >= GOLD_RATE, { t: 'exchange', dir: 'up', amount: GOLD_RATE });
    exBtn('All iron to gold', w.iron_bits >= GOLD_RATE, { t: 'exchange', dir: 'up', amount: Math.max(GOLD_RATE, Math.floor(w.iron_bits / GOLD_RATE) * GOLD_RATE) });
    exBtn('1 gold to 100 iron', w.gold_coins >= 1, { t: 'exchange', dir: 'down', amount: 1 });
    exBtn('All gold to iron', w.gold_coins >= 1, { t: 'exchange', dir: 'down', amount: Math.max(1, w.gold_coins) });
    box.appendChild(ex);

    const used = G.storage.items.filter(Boolean).length;
    box.appendChild(el('h3', '', `Storage (${used}/${G.storage.slots})`));
    if (typeof G.storage.nextCost === 'number') {
      const cost = G.storage.nextCost;
      const gold = cost >= GOLD_RATE ? ` (${cost / GOLD_RATE} gold)` : '';
      const up = el('button', 'act', `Add 10 places: ${cost.toLocaleString()} iron bits${gold}`);
      up.type = 'button';
      up.disabled = w.iron_bits < cost;
      up.title = `Upgrade ${(G.storage.tier || 0) + 1} of 5. Iron bits only; change gold coins back first if you need to.`;
      up.addEventListener('click', () => window.wealdmark.send({ t: 'storage_upgrade' }));
      box.appendChild(up);
    } else if (typeof G.storage.tier === 'number') box.appendChild(el('p', 'muted', 'Every storage upgrade is bought.'));
    const grid = el('div', 'slot-grid');
    G.storage.items.forEach((ref, i) => {
      grid.appendChild(slotButton(ref, (ev) => window.wealdmark.send({ t: 'store', dir: 'out', slot: i, qty: ev.shiftKey ? 999 : 1 })));
    });
    box.appendChild(grid);

    box.appendChild(el('h3', '', 'Your bag'));
    const bag = el('div', 'slot-grid');
    if (G.inv) {
      G.inv.items.forEach((ref, i) => {
        bag.appendChild(slotButton(ref, (ev) => window.wealdmark.send({ t: 'store', dir: 'in', slot: i, qty: ev.shiftKey ? 999 : 1 })));
      });
    }
    box.appendChild(bag);
    box.appendChild(el('p', 'muted', 'Click to move one. Shift-click moves the whole stack. Gold coins are lighter to carry than a purse of iron bits.'));
  }

  // crafting stations

  function onStation(msg) {
    const st = G.data.stations.get(msg.station);
    if (!st) return;
    G.town = { kind: 'station', station: msg.station };
    showTown('panel-station');
    renderStation();
  }

  const bagCount = (id) => (G.inv ? G.inv.items.reduce((n, r) => n + (r && r.id === id ? r.qty : 0), 0) : 0);

  function renderStation() {
    const st = G.data.stations.get(G.town.station);
    if (!st) return;
    $('station-title').textContent = st.name;
    const box = $('station-body');
    box.textContent = '';
    for (const line of st.text) box.appendChild(el('p', 'muted', line));
    // Only what you can make right now.
    const most = (r) => Math.min(20, ...r.inputs.map((i) => Math.floor(bagCount(i.item) / i.qty)));
    const list = [...G.data.recipes.values()].filter((r) => r.station === st.id && skillLevel(r.skill) >= r.level && most(r) >= 1 && G.data.items.get(r.output.item));
    for (const r of list) {
      const out = G.data.items.get(r.output.item);
      const low = false;
      const max = most(r);
      const row = el('div', 'recipe');
      const head = el('div', 'recipe-head');
      head.append(iconCanvas(out), el('span', 'name', `${out.name}${r.output.qty > 1 ? ` x${r.output.qty}` : ''}`), el('span', 'muted', `${SKILL_LABEL[r.skill]} ${r.level}`));
      row.appendChild(head);
      const need = el('div', 'need');
      for (const i of r.inputs) {
        const have = bagCount(i.item);
        const idef = G.data.items.get(i.item);
        need.appendChild(el('span', have >= i.qty ? 'ok' : 'short', `${idef ? idef.name : pretty(i.item)} ${have}/${i.qty}`));
      }
      row.appendChild(need);
      const btns = el('div', 'recipe-btns');
      for (const [label, n] of [['Make 1', 1], ['Make 5', 5], [max > 5 ? `Make ${max}` : 'Make all', max]]) {
        if (n === 5 && max < 5) continue;
        if (label !== 'Make 1' && n === 1) continue;
        const b = el('button', 'act', label);
        b.type = 'button';
        b.addEventListener('click', () => window.wealdmark.send({ t: 'craft', recipe: r.id, qty: Math.min(20, n) }));
        btns.appendChild(b);
      }
      row.appendChild(btns);
      box.appendChild(row);
    }
    if (!list.length) box.appendChild(el('p', 'muted', 'You have nothing to make here. Bring the materials, or train the skill.'));
  }

  // the Crown Steward

  function onPerks(msg) {
    G.perks = msg;
    const me = G.self();
    if (me) me.title = msg.title || undefined;
    G.town = { kind: 'perks', npc: msg.npc };
    showTown('panel-perks');
    renderPerks();
  }

  function renderPerks() {
    const npc = G.data.npcs.get(G.perks.npc);
    const svc = npc && npc.services.find((s) => s.kind === 'steward');
    $('perks-title').textContent = npc ? npc.name : 'Steward';
    const box = $('perks-body');
    box.textContent = '';
    box.appendChild(walletLine());
    box.appendChild(el('p', 'muted', 'Favor tokens come from finishing jobs for the people of the Reach. They buy what gold cannot.'));
    if (!svc) return;
    const w = (G.stats && G.stats.wallet) || { favor_tokens: 0 };
    for (const perk of svc.perks) {
      const row = el('div', 'perk');
      const owned = G.perks.owned.includes(perk.id);
      const worn = perk.type === 'title' && G.perks.title === perk.value;
      row.appendChild(el('span', 'name', perk.label));
      const b = el('button', 'act');
      b.type = 'button';
      if (perk.type === 'title' && owned) {
        b.textContent = worn ? 'Worn' : 'Wear';
        b.disabled = worn;
      } else {
        b.append(document.createTextNode('Buy '), price(perk.cost, 'favor_tokens'));
        b.disabled = w.favor_tokens < perk.cost || (perk.type === 'slots' && G.perks.extraSlots >= 60);
      }
      b.addEventListener('click', () => window.wealdmark.send({ t: 'perk', id: perk.id }));
      row.appendChild(b);
      box.appendChild(row);
    }
    box.appendChild(el('p', 'muted', `Extra storage places: ${G.perks.extraSlots}`));
  }

  /** The anchor window: attune this anchor, then travel between the ones you have attuned. */
  function renderAnchor() {
    const list = G.anchors || [];
    const here = list.find((a) => a.id === G.town.id);
    const crystals = ((G.inv && G.inv.items) || []).reduce((n, s) => (s && s.id === 'teleport_crystal' ? n + s.qty : n), 0);
    $('anchor-title').textContent = here ? here.name : 'Teleport anchor';
    const box = $('anchor-body');
    box.textContent = '';
    box.appendChild(el('p', 'muted', 'Early anchors are free to attune. Later anchors need a Teleport Crystal. Once an anchor is attuned, you can travel between your attuned anchors as often as you like, at no cost.'));
    if (here && !here.attuned) {
      const row = el('div', 'perk');
      const b = el('button', 'act');
      b.type = 'button';
      if (here.free) {
        row.appendChild(el('span', 'name', 'This is an early anchor. Attuning it is free.'));
        b.textContent = 'Attune';
      } else {
        row.appendChild(el('span', 'name', `This anchor needs a Teleport Crystal. You have ${crystals}.`));
        b.textContent = 'Place crystal';
        b.disabled = crystals < 1;
      }
      b.addEventListener('click', () => window.wealdmark.send({ t: 'anchor_attune', id: here.id }));
      row.appendChild(b);
      box.appendChild(row);
      if (!here.free && crystals < 1) box.appendChild(el('p', 'muted', 'Teleport Crystals are sold by Magister Edith Crane at the Academy of the Royal Art in Aldmoor.'));
    } else if (here) {
      box.appendChild(el('p', 'muted', 'This anchor is attuned.'));
    }
    box.appendChild(el('h3', '', 'Your anchors'));
    for (const a of list) {
      const row = el('div', 'perk');
      row.appendChild(el('span', 'name', a.name));
      const b = el('button', 'act');
      b.type = 'button';
      if (a.attuned) {
        b.textContent = here && here.id === a.id ? 'You are here' : 'Travel';
        b.disabled = !here || !here.attuned || here.id === a.id;
        b.addEventListener('click', () => {
          G.anchorTravel = a.name;
          window.wealdmark.send({ t: 'anchor_travel', to: a.id });
          closeTown(false);
        });
      } else {
        b.textContent = a.free ? 'Free to attune' : 'Needs crystal';
        b.disabled = true;
      }
      row.appendChild(b);
      box.appendChild(row);
    }
  }

  /** Redraw whichever town panel is open after your bag or purse changed. */
  function refreshTown() {
    if (!G.town) return;
    if (G.town.kind === 'shop') renderShop();
    else if (G.town.kind === 'storage') renderStorage();
    else if (G.town.kind === 'station') renderStation();
    else if (G.town.kind === 'perks' && G.perks) renderPerks();
    else if (G.town.kind === 'anchor') renderAnchor();
  }

  // busy bar

  function onBusy(msg) {
    const was = G.busy;
    G.busy = msg.of > 0 ? msg : null;
    const bar = $('busy');
    bar.classList.toggle('hidden', !G.busy);
    const atStation = G.town && G.town.kind === 'station';
    if (!G.busy) {
      // A batch is over: the one-time box is not coming back, so let the station go.
      if (was && was.total && atStation) closeTown(true);
      return;
    }
    if (msg.total && atStation) $('panel-station').classList.add('hidden');
    const fill = $('busy-fill');
    if (msg.total) {
      // Each item fills the bar from empty to full over its 1.8 seconds.
      const left = ((msg.total - msg.made) * msg.of - msg.done) * G.tickMs / 1000;
      $('busy-text').textContent = `${msg.what}  ${msg.made} / ${msg.total} done  ${Math.ceil(left)}s left`;
      if (msg.done === 0) {
        fill.style.transition = 'none';
        fill.style.width = '0%';
        void fill.offsetWidth;
        fill.style.transition = '';
      }
    } else $('busy-text').textContent = msg.what;
    fill.style.width = `${Math.min(100, Math.round(((msg.done + 1) / msg.of) * 100))}%`;
  }

  // jobs

  const questStates = () => new Map((G.quests || []).map((q) => [q.id, q]));

  function needMet(need, st) {
    switch (need.type) {
      case 'none':
        return true;
      case 'kill':
        return st.count >= need.count;
      case 'have':
        return bagCount(need.item) >= need.count;
      case 'skill':
        return skillLevel(need.skill) >= need.level;
      case 'spent':
        return G.stats ? Object.values(G.stats.ranks).reduce((a, b) => a + b, 0) - 4 >= need.points : false;
      default:
        return false;
    }
  }

  /** '!' over someone with a job for you, '?' over someone you can hand a job in to. */
  function questMark(npcId) {
    if (!G.data || !G.quests) return null;
    const states = questStates();
    let mark = null;
    for (const q of G.data.quests.values()) {
      const st = states.get(q.id);
      if (!st) {
        const done = (id) => Boolean(states.get(id) && states.get(id).done);
        if (q.giver === npcId && myCombat() >= q.level && q.after.every(done)) mark = mark || '!';
      } else if (!st.done && q.steps[st.step] && q.steps[st.step].npc === npcId) {
        if (needMet(q.steps[st.step].need, st)) return '?';
      }
    }
    return mark;
  }

  function progressText(need, st) {
    if (need.type === 'kill') return `${pretty(need.monster)} ${Math.min(st.count, need.count)}/${need.count}`;
    if (need.type === 'have') return `${itemName({ id: need.item })} ${Math.min(bagCount(need.item), need.count)}/${need.count}`;
    if (need.type === 'skill') return `${SKILL_LABEL[need.skill]} ${skillLevel(need.skill)}/${need.level}`;
    return '';
  }

  function partyBtn(label, op, name) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'act';
    b.textContent = label;
    b.addEventListener('click', () => window.wealdmark.send(name ? { t: 'party', op, name } : { t: 'party', op }));
    return b;
  }

  function inviteFromBox() {
    const box = $('party-name');
    const name = box.value.trim();
    if (!name) return;
    window.wealdmark.send({ t: 'party', op: 'invite', name });
    box.value = '';
  }

  function renderParty() {
    const body = $('party-body');
    body.textContent = '';
    if (G.invite && !G.party) {
      const p = document.createElement('p');
      p.textContent = `${G.invite} invites you to a party.`;
      const row = document.createElement('div');
      row.className = 'row';
      const yes = partyBtn('Accept', 'accept');
      const no = partyBtn('Decline', 'decline');
      for (const b of [yes, no]) {
        b.addEventListener('click', () => {
          G.invite = null;
          renderParty();
        });
      }
      row.append(yes, no);
      body.append(p, row);
    }
    const party = G.party;
    if (!party) {
      if (!G.invite) {
        const p = document.createElement('p');
        p.className = 'muted';
        p.textContent = 'You are not in a party. Invite a hero by name to start one.';
        body.append(p);
      }
      return;
    }
    const leading = party.leader === G.selfId;
    for (const m of party.members) {
      const row = document.createElement('div');
      row.className = 'party-member';
      const name = document.createElement('span');
      name.textContent = `${m.name}${m.id === party.leader ? ' (leader)' : ''}  Lv ${m.level}`;
      const bar = document.createElement('div');
      bar.className = 'meter hp mini';
      const fill = document.createElement('div');
      fill.className = 'meter-fill';
      fill.style.width = `${Math.max(0, Math.min(100, (m.hp / Math.max(1, m.maxHp)) * 100))}%`;
      const txt = document.createElement('span');
      txt.textContent = `${m.hp}/${m.maxHp}`;
      bar.append(fill, txt);
      row.append(name, bar);
      if (leading && m.id !== G.selfId) row.append(partyBtn('Remove', 'kick', m.name));
      body.append(row);
    }
    body.append(partyBtn('Leave party', 'leave'));
  }

  function renderDungeon() {
    const body = $('dungeon-body');
    body.textContent = '';
    const party = G.party;
    const p = document.createElement('p');
    const bits = (G.stats && G.stats.wallet && G.stats.wallet.iron_bits) || 0;
    p.textContent = party ? `Entering takes your party of ${party.members.length}. Each hero pays ${DUNGEON_FEE} iron bits.` : `Entering alone costs ${DUNGEON_FEE} iron bits.`;
    const have = document.createElement('p');
    have.className = bits < DUNGEON_FEE ? 'bad' : 'muted';
    have.textContent = `You carry ${bits} iron bits.`;
    const enter = document.createElement('button');
    enter.type = 'button';
    enter.className = 'act';
    enter.textContent = `Enter (${DUNGEON_FEE} iron bits each)`;
    enter.addEventListener('click', () => window.wealdmark.send({ t: 'dungeon', op: 'enter' }));
    const leave = document.createElement('button');
    leave.type = 'button';
    leave.className = 'act';
    leave.textContent = 'Walk out';
    leave.addEventListener('click', () => window.wealdmark.send({ t: 'dungeon', op: 'leave' }));
    const row = document.createElement('div');
    row.className = 'row';
    row.append(enter, leave);
    body.append(p, have, row);
  }

  function renderJournal() {
    const box = $('journal-body');
    if (!box || !G.data) return;
    box.textContent = '';
    const states = questStates();
    const off = untrackedQuests();
    const active = [...G.data.quests.values()].filter((q) => states.get(q.id) && !states.get(q.id).done);
    const done = [...G.data.quests.values()].filter((q) => states.get(q.id) && states.get(q.id).done);
    if (!active.length && !done.length) box.appendChild(el('p', 'muted', 'No jobs yet. People with a gold ! over their head have work for you.'));
    const card = (q) => {
      const st = states.get(q.id);
      const step = q.steps[st.step];
      const tracked = !off.has(q.id);
      const c = el('div', 'quest' + (tracked ? ' tracked' : ''));
      const head = el('div', 'qhead');
      head.appendChild(el('h3', '', q.name));
      const t = el('button', 'qtrack' + (tracked ? ' on' : ''), tracked ? 'Tracking' : 'Track');
      t.type = 'button';
      t.title = tracked ? 'Stop tracking this job' : 'Track this job';
      t.addEventListener('click', () => setTracked(q.id, !tracked));
      head.appendChild(t);
      c.appendChild(head);
      const giver = G.data.npcs.get(step.npc);
      const ready = needMet(step.need, st);
      c.appendChild(el('p', '', ready && giver ? `Report to ${giver.name}.` : step.todo));
      const prog = progressText(step.need, st);
      if (prog) c.appendChild(el('p', ready ? 'ok' : 'short', prog));
      if (giver && !ready) c.appendChild(el('p', 'muted', `Report to ${giver.name}.`));
      return c;
    };
    const tracked = active.filter((q) => !off.has(q.id));
    const other = active.filter((q) => off.has(q.id));
    for (const q of tracked) box.appendChild(card(q));
    if (other.length) {
      box.appendChild(el('h3', 'muted', 'Not tracked'));
      for (const q of other) box.appendChild(card(q));
    }
    if (done.length) {
      box.appendChild(el('h3', 'muted', 'Finished'));
      for (const q of done) box.appendChild(el('p', 'muted', q.name));
    }
  }

  function onQuests(msg) {
    G.quests = msg.list;
    renderJournal();
  }

  // ---- drawing

  // ---- the town portal

  const PORTAL_STEP_MS = 700;

  /** A portal opens beside the hero while they cast. */
  function openPortal(durMs, now) {
    const me = G.self();
    if (!me) return;
    const p = worldPos(me, now);
    const open = (x, y) => !blockedTile(Math.round(x), Math.round(y));
    const spot = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [Math.round(p.x) + dx, Math.round(p.y) + dy]).find(([x, y]) => open(x, y)) || [Math.round(p.x), Math.round(p.y)];
    G.portal = { stage: 'open', x: spot[0], y: spot[1], fromX: p.x, fromY: p.y, t0: now, dur: Math.max(600, durMs) };
  }

  function onPortal(msg, now) {
    const po = G.portal;
    if (msg.stage === 'enter') {
      const me = G.self();
      const p = me ? worldPos(me, now) : { x: 0, y: 0 };
      if (!po) openPortal(1000, now);
      G.portal.stage = 'enter';
      G.portal.t0 = now;
      G.portal.fromX = p.x;
      G.portal.fromY = p.y;
      // Once the hero is through, cover the screen until they stand in town.
      clearTimeout(G.portalTimer);
      G.portalTimer = setTimeout(showLoading, PORTAL_STEP_MS);
      return;
    }
    // arrive: the screen stays covered a moment so the hero is already standing there when it clears
    clearTimeout(G.portalTimer);
    showLoading();
    setTimeout(() => {
      const at = msg.x !== undefined ? { x: msg.x, y: msg.y } : { x: G.self().x, y: G.self().y };
      G.portal = { stage: 'arrive', x: at.x + 1, y: at.y, fromX: at.x, fromY: at.y, t0: performance.now() };
      hideLoading();
      setTimeout(() => {
        if (G.portal && G.portal.stage === 'arrive') G.portal = null;
      }, PORTAL_STEP_MS + 1100);
    }, 900);
  }

  function showLoading() {
    const box = $('loading');
    box.classList.remove('hidden', 'fade');
    if (G.portal && G.portal.stage === 'enter') G.portal.stage = 'wait';
  }

  function hideLoading() {
    const box = $('loading');
    box.classList.add('fade');
    setTimeout(() => {
      if (box.classList.contains('fade')) box.classList.add('hidden');
    }, 520);
  }

  function blockedTile(x, y) {
    const m = G.map;
    if (!m || x < 0 || y < 0 || x >= m.width || y >= m.height) return true;
    return Boolean(m.blocked && m.blocked[y] && m.blocked[y][x] === '1');
  }

  /** The swirling portal, drawn over the ground at a tile. `k` is how open it is, 0 to 1. */
  function drawPortal(ctx, x, y, k, now, offX, offY, px) {
    if (k <= 0) return;
    const cx = offX + (x + 0.5) * px;
    const cy = offY + (y + 0.55) * px;
    const rx = px * 0.42 * k;
    const ry = px * 0.78 * k;
    ctx.save();
    ctx.translate(cx, cy);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
    g.addColorStop(0, 'rgba(240, 228, 255, 0.95)');
    g.addColorStop(0.45, 'rgba(150, 100, 255, 0.85)');
    g.addColorStop(1, 'rgba(50, 30, 140, 0.0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = Math.max(1, px * 0.05);
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = i === 1 ? 'rgba(120, 230, 255, 0.9)' : 'rgba(210, 170, 255, 0.9)';
      const a = now / 380 + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * (0.45 + i * 0.22), ry * (0.45 + i * 0.22), 0, a, a + Math.PI * 1.1);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Whether other players (and anything that follows them) are left out of the picture. Kept per device. */
  const hideOthers = { on: false };
  try {
    hideOthers.on = localStorage.getItem('wealdmark.hideOthers') === '1';
  } catch {
    // blocked storage: show everyone
  }
  const hidden = (e) => hideOthers.on && e.kind === 'player' && e.id !== G.selfId;

  /** Everything to draw this frame, world and fight alike. */
  function renderables(now) {
    const list = [];
    const inFight = G.fight;
    for (const e of G.entities.values()) {
      if (inFight && inFight.actors.has(e.id)) continue;
      if (hidden(e)) continue;
      const p = worldPos(e, now);
      list.push({
        id: e.id, name: e.name, kind: e.kind, level: e.level, mon: e.mon, look: e.look, x: p.x, y: p.y, moving: p.moving,
        ref: e.ref, depleted: e.depleted, title: e.title, self: e.id === G.selfId, say: e.say && now < e.sayUntil ? e.say : null, fighting: e.fight, alpha: 1, ox: 0, oy: 0,
      });
    }
    for (const r of list) {
      if (!r.self || !G.portal) continue;
      const po = G.portal;
      if (po.stage === 'enter' || po.stage === 'wait') {
        const k = po.stage === 'wait' ? 1 : Math.min(1, (now - po.t0) / PORTAL_STEP_MS);
        r.x = po.fromX + (po.x - po.fromX) * k;
        r.y = po.fromY + (po.y - po.fromY) * k;
        r.alpha = 1 - k;
        r.moving = k < 1;
      } else if (po.stage === 'arrive') {
        r.alpha = Math.min(1, (now - po.t0) / PORTAL_STEP_MS);
      }
    }
    if (inFight) {
      for (const a of inFight.actors.values()) {
        const p = actorPos(a, now);
        let ox = 0;
        let oy = 0;
        if (a.lunge) {
          const t = (now - a.lunge.t0) / 220;
          if (t >= 1) a.lunge = null;
          else {
            const k = Math.sin(t * Math.PI) * 0.35;
            ox = VEC[a.lunge.dir][0] * k;
            oy = VEC[a.lunge.dir][1] * k;
          }
        }
        if (!a.alive) a.fade = Math.max(0, a.fade - 0.03);
        list.push({
          id: a.id, name: a.name, kind: a.side === 'hero' && !a.mon ? 'player' : 'monster', level: a.level, mon: a.mon, look: a.look, x: p.x + ox, y: p.y + oy,
          moving: p.moving, self: a.id === G.selfId, say: null, fighting: true, alpha: a.fade, fightActor: a, flash: now - a.flash < 140, active: inFight.turnActor === a.id,
        });
      }
    }
    for (const p of petsFor(list, now)) list.push(p);
    return list;
  }

  function labelFor(r) {
    if (r.kind === 'monster') return `${r.name} (Lv ${r.level})`;
    if (r.kind === 'node') {
      const def = G.data && G.data.nodes.get(r.ref);
      if (!def) return r.name;
      return r.depleted ? `${r.name} (spent)` : `${r.name} (${SKILL_LABEL[def.skill]} ${def.level})`;
    }
    if (r.title) return `${r.name}, ${r.title}`;
    return r.name;
  }

  function labelColor(r) {
    if (r.self) return '#e6b34a';
    if (r.kind === 'npc') return '#9fe8c8';
    if (r.kind === 'station') return '#f0d890';
    if (r.kind === 'node') {
      const def = G.data && G.data.nodes.get(r.ref);
      return def && skillLevel(def.skill) < def.level ? '#ff9a9a' : '#d8f0c8';
    }
    if (r.kind !== 'monster') return '#efe6d0';
    const d = r.level - myCombat();
    return d > 0 ? '#ff8080' : d === 0 ? '#ffe066' : '#7bd88f';
  }

  function frame() {
    if (!G) return;
    const { canvas, ctx, map, tileset } = G;
    const now = performance.now();
    if (G.fight && !G.modal) runFightQueue(now);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0c0912';
    ctx.fillRect(0, 0, w, h);

    const base = Math.max(2, Math.min(5, Math.floor(Math.min(w / (TILE * 22), h / (TILE * 13)))));
    const fit = Math.min(w / (TILE * map.width), h / (TILE * map.height));
    // Zoom steps scale by 1.25 each way. Out to the whole map; in to double the usual size.
    let s = Math.max(fit, Math.min(base * 2, base * Math.pow(1.25, G.zoom)));
    if (s >= 2) s = Math.round(s * 4) / 4; // keep tiles on whole or quarter pixels so they do not seam
    G.scale = s;
    const px = TILE * s;
    let cam;
    if (G.fight && hero()) {
      const p = actorPos(hero(), now);
      cam = { x: p.x, y: p.y };
    } else {
      const p = worldPos(G.self(), now);
      cam = { x: p.x, y: p.y };
    }
    const offX = Math.round(w / 2 - (cam.x * TILE + TILE / 2) * s);
    const offY = Math.round(h / 2 - (cam.y * TILE + TILE / 2) * s);
    G.off = { x: offX, y: offY };

    const x0 = Math.max(0, Math.floor(-offX / px));
    const x1 = Math.min(map.width - 1, Math.ceil((w - offX) / px));
    const y0 = Math.max(0, Math.floor(-offY / px));
    const y1 = Math.min(map.height - 1, Math.ceil((h - offY) / px));
    const cols = map.tileset.columns;

    const drawTile = (id, tx, ty) => {
      const i = id - 1;
      ctx.drawImage(tileset, (i % cols) * TILE, Math.floor(i / cols) * TILE, TILE, TILE, offX + tx * px, offY + ty * px, px, px);
    };
    const box = (tx, ty, fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(offX + tx * px, offY + ty * px, px, px);
    };

    if (G.ground && x1 >= x0 && y1 >= y0) {
      ctx.drawImage(G.ground, x0 * TILE, y0 * TILE, (x1 - x0 + 1) * TILE, (y1 - y0 + 1) * TILE, offX + x0 * px, offY + y0 * px, (x1 - x0 + 1) * px, (y1 - y0 + 1) * px);
    } else {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const id = map.layers.ground[y * map.width + x];
        if (id) drawTile(id, x, y);
      }
    }

    if (G.fight && G.fight.marks) for (const t of G.fight.marks) box(t.x, t.y, 'rgba(220,40,30,0.4)');
    // Fight overlays go on the ground, under people.
    if (G.fight && isMyTurn()) {
      const o = G.fight.options;
      if (o.moveLeft > 0) for (const t of o.reach) box(t.x, t.y, 'rgba(90,150,255,0.28)');
      const sel = o.abilities.find((a) => a.id === G.fight.selected);
      const hp = hero().pos;
      if (G.fight.hover) {
        const hv = G.fight.hover;
        if (sel && sel.shape === 'front3x3' && sel.usable) {
          for (const t of front3x3(hp, dirToward(hp, hv))) box(t.x, t.y, 'rgba(255,90,90,0.30)');
        } else if (sel && sel.shape === 'area' && sel.usable) {
          if (manhattan(hp, hv) <= (sel.range || 1)) {
            const r = sel.radius || 1;
            for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) box(hv.x + dx, hv.y + dy, 'rgba(255,90,90,0.30)');
          }
        } else if (o.reach.some((p) => p.x === hv.x && p.y === hv.y)) box(hv.x, hv.y, 'rgba(255,255,255,0.28)');
      }
      if (sel && sel.usable && sel.range && (sel.shape === 'ranged' || sel.shape === 'multi' || sel.shape === 'chain' || sel.shape === 'area')) {
        const r = sel.range;
        for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) if ((dx || dy) && Math.abs(dx) + Math.abs(dy) <= r) box(hp.x + dx, hp.y + dy, 'rgba(255,190,70,0.10)');
      }
      for (const a of G.fight.actors.values()) {
        if (a.side === 'enemy' && a.alive && manhattan(a.pos, hp) === 1) {
          ctx.strokeStyle = 'rgba(255,90,90,0.9)';
          ctx.lineWidth = 2;
          ctx.strokeRect(offX + a.pos.x * px + 1, offY + a.pos.y * px + 1, px - 2, px - 2);
        }
      }
    }

    const po = G.portal;
    if (po) {
      let k = 1;
      if (po.stage === 'open') k = Math.min(1, (now - po.t0) / Math.min(po.dur, 1400));
      else if (po.stage === 'arrive') k = Math.max(0, 1 - Math.max(0, now - po.t0 - PORTAL_STEP_MS) / 900);
      drawPortal(ctx, po.x, po.y, k, now, offX, offY, px);
    }
    const list = renderables(now);
    const rows = new Map();
    for (const r of list) {
      const row = Math.round(r.y);
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row).push(r);
    }
    for (let y = y0 - 1; y <= y1 + 1; y++) {
      if (y >= 0 && y < map.height) {
        for (let x = x0; x <= x1; x++) {
          const id = map.layers.decor[y * map.width + x];
          if (id) {
            const sh = DECOR_SHADOW[id];
            if (sh) {
              ctx.fillStyle = 'rgba(14, 22, 10, 0.3)';
              ctx.beginPath();
              ctx.ellipse(offX + (x + 0.5 + sh[2]) * px, offY + (y + 0.9) * px, sh[0] * px, sh[1] * px, 0, 0, Math.PI * 2);
              ctx.fill();
            }
            drawTile(id, x, y);
          }
        }
      }
      for (const r of rows.get(y) || []) {
        const sx = offX + r.x * px + (px - 12 * s) / 2;
        const sy = offY + r.y * px - (r.kind === 'monster' ? 0 : 2 * s);
        const step = r.moving ? (Math.floor(now / 150) % 2) + 1 : 0;
        const bob = r.moving && step === 1 ? -1 : 0;
        ctx.globalAlpha = r.alpha;
        if (r.kind === 'pet') {
          drawPet(ctx, r.pet, offX + r.x * px, offY + r.y * px - s, s, r.step, r.face, r.lift);
          ctx.globalAlpha = 1;
          continue;
        }
        if (r.kind === 'node' || r.kind === 'station') {
          const def = G.data && (r.kind === 'node' ? G.data.nodes : G.data.stations).get(r.ref);
          if (def && r.kind === 'node') drawNode(ctx, def, r.depleted, offX + r.x * px, offY + r.y * px, s, now);
          else if (def) drawStation(ctx, r.ref, offX + r.x * px, offY + r.y * px, s, now);
          ctx.globalAlpha = 1;
          continue;
        }
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(Math.round(sx + s), Math.round(sy + (r.kind === 'monster' ? 15 : 15) * s), 10 * s, 2 * s);
        if (r.flash) {
          ctx.filter = 'brightness(2.2)';
        }
        if (r.kind === 'monster') drawMonster(ctx, r.mon, sx, sy, s, step, bob);
        else if (r.kind === 'npc') {
          const def = G.data && G.data.npcs.get(r.ref);
          if (def) drawFigure(ctx, sx, sy, s, npcLook(def), 0, 0, {});
        } else drawFigure(ctx, sx, sy, s, r.look, step, bob, heldGear(r.id));
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
      }
    }

    // Selected destination and turn marker.
    if (G.dest && !G.fight) {
      ctx.fillStyle = '#e6b34a';
      const m = Math.max(2, Math.floor(px / 6));
      ctx.fillRect(offX + G.dest.x * px + px / 2 - m, offY + G.dest.y * px + px / 2 - m, m * 2, m * 2);
    }

    drawRoofs(ctx, offX, offY, px);

    // Names, health bars, speech, and floating numbers on top.
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.max(10, 4 * s)}px "Courier New", monospace`;
    const mp = worldPos(G.self(), now);
    for (const r of list) {
      if (r.alpha <= 0.05 || r.kind === 'pet') continue;
      if (roofed(Math.round(r.x), Math.round(r.y))) continue;
      if ((r.kind === 'node' || r.kind === 'station') && !(Math.abs(r.x - mp.x) + Math.abs(r.y - mp.y) <= 3 || (G.hover && Math.round(r.x) === G.hover.x && Math.round(r.y) === G.hover.y))) continue;
      const cx = offX + r.x * px + px / 2;
      const top = offY + r.y * px - (r.kind === 'monster' ? 0 : 3 * s) - (r.kind === 'monster' ? 2 * s : 0);
      let y = top;
      if (r.fightActor) {
        const a = r.fightActor;
        const bw = px;
        const by = y - 5 * s;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(cx - bw / 2, by, bw, Math.max(3, s));
        ctx.fillStyle = a.side === 'hero' ? '#6fd28a' : '#e05a5a';
        ctx.fillRect(cx - bw / 2, by, Math.max(0, bw * (a.hp / a.maxHp)), Math.max(3, s));
        y = by - 3;
        if (r.active) {
          ctx.fillStyle = '#e6b34a';
          ctx.beginPath();
          ctx.moveTo(cx - 4 * s / 2, y - 6 * s / 2);
          ctx.lineTo(cx + 4 * s / 2, y - 6 * s / 2);
          ctx.lineTo(cx, y);
          ctx.fill();
          y -= 5 * s / 2 + 2;
        }
      }
      let label = labelFor(r);
      if (r.fightActor && r.fightActor.side === 'enemy') {
        const hit = myHitChance(r.fightActor.level);
        if (hit !== null) label += ` ${pctText(hit)}`;
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';
      ctx.fillStyle = labelColor(r);
      ctx.strokeText(label, cx, y);
      ctx.fillText(label, cx, y);
      if (r.kind === 'npc') {
        const mark = questMark(r.ref);
        if (mark) {
          ctx.fillStyle = '#ffd84a';
          ctx.strokeText(mark, cx, y - Math.max(10, 4 * s));
          ctx.fillText(mark, cx, y - Math.max(10, 4 * s));
        }
      }
      if (r.fighting && !r.fightActor) {
        ctx.fillStyle = '#ff8080';
        ctx.fillText('!', cx, y - Math.max(10, 4 * s));
      }
      if (r.say) {
        const by = y - Math.max(12, 5 * s);
        const tw = ctx.measureText(r.say).width + 12;
        ctx.fillStyle = 'rgba(20,16,28,0.88)';
        ctx.fillRect(cx - tw / 2, by - 14, tw, 20);
        ctx.fillStyle = '#efe6d0';
        ctx.fillText(r.say, cx, by);
      }
    }
    G.shots = G.shots.filter((sh) => now - sh.t0 < 360);
    for (const sh of G.shots) {
      const t = (now - sh.t0) / 360;
      const nx = offX + (sh.from.x + (sh.to.x - sh.from.x) * t) * px + px / 2;
      const ny = offY + (sh.from.y + (sh.to.y - sh.from.y) * t) * px + px / 2 - Math.sin(t * Math.PI) * 6 * s;
      if (sh.kind === 'pick_throw') {
        ctx.save();
        ctx.translate(Math.round(nx), Math.round(ny));
        ctx.rotate(t * Math.PI * 6);
        ctx.fillStyle = '#6a4426';
        ctx.fillRect(-1 * s, -4 * s, 2 * s, 8 * s);
        ctx.fillStyle = '#b4bac4';
        ctx.fillRect(-4 * s, -4 * s, 8 * s, 2 * s);
        ctx.restore();
        continue;
      }
      ctx.fillStyle = '#6a4426';
      ctx.fillRect(Math.round(nx - 2 * s), Math.round(ny - 2 * s), 4 * s, 4 * s);
      ctx.fillStyle = '#c89a5a';
      ctx.fillRect(Math.round(nx - 2 * s), Math.round(ny - 2 * s), 2 * s, 2 * s);
    }
    G.floaters = G.floaters.filter((f) => now - f.t0 < 900);
    ctx.font = `bold ${Math.max(12, 5 * s)}px "Courier New", monospace`;
    for (const f of G.floaters) {
      const t = (now - f.t0) / 900;
      ctx.globalAlpha = 1 - t * t;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';
      ctx.fillStyle = f.color;
      const fx = offX + f.x * px + px / 2;
      const fy = offY + f.y * px - 4 * s - t * 14 * s;
      ctx.strokeText(f.text, fx, fy);
      ctx.fillText(f.text, fx, fy);
    }
    ctx.globalAlpha = 1;

    if (G.inspect && now < G.inspect.until) {
      ctx.strokeStyle = 'rgba(255,216,106,0.95)';
      ctx.lineWidth = 3;
      ctx.strokeRect(offX + G.inspect.x * px + 1, offY + G.inspect.y * px + 1, px - 2, px - 2);
    }

    // Hover tile in the open world.
    if (!G.fight && G.hover && G.hover.x >= 0 && G.hover.y >= 0 && G.hover.x < map.width && G.hover.y < map.height) {
      ctx.strokeStyle = map.blocked[G.hover.y][G.hover.x] === '1' ? 'rgba(255,122,122,0.9)' : 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(offX + G.hover.x * px + 1, offY + G.hover.y * px + 1, px - 2, px - 2);
    }

    if (now - G.hudAt > 150) {
      G.hudAt = now;
      updateTip();
      const me = G.self();
      const z = zoneAt(map, me.x, me.y);
      if (window.wealdmarkAudio) window.wealdmarkAudio.music(G.fight ? 'fight' : z && z.kind === 'safe' ? 'town' : 'wilds');
      const others = [...G.entities.values()].filter((e) => e.kind === 'player' && e.id !== G.selfId).length;
      const place = z ? (z.name === map.name ? `${map.name} (${KIND_LABEL[z.kind]})` : `${map.name} - ${z.name} (${KIND_LABEL[z.kind]})`) : map.name;
      $('hud').textContent = `${place}\n` +
        `Position: ${me.x}, ${me.y}   Nearby: ${others}`;
      const hh = G.fight && hero();
      const hp = hh ? hh.hp : G.stats ? G.stats.hp : 0;
      const maxHp = hh ? hh.maxHp : G.stats ? G.stats.maxHp : 1;
      const mp = hh ? hh.mana : G.stats ? G.stats.mana : 0;
      const maxMp = hh ? hh.maxMana : G.stats ? G.stats.maxMana : 1;
      $('hp-fill').style.width = `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%`;
      $('mp-fill').style.width = `${Math.max(0, Math.min(100, (mp / maxMp) * 100))}%`;
      $('hp-text').textContent = `HP ${hp}/${maxHp}`;
      $('mp-text').textContent = `Mana ${mp}/${maxMp}`;
      renderXpBar();
      renderGlobes(hp, maxHp, mp, maxMp);
      renderBar();
      renderTracker();
      for (const id of ['rctl', 'mapbox']) $(id).classList.toggle('hidden', Boolean(G.fight));
      if (!G.fight) {
        if ($('buffs').childElementCount) $('buffs').textContent = '';
        renderMinimap(map);
        renderWorld(false);
      }
    }
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#000';
    ctx.fillText(WATERMARK, w - 5, h - 3);
    ctx.fillStyle = '#e8e0f0';
    ctx.fillText(WATERMARK, w - 6, h - 4);
    ctx.restore();
    G.raf = requestAnimationFrame(frame);
  }

  // ---- input

  function loadZoom() {
    try {
      const z = Number(localStorage.getItem('wealdmark.zoom'));
      return Number.isFinite(z) ? Math.max(-12, Math.min(3, z)) : 0;
    } catch {
      return 0;
    }
  }

  function setZoom(z) {
    G.zoom = Math.max(-12, Math.min(3, z));
    try {
      localStorage.setItem('wealdmark.zoom', String(G.zoom));
    } catch {
      /* private mode: the zoom just is not remembered */
    }
  }

  function tileAt(ev) {
    const rect = G.canvas.getBoundingClientRect();
    const px = TILE * G.scale;
    return { x: Math.floor((ev.clientX - rect.left - G.off.x) / px), y: Math.floor((ev.clientY - rect.top - G.off.y) / px) };
  }

  function requestMove(x, y) {
    if (x < 0 || y < 0 || x >= G.map.width || y >= G.map.height) return;
    G.dest = { x, y };
    if (townOpen()) closeTown(false);
    window.wealdmark.send({ t: 'move', x, y });
  }

  /** Pinch to zoom, long-press to examine a tile, and the on-screen buttons that stand in for hotkeys. */
  function setupTouch(canvas) {
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    let pinch = null;
    let press = null;
    const cancelPress = () => {
      if (press) clearTimeout(press.timer);
      press = null;
    };
    on(canvas, 'touchstart', (ev) => {
      if (!G) return;
      if (ev.touches.length === 2) {
        cancelPress();
        pinch = { d: dist(ev.touches), z: G.zoom };
      } else if (ev.touches.length === 1 && !pinch) {
        const t = ev.touches[0];
        press = {
          x: t.clientX,
          y: t.clientY,
          fired: false,
          timer: setTimeout(() => {
            if (!G || !press) return;
            press.fired = true;
            inspectTile(tileAt({ clientX: press.x, clientY: press.y }));
          }, 550),
        };
      }
    }, { passive: true });
    on(canvas, 'touchmove', (ev) => {
      if (!G) return;
      if (pinch && ev.touches.length === 2) {
        ev.preventDefault();
        G.noClick = performance.now() + 400;
        setZoom(pinch.z + Math.round(Math.log(dist(ev.touches) / pinch.d) / Math.log(1.25)));
      } else if (press && ev.touches.length === 1) {
        const t = ev.touches[0];
        if (Math.hypot(t.clientX - press.x, t.clientY - press.y) > 10) cancelPress();
      }
    }, { passive: false });
    on(canvas, 'touchend', (ev) => {
      if (pinch) G.noClick = performance.now() + 400;
      if (ev.touches.length < 2) pinch = null;
      if (press) {
        if (press.fired) ev.preventDefault(); // the long-press already examined the tile; no walking
        cancelPress();
      }
    }, { passive: false });
    on(canvas, 'touchcancel', () => {
      pinch = null;
      cancelPress();
    });
    on($('mb-zin'), 'click', () => setZoom(G.zoom + 1));
    on($('mb-zout'), 'click', () => setZoom(G.zoom - 1));
    on($('mb-map'), 'click', () => setZoom(G.zoom === -12 ? 0 : -12));
    on($('mb-chat'), 'click', () => $('chatinput').focus());
  }

  function onMouseMove(ev) {
    if (!G) return;
    const t = tileAt(ev);
    if (G.fight) G.fight.hover = t;
    else G.hover = t;
    G.mouse = { x: ev.clientX, y: ev.clientY };
    updateTip();
  }

  /** Shift-click: name what is on a tile and ring it for a few seconds, without attacking or walking. */
  function inspectTile(t) {
    let text = null;
    if (G.fight) {
      const a = [...G.fight.actors.values()].find((x) => x.alive && x.pos.x === t.x && x.pos.y === t.y);
      if (a) text = `${a.name}: ${a.hp}/${a.maxHp} health` + (a.statuses && a.statuses.length ? ` (${a.statuses.map((st) => pretty(st.id)).join(', ')})` : '');
    } else {
      const e = [...G.entities.values()].find((x) => Math.round(x.x) === t.x && Math.round(x.y) === t.y);
      if (e) {
        const def = e.kind === 'monster' && G.data && G.data.monsters.get(e.mon);
        const npc = e.kind === 'npc' && G.data && G.data.npcs.get(e.ref);
        text = e.kind === 'monster' ? `${e.name}, level ${e.level}${def ? `, ${def.maxHp} health, hits up to ${def.maxHit}` : ''}` : npc ? `${e.name}, ${npc.role}` : e.kind === 'node' || e.kind === 'station' ? e.name : `${e.name}, level ${e.level}`;
      }
    }
    G.inspect = { x: t.x, y: t.y, until: performance.now() + 4000 };
    toast(text || `Tile ${t.x}, ${t.y}`);
  }

  /** Click a tree, rock, spot or workbench: a small menu offers the work (Chop, Mine, Fish, Use...), a walk, or a look, instead of starting at once. */
  function closeNodeMenu() {
    const m = $('node-menu');
    if (m) m.classList.add('hidden');
  }

  function openNodeMenu(node, ev) {
    const def = G.data && G.data.nodes.get(node.ref);
    const m = $('node-menu');
    m.textContent = '';
    const add = (label, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'act';
      b.textContent = label;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        closeNodeMenu();
        fn();
      });
      m.appendChild(b);
    };
    const verb = node.kind === 'station' ? 'use' : def && def.verb ? def.verb : 'gather';
    add(`${verb[0].toUpperCase()}${verb.slice(1)} ${node.name}`, () => {
      G.dest = null;
      window.wealdmark.send({ t: 'interact', target: node.id });
    });
    add('Walk here', () => requestMove(Math.round(node.x), Math.round(node.y)));
    add('Examine', () => inspectTile({ x: Math.round(node.x), y: Math.round(node.y) }));
    m.classList.remove('hidden');
    const w = m.offsetWidth;
    const h = m.offsetHeight;
    const z = uiScale();
    m.style.left = `${Math.max(4, Math.min(ev.clientX / z + 6, window.innerWidth / z - w - 4))}px`;
    m.style.top = `${Math.max(4, Math.min(ev.clientY / z + 6, window.innerHeight / z - h - 4))}px`;
  }

  function onClick(ev) {
    if (!G || G.modal) return;
    if (G.noClick && performance.now() < G.noClick) return; // the end of a pinch is not a tap
    const t = tileAt(ev);
    if (ev.shiftKey) return inspectTile(t);
    if (G.fight) return fightTileClick(t);
    closeNodeMenu();
    const thing = [...G.entities.values()].find((e) => (e.kind === 'npc' || e.kind === 'node' || e.kind === 'station') && Math.round(e.x) === t.x && Math.round(e.y) === t.y);
    if (thing && (thing.kind === 'node' || thing.kind === 'station')) return openNodeMenu(thing, ev);
    if (thing) {
      G.dest = null;
      return window.wealdmark.send({ t: 'interact', target: thing.id });
    }
    const monster = [...G.entities.values()].find((e) => e.kind === 'monster' && Math.round(e.x) === t.x && Math.round(e.y) === t.y);
    if (monster) {
      if (monster.fight) return toast(ERRORS.busy);
      G.dest = null;
      return window.wealdmark.send({ t: 'attack', target: monster.id });
    }
    requestMove(t.x, t.y);
  }

  function onKey(ev) {
    if (!G) return;
    const typing = document.activeElement === $('chatinput');
    if (G.modal) {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Escape') {
        ev.preventDefault();
      }
      return;
    }
    if (typing) {
      if (ev.key === 'Escape') $('chatinput').blur();
      return;
    }
    if (townOpen() && /^[1-9]$/.test(ev.key) && !$('dialog').classList.contains('hidden')) {
      const b = $('dlg-options').children[Number(ev.key) - 1];
      if (b) b.click();
      return;
    }
    if (ev.key === 'Escape') {
      closeBarPicker();
      closeNodeMenu();
      if (!$('buy-confirm').classList.contains('hidden')) return closeBuyConfirm();
      closePanels();
      if (G.busy) window.wealdmark.send({ t: 'stop' });
      closeTown(true);
      return;
    }
    const k = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    if (k === '+' || k === '=') return setZoom(G.zoom + 1);
    if (k === '-' || k === '_') return setZoom(G.zoom - 1);
    if (k === 'm') return setZoom(G.zoom === -12 ? 0 : -12); // the whole map; press again to come back
    if (k === 'l') {
      togglePanel('panel-look');
      return renderLook();
    }
    if (k === 't') return goToTown();
    if (k === 'k') return togglePanel('panel-skills');
    if (k === 'v') return togglePanel('panel-trades');
    if (k === 'j') {
      togglePanel('panel-journal');
      return renderJournal();
    }
    if (k === 'i') return togglePanel('panel-bag');
    if (k === 'p') {
      togglePanel('panel-party');
      return renderParty();
    }
    if (k === 'o') {
      togglePanel('panel-dungeon');
      return renderDungeon();
    }
    if (k === 'c') return togglePanel('panel-stats');
    if (k === 'e' && !G.fight) return togglePanel('panel-equip');
    const quick = QUICK.find((x) => x.key === k);
    if (quick) return useQuick(quick);
    if (k === 'x' && !G.fight) return toggleAuto();
    if (!G.fight && /^[1-8]$/.test(k)) return useBarSlot(Number(k) - 1, true);
    if (G.fight) {
      if (k === 'x') return toggleAuto();
      if (fightKey(ev.key)) ev.preventDefault();
      return;
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      $('chatinput').focus();
      return;
    }
    const dir = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[ev.key];
    if (!dir) return;
    ev.preventDefault();
    const me = G.self();
    requestMove(me.x + dir[0], me.y + dir[1]);
  }

  function onChat(ev) {
    ev.preventDefault();
    const input = $('chatinput');
    const text = input.value.trim();
    input.value = '';
    input.blur();
    if (text) window.wealdmark.send({ t: 'chat', text });
  }

  const listeners = [];
  function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    listeners.push(() => target.removeEventListener(type, fn));
  }

  // ---- lifecycle

  // ---- ground, baked once so no two patches of grass look alike
  // Tile ids: 1 grass, 2 flowers, 3 dirt, 4 water, 10 sand, 21 field. A higher rank spreads over a lower one at the seam.
  const GROUND_RANK = { 4: 0, 10: 1, 3: 2, 21: 2, 1: 3, 2: 3 };
  const BLEND_ODDS = [0.85, 0.55, 0.3, 0.12];

  function hash2(x, y, s) {
    let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1274126177)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  /** Smooth value noise: neighbouring pixels agree, so the ground drifts in broad light and dark patches. */
  function smooth(x, y, s, cell) {
    const gx = Math.floor(x / cell);
    const gy = Math.floor(y / cell);
    const fx = x / cell - gx;
    const fy = y / cell - gy;
    const a = hash2(gx, gy, s);
    const b = hash2(gx + 1, gy, s);
    const c = hash2(gx, gy + 1, s);
    const d = hash2(gx + 1, gy + 1, s);
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }

  function bakeGround(map, tileset) {
    const cols = map.tileset.columns;
    const W = map.width * TILE;
    const H = map.height * TILE;
    const tmp = document.createElement('canvas');
    tmp.width = tileset.width;
    tmp.height = tileset.height;
    const tctx = tmp.getContext('2d');
    tctx.drawImage(tileset, 0, 0);
    const sd = tctx.getImageData(0, 0, tmp.width, tmp.height).data;
    const sw = tmp.width;
    const out = new ImageData(W, H);
    const od = out.data;
    const gid = (x, y) => (x < 0 || y < 0 || x >= map.width || y >= map.height ? 0 : map.layers.ground[y * map.width + x]);
    const texel = (id, px, py) => {
      const i = id - 1;
      return ((Math.floor(i / cols) * TILE + py) * sw + (i % cols) * TILE + px) * 4;
    };
    const put = (wx, wy, r, g, b) => {
      if (wx < 0 || wy < 0 || wx >= W || wy >= H) return;
      const o = (wy * W + wx) * 4;
      od[o] = r;
      od[o + 1] = g;
      od[o + 2] = b;
      od[o + 3] = 255;
    };

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const id = gid(x, y);
        if (!id) continue;
        const rank = GROUND_RANK[id];
        const nb = [[0, -1], [0, 1], [-1, 0], [1, 0]].map(([dx, dy]) => {
          const n = gid(x + dx, y + dy);
          return n !== id && GROUND_RANK[n] !== undefined && rank !== undefined && GROUND_RANK[n] > rank ? n : 0;
        });
        for (let py = 0; py < TILE; py++) {
          for (let px = 0; px < TILE; px++) {
            const wx = x * TILE + px;
            const wy = y * TILE + py;
            let src = id;
            if (rank !== undefined) {
              const dist = [py, TILE - 1 - py, px, TILE - 1 - px];
              for (let k = 0; k < 4; k++) {
                if (nb[k] && dist[k] < BLEND_ODDS.length && hash2(wx, wy, 77 + k) < BLEND_ODDS[dist[k]]) {
                  src = nb[k];
                  break;
                }
              }
            }
            const o = texel(src, px, py);
            let r = sd[o];
            let g = sd[o + 1];
            let b = sd[o + 2];
            if (rank !== undefined) {
              const f = 0.9 + 0.2 * smooth(wx, wy, 11, 10) + (hash2(wx, wy, 12) - 0.5) * 0.04;
              r *= f;
              g *= f;
              b *= f;
            } else {
              const f = 0.97 + 0.06 * smooth(wx, wy, 13, 6);
              r *= f;
              g *= f;
              b *= f;
            }
            put(wx, wy, Math.min(255, r), Math.min(255, g), Math.min(255, b));
          }
        }
        // Small things lying on the ground
        const h = hash2(x, y, 31);
        const tx = 2 + Math.floor(hash2(x, y, 32) * 12);
        const ty = 3 + Math.floor(hash2(x, y, 33) * 10);
        const wx = x * TILE + tx;
        const wy = y * TILE + ty;
        if (id === 1 && h < 0.24) {
          put(wx, wy, 52, 100, 44);
          put(wx, wy - 1, 112, 168, 72);
          put(wx - 1, wy - 1, 132, 180, 82);
          put(wx + 1, wy - 1, 132, 180, 82);
        } else if ((id === 1 && h < 0.29) || (id === 3 && h < 0.3) || (id === 10 && h < 0.12)) {
          put(wx, wy, 156, 150, 138);
          put(wx + 1, wy, 176, 170, 156);
          put(wx, wy + 1, 98, 92, 84);
          put(wx + 1, wy + 1, 98, 92, 84);
        }
      }
    }

    // Soft shadows under trees, bushes and crates
    const shade = (cx, cy, rx, ry, k) => {
      for (let wy = Math.floor(cy - ry); wy <= Math.ceil(cy + ry); wy++) {
        for (let wx = Math.floor(cx - rx); wx <= Math.ceil(cx + rx); wx++) {
          if (wx < 0 || wy < 0 || wx >= W || wy >= H) continue;
          const d = ((wx - cx) / rx) ** 2 + ((wy - cy) / ry) ** 2;
          if (d >= 1) continue;
          if (gid(Math.floor(wx / TILE), Math.floor(wy / TILE)) === 4) continue;
          const m = 1 - k * (1 - d);
          const o = (wy * W + wx) * 4;
          od[o] *= m;
          od[o + 1] *= m;
          od[o + 2] *= m;
        }
      }
    };
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const d = map.layers.decor[y * map.width + x];
        if (d === 5) shade(x * TILE + 8, y * TILE + 14, 7.5, 3, 0.34);
        else if (d === 9) shade(x * TILE + 8, y * TILE + 13, 6, 2.4, 0.28);
        else if (d === 16 || d === 18) shade(x * TILE + 8, y * TILE + 14, 6, 2.2, 0.28);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.getContext('2d').putImageData(out, 0, 0);
    return canvas;
  }

  // ---- intro cutscene, shown once to a new hero
  const INTRO_SLIDES = [
    {
      scene: 'seam',
      title: 'The Welling',
      text: 'In the first days of the Wealdmark the hills were green and the rivers ran clear, and far beneath the roots of the mountains there lay a well that was not of water. Men called it the Welling. Where it seeped upward the soil remembered it: toadstools shone with a cold light, wolves cast two shadows, and the beasts of the wood grew wise or cruel as fortune took them.',
    },
    {
      scene: 'seam',
      title: 'The Crown',
      text: 'Of the men who first came into that country, Eldred the Unbroken was the greatest. He went down alone into the dark places and brought up a splinter of the Welling, and of it he made the Crown. Whoever wore it was king, and the land bent to him, stone and root and beast. He reigned three hundred years and died in his sleep, and men wept, for it seemed that the one fixed star had gone out. But he had looked into the deep longer than any man should, and he feared a darker hand would take the Crown. So he broke its true name into five Seals, and hid each beneath the earth with a guardian set over it. Four hundred years the Seals have slept.',
    },
    {
      scene: 'tower',
      title: 'Harvest Eve',
      text: 'Eleven nights ago, on Harvest Eve, Eadwin the Bright was poisoned and stabbed in the Crown Tower at Aldmoor, and the Crown was lifted from its stand. The guard found black ash upon the stair, and upon the floor a white mask, blank and smooth, with its eyeholes sealed. The city says that his daughter Aelwyn died with him. The city is mistaken.',
    },
    {
      scene: 'masks',
      title: 'The Wan Company',
      text: 'No one has claimed the deed. In the lanes they whisper of the Wan Company: masked folk, mostly the lost and the grieving, who teach that fear and self are all that stand between a man and the gifts of the deep. They have a master, but none can say his face. Warden Osric Ashby, who led the guard thirty years, has buried most of those he trusted.',
    },
    {
      scene: 'road',
      title: 'Aldmoor',
      text: 'You come up the south road at dawn, a stranger whose name no one has troubled to learn. The city holds its breath. The Warden has no need of a hero. He has need of someone the Company has not yet noticed, and that someone is you.',
    },
  ];

  function drawIntroScene(ctx, scene, t) {
    const W = 320;
    const H = 180;
    const dawn = scene === 'road';
    const top = dawn ? [34, 28, 70] : [8, 7, 22];
    const bot = dawn ? [236, 160, 112] : [38, 28, 66];
    for (let y = 0; y < H; y++) {
      const k = y / H;
      ctx.fillStyle = `rgb(${Math.round(top[0] + (bot[0] - top[0]) * k)},${Math.round(top[1] + (bot[1] - top[1]) * k)},${Math.round(top[2] + (bot[2] - top[2]) * k)})`;
      ctx.fillRect(0, y, W, 1);
    }
    for (let i = 0; i < 90; i++) {
      const sx = Math.floor(hash2(i, 1, 70) * W);
      const sy = Math.floor(hash2(i, 2, 70) * H * 0.6);
      const tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
      ctx.fillStyle = `rgba(255,248,224,${dawn ? 0.15 * tw : 0.35 + 0.5 * tw})`;
      ctx.fillRect(sx, sy, 1, 1);
    }
    if (!dawn) {
      ctx.fillStyle = '#e8e4d0';
      ctx.beginPath();
      ctx.arc(256, 34, 12, 0, 7);
      ctx.fill();
      ctx.fillStyle = 'rgba(8,7,22,0.35)';
      ctx.beginPath();
      ctx.arc(251, 31, 10, 0, 7);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,230,160,0.9)';
      ctx.beginPath();
      ctx.arc(70, 118, 16, 0, 7);
      ctx.fill();
    }
    const hills = (base, amp, freq, color, phase) => {
      ctx.fillStyle = color;
      for (let x = 0; x < W; x++) ctx.fillRect(x, Math.round(base + Math.sin(x / freq + phase) * amp + Math.sin(x / (freq * 0.37) + phase * 2) * amp * 0.3), 1, H);
    };
    if (scene === 'seam') {
      hills(104, 14, 22, '#1c1a3a', 0);
      hills(128, 10, 16, '#121028', 2);
      const pulse = 0.55 + 0.45 * Math.sin(t * 1.6);
      for (let i = 0; i < 30; i++) {
        const x = 150 + Math.round(Math.sin(i * 0.9) * 6);
        ctx.fillStyle = `rgba(90,220,230,${(0.5 + 0.4 * pulse) * (1 - i / 36)})`;
        ctx.fillRect(x, 130 + i, 2, 1);
        ctx.fillStyle = `rgba(90,220,230,${0.08 * pulse})`;
        ctx.fillRect(x - 6, 130 + i, 14, 1);
      }
      const cy = 78 + Math.round(Math.sin(t * 1.4) * 3);
      ctx.fillStyle = '#f4cf5c';
      ctx.fillRect(148, cy + 6, 14, 4);
      for (const dx of [148, 153, 160]) ctx.fillRect(dx, cy, 2, 7);
      ctx.fillStyle = '#fff0a0';
      ctx.fillRect(149, cy + 6, 12, 1);
      const glow = ctx.createRadialGradient(155, cy + 5, 2, 155, cy + 5, 34);
      glow.addColorStop(0, `rgba(244,207,92,${0.35 * pulse})`);
      glow.addColorStop(1, 'rgba(244,207,92,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(110, cy - 30, 90, 70);
    } else if (scene === 'tower') {
      hills(138, 5, 30, '#14122c', 1);
      for (let i = 0; i < 14; i++) {
        const bx = 8 + i * 22;
        const bh = 20 + Math.floor(hash2(i, 3, 71) * 26);
        ctx.fillStyle = '#0e0c20';
        ctx.fillRect(bx, 150 - bh, 18, bh + 30);
        ctx.fillStyle = `rgba(244,196,96,${0.4 + 0.3 * Math.sin(t * 3 + i * 2)})`;
        if (hash2(i, 4, 71) > 0.4) ctx.fillRect(bx + 5, 150 - bh + 8, 3, 3);
      }
      ctx.fillStyle = '#0a0818';
      ctx.fillRect(138, 40, 44, 150);
      for (let j = 0; j < 14; j++) ctx.fillRect(146 + j, 40 - j, 28 - j * 2 > 0 ? 28 - j * 2 : 0, 1);
      ctx.fillRect(158, 14, 4, 12);
      for (const [wx, wy] of [[150, 60], [166, 60], [150, 90], [166, 90], [158, 120]]) {
        ctx.fillStyle = `rgba(250,206,110,${0.55 + 0.35 * Math.sin(t * 5 + wx + wy)})`;
        ctx.fillRect(wx, wy, 4, 8);
      }
      ctx.fillStyle = 'rgba(30,28,36,0.9)';
      for (let i = 0; i < 46; i++) {
        const ax = (hash2(i, 5, 72) * W + t * 6 * (0.5 + hash2(i, 6, 72))) % W;
        const ay = (hash2(i, 7, 72) * H + t * 14 * (0.5 + hash2(i, 8, 72))) % H;
        ctx.fillRect(Math.floor(ax), Math.floor(ay), 1, 1);
      }
    } else if (scene === 'masks') {
      hills(140, 4, 28, '#0f0d22', 0);
      ctx.fillStyle = 'rgba(120,110,160,0.18)';
      for (let i = 0; i < 6; i++) ctx.fillRect(0, 128 + i * 8 + Math.round(Math.sin(t + i) * 2), W, 5);
      const figures = [[70, 0.8], [110, 0.9], [160, 1.25], [210, 0.9], [250, 0.8]];
      for (const [fx, sc] of figures) {
        const sway = Math.round(Math.sin(t * 1.2 + fx) * 1.5);
        const h = Math.round(64 * sc);
        ctx.fillStyle = '#07060f';
        for (let j = 0; j < h; j++) {
          const w = Math.round((6 + j * 0.32) * sc);
          ctx.fillRect(fx - Math.floor(w / 2) + sway * (1 - j / h), 160 - h + j, w, 1);
        }
        ctx.fillStyle = '#f2f0ea';
        ctx.beginPath();
        ctx.ellipse(fx + sway, 160 - h + 6 * sc, 4.2 * sc, 5.4 * sc, 0, 0, 7);
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(fx + sway, 160 - h + 2 * sc, 1, Math.round(8 * sc));
      }
    } else {
      hills(122, 10, 40, '#3a3a5c', 0);
      hills(140, 8, 26, '#26324a', 1);
      ctx.fillStyle = '#1a2036';
      ctx.fillRect(206, 104, 70, 30);
      for (let i = 0; i < 7; i++) ctx.fillRect(206 + i * 11, 100, 6, 4);
      ctx.fillRect(236, 70, 10, 36);
      for (let j = 0; j < 7; j++) ctx.fillRect(237 + j, 70 - j, Math.max(0, 8 - j * 2), 1);
      ctx.fillStyle = 'rgba(250,206,110,0.8)';
      ctx.fillRect(240, 84, 2, 5);
      hills(150, 5, 18, '#1e2a3c', 3);
      ctx.fillStyle = '#9a8460';
      for (let y = 134; y < H; y++) {
        const k = (y - 134) / (H - 134);
        const w = 6 + k * 70;
        const cx = 160 + (1 - k) * 60 - k * 20;
        ctx.fillRect(Math.round(cx - w / 2), y, Math.round(w), 1);
      }
      const k = (Math.sin(t * 0.5) * 0.5 + 0.5) * 0.4 + 0.45;
      const hx = Math.round(160 + (1 - k) * 60 - k * 20);
      const hy = Math.round(134 + k * (H - 134));
      ctx.fillStyle = '#0c0a14';
      ctx.fillRect(hx - 2, hy - 12, 4, 8);
      ctx.fillRect(hx - 3, hy - 14, 6, 3);
      ctx.fillRect(hx - 3, hy - 5 + (Math.floor(t * 4) % 2), 2, 5);
      ctx.fillRect(hx + 1, hy - 5 + ((Math.floor(t * 4) + 1) % 2), 2, 5);
    }
  }

  function playIntro(done) {
    const box = $('intro');
    const canvas = $('intro-canvas');
    const textEl = $('intro-text');
    const titleEl = $('intro-title');
    const ctx = canvas.getContext('2d');
    let index = 0;
    let chars = 0;
    let last = performance.now();
    let raf = 0;
    let over = false;
    box.classList.remove('hidden');

    const finish = () => {
      if (over) return;
      over = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey, true);
      box.removeEventListener('click', advance);
      $('intro-skip').removeEventListener('click', skip);
      box.classList.add('hidden');
      done();
    };
    const skip = (e) => {
      if (e) e.stopPropagation();
      finish();
    };
    const advance = () => {
      const slide = INTRO_SLIDES[index];
      if (chars < slide.text.length) {
        chars = slide.text.length;
        return;
      }
      index++;
      chars = 0;
      if (index >= INTRO_SLIDES.length) finish();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        finish();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        advance();
      }
    };
    const tick = (now) => {
      if (over) return;
      const slide = INTRO_SLIDES[index];
      chars = Math.min(slide.text.length, chars + ((now - last) / 1000) * 46);
      last = now;
      drawIntroScene(ctx, slide.scene, now / 1000);
      titleEl.textContent = slide.title;
      textEl.textContent = slide.text.slice(0, Math.floor(chars));
      $('intro-hint').textContent = chars >= slide.text.length ? (index === INTRO_SLIDES.length - 1 ? 'Space to begin' : 'Space to continue') : 'Space to read faster';
      raf = requestAnimationFrame(tick);
    };
    document.addEventListener('keydown', onKey, true);
    box.addEventListener('click', advance);
    $('intro-skip').addEventListener('click', skip);
    raf = requestAnimationFrame(tick);
  }

  /** Soft ground shadows under standing scenery: [half width, half height, lean to the right], in tiles. */
  const DECOR_SHADOW = { 5: [0.46, 0.13, 0.08], 23: [0.3, 0.1, 0.08], 24: [0.3, 0.1, 0.08], 9: [0.4, 0.11, 0.05], 18: [0.4, 0.12, 0.06], 25: [0.3, 0.09, 0.04], 16: [0.4, 0.1, 0.05], 20: [0.42, 0.11, 0.05], 15: [0.46, 0.12, 0.05], 28: [0.42, 0.09, 0.05], 17: [0.2, 0.07, 0.08], 14: [0.5, 0.14, 0.04], 22: [0.44, 0.11, 0.05], 29: [0.26, 0.08, 0.05] };

  // ---- buildings: painted roofs and fronts, drawn over the walled rooms
  const ROOFS = [[200, 74, 84], [102, 138, 176], [200, 108, 54], [92, 148, 100], [140, 106, 168], [60, 142, 150], [120, 120, 130], [214, 170, 70]];

  /** A building is a ring of wall tiles around a plank or carpet floor. Roofs hide when you step inside. */
  function findBuildings(map) {
    const W = map.width;
    const H = map.height;
    const g = map.layers.ground;
    const seen = new Uint8Array(W * H);
    const out = [];
    for (let sy = 0; sy < H; sy++) {
      for (let sx = 0; sx < W; sx++) {
        if (g[sy * W + sx] !== 6 || seen[sy * W + sx]) continue;
        let x0 = sx;
        let x1 = sx;
        let y0 = sy;
        let y1 = sy;
        const stack = [[sx, sy]];
        seen[sy * W + sx] = 1;
        while (stack.length) {
          const [x, y] = stack.pop();
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen[ny * W + nx] || g[ny * W + nx] !== 6) continue;
            seen[ny * W + nx] = 1;
            stack.push([nx, ny]);
          }
        }
        const w = x1 - x0 + 1;
        const h = y1 - y0 + 1;
        if (w < 5 || h < 5 || w > 20 || h > 16) continue;
        let floor = 0;
        for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++) if (g[y * W + x] === 11 || g[y * W + x] === 13) floor++;
        if (floor < (w - 2) * (h - 2) * 0.6) continue;
        const doors = [];
        for (let x = x0; x <= x1; x++) for (const y of [y0, y1]) if (g[y * W + x] !== 6) doors.push({ x, y });
        for (let y = y0 + 1; y < y1; y++) for (const x of [x0, x1]) if (g[y * W + x] !== 6) doors.push({ x, y });
        if (!doors.length) continue;
        const b = { x0, y0, x1, y1, doors, alpha: 1, color: ROOFS[Math.floor(hash2(x0, y0, 55) * ROOFS.length)] };
        b.sprite = paintBuilding(b);
        out.push(b);
      }
    }
    return out;
  }

  /** The sprite reaches past the footprint: eaves 4px out on three sides, and a cast shadow 5px out on the other two. */
  const EAVE = 4;
  const CAST = 5;

  function paintBuilding(b) {
    const w = (b.x1 - b.x0 + 1) * TILE;
    const h = (b.y1 - b.y0 + 1) * TILE;
    const roofH = h - TILE;
    const cw = EAVE + w + Math.max(EAVE, CAST);
    const ch = EAVE + h + CAST;
    const img = new ImageData(cw, ch);
    const d = img.data;
    const door = new Set(b.doors.map((p) => `${p.x - b.x0},${p.y - b.y0}`));
    const put = (u, v, r, g, bl, a = 255) => {
      const cu = u + EAVE;
      const cv = v + EAVE;
      if (cu < 0 || cv < 0 || cu >= cw || cv >= ch) return;
      const o = (cv * cw + cu) * 4;
      d[o] = Math.max(0, Math.min(255, r));
      d[o + 1] = Math.max(0, Math.min(255, g));
      d[o + 2] = Math.max(0, Math.min(255, bl));
      d[o + 3] = a;
    };
    const [cr, cg, cb] = b.color;
    // Roof geometry in sprite-local pixels (u, v from the footprint's top left). The roof spans EAVE past the footprint on three sides.
    const RW = w + 2 * EAVE;
    const RH = roofH + EAVE;
    const rr = Math.round(RH * 0.34);
    const hip = Math.min(RH * 0.55, RW / 2.6);

    // Shadow first, so the building paints over it.
    for (let v = CAST; v < h + CAST; v++) {
      for (let u = CAST; u < w + CAST; u++) {
        if (u < w && v < h) continue;
        put(u, v, 20, 24, 12, 78);
      }
    }

    // Roof: back slope, ridge, front slope, two hips.
    for (let rv = 0; rv < RH; rv++) {
      for (let ru = 0; ru < RW; ru++) {
        const u = ru - EAVE;
        const v = rv - EAVE;
        const row = Math.floor(rv / 4);
        const off = (row % 2) * 4;
        const col = Math.floor((ru + off) / 8);
        let k = 0.9 + hash2(col, row, 56) * 0.2;
        if (rv % 4 === 0) k += 0.12;
        if (rv % 4 === 3 || (ru + off) % 8 === 7) k -= 0.2;
        const dd = rv < rr ? (rr - rv) / rr : (rv - rr) / Math.max(1, RH - 1 - rr);
        const left = ru < hip * (1 - dd);
        const right = ru > RW - 1 - hip * (1 - dd);
        if (left) k *= 0.86;
        else if (right) k *= 0.6;
        else if (rv < rr) k *= 0.72;
        // Ridge cap and hip lines catch the light.
        if (!left && !right && Math.abs(rv - rr) <= 1) k = rv === rr ? 1.5 : 1.28;
        else if (left !== (ru < hip * (1 - dd) + 1.4) || right !== (ru > RW - 1 - hip * (1 - dd) - 1.4)) k += 0.3;
        // Eave edge: a dark lip, and the underside shadow falls on the wall below.
        if (rv >= RH - 2) k = 0.42;
        else if (rv >= RH - 5) k -= 0.1 * (rv - (RH - 6));
        if (ru === 0 || ru === RW - 1 || rv === 0) k = 0.4;
        put(u, v, cr * k, cg * k, cb * k);
      }
    }

    // Front wall: a plank base, a window row, and the eave shadow along the top.
    for (let v = roofH; v < h; v++) {
      for (let u = 0; u < w; u++) {
        const tx = Math.floor(u / TILE);
        const ty = Math.floor(v / TILE);
        const fy = v - roofH;
        if (door.has(`${tx},${ty}`)) {
          const tu = u % TILE;
          if (fy < 3) put(u, v, 96, 62, 36);
          else if (tu < 2 || tu > 13) put(u, v, 120, 80, 46);
          continue;
        }
        const tu = u % TILE;
        const win = tx % 3 === 1 && tu >= 4 && tu <= 11 && fy >= 4 && fy <= 10;
        if (fy < 4) {
          const t = 1 - fy * 0.18;
          put(u, v, 70 * t, 48 * t, 34 * t);
        } else if (fy >= 13) put(u, v, 118 + hash2(u, v, 57) * 20, 106 + hash2(u, v, 57) * 18, 94);
        else if (win) {
          const frame = tu === 4 || tu === 11 || fy === 4 || fy === 10;
          const mull = tu === 7 || tu === 8 || fy === 7;
          if (frame) put(u, v, 250, 243, 221);
          else if (mull) put(u, v, 120, 96, 70);
          else put(u, v, fy < 7 ? 170 : 128, fy < 7 ? 206 : 168, fy < 7 ? 236 : 210);
        } else if (tu === 0 || tu === TILE - 1) put(u, v, 140, 98, 60);
        else {
          const n = hash2(u >> 1, v, 58) * 14;
          const t = fy < 6 ? 0.82 + fy * 0.03 : 1;
          put(u, v, (228 - n) * t, (210 - n) * t, (170 - n) * t);
        }
      }
    }

    // Chimney on the front slope, clear of the hips.
    const cx = Math.floor(w * (0.55 + hash2(b.x0, b.y0, 60) * 0.2));
    if (w >= 6 * TILE && hash2(b.x0, b.y0, 59) > 0.3 && cx > hip + 4 && cx + 10 < w - hip) {
      const top = rr - EAVE - 13;
      for (let v = top; v < rr - EAVE + 7; v++) {
        for (let u = cx; u < cx + 9; u++) {
          const brick = (v + (Math.floor((v - top) / 3) % 2) * 3) % 6 === 0 || (u - cx + (Math.floor((v - top) / 3) % 2) * 2) % 4 === 0;
          let r = 150;
          let g = 88;
          let bl = 70;
          if (u >= cx + 6) {
            r = 112;
            g = 62;
            bl = 52;
          }
          if (brick) {
            r -= 24;
            g -= 16;
            bl -= 14;
          }
          if (v < top + 3) {
            r = 96;
            g = 96;
            bl = 104;
            if (u === cx || u === cx + 8) r = g = bl = 70;
          }
          put(u, v, r, g, bl);
        }
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    canvas.getContext('2d').putImageData(img, 0, 0);
    return canvas;
  }

  /** Fade each roof out while the hero stands inside, and draw it over everything else. */
  function drawRoofs(ctx, offX, offY, px) {
    if (!G.buildings) return;
    const me = G.self();
    const mx = Math.round(me.x);
    const my = Math.round(me.y);
    for (const b of G.buildings) {
      const inside = mx > b.x0 && mx < b.x1 && my > b.y0 && my < b.y1;
      b.alpha += ((inside ? 0 : 1) - b.alpha) * 0.18;
      if (b.alpha < 0.03) continue;
      ctx.globalAlpha = b.alpha;
      const sc = px / TILE;
      ctx.drawImage(b.sprite, offX + b.x0 * px - EAVE * sc, offY + b.y0 * px - EAVE * sc, b.sprite.width * sc, b.sprite.height * sc);
    }
    ctx.globalAlpha = 1;
  }

  const roofed = (x, y) => !!G.buildings && G.buildings.some((b) => b.alpha > 0.5 && x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1);

  // ---- what is under the mouse
  const TILE_INFO = {
    decor: {
      5: ['Oak tree', 'Scenery. Trees you can chop show their name when you stand close.'],
      23: ['Pine tree', 'Scenery. Tall, dark and narrow.'],
      24: ['Birch tree', 'Scenery. Pale trunk, light leaves.'],
      9: ['Bush', 'Blocks the way.'],
      16: ['Crate', 'Blocks the way.'],
      18: ['Boulder', 'Blocks the way.'],
      19: ['Fence', 'Blocks the way.'],
      20: ['Hay bale', 'Blocks the way.'],
      22: ['Ruined wall', 'Old stonework. Blocks the way.'],
      17: ['Lamp post', 'Blocks the way.'],
      12: ['Town gate', 'The way in and out of the city.'],
      14: ['Fountain', 'Blocks the way.'],
      15: ['Market stall', 'Blocks the way.'],
      25: ['Tree stump', 'Blocks the way.'],
      26: ['Mushrooms', 'Red caps. Not for eating.'],
      27: ['Tall grass', 'You can walk through it.'],
      28: ['Bench', 'Blocks the way.'],
      29: ['Signpost', 'Points the way.'],
    },
    ground: {
      4: ['Water', "You can't walk here. Fishing shoals show in it."],
      6: ['Wall', 'Stone and timber. Blocks the way.'],
      10: ['Sand', ''],
      3: ['Dirt path', ''],
      7: ['Cobblestones', ''],
      11: ['Wooden floor', ''],
      13: ['Carpet', ''],
      21: ['Farm field', ''],
    },
  };

  function tipFor(t) {
    const map = G.map;
    if (t.x < 0 || t.y < 0 || t.x >= map.width || t.y >= map.height) return null;
    const e = [...G.entities.values()].find((x) => x.id !== G.selfId && Math.round(x.x) === t.x && Math.round(x.y) === t.y && !roofed(t.x, t.y));
    if (e) {
      if (e.kind === 'monster') {
        const def = G.data && G.data.monsters.get(e.mon);
        const tag = def && def.boss ? 'Boss' : def && def.miniboss ? 'Miniboss' : 'Monster';
        return [`${e.name}, level ${e.level}`, foeNote(e.level), tag + (def ? `. ${def.maxHp} health, hits up to ${def.maxHit}.` : '.'), e.fight ? 'Busy fighting.' : 'Click to fight.'];
      }
      if (e.kind === 'npc') {
        const npc = G.data && G.data.npcs.get(e.ref);
        return [e.name, npc ? npc.role : 'Townsperson', 'Click to talk.'];
      }
      if (e.kind === 'node') {
        const def = G.data && G.data.nodes.get(e.ref);
        if (!def) return [e.name];
        const have = skillLevel(def.skill);
        const ok = have >= def.level;
        return [e.name, `${SKILL_LABEL[def.skill] || pretty(def.skill)} level ${def.level}. You have ${have}.`, e.depleted ? 'Depleted. It will grow back soon.' : ok ? 'Click to gather.' : 'Your skill level is too low.'];
      }
      if (e.kind === 'station') return [e.name, 'Click to use.'];
      return [e.name, `Level ${e.level}`];
    }
    const dec = TILE_INFO.decor[map.layers.decor[t.y * map.width + t.x]];
    if (dec) return dec;
    const gr = TILE_INFO.ground[map.layers.ground[t.y * map.width + t.x]];
    if (gr && (map.layers.ground[t.y * map.width + t.x] === 4 || map.layers.ground[t.y * map.width + t.x] === 6)) return gr;
    return null;
  }

  function updateTip() {
    const tip = G && G.tip;
    if (!tip) return;
    const info = G.mouse && !G.modal && !G.fight && G.hover ? tipFor(G.hover) : null;
    if (!info) {
      tip.classList.add('hidden');
      return;
    }
    tip.textContent = '';
    info.forEach((line, i) => {
      if (!line) return;
      const row = document.createElement('div');
      row.className = i === 0 ? 'tip-title' : 'tip-line';
      row.textContent = line;
      tip.appendChild(row);
    });
    tip.classList.remove('hidden');
    const box = G.canvas.getBoundingClientRect();
    const z = uiScale();
    const left = Math.min((G.mouse.x - box.left) / z + 16, box.width / z - tip.offsetWidth - 6);
    const top = Math.min((G.mouse.y - box.top) / z + 16, box.height / z - tip.offsetHeight - 6);
    tip.style.left = `${Math.max(4, left)}px`;
    tip.style.top = `${Math.max(4, top)}px`;
  }

  async function start(welcome, map) {
    const img = new Image();
    const url = await window.wealdmark.readImage(map.tileset.image);
    if (!url) throw new Error('missing_tileset');
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('bad_tileset'));
      img.src = url;
    });
    const data = await window.wealdmark.data();
    let ground = null;
    try {
      ground = bakeGround(map, img);
    } catch (e) {
      console.warn('ground bake failed, drawing plain tiles', e);
    }

    let buildings = [];
    try {
      buildings = findBuildings(map);
    } catch (e) {
      console.warn('buildings failed', e);
    }
    const tip = document.createElement('div');
    tip.id = 'hover-tip';
    tip.className = 'hidden';
    $('stage').parentElement.appendChild(tip);
    if (!$('node-menu')) {
      const menu = document.createElement('div');
      menu.id = 'node-menu';
      menu.className = 'hidden';
      $('stage').parentElement.appendChild(menu);
    }

    const canvas = $('stage');
    const now = performance.now();
    G = {
      canvas,
      ctx: canvas.getContext('2d'),
      map,
      tileset: img,
      ground,
      buildings,
      tip,
      mouse: null,
      loot: { fight: null, box: null },
      tickMs: welcome.tickMs,
      selfId: welcome.you.id,
      entities: new Map(),
      data: data ? {
        items: new Map(data.items.map((i) => [i.id, i])),
        monsters: new Map(data.monsters.map((m) => [m.id, m])),
        npcs: new Map((data.npcs || []).map((n) => [n.id, n])),
        shops: new Map((data.shops || []).map((n) => [n.id, n])),
        nodes: new Map((data.nodes || []).map((n) => [n.id, n])),
        stations: new Map((data.stations || []).map((n) => [n.id, n])),
        recipes: new Map((data.recipes || []).map((n) => [n.id, n])),
        quests: new Map((data.quests || []).map((n) => [n.id, n])),
        mods: data.mods || {},
        trees: data.trees || [],
      } : null,
      town: null,
      storage: null,
      perks: null,
      quests: null,
      busy: null,
      stats: null,
      inv: null,
      fight: null,
      floaters: [],
      shots: [],
      modal: false,
      scale: 3,
      zoom: loadZoom(),
      off: { x: 0, y: 0 },
      hover: null,
      dest: null,
      hudAt: 0,
      raf: 0,
      self() {
        return this.entities.get(this.selfId);
      },
    };
    G.entities.set(welcome.you.id, makeEntity(welcome.you, now));
    for (const v of welcome.entities) G.entities.set(v.id, makeEntity(v, now));
    $('chatlog').textContent = '';
    addLog('You enter ' + map.name + '.');
    setupSound();

    on(canvas, 'mousemove', onMouseMove);
    on(canvas, 'mouseleave', () => {
      if (!G) return;
      G.mouse = null;
      updateTip();
    });
    on(canvas, 'click', onClick);
    setupTouch(canvas);
    on(canvas, 'wheel', (ev) => {
      ev.preventDefault();
      setZoom(G.zoom + (ev.deltaY < 0 ? 1 : -1));
    }, { passive: false });
    on(window, 'keydown', onKey);
    on($('chatform'), 'submit', onChat);
    setupChat();
    setupCorner();
    setupTips();
    on($('menu-btn'), 'click', (ev) => {
      ev.stopPropagation();
      $('menu-list').classList.toggle('hidden');
    });
    // Picking an entry, or clicking anywhere else, folds the menu back up.
    on($('menu-list'), 'click', () => $('menu-list').classList.add('hidden'));
    for (const gb of document.querySelectorAll('.grp-btn')) {
      on(gb, 'click', (ev) => {
        ev.stopPropagation();
        const grp = gb.parentElement;
        const was = grp.classList.contains('open');
        for (const o of document.querySelectorAll('.grp.open')) o.classList.remove('open');
        if (!was) grp.classList.add('open');
      });
    }
    on($('menu-list'), 'click', () => { for (const o of document.querySelectorAll('.grp.open')) o.classList.remove('open'); });
    on(document, 'pointerdown', (ev) => {
      if (!ev.target.closest('.grp')) for (const o of document.querySelectorAll('.grp.open')) o.classList.remove('open');
    });
    on(document, 'pointerdown', (ev) => {
      if (!ev.target.closest('#toolbar')) $('menu-list').classList.add('hidden');
    });
    on($('btn-trades'), 'click', () => togglePanel('panel-trades'));
    on($('auto-btn'), 'click', toggleAuto);
    setupBar();
    on($('bc-no'), 'click', closeBuyConfirm);
    on($('bc-yes'), 'click', () => {
      const pending = G.buyPending;
      closeBuyConfirm();
      if (pending) window.wealdmark.send({ t: 'buy', item: pending.item, qty: pending.qty });
    });
    setupWindows();
    on($('btn-skills'), 'click', () => togglePanel('panel-skills'));
    on($('btn-bag'), 'click', () => togglePanel('panel-bag'));
    on($('btn-equip'), 'click', () => togglePanel('panel-equip'));
    on($('btn-stats'), 'click', () => togglePanel('panel-stats'));
    on($('btn-sound'), 'click', () => togglePanel('panel-sound'));
    on($('btn-party'), 'click', () => {
      togglePanel('panel-party');
      renderParty();
    });
    on($('btn-dungeon'), 'click', () => {
      togglePanel('panel-dungeon');
      renderDungeon();
    });
    on($('party-invite'), 'click', inviteFromBox);
    on($('party-name'), 'keydown', (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Enter') inviteFromBox();
    });
    on($('busy'), 'click', () => window.wealdmark.send({ t: 'stop' }));
    on($('btn-merc'), 'click', () => {
      togglePanel('panel-merc');
      renderMerc();
    });
    on($('btn-loot'), 'click', () => {
      if ($('panel-loot').classList.contains('hidden')) openLootWindow();
      else hideLoot();
    });
    on($('loot-all'), 'click', () => window.wealdmark.send({ t: 'loot', op: 'all', pool: G.lootView || 'fight' }));
    on($('btn-journal'), 'click', () => {
      togglePanel('panel-journal');
      renderJournal();
    });
    for (const id of ['shop-close', 'storage-close', 'station-close', 'perks-close', 'anchor-close']) on($(id), 'click', () => closeTown(true));
    on($('btn-town'), 'click', goToTown);
    on($('q-town'), 'click', goToTown);
    on($('btn-look'), 'click', () => {
      togglePanel('panel-look');
      renderLook();
    });
    buildLookPanel();
    on($('vol-master'), 'input', (e) => window.wealdmarkAudio.set('master', e.target.value));
    on($('vol-sfx'), 'input', (e) => window.wealdmarkAudio.set('sfx', e.target.value));
    on($('vol-music'), 'input', (e) => window.wealdmarkAudio.set('music', e.target.value));
    on($('mute'), 'change', (e) => window.wealdmarkAudio.set('muted', e.target.checked));
    on($('hide-others'), 'change', (e) => {
      hideOthers.on = e.target.checked;
      try {
        localStorage.setItem('wealdmark.hideOthers', hideOthers.on ? '1' : '0');
      } catch {
        // blocked storage: the choice lasts this visit
      }
    });

    for (const m of early.splice(0)) handle(m);
    if (welcome.intro) {
      playIntro(() => {
        window.wealdmark.send({ t: 'intro_done' });
        toast('Talk to Reeve Ivy Penn near the bellstone to learn the basics.');
      });
    }
    G.raf = requestAnimationFrame(frame);
    G.ping = setInterval(() => window.wealdmark.send({ t: 'ping', n: Math.floor(performance.now()) }), 15000);
  }

  function stop() {
    if (!G) return;
    cancelAnimationFrame(G.raf);
    clearInterval(G.ping);
    if (window.wealdmarkAudio) window.wealdmarkAudio.music(null);
    for (const off of listeners.splice(0)) off();
    openOrder.length = 0;
    for (const p of [...PANELS, ...TOWN_PANELS, 'turns', 'fightbar', 'busy']) $(p).classList.add('hidden');
    G = null;
    early.length = 0;
  }

  /** A read-only view of the game for tests and debugging. */
  function debug() {
    if (!G) return null;
    return {
      fighting: Boolean(G.fight),
      myTurn: isMyTurn(),
      animating: Boolean(G.fight && (G.fight.queue.length || G.fight.pending)),
      round: G.fight ? G.fight.round : 0,
      marks: G.fight ? G.fight.marks || [] : [],
      reachTiles: G.fight && G.fight.options ? G.fight.options.reach : [],
      hero: G.fight && hero() ? { hp: hero().hp, maxHp: hero().maxHp, mana: hero().mana, pos: hero().pos } : null,
      enemies: G.fight ? [...G.fight.actors.values()].filter((a) => a.side === 'enemy').map((a) => ({ id: a.id, name: a.name, hp: a.hp, alive: a.alive, pos: a.pos })) : [],
      stats: G.stats,
      inventory: G.inv,
      modal: G.modal,
      town: townOpen() ? G.town : null,
      busy: G.busy,
      quests: G.quests,
      storage: G.storage,
      entities: [...G.entities.values()].map((e) => ({ id: e.id, name: e.name, kind: e.kind, ref: e.ref, depleted: e.depleted, x: e.x, y: e.y, fight: e.fight })),
      scale: G.scale,
      zoom: G.zoom,
      options: G.fight && G.fight.options ? { moveLeft: G.fight.options.moveLeft, acted: G.fight.options.acted, canSwap: G.fight.options.canSwap, selected: G.fight.selected, titles: [...document.querySelectorAll('#actions button')].map((b) => b.title), abilities: G.fight.options.abilities.map((a) => a.id), reach: G.fight.options.reach.length } : null,
    };
  }

  /** Where a tile's centre is on screen, for tests that click on tiles. */
  function tileCenter(x, y) {
    if (!G) return null;
    const rect = G.canvas.getBoundingClientRect();
    const px = TILE * G.scale;
    return { x: rect.left + G.off.x + x * px + px / 2, y: rect.top + G.off.y + y * px + px / 2 };
  }

  window.wealdmarkGame = { start, stop, handle, debug, playIntro, tileCenter, isRunning: () => G !== null };
})();
