export const profile = {
  name: "Hitesh Ahire",
  role: "Full Stack Software Engineer",
  stack: "Laravel · Next.js · NestJS · React.js · Vue.js",
  location: "Nashik, Maharashtra, India",
  email: "hiteshahire4887@gmail.com",
  phone: "+91 9168823775",
  phoneHref: "+919168823775",
  whatsapp: "https://wa.me/919168823775",
  linkedin: "https://www.linkedin.com/in/hitesh-ahire-b85aa2235/",
  github: "https://github.com/hiteshahire",
  blog: "https://sustainixsh.com",
  instagram: "https://www.instagram.com/ns_rdr_hit",
  site: "https://hiteshahire.in",
  summary:
    "Full Stack Software Engineer with 4+ years architecting, developing, and deploying scalable web applications, enterprise SaaS platforms, CRM systems, and high-traffic consumer products. Fluent across Laravel, NestJS, and Node.js on the backend and Next.js, React and Vue on the front — with a track record of leading teams, shipping government-grade infrastructure, and keeping systems fast under real load.",
  stats: [
    { value: "4+", label: "Years Experience" },
    { value: "20+", label: "Projects Shipped" },
    { value: "6+", label: "Engineers Led" },
    { value: "35%", label: "API Latency Cut" },
  ],
};

export const experience = [
  {
    role: "Full Stack Software Developer",
    company: "DMS Genix",
    location: "Nashik, India",
    period: "Dec 2025 — Present",
    current: true,
    stack: ["Laravel", "Next.js", "NestJS", "React.js", "MySQL", "JWT", "Firebase"],
    points: [
      "Architected multi-tenant matrimony and SaaS platforms serving tens of thousands of concurrent users.",
      "Built resilient RESTful microservices in NestJS and Laravel powering multiple web and mobile clients.",
      "Lifted Core Web Vitals via Next.js SSR and dynamic code-splitting across every public route.",
      "Cut API latency 35%+ through indexed MySQL schemas and query optimization.",
      "Shipped JWT + Firebase auth with MFA and fine-grained role-based access control.",
    ],
  },
  {
    role: "Project Team Lead & Senior Full Stack Engineer",
    company: "Nullplex Software",
    location: "Nashik, India",
    period: "Sept 2024 — Dec 2025",
    current: false,
    stack: ["Laravel", "Vue.js", "MySQL", "Razorpay", "QFix", "Agile"],
    points: [
      "Led a team of 6+ developers delivering government and enterprise-critical software.",
      "Spearheaded the NMC Water Tax Management System — automated tax calculation, billing, and public payment collection for Nashik Municipal Corporation.",
      "Integrated Razorpay and QFix, reconciling thousands of daily transactions via webhooks.",
      "Built multilingual citizen portals and admin back-offices in English and Marathi.",
      "Mentored junior developers through code review and Git-flow discipline.",
    ],
  },
  {
    role: "Full Stack Web Developer",
    company: "Aspire Webs",
    location: "Nashik, India",
    period: "Mar 2023 — Aug 2024",
    current: false,
    stack: ["Laravel", "React.js", "Vue.js", "MySQL", "REST APIs"],
    points: [
      "Developed modular CRM solutions and custom admin dashboards with data visualizations.",
      "Built reusable Vue.js and React.js component libraries, speeding deployment by 35%.",
      "Wrote Laravel REST APIs for real-time data exchange, queue jobs, and third-party integrations.",
      "Diagnosed and fixed production bugs, security gaps, and DB bottlenecks in legacy code.",
    ],
  },
  {
    role: "Full Stack Developer Intern",
    company: "Naresh IT",
    location: "Hyderabad / Remote, India",
    period: "Jan 2022 — Jul 2022",
    current: false,
    stack: ["PHP", "MySQL", "JavaScript", "MVC"],
    points: [
      "Hands-on training in full-stack engineering, OOP PHP, and relational database design.",
      "Built end-to-end CRUD applications on clean MVC architecture and REST API specs.",
    ],
  },
];

