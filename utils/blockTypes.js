/**
 * Page Builder — Définition des types de blocs
 * Chaque bloc a : type, label, icône, props par défaut, schema de propriétés éditables
 */

// Slugs occupés par une route statique dédiée (pages/*.vue) : jamais
// atteignables via le catch-all pages/[slug].vue. Source de vérité unique,
// importée à la fois côté client (useMenuEditor, pour filtrer/masquer ces
// entrées de la liste des pages custom) et côté serveur
// (server/api/pages/index.post.ts, pour interdire leur création — sans ça
// un admin pouvait créer une page "Contact" ou "Photos" en Firestore qui
// n'était jamais rendue nulle part, l'URL restant capturée par le fichier
// statique).
export const HARDCODED_SLUGS = ["accueil", "contact", "messages", "event-list", "agenda", "photos"];

export const ANIMATIONS = [
  { id: "none", label: "Aucune", css: "" },
  { id: "fadeIn", label: "Apparition", css: "anim-fadeIn" },
  { id: "slideUp", label: "Glisse haut", css: "anim-slideUp" },
  { id: "slideLeft", label: "Glisse gauche", css: "anim-slideLeft" },
  { id: "portal", label: "Portail 3D", css: "anim-portal" },
  { id: "zoom", label: "Zoom entrant", css: "anim-zoom" },
  { id: "bounce", label: "Rebond", css: "anim-bounce" },
  { id: "flip", label: "Flip horizontal", css: "anim-flip" },
  { id: "wave", label: "Vague", css: "anim-wave" },
];

