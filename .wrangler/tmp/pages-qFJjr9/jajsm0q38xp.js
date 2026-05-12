// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/_nuxt/*",
    "/.DS_Store",
    "/200",
    "/404",
    "/aspirations-timings.json",
    "/calendar.png",
    "/favicon-180.png",
    "/favicon-192.png",
    "/favicon-32.png",
    "/favicon.ico",
    "/favicon.jpg",
    "/foule-croix.png",
    "/hero-foule.png",
    "/hero.jpg",
    "/logo-c-clean.png",
    "/logo-c.png",
    "/logo-header.png",
    "/logo-hero.png",
    "/logo-nav.png",
    "/logo-text.png",
    "/logo-texte.png",
    "/logo.png",
    "/robots.txt",
    "/salle-reunion.png",
    "/smartphone.jpg",
    "/version.txt",
    "/photos/PHOTO-2026-05-02-21-17-07.jpg",
    "/photos/PHOTO-2026-05-02-21-17-07.png",
    "/photos/PHOTO-2026-05-02-21-17-072.jpg",
    "/photos/PHOTO-2026-05-02-21-17-072.png",
    "/photos/PHOTO-2026-05-02-21-17-09.jpg",
    "/photos/PHOTO-2026-05-02-21-17-092.jpg",
    "/photos/PHOTO-2026-05-02-21-17-11.jpg",
    "/photos/PHOTO-2026-05-02-21-17-12.jpg",
    "/photos/PHOTO-2026-05-02-21-17-12.png",
    "/photos/PHOTO-2026-05-02-21-17-13.jpg",
    "/photos/PHOTO-2026-05-02-21-17-13.png",
    "/photos/PHOTO-2026-05-02-21-17-14.jpg",
    "/photos/PHOTO-2026-05-02-21-17-14.png",
    "/photos/PHOTO-2026-05-02-21-17-17.jpg",
    "/photos/PHOTO-2026-05-02-21-17-17.png",
    "/photos/PHOTO-2026-05-02-21-17-18.jpg",
    "/photos/PHOTO-2026-05-02-21-17-18.png",
    "/photos/PHOTO-2026-05-02-21-17-20.jpg",
    "/photos/PHOTO-2026-05-02-21-17-20.png",
    "/photos/PHOTO-2026-05-02-21-17-21.jpg",
    "/photos/PHOTO-2026-05-02-21-17-212.jpg",
    "/photos/PHOTO-2026-05-02-21-17-212.png",
    "/photos/PHOTO-2026-05-02-21-17-22.jpg",
    "/photos/PHOTO-2026-05-02-21-17-222.jpg",
    "/photos/PHOTO-2026-05-02-21-17-24.jpg",
    "/photos/PHOTO-2026-05-02-21-17-25.jpg",
    "/photos/PHOTO-2026-05-02-21-17-25.png",
    "/photos/PHOTO-2026-05-02-21-17-252.jpg",
    "/photos/PHOTO-2026-05-02-21-17-252.png",
    "/photos/PHOTO-2026-05-02-21-17-26.jpg",
    "/photos/PHOTO-2026-05-02-21-17-26.png",
    "/photos/PHOTO-2026-05-02-21-17-262.jpg",
    "/photos/PHOTO-2026-05-02-21-17-262.png",
    "/photos/PHOTO-2026-05-02-21-17-28.jpg",
    "/photos/PHOTO-2026-05-02-21-17-285.jpg",
    "/photos/PHOTO-2026-05-02-21-17-29.jpg",
    "/photos/preview",
    "/photos/salle.jpg",
    "/photos/slide-buffet.jpg",
    "/photos/slide-femmes.jpg",
    "/photos/slide-groupe.jpg",
    "/photos/slide-mains.jpg",
    "/photos/slide-pizza.jpg",
    "/photos/slide-promenade.jpg",
    "/photos/slide-salle.jpg",
    "/photos/slide1.jpg",
    "/photos/slide2.jpg",
    "/photos/slide3.jpg",
    "/photos/slide4.jpg",
    "/photos/slide5.jpg",
    "/photos/slide6.jpg",
    "/photos/slide7.jpg"
  ]
};

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/Users/vic/Downloads/eglise-cieux-ouverts/.wrangler/tmp/pages-qFJjr9/bundledWorker-0.9786514375755643.mjs";
import { isRoutingRuleMatch } from "/Users/vic/Downloads/eglise-cieux-ouverts/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/Users/vic/Downloads/eglise-cieux-ouverts/.wrangler/tmp/pages-qFJjr9/bundledWorker-0.9786514375755643.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=jajsm0q38xp.js.map
