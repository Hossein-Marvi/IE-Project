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

// Helper function to prevent XSS
function escapeHtml(str) {
  if (!str) return ''
  return str
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Fetch all lessons from the backend
function fetchLessons() {
  const tableBody = document.getElementById('lesson-table-body')
  if (!tableBody) return

  // Show loading state
  tableBody.innerHTML = `
    <tr>
      <td colspan="4" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </td>
    </tr>
  `

  authenticatedFetch('http://localhost:5001/api/lessons')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      const lessons = data.lessons || []
      tableBody.innerHTML = '' // Clear the loading state

      if (lessons.length === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="4" class="text-center">No lessons found</td></tr>'
        return
      }

      lessons.forEach((lesson) => {
        if (!lesson || !lesson._id) return

        const row = document.createElement('tr')
        row.setAttribute('data-id', lesson._id)
        row.innerHTML = `
          <td>${lesson._id}</td>
          <td>${escapeHtml(lesson.lessonName)}</td>
          <td>
            <ul>
              ${(lesson.chapters || [])
                .map((chapter) => `<li>${escapeHtml(chapter)}</li>`)
                .join('')}
            </ul>
          </td>
          <td>
            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" 
              data-bs-target="#editLessonModal"
              data-lesson-id="${lesson._id}" 
              data-lesson-name="${escapeHtml(lesson.lessonName)}" 
              data-chapters="${escapeHtml((lesson.chapters || []).join(','))}">
              Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteLesson('${
              lesson._id
            }')">
              Delete
            </button>
          </td>
        `
        tableBody.appendChild(row)
      })
    })
    .catch((error) => {
      console.error('Error fetching lessons:', error)
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">
            Error loading lessons. Please try again later.
          </td>
        </tr>
      `
    })
}

// Delete lesson
function deleteLesson(lessonId) {
  if (!confirm(`Are you sure you want to delete Lesson ID: ${lessonId}?`)) {
    return
  }

  authenticatedFetch(`http://localhost:5001/api/lessons/${lessonId}`, {
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert('Lesson deleted successfully.')
        fetchLessons()
      } else {
        throw new Error(data.message)
      }
    })
    .catch((error) => {
      console.error('Error deleting lesson:', error)
      alert('Error deleting lesson. Please try again.')
    })
}

// Add new lesson functionality
document
  .getElementById('add-lesson-form')
  .addEventListener('submit', function (e) {
    e.preventDefault()

    const lessonData = {
      lessonName: document.getElementById('lesson-name').value,
      chapters: Array.from(
        document.querySelectorAll('input[name="chapters[]"]')
      )
        .map((input) => input.value.trim())
        .filter((chapter) => chapter !== ''),
    }

    authenticatedFetch('http://localhost:5001/api/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert('Lesson added successfully!')
          this.reset()
          const addModal = bootstrap.Modal.getInstance(
            document.getElementById('addLessonModal')
          )
          addModal.hide()
          fetchLessons()
        } else {
          throw new Error(data.message)
        }
      })
      .catch((error) => {
        console.error('Error adding lesson:', error)
        alert('Error adding lesson. Please try again.')
      })
  })

// Edit Lesson Modal: Populate with existing lesson data
document
  .getElementById('editLessonModal')
  .addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget
    const lessonId = button.getAttribute('data-lesson-id')
    const lessonName = button.getAttribute('data-lesson-name')
    const chapters = button.getAttribute('data-chapters').split(',')

    const editLessonName = document.getElementById('edit-lesson-name')
    const editChapterContainer = document.getElementById(
      'edit-chapter-container'
    )

    if (!editLessonName || !editChapterContainer) {
      console.error('Form fields not found!')
      return
    }

    editLessonName.value = lessonName
    editChapterContainer.innerHTML = '' // Clear existing chapters

    chapters.forEach((chapter) => {
      if (!chapter.trim()) return

      const chapterInput = document.createElement('div')
      chapterInput.classList.add('input-group', 'mb-3')
      chapterInput.innerHTML = `
      <input type="text" class="form-control" value="${escapeHtml(
        chapter.trim()
      )}" required>
      <button type="button" class="btn btn-danger remove-chapter-btn">Remove</button>
    `

      editChapterContainer.appendChild(chapterInput)

      chapterInput
        .querySelector('.remove-chapter-btn')
        .addEventListener('click', function () {
          editChapterContainer.removeChild(chapterInput)
        })
    })

    document.getElementById('edit-lesson-id').value = lessonId
  })

// Handle form submission for editing a lesson
document
  .getElementById('edit-lesson-form')
  .addEventListener('submit', function (e) {
    e.preventDefault()

    const lessonId = document.getElementById('edit-lesson-id').value
    const updatedLessonData = {
      lessonName: document.getElementById('edit-lesson-name').value,
      chapters: Array.from(
        document.querySelectorAll('#edit-chapter-container input')
      )
        .map((input) => input.value.trim())
        .filter((chapter) => chapter !== ''),
    }

    authenticatedFetch(`http://localhost:5001/api/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedLessonData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert('Lesson updated successfully!')
          const editModal = bootstrap.Modal.getInstance(
            document.getElementById('editLessonModal')
          )
          editModal.hide()
          fetchLessons()
        } else {
          throw new Error(data.message)
        }
      })
      .catch((error) => {
        console.error('Error updating lesson:', error)
        alert('Error updating lesson. Please try again.')
      })
  })

// Add chapter functionality for Add Lesson Modal
document
  .getElementById('add-chapter-btn')
  .addEventListener('click', function () {
    const chapterContainer = document.getElementById('chapter-container')
    const chapterId = `chapter-${chapterContainer.children.length + 1}`

    const chapterInputGroup = document.createElement('div')
    chapterInputGroup.classList.add('input-group', 'mb-3', 'chapter-input')
    chapterInputGroup.innerHTML = `
    <label for="${chapterId}" class="form-label">Chapter ${
      chapterContainer.children.length + 1
    }</label>
    <input type="text" class="form-control" id="${chapterId}" 
      placeholder="Chapter name" name="chapters[]" required>
    <button type="button" class="btn btn-danger remove-chapter-btn">Remove</button>
  `

    chapterContainer.appendChild(chapterInputGroup)

    chapterInputGroup
      .querySelector('.remove-chapter-btn')
      .addEventListener('click', function () {
        chapterContainer.removeChild(chapterInputGroup)
      })
  })

// Add chapter functionality for Edit Lesson Modal
document
  .getElementById('edit-add-chapter-btn')
  .addEventListener('click', function () {
    const editChapterContainer = document.getElementById(
      'edit-chapter-container'
    )
    const chapterId = `edit-chapter-${editChapterContainer.children.length + 1}`

    const editChapterInputGroup = document.createElement('div')
    editChapterInputGroup.classList.add('input-group', 'mb-3')
    editChapterInputGroup.innerHTML = `
    <input type="text" class="form-control" id="${chapterId}" 
      placeholder="Chapter name" required>
    <button type="button" class="btn btn-danger remove-chapter-btn">Remove</button>
  `

    editChapterContainer.appendChild(editChapterInputGroup)

    editChapterInputGroup
      .querySelector('.remove-chapter-btn')
      .addEventListener('click', function () {
        editChapterContainer.removeChild(editChapterInputGroup)
      })
  })

// Logout functionality
function logout() {
  localStorage.removeItem('token')
  window.location.href = 'login.html'
}

// Initialize the page
window.onload = fetchLessons
