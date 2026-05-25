import { useState, useEffect, useRef } from 'react'
import story from './data/story.json'

const nodeMap = Object.fromEntries(story.map(n => [n.id, n]))

function computeLongestPath(map, id, visited) {
  const node = map[id]
  if (!node || node.ending || !node.choices || node.choices.length === 0) return 0
  let max = 0
  for (const choice of node.choices) {
    if (!visited.has(choice.nextId)) {
      const depth = computeLongestPath(map, choice.nextId, new Set([...visited, choice.nextId]))
      if (depth > max) max = depth
    }
  }
  return max + 1
}
const LONGEST_PATH = computeLongestPath(nodeMap, 'start', new Set(['start']))

// ── Shared header shown on all screens ────────────────────────────────────
function Header({ topRef }) {
  return (
    <header ref={topRef} className="w-full max-w-2xl mb-6 text-center">
      <h1 className="font-serif text-2xl sm:text-3xl tracking-widest text-[#e8a045] uppercase">
        Lord of the Flies
      </h1>
      <p className="text-xs sm:text-sm tracking-[0.2em] text-[#6b6375] mt-1 uppercase">
        Choose Your Path
      </p>
    </header>
  )
}

// ── Intro screen ───────────────────────────────────────────────────────────
function IntroScreen({ onBegin }) {
  return (
    <div className="fade-in w-full max-w-2xl">
      <div className="rounded-lg border border-white/10 bg-[#0f1623] px-6 py-8 sm:px-10 sm:py-10">
        {/* Flavour text */}
        <p className="font-serif text-base sm:text-lg leading-relaxed text-[#c8bfa8] mb-8">
          The plane came down in the night. There are no adults. There is only the island —
          its lagoon the colour of old glass, its jungle a green dark that watches — and the
          boys scattered along the beach who are beginning to understand that no one is coming
          to save them but themselves. The question is what kind of boys they will choose to be.
        </p>

        {/* How to play */}
        <div className="border-l-2 border-amber-600/40 pl-4 mb-8">
          <p className="text-xs tracking-[0.15em] uppercase text-[#6b6375] mb-3">
            How to play
          </p>
          <ul className="font-serif text-sm sm:text-base text-[#9a8f7a] space-y-2 leading-relaxed">
            <li>Read each passage and choose your path below it.</li>
            <li>The progress bar shows how far through the story you are.</li>
            <li>The chapter number counts decisions made.</li>
            <li>Find rescue — or face what the island has waiting in the dark.</li>
          </ul>
        </div>

        <button
          onClick={onBegin}
          className="w-full py-3 rounded border border-[#e8a045]/40 bg-[#e8a045]/10 text-[#e8a045] text-sm sm:text-base tracking-widest uppercase font-semibold hover:bg-[#e8a045]/20 transition-colors duration-200 cursor-pointer"
        >
          Begin
        </button>
      </div>
    </div>
  )
}

// ── Conch divider ──────────────────────────────────────────────────────────
function ConchDivider() {
  return (
    <div className="flex items-center gap-3 my-8 text-[#6b5a38]/60">
      <div className="flex-1 h-px bg-[#6b5a38]/20" />
      <span className="text-sm">◈</span>
      <div className="flex-1 h-px bg-[#6b5a38]/20" />
    </div>
  )
}

