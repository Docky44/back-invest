import axios from 'axios'
import _ from 'lodash'
import fs from 'node:fs'

type Commit = {
  id: string
  message: string
  url: string
  author: { name: string; username?: string | null }
}

type Repo = {
  name: string
  full_name: string
  html_url: string
}

type Sender = {
  login: string
  html_url: string
  avatar_url: string
}

type EventPayload = {
  ref: string
  repository: Repo
  commits: Commit[]
  pusher: { name: string }
  sender: Sender
  compare: string
}

const webhook = String(process.env.DISCORD_WEBHOOK_URL ?? '')
const repoSlug = String(process.env.REPO ?? '')
const refEnv = process.env.REF
const compareEnv = process.env.COMPARE
const eventPath = String(process.env.GITHUB_EVENT_PATH ?? '')

const exists = eventPath !== '' && fs.existsSync(eventPath)

const readEvent = (): EventPayload => {
  const raw = exists ? fs.readFileSync(eventPath, 'utf8') : '{}'
  const parsed = JSON.parse(raw) as Partial<EventPayload>
  return {
    ref: String(parsed.ref ?? ''),
    repository: {
      name: String(parsed.repository?.name ?? ''),
      full_name: String(parsed.repository?.full_name ?? repoSlug),
      html_url: String(parsed.repository?.html_url ?? (repoSlug ? `https://github.com/${repoSlug}` : ''))
    },
    commits: Array.isArray(parsed.commits) ? parsed.commits : [],
    pusher: { name: String(parsed.pusher?.name ?? '') },
    sender: {
      login: String(parsed.sender?.login ?? ''),
      html_url: String(parsed.sender?.html_url ?? ''),
      avatar_url: String(parsed.sender?.avatar_url ?? '')
    },
    compare: String(parsed.compare ?? '')
  }
}

const buildPayload = (event: EventPayload) => {
  const ref = typeof refEnv === 'string' ? refEnv : event.ref
  const branch = _.last(String(ref).split('/')) || 'unknown'
  const commits = event.commits
  const lines = _.map(_.take(commits, 10), (c) => {
    const short = c.id.slice(0, 7)
    const author = c.author?.username || c.author?.name || 'unknown'
    const first = _.trim(c.message.split('\n')[0])
    return `[${short}] ${first} — ${author}`
  })
  const desc = lines.length > 0 ? _.join(lines, '\n') : 'Aucun commit listé'
  const repoUrl = event.repository.html_url || (repoSlug ? `https://github.com/${repoSlug}` : '')
  const title = `${repoSlug || event.repository.full_name} • push sur ${branch}`
  const compareUrl = typeof compareEnv === 'string' && compareEnv !== '' ? compareEnv : event.compare || repoUrl

  return {
    username: 'GitHub',
    embeds: [
      {
        title,
        url: compareUrl,
        description: desc,
        fields: [
          { name: 'Branche', value: branch, inline: true },
          { name: 'Commits', value: String(commits.length), inline: true },
          {
            name: 'Pusher',
            value: event.pusher.name || event.sender.login || 'unknown',
            inline: true
          }
        ],
        author: {
          name: repoSlug || event.repository.full_name,
          url: repoUrl,
          icon_url: event.sender.avatar_url
        },
        timestamp: new Date().toISOString(),
        footer: { text: 'GitHub → Discord' }
      }
    ]
  }
}

const run = async (): Promise<void> => {
  if (webhook === '' || !exists) {
    process.exitCode = 1
    return
  }
  const event = readEvent()
  const payload = buildPayload(event)
  await axios.post(webhook, payload, { timeout: 10000 })
}

run().catch(() => {
  process.exitCode = 1
})
