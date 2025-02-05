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

// Helper function to handle form data submission
async function submitFormData(url, formData, method) {
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Network response was not ok')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in submitFormData:', error)
    throw error
  }
}

// Helper function to create FormData from question data
function createQuestionFormData(data, imageFile) {
  const formData = new FormData()

  // Add each field individually to FormData
  formData.append('questionText', data.questionText)
  formData.append('correctAnswer', data.correctAnswer)
  formData.append('difficulty', data.difficulty)
  formData.append('lesson', data.lesson)
  formData.append('chapter', data.chapter)
  formData.append('solution', data.solution)

  // Add options as individual fields
  formData.append('optionA', data.options.A)
  formData.append('optionB', data.options.B)
  formData.append('optionC', data.options.C)
  formData.append('optionD', data.options.D)

  // Add image if exists
  if (imageFile) {
    formData.append('image', imageFile)
  }

  return formData
}

function createQuestionFormData(data, imageFile) {
  const formData = new FormData()

  // Add basic fields
  formData.append('questionText', data.questionText)
  formData.append('correctAnswer', data.correctAnswer)
  formData.append('difficulty', data.difficulty)
  formData.append('lesson', data.lesson)
  formData.append('chapter', data.chapter)
  formData.append('solution', data.solution)

  // Add options as a JSON string
  formData.append(
    'options',
    JSON.stringify({
      A: data.options.A,
      B: data.options.B,
      C: data.options.C,
      D: data.options.D,
    })
  )

  // Add image if exists
  if (imageFile) {
    formData.append('image', imageFile)
  }

  return formData
}
// Helper function to setup image preview
function setupImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId)
  const preview = document.getElementById(previewId)

  input.addEventListener('change', function () {
    if (this.files && this.files[0]) {
      const reader = new FileReader()
      reader.onload = function (e) {
        preview.innerHTML = `
          <div class="mt-2">
            <img src="${e.target.result}" class="img-fluid" alt="Question image preview">
          </div>
        `
      }
      reader.readAsDataURL(this.files[0])
    }
  })
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
      const lessons = Array.isArray(data) ? data : data.lessons || []

      lessons.forEach((lesson) => {
        lessonMap.set(getObjectId(lesson._id), lesson.lessonName)
      })

      // Then fetch questions
      return authenticatedFetch('http://localhost:5001/api/questions')
        .then((response) => response.json())
        .then((questionsData) => {
          tableBody.innerHTML = ''
          questionsStore.clear() // Clear the store before adding new questions

          // Ensure questions is an array
          const questions = Array.isArray(questionsData)
            ? questionsData
            : questionsData.questions || []

          if (questions.length === 0) {
            tableBody.innerHTML = `
              <tr>
                <td colspan="6" class="text-center">No questions found</td>
              </tr>
            `
            return
          }

          questions.forEach((question) => {
            // Safely get the lesson ID and handle potential null values
            const lessonId = question.lesson
              ? getObjectId(question.lesson._id)
              : null
            const lessonName = lessonId
              ? lessonMap.get(lessonId) || 'N/A'
              : 'N/A'

            // Store question data for later use
            questionsStore.set(getObjectId(question._id), question)

            const row = document.createElement('tr')
            row.innerHTML = `
              <td>${getObjectId(question._id)}</td>
              <td>
                ${escapeHtml(question.questionText)}
                ${
                  question.imageUrl
                    ? `<br><img src="http://localhost:5001${question.imageUrl}" alt="Question image" class="img-fluid mt-2" style="max-height: 100px;">`
                    : ''
                }
              </td>
              <td>${escapeHtml(lessonName)}</td>
              <td>${escapeHtml(question.chapter || 'N/A')}</td>
              <td>${escapeHtml(question.difficulty || 'N/A')}</td>
              <td>
                <button class="btn btn-primary btn-sm edit-question-btn" 
                  data-bs-toggle="modal" 
                  data-bs-target="#editQuestionModal"
                  data-question-id="${getObjectId(question._id)}">
                  Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteQuestion('${getObjectId(
                  question._id
                )}')">
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
            Error loading questions: ${error.message}
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
      imagePreview.innerHTML = `
        <div class="mt-2">
          <img src="http://localhost:5001${question.imageUrl}" alt="Question image" class="img-fluid">
        </div>
      `
    } else {
      imagePreview.innerHTML = ''
    }
  })

// Handle form submission for editing a question
document
  .getElementById('edit-question-form')
  .addEventListener('submit', async function (e) {
    e.preventDefault()

    try {
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

      const imageFile = document.querySelector('#edit-question-image').files[0]
      const questionFormData = createQuestionFormData(formData, imageFile)

      // Add this inside your form submit handler, before the submitFormData call
      console.log('Form Data Contents:')
      for (let pair of questionFormData.entries()) {
        console.log(pair[0] + ': ' + pair[1])
      }
      const data = await submitFormData(
        `http://localhost:5001/api/questions/${questionId}`,
        questionFormData,
        'PUT'
      )

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
    } catch (error) {
      console.error('Error updating question:', error)
      alert('Error updating question. Please try again.')
    }
  })

// Handle form submission for adding a new question
document
  .getElementById('add-question-form')
  .addEventListener('submit', async function (e) {
    e.preventDefault()

    try {
      // Get all form values
      const formData = {
        questionText: document.getElementById('question-text').value.trim(),
        options: {
          A: document
            .querySelector('input[placeholder="Option A"]')
            .value.trim(),
          B: document
            .querySelector('input[placeholder="Option B"]')
            .value.trim(),
          C: document
            .querySelector('input[placeholder="Option C"]')
            .value.trim(),
          D: document
            .querySelector('input[placeholder="Option D"]')
            .value.trim(),
        },
        correctAnswer: document.getElementById('correct-answer').value,
        difficulty: document.getElementById('difficulty').value,
        lesson: document.getElementById('lesson').value,
        chapter: document.getElementById('chapter').value,
        solution: document.getElementById('question-solution').value.trim(),
      }

      // Validate form data
      if (!formData.questionText) throw new Error('Question text is required')
      if (!formData.correctAnswer) throw new Error('Correct answer is required')
      if (!formData.difficulty) throw new Error('Difficulty is required')
      if (!formData.lesson) throw new Error('Lesson is required')
      if (!formData.chapter) throw new Error('Chapter is required')

      // Validate options
      if (Object.values(formData.options).some((opt) => !opt)) {
        throw new Error('All options must be filled out')
      }

      const imageFile = document.getElementById('question-image').files[0]
      const questionFormData = createQuestionFormData(formData, imageFile)

      // Debug log
      console.log('Submitting form data:')
      for (let pair of questionFormData.entries()) {
        console.log(pair[0] + ': ' + pair[1])
      }

      const response = await fetch('http://localhost:5001/api/questions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: questionFormData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add question')
      }

      const result = await response.json()

      if (result._id) {
        alert('Question added successfully!')
        this.reset()
        document.getElementById('image-preview').innerHTML = ''
        const modal = bootstrap.Modal.getInstance(
          document.getElementById('addQuestionModal')
        )
        modal.hide()
        fetchQuestions()
      } else {
        throw new Error('Failed to add question')
      }
    } catch (error) {
      console.error('Error adding question:', error)
      alert(error.message || 'Error adding question. Please try again.')
    }
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

  // Setup image previews
  setupImagePreview('question-image', 'image-preview')
  setupImagePreview('edit-question-image', 'edit-image-preview')
}

// Logout functionality
function logout() {
  localStorage.removeItem('token')
  window.location.href = 'login.html'
}
