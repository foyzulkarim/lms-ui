# Stagewise Toolbar Setup

This project includes the Stagewise developer toolbar integration for AI-powered editing capabilities.

## Installation

Before using the Stagewise toolbar, you need to install the package:

```bash
# Using npm
npm install @stagewise/toolbar-react --save-dev

# Using yarn
yarn add @stagewise/toolbar-react --dev
```

## Configuration

The Stagewise toolbar has been integrated into the project in `src/app/main.tsx`. It is configured to only run in development mode and will not be included in production builds.

### How It Works

1. The toolbar is rendered in a separate React root to avoid interfering with the main application.
2. It's only loaded in development mode (`import.meta.env.DEV`).
3. The toolbar is dynamically imported to ensure it's not included in production builds.

## Usage

Once installed, the Stagewise toolbar will automatically appear in your browser when running the application in development mode.

The toolbar allows you to:
- Select elements in your web app
- Leave comments
- Let AI agents make changes based on that context

## Troubleshooting

If you encounter any issues with the Stagewise toolbar:

1. Make sure the package is properly installed
2. Check browser console for any errors
3. Ensure you're running the application in development mode 
