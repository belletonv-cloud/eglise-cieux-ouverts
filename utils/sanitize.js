const EVENT_HANDLER_RE = /(<[^>]+)\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const SCRIPT_TAG_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const JAVASCRIPT_URL_RE = /\s+href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi
const IFRAME_SRCDOC_RE = /<iframe\b[^>]*\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*')(?:[^>]*)?>/gi
const SVG_ONLOAD_RE = /<svg\b[^>]*\s+onload\s*=\s*(?:"[^"]*"|'[^']*')(?:[^>]*)?>/gi
const DETAILS_ONTOGGLE_RE = /<details\b[^>]*\s+ontoggle\s*=\s*(?:"[^"]*"|'[^']*')(?:[^>]*)?>/gi
const BODY_ONLOAD_RE = /<body\b[^>]*\s+onload\s*=\s*(?:"[^"]*"|'[^']*')(?:[^>]*)?>/gi
const MATH_XSS_RE = /<math\b[^>]*>.*?<\/math>/gis
const META_REFRESH_RE = /<meta\b[^>]*\s+http-equiv\s*=\s*["']refresh["'][^>]*>/gi

export function sanitizeHtml(html) {
  if (!html) return ''
  let s = html
  s = s.replace(SCRIPT_TAG_RE, '')
  s = s.replace(EVENT_HANDLER_RE, '$1')
  s = s.replace(JAVASCRIPT_URL_RE, '')
  s = s.replace(IFRAME_SRCDOC_RE, '<iframe>')
  s = s.replace(SVG_ONLOAD_RE, '<svg>')
  s = s.replace(DETAILS_ONTOGGLE_RE, '<details>')
  s = s.replace(BODY_ONLOAD_RE, '<body>')
  s = s.replace(MATH_XSS_RE, '')
  s = s.replace(META_REFRESH_RE, '')
  return s
}