const DEFAULT_MESSAGES_BODY = `<p>Les messages partages a l'eglise ne sont pas faits pour s'arreter au dimanche.</p><p>📺 Replonge dans la parole sur notre chaine YouTube :</p><ul><li>(Re)decouvre les messages qui t'ont touche.</li><li>Laisse Dieu te parler a nouveau, ou d'une maniere nouvelle.</li><li>Partage-les avec tes proches pour semer l'esperance autour de toi.</li></ul><p>Que ce soit pour approfondir, reentendre une parole qui t'a marque(e), ou rester connecte(e) dans la semaine, ces moments sont la pour toi.</p><p><strong>Abonne-toi des maintenant pour ne rien manquer et garde la flamme allumee.</strong></p>`;
const DEFAULT_MESSAGES_GRADIENT = `radial-gradient(circle at 94.35% 89.61%, #054886 0%, 20%, rgba(5, 72, 134, 0) 40%), radial-gradient(circle at 9.07% 95.57%, rgba(238, 108, 113, 0.99) 0%, 25%, rgba(238, 108, 113, 0) 50%), radial-gradient(circle at 4.04% 13.51%, #054886 0%, 42%, rgba(5, 72, 134, 0) 70%), radial-gradient(circle at 93.32% 10.65%, #EF4B54 0%, 42%, rgba(239, 75, 84, 0) 70%), radial-gradient(circle at 48.90% 49.52%, #FFFFFF 0%, 100%, rgba(255, 255, 255, 0) 100%)`;
// ─── TYPES DE BLOCS ────────────────────────────────────────────────────────────
export const BLOCK_TYPES = {
  hero: {
    label: "Hero (bannière)",
    icon: "🖼️",
    category: "hero",
    animations: "none",
    defaults: {
      image: "/foule-croix.png",
      height: 700,
      overlay: false,
      overlayColor: "rgba(0,0,0,0.3)",
      overlayText: "",
      textColor: "#064886",
      showButton: false,
      nameImage: "/images/hero-name-image.png",
    },
    schema: [
      { key: "image", label: "Image", type: "image" },
      { key: "nameImage", label: "Image titre", type: "image" },
      {
        key: "height",
        label: "Hauteur (px)",
        type: "number",
        min: 200,
        max: 900,
      },
      { key: "overlay", label: "Overlay sombre", type: "boolean" },
      { key: "overlayColor", label: "Fond overlay", type: "color" },
      { key: "overlayText", label: "Texte principal (remplace logo)", type: "text" },
      { key: "textColor", label: "Couleur texte", type: "color" },
      { key: "showButton", label: "Afficher bouton", type: "boolean" },
    ],
  },

  bienvenue: {
    label: "Bienvenue (lettres)",
    icon: "✨",
    category: "content",
    animations: "wrapper",
    defaults: {
      title: "BIENVENUE",
      subtitle: "à votre église",
      backgroundColor: "#ffffff",
      textColor: "#1a1a2e",
      animation: "portal",
      fontSize: 7,
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "subtitle", label: "Sous-titre", type: "text" },
      { key: "backgroundColor", label: "Fond", type: "color" },
      { key: "textColor", label: "Couleur texte", type: "color" },
      { key: "animation", label: "Animation", type: "animation" },
      {
        key: "fontSize",
        label: "Taille police (em)",
        type: "number",
        min: 3,
        max: 12,
      },
    ],
  },

  activities: {
    label: "Grille d'activités",
    icon: "🗂️",
    category: "content",
    animations: "wrapper",
    defaults: {
      items: [
        {
          title: "Rencontre du dimanche",
          description:
            "Un temps hebdomadaire pour se retrouver, célébrer et échanger ensemble.\n\nDécrivez ici le déroulé type : accueil, temps de louange, message, temps de prière.",
          image: "/images/activites-celebration.jpg",
        },
        {
          title: "Groupe de partage",
          description:
            "Un petit groupe qui se réunit régulièrement pour discuter, prier et grandir ensemble.\n\nPrécisez ici le rythme, le lieu et le public visé.",
          image: "/images/activites-priere.jpg",
        },
        {
          title: "Repas convivial",
          description:
            "Un moment de partage autour d'un repas, ouvert à tous.\n\nIndiquez ici la fréquence et les modalités de participation.",
          image: "/images/activites-repas.jpg",
        },
      ],
    },
    schema: [{ key: "items", label: "Activités", type: "array" }],
  },

  textImage: {
    label: "Texte + Image",
    icon: "📝",
    category: "content",
    animations: "wrapper",
    defaults: {
      title: "Titre de la section",
      subtitle: "",
      body: "Contenu de la section.",
      image: "/photos/salle.jpg",
      reverse: false,
      visualStyle: "default",
      ctaText: "",
      ctaLink: "",
      backgroundColor: "#ffffff",
      textColor: "#1a1a2e",
      animation: "slideLeft",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "subtitle", label: "Sous-titre", type: "text" },
      { key: "body", label: "Contenu", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
      { key: "reverse", label: "Image à gauche", type: "boolean" },
      {
        key: "visualStyle",
        label: "Style visuel",
        type: "select",
        options: ["default", "messagesLaptop"],
      },
      { key: "ctaText", label: "Texte bouton", type: "text" },
      { key: "ctaLink", label: "Lien bouton", type: "text" },
      { key: "backgroundColor", label: "Fond", type: "color" },
      { key: "textColor", label: "Couleur texte", type: "color" },
      { key: "animation", label: "Animation", type: "animation" },
    ],
    templates: [
      { id: "blank", label: "Vierge", icon: "📝", props: {} },
      {
        id: "ministry-presentation",
        label: "Présentation d'un ministère",
        icon: "🙌",
        props: {
          title: "Nom du ministère",
          subtitle: "Une équipe à votre service",
          body: "Présentez ici la mission et les activités de ce ministère.",
          ctaText: "En savoir plus",
          ctaLink: "/contact",
        },
      },
      {
        id: "event-highlight",
        label: "Mise en avant d'un événement",
        icon: "📅",
        props: {
          title: "Nom de l'événement",
          subtitle: "Date à préciser",
          body: "Décrivez l'événement, le lieu et comment s'inscrire.",
          reverse: true,
          ctaText: "S'inscrire",
          ctaLink: "/contact",
        },
      },
    ],
  },

  rejoins: {
    label: "Rejoins-nous",
    icon: "🤝",
    category: "content",
    animations: "internal",
    defaults: {
      title: "Rejoins-nous",
      subtitle: "Chaque dimanche",
      location: "dans votre ville",
      horaires: [
        { heure: "9h30", label: "Accueil café" },
        { heure: "10h00", label: "Célébration" },
      ],
      backgroundGradient:
        "linear-gradient(to bottom, #064886 0%, #e58b8b 100%)",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "subtitle", label: "Sous-titre", type: "text" },
      { key: "location", label: "Lieu", type: "text" },
      { key: "backgroundGradient", label: "Fond (CSS)", type: "text" },
      { key: "horaires", label: "Horaires", type: "array" },
    ],
  },

  aspirations: {
    label: "Nos aspirations",
    icon: "🌟",
    category: "content",
    animations: "internal",
    defaults: {
      title: "Nos aspirations",
      items: [
        "Accueillir chacun avec bienveillance",
        "Célébrer et vivre notre foi ensemble",
        "Accompagner et soutenir les uns les autres",
        "Partager et transmettre nos convictions",
      ],
      backgroundColor: "#064886",
      textColor: "#ffffff",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "items", label: "Aspirations", type: "array" },
      { key: "backgroundColor", label: "Fond", type: "color" },
      { key: "textColor", label: "Couleur texte", type: "color" },
    ],
  },

  contact: {
    label: "Formulaire contact",
    icon: "✉️",
    category: "content",
    animations: "wrapper",
    defaults: {
      title: "Tu veux nous contacter ?",
      addressTitle: "",
      addressLine: "",
      image: "",
      mapEmbedUrl: "",
      backgroundColor: "#064886",
      backgroundGradient: "#064886",
      textColor: "#ffffff",
      showQuestions: true,
      showSocials: true,
      animation: "fadeIn",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "addressTitle", label: "Adresse titre", type: "text" },
      { key: "addressLine", label: "Adresse ligne", type: "text" },
      { key: "image", label: "Image gauche", type: "image" },
      { key: "mapEmbedUrl", label: "URL carte", type: "text" },
      { key: "backgroundGradient", label: "Fond (CSS)", type: "text" },
      { key: "textColor", label: "Texte couleur", type: "color" },
      { key: "showQuestions", label: "Questions intro", type: "boolean" },
      { key: "showSocials", label: "Réseaux sociaux", type: "boolean" },
      { key: "animation", label: "Animation", type: "animation" },
    ],
  },

  nousRejoindre: {
    label: "Nous rejoindre (Cercle)",
    icon: "⚪",
    category: "content",
    animations: "internal",
    defaults: {
      title: "Nous rejoindre",
      link: "/contact",
      backgroundGradient:
        "linear-gradient(to bottom, #d97777 0%, #064886 100%)",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "link", label: "Lien", type: "text" },
      { key: "backgroundGradient", label: "Fond (CSS)", type: "text" },
    ],
  },

  richText: {
    label: "Texte riche",
    icon: "📄",
    category: "content",
    animations: "wrapper",
    defaults: {
      content: "Écrivez votre texte ici...",
      backgroundColor: "#ffffff",
      backgroundGradient: "",
      textColor: "#1a1a2e",
      textAlign: "left",
      padding: 60,
      animation: "fadeIn",
    },
    schema: [
      { key: "content", label: "Contenu HTML", type: "richtext" },
      { key: "backgroundColor", label: "Fond (couleur)", type: "color" },
      { key: "backgroundGradient", label: "Fond (dégradé)", type: "text" },
      { key: "textColor", label: "Couleur texte", type: "color" },
      {
        key: "textAlign",
        label: "Alignement",
        type: "select",
        options: ["left", "center", "right"],
      },
      {
        key: "padding",
        label: "Espacement (px)",
        type: "number",
        min: 0,
        max: 200,
      },
      { key: "animation", label: "Animation", type: "animation" },
    ],
    templates: [
      { id: "blank", label: "Vierge", icon: "📄", props: {} },
      {
        id: "announcement",
        label: "Annonce",
        icon: "📢",
        props: {
          content:
            "<h2>Titre de l'annonce</h2><p>Détails de l'annonce à venir.</p>",
          backgroundColor: "#fff7e6",
          textColor: "#7a4a00",
          textAlign: "center",
        },
      },
      {
        id: "testimony",
        label: "Témoignage",
        icon: "💬",
        props: {
          content:
            "<p><em>« Un témoignage marquant à partager ici. »</em></p><p>— Nom du témoin</p>",
          backgroundColor: "#f8f9fa",
          textAlign: "left",
        },
      },
      {
        id: "article",
        label: "Article",
        icon: "📰",
        props: {
          content:
            "<h2>Titre de l'article</h2><p>Introduction...</p><p>Développement...</p>",
          textAlign: "left",
          padding: 80,
        },
      },
    ],
  },

  gallery: {
    label: "Galerie photos",
    icon: "🖼️",
    category: "media",
    animations: "wrapper",
    defaults: {
      title: "",
      textColor: "#064886",
      images: [],
      columns: 3,
      backgroundColor: "#ffffff",
      animation: "fadeIn",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "textColor", label: "Couleur texte", type: "color" },
      { key: "images", label: "Images", type: "images" },
      { key: "columns", label: "Colonnes", type: "number", min: 1, max: 4 },
      { key: "backgroundColor", label: "Fond", type: "color" },
      { key: "animation", label: "Animation", type: "animation" },
    ],
  },

  spacer: {
    label: "Espace vide",
    icon: "↕️",
    category: "layout",
    animations: "none",
    defaults: {
      height: 60,
      backgroundColor: "transparent",
    },
    schema: [
      {
        key: "height",
        label: "Hauteur (px)",
        type: "number",
        min: 10,
        max: 400,
      },
      { key: "backgroundColor", label: "Fond", type: "color" },
    ],
  },

  youtube: {
    label: "Vidéo YouTube",
    icon: "▶️",
    category: "media",
    animations: "wrapper",
    defaults: {
      videoId: "",
      title: "Message récent",
      backgroundColor: "#ffffff",
      animation: "fadeIn",
    },
    schema: [
      { key: "videoId", label: "ID vidéo YouTube", type: "text" },
      { key: "title", label: "Titre", type: "text" },
      { key: "backgroundColor", label: "Fond", type: "color" },
      { key: "animation", label: "Animation", type: "animation" },
    ],
  },

  vision: {
    label: "Vision (citation)",
    icon: "🎯",
    category: "content",
    animations: "wrapper",
    defaults: {
      label: "Ce qui nous anime",
      quote:
        "Notre vision : voir des vies transformées et une communauté qui grandit ensemble.",
      ctaText: "",
      ctaLink: "",
      backgroundGradient: "#f8f9fa",
      textColor: "#064886",
      animation: "fadeIn",
    },
    schema: [
      { key: "label", label: "Label", type: "text" },
      { key: "quote", label: "Citation", type: "textarea" },
      { key: "ctaText", label: "Bouton texte", type: "text" },
      { key: "ctaLink", label: "Bouton lien", type: "text" },
      { key: "backgroundGradient", label: "Fond (CSS)", type: "text" },
      { key: "textColor", label: "Texte couleur", type: "color" },
      { key: "animation", label: "Animation", type: "animation" },
    ],
  },

  fullWidthImage: {
    label: "Image pleine largeur",
    icon: "🌆",
    category: "media",
    animations: "wrapper",
    defaults: {
      src: "",
      alt: "Image pleine largeur",
      height: 400,
    },
    schema: [
      { key: "src", label: "Image", type: "image" },
      { key: "alt", label: "Texte alternatif", type: "text" },
      {
        key: "height",
        label: "Hauteur (px)",
        type: "number",
        min: 100,
        max: 800,
      },
    ],
  },

  equipe: {
    label: "Équipe (membres)",
    icon: "👥",
    category: "content",
    animations: "wrapper",
    defaults: {
      title: "Notre équipe",
      subtitle: "",
      members: [
        { name: "Prénom Nom", role: "Pasteur", photo: "", description: "" },
      ],
      columns: 3,
      backgroundColor: "#ffffff",
      textColor: "#064886",
      animation: "fadeIn",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "subtitle", label: "Sous-titre", type: "text" },
      {
        key: "members",
        label: "Membres",
        type: "array",
        subFields: [
          { key: "name", label: "Nom", type: "text" },
          { key: "role", label: "Rôle", type: "text" },
          { key: "photo", label: "URL photo", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      { key: "columns", label: "Colonnes", type: "number", min: 1, max: 4 },
      { key: "backgroundColor", label: "Fond", type: "color" },
      { key: "textColor", label: "Couleur texte", type: "color" },
      { key: "animation", label: "Animation", type: "animation" },
    ],
  },

  faq: {
    label: "FAQ (accordéon)",
    icon: "❓",
    category: "content",
    animations: "wrapper",
    defaults: {
      title: "Questions fréquentes",
      subtitle: "",
      items: [
        {
          question: "Comment se déroule un culte / une célébration ?",
          answer:
            "Décrivez ici le déroulé type : accueil, temps de louange, message et temps de prière.",
        },
      ],
      openFirst: false,
      backgroundColor: "#ffffff",
      textColor: "#064886",
      animation: "fadeIn",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "subtitle", label: "Sous-titre", type: "text" },
      {
        key: "items",
        label: "Questions",
        type: "array",
        subFields: [
          { key: "question", label: "Question", type: "text" },
          { key: "answer", label: "Réponse", type: "textarea" },
        ],
      },
      { key: "openFirst", label: "Première question ouverte", type: "boolean" },
      { key: "backgroundColor", label: "Fond", type: "color" },
      { key: "textColor", label: "Couleur texte", type: "color" },
      { key: "animation", label: "Animation", type: "animation" },
    ],
  },

  stats: {
    label: "Chiffres clés",
    icon: "📊",
    category: "content",
    animations: "wrapper",
    defaults: {
      title: "En quelques chiffres",
      items: [
        { value: "10", label: "Années d'existence" },
        { value: "200", label: "Membres" },
        { value: "5", label: "Groupes actifs" },
      ],
      backgroundColor: "#064886",
      textColor: "#ffffff",
      animation: "fadeIn",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      {
        key: "items",
        label: "Chiffres",
        type: "array",
        subFields: [
          { key: "value", label: "Valeur", type: "text" },
          { key: "label", label: "Libellé", type: "text" },
        ],
      },
      { key: "backgroundColor", label: "Fond", type: "color" },
      { key: "textColor", label: "Couleur texte", type: "color" },
      { key: "animation", label: "Animation", type: "animation" },
    ],
  },

  quote: {
    label: "Citation",
    icon: "💬",
    category: "content",
    animations: "wrapper",
    defaults: {
      quote: "Une citation inspirante à mettre en avant.",
      author: "",
      backgroundColor: "#f8f9fa",
      textColor: "#064886",
      animation: "fadeIn",
    },
    schema: [
      { key: "quote", label: "Citation", type: "textarea" },
      { key: "author", label: "Auteur / source", type: "text" },
      { key: "backgroundColor", label: "Fond", type: "color" },
      { key: "textColor", label: "Couleur texte", type: "color" },
      { key: "animation", label: "Animation", type: "animation" },
    ],
  },

  footer: {
    label: "Footer",
    icon: "📋",
    category: "layout",
    animations: "internal",
    defaults: {
      title: "Il y a une place pour toi !",
      email: "contact@votre-eglise.fr",
      schedule: "Rdv chaque semaine | Horaire à préciser",
      address: "Adresse de votre église à renseigner",
      bgColorStart: "#064886",
      bgColorMid: "#064886",
      bgColorEnd: "#5a9fcf",
      bgColorMobileStart: "#d46269",
      bgColorMobileEnd: "#be4f56",
      fontSize: 19,
      titleFontSize: 24,
      textColor: "#ffffff",
      titleBoldStart: 10,
      titleBoldEnd: 14,
      animation: "none",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "schedule", label: "Horaire", type: "text" },
      { key: "address", label: "Adresse", type: "text" },
      { key: "bgColorStart", label: "Fond dégradé (haut)", type: "color" },
      { key: "bgColorMid", label: "Fond dégradé (milieu)", type: "color" },
      { key: "bgColorEnd", label: "Fond dégradé (bas)", type: "color" },
      { key: "bgColorMobileStart", label: "Fond mobile (haut)", type: "color" },
      { key: "bgColorMobileEnd", label: "Fond mobile (bas)", type: "color" },
      { key: "fontSize", label: "Taille police infos", type: "number", min: 10, max: 48 },
      { key: "titleFontSize", label: "Taille police titre", type: "number", min: 14, max: 72 },
      { key: "textColor", label: "Couleur texte", type: "color" },
      { key: "titleBoldStart", label: "Début gras titre (index)", type: "number", min: 0, max: 50 },
      { key: "titleBoldEnd", label: "Fin gras titre (index)", type: "number", min: 0, max: 50 },
    ],
  },
};

