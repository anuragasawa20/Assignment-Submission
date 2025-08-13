# Flagright Relationship Visualization System - Frontend

A modern, responsive web-based frontend for visualizing user and transaction relationships using HTML, CSS, and JavaScript with Cytoscape.js for graph visualization. Built with a modular ES6 architecture for maintainability and scalability.

## 🚀 Features

### Core Functionality
- **Graph Explorer**: Interactive network visualization of users and transactions
- **Transaction Relationships**: Detailed analysis of transaction-to-transaction relationships
- **User Management**: Search and filter users with risk scoring
- **Transaction Management**: Track financial transactions between users
- **Real-time Data**: Live updates from backend API with fallback to sample data

### User Interface
- **Modern Design**: Clean, professional interface with Material Design principles
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Tab-based Navigation**: Switch between Graph Explorer and Transaction Relationships
- **Interactive Controls**: Graph manipulation tools (reset, fit to screen, refresh)

### Visualization Features
- **Interactive Graph**: Cytoscape.js-powered network visualization
- **Dual Graph System**: Separate graphs for exploration and transaction analysis
- **Relationship Types**: Different edge colors for transaction vs. shared attribute relationships
- **Hover Effects**: Interactive node highlighting and information display
- **Automatic Layout**: Intelligent graph positioning and organization

### Search & Filter
- **Advanced Search**: Search across users and transactions by multiple criteria
- **Smart Filtering**: Filter by risk level, transaction category, etc.
- **Real-time Results**: Instant search results as you type

## 📁 File Structure

```
frontend/
├── index.html              # Main HTML file with complete UI structure
├── styles.css              # Comprehensive CSS styling and responsive design
├── package.json            # Node.js dependencies and scripts
├── Dockerfile              # Docker container configuration
├── .dockerignore           # Docker ignore patterns
├── .gitignore              # Git ignore patterns
└── js/                     # JavaScript modules
    ├── main.js             # Application entry point and initialization
    ├── api.js              # Backend API communication layer
    ├── ui.js               # User interface management and DOM manipulation
    ├── graph-explorer.js   # Main graph visualization and interaction
    ├── graph-transactions.js # Transaction relationship graph
    ├── utils.js            # Utility functions and helpers
    └── README.md           # JavaScript architecture documentation
```

## 🛠️ Getting Started

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Backend API server running on `http://localhost:3000`
- Node.js (optional, for development server)

### Quick Start
1. **Start the Backend**: Ensure your backend server is running on port 3000
2. **Open Frontend**: Simply open `index.html` in your web browser
3. **Load Sample Data**: Use the backend API to load sample data for demonstration

### Development Server
For development, you can serve the files using the included Node.js server:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# or
npm start
```

The development server will run on `http://localhost:3001` with CORS enabled.

## 🔌 API Integration

The frontend integrates with the following backend endpoints:

### Base URL
- **Backend**: `http://localhost:3000/`
- **Frontend Dev Server**: `http://localhost:3001`

### API Endpoints
- `GET /users` - List all users
- `GET /transactions` - List all transactions  
- `GET /relationships/user/:id` - Get user relationships
- `GET /relationships/transaction/:id` - Get transaction relationships
- `POST /api/data/load-sample` - Load sample data
- `DELETE /api/data/clear` - Clear all data
- `GET /health` - Health check endpoint

### Data Structure
- **Users**: Include risk scoring, attributes, and relationship data
- **Transactions**: Include sender/receiver, amount, category, and metadata
- **Relationships**: Shared attributes and transaction connections between entities

## 🎯 Usage Guide

### Graph Explorer
- **Overview**: Main visualization of the entire user and transaction network
- **Left Sidebar**: 
  - Users section with search and risk level filtering
  - Transactions section with search and category filtering
- **Right Panel**: Interactive graph with controls for reset, fit to screen, and refresh
- **Export Options**: CSV and JSON export functionality

### Transaction Relationships
- **Search**: Enter transaction ID to analyze specific transaction relationships
- **Demo Mode**: Load a demonstration transaction for testing
- **Relationship Summary**: View shared attributes and connection details
- **Visualization**: Dedicated graph showing transaction-to-transaction relationships

