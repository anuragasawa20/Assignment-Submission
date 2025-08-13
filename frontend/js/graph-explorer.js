
import { getGraphStyle, getRiskColor } from './utils.js';
import { formatDate } from './ui.js';

// Global variables
let explorerCy;
let isLoadingRelationships = false; // Track loading state

// Simple utility functions to avoid circular dependencies
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

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

function showNodeDetails(nodeData) {
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

// Initialize the explorer graph
export function initializeGraph() {
    explorerCy = cytoscape({
        container: document.getElementById('explorerGraph'),
        style: getGraphStyle(),
        layout: {
            name: 'cose',
            animate: 'end',
            animationDuration: 1000,
            nodeDimensionsIncludeLabels: true
        }
    });

    // Add event listeners to graph
    setupGraphEvents(explorerCy);
}

// Setup graph events
function setupGraphEvents(graph) {
    // Add zoom controls
    graph.on('mouseover', 'node', function (e) {
        const node = e.target;
        node.style('background-color', '#ffd700');
        node.style('width', '80px');
        node.style('height', '80px');
    });

    graph.on('mouseout', 'node', function (e) {
        const node = e.target;
        const type = node.data('type');
        node.style('background-color', type === 'user' ? '#667eea' : '#28a745');
        node.style('width', '60px');
        node.style('height', '60px');
    });

    // Add click events for detail view
    graph.on('tap', 'node', function (e) {
        const node = e.target;
        const nodeData = node.data();

        if (nodeData.type === 'transaction') {
            // Call transaction relationship API
            window.loadTransactionRelationships(nodeData.id);
        } else if (nodeData.type === 'user') {
            // Load user relationships and show details
            window.loadUserRelationships(nodeData.id).then(relationships => {
                if (relationships) {
                    showNodeDetails({
                        type: 'user',
                        ...nodeData,
                        relationships: relationships
                    });
                } else {
                    showNodeDetails({
                        type: 'user',
                        ...nodeData
                    });
                }
            });
        }
    });

    // Add hover effects for shared attribute edges
    graph.on('mouseover', 'edge[type="shared"]', function (e) {
        const edge = e.target;
        edge.style('width', '6px');
        edge.style('opacity', '1');
        edge.style('z-index', '1000');
    });

    graph.on('mouseout', 'edge[type="shared"]', function (e) {
        const edge = e.target;
        edge.style('width', '4px');
        edge.style('opacity', '0.8');
        edge.style('z-index', 'auto');
    });

    // Add click events for shared attribute edges
    graph.on('tap', 'edge[type="shared"]', function (e) {
        const edge = e.target;
        const edgeData = edge.data();

        if (edgeData.relationshipData) {
            showRelationshipDetails(edgeData.relationshipData, edgeData);
        }
    });
}

// Update graph with shared attributes from API data
export function updateGraphWithSharedAttributes(relationshipsData) {
    if (!explorerCy) return;

    const { user, directRelationships, transactions } = relationshipsData;

    // Clear existing elements
    explorerCy.elements().remove();

    // Add main user node
    const mainUserNode = {
        group: 'nodes',
        data: {
            id: user.properties.id,
            label: user.properties.name,
            type: 'user',
            email: user.properties.email,
            phone: user.properties.phone,
            address: user.properties.address,
            riskLevel: user.properties.metadata.riskLevel
        }
    };

    explorerCy.add(mainUserNode);

    // Add related users from direct relationships (shared attributes)
    if (directRelationships) {
        Object.values(directRelationships).forEach((relationship, index) => {
            const { type, relatedUser, relationship: relData } = relationship;
            const attributeType = type.replace('SHARED_', '');

            // Add related user node
            const relatedUserNode = {
                group: 'nodes',
                data: {
                    id: relatedUser.properties.id,
                    label: relatedUser.properties.name,
                    type: 'user',
                    email: relatedUser.properties.email,
                    phone: relatedUser.properties.phone,
                    address: relatedUser.properties.address,
                    riskLevel: relatedUser.properties.metadata.riskLevel
                }
            };

            explorerCy.add(relatedUserNode);

            // Add shared attribute edge with dotted line
            const edge = {
                group: 'edges',
                data: {
                    id: `shared-${user.properties.id}-${relatedUser.properties.id}-${attributeType}`,
                    source: user.properties.id,
                    target: relatedUser.properties.id,
                    label: `${attributeType}: ${relData.properties.value || relData.properties.paymentMethod}`,
                    type: 'shared',
                    attributeType: attributeType,
                    value: relData.properties.value || relData.properties.paymentMethod
                }
            };

            explorerCy.add(edge);
        });
    }

    // Add transaction nodes and edges
    if (transactions) {
        Object.values(transactions).forEach((txn, index) => {
            const { transaction, relationship, otherUser } = txn;
            const isOutgoing = relationship.type === 'SENT_TO';

            // Add transaction node
            const transactionNode = {
                group: 'nodes',
                data: {
                    id: transaction.properties.id,
                    label: `$${transaction.properties.amount}`,
                    type: 'transaction',
                    amount: transaction.properties.amount,
                    description: transaction.properties.description,
                    ipAddress: transaction.properties.ipAddress,
                    deviceId: transaction.properties.deviceId
                }
            };

            explorerCy.add(transactionNode);

            // Add other user node if not already added
            if (!explorerCy.getElementById(otherUser.properties.id).length) {
                const otherUserNode = {
                    group: 'nodes',
                    data: {
                        id: otherUser.properties.id,
                        label: otherUser.properties.name,
                        type: 'user',
                        email: otherUser.properties.email,
                        phone: otherUser.properties.phone,
                        address: otherUser.properties.address,
                        riskLevel: otherUser.properties.metadata.riskLevel
                    }
                };

                explorerCy.add(otherUserNode);
            }

            // Add transaction edges
            if (isOutgoing) {
                const sentEdge = {
                    group: 'edges',
                    data: {
                        id: `sent-${user.properties.id}-${transaction.properties.id}`,
                        source: user.properties.id,
                        target: transaction.properties.id,
                        label: `Sent $${transaction.properties.amount}`,
                        type: 'transaction',
                        amount: transaction.properties.amount
                    }
                };

                const receivedEdge = {
                    group: 'edges',
                    data: {
                        id: `received-${transaction.properties.id}-${otherUser.properties.id}`,
                        source: transaction.properties.id,
                        target: otherUser.properties.id,
                        label: `Received $${transaction.properties.amount}`,
                        type: 'transaction',
                        amount: transaction.properties.amount
                    }
                };

                explorerCy.add([sentEdge, receivedEdge]);
            } else {
                const sentEdge = {
                    group: 'edges',
                    data: {
                        id: `sent-${otherUser.properties.id}-${transaction.properties.id}`,
                        source: otherUser.properties.id,
                        target: transaction.properties.id,
                        label: `Sent $${transaction.properties.amount}`,
                        type: 'transaction',
                        amount: transaction.properties.amount
                    }
                };

                const receivedEdge = {
                    group: 'edges',
                    data: {
                        id: `received-${transaction.properties.id}-${user.properties.id}`,
                        source: transaction.properties.id,
                        target: user.properties.id,
                        label: `Received $${transaction.properties.amount}`,
                        type: 'transaction',
                        amount: transaction.properties.amount
                    }
                };

                explorerCy.add([sentEdge, receivedEdge]);
            }
        });
    }

    // Apply layout
    explorerCy.layout({
        name: 'cose',
        animate: 'end',
        animationDuration: 1000,
        nodeDimensionsIncludeLabels: true
    }).run();

    // Fit to screen
    explorerCy.fit();
}

// Graph Explorer functionality
export async function loadExplorerData() {
    // Build the interactive graph with real data
    await buildInteractiveGraph();
}

async function buildInteractiveGraph() {
    if (!explorerCy) return;

    // Get data from global scope
    const users = window.users || [];
    const transactions = window.transactions || [];

    // Clear existing graph
    explorerCy.elements().remove();

    // Add user nodes
    users.forEach(user => {
        const riskLevel = user.metadata?.riskLevel || 'unknown';
        const nodeColor = getRiskColor(riskLevel);

        explorerCy.add({
            group: 'nodes',
            data: {
                id: user.id,
                label: user.name,
                type: 'user',
                riskLevel: riskLevel,
                ...user
            },
            style: {
                'background-color': nodeColor
            }
        });
    });

    // Add transaction nodes
    transactions.forEach(tx => {
        explorerCy.add({
            group: 'nodes',
            data: {
                id: tx.id,
                label: `${tx.id}: $${tx.amount} ${tx.currency}`,
                type: 'transaction',
                ...tx
            }
        });
    });

    // Add edges (transaction relationships)
    transactions.forEach(tx => {
        if (tx.fromUserId && tx.toUserId) {
            explorerCy.add({
                group: 'edges',
                data: {
                    id: `edge-${tx.id}`,
                    source: tx.fromUserId,
                    target: tx.id,
                    label: `$${tx.amount}`,
                    type: 'transaction'
                }
            });

            explorerCy.add({
                group: 'edges',
                data: {
                    id: `edge-${tx.id}-to`,
                    source: tx.id,
                    target: tx.toUserId,
                    label: `$${tx.amount}`,
                    type: 'transaction'
                }
            });
        }
    });

    // Add shared attribute edges from API data
    await addSharedAttributeEdges();

    // Apply layout
    explorerCy.layout({
        name: 'cose',
        animate: 'end',
        animationDuration: 1000,
        nodeDimensionsIncludeLabels: true,
        fit: true,
        padding: 50
    }).run();

    // Fit to screen after layout
    setTimeout(() => {
        explorerCy.fit();
    }, 1100);
}

// Function to add shared attribute edges
async function addSharedAttributeEdges() {
    if (isLoadingRelationships) return; // Prevent multiple simultaneous loads
    isLoadingRelationships = true;

    try {
        showLoadingIndicator('Loading relationship data...');

        // Get data from global scope
        const users = window.users || [];
        const userRelationships = window.userRelationships || {};

        // Fetch relationships for all users
        const relationshipPromises = users.map(user => window.loadUserRelationships(user.id));
        await Promise.all(relationshipPromises);

        const edgesToAdd = [];
        const addedEdgeIds = new Set(); // Use a Set to track added canonical IDs

        Object.values(userRelationships).forEach(userData => {
            if (userData && userData.directRelationships) {
                Object.values(userData.directRelationships).forEach(relationship => {
                    if (relationship.type && relationship.relatedUser) {
                        const fromUserId = userData.user.properties.id;
                        const toUserId = relationship.relatedUser.properties.id;

                        // 1. Create a canonical ID by sorting user IDs alphabetically
                        const sortedUserIds = [fromUserId, toUserId].sort();
                        const canonicalId = `shared-${sortedUserIds[0]}-${sortedUserIds[1]}-${relationship.type}`;

                        // 2. Check if this relationship has already been added
                        if (addedEdgeIds.has(canonicalId)) {
                            return; // Skip if we've already created this edge
                        }

                        // Verify both nodes exist before creating the edge
                        const sourceNode = explorerCy.getElementById(fromUserId);
                        const targetNode = explorerCy.getElementById(toUserId);

                        if (sourceNode.length && targetNode.length) {
                            let edgeLabel = relationship.type;
                            if (relationship.relationship && relationship.relationship.properties) {
                                const props = relationship.relationship.properties;
                                if (props.value) {
                                    edgeLabel = `${relationship.type}: ${props.value}`;
                                }
                            }

                            edgesToAdd.push({
                                group: 'edges',
                                data: {
                                    id: canonicalId, // Use the canonical ID
                                    source: fromUserId,
                                    target: toUserId,
                                    label: edgeLabel,
                                    type: 'shared',
                                    relationshipType: relationship.type,
                                    relationshipData: relationship
                                }
                            });

                            // 3. Mark this canonical ID as added
                            addedEdgeIds.add(canonicalId);
                        } else {
                            console.warn(`Cannot create edge: ${fromUserId} -> ${toUserId}. One or both nodes missing.`);
                        }
                    }
                });
            }
        });

        // Add all unique edges at once for better performance
        if (edgesToAdd.length > 0) {
            explorerCy.add(edgesToAdd);
            showMessage(`Loaded ${edgesToAdd.length} shared attribute relationships`, 'success');
        } else {
            handleNoRelationshipsFound();
        }

    } catch (error) {
        console.error('Error loading shared attribute edges:', error);
        showMessage('Error loading relationship data', 'error');
    } finally {
        isLoadingRelationships = false;
        hideLoadingIndicator();
    }
}

function clearSharedAttributeEdges() {
    if (explorerCy) {
        const sharedEdges = explorerCy.elements('edge[type="shared"]');
        sharedEdges.remove();
    }
}

// Function to refresh shared attribute edges
export async function refreshSharedAttributeEdges() {
    console.log('refreshSharedAttributeEdges called');
    clearSharedAttributeEdges();
    await addSharedAttributeEdges();
}

// Function to refresh the entire graph
export async function refreshGraph() {
    console.log('refreshGraph called');
    await buildInteractiveGraph();
}

// Function to update graph when new data is available
export function updateGraphData() {
    const users = window.users || [];
    const transactions = window.transactions || [];

    if (users.length > 0 || transactions.length > 0) {
        buildInteractiveGraph();
    }
}

// User and Transaction Selection
export function selectUser(user, event) {
    // Highlight user in sidebar
    document.querySelectorAll('.entity-item').forEach(item => item.classList.remove('selected'));
    if (event && event.target) {
        event.target.closest('.entity-item').classList.add('selected');
    }

    // Highlight user in graph
    if (explorerCy) {
        explorerCy.elements().removeClass('highlighted');
        const userNode = explorerCy.getElementById(user.id);
        if (userNode.length > 0) {
            userNode.addClass('highlighted');
            explorerCy.center(userNode);
        }
    }

    // Show user details
    showNodeDetails({
        type: 'user',
        ...user
    });
}

export function selectTransaction(transaction, event) {
    // Highlight transaction in sidebar
    document.querySelectorAll('.entity-item').forEach(item => item.classList.remove('selected'));
    if (event && event.target) {
        event.target.closest('.entity-item').classList.add('selected');
    }

    // Highlight transaction in graph
    if (explorerCy) {
        explorerCy.elements().removeClass('highlighted');
        const txNode = explorerCy.getElementById(transaction.id);
        if (txNode.length > 0) {
            txNode.addClass('highlighted');
            explorerCy.center(txNode);
        }
    }

    // Call transaction relationship API
    window.loadTransactionRelationships(transaction.id);
}

// Graph Controls
export function resetGraph() {
    if (explorerCy) {
        explorerCy.elements().removeClass('highlighted');
        explorerCy.fit();
    }
}

export function fitGraph() {
    if (explorerCy) {
        explorerCy.fit();
    }
}

// Function to show relationship details
function showRelationshipDetails(relationship, edgeData) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Shared Attribute Relationship</h2>
            <div class="relationship-details">
                <h3>${relationship.type}</h3>
                <p><strong>From User:</strong> ${edgeData.source}</p>
                <p><strong>To User:</strong> ${edgeData.target}</p>
                ${relationship.relationship && relationship.relationship.properties ? `
                    <p><strong>Attribute:</strong> ${relationship.relationship.properties.attribute || 'N/A'}</p>
                    <p><strong>Value:</strong> ${relationship.relationship.properties.value || 'N/A'}</p>
                    <p><strong>Created:</strong> ${relationship.relationship.properties.createdAt ? new Date(relationship.relationship.properties.createdAt).toLocaleString() : 'N/A'}</p>
                ` : ''}
                ${relationship.relatedUser ? `
                    <h4>Related User Details:</h4>
                    <p><strong>Name:</strong> ${relationship.relatedUser.properties.name}</p>
                    <p><strong>Email:</strong> ${relationship.relatedUser.properties.email}</p>
                    <p><strong>Phone:</strong> ${relationship.relatedUser.properties.phone}</p>
                    <p><strong>Risk Level:</strong> ${relationship.relatedUser.properties.metadata?.riskLevel || 'Unknown'}</p>
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

// Function to handle no relationships found
function handleNoRelationshipsFound() {
    showMessage('No shared attribute relationships found. This could mean:', 'info');
    setTimeout(() => {
        showMessage('1. Users have no shared attributes', 'info');
    }, 1000);
    setTimeout(() => {
        showMessage('2. API server is not running', 'info');
    }, 2000);
    setTimeout(() => {
        showMessage('3. No relationship data exists yet', 'info');
    }, 3000);
}

// Export functions for global access
window.selectUser = selectUser;
window.selectTransaction = selectTransaction;
window.resetGraph = resetGraph;
window.fitGraph = fitGraph;
window.refreshSharedAttributeEdges = refreshSharedAttributeEdges;
window.refreshGraph = refreshGraph;
window.updateGraphData = updateGraphData;