// ─── Visibilité responsive ──────────────────────────────────────────────────
export const VISIBILITY_DEFAULTS = {
  desktop: true,
  tablet: true,
  mobile: true,
};

// ─── Créer un nouveau bloc avec ID unique ───────────────────────────────────
export function createBlock(type, props = {}) {
  if (!BLOCK_TYPES[type]) {
    console.warn(`createBlock: type inconnu "${type}"`);
    return null;
  }
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return {
    id,
    type,
    props: { ...BLOCK_TYPES[type].defaults, ...props },
    visibility: { ...VISIBILITY_DEFAULTS },
  };
}

// ─── Structure de page initiale (accueil) ─────────────────────────────────
export function getDefaultHomePage() {
  return [
    createBlock("hero"),
    createBlock("bienvenue"),
    createBlock("rejoins"),
    createBlock("aspirations"),
    createBlock("vision"),
    createBlock("activities"),
    createBlock("nousRejoindre"),
    createBlock("contact", {
      image: "/images/contact-smartphone.jpg",
      backgroundGradient: "#064886",
    }),
  ]
    .filter(Boolean)
    .map((block, i) => ({ ...block, id: `default-home-${i}` }));
}

export function getDefaultMessagesPage() {
  return [
    createBlock("textImage", {
      title: "Nos messages",
      subtitle: "Cieux Ouverts est aussi en ligne !",
      body: DEFAULT_MESSAGES_BODY,
      image: "/images/messages-laptop.png",
      visualStyle: "messagesLaptop",
      backgroundColor: "#ffffff",
      textColor: "#064886",
      ctaText: "Notre chaine YouTube",
      ctaLink: "https://www.youtube.com/@eglisecieuxouverts",
    }),
    createBlock("youtube", {
      videoId: "wZebQj0gR98",
      title: "Dernier message",
      backgroundColor: DEFAULT_MESSAGES_GRADIENT,
      animation: "fadeIn",
    }),
  ]
    .filter(Boolean)
    .map((block, i) => ({ ...block, id: `default-messages-${i}` }));
}

