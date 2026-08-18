# simple-voting-backend

Express (v5) REST API backing the simple-voting frontend. In-memory data stores (no database).

## Run

```bash
npm install
npm start        # node server.js
npm run dev       # nodemon server.js (auto-restart)
```

Server listens on `PORT` env var, defaults to `4000`.

## Environment variables

- `PORT` - server port (default 4000)
- `ADMIN_TOKEN` - required for `GET /api/polls/:pollId/results`. If unset, that endpoint always returns 401.

Create a `.env` file (loaded via `dotenv`) to set these locally.

## Structure

- `server.js` - Express app, routes, middleware (cors, json body parsing)
- `pollStore.js` - in-memory poll storage + logic (getPoll, vote, getResults)
- `surveyStore.js` - in-memory survey storage + logic (getSurvey, addResponse, getSurveyResponses)

Both stores are plain in-memory objects seeded with demo data; all state resets on server restart. Designed to be swappable with a real database later (comment in source).

## Seeded demo data

- Poll `demo-poll-1`: "Which session topic do you prefer?"
- Survey `event-feedback-1`: "Event Feedback Form" (10 questions)
- Survey `aspire-trivia`: 23 placeholder questions (Q1-Q23)
- Survey `nostalgic`: 23 placeholder questions (Q1-Q23)

## API

### Polls
- `GET /api/polls/:pollId` - poll question + options (no vote counts)
- `POST /api/polls/:pollId/vote` - body `{ optionIndex: number }`
- `GET /api/polls/:pollId/results` - admin only, requires header `x-admin-token: <ADMIN_TOKEN>`

### Surveys
- `GET /api/surveys/:surveyId` - title + questions (no responses)
- `POST /api/surveys/:surveyId/responses` - body `{ name: string, answers: string[] }`. Upserts by `name`: if a response with the same trimmed name exists, non-empty answers are merged in (supports progressive/partial submission across multiple calls).
- `GET /api/surveys/:surveyId/responses` - public, returns all responses + total count (no admin token required, unlike poll results)

### Misc
- `GET /` - health check `{ status: 'ok' }`
- Unmatched routes -> 404 `{ error: 'Route not found' }`
- Errors -> 500 `{ error: 'Internal server error' }`

## Notes / gotchas

- `GET /api/surveys/:surveyId/responses` has no auth, unlike the poll results equivalent - asymmetric by design in current code, worth confirming with the user before "fixing".
- No persistence layer; all votes/responses are lost on restart.
