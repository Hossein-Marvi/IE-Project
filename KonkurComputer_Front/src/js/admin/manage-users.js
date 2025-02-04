function fetchUsers() {
  const token = localStorage.getItem('token')

  fetch('http://localhost:5001/api/users', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      const users = Array.isArray(data) ? data : data.users || []

      const tbody = document.getElementById('user-table-body')
      tbody.innerHTML = ''

      users.forEach((user) => {
        const registeredDate = user.registeredOn
          ? new Date(user.registeredOn).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : 'Not Available'

        const row = document.createElement('tr')
        row.setAttribute('data-id', user._id)
        row.innerHTML = `
                <td>${user._id}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.plainPassword || 'Not Available'}</td>
                <td>${registeredDate}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-2" data-bs-toggle="modal" data-bs-target="#editUserModal"
                        data-user-id="${user._id}" 
                        data-full-name="${user.fullName}" 
                        data-email="${user.email}"
                        data-role="${user.role}" 
                        data-password="${user.plainPassword || ''}">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser('${
                      user._id
                    }')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            `
        tbody.appendChild(row)
      })
    })
    .catch((error) => {
      console.error('Error fetching users:', error)
      if (error.message.includes('401')) {
        alert('Session expired. Please login again.')
        logout()
      } else {
        alert('Error loading users. Please refresh the page.')
      }
    })
}
// Edit User Modal: Populate with existing user data
document
  .getElementById('editUserModal')
  .addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget
    const userId = button.getAttribute('data-user-id')
    const fullName = button.getAttribute('data-full-name')
    const email = button.getAttribute('data-email')
    const role = button.getAttribute('data-role')
    const password = button.getAttribute('data-password')

    // Ensure the modal form elements are available
    const editFullName = document.getElementById('edit-full-name')
    const editEmail = document.getElementById('edit-email')
    const editRole = document.getElementById('edit-role')
    const editPassword = document.getElementById('edit-password')

    if (editFullName && editEmail && editRole && editPassword) {
      // Fill form fields with data if elements exist
      editFullName.value = fullName
      editEmail.value = email
      editRole.value = role
      editPassword.value = '' // Allow password to be changed
      document.getElementById('edit-user-id').value = userId // Pass user id to the form
    } else {
      console.error('Form fields not found!')
    }
  })

// Handle form submission for adding a new user
document
  .getElementById('add-user-form')
  .addEventListener('submit', function (e) {
    e.preventDefault()
    const token = localStorage.getItem('token')

    const fullName = document.getElementById('add-full-name').value
    const email = document.getElementById('add-email').value
    const role = document.getElementById('add-role').value
    const password = document.getElementById('add-password').value

    const newUser = { fullName, email, role, password }

    fetch('http://localhost:5001/api/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        alert('User added successfully!')
        this.reset()
        const addModal = bootstrap.Modal.getInstance(
          document.getElementById('addUserModal')
        )
        addModal.hide()
        fetchUsers()
      })
      .catch((error) => {
        console.error('Error adding user:', error)
        if (error.message.includes('401')) {
          alert('Session expired. Please login again.')
          logout()
        } else {
          alert('Error adding user: ' + error.message)
        }
      })
  })

// Handle form submission for editing a user
document
  .getElementById('edit-user-form')
  .addEventListener('submit', function (e) {
    e.preventDefault()
    const token = localStorage.getItem('token')

    const updatedUser = {
      fullName: document.getElementById('edit-full-name').value,
      email: document.getElementById('edit-email').value,
      role: document.getElementById('edit-role').value,
    }

    const password = document.getElementById('edit-password').value
    if (password) {
      updatedUser.password = password
    }

    const userId = document.getElementById('edit-user-id').value

    fetch(`http://localhost:5001/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedUser),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        alert('User updated successfully!')
        const editModal = bootstrap.Modal.getInstance(
          document.getElementById('editUserModal')
        )
        editModal.hide()
        fetchUsers()
      })
      .catch((error) => {
        console.error('Error updating user:', error)
        if (error.message.includes('401')) {
          alert('Session expired. Please login again.')
          logout()
        } else {
          alert('Error updating user: ' + error.message)
        }
      })
  })
// Handle Delete User functionality
function deleteUser(userId) {
  // Find the user's name from the table row
  const userRow = document.querySelector(`tr[data-id="${userId}"]`)
  const userName = userRow
    ? userRow.querySelector('td:nth-child(2)').textContent
    : 'Unknown User'

  const token = localStorage.getItem('token')

  if (confirm(`Are you sure you want to delete user "${userName}"?`)) {
    fetch(`http://localhost:5001/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        // Check if response has content
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return response.json()
        } else {
          return null // Return null for empty responses
        }
      })
      .then((data) => {
        // Show success message and refresh the table
        alert(`User "${userName}" has been deleted successfully!`)
        fetchUsers()
      })
      .catch((error) => {
        console.error('Error deleting user:', error)
        if (error.message.includes('401')) {
          alert('Session expired. Please login again.')
          logout()
        } else {
          alert(`Failed to delete user "${userName}". Please try again.`)
        }
      })
  }
}

// Fetch all users when the page loads
window.onload = fetchUsers

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  window.location.href = 'login.html'
}
