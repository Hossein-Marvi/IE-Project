// adminAuth.js
function checkAdminAuth() {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  if (!token || userRole !== 'Admin') {
    alert('Access denied. Admin privileges required.')
    window.location.href = '../admin/login.html'
    return false
  }
  return true
}

// Add this to prevent back button from accessing admin pages after logout
window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    checkAdminAuth()
  }
})
