// Helper function for authenticated fetch requests
function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('token')
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// Helper function to safely get ObjectId
function getObjectId(obj) {
  return obj?.$oid || obj || ''
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(unsafe) {
  if (unsafe == null) return ''
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Fetch all lessons from the backend
function fetchLessons() {
  authenticatedFetch('http://localhost:5001/api/lessons')
    .then((response) => response.json())
    .then((data) => {
      const lessons = Array.isArray(data) ? data : data.lessons || []

      const lessonSelect = document.getElementById('lesson')
      const editLessonSelect = document.getElementById('edit-lesson')

      lessonSelect.innerHTML = ''
      editLessonSelect.innerHTML = ''

      const defaultOption = document.createElement('option')
      defaultOption.value = ''
      defaultOption.textContent = 'Select lesson'
      lessonSelect.appendChild(defaultOption.cloneNode(true))
      editLessonSelect.appendChild(defaultOption)

      lessons.forEach((lesson) => {
        const option = document.createElement('option')
        option.value = getObjectId(lesson._id)
        option.textContent = lesson.lessonName

        lessonSelect.appendChild(option.cloneNode(true))
        editLessonSelect.appendChild(option)
      })

      lessonSelect.addEventListener('change', function () {
        fetchChaptersForLesson(this.value, 'chapter')
      })

      editLessonSelect.addEventListener('change', function () {
        fetchChaptersForLesson(this.value, 'edit-chapter')
      })
    })
    .catch((error) => console.error('Error fetching lessons:', error))
}

// Fetch chapters for a specific lesson
function fetchChaptersForLesson(lessonId, chapterSelectId) {
  if (!lessonId) return

  authenticatedFetch(`http://localhost:5001/api/lessons/${lessonId}`)
    .then((response) => response.json())
    .then((lesson) => {
      const chapterSelect = document.getElementById(chapterSelectId)
      chapterSelect.innerHTML = ''

      const defaultOption = document.createElement('option')
      defaultOption.value = ''
      defaultOption.textContent = 'Select chapter'
      chapterSelect.appendChild(defaultOption)

      lesson.chapters.forEach((chapter) => {
        const option = document.createElement('option')
        option.value = chapter
        option.textContent = chapter
        chapterSelect.appendChild(option)
      })
    })
    .catch((error) => console.error('Error fetching chapters:', error))
}

function fetchQuestions() {
  const tableBody = document.getElementById('question-table-body')

  // Show loading state
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </td>
    </tr>
  `

  // First fetch all lessons to create a lookup map
  fetch('http://localhost:5001/api/lessons')
    .then((response) => response.json())
    .then((data) => {
      // Create a map of lesson ID to lesson name
      const lessonMap = new Map()

      // Access lessons from the success response
      const lessons = data.lessons || []

      // Populate the lesson map
      lessons.forEach((lesson) => {
        const lessonId = lesson._id // Direct access to ID string
        console.log('Mapping lesson:', lessonId, '→', lesson.lessonName)
        lessonMap.set(lessonId, lesson.lessonName)
      })

      // Then fetch questions
      return fetch('http://localhost:5001/api/questions')
        .then((response) => response.json())
        .then((questions) => {
          tableBody.innerHTML = ''

          if (!Array.isArray(questions) || questions.length === 0) {
            tableBody.innerHTML = `
              <tr>
                <td colspan="6" class="text-center">No questions found</td>
              </tr>
            `
            return
          }

          questions.forEach((question) => {
            // Get the lesson name using the lesson ID
            const lessonId = question.lesson._id // Access lesson ID directly
            const lessonName = lessonMap.get(lessonId) || 'N/A'

            const row = document.createElement('tr')
            row.innerHTML = `
              <td>${question._id}</td>
              <td>${escapeHtml(question.questionText)}</td>
              <td>${escapeHtml(lessonName)}</td>
              <td>${escapeHtml(question.chapter)}</td>
              <td>${escapeHtml(question.difficulty)}</td>
              <td>
                <button class="btn btn-primary btn-sm" 
                  data-bs-toggle="modal" 
                  data-bs-target="#editQuestionModal"
                  data-question-id="${question._id}"
                  data-question-text="${escapeHtml(question.questionText)}"
                  data-lesson="${lessonId}"
                  data-chapter="${escapeHtml(question.chapter)}"
                  data-difficulty="${escapeHtml(question.difficulty)}"
                  data-option-a="${escapeHtml(question.options.A)}"
                  data-option-b="${escapeHtml(question.options.B)}"
                  data-option-c="${escapeHtml(question.options.C)}"
                  data-option-d="${escapeHtml(question.options.D)}"
                  data-correct-answer="${escapeHtml(question.correctAnswer)}"
                  data-solution="${escapeHtml(question.solution || '')}">
                  Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteQuestion('${
                  question._id
                }')">
                  Delete
                </button>
              </td>
            `
            tableBody.appendChild(row)
          })

          // Log the final lesson map for debugging
          console.log('Final lesson map:')
          lessonMap.forEach((name, id) => {
            console.log(id, '→', name)
          })
        })
    })
    .catch((error) => {
      console.error('Error:', error)
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            Error loading questions. Please try again later.
          </td>
        </tr>
      `
    })
}

