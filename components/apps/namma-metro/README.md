# Be in the User's Shoes (Namma Metro Quizz)

Static browser game at `/apps/namma-metro-quizz`. No backend.

## Edit content
Everything lives in `lib/namma-metro/game.config.json`: stations, parts, codes, hints,
scoring, all copy and the share message.

## Set the game URL (`{GAME_URL}`)
Set `"gameUrl"` in `lib/namma-metro/game.config.json` to the public link, for example
`"https://your-site.com/apps/namma-metro-quizz"`. If it is empty, the page's own address is used.

## Maps
The five SVGs in `public/images/apps/namma-metro/` are used as exported. Station labels and
the code are placed by each station's `data-station` id, so keep those ids when re-exporting.

## Build and test
- `npm run build` creates the static pages (the map files are read at build time).
- `npm test` runs the scoring and answer-checking tests.
- `BASE_URL=http://localhost:3000 npm run test:layout` plays the game in headless Chrome at
  375, 768 and 1280 px. Start the site first (`npm run dev`, or `npm run build && npm start`).
  Set `CHROME_PATH` if Chrome is not in the default macOS location.
