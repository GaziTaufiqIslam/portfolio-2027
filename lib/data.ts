// ─── Types ───────────────────────────────────────────────────────────────────

export interface Chip {
  label: string
}

/**
 * One full-width image in a work page's main column.
 *
 * To give an image a sidebar (scrollspy) link, add `nav`. The link is built from
 * it automatically and jumps to this exact image. Images without `nav` simply
 * render with no link.
 */
export interface WorkImage {
  src: string
  /**
   * The file's pixel size. Images render at full column width with their own
   * proportions, and this reserves the right space before they load so the
   * sidebar jumps land in the correct place.
   */
  width: number
  height: number
  /** Describe the image for screen readers. Leave out if it's purely decorative. */
  alt?: string
  /** Adds a sidebar link pointing at this image. `anchor` must be unique within the project. */
  nav?: { label: string; anchor: string }
  /** Render this image blurred behind the "under NDA" message. */
  nda?: boolean
}

export interface WorkMeta {
  industry: string
  role: string
  timeline: string
  tools: { name: string; icon: string }[]
}

export interface WorkProject {
  slug: string
  overline: string              // e.g. "UX Design Internship"
  org: string                   // display name
  orgLogo: string               // path in /public/images/logo/
  title: string
  subtitle: string
  heroImage: string             // path in /public/images/work/
  chips: Chip[]
  // Home card body copy (Figma: card-body-main + hook line)
  body?: string                 // main description paragraph
  hook?: string                 // closing "If you are looking for…" line
  meta: WorkMeta
  badge?: string
  /** Ordered full-width images in the main column. Sidebar links come from each image's `nav`. */
  bodyImages: WorkImage[]
}

export interface SideQuestProject {
  id: string
  image: string
  /** Optional clip that plays in a loop while the thumbnail is hovered */
  video?: string
  caption: string
  chips: Chip[]
}

// ─── Work Projects ───────────────────────────────────────────────────────────

