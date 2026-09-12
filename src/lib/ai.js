/**
 * Fully free activity generator.
 * - Works offline with a large curated pool (no API key needed)
 * - Optional free live generation (rate-limited):
 *   1) Groq free: https://console.groq.com
 *      VITE_AI_API_KEY=gsk_...
 *      VITE_AI_BASE_URL=https://api.groq.com/openai/v1
 *      VITE_AI_MODEL=llama-3.3-70b-versatile
 *   2) OpenRouter free models: https://openrouter.ai
 *      VITE_AI_BASE_URL=https://openrouter.ai/api/v1
 *      VITE_AI_MODEL=meta-llama/llama-3.2-3b-instruct:free
 * No paid APIs required.
 */

const API_KEY = import.meta.env.VITE_AI_API_KEY || ''
const BASE_URL = import.meta.env.VITE_AI_BASE_URL || ''
const MODEL = import.meta.env.VITE_AI_MODEL || ''

/** Large free offline pool — feisty, bonding, competitive, chaotic */
const POOL = [
  // CHAOS
  { category: 'CHAOS', title: 'Emoji Courtroom', description: 'One person makes a ridiculous accusation using only emojis. The other defends with words only. Judge decides.', duration: '5 minutes', emoji: '😂' },
  { category: 'CHAOS', title: 'Phone Roulette', description: 'Swap phones for 60 seconds. Open one app and read one notification out loud. No deleting.', duration: '2 minutes', emoji: '📱' },
  { category: 'CHAOS', title: 'Accent Only', description: 'Both of you must speak in a terrible accent for the next 5 minutes. First one who breaks character loses.', duration: '5 minutes', emoji: '🎭' },
  { category: 'CHAOS', title: 'Wrong Answers Only', description: 'Ask each other 5 normal questions. You can only answer incorrectly. Be dramatic about it.', duration: '6 minutes', emoji: '🙃' },
  { category: 'CHAOS', title: 'Silent Movie', description: 'Act out your last argument using only gestures and facial expressions. No words. Then guess what the other meant.', duration: '4 minutes', emoji: '🎬' },
  { category: 'CHAOS', title: 'Pet Names Extreme', description: 'Call each other the most absurd pet names you can invent for 3 minutes. Escalate until someone cracks.', duration: '3 minutes', emoji: '🐸' },
  { category: 'CHAOS', title: 'Backwards Day', description: 'Do the next small task completely backwards (walk, talk order, phone unlock). Partner judges the performance.', duration: '3 minutes', emoji: '🔄' },
  { category: 'CHAOS', title: 'Conspiracy Board', description: 'Pick a tiny random event from today. Build a wild conspiracy about why it happened. Present evidence.', duration: '7 minutes', emoji: '🕵️' },

  // GAME
  { category: 'GAME', title: 'Lie Detector', description: 'Ask three questions. Two truths, one lie. Partner has to catch the lie — explain your reasoning.', duration: '8 minutes', emoji: '🕵️' },
  { category: 'GAME', title: 'Finish My Sentence', description: 'Start a sentence about your relationship. Partner finishes it in the most dramatic way possible.', duration: '5 minutes', emoji: '🎭' },
  { category: 'GAME', title: 'This or That: Us', description: 'Rapid-fire 10 this-or-that questions about your real preferences. Keep score of who knows who better.', duration: '6 minutes', emoji: '⚡' },
  { category: 'GAME', title: 'Guess the Memory', description: 'Describe a shared memory using only 3 words. Partner has to figure out which moment it was.', duration: '5 minutes', emoji: '🧩' },
  { category: 'GAME', title: 'Would You Rather: Extreme', description: 'Invent two absurd options involving both of you. Partner must choose and defend it like a lawyer.', duration: '5 minutes', emoji: '🎲' },
  { category: 'GAME', title: 'Song Lyric Roast', description: 'Take turns singing one line of a song that somehow applies to the other person. Soft roast only.', duration: '6 minutes', emoji: '🎤' },
  { category: 'GAME', title: 'Who Said It', description: 'Write 4 short quotes from your relationship history. Partner guesses who said each one.', duration: '7 minutes', emoji: '💬' },
  { category: 'GAME', title: '20 Questions: Soft', description: 'Think of a person, place, or memory from your relationship. Partner has 15 yes/no questions to figure it out.', duration: '8 minutes', emoji: '❓' },

  // COMPETITIVE
  { category: 'COMPETITIVE', title: 'Stare Off', description: 'First one to laugh or look away loses. Winner demands one silly favor right now.', duration: '2 minutes', emoji: '👀' },
  { category: 'COMPETITIVE', title: 'Thumb War Championship', description: 'Best of 5 thumb wars. Loser has to give a 30-second dramatic apology speech.', duration: '4 minutes', emoji: '👊' },
  { category: 'COMPETITIVE', title: 'Compliment Battle', description: 'Take turns giving genuine compliments. First one who repeats an idea or goes blank loses.', duration: '5 minutes', emoji: '🏆' },
  { category: 'COMPETITIVE', title: 'Speed Clean', description: 'Set a 3-minute timer. Race to tidy one shared space. Loser does the dishes later.', duration: '3 minutes', emoji: '⏱️' },
  { category: 'COMPETITIVE', title: 'Draw Me Blind', description: 'Draw each other without looking at the paper. Rate the portraits. Winner gets bragging rights forever.', duration: '6 minutes', emoji: '🎨' },
  { category: 'COMPETITIVE', title: 'Memory Sprint', description: 'Name as many shared memories as you can in 60 seconds. Highest unique count wins.', duration: '2 minutes', emoji: '🧠' },

  // SWEET
  { category: 'SWEET', title: 'Tiny Confession', description: 'Say one small thing you noticed about them this week that made you smile. No big speeches allowed.', duration: '3 minutes', emoji: '✨' },
  { category: 'SWEET', title: 'Favorite Version', description: 'Describe your favorite version of them — a specific moment or mood. Be specific.', duration: '4 minutes', emoji: '💫' },
  { category: 'SWEET', title: 'Gratitude Swap', description: 'Each write 3 things you appreciate about the other on your phone, then exchange and read them out loud.', duration: '5 minutes', emoji: '📝' },
  { category: 'SWEET', title: 'Soundtrack of Us', description: 'Each pick one song that somehow represents a chapter of your relationship. Play 30 seconds and explain.', duration: '6 minutes', emoji: '🎵' },
  { category: 'SWEET', title: 'Future Postcard', description: 'Write a short postcard from one year in the future to each other. Read them aloud.', duration: '7 minutes', emoji: '✉️' },
  { category: 'SWEET', title: 'Soft Replay', description: 'Retell the story of how you met — but from the other person\'s point of view. See how close you get.', duration: '6 minutes', emoji: '📖' },

  // DEEP
  { category: 'DEEP', title: 'Future Snapshot', description: 'Describe one ordinary Tuesday five years from now. Include what the other person is doing in that scene.', duration: '6 minutes', emoji: '🔮' },
  { category: 'DEEP', title: 'Unsaid Thing', description: 'Share one thing you almost said to them recently but didn\'t. Keep it honest and short.', duration: '4 minutes', emoji: '💬' },
  { category: 'DEEP', title: 'Safe Place', description: 'Describe a moment with them when you felt completely safe. What made it that way?', duration: '5 minutes', emoji: '🏠' },
  { category: 'DEEP', title: 'Hard Truth Softly', description: 'Share one small growth area for the relationship — framed as a wish, not a complaint.', duration: '6 minutes', emoji: '🌱' },
  { category: 'DEEP', title: 'Letter in 10 Lines', description: 'Write a 10-line letter to your partner about something you never quite put into words. Read or swap.', duration: '8 minutes', emoji: '💌' },
  { category: 'DEEP', title: 'What I Need', description: 'Finish this sentence for each other: "Right now I need more of…" No fixing, just listen.', duration: '5 minutes', emoji: '🤍' },

  // SPICY / FLIRTY
  { category: 'SPICY', title: 'Rate That Memory', description: 'Name a shared memory. Partner rates how hot / chaotic / soft it was on a 1–10 and explains why.', duration: '5 minutes', emoji: '🔥' },
  { category: 'SPICY', title: 'First Notice', description: 'What was the first thing you noticed about them that made you curious? Be honest.', duration: '3 minutes', emoji: '👀' },
  { category: 'SPICY', title: 'Flirt Rebuild', description: 'Flirt with each other like you just matched on an app and only have 5 minutes to impress.', duration: '5 minutes', emoji: '😏' },
  { category: 'SPICY', title: 'Secret Preference', description: 'Share one small preference you have that you think they still don\'t know about.', duration: '4 minutes', emoji: '🤫' },
  { category: 'SPICY', title: 'Complimentary Roast', description: 'Give a compliment that is also a tiny roast. Soft only. Example energy, not mean.', duration: '4 minutes', emoji: '🌶️' },

  // RANDOM / BONDING Qs
  { category: 'RANDOM', title: 'Highs & Lows', description: 'Share the highest and lowest moment of your day in under a minute each. No advice unless asked.', duration: '4 minutes', emoji: '📈' },
  { category: 'RANDOM', title: 'Desert Island Three', description: 'If you two were stuck somewhere for a week, what 3 things would you bring? Debate the list.', duration: '6 minutes', emoji: '🏝️' },
  { category: 'RANDOM', title: 'One More Question', description: 'Ask the question you\'ve been mildly curious about but never asked. Answer honestly.', duration: '5 minutes', emoji: '❔' },
  { category: 'RANDOM', title: 'Role Swap', description: 'For 3 minutes, act as each other in a typical evening scenario. Keep it playful, not mean.', duration: '5 minutes', emoji: '🪞' },
  { category: 'RANDOM', title: 'Bucket Micro', description: 'Add one tiny thing to a shared "someday" list — something doable this month.', duration: '3 minutes', emoji: '🪣' },
  { category: 'RANDOM', title: 'Photo Story', description: 'Pick a random photo on your phone from the last month. Tell the story behind it in 60 seconds.', duration: '4 minutes', emoji: '📷' },,

  // ROMANTIC
  { category: 'ROMANTIC', title: 'Eyes Closed', description: 'Sit facing each other, eyes closed for 60 seconds. Then open and say the first true thing that comes up.', duration: '3 minutes', emoji: '👁' },
  { category: 'ROMANTIC', title: 'Hand Story', description: 'Hold hands. One person tells a short story about the first time they knew this might be real.', duration: '5 minutes', emoji: '🤝' },
  { category: 'ROMANTIC', title: 'Slow Question', description: 'Ask: "When do you feel most loved by me?" Listen fully. No fixing. Just receive it.', duration: '6 minutes', emoji: '🌙' },
  { category: 'ROMANTIC', title: 'Forehead Pause', description: 'Foreheads together, phones away, for two full minutes. No talking unless one of you needs to.', duration: '2 minutes', emoji: '🤍' },
  { category: 'ROMANTIC', title: 'Private Toast', description: 'Make a tiny toast to something only the two of you understand. Clink whatever you are holding.', duration: '3 minutes', emoji: '🥂' },
  { category: 'ROMANTIC', title: 'Letter in Five Lines', description: 'Each write a 5-line love note on your phone. Swap and read silently, then one line out loud.', duration: '7 minutes', emoji: '💌' },
  // CHEESY
  { category: 'CHEESY', title: 'Movie Trailer Us', description: 'Narrate your relationship like a dramatic movie trailer. Use a serious voice. Credits optional.', duration: '4 minutes', emoji: '🎬' },
  { category: 'CHEESY', title: 'Bad Pickup Lines Only', description: 'Take turns hitting on each other using only terrible pickup lines. Rate them. Crown a winner.', duration: '5 minutes', emoji: '😏' },
  { category: 'CHEESY', title: 'Soap Opera Confession', description: 'Confess something small as if you are on a daytime soap. Overact. Gasps encouraged.', duration: '4 minutes', emoji: '🎭' },
  { category: 'CHEESY', title: 'Hallmark Rewrite', description: 'Retell how you met as a Hallmark movie plot. Include snow, a misunderstanding, and a happy ending.', duration: '6 minutes', emoji: '❄️' },
  { category: 'CHEESY', title: 'Power Ballad Pose', description: 'Pick a cheesy love song, play 30 seconds, and hold a ridiculous romantic pose until the drop.', duration: '3 minutes', emoji: '🎤' },
  { category: 'CHEESY', title: 'Yes Dear Protocol', description: 'For 3 minutes reply to everything with an over-the-top loving cliché. "Of course, my universe."', duration: '3 minutes', emoji: '💘' },

]

