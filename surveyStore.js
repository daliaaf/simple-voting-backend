// In-memory survey storage
// Structure designed to be easily swappable with a database later

const surveys = {
  'event-feedback-1': {
    surveyId: 'event-feedback-1',
    title: 'Event Feedback Form',
    questions: [
      'What is your overall impression of the event?',
      'What did you like the most?',
      'What could be improved?',
      'Was the content relevant to you? Why or why not?',
      'How did you find the speakers/facilitators?',
      'Did the timing and duration work for you?',
      'What did you learn that you didn\'t know before?',
      'How likely are you to attend another event like this?',
      'Any feedback about the venue/online setup?',
      'Any other comments or suggestions?'
    ],
    responses: []
  },
  'aspire-trivia': {
    surveyId: 'aspire-trivia',
    title: 'Aspire Trivia',
    questions: [
      'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10',
      'Q11', 'Q12', 'Q13', 'Q14', 'Q15', 'Q16', 'Q17', 'Q18', 'Q19', 'Q20',
      'Q21', 'Q22', 'Q23'
    ],
    responses: []
  }
};

/**
 * Get survey by ID (without responses)
 * @param {string} surveyId
 * @returns {object|null} Survey object or null if not found
 */
function getSurvey(surveyId) {
  const survey = surveys[surveyId];
  if (!survey) {
    return null;
  }

  return {
    surveyId: survey.surveyId,
    title: survey.title,
    questions: survey.questions
  };
}

/**
 * Add or update a response to a survey (UPSERT behavior)
 * Supports progressive submissions - allows partial answers
 * @param {string} surveyId
 * @param {object} responseData - { name, answers }
 * @returns {object} Success status or error
 */
function addResponse(surveyId, responseData) {
  const survey = surveys[surveyId];

  if (!survey) {
    return { success: false, error: 'Survey not found' };
  }

  const { name, answers } = responseData;

  // Validate name
  if (typeof name !== 'string' || name.trim() === '') {
    return { success: false, error: 'Name must be a non-empty string' };
  }

  // Validate answers is an array
  if (!Array.isArray(answers)) {
    return { success: false, error: 'Answers must be an array' };
  }

  // Validate answers is not empty
  if (answers.length === 0) {
    return { success: false, error: 'Answers array cannot be empty' };
  }

  // Validate answers length does not exceed questions
  if (answers.length > survey.questions.length) {
    return {
      success: false,
      error: `Too many answers: expected at most ${survey.questions.length}, got ${answers.length}`
    };
  }

  // Validate each answer is a string
  for (let i = 0; i < answers.length; i++) {
    if (typeof answers[i] !== 'string') {
      return {
        success: false,
        error: `Answer at index ${i} must be a string`
      };
    }
  }

  // Normalize answers to full length array (fill missing with "")
  const normalizedAnswers = [];
  for (let i = 0; i < survey.questions.length; i++) {
    normalizedAnswers[i] = i < answers.length ? answers[i] : '';
  }

  const trimmedName = name.trim();

  // Look for existing response with the same name
  const existingIndex = survey.responses.findIndex(r => r.name === trimmedName);

  if (existingIndex !== -1) {
    // Update existing response
    const existingResponse = survey.responses[existingIndex];

    // Merge answers: only overwrite with non-empty strings
    for (let i = 0; i < normalizedAnswers.length; i++) {
      if (normalizedAnswers[i] !== '') {
        existingResponse.answers[i] = normalizedAnswers[i];
      }
    }

    existingResponse.lastUpdatedAt = new Date().toISOString();

    return { success: true, response: existingResponse };
  } else {
    // Create new response
    const response = {
      name: trimmedName,
      answers: normalizedAnswers,
      submittedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    };

    survey.responses.push(response);

    return { success: true, response };
  }
}

/**
 * Get survey responses (admin only)
 * @param {string} surveyId
 * @returns {object|null} Survey with all responses or null if not found
 */
function getSurveyResponses(surveyId) {
  const survey = surveys[surveyId];

  if (!survey) {
    return null;
  }

  return {
    surveyId: survey.surveyId,
    title: survey.title,
    questions: survey.questions,
    responses: survey.responses,
    totalResponses: survey.responses.length
  };
}

module.exports = {
  getSurvey,
  addResponse,
  getSurveyResponses
};
