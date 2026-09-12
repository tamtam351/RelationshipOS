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
 *
 * Every activity here is written for a long-distance couple who
 * haven't met in person yet but are planning to — everything works
 * over video call, voice note, or text. Nothing assumes being in the
 * same room (no hand-holding, no passing a phone across a table).
 */

const API_KEY = import.meta.env.VITE_AI_API_KEY || ''
const BASE_URL = import.meta.env.VITE_AI_BASE_URL || ''
const MODEL = import.meta.env.VITE_AI_MODEL || ''

/** Large free offline pool — feisty, bonding, competitive, chaotic, and distance-aware */
const POOL = [
  // CHAOS
  { category: 'CHAOS', title: 'Emoji Courtroom', description: 'One person makes a ridiculous accusation using only emojis. The other defends with words only. Judge decides.', duration: '5 minutes', emoji: '😂' },
  { category: 'CHAOS', title: 'Screen Roulette', description: 'Share your screen for 60 seconds and open a random app. Read the first thing you see out loud. No closing it early.', duration: '2 minutes', emoji: '📱' },
  { category: 'CHAOS', title: 'Accent Only', description: 'Both of you must speak in a terrible accent for the rest of the call. First one who breaks character loses.', duration: '5 minutes', emoji: '🎭' },
  { category: 'CHAOS', title: 'Wrong Answers Only', description: 'Ask each other 5 normal questions. You can only answer incorrectly. Be dramatic about it.', duration: '6 minutes', emoji: '🙃' },
  { category: 'CHAOS', title: 'Silent Movie', description: 'On camera, act out your last small disagreement using only gestures and facial expressions. No words. Guess what the other meant.', duration: '4 minutes', emoji: '🎬' },
  { category: 'CHAOS', title: 'Pet Names Extreme', description: 'Call each other the most absurd pet names you can invent for 3 minutes straight. Escalate until someone cracks.', duration: '3 minutes', emoji: '🐸' },
  { category: 'CHAOS', title: 'Backwards Day', description: 'Do the next small thing completely backwards — talk in reverse word order, or narrate your room right to left. Partner judges the performance.', duration: '3 minutes', emoji: '🔄' },
  { category: 'CHAOS', title: 'Conspiracy Board', description: 'Pick a tiny random event from today. Build a wild conspiracy theory about why it happened. Present your evidence.', duration: '7 minutes', emoji: '🕵️' },
  { category: 'CHAOS', title: 'Voice Note Mystery', description: 'Send a deliberately cryptic voice note about your day using no real details. Partner has to guess what actually happened.', duration: '4 minutes', emoji: '🎙️' },
  { category: 'CHAOS', title: 'Reporter Mode', description: 'Whatever filter or effect looks weirdest right now, put it on and read today\'s top headline like a breaking news anchor.', duration: '3 minutes', emoji: '📺' },

  // GAME
  { category: 'GAME', title: 'Lie Detector', description: 'Ask three questions. Two truths, one lie. Partner has to catch the lie — explain your reasoning after.', duration: '8 minutes', emoji: '🕵️' },
  { category: 'GAME', title: 'Finish My Sentence', description: 'Start a sentence about your relationship. Partner finishes it in the most dramatic way possible.', duration: '5 minutes', emoji: '🎭' },
  { category: 'GAME', title: 'This or That: Us', description: 'Rapid-fire 10 this-or-that questions about your real preferences. Keep score of who knows who better.', duration: '6 minutes', emoji: '⚡' },
  { category: 'GAME', title: 'Guess the Memory', description: 'Describe a shared memory or a moment from your calls using only 3 words. Partner figures out which one it was.', duration: '5 minutes', emoji: '🧩' },
  { category: 'GAME', title: 'Would You Rather: Extreme', description: 'Invent two absurd options involving both of you. Partner must choose and defend it like a lawyer.', duration: '5 minutes', emoji: '🎲' },
  { category: 'GAME', title: 'Song Lyric Roast', description: 'Take turns singing one line of a song that somehow applies to the other person right now. Soft roast only.', duration: '6 minutes', emoji: '🎤' },
  { category: 'GAME', title: 'Who Said It', description: 'Write 4 short quotes from your calls or texts together. Partner guesses who said each one.', duration: '7 minutes', emoji: '💬' },
  { category: 'GAME', title: '20 Questions: Soft', description: 'Think of a person, place, or memory from your relationship. Partner has 15 yes/no questions to figure it out.', duration: '8 minutes', emoji: '❓' },
  { category: 'GAME', title: 'Camera Roll Roulette', description: 'Open your camera roll, scroll to a random photo from a year ago, and share your screen. Tell the story behind it.', duration: '4 minutes', emoji: '🎞️' },
  { category: 'GAME', title: 'Two Truths, One Wild', description: 'Each say two true things and one wildly exaggerated thing about your week. Partner has to spot the exaggeration.', duration: '5 minutes', emoji: '🎯' },

  // COMPETITIVE
  { category: 'COMPETITIVE', title: 'Stare Off', description: 'First one to laugh or look away from the camera loses. Winner demands one silly favor right now.', duration: '2 minutes', emoji: '👀' },
  { category: 'COMPETITIVE', title: 'Rock Paper Scissors Streak', description: 'Best of 7, hands up to the camera. Loser has to give a 30-second dramatic apology speech.', duration: '4 minutes', emoji: '✊' },
  { category: 'COMPETITIVE', title: 'Compliment Battle', description: 'Take turns giving genuine compliments. First one who repeats an idea or goes blank loses.', duration: '5 minutes', emoji: '🏆' },
  { category: 'COMPETITIVE', title: 'Speed Tidy Duel', description: 'Set a 3-minute timer. Each races to tidy your own space in view of the camera. Show the results side by side, other picks the winner.', duration: '3 minutes', emoji: '⏱️' },
  { category: 'COMPETITIVE', title: 'Draw Them Blind', description: 'Draw your partner from memory without looking at the page. Reveal on camera at the same time. Rate each other\'s portraits.', duration: '6 minutes', emoji: '🎨' },
  { category: 'COMPETITIVE', title: 'Memory Sprint', description: 'Name as many shared memories or inside jokes as you can in 60 seconds. Highest unique count wins.', duration: '2 minutes', emoji: '🧠' },
  { category: 'COMPETITIVE', title: 'Impression Duel', description: 'Each do your best impression of the other on a normal call. Audience of one votes who nailed it.', duration: '4 minutes', emoji: '🎬' },

  // SWEET
  { category: 'SWEET', title: 'Tiny Confession', description: 'Say one small thing you noticed about them this week — from a text, a call, a photo — that made you smile. No big speeches.', duration: '3 minutes', emoji: '✨' },
  { category: 'SWEET', title: 'Favorite Version', description: 'Describe your favorite version of them — a specific call, message, or mood. Be specific.', duration: '4 minutes', emoji: '💫' },
  { category: 'SWEET', title: 'Gratitude Swap', description: 'Each write 3 things you appreciate about the other on your phone, then send them over and read them out loud.', duration: '5 minutes', emoji: '📝' },
  { category: 'SWEET', title: 'Soundtrack of Us', description: 'Each pick one song that represents a chapter of your relationship so far. Play 30 seconds and explain the pick.', duration: '6 minutes', emoji: '🎵' },
  { category: 'SWEET', title: 'Future Postcard', description: 'Write a short postcard from one year from now to each other. Read them aloud.', duration: '7 minutes', emoji: '✉️' },
  { category: 'SWEET', title: 'Soft Replay', description: 'Retell the story of how you started talking — but from the other person\'s point of view. See how close you get.', duration: '6 minutes', emoji: '📖' },
  { category: 'SWEET', title: 'Voice Note Gratitude', description: 'Record a 60-second voice note about one small thing you\'re grateful for right now. Send it, don\'t explain it first.', duration: '3 minutes', emoji: '🎧' },
  { category: 'SWEET', title: 'Homescreen Tour', description: 'Screenshot your phone homescreen and send it over. Narrate what each app placement secretly says about you.', duration: '4 minutes', emoji: '📲' },

  // DEEP
  { category: 'DEEP', title: 'Future Snapshot', description: 'Describe one ordinary Tuesday five years from now — once you\'re finally in the same city. Include what the other is doing in that scene.', duration: '6 minutes', emoji: '🔮' },
  { category: 'DEEP', title: 'Unsaid Thing', description: 'Share one thing you almost said to them recently but didn\'t. Keep it honest and short.', duration: '4 minutes', emoji: '💬' },
  { category: 'DEEP', title: 'Safe Place', description: 'Describe a call or a moment with them when you felt completely at ease. What made it that way?', duration: '5 minutes', emoji: '🏠' },
  { category: 'DEEP', title: 'Hard Truth Softly', description: 'Share one small growth area for the relationship — framed as a wish, not a complaint.', duration: '6 minutes', emoji: '🌱' },
  { category: 'DEEP', title: 'Letter in 10 Lines', description: 'Write a 10-line letter to your partner about something you never quite put into words. Read it or send it.', duration: '8 minutes', emoji: '💌' },
  { category: 'DEEP', title: 'What I Need', description: 'Finish this sentence for each other: "Right now I need more of…" No fixing, just listen.', duration: '5 minutes', emoji: '🤍' },
  { category: 'DEEP', title: 'First Meeting, Honestly', description: 'Share one honest feeling about meeting in person for the first time — nervous, excited, both. Let the other just hold it, no reassurance required.', duration: '5 minutes', emoji: '🫶' },
  { category: 'DEEP', title: 'What Distance Taught Me', description: 'Name one thing about love — or about yourself — that you only learned because you had to love each other from far away.', duration: '6 minutes', emoji: '🌍' },

  // SPICY / FLIRTY
  { category: 'SPICY', title: 'Rate That Memory', description: 'Name a shared memory from a call or trip you\'re planning. Partner rates how hot / chaotic / soft it was on a 1–10 and explains why.', duration: '5 minutes', emoji: '🔥' },
  { category: 'SPICY', title: 'First Notice', description: 'What was the first thing you noticed about them online that made you curious? Be honest.', duration: '3 minutes', emoji: '👀' },
  { category: 'SPICY', title: 'Flirt Rebuild', description: 'Flirt with each other like you just matched today and only have 5 minutes to impress.', duration: '5 minutes', emoji: '😏' },
  { category: 'SPICY', title: 'Secret Preference', description: 'Share one small preference you have that you think they still don\'t know about.', duration: '4 minutes', emoji: '🤫' },
  { category: 'SPICY', title: 'Complimentary Roast', description: 'Give a compliment that is also a tiny roast. Soft only. Example energy, not mean.', duration: '4 minutes', emoji: '🌶️' },
  { category: 'SPICY', title: 'Voice Only', description: 'Turn your camera off for 60 seconds and just listen to their voice. Say the first thing that comes to mind after.', duration: '3 minutes', emoji: '🎙️' },

  // RANDOM / BONDING Qs
  { category: 'RANDOM', title: 'Highs & Lows', description: 'Share the highest and lowest moment of your day in under a minute each. No advice unless asked.', duration: '4 minutes', emoji: '📈' },
  { category: 'RANDOM', title: 'Desert Island Three', description: 'If you two finally lived in the same place and could only unpack 3 things first, what would they be? Debate the list.', duration: '6 minutes', emoji: '🏝️' },
  { category: 'RANDOM', title: 'One More Question', description: 'Ask the question you\'ve been mildly curious about but never asked. Answer honestly.', duration: '5 minutes', emoji: '❔' },
  { category: 'RANDOM', title: 'Role Swap', description: 'For 3 minutes, do an impression of each other reacting to a typical evening. Keep it playful, not mean.', duration: '5 minutes', emoji: '🪞' },
  { category: 'RANDOM', title: 'Bucket Micro', description: 'Add one tiny thing to a shared "someday" list — something doable this month, even apart.', duration: '3 minutes', emoji: '🪣' },
  { category: 'RANDOM', title: 'Photo Story', description: 'Pick a random photo on your phone from the last month. Tell the story behind it in 60 seconds.', duration: '4 minutes', emoji: '📷' },
  { category: 'RANDOM', title: 'Trade a Habit', description: 'Each teach the other one tiny habit or skill in under 5 minutes — a word in your language, a recipe step, anything.', duration: '6 minutes', emoji: '🔁' },

  // ROMANTIC
  { category: 'ROMANTIC', title: 'Eyes Closed, Together', description: 'On camera, both close your eyes for 60 seconds like you\'re just sitting in the same room. Open them and say the first true thing that comes up.', duration: '3 minutes', emoji: '👁' },
  { category: 'ROMANTIC', title: 'Hand to the Screen', description: 'Hold your hand up to the camera like you\'re holding theirs. Tell a short story about the first time you knew this might be real.', duration: '5 minutes', emoji: '🤝' },
  { category: 'ROMANTIC', title: 'Slow Question', description: 'Ask: "When do you feel most loved by me, even from this far away?" Listen fully. No fixing, just receive it.', duration: '6 minutes', emoji: '🌙' },
  { category: 'ROMANTIC', title: 'Quiet Together', description: 'Stay on camera in silence for two minutes, no talking unless one of you needs to. Just be in the same space, however far apart.', duration: '2 minutes', emoji: '🤍' },
  { category: 'ROMANTIC', title: 'Long-Distance Toast', description: 'Make a tiny toast to something only the two of you understand. Clink whatever you\'re holding — glasses, mugs, whatever\'s closest.', duration: '3 minutes', emoji: '🥂' },
  { category: 'ROMANTIC', title: 'Letter in Five Lines', description: 'Each write a 5-line love note on your phone. Send it over and read it silently, then one line out loud.', duration: '7 minutes', emoji: '💌' },

  // CHEESY
  { category: 'CHEESY', title: 'Movie Trailer Us', description: 'Narrate your relationship like a dramatic movie trailer. Use a serious voice. Credits optional.', duration: '4 minutes', emoji: '🎬' },
  { category: 'CHEESY', title: 'Bad Pickup Lines Only', description: 'Take turns hitting on each other using only terrible pickup lines. Rate them. Crown a winner.', duration: '5 minutes', emoji: '😏' },
  { category: 'CHEESY', title: 'Soap Opera Confession', description: 'Confess something small as if you\'re on a daytime soap. Overact. Gasps encouraged.', duration: '4 minutes', emoji: '🎭' },
  { category: 'CHEESY', title: 'Hallmark Rewrite', description: 'Retell how you started talking as a Hallmark movie plot. Include a misunderstanding, a grand gesture, and a happy ending.', duration: '6 minutes', emoji: '❄️' },
  { category: 'CHEESY', title: 'Power Ballad Pose', description: 'Pick a cheesy love song, play 30 seconds on the call, and hold a ridiculous romantic pose to camera until the drop.', duration: '3 minutes', emoji: '🎤' },
  { category: 'CHEESY', title: 'Yes Dear Protocol', description: 'For 3 minutes reply to everything with an over-the-top loving cliché. "Of course, my universe."', duration: '3 minutes', emoji: '💘' },

  // DISTANCE — built for a couple who haven't met in person yet
  { category: 'DISTANCE', title: 'Countdown Wish', description: 'Say one specific thing you can\'t wait to do together the moment you\'re finally in the same room. Not just "hug you" — specifics.', duration: '4 minutes', emoji: '🧳' },
  { category: 'DISTANCE', title: 'Time Zone Toast', description: 'Whatever time it is for each of you right now, raise whatever\'s in reach — mug, glass, pillow — and toast to being one day closer.', duration: '2 minutes', emoji: '🕰️' },
  { category: 'DISTANCE', title: 'Same Sky', description: 'Step to a window if you can. Describe what you see, and imagine it\'s the same sky your partner is under right now.', duration: '3 minutes', emoji: '🌌' },
  { category: 'DISTANCE', title: 'Meeting Day Playlist', description: 'Each add one song to an imaginary playlist for the day you finally meet in person. Explain the pick.', duration: '5 minutes', emoji: '🎶' },
  { category: 'DISTANCE', title: 'What Shrinks the Miles', description: 'Name one small thing your partner does from far away that makes the distance feel shorter. Tell them now, plainly.', duration: '3 minutes', emoji: '🌉' },
  { category: 'DISTANCE', title: 'Postcard From Here', description: 'Describe your actual surroundings right now in loving detail, like you\'re sending a postcard from your city to theirs.', duration: '4 minutes', emoji: '🏙️' },
  { category: 'DISTANCE', title: 'Practice Run', description: 'Talk through what you think the first ten minutes of finally meeting will feel like. Nervous laughter fully allowed.', duration: '6 minutes', emoji: '🛬' },
  { category: 'DISTANCE', title: 'Miss You Most', description: 'Finish the sentence: "I miss you most when ___." Keep it specific and real, not just "always."', duration: '3 minutes', emoji: '🫂' },
  { category: 'DISTANCE', title: 'This Made Me Smile', description: 'Scroll to a screenshot or photo of your partner that still makes you smile. Show it on camera and say why it stuck.', duration: '4 minutes', emoji: '📸' },
  { category: 'DISTANCE', title: 'Bridge the Miles', description: 'Each name one thing you could do this week, even from far apart, that would make the other feel a little closer.', duration: '5 minutes', emoji: '🌁' },
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
  distance: 'DISTANCE',
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

  const system = `You invent short, warm activities for a long-distance couple. They're close but haven't met in person yet — they're planning to. Everything must work over video call, voice note, or text; never assume they're in the same physical room (no hand-holding, no passing objects to each other, no in-person-only games). Return ONLY JSON: {"category":"CHAOS|SWEET|DEEP|GAME|COMPETITIVE|SPICY|RANDOM|ROMANTIC|CHEESY|DISTANCE","title":"2-5 words","description":"1-2 sentences, doable right now over a call, voice note, or text","duration":"e.g. 5 minutes","emoji":"one emoji"}. Warm, playful, and feisty — occasionally a nod to missing each other or looking forward to meeting, but never sad or heavy about the distance, and never cheesy unless the category is CHEESY.`

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
          { role: 'user', content: `One new activity for a long-distance couple.${moodHint}${avoid}` },
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