const MOOD_MAP = {
  chaos: 'CHAOS',
  sweet: 'SWEET',
  deep: 'DEEP',
  competitive: 'COMPETITIVE',
  spicy: 'SPICY',
  game: 'GAME',
  romantic: 'ROMANTIC',
  cheesy: 'CHEESY',
}

function pickFromPool(mood, avoidTitles = []) {
  let list = POOL
  if (mood && MOOD_MAP[mood]) {
    const filtered = POOL.filter(p => p.category === MOOD_MAP[mood])
    if (filtered.length) list = filtered
  }
  const available = list.filter(p => !avoidTitles.includes(p.title))
  const source = available.length ? available : list
  const pick = source[Math.floor(Math.random() * source.length)]
  return { ...pick, source: 'local' }
}

/**
 * Optional free live generation (Groq / Gemini free tiers).
 * Only used if VITE_AI_API_KEY + VITE_AI_BASE_URL are set.
 */
async function tryLiveAI({ mood, avoidTitles }) {
  if (!API_KEY || !BASE_URL) return null

  const avoid = avoidTitles.length
    ? ` Avoid titles: ${avoidTitles.slice(-10).join(', ')}.`
    : ''
  const moodHint = mood ? ` Vibe: ${mood}.` : ''

  const system = `You invent short playful activities for a couple. Return ONLY JSON: {"category":"CHAOS|SWEET|DEEP|GAME|COMPETITIVE|SPICY|RANDOM","title":"2-5 words","description":"1-2 sentences doable now","duration":"e.g. 5 minutes","emoji":"one emoji"}. Feisty and fun, never cheesy.`

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL || 'llama-3.3-70b-versatile',
        temperature: 1.1,
        max_tokens: 250,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `One new couple activity.${moodHint}${avoid}` },
        ],
      }),
    })
    if (!res.ok) {
      const bodyText = await res.text().catch(() => '')
      console.warn(`[ai] Groq request failed (${res.status}): ${bodyText.slice(0, 300)}`)
      return null
    }
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content?.trim() || ''
    const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!parsed.title || !parsed.description) {
      console.warn('[ai] Groq response missing title/description, falling back:', parsed)
      return null
    }
    return {
      category: String(parsed.category || 'RANDOM').toUpperCase(),
      title: parsed.title,
      description: parsed.description,
      duration: parsed.duration || '5 minutes',
      emoji: parsed.emoji || '✨',
      source: 'ai',
    }
  } catch (err) {
    console.warn('[ai] Groq call threw, falling back to local pool:', err)
    return null
  }
}

export async function generateActivity({ mood = null, avoidTitles = [] } = {}) {
  // Always feel like "thinking" for a moment
  const delay = 900 + Math.random() * 800
  const livePromise = tryLiveAI({ mood, avoidTitles })
  await new Promise(r => setTimeout(r, delay))

  const live = await livePromise
  if (live) return live

  return pickFromPool(mood, avoidTitles)
}
