// Transaction Graph module - handles the transaction relationship graph (transactionRelationshipCy)
import { showMessage, showLoadingIndicator, hideLoadingIndicator } from './ui.js';
import { getTransactionRelationshipGraphStyle } from './utils.js';

// Global variables
let transactionRelationshipCy;
export let currentTransactionRelationships = null;

// Initialize the transaction relationship graph
export function initializeTransactionGraph() {
    transactionRelationshipCy = cytoscape({
        container: document.getElementById('transactionRelationshipGraph'),
        style: getTransactionRelationshipGraphStyle(),
        layout: {
            name: 'cose',
            animate: 'end',
            animationDuration: 1000,
            nodeDimensionsIncludeLabels: true
        }
    });

    // Add event listeners to graph
    setupTransactionRelationshipGraphEvents(transactionRelationshipCy);
}

// Setup transaction relationship graph events
function setupTransactionRelationshipGraphEvents(graph) {
    // Add zoom controls
    graph.on('mouseover', 'node', function (e) {
        const node = e.target;
        node.style('background-color', '#ffd700');
        node.style('width', '85px');
        node.style('height', '85px');
    });

    graph.on('mouseout', 'node', function (e) {
        const node = e.target;
        const type = node.data('type');
        let backgroundColor = '#667eea';
        if (type === 'transaction') backgroundColor = '#28a745';
        if (type === 'main-transaction') backgroundColor = '#dc3545';

        node.style('background-color', backgroundColor);
        node.style('width', '70px');
        node.style('height', '70px');
    });

    // Add click events for detail view
    graph.on('tap', 'node', function (e) {
        const node = e.target;
        const nodeData = node.data();

        if (nodeData.type === 'transaction') {
            showTransactionNodeDetails(nodeData);
        } else if (nodeData.type === 'user') {
            showUserNodeDetails(nodeData);
        }
    });

    // Add hover effects for shared attribute edges
    graph.on('mouseover', 'edge[type="shared"]', function (e) {
        const edge = e.target;
        edge.style('width', '7px');
        edge.style('opacity', '1');
        edge.style('z-index', '1000');
    });

    graph.on('mouseout', 'edge[type="shared"]', function (e) {
        const edge = e.target;
        edge.style('width', '5px');
        edge.style('opacity', '0.9');
        edge.style('z-index', 'auto');
    });

    // Add click events for shared attribute edges
    graph.on('tap', 'edge[type="shared"]', function (e) {
        const edge = e.target;
        const edgeData = edge.data();

        if (edgeData.relationshipData) {
            showTransactionRelationshipDetails(edgeData.relationshipData, edgeData);
        }
    });
}

