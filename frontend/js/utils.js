// Utils module - contains utility functions, styles, and helper functions
import { users, transactions } from './api.js';

// Graph styles
export function getGraphStyle() {
    return [
        {
            selector: 'node',
            style: {
                'background-color': '#667eea',
                'label': 'data(label)',
                'color': '#fff',
                'text-valign': 'center',
                'text-halign': 'center',
                'width': '60px',
                'height': '60px',
                'font-size': '12px',
                'font-weight': 'bold',
                'border-width': '2px',
                'border-color': '#fff',
                'text-outline-width': '2px',
                'text-outline-color': '#333'
            }
        },
        {
            selector: 'node[type="user"]',
            style: {
                'background-color': '#667eea',
                'shape': 'ellipse'
            }
        },
        {
            selector: 'node[type="transaction"]',
            style: {
                'background-color': '#28a745',
                'shape': 'rectangle'
            }
        },
        {
            selector: 'edge',
            style: {
                'width': '3px',
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '10px',
                'color': '#666'
            }
        },
        {
            selector: 'edge[type="transaction"]',
            style: {
                'line-color': '#28a745',
                'target-arrow-color': '#28a745'
            }
        },
        {
            selector: 'edge[type="shared"]',
            style: {
                'line-color': '#ffc107',
                'target-arrow-color': '#ffc107',
                'line-style': 'dashed',
                'width': '4px',
                'opacity': '0.8',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '9px',
                'color': '#ffc107',
                'text-background-color': '#333',
                'text-background-opacity': '0.8',
                'text-background-padding': '2px'
            }
        },
        {
            selector: 'edge[relationshipType="SHARED_EMAIL"]',
            style: {
                'line-color': '#17a2b8',
                'target-arrow-color': '#17a2b8',
                'line-style': 'solid'
            }
        },
        {
            selector: 'edge[relationshipType="SHARED_PHONE"]',
            style: {
                'line-color': '#6f42c1',
                'target-arrow-color': '#6f42c1',
                'line-style': 'solid'
            }
        },
        {
            selector: 'edge[relationshipType="SHARED_ADDRESS"]',
            style: {
                'line-color': '#fd7e14',
                'target-arrow-color': '#fd7e14',
                'line-style': 'solid'
            }
        }
    ];
}

export function getTransactionRelationshipGraphStyle() {
    return [
        {
            selector: 'node',
            style: {
                'background-color': '#667eea',
                'label': 'data(label)',
                'color': '#fff',
                'text-valign': 'center',
                'text-halign': 'center',
                'width': '70px',
                'height': '70px',
                'font-size': '11px',
                'font-weight': 'bold',
                'border-width': '3px',
                'border-color': '#fff',
                'text-outline-width': '2px',
                'text-outline-color': '#333'
            }
        },
        {
            selector: 'node[type="user"]',
            style: {
                'background-color': '#667eea',
                'shape': 'ellipse'
            }
        },
        {
            selector: 'node[type="transaction"]',
            style: {
                'background-color': '#28a745',
                'shape': 'rectangle'
            }
        },
        {
            selector: 'node[type="main-transaction"]',
            style: {
                'background-color': '#dc3545',
                'shape': 'rectangle',
                'border-color': '#ffd700',
                'border-width': '4px'
            }
        },
        {
            selector: 'edge',
            style: {
                'width': '3px',
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '10px',
                'color': '#666'
            }
        },
        {
            selector: 'edge[type="transaction"]',
            style: {
                'line-color': '#28a745',
                'target-arrow-color': '#28a745'
            }
        },
        {
            selector: 'edge[type="shared"]',
            style: {
                'line-color': '#ffc107',
                'target-arrow-color': '#ffc107',
                'line-style': 'dashed',
                'width': '5px',
                'opacity': '0.9',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '9px',
                'color': '#ffc107',
                'text-background-color': '#333',
                'text-background-opacity': '0.9',
                'text-background-padding': '3px'
            }
        },
        {
            selector: 'edge[relationshipType="SHARED_IP"]',
            style: {
                'line-color': '#17a2b8',
                'target-arrow-color': '#17a2b8',
                'line-style': 'solid',
                'width': '4px'
            }
        },
        {
            selector: 'edge[relationshipType="SHARED_DEVICE"]',
            style: {
                'line-color': '#6f42c1',
                'target-arrow-color': '#6f42c1',
                'line-style': 'solid',
                'width': '4px'
            }
        },
        {
            selector: 'edge[relationshipType="SHARED_PAYMENT_METHOD"]',
            style: {
                'line-color': '#fd7e14',
                'target-arrow-color': '#fd7e14',
                'line-style': 'solid',
                'width': '4px'
            }
        },
        {
            selector: 'edge[relationshipType="SHARED_LOCATION"]',
            style: {
                'line-color': '#20c997',
                'target-arrow-color': '#20c997',
                'line-style': 'solid',
                'width': '4px'
            }
        }
    ];
}

