// ============================================================
// DASHBOARD.JS - XREZZKY TOP UP
// ============================================================

import { getCurrentUser, logoutUser, updateProfile } from '../../supabase/auth.js'
import { getUserTransactions } from '../../supabase/database.js'

// ===== DASHBOARD =====
document.addEventListener('DOMContentLoaded', async () => {
    // Check Auth
    const userResult = await getCurrentUser()
    if (!userResult.success) {
        window.location.href = 'login.html'
        return
    }

    const user = userResult.user

    // Greeting
    const greeting = document.getElementById('userGreeting')
    if (greeting) {
        greeting.textContent = `Halo, ${user.full_name || user.username || 'User'}!`
    }

    // Load Stats
    await loadStats(user.id)

    // Load Recent Transactions
    await loadRecentTransactions(user.id)

    // Profile Page
    if (window.location.pathname.includes('profile.html')) {
        loadProfile(user)
    }

    // Logout
    document.querySelectorAll('#logoutBtn, #logoutBtnMobile, #logoutNav, #logoutMobileNav').forEach(btn => {
        btn?.addEventListener('click', async (e) => {
            e.preventDefault()
            const result = await logoutUser()
            if (result.success) {
                window.location.href = 'index.html'
            }
        })
    })

    // Profile Form
    const profileForm = document.getElementById('profileForm')
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            const updates = {
                full_name: document.getElementById('fullname').value,
                username: document.getElementById('username').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value
            }
            const result = await updateProfile(user.id, updates)
            if (result.success) {
                alert('Profil berhasil diperbarui!')
            } else {
                alert('Gagal memperbarui profil: ' + result.error)
            }
        })
    }
})

async function loadStats(userId) {
    const container = document.getElementById('dashboardStats')
    if (!container) return

    // Get transactions
    const result = await getUserTransactions(userId)
    if (!result.success) return

    const transactions = result.data || []
    const total = transactions.reduce((sum, t) => sum + (t.price || 0), 0)
    const successCount = transactions.filter(t => t.status === 'success').length

    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">🎮</div>
            <div>
                <div class="stat-number">${transactions.length}</div>
                <div class="stat-label">Total Top Up</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div>
                <div class="stat-number">Rp ${total.toLocaleString()}</div>
                <div class="stat-label">Total Belanja</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div>
                <div class="stat-number">${successCount > 0 ? '4.8' : '-'}</div>
                <div class="stat-label">Rating</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🎁</div>
            <div>
                <div class="stat-number">${transactions.filter(t => t.status === 'pending').length}</div>
                <div class="stat-label">Proses</div>
            </div>
        </div>
    `
}

async function loadRecentTransactions(userId) {
    const tbody = document.getElementById('recentBody')
    if (!tbody) return

    const result = await getUserTransactions(userId)
    if (!result.success) return

    const transactions = (result.data || []).slice(0, 5)
    tbody.innerHTML = transactions.map(t => `
        <tr>
            <td>${t.games?.name || 'Game'}</td>
            <td>Rp ${(t.price || 0).toLocaleString()}</td>
            <td>${new Date(t.created_at).toLocaleDateString('id-ID')}</td>
            <td><span class="status-badge ${t.status === 'success' ? 'success' : t.status === 'pending' ? 'pending' : 'failed'}">${t.status === 'success' ? 'Berhasil' : t.status === 'pending' ? 'Proses' : 'Gagal'}</span></td>
        </tr>
    `).join('')
}

function loadProfile(user) {
    document.getElementById('userName').textContent = user.full_name || user.username || 'User'
    document.getElementById('userEmail').textContent = user.email || ''
    document.getElementById('fullname').value = user.full_name || ''
    document.getElementById('username').value = user.username || ''
    document.getElementById('phone').value = user.phone || ''
    document.getElementById('address').value = user.address || ''
}

// ===== HISTORY PAGE =====
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.location.pathname.includes('history.html')) return

    const userResult = await getCurrentUser()
    if (!userResult.success) {
        window.location.href = 'login.html'
        return
    }

    await loadHistory(userResult.user.id)
})

async function loadHistory(userId) {
    const list = document.getElementById('historyList')
    if (!list) return

    const result = await getUserTransactions(userId)
    if (!result.success) return

    const transactions = result.data || []
    list.innerHTML = transactions.map(t => `
        <div class="history-item">
            <div class="history-game">${t.games?.icon || '🎮'} ${t.games?.name || 'Game'}</div>
            <div class="history-detail">
                <div>${t.nominal || 0} 💎</div>
                <div>Rp ${(t.price || 0).toLocaleString()}</div>
                <div>${new Date(t.created_at).toLocaleString('id-ID')}</div>
                <span class="status-badge ${t.status === 'success' ? 'success' : t.status === 'pending' ? 'pending' : 'failed'}">${t.status === 'success' ? 'Berhasil' : t.status === 'pending' ? 'Proses' : 'Gagal'}</span>
            </div>
        </div>
    `).join('')
}