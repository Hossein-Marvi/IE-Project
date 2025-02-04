// Fetch student info from backend
const token = localStorage.getItem('token') // Get token from local storage
console.log('Token from LocalStorage:', token) // Log the token

if (!token) {
  // Redirect to login if no token found
  window.location.href = '/student/login.html'
}
console.log('Authorization Header:', `Bearer ${token}`) // Log the Authorization header
fetch('http://localhost:5001/api/profile', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then((response) => response.json())
  .then((data) => {
    if (data.userId) {
      document.getElementById(
        'welcome-message'
      ).textContent = `Welcome, ${data.fullName}`
    }
  })
  .catch((error) => {
    console.error('Error fetching user profile:', error)
    window.location.href = '/student/login.html' // Redirect to login on failure
  })

function logout() {
  localStorage.removeItem('token')
  window.location.href = 'login.html'
}
