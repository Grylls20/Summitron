document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('summary-form');
    const loader = document.getElementById('loader');
    const summaryBox = document.getElementById('summary-box');
    const summaryContent = document.getElementById('summary-content');
    const urlDisplay = document.getElementById('url-display');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const url = formData.get('url');

        // Reset UI
        loader.style.display = 'block';
        summaryBox.style.display = 'none';
        errorMessage.style.display = 'none';

        try {
            const response = await fetch('/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formData).toString(),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.error) {
                    throw new Error(result.error);
                }
                urlDisplay.textContent = result.url;
                summaryContent.textContent = result.summary;
                summaryBox.style.display = 'block';
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'An unknown error occurred.');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        } finally {
            loader.style.display = 'none';
        }
    });
});
