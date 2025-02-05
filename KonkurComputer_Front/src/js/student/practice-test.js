// Global variables
let currentQuestions = []
let currentQuestionIndex = 0
let totalTimerInterval = null
let questionTimerInterval = null
let totalSeconds = 0
let questionSeconds = 0
let userScore = 0

// Authentication functions
function getAuthToken() {
  return localStorage.getItem('token')
}

function logout() {
  localStorage.removeItem('token')
  window.location.href = 'login.html'
}

// Timer functions
function startTotalTimer() {
  if (totalTimerInterval) clearInterval(totalTimerInterval)
  totalTimerInterval = setInterval(() => {
    totalSeconds++
    updateTimerDisplay('total-timer', totalSeconds)
  }, 1000)
}

function startQuestionTimer() {
  if (questionTimerInterval) clearInterval(questionTimerInterval)
  questionSeconds = 0
  updateTimerDisplay('question-timer', questionSeconds)
  questionTimerInterval = setInterval(() => {
    questionSeconds++
    updateTimerDisplay('question-timer', questionSeconds)
  }, 1000)
}

function stopQuestionTimer() {
  if (questionTimerInterval) {
    clearInterval(questionTimerInterval)
    questionTimerInterval = null
  }
}

function updateTimerDisplay(timerId, seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  document.getElementById(timerId).innerText = `${
    mins < 10 ? '0' + mins : mins
  }:${secs < 10 ? '0' + secs : secs}`
}

function resetQuestionTimer() {
  stopQuestionTimer()
  startQuestionTimer()
}

// API functions
async function submitAnswer(questionId, selectedAnswer, timeSpent) {
  try {
    const response = await fetch(
      'http://localhost:5001/api/tests/submit-answer',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          questionId,
          selectedAnswer,
          timeSpent,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to submit answer')
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting answer:', error)
    return null
  }
}

async function completeTest(lessonId, chapter, totalTime) {
  try {
    const response = await fetch('http://localhost:5001/api/tests/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        lessonId,
        chapter,
        totalTime,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to complete test')
    }

    return await response.json()
  } catch (error) {
    console.error('Error completing test:', error)
    return null
  }
}

// Fetch questions from server
async function fetchQuestions() {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const lesson = urlParams.get('lesson')
    const chapter = urlParams.get('chapter')
    const easy = parseInt(urlParams.get('easy')) || 0
    const medium = parseInt(urlParams.get('medium')) || 0
    const hard = parseInt(urlParams.get('hard')) || 0

    // Updated URL to match backend route
    const queryUrl = `http://localhost:5001/api/questions/practice?lesson=${lesson}&chapter=${encodeURIComponent(
      chapter
    )}&easy=${easy}&medium=${medium}&hard=${hard}`

    const response = await fetch(queryUrl, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch questions')
    }

    if (!data.questions || data.questions.length === 0) {
      throw new Error('No questions found')
    }

    currentQuestions = data.questions
    displayCurrentQuestion()
    updateProgressIndicator()
    startQuestionTimer()
  } catch (error) {
    console.error('Error fetching questions:', error)
    document.getElementById('question-section').innerHTML = `
            <div class="alert alert-danger">
                Error loading questions: ${error.message}
            </div>
        `
  }
}
// Display current question
function displayCurrentQuestion() {
  const question = currentQuestions[currentQuestionIndex]
  const questionSection = document.getElementById('question-section')

  questionSection.innerHTML = `
        <div class="card mb-4 shadow-lg rounded">
            <div class="card-body">
                <h4 class="mb-4">Question ${currentQuestionIndex + 1}</h4>
                <p class="question-text h5 mb-4">${question.questionText}</p>
                ${
                  question.imageUrl
                    ? `<img src="../../../../backend-simulator/public/${question.imageUrl}" class="img-fluid mb-4" alt="Question Image">`
                    : ''
                }
                <form id="answer-form">
                    ${Object.entries(question.options)
                      .map(
                        ([key, value]) => `
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="radio" 
                                   name="option" 
                                   id="option${key}" 
                                   value="${key}">
                            <label class="form-check-label" for="option${key}">
                                ${key}: ${value}
                            </label>
                        </div>
                    `
                      )
                      .join('')}
                    <button type="submit" class="btn btn-primary w-100 mt-4">Submit Answer (Leave empty to skip)</button>
                </form>
                <div id="feedback" class="mt-4" style="display: none;">
                    <div id="feedback-text"></div>
                    <button class="btn btn-secondary w-100 mt-3" id="next-question">Next Question</button>
                </div>
            </div>
        </div>
    `

  setupQuestionEventListeners()
  resetQuestionTimer()
}