export function getDefaultPhotosPage() {
  return [
    createBlock("gallery", {
      title: "Galerie photos",
      textColor: "#064886",
      columns: 3,
      images: [
        "/photos/slide-salle.jpg",
        "/photos/slide-mains.jpg",
        "/photos/slide-promenade.jpg",
        "/photos/slide-pizza.jpg",
        "/photos/slide-buffet.jpg",
      ],
    }),
  ]
    .filter(Boolean)
    .map((block, i) => ({ ...block, id: `default-photos-${i}` }));
}

export function getDefaultBilletteriePage() {
  return [
    createBlock("richText", {
      content: `<div style="max-width:820px;margin:0 auto;text-align:center;"><h1 style="font-family:'Playfair Display',Georgia,serif;font-style:italic;color:#064886;">Billetterie Événements</h1><p>Découvrez et réservez vos places pour nos prochains événements.</p><p><strong>Aucun événement pour le moment.</strong></p><p>Revenez bientôt pour de nouvelles dates.</p></div>`,
      backgroundColor: "#ffffff",
      textColor: "#1a1a2e",
      textAlign: "left",
      padding: 70,
      animation: "fadeIn",
    }),
  ]
    .filter(Boolean)
    .map((block, i) => ({ ...block, id: `default-billetterie-${i}` }));
}

