#  Wiki Article AI — Interactive Quiz Generator

An AI-powered web application that transforms Wikipedia articles into **interactive quizzes**.

Users provide a Wikipedia article URL, and the application extracts the article content, sends it to an AI model, and generates structured quiz questions. Instead of displaying raw AI output, the application converts the response into an interactive quiz experience.

🔗 **Live Demo:** [wiki-article-ai.netlify.app](https://wiki-article-ai.netlify.app/?utm_source=chatgpt.com)

---

## 🚀 Features

* 🔗 Accepts Wikipedia article URLs
* 📄 Extracts article content automatically
* 🤖 Generates quiz questions using AI
* 🧩 Converts AI output into structured data
* 🎯 Interactive multiple-choice quiz
* 📊 Displays quiz results and score
* 🔄 Allows users to retry the quiz
* ⚡ Fast and responsive interface
* 📱 Mobile-friendly design
* ❌ Handles invalid input and API failures
* ⏳ Loading states while generating quizzes
* 🛡️ Prevents raw AI responses from directly controlling the UI

---

##  Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Tailwind CSS
* React Hooks

### Backend

* Python
* FastAPI
* REST API

### AI

* Google Gemini
* LangChain

### Data Processing

* BeautifulSoup
* Wikipedia article extraction
* Structured JSON responses

### Development Tools

* Git
* GitHub
* VS Code
* Postman

---

##  Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    │ Wikipedia URL       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     React App       │
                    │                     │
                    │ URL Input + Quiz UI │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI API      │
                    │                     │
                    │ Validate Request    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Wikipedia Extractor │
                    │                     │
                    │ BeautifulSoup       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     AI Service      │
                    │                     │
                    │ Gemini + LangChain  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Structured JSON     │
                    │ Quiz Questions      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     React Quiz      │
                    │                     │
                    │ Questions + Answers │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Results        │
                    │                     │
                    │ Score + Retry       │
                    └─────────────────────┘
```

---

##  Project Structure

```text
wiki-article-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── ...
│
├── README.md
└── .gitignore
```

---

##  How It Works

### 1. Enter a Wikipedia Article

The user provides a Wikipedia article URL through the frontend.

Example:

```text
https://en.wikipedia.org/wiki/Artificial_intelligence
```

### 2. Backend Validates the Request

The React application sends the URL to the FastAPI backend.

The backend validates the request before processing it.

### 3. Extract Article Content

The backend retrieves the article and extracts the relevant text using BeautifulSoup.

### 4. Generate Quiz Using AI

The extracted content is passed to the AI service with instructions to generate quiz questions.

The model is instructed to return structured JSON rather than conversational text.

### 5. Validate AI Output

The application validates the generated response before sending it to the frontend.

This prevents malformed AI responses from directly breaking the UI.

### 6. Render Interactive Quiz

The React application converts the validated JSON into quiz components.

Users can:

* Select answers
* Move between questions
* Submit the quiz
* View their score
* Retry the quiz

---

## 🧩 Example AI Response

The AI is expected to return structured data similar to:

```json
{
  "title": "Artificial Intelligence",
  "questions": [
    {
      "question": "What is artificial intelligence?",
      "options": [
        "A programming language",
        "A field of computer science",
        "A database",
        "An operating system"
      ],
      "correctAnswer": 1,
      "explanation": "Artificial intelligence is a field of computer science focused on creating systems capable of performing tasks that normally require human intelligence."
    }
  ]
}
```

The frontend does **not** simply display this JSON.

Instead, it transforms the data into interactive React components.

---

##  AI Output Handling

AI-generated output is unpredictable, so the application treats the model response as untrusted input.

The application accounts for cases such as:

* Invalid JSON
* Missing properties
* Empty responses
* Incorrect question structures
* Missing answer options
* Invalid correct-answer indexes
* API failures
* Network errors
* Invalid Wikipedia URLs
* Slow AI responses

Instead of allowing these errors to crash the application, the UI displays an appropriate error state and allows the user to retry.

---

##  Loading & Error States

The application provides different UI states for different stages of the request.

### Empty State

Displayed before the user starts generating a quiz.

### Loading State

Displayed while the article is being processed and the AI generates questions.

### Error State

Displayed when:

* The URL is invalid
* Article extraction fails
* AI generation fails
* The API returns invalid data
* A network request fails

### Success State

Displays the generated interactive quiz.

---

## 🔐 Environment Variables

API keys are kept on the backend and are **not exposed in the React frontend**.

Create a `.env` file in the backend:

```env
GEMINI_API_KEY=your_api_key_here
```

Do not commit `.env` to GitHub.

Add it to `.gitignore`:

```text
.env
venv/
__pycache__/
node_modules/
```

---

## 💻 Local Setup

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* Python 3.10+
* Git

---

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd wiki-article-ai
```

---

### 2. Start the Backend

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```text
http://localhost:8000
```

---

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

---

##  API Testing

The backend can be tested using Postman or the FastAPI Swagger documentation.

Swagger:

```text
http://localhost:8000/docs
```

Example request:

```json
{
  "url": "https://en.wikipedia.org/wiki/Artificial_intelligence"
}
```

---

##  Design Decisions

### Why React?

React makes it straightforward to build stateful interactive components such as:

* Quiz questions
* Answer selection
* Progress tracking
* Results
* Retry functionality

### Why FastAPI?

FastAPI provides a lightweight backend for:

* Protecting API keys
* Validating requests
* Calling the AI model
* Processing Wikipedia content
* Returning structured responses

### Why Structured AI Output?

Returning structured JSON allows the frontend to control how the AI-generated information is rendered.

Instead of:

```text
AI → raw text → UI
```

the application uses:

```text
AI
 ↓
JSON
 ↓
Validation
 ↓
React state
 ↓
Interactive UI
```

This makes the AI feature more predictable and maintainable.

---

## 🤖 AI Usage Note

AI development tools were used during development for:

* Brainstorming application architecture
* Debugging implementation issues
* Improving prompts
* Reviewing error-handling approaches
* Generating development suggestions
* Improving documentation

The final application architecture, implementation, integration, debugging, and testing were reviewed and adapted during development.

I understand the codebase and can explain the major implementation decisions.

---

## ⚠️ Known Limitations

* Quiz quality depends on the quality of the source article and AI-generated content.
* AI responses may occasionally contain inaccurate information.
* Very large Wikipedia articles may require additional content processing.
* AI generation depends on external API availability.
* Free AI API tiers may have rate limits.
* The application currently focuses on Wikipedia-based quiz generation.

---

## 🔮 Future Improvements

Potential improvements include:

* Difficulty selection
* Custom question count
* Multiple question types
* Timer-based quizzes
* User accounts
* Saved quiz sessions
* Quiz history
* Leaderboards
* More source websites
* Streaming AI responses
* Better AI output validation
* Automated tests
* Progressive Web App support

---

## 📱 Responsive Design

The application is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile devices

The UI adapts to smaller screen sizes so users can generate and complete quizzes comfortably on mobile devices.

---

## 🌐 Live Demo

Try the application:

[Wiki Article AI — Live Demo](https://wiki-article-ai.netlify.app/?utm_source=chatgpt.com)

---

## 👨‍💻 Author

**Mahendra**

Full Stack Developer | React | Node.js | Python | FastAPI | AI/ML

GitHub: `github.com/mahendra2821`

Portfolio: `portfolio-mahee.netlify.app`

---

## 📄 License

This project is created for educational, portfolio, and internship-assignment purposes.
