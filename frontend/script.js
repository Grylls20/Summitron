document.getElementById("summary-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const url = document.getElementById("article-url").value;
  const loader = document.getElementById("loader");
  const summaryBox = document.getElementById("summary-box");
  const summaryContent = document.getElementById("summary-content");
  const urlDisplay = document.getElementById("url-display");
  const errorBox = document.getElementById("error-message");

  // Show loader, hide previous results and errors
  loader.classList.remove("hidden");
  summaryBox.classList.add("hidden");
  errorBox.classList.add("hidden");

  try {
    if (!url || !url.includes("http")) {
      throw new Error("Please enter a valid URL");
    }

    // Call the backend API
    const response = await fetch('http://localhost:9000/api/summarize', {
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
    
    // Display the summary
    urlDisplay.textContent = new URL(url).hostname;
    summaryContent.textContent = data.summary || "No summary available";
    summaryBox.classList.remove("hidden");
    
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
const copyButton = document.getElementById("copy-summary");
copyButton.addEventListener("click", () => {
  const summary = document.getElementById("summary-content").textContent;
  navigator.clipboard.writeText(summary).then(() => {
    // Show feedback
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
      copyButton.innerHTML = originalText;
    }, 2000);
  });
});

// Focus the URL input on page load
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("article-url").focus();
});
