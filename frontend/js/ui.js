// UI module - handles all DOM manipulation, display functions, and user interface interactions
import { selectUser, selectTransaction } from './graph-explorer.js';
import { loadExplorerData } from './graph-explorer.js';

// Navigation functionality
export function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

export function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName).classList.add('active');

    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Load section-specific data
    if (sectionName === 'graph-explorer') {
        loadExplorerData().catch(error => {
            console.error('Error loading explorer data:', error);
        });
    }
}

// Show message function
export function showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    // Add to page
    document.body.appendChild(messageDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Function to display users
export function displayUsers(usersToShow) {
    const container = document.getElementById('usersList');
    if (!container) return;

    container.innerHTML = '';

    usersToShow.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = `entity-item user-item`;
        userDiv.onclick = (event) => {
            selectUser(user, event);
            window.loadUserRelationships(user.id);
        };

        const riskLevel = user.metadata?.riskLevel || 'unknown';
        const accountAge = user.metadata?.accountAge || 0;

        userDiv.innerHTML = `
            <div class="entity-header">
                <span class="entity-name">${user.name}</span>
                <span class="risk-badge ${riskLevel}">${riskLevel}</span>
            </div>
            <div class="entity-id">${user.id}</div>
            <div class="entity-details">
                ${user.email} • Account Age: ${accountAge} days
            </div>
        `;

        container.appendChild(userDiv);
    });

    // Update graph after users are displayed
    if (window.updateGraphData) {
        window.updateGraphData();
    }
}

// Function to display transactions
export function displayTransactions(transactionsToShow) {
    const container = document.getElementById('transactionsList');
    if (!container) return;

    container.innerHTML = '';

    transactionsToShow.forEach(tx => {
        const txDiv = document.createElement('div');
        txDiv.className = `entity-item transaction-item`;
        txDiv.onclick = (event) => selectTransaction(tx, event);

        const category = tx.metadata?.category || 'unknown';
        const amount = tx.amount || 0;
        const currency = tx.currency || 'USD';

        txDiv.innerHTML = `
            <div class="entity-header">
                <span class="entity-name">${tx.description || 'Transaction'}</span>
                <span class="risk-badge ${category}">${category}</span>
            </div>
            <div class="entity-id">${tx.id}</div>
            <div class="entity-details">
                $${amount} ${currency} • ${tx.status || 'PENDING'}
            </div>
        `;

        container.appendChild(txDiv);
    });

    // Update graph after transactions are displayed
    if (window.updateGraphData) {
        window.updateGraphData();
    }
}

// Detail Modal
export function showNodeDetails(nodeData) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');

    if (nodeData.type === 'user') {
        content.innerHTML = generateUserDetails(nodeData);
    }

    modal.style.display = 'block';
}