export function getDefaultContactPage() {
  return [
    createBlock("contact", {
      title: "Nous contacter",
      addressTitle: "",
      addressLine: "",
      mapEmbedUrl: "",
      backgroundGradient: "#064886",
      showQuestions: false,
      showSocials: false,
    }),
  ]
    .filter(Boolean)
    .map((block, i) => ({ ...block, id: `default-contact-${i}` }));
}

// ─── Pages d'erreur par défaut ─────────────────────────────────────────────
export function getDefaultErrorPage(code = 404) {
  const common = {
    backgroundColor: "#ffffff",
    textColor: "#1a1a2e",
    padding: 70,
    animation: "fadeIn",
  };

  const blocks = [];

  if (code === 404) {
    blocks.push(
      createBlock("richText", {
        content: `<div style="max-width:820px;margin:0 auto;text-align:center;"><h1 style=\"font-family:'Playfair Display',Georgia,serif;color:#064886;\">404 — Page introuvable</h1><p>La page que vous cherchez n'existe pas ou a été déplacée.</p></div>`,
        ...common,
      }),
    );
  } else if (code === 500) {
    blocks.push(
      createBlock("richText", {
        content: `<div style="max-width:820px;margin:0 auto;text-align:center;"><h1 style=\"font-family:'Playfair Display',Georgia,serif;color:#064886;\">500 — Erreur serveur</h1><p>Désolé, une erreur inattendue s'est produite.</p></div>`,
        ...common,
      }),
    );
  } else {
    blocks.push(
      createBlock("richText", {
        content: `<div style="max-width:820px;margin:0 auto;text-align:center;"><h1 style=\"font-family:'Playfair Display',Georgia,serif;color:#064886;\">${code} — Service indisponible</h1><p>Le site est momentanément indisponible. Revenez plus tard.</p></div>`,
        ...common,
      }),
    );
  }

  return blocks
    .filter(Boolean)
    .map((block, i) => ({ ...block, id: `default-error-${code}-${i}` }));
}

