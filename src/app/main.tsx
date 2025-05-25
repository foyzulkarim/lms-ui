import { createRoot } from "react-dom/client";
import App from "./App";
import "../index.css";

// Main application render
createRoot(document.getElementById("root")!).render(<App />);

// Only import and setup stagewise in development mode
if (import.meta.env.DEV) {
  // Dynamically import stagewise to ensure it's not included in production builds
  import('@stagewise/toolbar-react')
    .then(({ StagewiseToolbar }) => {
      // Create container element
      const container = document.createElement('div');
      container.id = 'stagewise-root';
      document.body.appendChild(container);
      
      // Create React root for stagewise
      const root = createRoot(container);
      
      // Basic configuration
      const config = { plugins: [] };
      
      // Render the toolbar
      root.render(<StagewiseToolbar config={config} />);
    })
    .catch(error => {
      console.error('Failed to load stagewise toolbar:', error);
    });
}
