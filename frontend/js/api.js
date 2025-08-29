// API module - handles all data fetching from the backend
import { displayUsers, displayTransactions, showMessage } from './ui.js';
import { updateGraphWithSharedAttributes } from './graph-explorer.js';
import { visualizeTransactionRelationships, updateRelationshipSummary, clearTransactionRelationships } from './graph-transactions.js';
import { config, getApiUrl, getEnvironmentInfo } from './config.js';

// API Base URL - use configuration system
const API_BASE_URL = config.api.baseURL;

console.log('🌐 API Configuration:', getEnvironmentInfo());

// Global data storage
export let users = [];
export let transactions = [];
export let userRelationships = {}; // Store relationships for each user
export let currentTransactionRelationships = null;

// Simple loading indicator functions to avoid circular dependencies
function showLoadingIndicator(message = 'Loading...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.className = 'loading-indicator';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${message}</p>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoadingIndicator() {
    const loadingDiv = document.getElementById('loadingIndicator');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Users management
export async function loadUsers() {
    try {
        const response = await fetch(getApiUrl(config.api.endpoints.users));
        if (response.ok) {
            const result = await response.json();
            users = result.data;
            window.users = users; // Update global scope
            displayUsers(users);

            // Update data management buttons
            if (window.updateDataManagementButtons) {
                window.updateDataManagementButtons();
            }
        } else {
            throw new Error('Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage('Error loading users', 'error');
        // Load sample data for demonstration
        loadSampleUsers();
    }
}

// Function to fetch user relationships from API
export async function loadUserRelationships(userId) {
    try {
        const response = await fetch(getApiUrl(`${config.api.endpoints.relationships}/user/${userId}`));
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`No relationships found for user ${userId}`);
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success && data.data) {
            userRelationships[userId] = data.data;
            window.userRelationships = userRelationships; // Update global scope
            return data.data;
        } else {
            console.warn(`No relationship data found for user ${userId}`);
            return null;
        }
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Network error: API server may not be running');
            showMessage('Network error: Please check if the API server is running', 'error');
        } else {
            console.error(`Error loading relationships for user ${userId}:`, error);
        }
        return null;
    }
}

// Transactions management
export async function loadTransactions() {
    try {
        const response = await fetch(getApiUrl(config.api.endpoints.transactions));
        if (response.ok) {
            const result = await response.json();
            transactions = result.data;
            window.transactions = transactions; // Update global scope
            displayTransactions(transactions);

            // Update data management buttons
            if (window.updateDataManagementButtons) {
                window.updateDataManagementButtons();
            }
        } else {
            throw new Error('Failed to load transactions');
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        showMessage('Error loading transactions', 'error');
        // Load sample data for demonstration
        loadSampleTransactions();
    }
}

// Transaction Relationships API Call
export async function loadTransactionRelationships(transactionId) {
    try {
        const response = await fetch(getApiUrl(`${config.api.endpoints.relationships}/transaction/${transactionId}`));
        if (response.ok) {
            const result = await response.json();
            showTransactionRelationships(result.data);
        } else {
            throw new Error('Failed to load transaction relationships');
        }
    } catch (error) {
        console.error('Error loading transaction relationships:', error);
        showMessage('Error loading transaction relationships', 'error');
    }
}

// New function to load transaction relationships from input field
export async function loadTransactionRelationshipsFromInput() {
    const transactionId = document.getElementById('transactionIdInput').value.trim();
    if (!transactionId) {
        showMessage('Please enter a transaction ID', 'error');
        return;
    }

    try {
        showLoadingIndicator('Loading transaction relationships...');
        const response = await fetch(getApiUrl(`${config.api.endpoints.relationships}/transaction/${transactionId}`));

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                currentTransactionRelationships = result.data;
                visualizeTransactionRelationships(result.data);
                updateRelationshipSummary(result.data);
                showMessage(`Loaded relationships for ${transactionId}`, 'success');
            } else {
                showMessage('No relationship data found', 'info');
                clearTransactionRelationships();
            }
        } else if (response.status === 404) {
            showMessage(`Transaction ${transactionId} not found`, 'error');
            clearTransactionRelationships();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading transaction relationships:', error);
        showMessage('Error loading transaction relationships', 'error');
        clearTransactionRelationships();
    } finally {
        hideLoadingIndicator();
    }
}

// Sample data functions
function loadSampleUsers() {
    users = [
        {
            id: 'user-001',
            name: 'Alice Johnson',
            email: 'alice.johnson@email.com',
            phone: '+1-555-0101',
            address: '123 Main St, New York, NY 10001',
            metadata: { riskLevel: 'low', accountAge: 365 }
        },
        {
            id: 'user-002',
            name: 'Bob Smith',
            email: 'bob.smith@email.com',
            phone: '+1-555-0102',
            address: '456 Oak Ave, New York, NY 10002',
            metadata: { riskLevel: 'medium', accountAge: 180 }
        }
    ];
    window.users = users; // Update global scope
    displayUsers(users);
}

function loadSampleTransactions() {
    transactions = [
        {
            id: 'txn-001',
            fromUserId: 'user-001',
            toUserId: 'user-002',
            amount: 150,
            currency: 'USD',
            description: 'Payment for dinner',
            category: 'food',
            status: 'COMPLETED'
        },
        {
            id: 'txn-002',
            fromUserId: 'user-003',
            toUserId: 'user-001',
            amount: 75.5,
            currency: 'USD',
            description: 'Shared taxi fare',
            category: 'transportation',
            status: 'COMPLETED'
        }
    ];
    window.transactions = transactions; // Update global scope
    displayTransactions(transactions);
}