// Risk level color utility
export function getRiskColor(riskLevel) {
    switch (riskLevel) {
        case 'low': return '#28a745';
        case 'medium': return '#ffc107';
        case 'high': return '#dc3545';
        default: return '#667eea';
    }
}

// Date formatting utility
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

// Data validation utilities
export function validateUserData(user) {
    const requiredFields = ['id', 'name', 'email'];
    const missingFields = requiredFields.filter(field => !user[field]);

    if (missingFields.length > 0) {
        console.warn(`User missing required fields: ${missingFields.join(', ')}`);
        return false;
    }

    return true;
}

export function validateTransactionData(transaction) {
    const requiredFields = ['id', 'amount', 'fromUserId', 'toUserId'];
    const missingFields = requiredFields.filter(field => !transaction[field]);

    if (missingFields.length > 0) {
        console.warn(`Transaction missing required fields: ${missingFields.join(', ')}`);
        return false;
    }

    return true;
}

// Search and filter utilities
export function searchUsers(users, searchTerm) {
    if (!searchTerm) return users;

    const term = searchTerm.toLowerCase();
    return users.filter(user =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.id?.toLowerCase().includes(term)
    );
}

export function searchTransactions(transactions, searchTerm) {
    if (!searchTerm) return transactions;

    const term = searchTerm.toLowerCase();
    return transactions.filter(tx =>
        tx.id?.toLowerCase().includes(term) ||
        tx.description?.toLowerCase().includes(term) ||
        tx.fromUserId?.toLowerCase().includes(term) ||
        tx.toUserId?.toLowerCase().includes(term)
    );
}

export function filterUsersByRisk(users, riskLevel) {
    if (!riskLevel) return users;
    return users.filter(user => user.metadata?.riskLevel === riskLevel);
}

export function filterTransactionsByCategory(transactions, category) {
    if (!category) return transactions;
    return transactions.filter(tx => tx.metadata?.category === category);
}

// Data processing utilities
export function processUserData(user) {
    return {
        ...user,
        riskLevel: user.metadata?.riskLevel || 'unknown',
        accountAge: user.metadata?.accountAge || 0,
        displayName: user.name || 'Unknown User',
        displayEmail: user.email || 'No email'
    };
}

export function processTransactionData(transaction) {
    return {
        ...transaction,
        displayAmount: `$${transaction.amount || 0}`,
        displayDescription: transaction.description || 'No description',
        displayStatus: transaction.status || 'PENDING',
        displayCategory: transaction.metadata?.category || 'unknown'
    };
}

// Export utilities
export function prepareDataForExport(data, type) {
    switch (type) {
        case 'csv':
            return prepareCSVData(data);
        case 'json':
            return prepareJSONData(data);
        default:
            throw new Error(`Unsupported export type: ${type}`);
    }
}

function prepareCSVData(data) {
    // Implementation for CSV preparation
    return data;
}

function prepareJSONData(data) {
    // Implementation for JSON preparation
    return {
        ...data,
        exportDate: new Date().toISOString(),
        exportVersion: '1.0.0'
    };
}

// Graph utilities
export function calculateGraphMetrics(nodes, edges) {
    return {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        nodeTypes: countNodeTypes(nodes),
        edgeTypes: countEdgeTypes(edges),
        density: calculateDensity(nodes.length, edges.length)
    };
}

function countNodeTypes(nodes) {
    const types = {};
    nodes.forEach(node => {
        const type = node.data('type') || 'unknown';
        types[type] = (types[type] || 0) + 1;
    });
    return types;
}

function countEdgeTypes(edges) {
    const types = {};
    edges.forEach(edge => {
        const type = edge.data('type') || 'unknown';
        types[type] = (types[type] || 0) + 1;
    });
    return types;
}

function calculateDensity(nodeCount, edgeCount) {
    if (nodeCount <= 1) return 0;
    const maxEdges = nodeCount * (nodeCount - 1);
    return edgeCount / maxEdges;
}

// Performance utilities
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Error handling utilities
export function handleAPIError(error, context = '') {
    console.error(`API Error in ${context}:`, error);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
            type: 'network',
            message: 'Network error: Please check if the API server is running',
            details: error.message
        };
    }

    if (error.status === 404) {
        return {
            type: 'not_found',
            message: 'Resource not found',
            details: error.message
        };
    }

    if (error.status >= 500) {
        return {
            type: 'server',
            message: 'Server error: Please try again later',
            details: error.message
        };
    }

    return {
        type: 'unknown',
        message: 'An unexpected error occurred',
        details: error.message
    };
}

// Local storage utilities
export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

export function loadFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

export function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

