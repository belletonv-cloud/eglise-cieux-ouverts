export default defineEventHandler((event) => {
  return sendRedirect(event, '/?admin=true', 302)
})
