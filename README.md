# emotion-detector-js

A simple JavaScript/TypeScript client for the Emotion Tone Analyzer API. Works seamlessly in Node.js and browser environments with zero dependencies.

## How It Works

This package connects to an emotion detection API built with **Python** and **FastAPI**, powered by a pre-trained [DistilRoBERTa](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base) model. The API is hosted on Hugging Face Spaces:

🤗 **[Live API on Hugging Face](https://huggingface.co/spaces/itsKrish01/emotion-checker)**

The model detects 7 emotions: joy, sadness, anger, fear, surprise, disgust, and neutral.

## Features

- 🎯 **Simple API** - Easy to use `analyze()` and `analyzeBatch()` methods
- 📦 **Zero Dependencies** - Uses native `fetch` API
- 🔷 **TypeScript Support** - Full type definitions included
- 🌐 **Universal** - Works in Node.js (18+) and browsers
- ⚡ **Dual Module** - ESM and CommonJS support
- 🛡️ **Built-in Validation** - Automatic word count validation before API calls
- 🔧 **Configurable** - Custom base URL for self-hosted instances

## Installation

```bash
npm install emotion-detector-js
```

```bash
yarn add emotion-detector-js
```

```bash
pnpm add emotion-detector-js
```

## Quick Start

```javascript
import { EmotionAnalyzer } from 'emotion-detector-js';

const analyzer = new EmotionAnalyzer();

// Analyze a single text
const result = await analyzer.analyze("I'm so happy today!");
console.log(result.primaryEmotion); // "joy"
console.log(result.confidence);     // 0.95
```

## Usage

### Single Text Analysis

```typescript
import { EmotionAnalyzer } from 'emotion-detector-js';

const analyzer = new EmotionAnalyzer();

const result = await analyzer.analyze("I'm feeling great about this project!");

console.log(result);
// {
//   primaryEmotion: "joy",
//   confidence: 0.92,
//   allEmotions: [
//     { emotion: "joy", score: 0.92 },
//     { emotion: "surprise", score: 0.05 },
//     { emotion: "neutral", score: 0.03 }
//   ]
// }
```

### Batch Analysis

Analyze multiple texts in a single request:

```typescript
const results = await analyzer.analyzeBatch([
  "I'm so excited about the new features!",
  "This is really frustrating.",
  "I don't know what to think about this."
]);

console.log(results.count); // 3
results.results.forEach((result, index) => {
  console.log(`Text ${index + 1}: ${result.primaryEmotion} (${result.confidence})`);
});
```

### Configuration Options

```typescript
const analyzer = new EmotionAnalyzer({
  // Custom base URL for self-hosted instances
  baseUrl: 'https://your-custom-url.com',
  
  // Request timeout in milliseconds (default: 30000)
  timeout: 10000
});
```

### Error Handling

The library provides specific error classes for different failure scenarios:

```typescript
import { 
  EmotionAnalyzer, 
  ValidationError, 
  RateLimitError, 
  ApiError,
  TimeoutError,
  NetworkError 
} from 'emotion-detector-js';

const analyzer = new EmotionAnalyzer();

try {
  const result = await analyzer.analyze("Your text here");
} catch (error) {
  if (error instanceof ValidationError) {
    // Input validation failed (e.g., text too long)
    console.error('Validation error:', error.message);
    console.error('Field:', error.field);
  } else if (error instanceof RateLimitError) {
    // Rate limit exceeded (429)
    console.error('Rate limit exceeded. Retry after:', error.retryAfter, 'seconds');
  } else if (error instanceof ApiError) {
    // API returned an error
    console.error('API error:', error.message);
    console.error('Status code:', error.statusCode);
  } else if (error instanceof TimeoutError) {
    // Request timed out
    console.error('Request timed out after:', error.timeout, 'ms');
  } else if (error instanceof NetworkError) {
    // Network error occurred
    console.error('Network error:', error.message);
  }
}
```

## API Constraints

| Constraint | Single Analysis | Batch Analysis |
|------------|-----------------|----------------|
| Max words per text | 100 | 100 |
| Max texts | 1 | 10 |
| Rate limit | 30 req/min | 10 req/min |

## API Reference

### `EmotionAnalyzer`

#### Constructor

```typescript
new EmotionAnalyzer(options?: EmotionAnalyzerOptions)
```

**Options:**
- `baseUrl?: string` - Custom API base URL (default: `https://itsKrish01-emotion-checker.hf.space`)
- `timeout?: number` - Request timeout in milliseconds (default: `30000`)

#### Methods

`analyze(text: string): Promise<EmotionResult>`

Analyze a single text for emotion.

**Parameters:**
- `text` - The text to analyze (max 100 words)

**Returns:** `EmotionResult`
```typescript
{
  primaryEmotion: string;  // The detected primary emotion
  confidence: number;      // Confidence score (0-1)
  allEmotions: Array<{     // All detected emotions
    emotion: string;
    score: number;
  }>;
}
```

`analyzeBatch(texts: string[]): Promise<BatchEmotionResult>`

Analyze multiple texts in a batch.

**Parameters:**
- `texts` - Array of texts to analyze (max 10 texts, 100 words each)

**Returns:** `BatchEmotionResult`
```typescript
{
  results: EmotionResult[];  // Array of results for each input text
  count: number;             // Number of texts analyzed
}
```

### Error Classes

| Error Class | Description |
|-------------|-------------|
| `EmotionAnalyzerError` | Base error class |
| `ValidationError` | Input validation failed |
| `RateLimitError` | Rate limit exceeded (HTTP 429) |
| `ApiError` | API returned an error response |
| `TimeoutError` | Request timed out |
| `NetworkError` | Network connection error |

## Usage with React

```jsx
import { useState } from 'react';
import { EmotionAnalyzer, ValidationError, RateLimitError } from 'emotion-detector-js';

const analyzer = new EmotionAnalyzer();

function EmotionDetector() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzer.analyze(text);
      setResult(result);
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(`Validation error: ${err.message}`);
      } else if (err instanceof RateLimitError) {
        setError('Too many requests. Please wait a moment.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to analyze..."
      />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Emotion'}
      </button>
      
      {error && <p className="error">{error}</p>}
      
      {result && (
        <div>
          <h3>Result:</h3>
          <p>Emotion: {result.primaryEmotion}</p>
          <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}
```

## Requirements

- Node.js 18+ (for native fetch support) or browser environment
- For older Node.js versions, you'll need a fetch polyfill
