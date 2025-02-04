document.addEventListener('DOMContentLoaded', async () => {
  const lessonDropdown = document.getElementById('lesson')
  const chapterDropdown = document.getElementById('chapter')
  const easySelect = document.getElementById('easy-questions')
  const mediumSelect = document.getElementById('medium-questions')
  const hardSelect = document.getElementById('hard-questions')
  const generateTestBtn = document.getElementById('generate-test-btn')

  // Initialize dropdowns with default options
  function initializeDropdowns() {
    lessonDropdown.innerHTML =
      '<option selected disabled>Select a lesson</option>'
    chapterDropdown.innerHTML =
      '<option selected disabled>Select a chapter</option>'
    updateDropdownOptions(easySelect, 0)
    updateDropdownOptions(mediumSelect, 0)
    updateDropdownOptions(hardSelect, 0)
  }

  // Function to update question counts
  // Function to update question counts
  async function updateQuestionCounts() {
    const selectedLesson = lessonDropdown.value
    const selectedChapter = chapterDropdown.value

    if (!selectedLesson || !selectedChapter) {
      updateDropdownOptions(easySelect, 0)
      updateDropdownOptions(mediumSelect, 0)
      updateDropdownOptions(hardSelect, 0)
      return
    }

    try {
      // Changed lessonId to lesson to match backend expectation
      const response = await fetch(
        `http://localhost:5001/api/questions/counts?lesson=${selectedLesson}&chapter=${encodeURIComponent(
          selectedChapter
        )}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch question counts')
      }

      const data = await response.json()

      // Update to handle the success response structure
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch question counts')
      }

      // Access counts from the response structure
      const counts = data.counts

      // Update dropdowns with the counts
      updateDropdownOptions(easySelect, counts.easy || 0)
      updateDropdownOptions(mediumSelect, counts.medium || 0)
      updateDropdownOptions(hardSelect, counts.hard || 0)

      // Enable/disable generate test button based on available questions
      const totalQuestions =
        (counts.easy || 0) + (counts.medium || 0) + (counts.hard || 0)
      generateTestBtn.disabled = totalQuestions === 0

      if (totalQuestions === 0) {
        alert('No questions available for the selected chapter.')
      }
    } catch (error) {
      console.error('Error fetching question counts:', error)
      alert('Error loading question counts. Please try again.')
      updateDropdownOptions(easySelect, 0)
      updateDropdownOptions(mediumSelect, 0)
      updateDropdownOptions(hardSelect, 0)
    }
  }
  // Function to update dropdown options
  function updateDropdownOptions(selectElement, maxCount) {
    selectElement.innerHTML = ''

    // Always add 0 as first option
    const zeroOption = document.createElement('option')
    zeroOption.value = '0'
    zeroOption.textContent = '0'
    selectElement.appendChild(zeroOption)

    // Add options up to maxCount
    for (let i = 1; i <= maxCount; i++) {
      const option = document.createElement('option')
      option.value = i.toString()
      option.textContent = i.toString()
      selectElement.appendChild(option)
    }
  }

  // Initialize the page
  async function initialize() {
    try {
      initializeDropdowns()

      // Fetch lessons
      const response = await fetch('http://localhost:5001/api/lessons')
      if (!response.ok) {
        throw new Error('Failed to fetch lessons')
      }

      const data = await response.json()

      if (!data.success || !data.lessons) {
        throw new Error('Invalid lesson data received')
      }

      // Populate lesson dropdown
      data.lessons.forEach((lesson) => {
        const option = document.createElement('option')
        option.value = lesson._id
        option.textContent = lesson.lessonName
        lessonDropdown.appendChild(option)
      })
    } catch (error) {
      console.error('Initialization error:', error)
      alert('Error loading lessons. Please refresh the page.')
    }
  }

  // Event Listeners
  lessonDropdown.addEventListener('change', async () => {
    const selectedLessonId = lessonDropdown.value

    // Reset chapter dropdown and question counts
    chapterDropdown.innerHTML =
      '<option selected disabled>Select a chapter</option>'
    updateDropdownOptions(easySelect, 0)
    updateDropdownOptions(mediumSelect, 0)
    updateDropdownOptions(hardSelect, 0)

    if (!selectedLessonId) return

    try {
      const response = await fetch(
        `http://localhost:5001/api/lessons/${selectedLessonId}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch lesson details')
      }

      const data = await response.json()

      if (!data.success || !data.lesson || !data.lesson.chapters) {
        throw new Error('Invalid chapter data received')
      }

      // Populate chapters dropdown
      data.lesson.chapters.forEach((chapter) => {
        const option = document.createElement('option')
        option.value = chapter
        option.textContent = chapter
        chapterDropdown.appendChild(option)
      })
    } catch (error) {
      console.error('Error loading chapters:', error)
      alert('Error loading chapters. Please try again.')
    }
  })

  chapterDropdown.addEventListener('change', updateQuestionCounts)

  // Handle test type selection
  document.getElementById('practice-test-btn').addEventListener('click', () => {
    redirectToTest('practice-test.html')
  })

  document.getElementById('exam-test-btn').addEventListener('click', () => {
    redirectToTest('exam-test.html')
  })

  // Initialize the page
  await initialize()
})

function redirectToTest(testPage) {
  const lesson = document.getElementById('lesson').value
  const chapter = document.getElementById('chapter').value
  const easyQuestions = document.getElementById('easy-questions').value
  const mediumQuestions = document.getElementById('medium-questions').value
  const hardQuestions = document.getElementById('hard-questions').value

  // Validate selections
  if (!lesson || !chapter) {
    alert('Please select both a lesson and a chapter.')
    return
  }

  // Validate question counts
  const totalQuestions =
    parseInt(easyQuestions) +
    parseInt(mediumQuestions) +
    parseInt(hardQuestions)

  if (totalQuestions === 0) {
    alert('Please select at least one question.')
    return
  }

  // Build query parameters
  const params = new URLSearchParams({
    lesson: lesson,
    chapter: chapter,
    easy: easyQuestions,
    medium: mediumQuestions,
    hard: hardQuestions,
  })

  // Redirect to the appropriate test page
  window.location.href = `${testPage}?${params.toString()}`
}

function logout() {
  localStorage.removeItem('token')
  window.location.href = 'login.html'
}