// Function to show transaction relationships in modal (for backward compatibility)
function showTransactionRelationships(data) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');

    content.innerHTML = generateTransactionRelationshipDetails(data);
    modal.style.display = 'block';
}

function generateTransactionRelationshipDetails(data) {
    const tx = data.transaction?.properties || {};
    const fromUser = data.fromUser?.properties || {};
    const toUser = data.toUser?.properties || {};
    const relatedTransactions = data.relatedTransactions || {};

    return `
        <div class="detail-section">
            <h4><i class="fas fa-exchange-alt"></i> Transaction Details</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Transaction ID</span>
                    <span class="detail-value">${tx.id || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Amount</span>
                    <span class="detail-value">$${tx.amount || 0} ${tx.currency || 'USD'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Description</span>
                    <span class="detail-value">${tx.description || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">${tx.status || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Category</span>
                    <span class="detail-value">${tx.metadata?.category || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">IP Address</span>
                    <span class="detail-value">${tx.ipAddress || 'N/A'}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4><i class="fas fa-user"></i> From User</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${fromUser.name || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">User ID</span>
                    <span class="detail-value">${fromUser.id || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${fromUser.email || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Risk Level</span>
                    <span class="detail-value risk-badge ${fromUser.metadata?.riskLevel || 'unknown'}">${fromUser.metadata?.riskLevel || 'unknown'}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4><i class="fas fa-user"></i> To User</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${toUser.name || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">User ID</span>
                    <span class="detail-value">${toUser.id || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${toUser.email || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Risk Level</span>
                    <span class="detail-value risk-badge ${toUser.metadata?.riskLevel || 'unknown'}">${toUser.metadata?.riskLevel || 'unknown'}</span>
                </div>
            </div>
        </div>
        
        ${Object.keys(relatedTransactions).length > 0 ? `
        <div class="detail-section">
            <h4><i class="fas fa-link"></i> Related Transactions (${Object.keys(relatedTransactions).length})</h4>
            ${Object.values(relatedTransactions).map((related, index) => {
        const relTx = related.transaction?.properties || {};
        const relFromUser = related.fromUser?.properties || {};
        const relToUser = related.toUser?.properties || {};
        const relType = related.relationship?.type || 'SHARED';
        const relValue = related.relationship?.properties?.value || 'N/A';

        return `
                    <div class="related-transaction" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 10px 0; background: #f8f9fa;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <strong>${relTx.id || 'N/A'}</strong>
                            <span class="risk-badge ${relType.toLowerCase().replace('shared_', '')}">${relType.replace('SHARED_', '')}</span>
                        </div>
                        <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">
                            ${relTx.description || 'N/A'} • $${relTx.amount || 0} ${relTx.currency || 'USD'}
                        </div>
                        <div style="font-size: 0.85rem; color: #555;">
                            <strong>From:</strong> ${relFromUser.name || 'N/A'} (${relFromUser.id || 'N/A'})<br>
                            <strong>To:</strong> ${relToUser.name || 'N/A'} (${relToUser.id || 'N/A'})<br>
                            <strong>Shared:</strong> ${relValue}
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
        ` : ''}
    `;
}

// Data management functions
export async function loadSampleData() {
    try {
        showLoadingIndicator('Loading sample data...');
        const response = await fetch(getApiUrl(config.api.endpoints.sampleData), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            showMessage('Sample data loaded successfully!', 'success');
            // Reload data after loading sample data
            await loadUsers();
            await loadTransactions();
            return true;
        } else {
            throw new Error('Failed to load sample data');
        }
    } catch (error) {
        console.error('Error loading sample data:', error);
        showMessage('Error loading sample data', 'error');
        return false;
    } finally {
        hideLoadingIndicator();
    }
}

export async function clearData() {
    try {
        showLoadingIndicator('Clearing data...');
        const response = await fetch(getApiUrl(config.api.endpoints.clearData), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            showMessage('Data cleared successfully!', 'success');
            // Clear local data
            users.length = 0;
            transactions.length = 0;
            Object.keys(userRelationships).forEach(key => delete userRelationships[key]);

            // Update global scope
            window.users = users;
            window.transactions = transactions;
            window.userRelationships = userRelationships;

            // Update displays
            displayUsers([]);
            displayTransactions([]);

            // Update data management buttons
            if (window.updateDataManagementButtons) {
                window.updateDataManagementButtons();
            }

            return true;
        } else {
            throw new Error('Failed to clear data');
        }
    } catch (error) {
        console.error('Error clearing data:', error);
        showMessage('Error clearing data', 'error');
        return false;
    } finally {
        hideLoadingIndicator();
    }
}

export function hasData() {
    return users.length > 0 || transactions.length > 0;
}

// Export functions for global access
window.loadUserRelationships = loadUserRelationships;
window.loadTransactionRelationships = loadTransactionRelationships;
window.loadTransactionRelationshipsFromInput = loadTransactionRelationshipsFromInput;
window.loadSampleData = loadSampleData;
window.clearData = clearData;
window.hasData = hasData;

// Export data to global scope for export functions
window.users = users;
window.transactions = transactions;
window.userRelationships = userRelationships;
