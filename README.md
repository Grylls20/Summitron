# Summitron 🚀

**An intelligent web application that summarizes any online article into a concise and easy-to-read digest.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://summitron.onrender.com) <!-- Replace with your actual Render URL -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

 <!-- TODO: Add a screenshot of the app -->

---

## ✨ What it does

Summitron takes the URL of any online article and uses the power of AI to generate a high-quality summary. Say goodbye to information overload and get the key insights from long articles in just seconds.

## 🌟 Features

- **Modern & Responsive UI**: A clean, user-friendly interface that works on all devices.
- **Asynchronous Summaries**: Paste a URL and get your summary without a page reload.
- **Dynamic Loading & Error States**: A smooth user experience with a loading spinner and clear error messages.
- **AI-Powered**: Leverages the Google Gemini model via the OpenRouter API for state-of-the-art summarization.

## 🛠️ Tech Stack

- **Backend**: Java 11, Spring Boot
- **Frontend**: HTML5, CSS3, JavaScript (Fetch API)
- **AI Integration**: OpenRouter API (Google Gemini Flash 1.5)
- **Build Tool**: Apache Maven
- **Deployment**: Render (via Docker)

## ⚙️ Getting Started

To run Summitron on your local machine, follow these steps.

### Prerequisites

- Java Development Kit (JDK) 11 or later
- Apache Maven
- An OpenRouter API Key

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Grylls20/Summitron.git
    cd Summitron
    ```

2.  **Configure your API Key:**
    Open the `src/main/resources/application.properties` file and replace the placeholder with your OpenRouter API key:
    ```properties
    openrouter.api.key=YOUR_OPENROUTER_API_KEY_HERE
    server.port=${PORT:9000}
    ```

3.  **Build and run the application:**
    ```bash
    ./mvnw spring-boot:run
    ```

4.  Open your browser and navigate to `http://localhost:9000`.

## 🚀 Deployment

This application is configured for seamless deployment on [Render](https://render.com/) using Docker.

1.  Push the code to a GitHub repository.
2.  Create a new **Blueprint Service** on Render and connect it to your repository.
3.  Render will automatically detect the `render.yaml` file and configure the deployment.
4.  Add your `openrouter.api.key` as a **Secret Environment Variable** in the Render dashboard.

Render will then build the Docker image and deploy the application.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
