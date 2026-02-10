// In-memory poll storage
// Structure designed to be easily swappable with a database later

const polls = {
  'demo-poll-1': {
    pollId: 'demo-poll-1',
    question: 'Which session topic do you prefer?',
    options: ['AI & Automation', 'Cloud & DevOps', 'Frontend & UX'],
    votes: [0, 0, 0]
  }
};

/**
 * Get poll by ID (without vote counts)
 * @param {string} pollId
 * @returns {object|null} Poll object or null if not found
 */
function getPoll(pollId) {
  const poll = polls[pollId];
  if (!poll) {
    return null;
  }

  return {
    pollId: poll.pollId,
    question: poll.question,
    options: poll.options
  };
}

/**
 * Record a vote for a poll option
 * @param {string} pollId
 * @param {number} optionIndex
 * @returns {object} Success status or error
 */
function vote(pollId, optionIndex) {
  const poll = polls[pollId];

  if (!poll) {
    return { success: false, error: 'Poll not found' };
  }

  if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= poll.options.length) {
    return { success: false, error: 'Invalid option index' };
  }

  poll.votes[optionIndex]++;
  return { success: true };
}

/**
 * Get poll results (including vote counts)
 * @param {string} pollId
 * @returns {object|null} Results object or null if not found
 */
function getResults(pollId) {
  const poll = polls[pollId];

  if (!poll) {
    return null;
  }

  const results = poll.options.map((option, index) => ({
    option: option,
    count: poll.votes[index]
  }));

  const totalVotes = poll.votes.reduce((sum, count) => sum + count, 0);

  return {
    pollId: poll.pollId,
    question: poll.question,
    options: poll.options,
    results: results,
    totalVotes: totalVotes
  };
}

module.exports = {
  getPoll,
  vote,
  getResults
};