// ── Path recap ─────────────────────────────────────────────────────────────
function PathRecap({ choiceHistory }) {
  if (choiceHistory.length === 0) return null
  return (
    <div className="mb-8">
      <p className="text-xs tracking-[0.15em] uppercase text-[#6b6375] mb-3">
        Your path through the island
      </p>
      <div className="flex flex-wrap gap-x-2 gap-y-2 items-center">
        {choiceHistory.map((label, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="font-serif text-xs sm:text-sm text-[#9a8f7a]">
              {label}
            </span>
            {i < choiceHistory.length - 1 && (
              <span className="text-[#e8a045]/60 text-xs">→</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Footer credit ──────────────────────────────────────────────────────────
function Footer() {
  return (
    <div className="mt-4 text-center space-y-1">
      <p className="text-xs text-amber-100/20">
        Created by Shivansh Upadhyay, Aryav Agarwal, Ayush Damodar, Haider Abbas, Vihaan Tandon &amp; Arnav Mahajan
      </p>
      <p className="text-xs text-amber-100/20">
        Code available at{' '}
        <a
          href="https://github.com/shivansh-max/loft-path"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-amber-100/40 transition-colors duration-200"
        >
          github.com/shivansh-max/lotf-path
        </a>
      </p>
    </div>
  )
}

// ── Main app ───────────────────────────────────────────────────────────────
function App() {
  const [screen, setScreen]               = useState('intro') // 'intro' | 'game'
  const [currentNodeId, setCurrentNodeId] = useState('start')
  const [choiceHistory, setChoiceHistory] = useState([])
  const [animKey, setAnimKey]             = useState(0)
  const topRef = useRef(null)

  const currentNode = nodeMap[currentNodeId]
  const isEnding    = Boolean(currentNode?.ending)
  const isWin       = currentNode?.ending === 'win'
  const chapter     = choiceHistory.length + 1
  const progress    = Math.min((choiceHistory.length / LONGEST_PATH) * 100, 100)

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [currentNodeId, screen])

  function handleBegin() {
    setScreen('game')
    setAnimKey(k => k + 1)
  }

  function handleChoice(nextId, label) {
    setChoiceHistory(prev => [...prev, label])
    setCurrentNodeId(nextId)
    setAnimKey(k => k + 1)
  }

  function handleReset() {
    setScreen('intro')
    setCurrentNodeId('start')
    setChoiceHistory([])
    setAnimKey(k => k + 1)
  }


  const resultLabel   = isWin ? 'RESCUED' : 'YOU DIED'
  const resultColor   = isWin ? 'text-emerald-400' : 'text-red-500'
  const resultAnim    = isWin ? 'rescued-glow' : 'ominous-fade'

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-[#c8bfa8] flex flex-col items-center justify-center px-4 py-8 sm:px-8">

      <Header topRef={topRef} />

      {screen === 'intro' ? (
        <>
          <IntroScreen onBegin={handleBegin} />
          <Footer />
        </>
      ) : (
        <>
          {/* Progress bar — hidden on ending screens */}
          {!isEnding && (
            <div className="w-full max-w-2xl mb-3">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e8a045] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <main key={animKey} className="fade-in w-full max-w-2xl">
            {isEnding ? (
              /* ── Ending screen ── */
              <div className="rounded-lg border border-white/10 bg-[#0f1623] px-6 py-8 sm:px-10 sm:py-10">
                <p className={`font-serif text-4xl sm:text-5xl font-bold tracking-widest text-center mb-6 ${resultColor} ${resultAnim}`}>
                  {resultLabel}
                </p>

                <p className={`font-serif text-base sm:text-lg leading-relaxed text-[#c8bfa8] mb-2 ${!isWin ? 'ominous-fade' : ''}`}>
                  {currentNode.text}
                </p>

                <ConchDivider />

                <PathRecap choiceHistory={choiceHistory} />

                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded border border-[#e8a045]/40 bg-[#e8a045]/10 text-[#e8a045] text-sm sm:text-base tracking-widest uppercase font-semibold hover:bg-[#e8a045]/20 transition-colors duration-200 cursor-pointer"
                >
                  Play Again
                </button>
              </div>

            ) : (
              /* ── Story node ── */
              <div className="rounded-lg border border-white/10 bg-[#0f1623] px-6 py-8 sm:px-10 sm:py-10">
                {/* Chapter counter */}
                <p className="text-xs tracking-[0.2em] uppercase text-[#4a4558] mb-5">
                  Chapter {chapter}
                </p>

                {/* Node text */}
                <p className="font-serif text-base sm:text-lg leading-relaxed text-[#c8bfa8]">
                  {currentNode.text}
                </p>

                <ConchDivider />

                {/* Choice buttons */}
                <div className="flex flex-col gap-3">
                  {currentNode.choices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => handleChoice(choice.nextId, choice.label)}
                      className="w-full text-left py-3 px-5 rounded border-l-2 border-amber-600/50 bg-[#0d0f1a] text-[#c8bfa8] text-base leading-snug hover:bg-[#151c2e] hover:text-[#e8d5b0] hover:border-amber-500/70 transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-[#e8a045] mr-2 font-bold">{i + 1}.</span>
                      {choice.label}
                    </button>
                  ))}
                </div>

                {/* Breadcrumb trail */}
                {choiceHistory.length > 0 && (
                  <p className="mt-8 text-xs text-[#4a4558] tracking-wide font-serif">
                    {choiceHistory.join(' → ')}
                  </p>
                )}
              </div>
            )}
          </main>
          <Footer />
        </>
      )}
    </div>
  )
}

export default App
