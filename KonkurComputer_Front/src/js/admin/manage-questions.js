// Global store for questions data
let questionsStore = new Map()

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

      // Clear existing options
      lessonSelect.innerHTML = ''
      editLessonSelect.innerHTML = ''

      // Add default options
      const defaultOption = document.createElement('option')
      defaultOption.value = ''
      defaultOption.textContent = 'Select lesson'
      defaultOption.selected = true
      defaultOption.disabled = true

      lessonSelect.appendChild(defaultOption.cloneNode(true))
      editLessonSelect.appendChild(defaultOption.cloneNode(true))

      lessons.forEach((lesson) => {
        const option = document.createElement('option')
        option.value = getObjectId(lesson._id)
        option.textContent = lesson.lessonName

        lessonSelect.appendChild(option.cloneNode(true))
        editLessonSelect.appendChild(option.cloneNode(true))
      })

      // Add change event listeners
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
  if (!lessonId) {
    console.log('No lesson ID provided')
    return
  }

  authenticatedFetch(`http://localhost:5001/api/lessons/${lessonId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then((data) => {
      const lesson = data.lesson || data
      const chapterSelect = document.getElementById(chapterSelectId)
      chapterSelect.innerHTML = ''

      const defaultOption = document.createElement('option')
      defaultOption.value = ''
      defaultOption.textContent = 'Select chapter'
      defaultOption.selected = true
      defaultOption.disabled = true
      chapterSelect.appendChild(defaultOption)

      if (lesson && Array.isArray(lesson.chapters)) {
        lesson.chapters.forEach((chapter) => {
          const option = document.createElement('option')
          option.value = chapter
          option.textContent = chapter
          chapterSelect.appendChild(option)
        })
      }
    })
    .catch((error) => {
      console.error('Error fetching chapters:', error)
      const chapterSelect = document.getElementById(chapterSelectId)
      chapterSelect.innerHTML =
        '<option value="" disabled selected>Error loading chapters</option>'
    })
}

// Fetch and display questions
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
  authenticatedFetch('http://localhost:5001/api/lessons')
    .then((response) => response.json())
    .then((data) => {
      const lessonMap = new Map()
      const lessons = data.lessons || []

      lessons.forEach((lesson) => {
        lessonMap.set(lesson._id, lesson.lessonName)
      })

      // Then fetch questions
      return authenticatedFetch('http://localhost:5001/api/questions')
        .then((response) => response.json())
        .then((questions) => {
          tableBody.innerHTML = ''
          questionsStore.clear() // Clear the store before adding new questions

          if (!Array.isArray(questions) || questions.length === 0) {
            tableBody.innerHTML = `
              <tr>
                <td colspan="6" class="text-center">No questions found</td>
              </tr>
            `
            return
          }

          questions.forEach((question) => {
            // Store question data for later use
            questionsStore.set(question._id, question)

            const lessonId = question.lesson._id
            const lessonName = lessonMap.get(lessonId) || 'N/A'

            const row = document.createElement('tr')
            row.innerHTML = `
              <td>${question._id}</td>
              <td>${escapeHtml(question.questionText)}</td>
              <td>${escapeHtml(lessonName)}</td>
              <td>${escapeHtml(question.chapter)}</td>
              <td>${escapeHtml(question.difficulty)}</td>
              <td>
                <button class="btn btn-primary btn-sm edit-question-btn" 
                  data-bs-toggle="modal" 
                  data-bs-target="#editQuestionModal"
                  data-question-id="${question._id}">
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

// Populate Edit Modal with existing question data
document
  .getElementById('editQuestionModal')
  .addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget
    const questionId = button.getAttribute('data-question-id')
    const question = questionsStore.get(questionId)

    if (!question) {
      console.error('Question not found in store')
      return
    }

    const modal = this

    // Populate form fields
    modal.querySelector('#edit-question-id').value = question._id
    modal.querySelector('#edit-question-text').value = question.questionText
    modal.querySelector('#edit-option-a').value = question.options.A
    modal.querySelector('#edit-option-b').value = question.options.B
    modal.querySelector('#edit-option-c').value = question.options.C
    modal.querySelector('#edit-option-d').value = question.options.D
    modal.querySelector('#edit-correct-answer').value = question.correctAnswer
    modal.querySelector('#edit-difficulty').value = question.difficulty
    modal.querySelector('#edit-lesson').value = question.lesson._id
    modal.querySelector('#edit-question-solution').value =
      question.solution || ''

    // Fetch chapters and set the chapter value
    fetchChaptersForLesson(question.lesson._id, 'edit-chapter')
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
