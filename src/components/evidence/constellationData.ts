export const evidenceNodes = [
  {
    id: "hymn",
    title: "TOP Church",
    detail: "Worship presentation",
    x: 26,
    y: 18,
    z: 0.8,
    featured: true,
    href: "#hymn",
    stack: ["Vue.js", "Tauri", "Tailwind CSS"],
    description:
      "A worship presentation system with tagged lyrics, generated slides, and remote setlist management.",
    relation: "Built for TOP Church",
  },
  {
    id: "vue",
    title: "Vue + Tauri",
    detail: "Web / desktop",
    x: 26,
    y: 45,
    z: -0.5,
    featured: false,
    href: "#hymn",
    stack: ["Vue.js", "Tauri"],
    description:
      "The web and desktop stack used for the TOP Church worship system.",
    relation: "",
  },
  {
    id: "jsp",
    title: "JSP Engineering",
    detail: "Client website",
    x: 26,
    y: 67,
    z: -0.2,
    featured: false,
    href: "#jsp",
    stack: ["React", "Tailwind CSS", "Node.js", "Resend"],
    description:
      "A company website with consultation forms and email workflows.",
    relation: "",
  },
  {
    id: "shared",
    title: "React + Node.js",
    detail: "Web applications",
    x: 26,
    y: 91,
    z: -0.8,
    featured: false,
    href: "#jsp",
    stack: ["React", "Node.js"],
    description:
      "Shared tools used in the JSP Engineering website and StudyHub.",
    relation: "",
  },
  {
    id: "python",
    title: "Python",
    detail: "Review / reports",
    x: 74,
    y: 9,
    z: -0.9,
    featured: false,
    href: "#webctf-auto",
    stack: ["Python"],
    description: "Source review and Markdown / JSON reports in WebCTF-Auto.",
    relation: "",
  },
  {
    id: "webctf-auto",
    title: "WebCTF-Auto",
    detail: "Python source review",
    x: 74,
    y: 32,
    z: 0.2,
    featured: false,
    href: "#webctf-auto",
    stack: ["Python", "Kali Linux", "Web CTF"],
    description:
      "A first-pass source review tool for authorized web CTF challenges.",
    relation: "",
  },
  {
    id: "ctf",
    title: "JISSA × Resecurity",
    detail: "1st Runner-Up · Team",
    x: 74,
    y: 56,
    z: 1,
    featured: true,
    href: "#experience",
    stack: [],
    description:
      "My team finished as 1st Runner-Up at the JISSA–APC × Resecurity CTF challenge in September 2026.",
    relation: "Won at JISSA × Resecurity",
  },
  {
    id: "studyhub",
    title: "StudyHub",
    detail: "Gemini study tools",
    x: 74,
    y: 87,
    z: 0.4,
    featured: false,
    href: "#studyhub",
    stack: ["React", "TypeScript", "Gemini", "Node.js"],
    description:
      "An AI-assisted study app that turns uploaded materials into flashcards, quizzes, and key points.",
    relation: "",
  },
] as const;

export const evidenceConnections = [
  ["hymn", "vue"],
  ["webctf-auto", "python"],
  ["jsp", "shared"],
  ["studyhub", "shared"],
] as const;
export type EvidenceId = (typeof evidenceNodes)[number]["id"];
export function relatedEvidence(id: string | null) {
  const ids = new Set<string>();
  if (id) ids.add(id);
  for (const [from, to] of evidenceConnections) {
    if (id === from) ids.add(to);
    if (id === to) ids.add(from);
  }
  return ids;
}
