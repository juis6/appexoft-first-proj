# YouTube Video Search Frontend

This is the frontend application for the YouTube Video Search project. It's built with React, TypeScript, Apollo Client, and Tailwind CSS.

## Features

- Search YouTube videos with a clean and intuitive interface
- View video details including title, description, views, likes, and comments
- Watch videos directly in the application
- View search history
- Responsive design that works on all devices

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Backend API running on http://localhost:3000

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── graphql/       # GraphQL queries and mutations
  ├── types/         # TypeScript type definitions
  ├── lib/           # Utility functions and configurations
  └── App.tsx        # Main application component
```

## Technologies Used

- React
- TypeScript
- Apollo Client
- GraphQL
- Tailwind CSS
- React Router
- date-fns
