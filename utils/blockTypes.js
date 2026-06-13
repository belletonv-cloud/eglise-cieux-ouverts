/**
 * Page Builder — Définition des types de blocs
 * Chaque bloc a : type, label, icône, props par défaut, schema de propriétés éditables
 */

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
const DEFAULT_CONTACT_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2688.0!2d-3.8275!3d48.5775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4816a3c4e3d89c3b%3A0x1!2s2+Rue+Jean+Monnet%2C+29600+Morlaix!5e0!3m2!1sfr!2sfr!4v1700000000000";

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
      nameImage:
        "https://static.wixstatic.com/media/d65230_556da516fccc4add9424fa0586c62330~mv2.png/v1/crop/x_154,y_2,w_411,h_85/fill/w_575,h_88,fp_0.50_0.50,lg_1,q_85,enc_avif,quality_auto/(NEW)%20Cieux%20Ouverts-01-NL.png",
      logoImage:
        "https://static.wixstatic.com/media/d65230_e393fcbc29d74d8694d53aa88bba03c5~mv2.png/v1/crop/x_0,y_0,w_232,h_132/fill/w_150,h_85,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/g149-8.png",
    },
    schema: [
      { key: "image", label: "Image", type: "image" },
      { key: "nameImage", label: "Image titre", type: "image" },
      { key: "logoImage", label: "Image logo", type: "image" },
      {
        key: "height",
        label: "Hauteur (px)",
        type: "number",
        min: 200,
        max: 900,
      },
      { key: "overlay", label: "Overlay sombre", type: "boolean" },
      { key: "overlayColor", label: "Couleur overlay", type: "color" },
      { key: "overlayText", label: "Texte sur image", type: "text" },
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
      subtitle: "à l'Église Cieux Ouverts à Morlaix",
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
          title: "Célébration dimanche",
          description:
            "Viens célébrer avec nous chaque dimanche !\n\nRejoins-nous pour un moment chaleureux, joyeux dans l'unité et la bienveillance.\n\nAu programme :\n✨ Un accueil convivial autour d’un café offert !\n🎵 Un temps de louange (chants rythmés) et d’adoration (chants plus doux) avec des chants qui disposent le cœur.\n📖 Un message inspirant, délivré par un prédicateur ou le pasteur, pour nourrir ta foi.\n🙏 Un temps de prière, si tu souhaites recevoir un soutien ou partager ton cœur.\n\nRendez-vous chaque semaine :\n\n9h30 : Accueil-café.\n10h00 : Début de la célébration.\n\nEt pour les enfants ?\nDe 1 à 18 ans, ils sont les bienvenus dans des espaces dédiés, encadrés par des moniteurs bienveillants et qualifiés.",
          image:
            "https://static.wixstatic.com/media/d65230_2d9fe5fd35e84c55b202fcf057c136b5~mv2.jpg/v1/fit/w_1920,h_749,q_90,enc_avif,quality_auto/d65230_2d9fe5fd35e84c55b202fcf057c136b5~mv2.jpg",
        },
        {
          title: "Soirée Cieux Ouverts",
          description:
            "Viens expérimenter Sa présence !\n\n🙌 As-tu envie de louer Dieu et de Le célébrer de tout ton être ?\n🙏 Ressens-tu le besoin d’un moment intime avec Lui ?\n❤️‍🩹 Aspires-tu à une guérison, une délivrance ou un nouveau départ ?\n\nNe manque pas nos Soirées Cieux Ouverts, des instants privilégiés où le ciel touche la terre et où la gloire de Dieu transforme les vies.\nUn moment unique pour te connecter à Son cœur et vivre Sa puissance à l'œuvre.\n\n👉 Nous t'attendons avec joie – sois le/la bienvenu(e) !",
          image:
            "https://static.wixstatic.com/media/d65230_9b89ba75fde44af5b2a3c16ee5289376~mv2.png/v1/fit/w_1620,h_632,q_90,enc_avif,quality_auto/d65230_9b89ba75fde44af5b2a3c16ee5289376~mv2.png",
        },
        {
          title: "Groupe de prière",
          description:
            "Unissons nos voix chaque mercredi soir !\n\n🙏Rejoins-nous les mercredis à 20h pour un temps puissant de prières et d’intercessions. \n📣 Ensemble, nous élevons nos voix pour porter devant Dieu les sujets qui touchent nos cœurs et le monde qui nous entoure.\n\nViens participer à ce moment d’impact – ta prière compte !",
          image:
            "https://static.wixstatic.com/media/11062b_9fe8cf7ac275438cafa34f90833b0230~mv2.jpg/v1/fit/w_1920,h_749,q_90,enc_avif,quality_auto/11062b_9fe8cf7ac275438cafa34f90833b0230~mv2.jpg",
        },
        {
          title: "Groupe de marche",
          description:
            "Rejoins-nous pour une marche conviviale chaque mois !\n\nUne belle occasion de :\n🤝 Créer des liens et partager des moments authentiques ensemble.\n🌍 Explorer une nouvelle commune ou un coin pittoresque de notre magnifique région.\n🚶‍♀️ Bouger à ton rythme, avec deux parcours adaptés pour que chacun y trouve son plaisir.\n\nEt si le soleil est au rendez-vous, nous prolongeons la journée avec un pique-nique avant le départ de la randonnée ! 🌞\n\nViens marcher, découvrir et partager avec nous – c’est ouvert à tous !",
          image:
            "https://static.wixstatic.com/media/d65230_1abbcae1fcb64164923e47f431528317~mv2.jpeg/v1/fill/w_1600,h_624,fp_0.54_0.46,q_90,enc_avif,quality_auto/d65230_1abbcae1fcb64164923e47f431528317~mv2.jpeg",
        },
        {
          title: "Groupes de maison",
          description:
            "Des groupes de maison près de chez toi !\n\nRejoins l’un de nos groupes de maison dans les communes de :\n📍 Carhaix\n📍 Pleyber-Christ\n📍 Plouénan\n📍 Plouvorn\n📍 Saint-Martin-des-Champs\n📍 Saint-Pol-de-Léon\n... et d'autres à venir !\n\nCes rencontres conviviales sont l’occasion de :\n💬 Échanger et répondre à tes questions.\n🤝 Partager nos expériences et notre foi.\n✨ Grandir ensemble dans la découverte de Christ.\n\nCes groupes sont ouverts à tous, en particulier aux personnes qui explorent leur cheminement spirituel ou souhaitent en savoir plus sur Jésus.\n\nViens comme tu es, une place t’attend !",
          image:
            "https://static.wixstatic.com/media/11062b_d5951c2579bf4eeca8372bc1d7baedb7~mv2.jpeg/v1/fit/w_1920,h_749,q_90,enc_avif,quality_auto/11062b_d5951c2579bf4eeca8372bc1d7baedb7~mv2.jpeg",
        },
        {
          title: "Soirée femmes",
          description:
            "Rejoins les SentinElles !\n\nℹ️ Un jeudi par mois, de 18h30 à 21h, le groupe des SentinElles se rassemble pour vivre des moments uniques entre femmes.\n\n💬 C'est l'occasion de plonger dans des thèmes bibliques inspirants, d'échanger librement et de partager des expériences qui nous enrichissent mutuellement. 💫\n\nViens comme tu es, avec ton histoire, ton énergie ou ta curiosité – il y a une place pour toi parmi nous ! ✨",
          image:
            "https://static.wixstatic.com/media/d65230_10839e8f0d4d4800ad28b2639c618f21~mv2.jpeg/v1/fit/w_1600,h_624,q_90,enc_avif,quality_auto/d65230_10839e8f0d4d4800ad28b2639c618f21~mv2.jpeg",
        },
        {
          title: "Jeunesse",
          description:
            'Les "Potentiel" : un groupe pour les 12-18 ans !\n\nUn espace dédié aux ados pour :\n❓ Partager leurs questionnements et explorer leur foi en toute liberté.\n✨ Vivre des expériences fortes, qui marquent et transforment.\n🌱 Grandir ensemble, en apprenant à s’épanouir dans leur potentiel.\n🎉 Et surtout, s’amuser et créer des souvenirs mémorables !\n\nDes moments uniques pour se connecter, se découvrir et avancer dans un cadre bienveillant.\n\nSi tu as entre 12 et 18 ans, ce groupe est fait pour toi – viens nous rejoindre !',
          image:
            "https://static.wixstatic.com/media/d65230_c2d4e37821764562bf9a976f456fa24c~mv2.jpeg/v1/fill/w_1600,h_624,fp_0.46_0.56,q_90,enc_avif,quality_auto/d65230_c2d4e37821764562bf9a976f456fa24c~mv2.jpeg",
        },
        {
          title: "Repas partagé",
          description:
            "Repas partagé – chaque dernier dimanche du mois !\n\nUn moment chaleureux et convivial où :\n🍲 Chacun apporte un plat, une boisson et/ ou un dessert à partager.\n🍽️ Un grand buffet est installé pour que tout le monde puisse se servir librement.\n🤝 Nous profitons ensemble d’un temps de communion fraternelle, riche en échanges et en joie.\n\nViens vivre ce moment de partage – ouvert à tous, dans une ambiance familiale et accueillante !",
          image:
            "https://static.wixstatic.com/media/d65230_c7db696eb12f40748cf1d0df7c998c59~mv2.jpg/v1/fill/w_1920,h_749,fp_0.52_0.24,q_90,enc_avif,quality_auto/d65230_c7db696eb12f40748cf1d0df7c998c59~mv2.jpg",
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
  },

  rejoins: {
    label: "Rejoins-nous",
    icon: "🤝",
    category: "content",
    animations: "internal",
    defaults: {
      title: "Rejoins-nous",
      subtitle: "Chaque dimanche",
      location: "à Morlaix",
      horaires: [
        { heure: "9h30", label: "Accueil café" },
        { heure: "10h00", label: "Célébration" },
      ],
      backgroundGradient:
        "linear-gradient(to bottom, #064886 0%, #e58b8b 100%)",
      animation: "none",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "subtitle", label: "Sous-titre", type: "text" },
      { key: "location", label: "Lieu", type: "text" },
      { key: "backgroundGradient", label: "Fond (CSS)", type: "text" },
      { key: "horaires", label: "Horaires", type: "array" },
      { key: "animation", label: "Animation", type: "animation" },
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
        "Accueillir et vivre l'unité",
        "Célébrer et cultiver la présence de Dieu",
        "Accompagner et restaurer les vies",
        "Témoigner et former des disciples",
      ],
      backgroundColor: "#064886",
      textColor: "#ffffff",
      animation: "zoom",
    },
    schema: [
      { key: "title", label: "Titre", type: "text" },
      { key: "items", label: "Aspirations", type: "array" },
      { key: "backgroundColor", label: "Fond", type: "color" },
      { key: "textColor", label: "Couleur texte", type: "color" },
      { key: "animation", label: "Animation citation", type: "animation" },
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
        "Voir la gloire, le royaume et la volonté de Dieu\nse manifester sur la terre comme aux Cieux",
      ctaText: "",
      ctaLink: "",
      backgroundGradient: "#f8f9fa",
      textColor: "#064886",
      animation: "none",
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

  footer: {
    label: "Footer",
    icon: "📋",
    category: "layout",
    animations: "internal",
    defaults: {
      title: "Il y a une place pour toi !",
      email: "contact@cieuxouverts.bzh",
      schedule: "Rdv chaque dimanche | 10H",
      address: "2 rue Jean Monnet | 29600 Morlaix, Bretagne",
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
      image:
        "https://static.wixstatic.com/media/11062b_c518f30e29fa44f0b424cabfdd0b5a6a~mv2.jpg/v1/fill/w_147,h_246,al_c,q_80,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Smartphone%20en%20main.jpg",
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
      image:
        "https://static.wixstatic.com/media/d65230_4715cdbb28a040dda63d2bcc671903c4~mv2.png/v1/fill/w_890,h_564,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/2.png",
      visualStyle: "messagesLaptop",
      backgroundColor: "#ffffff",
      textColor: "#064886",
      ctaText: "Notre chaine YouTube",
      ctaLink: "https://www.youtube.com/@eglisecieuxouverts",
    }),
    createBlock("richText", {
      content: `<div style="max-width:900px;margin:0 auto;text-align:center;"><h2 style="font-family:'Playfair Display',Georgia,serif;font-style:italic;color:#064886;">Dernier message</h2><div style="position:relative;width:100%;padding-bottom:56.25%;"><iframe src="https://www.youtube.com/embed/wZebQj0gR98" title="Dernier message" style="position:absolute;inset:0;width:100%;height:100%;border:none;" allowfullscreen></iframe></div></div>`,
      backgroundGradient: DEFAULT_MESSAGES_GRADIENT,
      textColor: "#064886",
      textAlign: "left",
      padding: 20,
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
      addressTitle: "Eglise Cieux Ouverts",
      addressLine: "2 rue Jean Monnet | 29600 Morlaix",
      mapEmbedUrl: DEFAULT_CONTACT_MAP_EMBED_URL,
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
      addressTitle: contactBlock.props?.addressTitle || "Eglise Cieux Ouverts",
      addressLine:
        contactBlock.props?.addressLine || "2 rue Jean Monnet | 29600 Morlaix",
      mapEmbedUrl:
        contactBlock.props?.mapEmbedUrl || DEFAULT_CONTACT_MAP_EMBED_URL,
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
