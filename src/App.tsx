import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import { EmotionAnalyzer } from 'emotion-detector-js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
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

// Memoized Code Block Component with Copy Button
const CodeBlock = memo(({ children, className }: { children: string, className?: string }) => {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : 'text'

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [children])

  return (
    <div className="my-4 sm:my-6 rounded-lg sm:rounded-xl bg-zinc-50 border border-zinc-200 overflow-hidden shadow-sm group">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b border-zinc-200 bg-zinc-100/50">
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
          </div>
          <span className="text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white border border-zinc-200 rounded-md shadow-sm hover:bg-zinc-50 transition-all text-xs font-medium"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-600 hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-zinc-500 hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          style={oneLight}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'white',
            fontSize: '0.8125rem',
            lineHeight: '1.6',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
            }
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  )
})

// Memoized Markdown Renderer Component - prevents re-renders when content is static
const MarkdownRenderer = memo(({ content }: { content: string }) => {
  // Memoize the components object to prevent recreation on each render
  const components = useMemo(() => ({
    // Headers
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-950 mt-10 sm:mt-16 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-zinc-200">
        {children}
      </h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-8 sm:mt-12 mb-4 sm:mb-6 flex items-center gap-2">
        <span className="text-zinc-300 text-lg sm:text-xl hidden sm:inline">#</span> {children}
      </h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
        {children}
      </h3>
    ),
    h4: ({ children }: { children: React.ReactNode }) => (
      <h4 className="text-base sm:text-lg font-medium text-zinc-900 mt-4 sm:mt-6 mb-2 sm:mb-3">
        {children}
      </h4>
    ),
    // Paragraph
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="text-zinc-600 text-sm sm:text-base leading-6 sm:leading-7 mb-3 sm:mb-4">
        {children}
      </p>
    ),
    // Links
    a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-zinc-950 font-medium underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-950 transition-all"
      >
        {children}
      </a>
    ),
    // Lists
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="space-y-1.5 sm:space-y-2 my-3 sm:my-4 ml-1">
        {children}
      </ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="space-y-1.5 sm:space-y-2 my-3 sm:my-4 ml-1 list-decimal list-inside">
        {children}
      </ol>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="text-zinc-600 text-sm sm:text-base relative pl-4 sm:pl-6">
        <span className="absolute left-0 top-2 sm:top-2.5 w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
        {children}
      </li>
    ),
    // Inline code
    code: ({ className, children }: { className?: string; children: React.ReactNode }) => {
      const isCodeBlock = className?.includes('language-')
      const codeString = String(children).replace(/\n$/, '')

      if (isCodeBlock) {
        return <CodeBlock className={className}>{codeString}</CodeBlock>
      }

      return (
        <code className="px-1 sm:px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-xs sm:text-sm font-mono text-zinc-800">
          {children}
        </code>
      )
    },
    // Pre tag for code blocks
    pre: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    // Strong/Bold
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-semibold text-zinc-950">{children}</strong>
    ),
    // Emphasis/Italic
    em: ({ children }: { children: React.ReactNode }) => (
      <em className="italic text-zinc-700">{children}</em>
    ),
    // Blockquote
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-zinc-300 pl-3 sm:pl-4 py-1 my-4 sm:my-6 text-zinc-600 italic bg-zinc-50 rounded-r-lg">
        {children}
      </blockquote>
    ),
    // Horizontal rule
    hr: () => <hr className="my-6 sm:my-8 border-zinc-200" />,
    // Table
    table: ({ children }: { children: React.ReactNode }) => (
      <div className="overflow-x-auto my-4 sm:my-6 -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="min-w-full divide-y divide-zinc-200 border border-zinc-200 rounded-lg overflow-hidden text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children: React.ReactNode }) => (
      <thead className="bg-zinc-50">{children}</thead>
    ),
    tbody: ({ children }: { children: React.ReactNode }) => (
      <tbody className="divide-y divide-zinc-100 bg-white">{children}</tbody>
    ),
    tr: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
    th: ({ children }: { children: React.ReactNode }) => (
      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider whitespace-nowrap">
        {children}
      </th>
    ),
    td: ({ children }: { children: React.ReactNode }) => (
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-zinc-600 text-xs sm:text-sm">
        {children}
      </td>
    ),
    // Images
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <img
        src={src}
        alt={alt || ''}
        className="rounded-lg shadow-sm border border-zinc-200 my-4 sm:my-6 max-w-full h-auto"
      />
    ),
  }), [])

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
})

