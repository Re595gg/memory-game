# Memory Game

A simple multiplayer memory card game built with React, Bootstrap, Apollo GraphQL, and WebSockets. Players can create or join a room, play memory cards with emoji symbols, and see score updates in real time.

## Project architecture

- Frontend: React + Bootstrap + React Router in the client-side folder.
- Game UI: the landing page lets players enter a username and either create or join a room; the room page shows the board, scoreboard, and card interactions.
- Backend: Node.js + Express + Apollo Server in the root project.
- Real-time updates: GraphQL subscriptions over WebSockets keep room state synchronized when cards are revealed or scores change.
- State storage: rooms are stored in memory on the server, so restarting the backend resets the current game rooms.

## Main folders

- client-side/: React frontend application.
- src/elements/: UI components such as the landing page and room page.
- index.js: Apollo server, GraphQL schema/resolvers, and WebSocket setup.
- emojis.js: emoji pool used to generate card symbols.

## How to run locally

1. Install dependencies at the project root:
   ```bash
   pnpm install
   ```

2. Install frontend dependencies:
   ```bash
   cd client-side
   pnpm install
   ```

3. Start the backend server from the project root:
   ```bash
   pnpm start
   ```
   This will start the GraphQL API and serve the built frontend from http://localhost:4000.

4. In a second terminal, start the React development server:
   ```bash
   cd client-side
   pnpm start
   ```
   The client will run on http://localhost:3000 and connect to the backend at http://localhost:4000/api/gql/.

## Build for production

From the client-side folder:

```bash
pnpm run build
```

This creates a production build that the backend serves from the root application.