export const skillGroups = [
  {
    label: "Backend",
    items: ["Laravel (PHP)", "NestJS", "Node.js", "Express.js", "REST APIs", "Microservices", "MVC"],
  },
  {
    label: "Frontend",
    items: ["Next.js", "React.js", "Vue.js", "TypeScript", "JavaScript (ES6+)", "Tailwind CSS"],
  },
  {
    label: "Data & Storage",
    items: ["MySQL", "PostgreSQL", "Schema Design", "Query Optimization", "Indexing"],
  },
  {
    label: "Auth & Security",
    items: ["JWT", "Firebase Auth", "OAuth 2.0", "2FA", "RBAC", "API Encryption"],
  },
  {
    label: "Payments & Integrations",
    items: ["Razorpay", "Instamojo", "QFix Gateway", "Webhooks", "Third-Party APIs"],
  },
  {
    label: "DevOps & Tools",
    items: ["Linux/Unix", "cPanel", "WHM API", "CI/CD", "Git", "Postman", "Vite"],
  },
];

export const projects = [
  {
    title: "NMC Water Tax Management System",
    tag: "Government Project",
    description:
      "Smart-city billing platform for Nashik Municipal Corporation — automated tax calculation, QFix payments, PDF bills, and bilingual (English/Marathi) citizen portals.",
    stack: ["Laravel", "Vue.js", "MySQL", "QFix", "Razorpay"],
    href: null,
  },
  {
    title: "96 Kuli Maratha Matrimony",
    tag: "SaaS Platform",
    description:
      "Advanced matchmaking platform with real-time chat, weighted search, secure profiles, and personalized recommendations at scale.",
    stack: ["Next.js", "NestJS", "MySQL", "JWT"],
    href: "https://96kulimarathamarriage.com/",
  },
  {
    title: "Jain Matrimony Bureau",
    tag: "SaaS Platform",
    description:
      "Premium matchmaking product with real-time features, secure authentication, and a performance budget tuned for a high-intent user base.",
    stack: ["React", "Laravel", "MySQL", "Firebase"],
    href: "https://jainmatrimonybureau.com/",
  },
  {
    title: "MechManager",
    tag: "SaaS Platform",
    description:
      "Workshop and vehicle management system — inventory tracking, digital job cards, and automated invoicing that cuts manual errors.",
    stack: ["Laravel", "Vue.js", "MySQL"],
    href: "https://www.mechmanager.com/",
  },
  {
    title: "Lantern Enterprise CRM",
    tag: "Field Service",
    description:
      "Ticketing, SLA escalation, geolocation-based field tracking, and a granular RBAC matrix for multi-tier organizations.",
    stack: ["Laravel", "React.js", "MySQL", "RBAC"],
    href: null,
  },
  {
    title: "CloudCareHost",
    tag: "Infrastructure",
    description:
      "Automated hosting provisioning via the WHM/cPanel API — DNS zones and domain routing configured on payment confirmation.",
    stack: ["PHP", "WHM API", "MySQL", "Webhooks"],
    href: "https://cloudcarehost.com/",
  },
];

export const education = [
  {
    degree: "Master of Science, Computer Science",
    school: "G.D. Sawant College, Nashik",
    period: "Jun 2021 — Apr 2023",
    detail: "Advanced coursework in distributed systems, software architecture, and full-stack engineering.",
  },
  {
    degree: "Bachelor of Science, Computer Science",
    school: "K.T.H.M. College, Nashik",
    period: "Jun 2017 — Apr 2021",
    detail: "Foundations in programming, data structures, web development, and database systems.",
  },
];

export const certifications = [
  "Full Stack Java Developer — Naresh IT",
  "Full Stack Laravel 11 Developer — Udemy",
  "Manual Testing — Profound Edutech",
];

export const nav = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
];
