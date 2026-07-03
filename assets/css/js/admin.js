// ============================================================
// ADMIN.JS - XREZZKY TOP UP
// ============================================================

import { supabase } from '../../supabase/config.js'
import { getCurrentUser } from '../../supabase/auth.js'

// ===== ADMIN CHECK =====
document.addEventListener('DOMContentLoaded', async () => {
    const userResult = await getCurrentUser()
    if (!userResult.success) {
        window.location.href = '../login.html'
        return
    }

    // Check if user is admin (role = 'admin')
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userResult.user.id)
        .single()

    if (userData?.role !== 'admin') {
        window.location.href = '../dashboard.html'
        return
    }

    // Load admin dashboard
    await loadAdminStats()
    await loadRecentTransactions()
})

async function loadAdminStats() {
    const container = document.querySelector('.admin-stats')
    if (!container) return

    const [usersCount, transactionsCount, gamesCount, promosCount] = await Promise.all([
        supabase.from('users').select('count'),
        supabase.from('transactions').select('count'),
        supabase.from('games').select('count'),
        supabase.from('promos').select('count')
    ])

    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">👤</div>
            <div>
                <div class="stat-number">${usersCount.count || 0}</div>
                <div class="stat-label">Total User</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div>
                <div class="stat-number">${transactionsCount.count || 0}</div>
                <div class="stat-label">Total Transaksi</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🎮</div>
            <div>
                <div class="stat-number">${gamesCount.count || 0}</div>
                <div class="stat-label">Total Game</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🎁</div>
            <div>
                <div class="stat-number">${promosCount.count || 0}</div>
                <div class="stat-label">Total Promo</div>
            </div>
        </div>
    `
}

async function loadRecentTransactions() {
    const tbody = document.getElementById('adminRecentBody')
    if (!tbody) return

    const { data } = await supabase
        .from('transactions')
        .select(`
            *,
            users:user_id (full_name, email),
            games:game_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

    if (data) {
        tbody.innerHTML = data.map(t => `
            <tr>
                <td>${t.users?.full_name || 'User'}</td>
                <td>${t.games?.name || 'Game'}</td>
                <td>Rp ${t.price.toLocaleString()}</td>
                <td><span class="status-badge ${t.status}">${t.status}</span></td>
                <td>${new Date(t.created_at).toLocaleString('id-ID')}</td>
            </tr>
        `).join('')
    }
}