export const workProjects: WorkProject[] = [
  {
    slug: 'amadeus-ux',
    overline: 'UX Design Internship',
    org: 'Amadeus',
    orgLogo: '/images/logo/amadeus-logo-small.svg',
    title: 'Making complex user journeys easier to navigate through clear and consistent UX communication',
    subtitle:
      'How we audited the user journeys & applied systems thinking to craft a UX language strategy for a complex B2B enterprise product',
    body: 'Amadeus Central Reservation System (ACRS) grew back-to-front by merging different hospitality based customer products, leading to complex hierarchy and navigation issues. I applied systems thinking and audited the user journeys to craft a language strategy. Which is being used to create patterns & components for a unified Hospitality design system for 16+ products.',
    hook: 'If you are looking for someone who can decode complex network to simple actional steps, this project shows how I think and achieve it.',
    heroImage: '/images/work/amadeus-ux/amadeus-ux-hero.png',
    chips: [
      { label: 'Design System' },
      { label: 'B2B' },
      { label: 'SaaS' },
      { label: 'Hospitality' },
      { label: 'WCAG' },
      { label: 'A11Y' },
      { label: 'Graduation Project' },
      { label: 'Language Strategy' },
    ],
    meta: {
      industry: 'Hospitality',
      role: 'UX Design Intern\n(UX Writer & Language Strategist)',
      timeline: '6 months',
      tools: [
        { name: 'Figma',  icon: '/images/tools/tool-figma.svg' },
        { name: 'GitHub Copilot', icon: '/images/tools/tool-github-copilot.svg' },
      ],
    },
    bodyImages: [
      { src: '/images/work/amadeus-ux/amadeus-ux-01.png', width: 1116, height: 628, nav: { label: 'About Amadeus', anchor: 'about-amadeus' } },
      { src: '/images/work/amadeus-ux/amadeus-ux-02.png', width: 1116, height: 482, nav: { label: 'Overview',      anchor: 'overview' } },
      { src: '/images/work/amadeus-ux/amadeus-ux-03.png', width: 1116, height: 732, nav: { label: 'Challenge',     anchor: 'Challenge' } },
      { src: '/images/work/amadeus-ux/amadeus-ux-04.png', width: 1164, height: 814, nda: true },
    ],
  },
  {
    slug: 'amadeus-errors',
    overline: 'UX Design Internship',
    org: 'Amadeus',
    orgLogo: '/images/logo/amadeus-logo-small.svg',
    title: 'Turning Cryptic Backend Errors into Actionable Recovery Flows Using Real-User Telemetry & API Refracting',
    subtitle: 'Using Datadog RUM telemetry, session recordings, and heatmaps, I transformed cryptic system errors into clear, actionable recovery experiences. I then partnered with PMs and developers to refactor the APIs.',
    body: 'Developer-centric APIs led to cryptic errors codes. Users were forced into training manuals and numerous support tickets. I used DataDog RUM live telemetry, recordings and heatmaps to designed instant, user-centered, and  frictionless error recovery. Then collaborated with PMs and Devs to refactor APIs and shipped Figma-to-Angular UI using Kiro (Agentic AI IDE).',
    hook: 'If you are looking for a product designer who speaks the developers language and can ship directly in code, then this project shows how I do it.',
    heroImage: '/images/work/amadeus-errors/amadeus-errors-hero.png',
    chips: [
      { label: 'UX Writing' },
      { label: 'Error Recovery' },
      { label: 'SaaS' },
      { label: 'API Refactoring' },
      { label: 'DataDog RUM' },
      { label: 'Hospitality' },
      { label: 'Angular' },
    ],
    meta: {
      industry: 'Hospitality',
      role: 'UX Design Intern',
      timeline: '3 months',
      tools: [
        { name: 'DataDog', icon: '/images/tools/tool-datadog.svg' },
        { name: 'GitHub Copilot', icon: '/images/tools/tool-github-copilot.svg' },
        { name: 'Kiro', icon: '/images/tools/tool-kiro.svg' },
      ],
    },
    bodyImages: [
      { src: '/images/work/amadeus-errors/amadeus-errors-01.png', width: 1116, height: 628, nav: { label: 'About Amadeus', anchor: 'about-amadeus' } },
      { src: '/images/work/amadeus-errors/amadeus-errors-02.png', width: 1116, height: 482, nav: { label: 'Overview',      anchor: 'overview' } },
      { src: '/images/work/amadeus-errors/amadeus-errors-03.png', width: 1116, height: 732, nav: { label: 'Challenge',          anchor: 'Challenge' } },
      { src: '/images/work/amadeus-errors/amadeus-errors-04.png', width: 1164, height: 814, nda: true },
    ],
  },
  {
    slug: 'kafego',
    overline: 'M.Des. Classroom Project',
    org: 'NID',
    orgLogo: '/images/logo/nid-logo.svg',
    title: 'Designing the Service of a 10-minute Quick-Commerce Korean Food Delivery App with a System Thinking Approach',
    subtitle: 'How optimising systems enabled authentic dining ritual without breaking the instant food delivery logistics model',
    body: 'Used system thining and business strategy to imagine the service of .  a 10-minute quick-commerce app. The aim was to create a greenfield, data-forecasted deliver service and mobile UX with target of high AOV through collaborative marketing strategy.',
    hook: 'If you are looking for someone who can take an idea to a real-product, this project shows how I work.',
    heroImage: '/images/work/kafego/kafego-hero.png',
    chips: [
      { label: 'Mobile UX' },
      { label: 'Systems Thinking' },
      { label: 'D2C' },
      { label: 'Service Design' },
      { label: 'Quick Commerce' },
      { label: 'UI Design' },
    ],
    meta: {
      industry: 'Food & Delivery',
      role: 'UX & Service Designer',
      timeline: '4 months',
      tools: [
        { name: 'Miro',              icon: '/images/tools/tool-miro.svg' },
        { name: 'Figma',             icon: '/images/tools/tool-figma.svg' },
        { name: 'Adobe Illustrator', icon: '/images/tools/tool-ai.svg' },
        { name: 'Adobe Photoshop',   icon: '/images/tools/tool-ps.svg' },
        { name: 'Gemini',            icon: '/images/tools/tool-gemini.svg' },
        { name: 'ChatGPT',           icon: '/images/tools/tool-chatgpt.svg' },
      ],
    },
    bodyImages: [
      { src: '/images/work/kafego/kafego-challenge-solution.png', width: 1920, height: 2858, alt: 'Challenge and solution overview', nav: { label: 'Overview', anchor: 'overview' } },
      { src: '/images/work/kafego/ch-01__p-01.png', width: 1920, height: 1853, alt: 'Research image 1', nav: { label: 'Research', anchor: 'research' } },
      { src: '/images/work/kafego/ch-01__p-02.png', width: 1920, height: 837, alt: 'Research image 2' },
      { src: '/images/work/kafego/ch-01__p-03.png', width: 1920, height: 2616, alt: 'Research image 3' },
      { src: '/images/work/kafego/ch-01__p-04.png', width: 1920, height: 818, alt: 'Research image 4' },
      { src: '/images/work/kafego/ch-01__p-05.png', width: 1920, height: 644, alt: 'Research image 5' },
      { src: '/images/work/kafego/ch-01__p-06.png', width: 1920, height: 800, alt: 'Research image 6' },
      { src: '/images/work/kafego/ch-02__p-01.png', width: 1920, height: 1899, alt: 'Service design image 1', nav: { label: 'Service Design', anchor: 'service-design' } },
      { src: '/images/work/kafego/ch-02__p-02.png', width: 1920, height: 1476, alt: 'Service design image 2' },
      { src: '/images/work/kafego/ch-02__p-03.png', width: 1920, height: 1025, alt: 'Service design image 3' },
      { src: '/images/work/kafego/ch-03__p-01.png', width: 1920, height: 590, alt: 'Users image 1', nav: { label: 'User Research', anchor: 'users' } },
      { src: '/images/work/kafego/ch-03__p-02.png', width: 1280, height: 789, alt: 'Users image 2' },
      { src: '/images/work/kafego/ch-03__p-03.png', width: 1280, height: 2600, alt: 'Users image 3' },
      { src: '/images/work/kafego/ch-04__p-01.png', width: 1280, height: 610, alt: 'Value proposition image 1', nav: { label: 'Value Proposition', anchor: 'value-proposition' } },
      { src: '/images/work/kafego/ch-04__p-02.png', width: 1280, height: 702, alt: 'Value proposition image 2' },
      { src: '/images/work/kafego/ch-05__p-01.png', width: 1280, height: 813, alt: 'Business model image', nav: { label: 'Business Model', anchor: 'business-model' } },
      { src: '/images/work/kafego/ch-06__p-01.png', width: 1920, height: 1437, alt: 'Logo design image 1', nav: { label: 'Logo Design', anchor: 'logo-design' } },
      { src: '/images/work/kafego/ch-06__p-02.png', width: 1920, height: 1862, alt: 'Logo design image 2' },
      { src: '/images/work/kafego/ch-06__p-03.png', width: 1920, height: 1271, alt: 'Logo design image 3' },
      { src: '/images/work/kafego/ch-06__p-04.png', width: 1920, height: 2549, alt: 'Logo design image 4' },
      { src: '/images/work/kafego/ch-06__p-05.png', width: 1920, height: 1595, alt: 'Logo design image 5' },
      { src: '/images/work/kafego/ch-06__p-06.png', width: 1920, height: 1890, alt: 'Logo design image 6' },
      { src: '/images/work/kafego/ch-06__p-07.png', width: 1920, height: 2016, alt: 'Logo design image 7' },
      { src: '/images/work/kafego/ch-06__p-08.png', width: 1920, height: 2310, alt: 'Logo design image 8' },
      { src: '/images/work/kafego/title-label.png', width: 1920, height: 551, alt: 'Branding image 1', nav: { label: 'Branding', anchor: 'branding' } },
      { src: '/images/work/kafego/brand-photography-01.png', width: 2560, height: 1586, alt: 'Branding image 2' },
      { src: '/images/work/kafego/logo-construction.png', width: 2560, height: 1478, alt: 'Branding image 3' },
      { src: '/images/work/kafego/bag-mockup.png', width: 2560, height: 1644, alt: 'Branding image 4' },
      { src: '/images/work/kafego/ios-app-icon-mockup.png', width: 1280, height: 822, alt: 'Branding image 5' },
      { src: '/images/work/kafego/colours.png', width: 2560, height: 1230, alt: 'Branding image 6' },
      { src: '/images/work/kafego/bag-designs.png', width: 2560, height: 1092, alt: 'Branding image 7' },
      { src: '/images/work/kafego/social-media-creatives.png', width: 2560, height: 970, alt: 'Branding image 8' },
      { src: '/images/work/kafego/typeface.png', width: 2560, height: 1308, alt: 'Branding image 9' },
      { src: '/images/work/kafego/brand-photography-02.png', width: 2560, height: 1708, alt: 'Branding image 10' },
      { src: '/images/work/kafego/illustrations.png', width: 2560, height: 2432, alt: 'Branding image 11' },
      { src: '/images/work/kafego/gable-box.png', width: 2560, height: 1708, alt: 'Branding image 12' },
      { src: '/images/work/kafego/brand-photography-03.png', width: 2560, height: 1308, alt: 'Branding image 13' },
      { src: '/images/work/kafego/ch-08__p-01.png', width: 1920, height: 1727, alt: 'UI design image 1', nav: { label: 'UI Design', anchor: 'ui-design' } },
      { src: '/images/work/kafego/ch-08__p-02.png', width: 1920, height: 1320, alt: 'UI design image 2' },
      { src: '/images/work/kafego/ch-08__p-03.png', width: 1920, height: 2142, alt: 'UI design image 3' },
      { src: '/images/work/kafego/ch-08__p-04.png', width: 1920, height: 1800, alt: 'UI design image 4' },
      { src: '/images/work/kafego/ch-08__p-05.png', width: 1920, height: 1800, alt: 'UI design image 5' },
      { src: '/images/work/kafego/ch-08__p-06.png', width: 1920, height: 1548, alt: 'UI design image 6' },
      { src: '/images/work/kafego/ch-08__p-07.png', width: 1920, height: 1956, alt: 'UI design image 7' },
      { src: '/images/work/kafego/ch-08__p-08.png', width: 1920, height: 705, alt: 'UI design image 8' },
    ],
  },
  {
    slug: 'nid-classroom',
    overline: 'M.Des. Classroom Project',
    org: 'NID',
    orgLogo: '/images/logo/nid-logo.svg',
    title: 'Engineered a Phygital In-store Assistant Providing Instant and Unbiased Skincare Information',
    subtitle: 'How a digital kiosk in a retail store help users validate their choices and increase confidence in purchases',
    body: 'I designed and engineered a phygital retail kiosk to reduce in-store confusion and increase confidence for purchasers. I combined ESP32/Arduino microcontroller, ultrasonic sensors, NeoPixel feedback, and video-based Machine Learning to identify picked-up products and render real-time, unbiased breakdowns in an interactive p5.js based UI.',
    hook: 'If you are looking for someone who is a fast-learner who loves to tinker with upcoming technology, then this project shows exactly how much I love new media integrations.',
    heroImage: '/images/work/clarity-shelf/clarity-shelf-hero.png',
    chips: [
      { label: 'Retail' },
      { label: 'Programming' },
      { label: 'Arduino' },
      { label: 'Microcontrollers' },
      { label: 'ML/AI' },
      { label: 'UI Engineering' },
      { label: 'Interaction Design' },
    ],
    meta: {
      industry: 'Retail',
      role: 'Interaction Designer & Engineer',
      timeline: '1 week',
      tools: [
        { name: 'SketchUp',   icon: '/images/tools/tool-sketchup.svg' },
        { name: 'Figma',      icon: '/images/tools/tool-figma.svg' },
        { name: 'p5.js',      icon: '/images/tools/tool-p5js.png' },
        { name: 'Arduino',    icon: '/images/tools/tool-arduino.svg' },
        { name: 'Rive',       icon: '/images/tools/tool-rive.svg' },
        { name: 'Premiere',   icon: '/images/tools/tool-premiere.svg' },
        { name: 'VS Code',    icon: '/images/tools/tool-vscode.svg' },
        { name: 'Gemini',     icon: '/images/tools/tool-gemini.svg' },
      ],
    },
    badge: 'Showcased at SAP Impulsé\'25',
    bodyImages: [
      { src: '/images/work/clarity-shelf/clarity-shelf-01.png', width: 1440, height: 2616, alt: 'Overview', nav: { label: 'Overview', anchor: 'overview' } },
      { src: '/images/work/clarity-shelf/clarity-shelf-02.png', width: 1440, height: 4230, alt: 'Process image 1', nav: { label: 'Process', anchor: 'process' } },
      { src: '/images/work/clarity-shelf/clarity-shelf-03.png', width: 1440, height: 5166, alt: 'Process image 2', nav: { label: 'Result', anchor: 'results' }  },
    ],
  },
]

