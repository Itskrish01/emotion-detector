import { useState, useEffect, type JSX } from 'react'
import { EmotionAnalyzer } from 'emotion-detector-js'
// @ts-ignore
import readmeContent from '../README.md?raw'

// Initialize the analyzer
const analyzer = new EmotionAnalyzer()

interface EmotionResult {
  primaryEmotion: string
  confidence: number
  allEmotions: {
    emotion: string
    score: number
  }[]
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

// Copy Button Component
const CopyButton = ({ text, className = "" }: { text: string, className?: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`group relative inline-flex items-center justify-center rounded-lg transition-all ${className}`}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <span className="flex items-center gap-1.5 text-zinc-950 font-medium">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs">Copied!</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-zinc-500 group-hover:text-zinc-950 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium">Copy</span>
        </span>
      )}
    </button>
  )
}

// Syntax Highlighting Helper
const highlightCode = (code: string) => {
  // Escape HTML entities first
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Combined regex for tokenization
  // Order: Comments, Strings, Keywords, Functions, Numbers
  const tokenRegex = /(\/\/.*)|(['"`])(.*?)\2|(\b(?:import|from|const|let|var|async|await|function|return|class|interface|type|export|default|new|try|catch|finally|if|else|for|while|switch|case|break|continue)\b)|(\b[a-zA-Z]\w*)(?=\()|(\b\d+\b)/g

  const html = escaped.replace(tokenRegex, (match, comment, quote, _stringContent, keyword, func, number) => {
    if (comment) return `<span class="text-zinc-400 italic">${comment}</span>`
    if (quote) return `<span class="text-zinc-600 font-medium">${match}</span>`
    if (keyword) return `<span class="text-zinc-950 font-bold">${keyword}</span>`
    if (func) return `<span class="text-zinc-800 font-semibold">${func}</span>`
    if (number) return `<span class="text-zinc-500">${number}</span>`
    return match
  })

  return <code dangerouslySetInnerHTML={{ __html: html }} />
}

// Custom Markdown Renderer Component
const MarkdownRenderer = ({ content }: { content: string }) => {
  const [sections, setSections] = useState<JSX.Element[]>([])

  useEffect(() => {
    const parseMarkdown = (text: string) => {
      const lines = text.split('\n')
      const elements: JSX.Element[] = []
      let currentKey = 0
      let inCodeBlock = false
      let codeBlockContent: string[] = []
      let codeBlockLang = ''

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Handle Code Blocks
        if (line.trim().startsWith('```')) {
          if (inCodeBlock) {
            // End of code block
            const code = codeBlockContent.join('\n')
            elements.push(
              <div key={`code-${currentKey++}`} className="my-8 rounded-xl bg-zinc-50 border border-zinc-200 overflow-hidden shadow-sm group">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 bg-zinc-100/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                    </div>
                    <span className="ml-2 text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">{codeBlockLang || 'TEXT'}</span>
                  </div>
                  <CopyButton text={code} className="bg-white px-3 py-1.5 border border-zinc-200 shadow-sm hover:bg-zinc-50" />
                </div>
                <div className="p-5 overflow-x-auto bg-white">
                  <pre className="text-sm font-mono text-zinc-700 leading-relaxed">
                    {highlightCode(code)}
                  </pre>
                </div>
              </div>
            )
            codeBlockContent = []
            inCodeBlock = false
          } else {
            // Start of code block
            inCodeBlock = true
            codeBlockLang = line.trim().slice(3)
          }
          continue
        }

        if (inCodeBlock) {
          codeBlockContent.push(line)
          continue
        }

        // Handle Headers
        if (line.startsWith('# ')) {
          elements.push(
            <h1 key={`h1-${currentKey++}`} className="text-4xl font-bold tracking-tight text-zinc-950 mt-16 mb-8 pb-4 border-b border-zinc-200">
              {line.slice(2)}
            </h1>
          )
        } else if (line.startsWith('## ')) {
          elements.push(
            <h2 key={`h2-${currentKey++}`} className="text-2xl font-bold tracking-tight text-zinc-950 mt-12 mb-6 flex items-center gap-2">
              <span className="text-zinc-300 text-xl">#</span> {line.slice(3)}
            </h2>
          )
        } else if (line.startsWith('### ')) {
          elements.push(
            <h3 key={`h3-${currentKey++}`} className="text-xl font-semibold text-zinc-900 mt-8 mb-4">
              {line.slice(4)}
            </h3>
          )
        } else if (line.startsWith('#### ')) {
          elements.push(
            <h4 key={`h4-${currentKey++}`} className="text-lg font-medium text-zinc-900 mt-6 mb-3">
              {line.slice(5)}
            </h4>
          )
        }
        // Handle Lists
        else if (line.trim().startsWith('- ')) {
          const content = line.trim().slice(2)
          const parsedContent = content.split(/(\*\*\[.*?\]\(.*?\)\*\*)|(\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(`.*?`)/g).filter(Boolean).map((part, idx) => {
            // Handle bold links: **[text](url)**
            if (part.startsWith('**[') && part.endsWith(')**')) {
              const inner = part.slice(2, -2) // Remove ** from both ends
              const [text, url] = inner.slice(1, -1).split('](')
              return (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-zinc-950 font-semibold underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-950 transition-all">
                  {text}
                </a>
              )
            }
            if (part.startsWith('[') && part.includes('](')) {
              const [text, url] = part.slice(1, -1).split('](')
              return (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-zinc-950 font-medium underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-950 transition-all">
                  {text}
                </a>
              )
            }
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={idx} className="font-semibold text-zinc-950">{part.slice(2, -2)}</strong>
            if (part.startsWith('`') && part.endsWith('`')) return <code key={idx} className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-sm font-mono text-zinc-800">{part.slice(1, -1)}</code>
            return part
          })

          elements.push(
            <li key={`li-${currentKey++}`} className="ml-4 list-none relative pl-6 mb-2 text-zinc-600">
              <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
              {parsedContent}
            </li>
          )
        }
        // Handle Tables
        else if (line.includes('|') && line.trim().startsWith('|')) {
          if (line.includes('---')) continue;
          const cells = line.split('|').filter(c => c.trim()).map(c => c.trim())
          elements.push(
            <div key={`table-row-${currentKey++}`} className="grid grid-cols-3 gap-4 py-3 border-b border-zinc-100 last:border-0 text-sm">
              {cells.map((cell, idx) => (
                <div key={idx} className={`${i > 0 && lines[i - 1].includes('---') ? 'text-zinc-500 font-normal' : 'font-semibold text-zinc-900'}`}>
                  {cell}
                </div>
              ))}
            </div>
          )
        }
        // Handle Paragraphs
        else if (line.trim() !== '') {
          const parts = line.split(/(\*\*\[.*?\]\(.*?\)\*\*)|(\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(`.*?`)/g).filter(Boolean)
          const parsedLine = parts.map((part, idx) => {
            // Handle bold links: **[text](url)**
            if (part.startsWith('**[') && part.endsWith(')**')) {
              const inner = part.slice(2, -2) // Remove ** from both ends
              const [text, url] = inner.slice(1, -1).split('](')
              return (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-zinc-950 font-semibold underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-950 transition-all">
                  {text}
                </a>
              )
            }
            if (part.startsWith('[') && part.includes('](')) {
              const [text, url] = part.slice(1, -1).split('](')
              return (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-zinc-950 font-medium underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-950 transition-all">
                  {text}
                </a>
              )
            }
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={idx} className="font-semibold text-zinc-950">{part.slice(2, -2)}</strong>
            if (part.startsWith('`') && part.endsWith('`')) return <code key={idx} className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-sm font-mono text-zinc-800">{part.slice(1, -1)}</code>
            return part
          })

          elements.push(
            <p key={`p-${currentKey++}`} className="text-zinc-600 leading-7 mb-4">
              {parsedLine}
            </p>
          )
        }
      }
      setSections(elements)
    }

    parseMarkdown(content)
  }, [content])

  return <div className="space-y-1">{sections}</div>
}

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<EmotionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [npmVersion, setNpmVersion] = useState<string>('1.0.1')

  // Fetch npm version with caching
  useEffect(() => {
    const fetchNpmVersion = async () => {
      const CACHE_KEY = 'emotion-detector-npm-version'
      const CACHE_TIMESTAMP_KEY = 'emotion-detector-npm-version-timestamp'
      const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

      try {
        // Check cache
        const cachedVersion = localStorage.getItem(CACHE_KEY)
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)

        if (cachedVersion && cachedTimestamp) {
          const age = Date.now() - parseInt(cachedTimestamp, 10)
          if (age < CACHE_DURATION) {
            setNpmVersion(cachedVersion)
            return
          }
        }

        // Fetch from npm registry
        const response = await fetch('https://registry.npmjs.org/emotion-detector-js')
        if (response.ok) {
          const data = await response.json()
          const latestVersion = data['dist-tags']?.latest || '1.0.1'

          // Update cache
          localStorage.setItem(CACHE_KEY, latestVersion)
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
          setNpmVersion(latestVersion)
        }
      } catch (err) {
        // Silently fail and use cached or default version
        console.error('Failed to fetch npm version:', err)
      }
    }

    fetchNpmVersion()
  }, [])

  const analyzeEmotion = async () => {
    if (!text.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await analyzer.analyze(text)
      setResult(res)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      analyzeEmotion()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white text-sm font-bold shadow-sm">
                ED
              </div>
              <span className="text-base font-semibold text-zinc-900 hidden sm:block">emotion-detector-js</span>
            </div>

            {/* Center - Version Badge */}
            <div className="hidden md:flex items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-full border border-zinc-200">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                v{npmVersion}
              </div>
            </div>

            {/* Right - Links */}
            <div className="flex items-center gap-2">
              <a
                href="#documentation"
                className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                Docs
              </a>
              <a
                href="https://www.npmjs.com/package/emotion-detector-js"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors hidden sm:block"
              >
                NPM
              </a>
              <a
                href="https://github.com/Itskrish01/emotion-detector-js"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-950 mb-8 leading-[1.1]">
                Emotion detection <br className="hidden lg:block" />
                <span className="text-zinc-400">made simple.</span>
              </h1>
              <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                A lightweight, zero-dependency TypeScript client for accurate emotion analysis.
                Seamlessly works in Node.js and browsers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="group relative flex items-center gap-3 px-5 py-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-sm text-zinc-600 shadow-sm hover:border-zinc-300 transition-all cursor-pointer"
                  onClick={() => navigator.clipboard.writeText('npm install emotion-detector-js')}>
                  <span className="text-zinc-400 select-none">$</span>
                  <span className="select-all">npm install emotion-detector-js</span>
                  <CopyButton text="npm install emotion-detector-js" className="ml-2 p-1.5 bg-white border border-zinc-200 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Interactive Demo Card */}
            <div id="demo" className="lg:col-span-6">
      <div className="relative rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden ring-1 ring-zinc-950/5">
        <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
          </div>
          <div className="text-xs font-mono text-zinc-400">playground.ts</div>
        </div>

        <div className="p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type something emotional here..."
            className="w-full h-32 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all resize-none font-medium"
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Press Ctrl+Enter to analyze</span>
            <button
              onClick={analyzeEmotion}
              disabled={loading || !text.trim()}
              className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
            >
              {loading ? 'Analyzing...' : 'Analyze Text'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 pt-6 border-t border-zinc-100 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-5 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-3xl shadow-sm">
                  {emotionEmojis[result.primaryEmotion] || '🤔'}
                </div>
                <div>
                  <div className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-1">Primary Emotion</div>
                  <div className="text-2xl font-bold text-zinc-950 capitalize">{result.primaryEmotion}</div>
                  <div className="text-sm text-zinc-500 font-medium mt-0.5">{(result.confidence * 100).toFixed(1)}% Confidence</div>
                </div>
              </div>

              <div className="space-y-3">
                {result.allEmotions
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.emotion} className="group">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-zinc-700 capitalize">{item.emotion}</span>
                        <span className="text-zinc-500 font-mono text-xs">{(item.score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                          style={{ width: `${item.score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Section (Dynamic README) */}
      <section id="documentation" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-zinc max-w-none">
            <MarkdownRenderer content={readmeContent} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-50 border-t border-zinc-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-950 text-white text-[10px] font-bold">
              ED
            </div>
            <span className="text-sm font-medium text-zinc-700">emotion-detector-js</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-zinc-500">
            <a href="https://www.npmjs.com/package/emotion-detector-js" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">NPM</a>
            <a href="https://github.com/Itskrish01/emotion-detector-js" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">GitHub</a>
            <a href="https://huggingface.co/j-hartmann/emotion-english-distilroberta-base" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">Model</a>
          </div>
          <p className="text-sm text-zinc-400">
            © {new Date().getFullYear()} <a href="https://krishtasood.in" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-900 transition-colors">itskrish01</a>. MIT License.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
