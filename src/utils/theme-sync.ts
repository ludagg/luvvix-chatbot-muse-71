// This utility helps synchronize theme settings between the main app and the Luvvix AI module

export const syncThemeWithLuvvixAI = () => {
  // Get current theme from the main app
  const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  
  // Store it for Luvvix AI module
  localStorage.setItem("luvvix-theme", currentTheme);
  
  // Set up a mutation observer to keep themes in sync
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class" &&
        mutation.target === document.documentElement
      ) {
        const newTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
        localStorage.setItem("luvvix-theme", newTheme);
      }
    });
  });
  
  // Start observing changes to the document element's class attribute
  observer.observe(document.documentElement, { attributes: true });
  
  return () => {
    // Clean up function
    observer.disconnect();
  };
};

export default { syncThemeWithLuvvixAI };
