/**
 * careerData.js
 * ---------------------------------------------------------
 * Static knowledge base for the AI Career Advisor.
 * No backend / API calls — everything runs client-side so the
 * app works as a plain static site on GitHub Pages.
 *
 * Each career has:
 *   - id, title, blurb, icon (emoji kept simple for zero-asset deploy)
 *   - coreSkills: skills weighted heavily in matching
 *   - niceToHave: skills that add a smaller bonus
 *   - avgSalaryRange: display-only, illustrative
 *   - roadmap: ordered learning stages specific to this career
 * ---------------------------------------------------------
 */

const CAREER_DB = [
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    icon: "🧠",
    blurb: "Builds and ships models that learn from data — from training pipelines to production inference.",
    coreSkills: ["python", "machine learning", "tensorflow", "pytorch", "scikit-learn", "statistics", "linear algebra", "sql"],
    niceToHave: ["docker", "aws", "mlops", "deep learning", "nlp", "computer vision"],
    avgSalaryRange: "$110k – $165k",
    roadmap: [
      { stage: "Foundations", duration: "4–6 weeks", focus: "Python, statistics, linear algebra refresh" },
      { stage: "Core ML", duration: "6–8 weeks", focus: "Supervised/unsupervised learning, scikit-learn" },
      { stage: "Deep Learning", duration: "8 weeks", focus: "Neural nets with PyTorch or TensorFlow" },
      { stage: "Deployment", duration: "4 weeks", focus: "Docker, model serving, basic MLOps" },
      { stage: "Portfolio", duration: "Ongoing", focus: "Ship 2–3 end-to-end projects with write-ups" }
    ]
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    icon: "📊",
    blurb: "Turns raw data into decisions — dashboards, reports, and the story behind the numbers.",
    coreSkills: ["sql", "excel", "data analysis", "statistics", "tableau", "power bi", "data visualization"],
    niceToHave: ["python", "r", "looker", "communication"],
    avgSalaryRange: "$65k – $95k",
    roadmap: [
      { stage: "Spreadsheets & SQL", duration: "3 weeks", focus: "Advanced Excel, SQL joins & aggregations" },
      { stage: "Visualization", duration: "3 weeks", focus: "Tableau or Power BI dashboards" },
      { stage: "Statistics", duration: "4 weeks", focus: "Descriptive stats, hypothesis testing" },
      { stage: "Storytelling", duration: "2 weeks", focus: "Presenting insights to non-technical stakeholders" },
      { stage: "Portfolio", duration: "Ongoing", focus: "Public dashboard + case study writeups" }
    ]
  },
  {
    id: "frontend-dev",
    title: "Frontend Developer",
    icon: "🎨",
    blurb: "Crafts the interfaces people actually touch — fast, accessible, and visually considered.",
    coreSkills: ["html", "css", "javascript", "react", "responsive design", "git"],
    niceToHave: ["typescript", "vue", "figma", "accessibility", "next.js"],
    avgSalaryRange: "$75k – $130k",
    roadmap: [
      { stage: "Web Fundamentals", duration: "4 weeks", focus: "Semantic HTML, modern CSS, layout systems" },
      { stage: "JavaScript Core", duration: "5 weeks", focus: "DOM, async, ES6+, fetch/APIs" },
      { stage: "Framework", duration: "6 weeks", focus: "React or Vue, component architecture" },
      { stage: "Tooling & Git", duration: "2 weeks", focus: "Version control, bundlers, deployment" },
      { stage: "Portfolio", duration: "Ongoing", focus: "3 responsive, accessible projects, deployed live" }
    ]
  },
  {
    id: "backend-dev",
    title: "Backend Developer",
    icon: "🛠️",
    blurb: "Builds the systems and APIs that power everything running behind the interface.",
    coreSkills: ["python", "java", "node.js", "sql", "rest api", "databases", "git"],
    niceToHave: ["docker", "kubernetes", "aws", "system design", "microservices"],
    avgSalaryRange: "$80k – $140k",
    roadmap: [
      { stage: "Language Core", duration: "5 weeks", focus: "Deepen one backend language (Python/Java/Node)" },
      { stage: "Databases", duration: "4 weeks", focus: "SQL design, indexing, basic NoSQL" },
      { stage: "APIs", duration: "4 weeks", focus: "REST design, auth, testing" },
      { stage: "Infra Basics", duration: "3 weeks", focus: "Docker, cloud fundamentals (AWS/GCP)" },
      { stage: "Portfolio", duration: "Ongoing", focus: "Ship a deployed API with docs & tests" }
    ]
  },
  {
    id: "ux-designer",
    title: "UX/UI Designer",
    icon: "🧩",
    blurb: "Researches how people think, then designs interfaces that work the way they expect.",
    coreSkills: ["figma", "user research", "wireframing", "prototyping", "design thinking"],
    niceToHave: ["html", "css", "accessibility", "user testing", "design systems"],
    avgSalaryRange: "$70k – $120k",
    roadmap: [
      { stage: "Design Fundamentals", duration: "3 weeks", focus: "Visual hierarchy, color, typography" },
      { stage: "Research", duration: "3 weeks", focus: "User interviews, personas, journey maps" },
      { stage: "Prototyping", duration: "4 weeks", focus: "Figma wireframes to high-fidelity prototypes" },
      { stage: "Testing", duration: "3 weeks", focus: "Usability testing, iteration" },
      { stage: "Portfolio", duration: "Ongoing", focus: "3 case studies showing process, not just output" }
    ]
  },
  {
    id: "product-manager",
    title: "Product Manager",
    icon: "🧭",
    blurb: "Decides what gets built and why — the bridge between users, design, and engineering.",
    coreSkills: ["communication", "leadership", "project management", "data analysis", "strategy"],
    niceToHave: ["sql", "figma", "agile", "user research"],
    avgSalaryRange: "$95k – $150k",
    roadmap: [
      { stage: "Fundamentals", duration: "3 weeks", focus: "Product lifecycle, prioritization frameworks" },
      { stage: "Data Literacy", duration: "3 weeks", focus: "Basic SQL, reading dashboards & metrics" },
      { stage: "Process", duration: "3 weeks", focus: "Agile/Scrum, roadmapping, stakeholder comms" },
      { stage: "Craft", duration: "4 weeks", focus: "Writing specs, running discovery, A/B testing basics" },
      { stage: "Portfolio", duration: "Ongoing", focus: "1–2 detailed product case studies" }
    ]
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    icon: "🔬",
    blurb: "Asks questions of data that haven't been asked yet, and builds models to answer them.",
    coreSkills: ["python", "statistics", "machine learning", "sql", "data analysis", "r"],
    niceToHave: ["deep learning", "nlp", "tableau", "communication", "experimentation"],
    avgSalaryRange: "$100k – $160k",
    roadmap: [
      { stage: "Statistics & Math", duration: "5 weeks", focus: "Probability, inference, linear algebra" },
      { stage: "Programming", duration: "5 weeks", focus: "Python/R, pandas, data wrangling" },
      { stage: "Modeling", duration: "6 weeks", focus: "Regression, classification, clustering" },
      { stage: "Experimentation", duration: "3 weeks", focus: "A/B testing, causal inference basics" },
      { stage: "Portfolio", duration: "Ongoing", focus: "End-to-end analyses with clear narratives" }
    ]
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Analyst",
    icon: "🛡️",
    blurb: "Watches the perimeter — finds weaknesses before attackers do and responds when they don't.",
    coreSkills: ["networking", "linux", "security", "python", "risk assessment"],
    niceToHave: ["cloud security", "penetration testing", "siem", "compliance"],
    avgSalaryRange: "$85k – $140k",
    roadmap: [
      { stage: "Networking & OS", duration: "5 weeks", focus: "TCP/IP, Linux fundamentals" },
      { stage: "Security Basics", duration: "4 weeks", focus: "Threat models, common attack vectors" },
      { stage: "Hands-on Tools", duration: "5 weeks", focus: "SIEM, vulnerability scanners, labs" },
      { stage: "Certification Prep", duration: "6 weeks", focus: "Security+ or equivalent" },
      { stage: "Portfolio", duration: "Ongoing", focus: "Home-lab writeups, CTF participation" }
    ]
  },
  {
    id: "cloud-engineer",
    title: "Cloud / DevOps Engineer",
    icon: "☁️",
    blurb: "Keeps systems running, scalable, and recoverable — the infrastructure behind the product.",
    coreSkills: ["aws", "docker", "kubernetes", "linux", "ci/cd", "python"],
    niceToHave: ["terraform", "azure", "gcp", "monitoring", "bash"],
    avgSalaryRange: "$95k – $155k",
    roadmap: [
      { stage: "Linux & Networking", duration: "4 weeks", focus: "Shell scripting, networking basics" },
      { stage: "Containers", duration: "4 weeks", focus: "Docker fundamentals, image design" },
      { stage: "Orchestration", duration: "5 weeks", focus: "Kubernetes core concepts" },
      { stage: "Cloud Platform", duration: "5 weeks", focus: "Pick AWS/Azure/GCP and go deep" },
      { stage: "Portfolio", duration: "Ongoing", focus: "CI/CD pipeline for a real deployed app" }
    ]
  },
  {
    id: "digital-marketer",
    title: "Digital Marketing Specialist",
    icon: "📣",
    blurb: "Finds the audience, tells the story, and proves it worked with the numbers.",
    coreSkills: ["seo", "content marketing", "social media", "communication", "data analysis"],
    niceToHave: ["google analytics", "copywriting", "email marketing", "design thinking"],
    avgSalaryRange: "$55k – $90k",
    roadmap: [
      { stage: "Channels", duration: "3 weeks", focus: "SEO, social, email fundamentals" },
      { stage: "Content", duration: "3 weeks", focus: "Copywriting, content calendars" },
      { stage: "Analytics", duration: "3 weeks", focus: "Google Analytics, campaign measurement" },
      { stage: "Paid & Organic", duration: "3 weeks", focus: "Ad platforms vs. organic growth tactics" },
      { stage: "Portfolio", duration: "Ongoing", focus: "Run one real campaign end-to-end" }
    ]
  }
];

/**
 * Canonical skill list used to power the autocomplete / suggestion chips.
 * Deduplicated from all careers' core + nice-to-have skills, plus general
 * soft skills, then title-cased for display.
 */
const ALL_SKILLS = Array.from(
  new Set(
    CAREER_DB.flatMap((c) => [...c.coreSkills, ...c.niceToHave])
  )
).sort();

/** A short curated list shown as default "quick add" chips before the user types anything. */
const FEATURED_SKILL_CHIPS = [
  "Python", "SQL", "JavaScript", "Communication", "Excel",
  "Machine Learning", "Figma", "React", "Statistics", "Docker"
];
