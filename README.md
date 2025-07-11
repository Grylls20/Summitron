# Summitron 🚀

**An intelligent web application that summarizes any online article into a concise and easy-to-read digest.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://summitron.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## ✨ What it does

Summitron takes the URL of any online article and uses the power of AI to generate a high-quality summary. Say goodbye to information overload and get the key insights from long articles in just seconds.

## 🏛️ Architecture

Summitron is built on a modern, decoupled architecture for scalability and maintainability.

-   **Frontend**: A static site built with HTML, CSS, and vanilla JavaScript. It is hosted on **Netlify** for fast global delivery.
-   **Backend**: A Java Spring Boot application that serves a single REST API endpoint for summarization. It is containerized with Docker and deployed on **Google Cloud Run** for a scalable, serverless backend.

This separation allows the frontend and backend to be developed, deployed, and scaled independently.

```
+----------------+      +-------------------------+      +-----------------+
|   User Browser |----->|  Netlify Frontend       |----->| Google Cloud Run|
| (Netlify Site) |      | (HTML, CSS, JS)         |      | (Spring Boot API)| 
+----------------+      +-------------------------+      +-------+---------+
                                                                 |
                                                                 v
                                                         +-----------------+
                                                         |   Together AI   |
                                                         | (Llama 3 Model) |
                                                         +-----------------+
```

## 🌟 Features

-   **Decoupled Architecture**: Independent frontend and backend for better performance and scalability.
-   **Modern & Responsive UI**: A clean, user-friendly interface that works on all devices.
-   **Asynchronous Summaries**: Paste a URL and get your summary without a page reload.
-   **AI-Powered**: Leverages the powerful **Llama 3 70B Instruct Turbo** model via the **Together AI** API for state-of-the-art summarization.

## 🛠️ Tech Stack

-   **Backend**: Java 11, Spring Boot, Docker
-   **Frontend**: HTML5, CSS3, JavaScript (Fetch API)
-   **AI Integration**: Together AI API (Llama 3)
-   **Build Tool**: Apache Maven
-   **Deployment**: Google Cloud Run (Backend) & Netlify (Frontend)

## ⚙️ Getting Started (Local Development)

To run Summitron on your local machine, follow these steps.

### Prerequisites

-   Java Development Kit (JDK) 11 or later
-   Apache Maven
-   A **Together AI** API Key

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Grylls20/Summitron.git
    cd Summitron
    ```

2.  **Configure your API Key:**
    Create a `.env` file in the root of the project directory:
    ```bash
    touch .env
    ```
    Add your Together AI API key to the `.env` file:
    ```
    TOGETHER_API_KEY=YOUR_TOGETHER_AI_API_KEY_HERE
    ```

3.  **Build and run the application:**
    ```bash
    ./mvnw spring-boot:run
    ```

4.  **View the frontend:**
    Open the `frontend/index.html` file directly in your browser. The application will be fully functional and will make requests to your local backend running on `http://localhost:9000`.

## 🚀 Deployment

### Backend (Google Cloud Run)

The backend is deployed as a Docker container to Google Cloud Run.

1.  Make sure you have the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and configured.
2.  Run the deployment command from the project root. **Remember to replace the placeholder with your actual API key.**
    ```bash
    gcloud run deploy summitron-backend \
      --source . \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars "TOGETHER_API_KEY=YOUR_TOGETHER_AI_API_KEY_HERE"
    ```
3.  After deployment, update the `fetch` URL in `frontend/js/script.js` to point to your new Google Cloud Run service URL.

### Frontend (Netlify)

The frontend is deployed as a static site from the `frontend` directory.

1.  Push your code to a GitHub repository.
2.  Create a new site on [Netlify](https://app.netlify.com/start) and connect it to your GitHub repository.
3.  Configure the build settings:
    -   **Publish directory**: `frontend`
    -   **Build command**: (leave blank)
4.  Deploy the site. Netlify will automatically build and deploy any future changes pushed to your main branch.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