function normalizeMessagesBlocks(blocks) {
  return blocks.map((block, index) => {
    if (index === 0 && block.type === "textImage") {
      return {
        ...block,
        props: {
          ...BLOCK_TYPES.textImage.defaults,
          ...block.props,
          title: block.props?.title || "Nos messages",
          subtitle:
            block.props?.subtitle || "Cieux Ouverts est aussi en ligne !",
          body: block.props?.body || DEFAULT_MESSAGES_BODY,
          visualStyle: block.props?.visualStyle || "messagesLaptop",
          backgroundColor: block.props?.backgroundColor || "#ffffff",
          textColor: block.props?.textColor || "#064886",
          ctaText: block.props?.ctaText || "Notre chaine YouTube",
          ctaLink:
            block.props?.ctaLink ||
            "https://www.youtube.com/@eglisecieuxouverts",
        },
      };
    }

    if (
      index === 1 &&
      block.type === "richText" &&
      block.props?.content?.includes("youtube.com/embed")
    ) {
      return {
        ...block,
        props: {
          ...BLOCK_TYPES.richText.defaults,
          ...block.props,
          backgroundGradient:
            block.props?.backgroundGradient || DEFAULT_MESSAGES_GRADIENT,
          backgroundColor: block.props?.backgroundColor || "#ffffff",
          padding:
            block.props?.padding !== undefined ? block.props.padding : 20,
        },
      };
    }

    return block;
  });
}

