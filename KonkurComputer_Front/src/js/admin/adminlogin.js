document
  .getElementById('admin-login-form')
  .addEventListener('submit', function (e) {
    e.preventDefault()

    const email = document.getElementById('admin-email').value
    const password = document.getElementById('admin-password').value

    // Send login request to admin login endpoint

    fetch('http://localhost:5001/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || 'Login failed')
          })
        }
        return response.json()
      })
      .then((data) => {
        if (data.token) {
          // Store token and user data
          localStorage.setItem('token', data.token)
          localStorage.setItem('userRole', data.user.role)
          localStorage.setItem('userName', data.user.fullName)

          // Redirect to admin dashboard
          window.location.href = '../admin/dashboard.html'
        } else {
          throw new Error(data.message || 'Login failed')
        }
      })
      .catch((error) => {
        console.error('Error:', error)
        alert(error.message || 'Login failed. Please try again.')
      })
  })

// Add check on page load to prevent access if already logged in as non-admin
window.addEventListener('load', function () {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  if (token && userRole !== 'Admin') {
    alert('Access denied. Admin privileges required.')
    window.location.href = '../student/login.html'
  }
})