// ─── Side Quests ─────────────────────────────────────────────────────────────

export const sideQuests: SideQuestProject[] = [
  {
    id: 'photography-nid',
    image: '/images/sidequest/photography-thumb.png',
    caption: 'Photography, Videography & Post-production for Classroom Projects and NID Blr\'s Social Media',
    chips: [
      { label: 'Photography' },
      { label: 'Premiere Pro' },
      { label: 'Social Media' },
    ],
  },
  {
    id: 'rubiks-cube',
    image: '/images/sidequest/rubiks-cube.png',
    video: '/images/sidequest/cube-anim.mp4',
    caption: 'Rubik\'s Cube 3d Countdown Animation for Dfrost\'25 (NID Blr\'s Design Fest)',
    chips: [
      { label: 'Animation' },
      { label: 'Motion Graphics' },
      { label: 'Spline3d' },
    ],
  },
  {
    id: 'memory-forest',
    image: '/images/sidequest/AR-project.png',
    caption: "'Memory Forest' for Google Maps – A Geolocation based Collection (like Pokémon Go) AR Experience created in Unity",
    chips: [
      { label: 'AR/VR' },
      { label: 'Experience Design' },
      { label: 'Game Design' },
      { label: 'Unity' },
    ],
  },
  {
    id: 'window-display',
    image: '/images/sidequest/lighting-display.png',
    caption: 'Built a Window Display for Sepoy&Co as part of Lighting Workshop at NID Blr',
    chips: [
      { label: 'Lighting' },
      { label: 'Product Design' },
      { label: 'Branding' },
    ],
  },
  {
    id: 'dfrost-poc',
    image: '/images/sidequest/dfrost-poc.png',
    caption: "Designed the Brand Guidelins and acted as the POC for Graphics and Social Media Team for D'frost 2025",
    chips: [
      { label: 'Graphic Design' },
      { label: 'Branding' },
      { label: 'People Management' },
      { label: 'Team Leader' },
    ],
  },
  
]

