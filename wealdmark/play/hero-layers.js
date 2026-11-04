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
      if (!item('helm', held.hid)) return null;
    } else if (cat.hat[hat]) {
      out.push(cat.hat[hat]);
    }
    if (held.weapon) {
      const tiers = cat.weapon[held.weapon];
      if (!tiers) {
        warnOnce('weapon', held.weapon);
        return null;
      }
      out.push(tiers[Math.max(1, Math.min(4, held.wt | 0)) - 1]);
    }
    if (held.offPistol) {
      if (!cat.offPistol) {
        warnOnce('offhand pistol', held.oid);
        return null;
      }
      out.push(cat.offPistol);
    } else if (held.shield && !item('shield', held.oid)) return null;
    return out;
  }

  let img = null;
  let ready = false;
  let failed = false;
  const cache = new Map();

  /** The sheet image once it has loaded; null while it loads or after it failed. Starts the load on first use. */
  function sheet(cat) {
    if (failed) return null;
    if (!img) {
      img = new Image();
      img.onload = function () {
        ready = true;
      };
      img.onerror = function () {
        failed = true;
        console.warn('hero-layers: ' + cat.sheet + ' did not load, using code art');
      };
      img.src = cat.sheet;
    }
    return ready ? img : null;
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
    const key = JSON.stringify(cells) + '|' + step;
    const hit = cache.get(key);
    if (hit) return hit;
    const c = document.createElement('canvas');
    c.width = c.height = 20;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    // The trailing cells are the weapon and the offhand. They stay in the same hand on the mirrored step.
    let held_n = 0;
    if (held.weapon) held_n++;
    if (held.offPistol ? cat.offPistol : held.shield && held.oid && cat.shield[held.oid]) held_n++;
    const body_n = cells.length - held_n;
    const dy = step === 1 ? 1 : 2;
    const draw = (cell) => g.drawImage(image, cell[0] * cat.stride, cell[1] * cat.stride, cat.cell, cat.cell, 2, dy, cat.cell, cat.cell);
    if (step === 2) {
      g.save();
      g.translate(20, 0);
      g.scale(-1, 1);
    }
    for (let i = 0; i < body_n; i++) draw(cells[i]);
    if (step === 2) g.restore();
    for (let i = body_n; i < cells.length; i++) draw(cells[i]);
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
    if (held.weapon) held_n++;
    if (held.offPistol ? cat.offPistol : held.shield && held.oid && cat.shield[held.oid]) held_n++;
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
    for (let i = 0; i < body_n; i++) {
      const cell = cells[i];
      part(cell, snap(lean), snap(dyTorso), 0, LEGS, 0, C);
      part(cell, snap(-legDx), snap(-lift[0]), LEGS, C, 0, 8);
      part(cell, snap(legDx), snap(-lift[1]), LEGS, C, 8, C);
    }
    let wi = body_n;
    if (held.weapon) {
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
      const tier = Math.max(1, Math.min(4, held.wt | 0));
      if (tier >= 3 || held.element) {
        const tw = (Math.sin(t / 240 + seed) + 1) / 2;
        const col = held.element ? ELEMENT_GLOW[held.element] || '#8fd8ff' : tier === 4 ? '#ffe6a0' : '#ffffff';
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
