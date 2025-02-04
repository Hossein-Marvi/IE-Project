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
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getScoreClass(score) {
  if (score >= 80) return 'bg-success'
  if (score >= 60) return 'bg-warning'
  return 'bg-danger'
}

// Replace the fetchPerformanceData function in your performance-report.html
async function fetchPerformanceData() {
  try {
    const token = getAuthToken()
    if (!token) {
      window.location.href = 'login.html'
      return
    }

    const response = await fetch(
      'http://localhost:5001/api/tests/performance',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = 'login.html'
        return
      }
      throw new Error('Failed to fetch performance data')
    }

    const data = await response.json()

    // Update UI with the fetched data
    document.getElementById('total-tests').textContent = data.totalTests
    document.getElementById('average-score').textContent = `${Math.round(
      data.averageScore
    )}%`
    document.getElementById('total-time').textContent = formatTime(
      data.totalTimeSpent
    )
    document.getElementById('success-rate').textContent = `${Math.round(
      data.successRate
    )}%`

    // Update test history
    const testHistoryContainer = document.getElementById('test-history')
    testHistoryContainer.innerHTML = ''

    if (data.tests.length === 0) {
      testHistoryContainer.innerHTML = `
                <div class="col-12">
                    <div class="no-tests-message">
                        <h4>No tests taken yet</h4>
                        <p>Start taking tests to see your performance history here.</p>
                        <a href="create-test.html" class="btn btn-primary">Create New Test</a>
                    </div>
                </div>
            `
      return
    }

    data.tests.forEach((test) => {
      // Update the test card template in the fetchPerformanceData function
      const testCard = `
    <div class="col-md-6 col-lg-4 mb-4">
        <div class="card test-card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${test.chapter}</h5>
                <span class="badge ${getScoreClass(test.score)} score-badge">
                    ${Math.round(test.score)}%
                </span>
            </div>
            <div class="card-body">
                <p class="card-text">
                    <strong>Lesson:</strong> ${test.lessonName}<br>
                    <strong>Date:</strong> ${formatDate(test.date)}<br>
                    <strong>Questions:</strong> ${test.totalQuestions}<br>
                    <strong>Correct:</strong> ${test.correctAnswers}<br>
                    <strong>Wrong:</strong> ${test.wrongAnswers}<br>
                    <strong>Empty:</strong> ${test.emptyAnswers}<br>
                    <strong>Time:</strong> ${formatTime(test.timeSpent)}
                </p>
                <div class="progress mb-3">
                    <div class="progress-bar ${getScoreClass(test.score)}"
                         role="progressbar"
                         style="width: ${test.score}%"
                         aria-valuenow="${test.score}"
                         aria-valuemin="0"
                         aria-valuemax="100">
                    </div>
                </div>
            </div>
            <div class="card-footer bg-transparent">
                <button class="btn btn-outline-primary btn-sm w-100"
                        onclick="viewTestDetails('${test._id}')">
                    View Details
                </button>
            </div>
        </div>
    </div>
`
      testHistoryContainer.innerHTML += testCard
    })
  } catch (error) {
    console.error('Error:', error)
    showError('Failed to load performance data')
  }
}
function updateUI(data) {
  // Update overall statistics
  document.getElementById('total-tests').textContent = data.totalTests
  document.getElementById('average-score').textContent = `${Math.round(
    data.averageScore
  )}%`
  document.getElementById('total-time').textContent = formatTime(
    data.totalTimeSpent
  )
  document.getElementById('success-rate').textContent = `${Math.round(
    data.successRate
  )}%`

  // Update test history
  const testHistoryContainer = document.getElementById('test-history')
  testHistoryContainer.innerHTML = ''

  if (data.tests.length === 0) {
    testHistoryContainer.innerHTML = `
                    <div class="col-12">
                        <div class="no-tests-message">
                            <h4>No tests taken yet</h4>
                            <p>Start taking tests to see your performance history here.</p>
                            <a href="create-test.html" class="btn btn-primary">Create New Test</a>
                        </div>
                    </div>
                `
    return
  }

  data.tests.forEach((test) => {
    const testCard = `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card test-card h-100">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">${test.chapter}</h5>
                                <span class="badge ${getScoreClass(
                                  test.score
                                )} score-badge">
                                    ${Math.round(test.score)}%
                                </span>
                            </div>
                            <div class="card-body">
                                <p class="card-text">
                                    <strong>Date:</strong> ${formatDate(
                                      test.date
                                    )}<br>
                                    <strong>Questions:</strong> ${
                                      test.totalQuestions
                                    }<br>
                                    <strong>Correct:</strong> ${
                                      test.correctAnswers
                                    }<br>
                                    <strong>Time:</strong> ${formatTime(
                                      test.timeSpent
                                    )}
                                </p>
                                <div class="progress mb-3">
                                    <div class="progress-bar ${getScoreClass(
                                      test.score
                                    )}"
                                         role="progressbar"
                                         style="width: ${test.score}%"
                                         aria-valuenow="${test.score}"
                                         aria-valuemin="0"
                                         aria-valuemax="100">
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer bg-transparent">
                                <button class="btn btn-outline-primary btn-sm w-100"
                                        onclick="viewTestDetails('${
                                          test._id
                                        }')">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                `
    testHistoryContainer.innerHTML += testCard
  })
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

function viewTestDetails(testId) {
  window.location.href = `test-details.html?id=${testId}`
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const token = getAuthToken()
  if (!token) {
    window.location.href = 'login.html'
    return
  }
  fetchPerformanceData()
})
