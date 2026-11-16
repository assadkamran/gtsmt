import type { Payload } from 'payload'
import { NEED_LABEL } from './options'
import type { EnquiryData } from './schema'
import { contactRows, answerSections } from './summary'

/** Notification and optional auto-reply. Everything the buyer typed is escaped before it goes into HTML. */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
/** Header values must be one line: a newline in a subject or name is how email header injection works. */
const oneLine = (s: string, max = 180) => s.replace(/[\r\n\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)

export type Settings = {
  email?: string | null
  salesEmail?: string | null
  enquiryRecipients?: { email: string }[] | null
  autoReply?: { enabled?: boolean | null; subject?: string | null; body?: string | null } | null
} | null

export function recipientsOf(s: Settings): string[] {
  const listed = (s?.enquiryRecipients ?? []).map((r) => r.email).filter(Boolean)
  if (listed.length) return [...new Set(listed)]
  return [...new Set([s?.salesEmail, s?.email].filter((v): v is string => Boolean(v)))]
}

export function notificationContent(o: { reference: string; data: EnquiryData; titles: string[]; adminUrl: string; flagged?: boolean }) {
  const { reference, data, titles, adminUrl } = o
  const subject = oneLine(`New enquiry ${reference}: ${NEED_LABEL[data.type]} from ${data.company}`)

  const sections = [
    { heading: 'Contact', rows: contactRows(data) },
    ...(data.topic || titles.length ? [{ heading: 'Context', rows: [...(data.topic ? [{ label: 'Came from', value: data.topic }] : []), ...titles.map((t) => ({ label: 'Product', value: t }))] }] : []),
    ...answerSections(data),
    ...(data.message ? [{ heading: 'Message', rows: [{ label: '', value: data.message }] }] : []),
  ]

  const text = [
    `New enquiry ${reference} (${NEED_LABEL[data.type]})`,
    ...sections.map((s) => [`\n${s.heading.toUpperCase()}`, ...s.rows.map((r) => (r.label ? `${r.label}: ${r.value}` : r.value))].join('\n')),
    `\nOpen in the admin: ${adminUrl}`,
    'Reply to this email to reach the buyer directly.',
  ].join('\n')

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#131a2c">
<div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dae0ec;border-radius:8px;padding:24px">
<p style="margin:0 0 4px;font-size:13px;color:#566079">New enquiry</p>
<h1 style="margin:0 0 20px;font-size:20px">${esc(reference)} &middot; ${esc(NEED_LABEL[data.type])}</h1>
${sections
  .map(
    (s) => `<h2 style="margin:20px 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#566079">${esc(s.heading)}</h2>
<table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px">${s.rows
      .map((r) => `<tr>${r.label ? `<td style="padding:4px 12px 4px 0;vertical-align:top;color:#566079;white-space:nowrap">${esc(r.label)}</td>` : ''}<td style="padding:4px 0;white-space:pre-wrap" ${r.label ? '' : 'colspan="2"'}>${esc(r.value)}</td></tr>`)
      .join('')}</table>`,
  )
  .join('\n')}
<p style="margin:24px 0 0"><a href="${esc(adminUrl)}" style="display:inline-block;background:#2f5bf0;color:#ffffff;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:6px">Open in the admin</a></p>
<p style="margin:16px 0 0;font-size:13px;color:#566079">Reply to this email to reach the buyer directly.</p>
</div></body></html>`

  return { subject, text, html }
}

export type EmailOutcome = { status: 'sent' | 'failed' | 'skipped'; error?: string }

/** Never throws: an email problem must not lose or fail an enquiry that is already saved. */
export async function sendNotification(payload: Payload, o: { recipients: string[]; reference: string; data: EnquiryData; titles: string[]; adminUrl: string }): Promise<EmailOutcome> {
  if (o.recipients.length === 0) return { status: 'skipped', error: 'No recipient is set in Website Settings.' }
  const c = notificationContent(o)
  try {
    await payload.sendEmail({ to: o.recipients, subject: c.subject, text: c.text, html: c.html, replyTo: oneLine(o.data.email, 254) })
    // Without an email provider Payload only prints the message to the server log. Say so instead of claiming it was sent.
    return process.env.RESEND_API_KEY ? { status: 'sent' } : { status: 'skipped', error: 'No email provider is configured (the message was written to the server log).' }
  } catch (e) {
    return { status: 'failed', error: oneLine(e instanceof Error ? e.name : 'Unknown error', 120) }
  }
}

export async function sendAutoReply(payload: Payload, o: { settings: Settings; reference: string; to: string }): Promise<void> {
  const a = o.settings?.autoReply
  if (!a?.enabled || !a.subject || !a.body) return
  try {
    await payload.sendEmail({ to: o.to, subject: oneLine(a.subject), text: `${a.body}\n\nYour reference: ${o.reference}` })
  } catch {
    // The buyer already sees the confirmation on screen. Nothing else to do.
  }
}