function normalizeContactBlocks(blocks) {
  const contactBlock = blocks.find((block) => block.type === "contact");
  if (!contactBlock) return blocks;

  const normalizedContact = {
    ...contactBlock,
    props: {
      ...BLOCK_TYPES.contact.defaults,
      ...contactBlock.props,
      title: contactBlock.props?.title || "Nous contacter",
      addressTitle: contactBlock.props?.addressTitle || "",
      addressLine: contactBlock.props?.addressLine || "",
      mapEmbedUrl: contactBlock.props?.mapEmbedUrl || "",
      backgroundGradient: contactBlock.props?.backgroundGradient || "#064886",
      showQuestions: contactBlock.props?.showQuestions ?? false,
      showSocials: contactBlock.props?.showSocials ?? false,
      image: contactBlock.props?.mapEmbedUrl
        ? ""
        : contactBlock.props?.image || "",
    },
  };

  if (
    blocks.length === 3 &&
    blocks[0]?.type === "richText" &&
    blocks[2]?.type === "richText"
  ) {
    return [normalizedContact];
  }

  return blocks.map((block) =>
    block.id === contactBlock.id ? normalizedContact : block,
  );
}

export function normalizePageBlocks(slug, blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0)
    return getDefaultPageBySlug(slug);
  if (slug === "messages") return normalizeMessagesBlocks(blocks);
  if (slug === "contact") return normalizeContactBlocks(blocks);
  return blocks;
}

export function getDefaultPageBySlug(slug) {
  if (slug === "accueil") return getDefaultHomePage();
  if (slug === "messages") return getDefaultMessagesPage();
  if (slug === "photos") return getDefaultPhotosPage();
  if (slug === "event-list") return getDefaultBilletteriePage();
  if (slug === "contact") return getDefaultContactPage();
  return [];
}
