document
  .getElementById('student-signup-form')
  .addEventListener('submit', function (e) {
    e.preventDefault()

    const fullName = document.getElementById('name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    // Send signup request to backend
    fetch('http://localhost:5001/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password, role: 'student' }), // Role is 'student'
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
