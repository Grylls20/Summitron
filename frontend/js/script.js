document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const form = document.getElementById('summary-form');
    const loader = document.getElementById('loader');
    const summaryBox = document.getElementById('summary-box');
    const summaryContent = document.getElementById('summary-content');
    const urlDisplay = document.getElementById('url-display');
    const errorMessage = document.getElementById('error-message');
    const copyButton = document.getElementById('copy-summary');
    const urlInput = document.getElementById('article-url');
    let isSubmitting = false;
    let originalButtonText = '';

    // Format URL for display
    const formatUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
        } catch (e) {
            return url;
        }
    };

    // Show loading state
    const showLoading = (isLoading) => {
        loader.style.display = isLoading ? 'flex' : 'none';
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = isLoading;
            const icon = submitButton.querySelector('i');
            if (icon) {
                icon.className = isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-magic';
            }
        }
    };

    // Hide element
    const hideElement = (element) => {
        if (element) element.style.display = 'none';
    };

    // Show error message
    const showError = (message) => {
        if (errorMessage) {
            const errorText = errorMessage.querySelector('span');
            if (errorText) {
                errorText.textContent = message;
            }
            errorMessage.style.display = 'flex';
        }
    };

    // Copy summary to clipboard
    const copyToClipboard = () => {
        const textToCopy = summaryContent ? summaryContent.innerText : '';
        navigator.clipboard.writeText(textToCopy).then(() => {
            if (copyButton) {
                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyButton.classList.add('copied');
                
                setTimeout(() => {
                    copyButton.innerHTML = originalText;
                    copyButton.classList.remove('copied');
                }, 2000);
            }
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text. Please try again.');
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        isSubmitting = true;
        
        const url = urlInput.value.trim();

        if (!url) {
            showError('Please enter a valid URL');
            isSubmitting = false;
            return;
        }

        // Show loader, hide previous results and errors
        showLoading(true);
        if (summaryBox) {
            summaryBox.style.display = 'none';
            summaryBox.classList.remove('visible');
        }
        hideElement(errorMessage);

        try {
            // Call the backend API
            const response = await fetch('https://summitron-6w42g4etza-uc.a.run.app/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ url }).toString(),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to generate summary. Please try again.');
            }

            // Display results
            if (urlDisplay) {
                urlDisplay.textContent = formatUrl(url);
                urlDisplay.setAttribute('title', url);
            }
            
            if (summaryContent) {
                // Clear previous content
                summaryContent.innerHTML = '';
                
                // Add each paragraph as a separate element
                const paragraphs = result.summary.split('\n').filter(p => p.trim() !== '');
                paragraphs.forEach((paragraph, index) => {
                    const p = document.createElement('p');
                    p.textContent = paragraph.trim();
                    p.style.opacity = '0';
                    p.style.transform = 'translateY(10px)';
                    p.style.transition = `opacity 0.3s ease ${index * 0.1}s, transform 0.3s ease ${index * 0.1}s`;
                    summaryContent.appendChild(p);
                    
                    // Animate in
                    setTimeout(() => {
                        p.style.opacity = '1';
                        p.style.transform = 'translateY(0)';
                    }, 10);
                });
            }
            
            if (summaryBox) {
                // Show the summary box with animation
                summaryBox.style.display = 'block';
                setTimeout(() => {
                    summaryBox.classList.add('visible');
                    
                    // Scroll to results after a short delay
                    setTimeout(() => {
                        summaryBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                }, 10);
            }

        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'An error occurred while generating the summary. Please try again.');
        } finally {
            showLoading(false);
            isSubmitting = false;
        }
    };

    // Event Listeners
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    if (copyButton) {
        copyButton.addEventListener('click', copyToClipboard);
    }

    // Auto-focus URL input on page load
    if (urlInput) {
        urlInput.focus();
    }
});
