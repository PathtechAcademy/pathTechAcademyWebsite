// Security utility functions
export const initializeSecurity = () => {
    // Disable right click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  
    // Disable keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Prevent inspect element (F12)
      if (e.key === 'F12') {
        e.preventDefault();
      }
  
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
      }
  
      // Prevent Ctrl+U (view source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
      }
    });
  
    // Disable text selection
    document.addEventListener('selectstart', (e) => e.preventDefault());
  
    // Disable drag and drop
    document.addEventListener('dragstart', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
  
    // Add CSS to prevent selection
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      video {
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  };