// ─── About page ──────────────────────────────────────────────────────────────

export interface AboutPhoto {
  src: string
  /** The file's pixel size (used for its proportions on small screens) */
  width: number
  height: number
  alt: string
  /** Rough share of the viewport width the photo takes: on large screens, and on small screens */
  lgVw: number
  smVw: number
}

export const aboutPhotos = {
  portraitMural: {
    src: '/images/about-me/portrait-mural.png', width: 387, height: 483,
    alt: 'Portrait of a man with arms crossed, standing in front of a colourful mural',
    lgVw: 18, smVw: 50,
  },
  portraitLookingUp: {
    src: '/images/about-me/portrait-looking-up.png', width: 387, height: 764,
    alt: 'A man in a cap and light shirt looking upwards, holding a tote bag',
    lgVw: 18, smVw: 50,
  },
  armchair: {
    src: '/images/about-me/armchair.png', width: 818, height: 629,
    alt: 'A man sitting in a yellow armchair next to a window',
    lgVw: 38, smVw: 100,
  },
  groupTable: {
    src: '/images/about-me/group-table.png', width: 1017, height: 606,
    alt: 'A group of friends gathered around a round table in a garden café',
    lgVw: 47, smVw: 100,
  },
  sunsetTerrace: {
    src: '/images/about-me/sunset-terrace.png', width: 863, height: 606,
    alt: 'Two people walking along a terrace under a dusky purple sky',
    lgVw: 40, smVw: 100,
  },
  reading: {
    src: '/images/about-me/reading.png', width: 464, height: 713,
    alt: 'A man leaning on a wall, reading a book',
    lgVw: 22, smVw: 100,
  },
  stairs: {
    src: '/images/about-me/stairs.png', width: 539, height: 725,
    alt: 'A dim corridor with a staircase and pink and orange lighting',
    lgVw: 25, smVw: 100,
  },
  motorbikeGauge: {
    src: '/images/about-me/motorbike-gauge.png', width: 818, height: 510,
    alt: 'Close-up of the round digital gauge on a Harley-Davidson motorcycle',
    lgVw: 38, smVw: 100,
  },
  galleryGroup: {
    src: '/images/about-me/gallery-group.png', width: 597, height: 342,
    alt: 'Four people posing together in an art gallery',
    lgVw: 28, smVw: 50,
  },
  nightPortrait: {
    src: '/images/about-me/night-portrait.png', width: 413, height: 477,
    alt: 'A man in a cap at night with palm trees behind him',
    lgVw: 19, smVw: 50,
  },
  sketch: {
    src: '/images/about-me/sketch.png', width: 510, height: 590,
    alt: 'A pencil sketch of a jerry can on paper, with pens beside it',
    lgVw: 24, smVw: 50,
  },
  fishingNets: {
    src: '/images/about-me/fishing-nets.png', width: 641, height: 473,
    alt: 'Chinese fishing nets silhouetted over the water at dusk',
    lgVw: 30, smVw: 50,
  },
} satisfies Record<string, AboutPhoto>