function escapeHtml(unsafe) {
  if (unsafe == null) return ''
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  if (unsafe == null) return ''
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
// Helper function to escape HTML
function escapeHtml(unsafe) {
  if (unsafe == null) return ''
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
// Delete a question by ID
function deleteQuestion(questionId) {
  if (confirm(`Are you sure you want to delete Question ID: ${questionId}?`)) {
    authenticatedFetch(`http://localhost:5001/api/questions/${questionId}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then(() => {
        alert(`Question ID: ${questionId} deleted successfully.`)
        fetchQuestions()
      })
      .catch((error) => console.error('Error deleting question:', error))
  }
}

// Populate Edit Modal with existing question data
document
  .getElementById('editQuestionModal')
  .addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget
    const questionId = button.getAttribute('data-question-id')

    authenticatedFetch(`http://localhost:5001/api/questions/${questionId}`)
      .then((response) => response.json())
      .then((question) => {
        const modal = this
        modal.querySelector('#edit-question-id').value = getObjectId(
          question._id
        )
        modal.querySelector('#edit-question-text').value = question.questionText
        modal.querySelector('#edit-option-a').value = question.options.A
        modal.querySelector('#edit-option-b').value = question.options.B
        modal.querySelector('#edit-option-c').value = question.options.C
        modal.querySelector('#edit-option-d').value = question.options.D
        modal.querySelector('#edit-correct-answer').value =
          question.correctAnswer
        modal.querySelector('#edit-difficulty').value = question.difficulty
        modal.querySelector('#edit-lesson').value = getObjectId(question.lesson)
        modal.querySelector('#edit-question-solution').value =
          question.solution || ''

        // Fetch chapters for the selected lesson
        fetchChaptersForLesson(getObjectId(question.lesson), 'edit-chapter')

        // Set chapter value after chapters are loaded
        setTimeout(() => {
          modal.querySelector('#edit-chapter').value = question.chapter
        }, 500)

        // Handle image preview
        const imagePreview = modal.querySelector('#edit-image-preview')
        if (question.imageUrl) {
          imagePreview.innerHTML = `<img src="${escapeHtml(
            question.imageUrl
          )}" alt="Question image" class="img-fluid">`
        } else {
          imagePreview.innerHTML = ''
        }
      })
      .catch((error) =>
        console.error('Error fetching question details:', error)
      )
  })

// Handle form submission for editing a question
document
  .getElementById('edit-question-form')
  .addEventListener('submit', function (e) {
    e.preventDefault()

    const questionId = document.querySelector('#edit-question-id').value
    const formData = {
      questionText: document.querySelector('#edit-question-text').value,
      options: {
        A: document.querySelector('#edit-option-a').value,
        B: document.querySelector('#edit-option-b').value,
        C: document.querySelector('#edit-option-c').value,
        D: document.querySelector('#edit-option-d').value,
      },
      correctAnswer: document.querySelector('#edit-correct-answer').value,
      difficulty: document.querySelector('#edit-difficulty').value,
      lesson: document.querySelector('#edit-lesson').value,
      chapter: document.querySelector('#edit-chapter').value,
      solution: document.querySelector('#edit-question-solution').value,
    }

    authenticatedFetch(`http://localhost:5001/api/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success || data._id) {
          alert('Question updated successfully!')
          const modal = bootstrap.Modal.getInstance(
            document.getElementById('editQuestionModal')
          )
          modal.hide()
          fetchQuestions()
        } else {
          throw new Error(data.message || 'Failed to update question')
        }
      })
      .catch((error) => {
        console.error('Error updating question:', error)
        alert('Error updating question. Please try again.')
      })
  })

// Handle form submission for adding a new question
document
  .getElementById('add-question-form')
  .addEventListener('submit', function (e) {
    e.preventDefault()

    const formData = {
      questionText: document.querySelector('#question-text').value,
      options: {
        A: document.querySelector('input[placeholder="Option A"]').value,
        B: document.querySelector('input[placeholder="Option B"]').value,
        C: document.querySelector('input[placeholder="Option C"]').value,
        D: document.querySelector('input[placeholder="Option D"]').value,
      },
      correctAnswer: document.querySelector('#correct-answer').value,
      difficulty: document.querySelector('#difficulty').value,
      lesson: document.querySelector('#lesson').value,
      chapter: document.querySelector('#chapter').value,
      solution: document.querySelector('#question-solution').value,
    }

    authenticatedFetch('http://localhost:5001/api/questions', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success || data._id) {
          alert('Question added successfully!')
          this.reset()
          const modal = bootstrap.Modal.getInstance(
            document.getElementById('addQuestionModal')
          )
          modal.hide()
          fetchQuestions()
        } else {
          throw new Error(data.message || 'Failed to add question')
        }
      })
      .catch((error) => {
        console.error('Error adding question:', error)
        alert('Error adding question. Please try again.')
      })
  })

// Initialize the page
window.onload = function () {
  fetchLessons()
  fetchQuestions()
}

// Logout functionality
function logout() {
  localStorage.removeItem('token')
  window.location.href = 'login.html'
}
