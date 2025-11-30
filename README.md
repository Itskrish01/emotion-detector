# 🎭 Emotion Tone Analyzer

An AI-powered web application that analyzes the emotional tone of text using advanced natural language processing. Detect joy, sadness, anger, fear, surprise, disgust, and neutral emotions with confidence scores.

![Emotion Analyzer Demo](https://img.shields.io/badge/demo-live-brightgreen)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Real-time Emotion Detection** - Analyze text and get instant emotion predictions
- **7 Emotion Categories** - Joy 😊, Sadness 😢, Anger 😠, Fear 😨, Surprise 😲, Disgust 🤢, Neutral 😐
- **Confidence Scores** - See how confident the AI is in its predictions
- **Complete Breakdown** - View all emotion scores in a visual bar chart
- **Modern UI** - Clean, responsive design with shadcn-inspired aesthetics
- **Fast & Free** - No sign-up required, instant results

## 🚀 Live Demo

**[Try the Emotion Analyzer →](https://text-emotion-detector.netlify.app/)**

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Vite** - Lightning-fast build tool

### Backend
- **FastAPI** - High-performance Python API
- **Hugging Face Transformers** - State-of-the-art NLP
- **DistilRoBERTa** - Fine-tuned emotion classification model

## 🧠 AI Model

This app uses the [j-hartmann/emotion-english-distilroberta-base](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base) model, a DistilRoBERTa-base model fine-tuned on 6 diverse datasets for emotion classification in English text.

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Itskrish01/emotion-detector.git

# Navigate to the project
cd emotion-detector

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔧 API Reference

### Analyze Emotion

```http
POST https://itsKrish01-emotion-checker.hf.space/api/v1/analyze
```

**Request Body:**
```json
{
  "text": "I'm so happy today!"
}
```

**Response:**
```json
{
  "primary_emotion": "joy",
  "confidence": 0.95,
  "all_emotions": [
    { "emotion": "joy", "score": 0.95 },
    { "emotion": "surprise", "score": 0.02 },
    { "emotion": "neutral", "score": 0.01 },
    { "emotion": "sadness", "score": 0.01 },
    { "emotion": "anger", "score": 0.005 },
    { "emotion": "fear", "score": 0.003 },
    { "emotion": "disgust", "score": 0.002 }
  ]
}
```

**Rate Limit:** 30 requests per minute

## 📁 Project Structure

```
emotion-detector/
├── public/
├── src/
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── index.html         # HTML template with SEO
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for hosting the model and API
- [j-hartmann](https://huggingface.co/j-hartmann) for the emotion classification model
- [shadcn/ui](https://ui.shadcn.com/) for design inspiration

---

Made with ❤️ by [Krish](https://github.com/Itskrish01)
