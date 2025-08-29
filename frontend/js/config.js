// Configuration file for different environments
export const config = {
    // API Configuration
    api: {
        // Backend API base URL
        baseURL: (() => {
            // Check if we're running in Docker or local development
            const hostname = window.location.hostname;
            const port = window.location.port;

            if (hostname === 'localhost' && port === '3001') {
                // Local development - frontend on 3001, backend on 8080
                return 'https://assignment-backend-nrav9.ondigitalocean.app/';//'http://localhost:8080/';
            } else if (hostname === 'localhost' && port === '8080') {
                // Direct access to backend
                return 'http://localhost:8080/';
            } else {
                // Production - use DigitalOcean backend
                return 'https://assignment-backend-nrav9.ondigitalocean.app/';
            }
        })(),

        // API endpoints
        endpoints: {
            users: 'users',
            transactions: 'transactions',
            relationships: 'relationships',
            health: 'health',
            sampleData: 'api/data/load-sample',
            clearData: 'api/data/clear'
        }
    },

    // Frontend Configuration
    frontend: {
        port: 3001,
        title: 'Flagright Relationship Visualizer'
    },

    // Graph Configuration
    graph: {
        maxNodes: 1000,
        animationDuration: 300,
        layoutOptions: {
            name: 'cose',
            animate: true,
            animationDuration: 300,
            nodeDimensionsIncludeLabels: true
        }
    },

    // UI Configuration
    ui: {
        refreshInterval: 5000, // 5 seconds
        maxSearchResults: 50,
        debounceDelay: 300
    }
};

// Helper function to get full API URL
export function getApiUrl(endpoint) {
    return `${config.api.baseURL}${endpoint}`;
}

// Helper function to check if running in Docker
export function isRunningInDocker() {
    return window.location.hostname !== 'localhost' || window.location.port === '3001';
}

// Helper function to get environment info
export function getEnvironmentInfo() {
    return {
        hostname: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol,
        isDocker: isRunningInDocker(),
        apiBaseURL: config.api.baseURL
    };
}