// Update progress indicator
function updateProgressIndicator() {
  const progressIndicator = document.getElementById('progress-indicator')
  progressIndicator.textContent = `Question ${currentQuestionIndex + 1} of ${
    currentQuestions.length
  }`
}

// Setup event listeners for the current question
function setupQuestionEventListeners() {
  const answerForm = document.getElementById('answer-form')
  const feedbackDiv = document.getElementById('feedback')
  const feedbackText = document.getElementById('feedback-text')
  const nextButton = document.getElementById('next-question')

  answerForm.addEventListener('submit', async function (e) {
    e.preventDefault()
    stopQuestionTimer()

    const selectedOption = document.querySelector(
      'input[name="option"]:checked'
    )
    const currentQuestion = currentQuestions[currentQuestionIndex]
    const timeSpent = questionSeconds

    // Handle empty answer
    const selectedAnswer = selectedOption ? selectedOption.value : 'empty'
    const isCorrect = selectedOption
      ? selectedOption.value === currentQuestion.correctAnswer
      : false

    if (isCorrect) {
      userScore++
    }

    // Submit answer to server
    const submitResult = await submitAnswer(
      currentQuestion._id,
      selectedAnswer,
      timeSpent
    )

    // Show feedback
    feedbackDiv.style.display = 'block'
    if (selectedAnswer === 'empty') {
      feedbackText.innerHTML = `
                <div class="alert alert-warning">
                    <h5>⚠ No Answer Submitted</h5>
                    <p>You didn't select an answer. The correct answer was ${
                      currentQuestion.correctAnswer
                    }: 
                    ${
                      currentQuestion.options[currentQuestion.correctAnswer]
                    }</p>
                    ${
                      submitResult?.solution
                        ? `<p>Solution: ${submitResult.solution}</p>`
                        : ''
                    }
                </div>
            `
    } else if (isCorrect) {
      feedbackText.innerHTML = `
                <div class="alert alert-success">
                    <h5>✓ Correct!</h5>
                    <p>Well done! That's the right answer.</p>
                    ${
                      submitResult?.solution
                        ? `<p>Solution: ${submitResult.solution}</p>`
                        : ''
                    }
                </div>
            `
    } else {
      feedbackText.innerHTML = `
                <div class="alert alert-danger">
                    <h5>✗ Incorrect</h5>
                    <p>The correct answer was ${currentQuestion.correctAnswer}: 
                    ${
                      currentQuestion.options[currentQuestion.correctAnswer]
                    }</p>
                    ${
                      submitResult?.solution
                        ? `<p>Solution: ${submitResult.solution}</p>`
                        : ''
                    }
                </div>
            `
    }

    // Disable form
    answerForm.querySelector('button[type="submit"]').disabled = true
    document.querySelectorAll('input[name="option"]').forEach((input) => {
      input.disabled = true
    })

    // Show next button or completion message
    if (currentQuestionIndex < currentQuestions.length - 1) {
      nextButton.style.display = 'block'
    } else {
      nextButton.style.display = 'none'
      clearInterval(totalTimerInterval)

      const finalScore = Math.round((userScore / currentQuestions.length) * 100)

      // Complete the test
      const urlParams = new URLSearchParams(window.location.search)
      const lessonId = urlParams.get('lesson')
      const chapter = urlParams.get('chapter')

      const completeResult = await completeTest(lessonId, chapter, totalSeconds)

      feedbackText.innerHTML += `
                <div class="alert alert-info mt-3">
                    <h5>Test Completed!</h5>
                    <p>Your final score: ${finalScore}%</p>
                    <p>Correct answers: ${userScore} out of ${
        currentQuestions.length
      }</p>
                    <p>Total time: ${Math.floor(totalSeconds / 60)}m ${
        totalSeconds % 60
      }s</p>
                    <a href="create-test.html" class="btn btn-primary mt-2">Create New Test</a>
                </div>
            `
    }
  })

  nextButton.addEventListener('click', function () {
    currentQuestionIndex++
    if (currentQuestionIndex < currentQuestions.length) {
      displayCurrentQuestion()
      updateProgressIndicator()
    }
  })
}
// Initialize on page load
window.onload = () => {
  const token = getAuthToken()
  if (!token) {
    window.location.href = 'login.html'
    return
  }

  // Clear any existing intervals
  if (totalTimerInterval) clearInterval(totalTimerInterval)
  if (questionTimerInterval) clearInterval(questionTimerInterval)

  // Reset timers
  totalSeconds = 0
  questionSeconds = 0

  // Start timers
  startTotalTimer()
  fetchQuestions()
}
