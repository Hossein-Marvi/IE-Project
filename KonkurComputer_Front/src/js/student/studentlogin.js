document
  .getElementById('student-login-form')
  .addEventListener('submit', function (e) {
    e.preventDefault()

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    // Send login request to backend
    fetch('http://localhost:5001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem('token', data.token) // Store token in local storage
          window.location.href = '../student/dashboard.html' // Redirect to student dashboard
        } else {
          alert(data.message)
        }
      })
      .catch((error) => console.error('Error:', error))
  })
