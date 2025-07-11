// Initialize history from localStorage
let history = JSON.parse(localStorage.getItem('summaries')) || [];

// DOM Elements
const summaryForm = document.getElementById("summary-form");
const urlInput = document.getElementById("article-url");
const loader = document.getElementById("loader");
const summaryBox = document.getElementById("summary-box");
const summaryContent = document.getElementById("summary-content");
const urlDisplay = document.getElementById("url-display");
const errorBox = document.getElementById("error-message");
const historyList = document.getElementById("history-list");
const saveButton = document.getElementById("save-summary");
const clearHistoryBtn = document.getElementById("clear-history");
const historyScrollContainer = document.querySelector(".history-scroll-container");

// Current summary data
let currentSummary = null;

// Initialize the app
function initApp() {
  renderHistory();
  
  // Load the last used URL if any
  const lastUrl = localStorage.getItem('lastUrl');
  if (lastUrl) {
    urlInput.value = lastUrl;
  }

  // Initialize scroll controls
  initScrollControls();
}

// Render history items
function renderHistory() {
  if (!historyList) return;
  
  if (history.length === 0) {
    historyList.innerHTML = '<p class="no-history">No saved summaries yet. Generate and save a summary to see it here.</p>';
    return;
  }

  historyList.innerHTML = history.map((item, index) => `
  <li class="history-item" data-index="${index}">
    <span class="history-item-url">${item.url}</span>
    <span class="history-item-summary">${item.summary}</span>
    <span class="history-item-date">${formatDate(item.timestamp)}</span>
    <div class="history-item-actions">
      <button class="view-summary" title="View"><i class="fas fa-eye"></i></button>
      <button class="delete-summary" title="Delete"><i class="fas fa-trash"></i></button>
    </div>
  </li>
`).join('');

  // Add event listeners to history items
  document.querySelectorAll('.history-item').forEach(item => {
    const index = item.dataset.index;
    const viewBtn = item.querySelector('.view-summary');
    const deleteBtn = item.querySelector('.delete-summary');

    item.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        loadSummaryFromHistory(index);
      }
    });

    viewBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      loadSummaryFromHistory(index);
    });

    deleteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSummary(index);
    });
  });
}

// Format date for display
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

// Load a summary from history
function loadSummaryFromHistory(index) {
  const item = history[index];
  if (!item) return;

  urlDisplay.textContent = new URL(item.url).hostname;
  summaryContent.textContent = item.summary;
  summaryBox.classList.remove("hidden");
  
  // Scroll to the summary
  summaryBox.scrollIntoView({ behavior: 'smooth' });
  
  // Update current summary
  currentSummary = { ...item, fromHistory: true };
}

// Delete a summary from history
function deleteSummary(index) {
  if (confirm('Are you sure you want to delete this summary?')) {
    history.splice(index, 1);
    localStorage.setItem('summaries', JSON.stringify(history));
    renderHistory();
  }
}

// Save current summary to history
function saveCurrentSummary() {
  if (!currentSummary || currentSummary.fromHistory) return;
  
  // Check if this URL already exists in history
  const existingIndex = history.findIndex(item => item.url === currentSummary.url);
  
  if (existingIndex >= 0) {
    // Update existing entry
    history[existingIndex] = { ...currentSummary, timestamp: Date.now() };
  } else {
    // Add new entry
    history.unshift({
      ...currentSummary,
      timestamp: Date.now()
    });
    
    // Keep only the last 50 items
    if (history.length > 50) {
      history.pop();
    }
  }
  
  // Save to localStorage
  localStorage.setItem('summaries', JSON.stringify(history));
  
  // Update UI
  renderHistory();
  
  // Show feedback
  const originalText = saveButton.innerHTML;
  saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
  setTimeout(() => {
    saveButton.innerHTML = originalText;
  }, 2000);
}

// Event Listeners
summaryForm.addEventListener("submit", async function (e) {
  e.preventDefault();

// Clear history functionality
clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all history?')) {
    localStorage.removeItem('summaries');
    history = [];
    renderHistory();
    
    // Show feedback
    const originalText = clearHistoryBtn.innerHTML;
    clearHistoryBtn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      clearHistoryBtn.innerHTML = originalText;
    }, 1000);
  }
});

// Initialize scroll controls
function initScrollControls() {
  if (!scrollUp || !scrollDown || !historyScrollContainer) return;

  // Update scroll button states
  function updateScrollButtons() {
    const atTop = historyScrollContainer.scrollTop === 0;
    const atBottom = historyScrollContainer.scrollTop + historyScrollContainer.clientHeight >= historyScrollContainer.scrollHeight;
    scrollUp.disabled = atTop;
    scrollDown.disabled = atBottom;
  }

  // Scroll up
  scrollUp.addEventListener('click', () => {
    historyScrollContainer.scrollBy({
      top: -100,
      behavior: 'smooth'
    });
    updateScrollButtons();
  });

  // Scroll down
  scrollDown.addEventListener('click', () => {
    historyScrollContainer.scrollBy({
      top: 100,
      behavior: 'smooth'
    });
    updateScrollButtons();
  });

  // Update button states on scroll
  historyScrollContainer.addEventListener('scroll', updateScrollButtons);

  // Initial update
  updateScrollButtons();
}

  const url = urlInput.value.trim();
  
  // Save the URL for future use
  localStorage.setItem('lastUrl', url);
  
  // Show loader, hide previous results and errors
  loader.classList.remove("hidden");
  summaryBox.classList.add("hidden");
  errorBox.classList.add("hidden");

  // Show loader, hide previous results and errors
  loader.classList.remove("hidden");
  summaryBox.classList.add("hidden");
  errorBox.classList.add("hidden");

  try {
    if (!url || !url.includes("http")) {
      throw new Error("Please enter a valid URL");
    }

    // Call the backend API
    const apiUrl = window.env?.API_URL || 'http://localhost:9000';
    const response = await fetch(`${apiUrl}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*'  // For development only
      },
      mode: 'cors',
      body: JSON.stringify({ url: url })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Store the current summary
    currentSummary = {
      url: url,
      summary: data.summary || "No summary available",
      timestamp: Date.now()
    };
    
    // Display the summary
    urlDisplay.textContent = new URL(url).hostname;
    summaryContent.textContent = currentSummary.summary;
    summaryBox.classList.remove("hidden");
    
    // Auto-save to history
    saveCurrentSummary();
    
    // Log the response for debugging
    console.log('API Response:', data);
    
  } catch (error) {
    console.error('Error:', error);
    errorBox.textContent = `Error: ${error.message}`;
    errorBox.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
  }
});

// Copy summary to clipboard
document.getElementById("copy-summary")?.addEventListener("click", () => {
  const summary = summaryContent.textContent;
  navigator.clipboard.writeText(summary).then(() => {
    // Show feedback
    const copyButton = document.getElementById("copy-summary");
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
      copyButton.innerHTML = originalText;
    }, 2000);
  });
});

// Save summary to history
saveButton?.addEventListener("click", (e) => {
  e.preventDefault();
  if (currentSummary) {
    saveCurrentSummary();
  } else {
    alert('No summary to save. Please generate a summary first.');
  }
});

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initApp();
  urlInput.focus();
});
