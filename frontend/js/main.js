// Main entry point for the Flagright Relationship Visualizer
import { initializeNavigation, showSection, updateDataManagementButtons } from './ui.js';
import { initializeGraph } from './graph-explorer.js';
import { initializeTransactionGraph } from './graph-transactions.js';
import { loadUsers, loadTransactions } from './api.js';
import { setupEventListeners } from './ui.js';

// Global state
let currentSection = 'graph-explorer';

// Initialize the application
document.addEventListener('DOMContentLoaded', async function () {
    // Log environment information for debugging
    console.log('🚀 Flagright Frontend Initializing...');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Hostname:', window.location.hostname);
    console.log('📍 Port:', window.location.port);

    initializeNavigation();
    initializeGraph();
    initializeTransactionGraph();

    // Load data first
    await loadUsers();
    await loadTransactions();

    // Setup event listeners after data is loaded
    setupEventListeners();

    // Add refresh button functionality
    const refreshBtn = document.getElementById('refreshRelationshipsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            if (window.refreshGraph) {
                await window.refreshGraph();
            }
        });
    }

    // Initialize data management buttons based on current data state
    updateDataManagementButtons();

    console.log('✅ Frontend initialization complete');
});

// Export for global access
window.showSection = showSection;
window.currentSection = currentSection;