### Interactive Features
- **Node Selection**: Click on users or transactions to see details
- **Graph Navigation**: Zoom, pan, and explore the network
- **Hover Information**: Detailed tooltips on hover
- **Responsive Controls**: Adaptive interface for different screen sizes

## 🏗️ Architecture

### Modular JavaScript Design
The application uses a modern ES6 module system with clear separation of concerns:

- **`main.js`**: Application initialization and coordination
- **`api.js`**: Backend communication and data management
- **`ui.js`**: DOM manipulation and user interface
- **`graph-explorer.js`**: Main graph visualization
- **`graph-transactions.js`**: Transaction relationship graphs
- **`utils.js`**: Shared utility functions

### Key Benefits
- **Maintainability**: Clear module boundaries and responsibilities
- **Scalability**: Easy to add new features and modules
- **Testability**: Independent modules can be unit tested
- **Performance**: Efficient data loading and rendering

## 🎨 Customization

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- Update CSS variables for consistent theming
- Customize responsive breakpoints for different devices

### Functionality
- Extend JavaScript modules to add new features
- Modify API endpoints in `api.js`
- Add new visualization types or chart libraries

### Data Sources
- Connect to different backend APIs by updating endpoint URLs
- Implement real-time data updates using WebSockets
- Add data export functionality (CSV, JSON, etc.)

## 🌐 Browser Compatibility

- **Chrome**: 80+ (Full support)
- **Firefox**: 75+ (Full support)
- **Safari**: 13+ (Full support)
- **Edge**: 80+ (Full support)
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+

## ⚡ Performance Considerations

- **Large Networks**: Handles 1000+ nodes efficiently with Cytoscape.js
- **Lazy Loading**: Data loaded on-demand for better performance
- **Responsive Updates**: Optimized UI updates to prevent lag
- **Memory Management**: Efficient cleanup of event listeners and DOM elements

## 🐛 Troubleshooting

### Common Issues

1. **Graph Not Displaying**
   - Check browser console for JavaScript errors
   - Ensure Cytoscape.js library is loading correctly
   - Verify the container elements exist in the DOM

2. **API Calls Failing**
   - Confirm backend server is running on port 3000
   - Check CORS settings on the backend
   - Verify API endpoint URLs are correct

3. **Styling Issues**
   - Clear browser cache and reload
   - Check CSS file path and loading
   - Verify Font Awesome icons are loading

4. **Mobile Responsiveness**
   - Test on different screen sizes
   - Check CSS media queries
   - Verify touch interactions work properly

### Debug Mode
Enable debug logging by opening browser console and looking for:
- API request/response logs
- Graph initialization messages
- Error messages and stack traces

## 🚀 Development

### Adding New Features
1. **Create Module**: Add new JavaScript file in `js/` directory
2. **Update HTML**: Add corresponding HTML structure
3. **Import Dependencies**: Update module imports as needed
4. **Test Integration**: Verify functionality across modules

### Code Style
- Use ES6 modules and modern JavaScript features
- Follow the established module pattern
- Maintain clear separation of concerns
- Use consistent naming conventions

## 📚 Dependencies

### External Libraries
- **Cytoscape.js**: Graph visualization and interaction
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Typography (Roboto)

### Development Dependencies
- **Axios**: HTTP client for API requests
- **http-server**: Local development server
- **web-vitals**: Performance monitoring

## 🤝 Contributing

To extend the frontend:

1. **Add New Sections**: Create new HTML sections and corresponding JavaScript functions
2. **Enhance Visualizations**: Integrate additional chart libraries (Chart.js, D3.js)
3. **Improve UX**: Add animations, transitions, and interactive elements
4. **Performance**: Optimize data loading and rendering for large datasets

## 📞 Support

For technical support or questions:
- Check the browser console for error messages
- Review the API documentation for endpoint details
- Ensure all dependencies are properly loaded
- Verify backend server connectivity

## 📄 License

This project is part of the Flagright Relationship Visualization System.