export interface AboutText {
  heading: string
  /** One entry per paragraph */
  paragraphs: string[]
}

export const aboutText = {
  systems: {
    heading: 'Think in Systems X Human in the Centre',
    paragraphs: [
      'I love making things with my hand, be it in a workshop or sitting on a desk with a laptop.',
      'My background is a bit of a mixed bag. First, I spent five years studying computer science and engineering. Applied those knowledge in making web sites for people.',
      'Now, I am finishing my Masters of Design in Retail Experience at National Institute of Design, Bangalore. This path taught me to think like a coder in systems and connections, but build for the real people.',
    ],
  },
  business: {
    heading: 'Not just Pretty Screens but Business Goals & Metrics',
    paragraphs: [
      'Before design school, I ran my own design and tech studio, kind of a startup, for three years. It was incredibly hands-on work. I managed everything between client negotiations, project management, social media strategy to visual content creation.',
      'That experience showed me exactly how product strategy and user trust play out in the real world. Today, I use those same practical skills across all my work. I design user interfaces, build interactive hardware prototypes and even create content.',
    ],
  },
  keepsMeGoing: {
    heading: 'What keeps me going',
    paragraphs: [
      'Riding motorcycles gives me way more energy than caffeine. In weekends I play football and in the evening I shout for the not-so table toppers english club Manchester United.',
      'I watch a ton of movies, some of the people whose works I follow closely are Satyajit Ray, Wes Anderson and the Ghibli Studio. All these not only give me inspiration to create something new but helps me think in more ways than one.',
      'I play relaxing but mind-intensive sim-games, create Pinterest boards of just random things that have a common pattern, sketch in monochrome, read fiction (specially thrillers and mysteries) and also poetry, mostly in my native tongue Bangla.',
    ],
  },
} satisfies Record<string, AboutText>
