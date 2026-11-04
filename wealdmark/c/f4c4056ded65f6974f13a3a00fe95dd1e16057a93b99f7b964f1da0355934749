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
   * or null when it cannot be drawn yet. The sheet has no walk frames: step 1 lifts the figure 1 px, step 2 mirrors it.
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
    if (step === 2) {
      g.save();
      g.translate(20, 0);
      g.scale(-1, 1);
    }
    const dy = step === 1 ? 1 : 2;
    for (const cell of cells) {
      g.drawImage(image, cell[0] * cat.stride, cell[1] * cat.stride, cat.cell, cat.cell, 2, dy, cat.cell, cat.cell);
    }
    if (step === 2) g.restore();
    if (cache.size > 400) cache.clear();
    cache.set(key, c);
    return c;
  }

  root.heroLayers = { plan, paint };
})();
