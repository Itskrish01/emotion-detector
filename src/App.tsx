import { useState } from 'react'

interface EmotionScore {
  emotion: string
  score: number
}

interface AnalysisResult {
  primary_emotion: string
  confidence: number
  all_emotions: EmotionScore[]
}

const emotionEmojis: Record<string, string> = {
  joy: '😊',
  sadness: '😢',
  anger: '😠',
  fear: '😨',
  surprise: '😲',
  disgust: '🤢',
  neutral: '😐',
}

const emotionDescriptions: Record<string, string> = {
  joy: 'Feeling happy and delighted',
  sadness: 'Feeling down or melancholic',
  anger: 'Feeling frustrated or upset',
  fear: 'Feeling anxious or worried',
  surprise: 'Feeling amazed or astonished',
  disgust: 'Feeling repulsed or averse',
  neutral: 'Calm and balanced tone',
}

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeEmotion = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('https://itsKrish01-emotion-checker.hf.space/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again (30 requests/minute).')
      }

      if (response.status === 404) {
        throw new Error('API endpoint not found. The Hugging Face Space may be sleeping or unavailable. Please try again in a few moments.')
      }

      if (response.status === 405) {
        throw new Error('Method not allowed. Please ensure the request is using POST.')
      }

      if (!response.ok) {
        throw new Error(`Analysis failed with status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('The API returned an invalid response. The Hugging Face Space may be starting up. Please try again in a few moments.')
      }

      const data: AnalysisResult = await response.json()
      setResult(data)
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection.')
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      analyzeEmotion()
    }
  }

  const clearAll = () => {
    setText('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-zinc-900 flex items-center justify-center">
                <span className="text-lg sm:text-xl">🎭</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-950">
                  Emotion Analyzer
                </h1>
                <p className="text-xs text-zinc-500 hidden sm:block">
                  AI-powered emotional tone detection
                </p>
              </div>
            </div>
            {(text || result) && (
              <button
                onClick={clearAll}
                className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md hover:bg-zinc-100"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1">
        {/* Input Section */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            <label htmlFor="text-input" className="block text-sm font-medium text-zinc-700 mb-2">
              Enter your text
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type or paste the text you want to analyze..."
              className="w-full h-28 sm:h-36 p-3 sm:p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 placeholder-zinc-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-4 gap-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <svg className="h-4 w-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">
                  <span className="hidden sm:inline">Press </span>Ctrl+Enter
                </span>
              </div>
              <button
                onClick={analyzeEmotion}
                disabled={loading || !text.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-sm font-medium rounded-lg transition-all disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-red-600" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM8 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 4zm0 8a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Analysis Failed</h3>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-6 space-y-4 sm:space-y-6">
            {/* Primary Emotion Card */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-zinc-100 bg-zinc-50/50">
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Primary Emotion Detected</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                    <span className="text-4xl sm:text-5xl">
                      {emotionEmojis[result.primary_emotion] || '🤔'}
                    </span>
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <p className="text-2xl sm:text-3xl font-semibold text-zinc-950 capitalize">
                      {result.primary_emotion}
                    </p>
                    <p className="text-zinc-500 text-sm mt-1">
                      {emotionDescriptions[result.primary_emotion] || 'Detected emotion'}
                    </p>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                        <span>Confidence Level</span>
                        <span className="font-medium text-zinc-900 tabular-nums">{(result.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 transition-all duration-700 ease-out rounded-full"
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* All Emotions Chart */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-zinc-100 bg-zinc-50/50">
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Complete Breakdown</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid gap-4 sm:gap-5">
                  {result.all_emotions
                    .sort((a, b) => b.score - a.score)
                    .map((item, index) => (
                      <div 
                        key={item.emotion} 
                        className="group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center transition-colors">
                            <span className="text-base sm:text-lg">{emotionEmojis[item.emotion] || '🤔'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-zinc-800 capitalize truncate">
                                {item.emotion}
                              </span>
                              <span className="text-xs font-medium text-zinc-600 tabular-nums shrink-0">
                                {(item.score * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-1.5">
                              <div
                                className="h-full bg-zinc-400 group-hover:bg-zinc-600 transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${item.score * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !error && !loading && (
          <div className="mt-12 sm:mt-16 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-zinc-100 mb-4">
              <span className="text-3xl sm:text-4xl">✨</span>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-zinc-700">Ready to analyze</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
              Enter some text above and click analyze to discover its emotional tone
            </p>
          </div>
        )}

        {/* About Section */}
        <div className="mt-12 sm:mt-16 rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">About This Tool</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                  <h3 className="text-sm font-medium text-zinc-800">AI Model</h3>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Powered by{' '}
                  <a 
                    href="https://huggingface.co/j-hartmann/emotion-english-distilroberta-base" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-900 font-medium underline underline-offset-2 hover:text-zinc-600 transition-colors"
                  >
                    DistilRoBERTa-base
                  </a>
                  , a fine-tuned transformer model trained on 6 diverse datasets for emotion classification.
                </p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                  </svg>
                  <h3 className="text-sm font-medium text-zinc-800">Backend</h3>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Built with{' '}
                  <span className="text-zinc-900 font-medium">FastAPI</span>
                  {' '}and{' '}
                  <span className="text-zinc-900 font-medium">Python</span>
                  , deployed on Hugging Face Spaces for fast, reliable emotion detection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-4">
              <span>Rate limit: 30 req/min</span>
              <span className="hidden sm:inline">•</span>
              <a 
                href="https://huggingface.co/j-hartmann/emotion-english-distilroberta-base" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-zinc-600 transition-colors"
              >
                View Model ↗
              </a>
            </div>
            <p className="flex items-center gap-1.5">
              <span>Built with</span>
              <span className="text-zinc-600">React</span>
              <span>•</span>
              <span className="text-zinc-600">FastAPI</span>
              <span>•</span>
              <span className="text-zinc-600">🤗 Transformers</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
