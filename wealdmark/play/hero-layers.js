/**
 * Heroes and NPCs drawn from the Kenney Roguelike Characters sheet (CC0).
 * plan() picks the sheet cells for one figure; paint() stacks them on a canvas.
 * Both return null when they cannot dress the figure, and the caller then draws the code art.
 */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const warned = new Set();

  function warnOnce(kind, id) {
    const k = kind + ':' + id;
    if (warned.has(k)) return;
    warned.add(k);
    console.warn('hero-layers: no Kenney cell for ' + kind + ' "' + id + '", using code art');
  }

  /** Which shirt colour fits a cloth colour: 0 orange, 1 teal, 2 purple, 3 green, 4 grey (also for anything unreadable). */
  function clothBucket(color) {
    const m = /^#([0-9a-f]{6})$/i.exec(color || '');
    if (!m) return 0;
    const n = parseInt(m[1], 16);
    const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max - min < 0.12) return 4;
    let h = max === r ? ((g - b) / (max - min)) * 60 : max === g ? (2 + (b - r) / (max - min)) * 60 : (4 + (r - g) / (max - min)) * 60;
    if (h < 0) h += 360;
    if (h < 70 || h >= 330) return 0;
    if (h < 170) return 3;
    if (h < 260) return 1;
    return 2;
  }

  const MASK = 'pickmans_bone_mask';
  const METAL = ['#e8a060', '#c4cad2', '#eef4ff', '#b8e4ff', '#6ae8c0', '#ff7a3a'];
  const TIER_GEM = ['#e04a4a', '#4a8aff', '#4ae080', '#c85aff', '#6affd8', '#ff7a3a'];
  const GEM = { topaz: '#f0b43a', amethyst: '#a860e0', emerald: '#3ac870', ruby: '#e03a4a', sapphire: '#3a78e0' };
  const RARITY_GLINT = ['', '#bcd8ff', '#ffe27a', '#ff9a50'];
  /** Trousers take the colour family of the legs armor: [tint, strength]. */
  const LEG_TINT = { soft: ['#c08a52', 0.28], hard: ['#2a1608', 0.38], chain: ['#aab0bc', 0.5], mithril: ['#6ab8ff', 0.5], skyiron: ['#6ae8c0', 0.5], wyrmplate: ['#ff7a3a', 0.5] };
  const legFamily = (id) => (id ? id.split('_')[0] : '');
  const tierOf = (n) => Math.max(0, Math.min(5, (n | 0) - 1));
  const ringGem = (id, t) => {
    for (const g in GEM) if (id.indexOf(g) >= 0) return GEM[g];
    return TIER_GEM[t];
  };

  /** Held-weapon facts that no longer come from a cell. */
  const weaponCell = (held) => Boolean(held.weapon) && held.weapon !== 'pistol';
  const offCell = (held, cat) => !held.offPistol && Boolean(held.shield) && Boolean(held.oid) && Boolean(cat.shield[held.oid]);

  /**
   * Small pixel sprites for what the sheet has no cell for, in cell coordinates ([x, y, w, h, colour]).
   * torso moves with the chest, face with the head, hand with the arm.
   */
  function overlays(held) {
    const o = { torso: [], face: [], hand: [] };
    if (held.kid) {
      const m = METAL[tierOf(held.kt)];
      o.torso.push([4, 10, 8, 1, '#6a4426'], [4, 11, 8, 1, '#4a2e18'], [7, 10, 2, 2, m], [7, 10, 1, 1, '#ffffff'], [5, 10, 1, 1, '#8a5a34'], [10, 10, 1, 1, '#8a5a34']);
    }
    if (held.aid) {
      const t = tierOf(held.at);
      o.torso.push([6, 6, 4, 1, '#8a7a60'], [7, 7, 2, 2, ringGem(held.aid, t)], [7, 7, 1, 1, '#ffffff']);
    }
    if (held.nid) {
      const t = tierOf(held.nt);
      o.hand.push([0, 11, 2, 1, METAL[t]], [1, 10, 1, 1, ringGem(held.nid, t)]);
    }
    if (held.hid === MASK) {
      o.face.push([5, 2, 6, 6, '#ece4cc'], [5, 2, 6, 1, '#ffffff'], [6, 4, 1, 2, '#1a1426'], [9, 4, 1, 2, '#1a1426'], [7, 6, 2, 1, '#b8ae90'], [5, 7, 1, 1, '#b8ae90'], [10, 7, 1, 1, '#b8ae90'], [7, 4, 2, 1, '#b8ae90']);
    }
    return o;
  }
  const overlayKey = (held) => [held.kid, held.kt, held.aid, held.at, held.nid, held.nt, held.hid === MASK ? 1 : 0, held.lid, held.weapon === 'pistol' ? held.wt : 0, held.offPistol ? 1 : 0].join('/');

  /** A pistol in the hand at (hx, hy), muzzle to the left of the art: [x, y, w, h, colour] in a frame whose origin is the grip. */
  function pistolRects(tier) {
    const m = METAL[tierOf(tier)];
    // Held upright, barrel up: a grip in the fist, the frame above it, and a sight at the muzzle.
    return [[0, -5, 2, 4, m], [0, -5, 1, 4, '#ffffff'], [1, -6, 1, 1, '#3a3a46'], [0, -1, 2, 3, '#6a4020'], [2, -2, 1, 2, '#3a3a46']];
  }

  const tintCache = new Map();
  /** One cell washed with a colour (k is the strength 0 to 1), used for trousers. */
  function tinted(image, cat, cell, color, k) {
    const key = cell[0] + ',' + cell[1] + ',' + color + ',' + k;
    let c = tintCache.get(key);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = c.height = cat.cell;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(image, cell[0] * cat.stride, cell[1] * cat.stride, cat.cell, cat.cell, 0, 0, cat.cell, cat.cell);
    g.globalCompositeOperation = 'source-atop';
    g.globalAlpha = k;
    g.fillStyle = color;
    g.fillRect(0, 0, cat.cell, cat.cell);
    tintCache.set(key, c);
    return c;
  }

  /** Hue and saturation for gear above tier 4: Skyiron is teal, Wyrmforged is ember orange. The sheet has no cells for them, so they recolour the tier 4 art. */
  const TIER_RECOLOR = { 5: [165 / 360, 1], 6: [14 / 360, 1.15] };
  const recolorCache = new Map();

  function hsvToRgb(h, s, v) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
  }

  /** One sheet cell with every pixel moved to the tier's hue. Greys take the metal colour too, so plate stays readable. Null if pixels can't be read. */
  function recolored(image, cat, cell, tier) {
    const spec = TIER_RECOLOR[tier];
    if (!spec) return null;
    const key = cell[0] + ',' + cell[1] + ',' + tier;
    if (recolorCache.has(key)) return recolorCache.get(key);
    let out = null;
    try {
      const c = document.createElement('canvas');
      c.width = c.height = cat.cell;
      const g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.drawImage(image, cell[0] * cat.stride, cell[1] * cat.stride, cat.cell, cat.cell, 0, 0, cat.cell, cat.cell);
      const d = g.getImageData(0, 0, cat.cell, cat.cell);
      const px = d.data;
      for (let i = 0; i < px.length; i += 4) {
        if (px[i + 3] === 0) continue;
        const r = px[i] / 255, gg = px[i + 1] / 255, b = px[i + 2] / 255;
        const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
        const sat = mx === 0 ? 0 : (mx - mn) / mx;
        const [nr, ng, nb] = hsvToRgb(spec[0], sat < 0.12 ? 0.45 : Math.min(1, sat * spec[1]), mx);
        px[i] = nr * 255;
        px[i + 1] = ng * 255;
        px[i + 2] = nb * 255;
      }
      g.putImageData(d, 0, 0);
      out = c;
    } catch (e) {
      out = null;
    }
    recolorCache.set(key, out);
    return out;
  }

  /** The cells for one figure, back to front, or null when any part has no cell. */
  function plan(look, held, catalog) {
    const cat = catalog || root.HERO_CATALOG;
    if (!cat || !look || !held) return null;
    const g = look.g;
    if (g !== 'm' && g !== 'f') return null;
    const body = cat.body[g][look.skinIx];
    const hairs = cat.hair[g];
    if (!body || !hairs || !hairs.length) return null;
    // look() can give a negative hat for a high name hash; the code art reads that as no hat, so do the same.
    const hat = look.hat < 0 ? 0 : look.hat;
    if (!(hat < cat.hat.length)) return null;
    const codeArt = cat.codeArt || [];
    // Weapons with no Kenney shape (the sheet has no guns) keep the code art for the whole figure.
    if (codeArt.indexOf(held.wid) >= 0 || codeArt.indexOf(held.oid) >= 0) return null;
    // Pistols and the bone mask have no cell; they are drawn as overlays on top of the figure.
    const out = [];

    /** Look up an item id in one catalog table. Returns false when the figure must use code art. */
    function item(table, id) {
      if (!id) return true;
      if (codeArt.indexOf(id) >= 0) return false;
      const cell = cat[table][id];
      if (!cell) {
        warnOnce(table, id);
        return false;
      }
      out.push(cell);
      return true;
    }

    out.push(body);
    // The Kenney bodies are bare: always add legs, and a plain shirt where no body armor covers the chest.
    if (cat.legs) out.push(cat.legs);
    if (!held.bid && cat.shirt) out.push(cat.shirt[clothBucket(look.body)]);
    if (!item('armor', held.bid)) return null;
    if (!item('cloak', held.cid)) return null;
    out.push(hairs[(look.hairSeed >>> 0) % hairs.length]);
    if (held.hid) {
      if (held.hid !== MASK && !item('helm', held.hid)) return null;
    } else if (cat.hat[hat]) {
      out.push(cat.hat[hat]);
    }
    if (held.weapon && held.weapon !== 'pistol') {
      const tiers = cat.weapon[held.weapon];
      if (!tiers) {
        warnOnce('weapon', held.weapon);
        return null;
      }
      out.push(tiers[Math.max(1, Math.min(4, held.wt | 0)) - 1]); // tiers 5 and 6 reuse the tier 4 cell; the glint below marks them
    }
    if (!held.offPistol && held.shield && !item('shield', held.oid)) return null;
    return out;
  }

  let img = null;
  let ready = false;
  let failed = false;
  const cache = new Map();

  /** The sheet image once it has loaded; null while it loads or after it failed. Starts the load on first use. */
  let graded = null;
  /**
   * Colour grade for the Kenney sheet so figures sit in the game's violet and gold world:
   * shadows lean violet, highlights lean warm gold, saturation a touch lower. Alpha untouched.
   */
  function grade(image) {
    try {
      const c = document.createElement('canvas');
      c.width = image.width;
      c.height = image.height;
      const g = c.getContext('2d');
      if (typeof g.getImageData !== 'function') return null;
      g.imageSmoothingEnabled = false;
      g.drawImage(image, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height);
      const px = d.data;
      for (let i = 0; i < px.length; i += 4) {
        if (px[i + 3] === 0) continue;
        let r = px[i], gg = px[i + 1], b = px[i + 2];
        const l = (0.3 * r + 0.59 * gg + 0.11 * b) / 255;
        r = l * 255 + (r - l * 255) * 0.9;
        gg = l * 255 + (gg - l * 255) * 0.9;
        b = l * 255 + (b - l * 255) * 0.9;
        if (l < 0.45) {
          const k = 0.3 * (1 - l / 0.45);
          r += (58 - r) * k; gg += (38 - gg) * k; b += (96 - b) * k;
        } else if (l > 0.6) {
          const k = 0.14 * ((l - 0.6) / 0.4);
          r += (255 - r) * k; gg += (214 - gg) * k; b += (140 - b) * k;
        }
        px[i] = Math.max(0, Math.min(255, r));
        px[i + 1] = Math.max(0, Math.min(255, gg));
        px[i + 2] = Math.max(0, Math.min(255, b));
      }
      g.putImageData(d, 0, 0);
      return c;
    } catch (e) {
      return null;
    }
  }

  function sheet(cat) {
    if (failed) return null;
    if (!img) {
      img = new Image();
      img.onload = function () {
        graded = grade(img);
        ready = true;
      };
      img.onerror = function () {
        failed = true;
        console.warn('hero-layers: ' + cat.sheet + ' did not load, using code art');
      };
      img.src = cat.sheet;
    }
    return ready ? graded || img : null;
  }

  /**
   * A 20x20 canvas (the 16 px cell plus a 2 px margin, like the code art) with the figure's layers stacked,
   * or null when it cannot be drawn yet. The sheet has no walk frames: step 1 lifts the figure 1 px, step 2 mirrors the body but not what it holds.
   */
  function paint(look, held, step) {
    const cat = root.HERO_CATALOG;
    const cells = plan(look, held, cat);
    if (!cells) return null;
    const image = sheet(cat);
    if (!image) return null;
    const key = JSON.stringify(cells) + '|' + step + '|' + overlayKey(held) + '|' + (held.best | 0) + '|' + [held.bt, held.ht, held.ct, held.ot, held.wt].map((t) => (t >= 5 ? t : 0)).join('');
    const hit = cache.get(key);
    if (hit) return hit;
    const c = document.createElement('canvas');
    c.width = c.height = 20;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    // The trailing cells are the weapon and the offhand. They stay in the same hand on the mirrored step.
    let held_n = 0;
    if (weaponCell(held)) held_n++;
    if (offCell(held, cat)) held_n++;
    const body_n = cells.length - held_n;
    const dy = step === 1 ? 1 : 2;
    const lt = LEG_TINT[legFamily(held.lid)];
    // Tier of each worn piece, found from the catalog cell the planner chose. The weapon is the first held cell.
    const pieceTier = new Map();
    const note = (table, id, tier) => id && cat[table] && cat[table][id] && pieceTier.set(cat[table][id], tier | 0);
    note('armor', held.bid, held.bt);
    note('helm', held.hid, held.ht);
    note('cloak', held.cid, held.ct);
    note('shield', held.oid, held.ot);
    const weaponAt = weaponCell(held) ? body_n : -1;
    const draw = (cell, at) => {
      const tier = at === weaponAt ? held.wt | 0 : pieceTier.get(cell) || 0;
      const shifted = tier >= 5 ? recolored(image, cat, cell, tier) : null;
      if (shifted) g.drawImage(shifted, 2, dy);
      else if (lt && cell === cat.legs) g.drawImage(tinted(image, cat, cell, lt[0], lt[1]), 2, dy);
      else g.drawImage(image, cell[0] * cat.stride, cell[1] * cat.stride, cat.cell, cat.cell, 2, dy, cat.cell, cat.cell);
    };
    if (step === 2) {
      g.save();
      g.translate(20, 0);
      g.scale(-1, 1);
    }
    for (let i = 0; i < body_n; i++) draw(cells[i], i);
    const ov = overlays(held);
    const rects = (list, ox, oy) => {
      for (const [x, y, w, h, col] of list) {
        g.fillStyle = col;
        g.fillRect(2 + ox + x, dy + oy + y, w, h);
      }
    };
    rects(ov.torso, 0, 0);
    rects(ov.face, 0, 0);
    rects(ov.hand, 0, 0);
    if (step === 2) g.restore();
    for (let i = body_n; i < cells.length; i++) draw(cells[i], i);
    if (held.weapon === 'pistol') rects(pistolRects(held.wt).map(([x, y, w, h, c]) => [x + 1, y + 10, w, h, c]), 0, 0);
    if (held.offPistol) rects(pistolRects(held.ot || held.wt).map(([x, y, w, h, c]) => [x + 13, y + 10, w, h, c]), 0, 0);
    if (cache.size > 400) cache.clear();
    cache.set(key, c);
    return c;
  }

  // ---- animation
  // The sheet is one front-facing pose, so motion is built from the parts: head and torso as one band,
  // two legs as two halves, the cape trailing behind, and the weapon swinging on its own pivot.

  const shadeCache = new Map();
  /** A copy of one cell darkened (k < 1) or lightened (k > 1), for the cape. */
  function shaded(image, cat, cell, k) {
    const key = cell[0] + ',' + cell[1] + ',' + k;
    let c = shadeCache.get(key);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = c.height = cat.cell;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(image, cell[0] * cat.stride, cell[1] * cat.stride, cat.cell, cat.cell, 0, 0, cat.cell, cat.cell);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = k < 1 ? 'rgba(10,6,24,' + (1 - k) + ')' : 'rgba(255,248,220,' + (k - 1) + ')';
    g.fillRect(0, 0, cat.cell, cat.cell);
    shadeCache.set(key, c);
    return c;
  }

  const planCache = new Map();
  function planFor(look, held, cat) {
    const key = [look.g, look.skinIx, look.hairSeed, look.hat, look.body, held.weapon, held.wid, held.wt, held.hid, held.bid, held.cid, held.oid, held.shield, held.offPistol].join('|');
    let p = planCache.get(key);
    if (p === undefined) {
      p = plan(look, held, cat);
      if (planCache.size > 300) planCache.clear();
      planCache.set(key, p);
    }
    return p;
  }

  const ease = (t) => t * t * (3 - 2 * t);
  /** Where the hand sits in the cell, per weapon class: [col, row] in 16 px cell units. */
  const PIVOT = { blade: [4, 11], dagger: [4, 11], mace: [4, 11], spear: [4, 11], staff: [4, 11], bow: [4, 9], crossbow: [4, 9] };
  const ELEMENT_GLOW = { fire: '#ff9a3c', ice: '#9ae8ff', frost: '#9ae8ff', lightning: '#fff27a', shock: '#fff27a', nature: '#8aff8a', poison: '#b8ff6a', arcane: '#d49aff', shadow: '#b07aff', holy: '#fff0b0', water: '#6ab8ff' };

  /**
   * Draw one animated figure with its cell origin at (x, y), one art pixel = s device pixels.
   * a: { t ms, phase walk radians, mv 0..1 walking, swing 0..1 or -1, hit 0..1 or -1, flip, stance 0..1, seed }.
   * Returns false when the figure cannot be dressed yet (the caller draws the code art).
   */
  function draw(ctx, look, held, x, y, s, a) {
    const cat = root.HERO_CATALOG;
    const cells = planFor(look, held, cat);
    if (!cells) return false;
    const image = sheet(cat);
    if (!image) return false;
    const C = cat.cell;
    let held_n = 0;
    if (weaponCell(held)) held_n++;
    if (offCell(held, cat)) held_n++;
    const body_n = cells.length - held_n;
    const t = a.t || 0;
    const mv = a.mv || 0;
    const ph = a.phase || 0;
    const seed = a.seed || 0;
    const sw = a.swing >= 0 ? a.swing : -1;
    const hit = a.hit >= 0 ? a.hit : -1;
    const stance = a.stance || 0;
    // Torso and head: bob while walking, breathe while still, lean into a swing, kick back from a hit.
    const breathe = Math.sin(t / 380 + seed) * 0.5 + 0.5;
    const bobY = -Math.abs(Math.sin(ph)) * 1.3 * mv + (1 - mv) * -breathe * 0.7;
    let lean = Math.sin(ph) * 0.45 * mv;
    let squash = 0;
    let swingAng = 0;
    if (sw >= 0) {
      if (sw < 0.3) {
        const k = ease(sw / 0.3);
        lean += -1.2 * k;
        swingAng = -50 * k;
        squash = 0.5 * k;
      } else if (sw < 0.55) {
        const k = ease((sw - 0.3) / 0.25);
        lean += -1.2 + 3.2 * k;
        swingAng = -50 + 115 * k;
        squash = 0.5 - 0.9 * k;
      } else {
        const k = ease((sw - 0.55) / 0.45);
        lean += 2 * (1 - k);
        swingAng = 65 * (1 - k);
        squash = -0.4 * (1 - k);
      }
    } else if (stance) {
      swingAng = 12 + Math.sin(t / 260) * 5;
    } else {
      swingAng = Math.sin(t / 700 + seed) * 3 - 6;
    }
    if (hit >= 0) {
      const k = Math.sin(Math.min(1, hit) * Math.PI);
      lean += -2 * k;
      squash += 0.7 * k;
    }
    const snap = (v) => Math.round(v * s) / s;
    const part = (cell, dx, dy, sy0, sy1, sx0, sx1, img) => {
      const bx = img ? 0 : cell[0] * cat.stride;
      const by = img ? 0 : cell[1] * cat.stride;
      ctx.drawImage(img || image, bx + sx0, by + sy0, sx1 - sx0, sy1 - sy0, x + (sx0 + dx) * s, y + (sy0 + dy) * s, (sx1 - sx0) * s, (sy1 - sy0) * s);
    };
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (a.flip) {
      ctx.translate(x + C * s, 0);
      ctx.scale(-1, 1);
      ctx.translate(-x, 0);
    }
    const lift = [Math.max(0, Math.sin(ph)) * 1.0 * mv, Math.max(0, -Math.sin(ph)) * 1.0 * mv];
    const legDx = 0;
    const LEGS = 12;
    const dyTorso = bobY + squash * 0.5;
    if (held.cid && cat.cloak[held.cid]) {
      const cc = cat.cloak[held.cid];
      const img = shaded(image, cat, cc, 0.62);
      const trail = -1 * mv + Math.sin(t / 520 + ph) * 0.35 - lean * 0.6;
      part(cc, snap(trail * 1.2), snap(dyTorso + 0.5), 0, LEGS, 0, C, img);
      part(cc, snap(trail * 1.8), snap(0.5), LEGS, C, 0, C, img);
    }
    const lt = LEG_TINT[legFamily(held.lid)];
    for (let i = 0; i < body_n; i++) {
      const cell = cells[i];
      const tint = lt && cell === cat.legs ? tinted(image, cat, cell, lt[0], lt[1]) : undefined;
      part(cell, snap(lean), snap(dyTorso), 0, LEGS, 0, C, tint);
      part(cell, snap(-legDx), snap(-lift[0]), LEGS, C, 0, 8, tint);
      part(cell, snap(legDx), snap(-lift[1]), LEGS, C, 8, C, tint);
    }
    // Belt, amulet, the bone mask and a ring: pixel sprites that ride with the chest, the head and the hand.
    const ov = overlays(held);
    const rects = (list, ox, oy) => {
      for (const [rx, ry, rw, rh, col] of list) {
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(x + (rx + ox) * s), Math.round(y + (ry + oy) * s), rw * s, rh * s);
      }
    };
    rects(ov.torso, snap(lean), snap(dyTorso));
    rects(ov.face, snap(lean), snap(dyTorso));
    rects(ov.hand, snap(lean * 0.8), snap(dyTorso));
    // A faint glint wanders over rare and legendary gear.
    if (held.best >= 2) {
      for (let k = 0; k < (held.best === 3 ? 2 : 1); k++) {
        const ph2 = (t / 1400 + seed * 0.37 + k * 0.5) % 1;
        const gx = 4 + Math.floor(((seed * 7 + k * 5 + Math.floor(t / 1400 + seed)) % 8 + 8) % 8);
        const gy = 4 + Math.floor(ph2 * 8);
        const keepA = ctx.globalAlpha;
        ctx.globalAlpha = keepA * Math.sin(ph2 * Math.PI) * 0.75;
        ctx.fillStyle = RARITY_GLINT[held.best];
        ctx.fillRect(Math.round(x + (gx + snap(lean)) * s), Math.round(y + (gy + snap(dyTorso)) * s), s, s);
        ctx.globalAlpha = keepA;
      }
    }
    let wi = body_n;
    if (held.weapon === 'pistol') {
      // Hand pistol: it lifts on the swing and flashes at the muzzle on the shot.
      const ang = sw >= 0 ? (-35 * Math.sin(Math.min(1, sw / 0.55) * Math.PI)) : (stance ? -8 : -4);
      const ox = 1 + snap(lean), oy = 10 + snap(dyTorso);
      ctx.save();
      ctx.translate(x + ox * s, y + oy * s);
      ctx.rotate((Math.round(ang / 15) * 15 * Math.PI) / 180);
      for (const [rx, ry, rw, rh, col] of pistolRects(held.wt)) {
        ctx.fillStyle = col;
        ctx.fillRect(rx * s, ry * s, rw * s, rh * s);
      }
      if (sw >= 0.3 && sw < 0.5) {
        ctx.fillStyle = '#fff6b0';
        ctx.fillRect(-s, -8 * s, 3 * s, 2 * s);
        ctx.fillStyle = '#ffb040';
        ctx.fillRect(0, -10 * s, s, 2 * s);
      }
      ctx.restore();
    }
    if (held.offPistol) {
      const ox = 14 + snap(lean * 0.8), oy = 10 + snap(dyTorso);
      ctx.save();
      ctx.translate(x + ox * s, y + oy * s);
      ctx.scale(-1, 1);
      for (const [rx, ry, rw, rh, col] of pistolRects(held.ot || held.wt)) {
        ctx.fillStyle = col;
        ctx.fillRect(rx * s, ry * s, rw * s, rh * s);
      }
      ctx.restore();
    }
    if (weaponCell(held)) {
      const cell = cells[wi++];
      const pv = PIVOT[held.weapon] || [12, 11];
      const px = x + (pv[0] + lean) * s;
      const py = y + (pv[1] + dyTorso) * s;
      const ang = (Math.round(swingAng / 15) * 15 * Math.PI) / 180;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(ang);
      ctx.translate(-px, -py);
      ctx.drawImage(image, cell[0] * cat.stride, cell[1] * cat.stride, C, C, x + snap(lean) * s, y + snap(dyTorso) * s, C * s, C * s);
      ctx.restore();
      // Glint on tier 3 and 4 weapons, element glow on staves.
      const tier = Math.max(1, Math.min(6, held.wt | 0));
      if (tier >= 3 || held.element) {
        const tw = (Math.sin(t / 240 + seed) + 1) / 2;
        const col = held.element ? ELEMENT_GLOW[held.element] || '#8fd8ff' : tier === 6 ? '#ffb070' : tier === 5 ? '#a0ffe0' : tier === 4 ? '#ffe6a0' : '#ffffff';
        const dxp = 0, dyp = 2 - pv[1];
        const gx = pv[0] + dxp * Math.cos(ang) - dyp * Math.sin(ang) + lean;
        const gy = pv[1] + dxp * Math.sin(ang) + dyp * Math.cos(ang) + dyTorso;
        const keep = ctx.globalAlpha;
        ctx.globalAlpha = keep * (0.35 + tw * 0.6);
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(x + gx * s), Math.round(y + gy * s), s, s);
        ctx.globalAlpha = keep;
      }
    }
    if (wi < cells.length) {
      const cell = cells[wi];
      ctx.drawImage(image, cell[0] * cat.stride, cell[1] * cat.stride, C, C, x + snap(lean * 0.8) * s, y + snap(dyTorso) * s, C * s, C * s);
    }
    ctx.restore();
    return true;
  }

  root.heroLayers = { plan, paint, draw };
})();