// Function to visualize transaction relationships in the graph
export function visualizeTransactionRelationships(data) {
    if (!transactionRelationshipCy) return;

    // Clear existing graph
    transactionRelationshipCy.elements().remove();

    const { transaction, fromUser, toUser, relatedTransactions } = data;

    // Add main transaction node (highlighted)
    const mainTransactionNode = {
        group: 'nodes',
        data: {
            id: transaction.properties.id,
            label: `$${transaction.properties.amount}`,
            type: 'main-transaction',
            amount: transaction.properties.amount,
            description: transaction.properties.description,
            ipAddress: transaction.properties.ipAddress,
            deviceId: transaction.properties.deviceId
        }
    };

    // Add from user node
    const fromUserNode = {
        group: 'nodes',
        data: {
            id: fromUser.properties.id,
            label: fromUser.properties.name,
            type: 'user',
            email: fromUser.properties.email,
            phone: fromUser.properties.phone,
            address: fromUser.properties.address,
            riskLevel: fromUser.properties.metadata.riskLevel
        }
    };

    // Add to user node
    const toUserNode = {
        group: 'nodes',
        data: {
            id: toUser.properties.id,
            label: toUser.properties.name,
            type: 'user',
            email: toUser.properties.email,
            phone: toUser.properties.phone,
            address: toUser.properties.address,
            riskLevel: toUser.properties.metadata.riskLevel
        }
    };

    // Add main transaction flow edges
    const fromUserToTransactionEdge = {
        group: 'edges',
        data: {
            id: `flow-${fromUser.properties.id}-${transaction.properties.id}`,
            source: fromUser.properties.id,
            target: transaction.properties.id,
            label: `$${transaction.properties.amount}`,
            type: 'transaction'
        }
    };

    const transactionToUserEdge = {
        group: 'edges',
        data: {
            id: `flow-${transaction.properties.id}-${toUser.properties.id}`,
            source: transaction.properties.id,
            target: toUser.properties.id,
            label: `$${transaction.properties.amount}`,
            type: 'transaction'
        }
    };

    // Add main elements
    transactionRelationshipCy.add([
        mainTransactionNode,
        fromUserNode,
        toUserNode,
        fromUserToTransactionEdge,
        transactionToUserEdge
    ]);

    // Add related transactions and their shared attributes
    if (relatedTransactions) {
        Object.values(relatedTransactions).forEach((relData, index) => {
            const { transaction: relTx, fromUser: relFromUser, toUser: relToUser, relationship } = relData;

            // Add related transaction node
            const relatedTransactionNode = {
                group: 'nodes',
                data: {
                    id: relTx.properties.id,
                    label: `$${relTx.properties.amount}`,
                    type: 'transaction',
                    amount: relTx.properties.amount,
                    description: relTx.properties.description,
                    ipAddress: relTx.properties.ipAddress,
                    deviceId: relTx.properties.deviceId
                }
            };

            // Add related users if not already added
            const relatedFromUserNode = {
                group: 'nodes',
                data: {
                    id: relFromUser.properties.id,
                    label: relFromUser.properties.name,
                    type: 'user',
                    email: relFromUser.properties.email,
                    phone: relFromUser.properties.phone,
                    address: relFromUser.properties.address,
                    riskLevel: relFromUser.properties.metadata.riskLevel
                }
            };

            const relatedToUserNode = {
                group: 'nodes',
                data: {
                    id: relToUser.properties.id,
                    label: relToUser.properties.name,
                    type: 'user',
                    email: relToUser.properties.email,
                    phone: relToUser.properties.phone,
                    address: relToUser.properties.address,
                    riskLevel: relToUser.properties.metadata.riskLevel
                }
            };

            // Add shared attribute edge from main transaction to related transaction
            const sharedAttributeEdge = {
                group: 'edges',
                data: {
                    id: `shared-${transaction.properties.id}-${relTx.properties.id}-${relationship.type}`,
                    source: transaction.properties.id,
                    target: relTx.properties.id,
                    label: `${relationship.type}: ${relationship.properties.value || relationship.properties.attribute}`,
                    type: 'shared',
                    relationshipType: relationship.type,
                    relationshipData: relData
                }
            };

            // Add transaction flow edges for related transaction
            const relFromUserToTransactionEdge = {
                group: 'edges',
                data: {
                    id: `flow-${relFromUser.properties.id}-${relTx.properties.id}`,
                    source: relFromUser.properties.id,
                    target: relTx.properties.id,
                    label: `$${relTx.properties.amount}`,
                    type: 'transaction'
                }
            };

            const relTransactionToUserEdge = {
                group: 'edges',
                data: {
                    id: `flow-${relTx.properties.id}-${relToUser.properties.id}`,
                    source: relTx.properties.id,
                    target: relToUser.properties.id,
                    label: `$${relTx.properties.amount}`,
                    type: 'transaction'
                }
            };

            // Add all related elements
            transactionRelationshipCy.add([
                relatedTransactionNode,
                relatedFromUserNode,
                relatedToUserNode,
                sharedAttributeEdge,
                relFromUserToTransactionEdge,
                relTransactionToUserEdge
            ]);
        });
    }

    // Apply layout
    transactionRelationshipCy.layout({
        name: 'cose',
        animate: 'end',
        animationDuration: 1000,
        nodeDimensionsIncludeLabels: true
    }).run();

    // Fit to screen
    transactionRelationshipCy.fit();
}

// Function to update the relationship summary sidebar
export function updateRelationshipSummary(data) {
    const summaryContainer = document.getElementById('relationshipSummary');
    if (!summaryContainer) return;

    const { transaction, fromUser, toUser, relatedTransactions } = data;

    let summaryHTML = `
        <div class="relationship-summary">
            <h4><i class="fas fa-exchange-alt"></i> Main Transaction</h4>
            <div class="summary-item">
                <span class="summary-label">ID:</span>
                <span class="summary-value">${transaction.properties.id}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Amount:</span>
                <span class="summary-value">$${transaction.properties.amount} ${transaction.properties.currency}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Description:</span>
                <span class="summary-value">${transaction.properties.description}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Status:</span>
                <span class="summary-value">${transaction.properties.status}</span>
            </div>
        </div>
        
        <div class="relationship-summary">
            <h4><i class="fas fa-users"></i> Participants</h4>
            <div class="summary-item">
                <span class="summary-label">From:</span>
                <span class="summary-value">${fromUser.properties.name}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">To:</span>
                <span class="summary-value">${toUser.properties.name}</span>
            </div>
        </div>
    `;

    if (relatedTransactions && Object.keys(relatedTransactions).length > 0) {
        const sharedAttributes = new Set();
        const relationshipCount = Object.keys(relatedTransactions).length;

        Object.values(relatedTransactions).forEach(relData => {
            const relType = relData.relationship.type;
            sharedAttributes.add(relType);
        });

        summaryHTML += `
            <div class="relationship-summary">
                <h4><i class="fas fa-link"></i> Shared Attributes</h4>
                <div class="summary-item">
                    <span class="summary-label">Related Transactions:</span>
                    <span class="summary-value">${relationshipCount}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Shared Types:</span>
                    <span class="summary-value">
                        ${Array.from(sharedAttributes).map(type =>
            `<span class="shared-attribute-badge ${type.toLowerCase().replace('shared_', 'shared-')}">${type.replace('SHARED_', '')}</span>`
        ).join(' ')}
                    </span>
                </div>
            </div>
        `;
    } else {
        summaryHTML += `
            <div class="relationship-summary">
                <h4><i class="fas fa-info-circle"></i> No Related Transactions</h4>
                <p>This transaction has no shared attributes with other transactions.</p>
            </div>
        `;
    }

    summaryContainer.innerHTML = summaryHTML;
}