// Memoized Install Command Copy Button Component
const InstallCopyButton = memo(() => {
  const [copied, setCopied] = useState(false)
  const command = 'npm install emotion-detector-js'

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <button
      onClick={handleCopy}
      className="group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-xs sm:text-sm text-zinc-600 shadow-sm hover:border-zinc-300 transition-all cursor-pointer w-full sm:w-auto justify-center sm:justify-start"
    >
      <span className="text-zinc-400 select-none">$</span>
      <span className="select-all truncate">{command}</span>
      <span className={`ml-1 sm:ml-2 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-zinc-200 text-zinc-500 group-hover:text-zinc-700'}`}>
        {copied ? (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Copy</span>
          </>
        )}
      </span>
    </button>
  )
})

// Isolated Emotion Demo Component - state changes here don't re-render the whole App
const EmotionDemo = memo(() => {
  const [text, setText] = useState('')
  const [result, setResult] = useState<EmotionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeEmotion = useCallback(async () => {
    if (!text.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await analyzer.analyze(text)
      setResult(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [text])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      analyzeEmotion()
    }
  }, [analyzeEmotion])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }, [])

  // Memoize sorted emotions to prevent recalculation
  const sortedEmotions = useMemo(() => {
    if (!result) return []
    return result.allEmotions
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [result])

  return (
    <div className="relative rounded-xl sm:rounded-2xl bg-white shadow-xl sm:shadow-2xl border border-zinc-200 overflow-hidden ring-1 ring-zinc-950/5">
      <div className="bg-zinc-50 border-b border-zinc-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-300"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-300"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-300"></div>
        </div>
        <div className="text-xs font-mono text-zinc-400">playground.ts</div>
      </div>

      <div className="p-4 sm:p-6">
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type something emotional here..."
          className="w-full h-24 sm:h-32 p-3 sm:p-4 bg-zinc-50 border border-zinc-200 rounded-lg sm:rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all resize-none font-medium text-sm sm:text-base"
        />

        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
          <span className="text-xs text-zinc-400 font-medium text-center sm:text-left hidden sm:block">Press Ctrl+Enter to analyze</span>
          <button
            onClick={analyzeEmotion}
            disabled={loading || !text.trim()}
            className="px-4 sm:px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
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
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-zinc-100 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-6">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-2xl sm:text-3xl shadow-sm shrink-0">
                {emotionEmojis[result.primaryEmotion] || '🤔'}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">Primary Emotion</div>
                <div className="text-lg sm:text-2xl font-bold text-zinc-950 capitalize truncate">{result.primaryEmotion}</div>
                <div className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">{(result.confidence * 100).toFixed(1)}% Confidence</div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {sortedEmotions.map((item) => (
                <div key={item.emotion} className="group">
                  <div className="flex justify-between text-xs sm:text-sm mb-1 sm:mb-1.5">
                    <span className="font-medium text-zinc-700 capitalize">{item.emotion}</span>
                    <span className="text-zinc-500 font-mono text-[10px] sm:text-xs">{(item.score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-zinc-100 rounded-full overflow-hidden">
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
  )
})

function App() {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 text-center lg:text-left">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-zinc-950 mb-4 sm:mb-6 lg:mb-8 leading-[1.1]">
                Emotion detection <br className="hidden sm:block" />
                <span className="text-zinc-400">made simple.</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-zinc-600 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                A lightweight, zero-dependency TypeScript client for accurate emotion analysis.
                Seamlessly works in Node.js and browsers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <InstallCopyButton />
              </div>
            </div>

            {/* Interactive Demo Card - Isolated component to prevent re-renders */}
            <div id="demo" className="lg:col-span-6">
              <EmotionDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Section (Dynamic README) */}
      <section id="documentation" className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-zinc max-w-none">
            <MarkdownRenderer content={readmeContent} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-50 border-t border-zinc-200 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-950 text-white text-[10px] font-bold">
              ED
            </div>
            <span className="text-xs sm:text-sm font-medium text-zinc-700">emotion-detector-js</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-5 text-xs sm:text-sm text-zinc-500">
            <a href="https://www.npmjs.com/package/emotion-detector-js" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">NPM</a>
            <a href="https://github.com/Itskrish01/emotion-detector-js" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">GitHub</a>
            <a href="https://huggingface.co/j-hartmann/emotion-english-distilroberta-base" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">Model</a>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 text-center">
            © {new Date().getFullYear()} <a href="https://krishtasood.in" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-900 transition-colors">itskrish01</a>. MIT License.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
