# Sheriff of Nottingham Counter

A web-based score counter for the Sheriff of Nottingham board game. Uses TypeScript and plain HTML for a lightweight, mobile-friendly implementation.

## Features
- Track scores for 3-5 players
- Calculate values for:
    - Regular goods (apples, cheese, bread, chickens)
    - Contraband (pepper, mead, silk, crossbow)
    - Royal goods (green apples, golden apples, gouda cheese, etc.)
- Automatically calculates king and queen bonuses
- Local storage for game history
- Mobile-friendly interface
- All data and logic on client side, no cookies or tracking.

## Development
1. Clone the repository
2. Install TypeScript: `npm install`
3. Compile TypeScript: `npm run build` or `tsc`
4. Open index.html in your browser

## Deployment
Automatically deployed to Render when changes are pushed to the main branch.

Live at: [sheriffcounter.pedrorevezsilva.tech](https://sheriffcounter.pedrorevezsilva.tech)