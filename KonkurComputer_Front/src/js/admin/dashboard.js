// js/admin/dashboard.js
function checkAdminAuth() {
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = 'login.html'
    return false
  }
  return true
}

// Function to get admin profile
async function getAdminProfile() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = 'login.html'
      return
    }

    const response = await fetch('http://localhost:5001/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch admin profile')
    }

    const data = await response.json()
    const adminNameElement = document.getElementById('admin-name')
    if (adminNameElement) {
      adminNameElement.textContent = data.fullName
    }
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    // Handle error appropriately
  }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
  getAdminProfile()
})

// Logout function
function logout() {
  localStorage.removeItem('token')
  window.location.href = 'login.html'
}
