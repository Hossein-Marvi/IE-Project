let currentQuestions = []
let currentQuestionIndex = 0
let answeredQuestions = new Set()
let totalSeconds = 0
let questionSeconds = 0
let totalTimerInterval
let questionTimerInterval
let examSubmitted = false

// Initialize the exam
document.addEventListener('DOMContentLoaded', function () {
  fetchQuestions()
  setupQuestionEventListeners()
  startTotalTimer()

  // Handle beforeunload event
  window.addEventListener('beforeunload', function (e) {
    if (!examSubmitted) {
      e.preventDefault()
      e.returnValue = ''
    }
  })
})

function getAuthToken() {
  return localStorage.getItem('token')
}

async function fetchQuestions() {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const lesson = urlParams.get('lesson')
    const chapter = urlParams.get('chapter')
    const easy = urlParams.get('easy') || 0
    const medium = urlParams.get('medium') || 0
    const hard = urlParams.get('hard') || 0

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

    if (!data.success || !data.questions || data.questions.length === 0) {
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

function displayCurrentQuestion() {
  const question = currentQuestions[currentQuestionIndex]
  const questionSection = document.getElementById('question-section')

  let optionsHtml = ''
  for (const [key, value] of Object.entries(question.options)) {
    optionsHtml += `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="option" id="option${key}" value="${key}">
                        <label class="option-label" for="option${key}">
                            ${key}. ${value}
                        </label>
                    </div>
                `
  }

  questionSection.innerHTML = `
                <form id="answer-form">
                    <h4>Question ${currentQuestionIndex + 1} of ${
    currentQuestions.length
  }</h4>
                    <p class="lead">${question.questionText}</p>
                    ${
                      question.imageUrl
                        ? `<img src="${question.imageUrl}" alt="Question Image" class="question-image">`
                        : ''
                    }
                    <div class="options-container mt-3">
                        ${optionsHtml}
                    </div>
                    <div class="d-flex justify-content-between mt-4">
                        <button type="button" class="btn btn-secondary" onclick="previousQuestion()" ${
                          currentQuestionIndex === 0 ? 'disabled' : ''
                        }>Previous</button>
                        <button type="submit" class="btn btn-primary">
                            ${
                              currentQuestionIndex ===
                              currentQuestions.length - 1
                                ? 'Submit Test'
                                : 'Next Question'
                            }
                        </button>
                    </div>
                </form>
            `

  // Reset question timer
  questionSeconds = 0
  document.getElementById('question-timer').textContent = '00:00'
}

function updateProgressIndicator() {
  const progressSection = document.getElementById('progress-section')
  progressSection.innerHTML = ''

  for (let i = 0; i < currentQuestions.length; i++) {
    const dot = document.createElement('div')
    dot.className = `question-dot${
      i === currentQuestionIndex ? ' current' : ''
    }${answeredQuestions.has(i) ? ' answered' : ''}`
    dot.addEventListener('click', () => navigateToQuestion(i))
    progressSection.appendChild(dot)
  }
}

function navigateToQuestion(index) {
  if (index !== currentQuestionIndex) {
    currentQuestionIndex = index
    displayCurrentQuestion()
    updateProgressIndicator()
    startQuestionTimer()
  }
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--
    displayCurrentQuestion()
    updateProgressIndicator()
    startQuestionTimer()
  }
}

function startTotalTimer() {
  totalTimerInterval = setInterval(() => {
    totalSeconds++
    document.getElementById('total-timer').textContent =
      formatTime(totalSeconds)
  }, 1000)
}

function startQuestionTimer() {
  clearInterval(questionTimerInterval)
  questionSeconds = 0
  questionTimerInterval = setInterval(() => {
    questionSeconds++
    document.getElementById('question-timer').textContent =
      formatTime(questionSeconds)
  }, 1000)
}

function stopQuestionTimer() {
  clearInterval(questionTimerInterval)
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

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

async function showResults() {
  clearInterval(totalTimerInterval)
  clearInterval(questionTimerInterval)

  const urlParams = new URLSearchParams(window.location.search)
  const lessonId = urlParams.get('lesson')
  const chapter = urlParams.get('chapter')

  try {
    const completeResult = await completeTest(lessonId, chapter, totalSeconds)

    if (!completeResult) {
      throw new Error('Failed to complete test')
    }

    examSubmitted = true

    const resultsContent = document.getElementById('results-content')
    resultsContent.innerHTML = `
                    <div class="alert alert-info mb-4">
                        <h4 class="alert-heading">Exam Summary</h4>
                        <p class="mb-0">Final Score: ${completeResult.score.toFixed(
                          1
                        )}%</p>
                        <p class="mb-0">Total Time: ${formatTime(
                          totalSeconds
                        )}</p>
                        <p class="mb-0">Correct Answers: ${
                          completeResult.correctAnswers
                        }</p>
                        <p class="mb-0">Total Questions: ${
                          completeResult.totalQuestions
                        }</p>
                    </div>
                `

    const resultsModal = new bootstrap.Modal(
      document.getElementById('results-modal')
    )
    resultsModal.show()
  } catch (error) {
    console.error('Error saving results:', error)
    alert(
      'There was an error saving your exam results. Please try again or contact support.'
    )
  }
}

function setupQuestionEventListeners() {
  document.addEventListener('submit', async function (e) {
    if (e.target.id === 'answer-form') {
      e.preventDefault()
      stopQuestionTimer()

      const selectedOption = document.querySelector(
        'input[name="option"]:checked'
      )
      const currentQuestion = currentQuestions[currentQuestionIndex]

      if (selectedOption) {
        answeredQuestions.add(currentQuestionIndex)

        await submitAnswer(
          currentQuestion._id,
          selectedOption.value,
          questionSeconds
        )
      }

      if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++
        displayCurrentQuestion()
        updateProgressIndicator()
        startQuestionTimer()
      } else {
        await showResults()
      }
    }
  })
}