// Function to clear transaction relationships
export function clearTransactionRelationships() {
    if (transactionRelationshipCy) {
        transactionRelationshipCy.elements().remove();
    }

    const summaryContainer = document.getElementById('relationshipSummary');
    if (summaryContainer) {
        summaryContainer.innerHTML = '<p class="placeholder-text">Enter a transaction ID to see shared attributes and relationships</p>';
    }

    currentTransactionRelationships = null;
}

// Function to reset transaction relationship graph view
export function resetTransactionGraph() {
    if (transactionRelationshipCy) {
        transactionRelationshipCy.elements().removeClass('highlighted');
        transactionRelationshipCy.fit();
    }
}

// Function to fit transaction relationship graph to screen
export function fitTransactionGraph() {
    if (transactionRelationshipCy) {
        transactionRelationshipCy.fit();
    }
}

// Function to show transaction node details
function showTransactionNodeDetails(nodeData) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Transaction Details</h2>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">${nodeData.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">$${nodeData.amount}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Description:</span>
                    <span class="detail-value">${nodeData.description || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">IP Address:</span>
                    <span class="detail-value">${nodeData.ipAddress || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Device ID:</span>
                    <span class="detail-value">${nodeData.deviceId || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;

    // Add close functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
}

// Function to show user node details
function showUserNodeDetails(nodeData) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>User Details</h2>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${nodeData.label}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">User ID:</span>
                    <span class="detail-value">${nodeData.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${nodeData.email || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${nodeData.phone || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Risk Level:</span>
                    <span class="detail-value risk-badge ${nodeData.riskLevel || 'unknown'}">${nodeData.riskLevel || 'unknown'}</span>
                </div>
            </div>
        </div>
    `;

    // Add close functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
}

// Function to show transaction relationship details
function showTransactionRelationshipDetails(relationship, edgeData) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Shared Attribute Relationship</h2>
            <div class="relationship-details">
                <h3>${relationship.relationship.type}</h3>
                <p><strong>From Transaction:</strong> ${edgeData.source}</p>
                <p><strong>To Transaction:</strong> ${edgeData.target}</p>
                ${relationship.relationship && relationship.relationship.properties ? `
                    <p><strong>Attribute:</strong> ${relationship.relationship.properties.attribute || 'N/A'}</p>
                    <p><strong>Value:</strong> ${relationship.relationship.properties.value || 'N/A'}</p>
                    <p><strong>Created:</strong> ${relationship.relationship.properties.createdAt ? new Date(relationship.relationship.properties.createdAt).toLocaleString() : 'N/A'}</p>
                ` : ''}
                ${relationship.transaction ? `
                    <h4>Related Transaction Details:</h4>
                    <p><strong>ID:</strong> ${relationship.transaction.properties.id}</p>
                    <p><strong>Amount:</strong> $${relationship.transaction.properties.amount}</p>
                    <p><strong>Description:</strong> ${relationship.transaction.properties.description}</p>
                    <p><strong>Status:</strong> ${relationship.transaction.properties.status}</p>
                ` : ''}
            </div>
        </div>
    `;

    // Add close functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
}

// Function to load demo transaction for testing
export function loadDemoTransaction() {
    document.getElementById('transactionIdInput').value = 'txn-015';
    window.loadTransactionRelationshipsFromInput();
}

// Export functions for global access
window.clearTransactionRelationships = clearTransactionRelationships;
window.resetTransactionGraph = resetTransactionGraph;
window.fitTransactionGraph = fitTransactionGraph;
window.loadDemoTransaction = loadDemoTransaction;
