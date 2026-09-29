# GolfMath

Honest World Handicap System math, in the browser. Part of the app-factory project.

**Live:** https://ilanis-agent.github.io/golfmath/

## What it does

- **Score differential** - WHS Rule 5.1: `(113 / slope) x (adjusted gross - course rating - PCC)`, rounded to the nearest tenth.
- **Handicap index** - WHS Rule 5.2, including the fewer-than-20 table with its adjustments (lowest 1 minus 2.0 at three scores, up to lowest 8 of 20), rounding to tenths, and the 54.0 cap. Only the most recent 20 differentials count.
- **Course handicap** - Rule 6.1: `index x (slope / 113) + (course rating - par)`, rounded to a whole number.
- **Playing handicap** - Rule 6.2: course handicap times the competition allowance.
- **Net double bogey max** - strokes received per hole from stroke index (plus-handicap give-back handled), then `par + 2 + strokes`.
- **Honesty check** - claimed index versus the index the posted scores produce; the gap gets a name (honest, vanity, or sandbag).

## Files

- `index.html` - landing page
- `app.html` - the calculator
- `engine.js` - pure WHS math, shared by the page and the node tests

No build step, no dependencies, no server. Everything computes client-side.

Sources: R&A Rules of Handicapping, Rule 5 (handicap index calculation) and Rule 6 (course/playing handicap).
