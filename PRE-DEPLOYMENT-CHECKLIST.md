# Pre-Deployment Checklist — Église Cieux Ouverts

**Date**: 2026-07-06  
**Status**: Ready for final verification before production deployment

---

## ✅ BUILD & TESTS

### Build Status
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] dist/ folder created successfully
- [ ] version.txt generated in public/

### Test Results
- [ ] `npm run test:e2e` completes
- [ ] Overall pass rate > 90%
- [ ] No critical failures
- [ ] Security tests pass
- [ ] API tests pass
- [ ] Performance tests pass

### Specific Test Suites
- [ ] no-hard-refresh.spec.ts — PASS
- [ ] critical-flows.spec.ts — PASS
- [ ] admin-comprehensive.spec.ts — PASS
- [ ] performance-stability.spec.ts — PASS
- [ ] security-validation.spec.ts — PASS
- [ ] api-firestore.spec.ts — PASS
- [ ] performance-advanced.spec.ts — PASS

---

## 📦 BUNDLE & PERFORMANCE

### Bundle Analysis
- [ ] Total bundle < 1.5 MB
- [ ] Gzipped < 500 KB
- [ ] No unused dependencies
- [ ] No duplicate packages

### Performance Metrics
- [ ] LCP < 2.5s ✅
- [ ] FID < 100ms ✅
- [ ] CLS < 0.1 ✅
- [ ] Load time < 3s ✅
- [ ] Memory usage reasonable ✅

### Assets
- [ ] All images optimized
- [ ] Fonts loading efficiently
- [ ] CSS minified
- [ ] JS minified

---

## 🔒 SECURITY

### Pre-Flight Checks
- [ ] No secrets in code (API keys, tokens)
- [ ] No hardcoded passwords
- [ ] .env.example updated
- [ ] Environment variables documented

### Security Headers
- [ ] X-Frame-Options set
- [ ] CSP configured
- [ ] HTTPS enforced (in production)
- [ ] CORS configured properly

### Auth & API
- [ ] Firebase credentials loaded from env
- [ ] Admin endpoints require auth
- [ ] Input validation working
- [ ] CSRF protection in place

---

## 🔌 FIRESTORE & API

### Firestore Setup
- [ ] Database connection working
- [ ] Collections exist (pages, menu, footer)
- [ ] Test data available
- [ ] Permissions set correctly

### API Endpoints
- [ ] GET /api/pages/:slug — works
- [ ] PUT /api/pages/:slug — works
- [ ] GET /api/menu — works
- [ ] GET /api/footer — works
- [ ] Contact form endpoint — works

---

## 📱 BROWSER & DEVICE

### Browser Compatibility
- [ ] Chrome/Chromium — ✅
- [ ] Firefox — ✅
- [ ] Safari — ✅
- [ ] Edge — ✅

### Responsive
- [ ] Mobile (375px) — ✅
- [ ] Tablet (768px) — ✅
- [ ] Desktop (1280px) — ✅

### Accessibility
- [ ] WCAG AA contrast — ✅
- [ ] Keyboard navigation — ✅
- [ ] Screen reader friendly — ✅
- [ ] Heading structure valid — ✅

---

## 🚀 DEPLOYMENT READINESS

### Cloudflare Pages
- [ ] wrangler.toml configured
- [ ] Environment variables set in Cloudflare
- [ ] Custom domain configured (if applicable)
- [ ] SSL/TLS enabled
- [ ] Build command tested locally

### Monitoring & Logging
- [ ] Error tracking configured
- [ ] Analytics enabled
- [ ] Performance monitoring ready
- [ ] Logs accessible

### Version Detection
- [ ] version.txt mechanism works
- [ ] Deployment detection tested
- [ ] Hard refresh behavior validated

---

## 📋 FINAL VERIFICATION

### Code Quality
- [ ] No `console.log` left in production code
- [ ] No TODO/FIXME comments (or tracked)
- [ ] TypeScript strict mode (where applicable)
- [ ] ESLint passes

### Documentation
- [ ] CLAUDE.md complete ✅
- [ ] README updated ✅
- [ ] REFRESH-MECHANICS.md complete ✅
- [ ] TEST-COVERAGE.md complete ✅
- [ ] Deployment instructions clear ✅

### Git Status
- [ ] All changes committed
- [ ] No uncommitted files
- [ ] Branch clean
- [ ] Ready to tag release (if applicable)

---

## 🎯 GO/NO-GO DECISION

### GO Criteria (All Must Pass)
- ✅ Build succeeds
- ✅ Tests > 90% pass rate
- ✅ No critical security issues
- ✅ Performance metrics met
- ✅ All environments configured
- ✅ Documentation complete

### NO-GO Criteria (Any triggers hold)
- ❌ Build fails
- ❌ Tests < 90% pass rate
- ❌ Security vulnerabilities found
- ❌ Performance degraded
- ❌ Missing environment variables
- ❌ Incomplete documentation

---

## 📝 DEPLOYMENT EXECUTION

### Pre-Deployment (5 min before)
```bash
# Final verification
npm run build
npm run test:e2e:quick

# Check version.txt
cat public/version.txt
```

### Deployment
```bash
# Deploy to Cloudflare Pages
npm run deploy

# Or manual:
npx wrangler pages deploy dist
```

### Post-Deployment (15 min after)
1. ✅ Visit production URL
2. ✅ Verify version loaded (check Network tab)
3. ✅ Test admin login
4. ✅ Run smoke tests in production
5. ✅ Monitor error logs
6. ✅ Check performance metrics

### Rollback Plan (if needed)
```bash
# If critical issue found:
# 1. Identify previous working version in Cloudflare Pages
# 2. Revert to previous deployment
# OR
# 3. Fix locally, rebuild, redeploy
```

---

## ✨ SIGN-OFF

- [ ] All checklist items verified
- [ ] Team agrees on GO
- [ ] Deployment window set
- [ ] Monitoring alerts ready
- [ ] Rollback plan in place

**Ready to deploy:** ___________  (date/time)  
**Deployed by:** ___________  (person)  
**Result:** ✅ SUCCESS / ❌ ROLLBACK

---

## 📞 SUPPORT

**If deployment fails:**
1. Check error logs in Cloudflare Pages
2. Verify environment variables set
3. Check Firebase connection
4. Review recent commits for issues
5. Consider rollback if critical

**Post-deployment issues:**
1. Monitor error tracking (Sentry, etc.)
2. Check Core Web Vitals
3. Monitor user feedback
4. Be ready to hotfix or rollback

---

**Status: READY FOR FINAL VERIFICATION** 🚀
