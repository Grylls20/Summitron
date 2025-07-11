// Global variables
let elements = null;
let currentSummary = null;
let history = [];
const MAX_HISTORY_ITEMS = 20;

// Utility function to format dates
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

// Initialize DOM elements
function initElements() {
  return {
    summaryForm: document.getElementById("summary-form"),
    urlInput: document.getElementById("article-url"),
    loader: document.getElementById("loader"),
    summaryBox: document.getElementById("summary-box"),
    summaryContent: document.getElementById("summary-content"),
    urlDisplay: document.getElementById("url-display"),
    errorBox: document.getElementById("error-message"),
    historyList: document.getElementById("history-list"),
    clearHistoryBtn: document.getElementById("clear-history"),
    noHistoryMsg: document.getElementById("no-history")
  };
}

// No scroll controls needed

// Form handling
async function handleFormSubmit(e) {
  e.preventDefault();

  elements.loader?.classList.remove("hidden");
  elements.summaryBox?.classList.add("hidden");
  elements.errorBox?.classList.add("hidden");

  const url = elements.urlInput?.value.trim();
  if (url) {
    localStorage.setItem('lastUrl', url);
  }

  try {
    // Basic URL validation
    if (!url) {
      throw new Error("Please enter a URL");
    }
    
    // Add https:// if not present and doesn't start with http:// or https://
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = 'https://' + url;
    }
    
    // Validate URL format
    try {
      new URL(processedUrl);
    } catch (e) {
      throw new Error("Please enter a valid URL (e.g., example.com or https://example.com)");
    }

    const apiUrl = window.env?.API_URL || 'http://localhost:9000';
    const response = await fetch(`${apiUrl}/api/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({ url: processedUrl })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    currentSummary = {
      url: processedUrl,
      summary: data.summary || "No summary available",
      timestamp: Date.now()
    };
    
    // Save to history
    saveToHistory({...currentSummary});

    elements.urlDisplay.textContent = new URL(processedUrl).hostname;
    elements.summaryContent.textContent = currentSummary.summary;
    elements.summaryBox.classList.remove("hidden");
  } catch (error) {
    console.error('Error:', error);
    elements.errorBox.textContent = `Error: ${error.message}`;
    elements.errorBox.classList.remove("hidden");
  } finally {
    elements.loader.classList.add("hidden");
  }
}

// History functions
function saveToHistory(summary) {
  // Add to beginning of array (most recent first)
  history.unshift(summary);
  
  // Limit history size
  if (history.length > MAX_HISTORY_ITEMS) {
    history.pop();
  }
  
  // Save to localStorage
  localStorage.setItem('summarizationHistory', JSON.stringify(history));
  
  // Update UI
  renderHistory();
}

function clearHistory() {
  history = [];
  localStorage.removeItem('summarizationHistory');
  renderHistory();
}

function renderHistory() {
  if (!elements.historyList) return;
  
  elements.historyList.innerHTML = '';
  
  if (history.length === 0) {
    elements.noHistoryMsg.style.display = 'block';
    return;
  }
  
  elements.noHistoryMsg.style.display = 'none';
  
  history.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.dataset.index = index;
    
    const url = document.createElement('div');
    url.className = 'history-item-url';
    url.textContent = new URL(item.url).hostname;
    
    const date = document.createElement('div');
    date.className = 'history-item-date';
    date.textContent = formatDate(item.timestamp);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'history-item-delete';
    deleteBtn.title = 'Delete this item';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    // Stop event propagation to prevent loading the item when clicking delete
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteHistoryItem(index);
    });
    
    li.appendChild(url);
    li.appendChild(date);
    li.appendChild(deleteBtn);
    
    li.addEventListener('click', () => loadHistoryItem(index));
    elements.historyList.appendChild(li);
  });
}

function deleteHistoryItem(index) {
  if (index >= 0 && index < history.length) {
    history.splice(index, 1);
    localStorage.setItem('summarizationHistory', JSON.stringify(history));
    renderHistory();
    
    // If the deleted item was the current summary, clear the summary view
    if (currentSummary && index === 0) {
      elements.summaryBox.classList.add('hidden');
      currentSummary = null;
    }
  }
}

function loadHistoryItem(index) {
  const item = history[index];
  if (!item) return;
  
  currentSummary = item;
  elements.urlInput.value = item.url;
  elements.urlDisplay.textContent = new URL(item.url).hostname;
  elements.summaryContent.textContent = item.summary;
  elements.summaryBox.classList.remove("hidden");
  elements.errorBox.classList.add("hidden");
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadHistory() {
  try {
    const savedHistory = localStorage.getItem('summarizationHistory');
    if (savedHistory) {
      history = JSON.parse(savedHistory);
      renderHistory();
    }
  } catch (e) {
    console.error('Failed to load history:', e);
  }
}

// Initialize event listeners
function initEventListeners() {
  if (elements.summaryForm) {
    elements.summaryForm.addEventListener("submit", handleFormSubmit);
  }
  
  // Remove clear history button functionality since we're using individual deletes now

  const copyButton = document.getElementById("copy-summary");
  if (copyButton) {
    copyButton.addEventListener("click", () => {
      if (elements.summaryContent) {
        navigator.clipboard.writeText(elements.summaryContent.textContent)
          .then(() => {
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
              copyButton.innerHTML = originalText;
            }, 2000);
          });
      }
    });
  }

  if (elements.saveButton) {
    elements.saveButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentSummary) {
        alert('Summary saved!');
      } else {
        alert('No summary to save. Please generate a summary first.');
      }
    });
  }
}

// Initialize the application
function initApp() {
  elements = initElements();
  initEventListeners();
  loadHistory();
  
  // Load last used URL if available
  const lastUrl = localStorage.getItem('lastUrl');
  if (lastUrl) {
    elements.urlInput.value = lastUrl;
  }
}

// Start app on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}