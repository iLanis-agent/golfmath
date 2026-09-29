/* GolfMath engine - World Handicap System math, no DOM. */
(function (root) {
  'use strict';

  function round1(x) {
    // round to nearest tenth, ties away from zero like the printed tables
    var r = Math.round(Math.abs(x) * 10) / 10;
    return (x < 0 ? -r : r);
  }
  function round0(x) {
    var r = Math.round(Math.abs(x));
    return (x < 0 ? -r : r);
  }

  // WHS Rule 5.1 (18 holes): (113 / slope) x (adjusted gross - course rating - PCC)
  function scoreDifferential(adjustedGross, courseRating, slope, pcc) {
    pcc = pcc || 0;
    return round1((113 / slope) * (adjustedGross - courseRating - pcc));
  }

  // WHS Rule 5.2a table: [maxCount, lowestN, adjustment]
  var FEWER_THAN_20 = [
    [3, 1, -2.0],
    [4, 1, -1.0],
    [5, 1, 0],
    [6, 2, -1.0],
    [8, 2, 0],
    [11, 3, 0],
    [14, 4, 0],
    [16, 5, 0],
    [18, 6, 0],
    [19, 7, 0],
    [20, 8, 0]
  ];
  var MAX_INDEX = 54.0;

  // diffs: array of score differentials, MOST RECENT FIRST (any length >= 3)
  // Returns {recordCount, windowCount, used, adjustment, rawIndex, index, capped}
  function indexFromDifferentials(diffs) {
    if (!Array.isArray(diffs) || diffs.length < 3) return null;
    var recent = diffs.slice(0, 20); // most recent 20
    var n = recent.length;
    var row = null;
    for (var i = 0; i < FEWER_THAN_20.length; i++) {
      if (n <= FEWER_THAN_20[i][0]) { row = FEWER_THAN_20[i]; break; }
    }
    var lowestN = row[1];
    var adjustment = row[2];
    var sorted = recent.slice().sort(function (a, b) { return a - b; });
    var used = sorted.slice(0, lowestN);
    var avg = used.reduce(function (s, v) { return s + v; }, 0) / used.length;
    var raw = round1(avg + adjustment);
    var index = Math.min(raw, MAX_INDEX);
    return {
      recordCount: diffs.length,
      windowCount: n,
      used: used,
      adjustment: adjustment,
      rawIndex: raw,
      index: round1(index),
      capped: raw > MAX_INDEX
    };
  }

  // WHS Rule 6.1: course handicap = index x (slope / 113) + (course rating - par), rounded to integer
  function courseHandicap(index, slope, courseRating, par) {
    return round0(index * (slope / 113) + (courseRating - par));
  }

  // WHS Rule 6.2: playing handicap = course handicap x allowance, rounded to integer
  function playingHandicap(courseHcp, allowancePct) {
    return round0(courseHcp * (allowancePct / 100));
  }

  // Stroke allocation: full strokes evenly, remainder on lowest stroke indexes.
  // holes = 18 or 9. Returns strokes received on the hole with the given stroke index (1-based).
  function strokesReceived(courseHcp, strokeIndex, holes) {
    holes = holes || 18;
    if (courseHcp >= 0) {
      var base = Math.floor(courseHcp / holes);
      var rem = courseHcp - base * holes;
      return base + (strokeIndex <= rem ? 1 : 0);
    }
    // plus handicap: strokes given back from the hardest-index holes (highest SI numbers)
    var mag = -courseHcp;
    var base2 = Math.floor(mag / holes);
    var rem2 = mag - base2 * holes;
    return -(base2 + (strokeIndex > holes - rem2 ? 1 : 0));
  }

  // Net double bogey maximum postable score on a hole: par + 2 + strokes received
  function maxHoleScore(par, strokes) {
    return par + 2 + strokes;
  }

  // Honesty verdict: claimed index vs the one the posted scores actually produce
  function honestyVerdict(claimed, computed) {
    var gap = round1(claimed - computed);
    var abs = Math.abs(gap);
    if (abs <= 1) return { gap: gap, verdict: 'honest' };
    if (gap < 0) return { gap: gap, verdict: 'vanity handicap - claims better than the scores support' };
    return { gap: gap, verdict: 'sandbag - claims worse than the scores support' };
  }

  var api = {
    round1: round1,
    scoreDifferential: scoreDifferential,
    indexFromDifferentials: indexFromDifferentials,
    courseHandicap: courseHandicap,
    playingHandicap: playingHandicap,
    strokesReceived: strokesReceived,
    maxHoleScore: maxHoleScore,
    honestyVerdict: honestyVerdict,
    MAX_INDEX: MAX_INDEX
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GolfMath = api;
})(typeof window !== 'undefined' ? window : globalThis);
