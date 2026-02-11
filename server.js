require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pollStore = require('./pollStore');
const surveyStore = require('./surveyStore');

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/polls/:pollId
// Returns poll question and options (no vote counts)
app.get('/api/polls/:pollId', (req, res) => {
  const { pollId } = req.params;
  const poll = pollStore.getPoll(pollId);

  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  res.json(poll);
});

// POST /api/polls/:pollId/vote
// Submit a vote for a poll option
app.post('/api/polls/:pollId/vote', (req, res) => {
  const { pollId } = req.params;
  const { optionIndex } = req.body;

  if (typeof optionIndex !== 'number') {
    return res.status(400).json({ error: 'optionIndex must be a number' });
  }

  const result = pollStore.vote(pollId, optionIndex);

  if (!result.success) {
    const statusCode = result.error === 'Poll not found' ? 404 : 400;
    return res.status(statusCode).json({ error: result.error });
  }

  res.json({ success: true });
});

// GET /api/polls/:pollId/results
// Admin endpoint: returns poll results with vote counts
app.get('/api/polls/:pollId/results', (req, res) => {
  const adminToken = req.headers['x-admin-token'];

  if (!ADMIN_TOKEN || adminToken !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { pollId } = req.params;
  const results = pollStore.getResults(pollId);

  if (!results) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  res.json(results);
});

// ===== SURVEY ENDPOINTS =====

// GET /api/surveys/:surveyId
// Returns survey title and questions (no responses)
app.get('/api/surveys/:surveyId', (req, res) => {
  const { surveyId } = req.params;
  const survey = surveyStore.getSurvey(surveyId);

  if (!survey) {
    return res.status(404).json({ error: 'Survey not found' });
  }

  res.json(survey);
});

// POST /api/surveys/:surveyId/responses
// Submit a response to a survey
app.post('/api/surveys/:surveyId/responses', (req, res) => {
  const { surveyId } = req.params;
  const { name, answers } = req.body;

  // Basic validation
  if (!name || !answers) {
    return res.status(400).json({ error: 'name and answers are required' });
  }

  const result = surveyStore.addResponse(surveyId, { name, answers });

  if (!result.success) {
    const statusCode = result.error === 'Survey not found' ? 404 : 400;
    return res.status(statusCode).json({ error: result.error });
  }

  res.json({ success: true });
});

// GET /api/surveys/:surveyId/responses
// Public endpoint: returns survey responses
app.get('/api/surveys/:surveyId/responses', (req, res) => {
  const { surveyId } = req.params;
  const results = surveyStore.getSurveyResponses(surveyId);

  if (!results) {
    return res.status(404).json({ error: 'Survey not found' });
  }

  res.json(results);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Voting backend running on port ${PORT}`);
  console.log(`Admin token is ${ADMIN_TOKEN ? 'configured' : 'NOT configured'}`);
});
