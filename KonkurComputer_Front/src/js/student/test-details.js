let currentQuestionIndex = 0
let testData = null

function getAuthToken() {
  return localStorage.getItem('token')
}

function logout() {
  localStorage.removeItem('token')
  window.location.href = 'login.html'
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString()
}

async function fetchTestDetails() {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const testId = urlParams.get('id')
    const token = getAuthToken()

    if (!testId || !token) {
      window.location.href = 'performance-report.html'
      return
    }

    const response = await fetch(
      `http://localhost:5001/api/tests/details/${testId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch test details')
    }

    testData = await response.json()
    displayTestSummary()
    displayQuestion(0)
    updateNavigationButtons()
  } catch (error) {
    console.error('Error:', error)
    showError('Failed to load test details')
  }
}

function displayTestSummary() {
  const summaryHtml = `
                <div class="row">
                    <div class="col-md-6">
                        <h4>${testData.lesson.lessonName} - ${
    testData.chapter
  }</h4>
                        <p>Date: ${formatDate(testData.completedAt)}</p>
                    </div>
                    <div class="col-md-6">
                        <div class="row">
                            <div class="col-6 col-md-4">
                                <p class="mb-1"><strong>Score:</strong></p>
                                <h5>${Math.round(testData.score)}%</h5>
                            </div>
                            <div class="col-6 col-md-4">
                                <p class="mb-1"><strong>Time:</strong></p>
                                <h5>${formatTime(testData.timeSpent)}</h5>
                            </div>
                            <div class="col-6 col-md-4">
                                <p class="mb-1"><strong>Questions:</strong></p>
                                <h5>${testData.totalQuestions}</h5>
                            </div>
                            <div class="col-6 col-md-4">
                                <p class="mb-1"><strong>Correct:</strong></p>
                                <h5>${testData.correctAnswers}</h5>
                            </div>
                            <div class="col-6 col-md-4">
                                <p class="mb-1"><strong>Wrong:</strong></p>
                                <h5>${testData.wrongAnswers}</h5>
                            </div>
                            <div class="col-6 col-md-4">
                                <p class="mb-1"><strong>Empty:</strong></p>
                                <h5>${testData.emptyAnswers}</h5>
                            </div>
                        </div>
                    </div>
                </div>
            `
  document.getElementById('test-summary').innerHTML = summaryHtml
}

function displayQuestion(index) {
  const answer = testData.answers[index]
  const question = answer.question
  const userAnswer = answer.selectedAnswer
  const isCorrect = answer.isCorrect
  const isEmpty = userAnswer === 'empty'

  let questionHtml = `
                <div class="question-card card">
                    <div class="card-body">
                        <h5 class="card-title">Question ${index + 1}</h5>
                        <p class="question-text">${question.questionText}</p>
                        ${
                          question.imageUrl
                            ? `<img src="${question.imageUrl}" class="img-fluid mb-3" alt="Question Image">`
                            : ''
                        }
                        
                        <div class="options-container">
            `

  Object.entries(question.options).forEach(([key, value]) => {
    let optionClass = 'answer-option'
    if (key === userAnswer) optionClass += ' user-answer'
    if (key === question.correctAnswer) optionClass += ' correct-answer'
    if (key === userAnswer && !isCorrect && !isEmpty)
      optionClass += ' wrong-answer'

    questionHtml += `
                    <div class="${optionClass}">
                        ${key}: ${value}
                    </div>
                `
  })

  if (isEmpty) {
    questionHtml += `
                    <div class="empty-answer answer-option">
                        <em>No answer submitted</em>
                    </div>
                `
  }

  if (question.solution) {
    questionHtml += `
                    <div class="solution-box">
                        <h6>Solution:</h6>
                        <p>${question.solution}</p>
                    </div>
                `
  }

  questionHtml += `
                        </div>
                    </div>
                </div>
            `

  document.getElementById('question-display').innerHTML = questionHtml
  document.getElementById('question-counter').textContent = `Question ${
    index + 1
  } of ${testData.answers.length}`
}

function updateNavigationButtons() {
  document.getElementById('prev-btn').disabled = currentQuestionIndex === 0
  document.getElementById('next-btn').disabled =
    currentQuestionIndex === testData.answers.length - 1
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--
    displayQuestion(currentQuestionIndex)
    updateNavigationButtons()
  }
}

function nextQuestion() {
  if (currentQuestionIndex < testData.answers.length - 1) {
    currentQuestionIndex++
    displayQuestion(currentQuestionIndex)
    updateNavigationButtons()
  }
}

function showError(message) {
  const container = document.querySelector('.container')
  const alert = `
                <div class="alert alert-danger alert-dismissible fade show mt-4" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `
  container.insertAdjacentHTML('afterbegin', alert)
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', fetchTestDetails)