function generateUserDetails(user) {
    const riskLevel = user.metadata?.riskLevel || 'unknown';
    const accountAge = user.metadata?.accountAge || 0;
    const paymentMethods = user.paymentMethods ? Object.values(user.paymentMethods) : [];

    return `
        <div class="detail-section">
            <h4><i class="fas fa-user"></i> User Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${user.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">User ID</span>
                    <span class="detail-value">${user.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${user.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${user.phone || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Address</span>
                    <span class="detail-value">${user.address || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Risk Level</span>
                    <span class="detail-value risk-badge ${riskLevel}">${riskLevel}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4><i class="fas fa-chart-line"></i> Account Details</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Account Age</span>
                    <span class="detail-value">${accountAge} days</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Created</span>
                    <span class="detail-value">${formatDate(user.createdAt)}</span>
                </div>
            </div>
        </div>
        
        ${paymentMethods.length > 0 ? `
        <div class="detail-section">
            <h4><i class="fas fa-credit-card"></i> Payment Methods</h4>
            <div class="detail-grid">
                ${paymentMethods.map(method => `
                    <div class="detail-item">
                        <span class="detail-value">${method}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="detail-section">
            <h4><i class="fas fa-cog"></i> Metadata</h4>
            <div class="detail-item">
                <span class="detail-value metadata">${JSON.stringify(user.metadata || {}, null, 2)}</span>
            </div>
        </div>
    `;
}

export function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    modal.style.display = 'none';
}

// Function to show loading indicator
export function showLoadingIndicator(message = 'Loading...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.className = 'loading-indicator';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${message}</p>
    `;
    document.body.appendChild(loadingDiv);
}

// Function to hide loading indicator
export function hideLoadingIndicator() {
    const loadingDiv = document.getElementById('loadingIndicator');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Search and filter functionality
export function filterUsers(users) {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('userFilter')?.value || '';

    let filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.id.toLowerCase().includes(searchTerm);

        let matchesFilter = true;
        if (filterValue && filterValue !== '') {
            matchesFilter = user.metadata?.riskLevel === filterValue;
        }

        return matchesSearch && matchesFilter;
    });

    displayUsers(filteredUsers);
}

export function filterTransactions(transactions) {
    const searchTerm = document.getElementById('transactionSearch')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('transactionFilter')?.value || '';

    let filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.id.toLowerCase().includes(searchTerm) ||
            tx.description?.toLowerCase().includes(searchTerm) ||
            tx.fromUserId.toLowerCase().includes(searchTerm) ||
            tx.toUserId.toLowerCase().includes(searchTerm);

        let matchesFilter = true;
        if (filterValue && filterValue !== '') {
            matchesFilter = tx.metadata?.category === filterValue;
        }

        return matchesSearch && matchesFilter;
    });

    displayTransactions(filteredTransactions);
}

// Export functionality
export function exportGraphData(format) {
    // Get data from the global scope (api module)
    const users = window.users || [];
    const transactions = window.transactions || [];

    if (format === 'csv') {
        exportToCSV(users, transactions);
    } else if (format === 'json') {
        exportToJSON(users, transactions);
    }
}

function exportToCSV(users, transactions) {
    // Export users to CSV
    const usersCSV = convertUsersToCSV(users);
    downloadCSV(usersCSV, 'users_export.csv', 'text/csv');

    // Export transactions to CSV
    const transactionsCSV = convertTransactionsToCSV(transactions);
    downloadCSV(transactionsCSV, 'transactions_export.csv', 'text/csv');

    showMessage('CSV files exported successfully!', 'success');
}

function exportToJSON(users, transactions) {
    const graphData = {
        users: users,
        transactions: transactions,
        exportDate: new Date().toISOString(),
        totalUsers: users.length,
        totalTransactions: transactions.length
    };

    const jsonString = JSON.stringify(graphData, null, 2);
    downloadFile(jsonString, 'graph_data_export.json', 'application/json');

    showMessage('JSON file exported successfully!', 'success');
}

function convertUsersToCSV(users) {
    if (users.length === 0) return 'No users found';

    // Define CSV headers
    const headers = [
        'User ID', 'Name', 'Email', 'Phone', 'Address', 'Risk Level',
        'Account Age', 'Created At', 'Payment Methods'
    ];

    // Convert users to CSV rows
    const rows = users.map(user => [
        user.id || 'N/A',
        user.name || 'N/A',
        user.email || 'N/A',
        user.phone || 'N/A',
        user.address || 'N/A',
        user.metadata?.riskLevel || 'N/A',
        user.metadata?.accountAge || 'N/A',
        user.createdAt || 'N/A',
        user.paymentMethods ? Object.values(user.paymentMethods).join('; ') : 'N/A'
    ]);

    // Combine headers and rows
    return [headers, ...rows].map(row =>
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
}

function convertTransactionsToCSV(transactions) {
    if (transactions.length === 0) return 'No transactions found';

    // Define CSV headers
    const headers = [
        'Transaction ID', 'Amount', 'Currency', 'Description', 'Status', 'Type',
        'From User ID', 'To User ID', 'Category', 'IP Address', 'Device ID',
        'Timestamp', 'Created At', 'Business', 'Merchant'
    ];

    // Convert transactions to CSV rows
    const rows = transactions.map(tx => [
        tx.id || 'N/A',
        tx.amount || 'N/A',
        tx.currency || 'N/A',
        tx.description || 'N/A',
        tx.status || 'N/A',
        tx.type || 'N/A',
        tx.fromUserId || 'N/A',
        tx.toUserId || 'N/A',
        tx.metadata?.category || 'N/A',
        tx.ipAddress || 'N/A',
        tx.deviceId || 'N/A',
        tx.timestamp || 'N/A',
        tx.createdAt || 'N/A',
        tx.metadata?.business || 'N/A',
        tx.metadata?.merchant || 'N/A'
    ]);

    // Combine headers and rows
    return [headers, ...rows].map(row =>
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
}

function downloadCSV(csvContent, filename, mimeType) {
    const blob = new Blob([csvContent], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Event Listeners
export function setupEventListeners() {
    // Search and filter functionality
    const userSearch = document.getElementById('userSearch');
    const userFilter = document.getElementById('userFilter');
    const transactionSearch = document.getElementById('transactionSearch');
    const transactionFilter = document.getElementById('transactionFilter');

    if (userSearch) userSearch.addEventListener('input', () => filterUsers(window.users || []));
    if (userFilter) userFilter.addEventListener('change', () => filterUsers(window.users || []));
    if (transactionSearch) transactionSearch.addEventListener('input', () => filterTransactions(window.transactions || []));
    if (transactionFilter) transactionFilter.addEventListener('change', () => filterTransactions(window.transactions || []));

    const refreshBtn = document.getElementById('refreshRelationshipsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // This will be handled by the graph-explorer module
            window.refreshSharedAttributeEdges();
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Utility functions
export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

// Data Management UI Functions
export function updateDataManagementButtons() {
    const loadSampleDataBtn = document.getElementById('loadSampleDataBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');

    // Check if data exists using the hasData function
    const dataExists = window.hasData && window.hasData();

    if (dataExists) {
        // Show clear data button, hide load sample data button
        if (loadSampleDataBtn) loadSampleDataBtn.style.display = 'none';
        if (clearDataBtn) clearDataBtn.style.display = 'inline-flex';
    } else {
        // Show load sample data button, hide clear data button
        if (loadSampleDataBtn) loadSampleDataBtn.style.display = 'inline-flex';
        if (clearDataBtn) clearDataBtn.style.display = 'none';
    }
}

// Wrapper functions for data management
async function loadSampleDataAndUpdate() {
    if (window.loadSampleData) {
        const success = await window.loadSampleData();
        if (success) {
            updateDataManagementButtons();
            // Refresh the graph display
            if (window.refreshGraph) {
                await window.refreshGraph();
            }
        }
    }
}

async function clearDataAndUpdate() {
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to clear all data? This action cannot be undone.');
    if (!confirmed) return;

    if (window.clearData) {
        const success = await window.clearData();
        if (success) {
            updateDataManagementButtons();
            // Clear the graph display
            if (window.resetGraph) {
                window.resetGraph();
            }
        }
    }
}

// Export functions for global access
window.closeDetailModal = closeDetailModal;
window.exportGraphData = exportGraphData;
window.updateDataManagementButtons = updateDataManagementButtons;
window.loadSampleDataAndUpdate = loadSampleDataAndUpdate;
window.clearDataAndUpdate = clearDataAndUpdate;
