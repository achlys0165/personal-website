// Public details from Jan's resume and portfolio brief.
// Project summaries describe known scope; expand them when documentation is ready.
export const profile = {
  name: 'Jan Sultan',
  role: 'Computer Science Student & Web Developer',
  email: 'jansultan670@gmail.com',
  github: 'https://github.com/achlys0165',
  linkedin: 'https://www.linkedin.com/in/jansultan0210',
  location: 'Taguig City, Metro Manila',
  education: 'BS Computer Science · Cybersecurity & Forensics',
  school: 'Asia Pacific College',
  graduation: '2028',
  introduction: 'I’m Jan Sultan, a Computer Science student at Asia Pacific College specializing in Cybersecurity and Forensics. I build web applications and explore how AI and automation can make everyday workflows easier.',
};

export const categories = ['Cybersecurity', 'AI Automation', 'Web App'] as const;
export type Category = typeof categories[number];

export interface Project {
  id: string;
  category: Category;
  title: string;
  kind: string;
  summary: string;
  technologies: string[];
  scope: string[];
  source?: string;
}

export const projects: Project[] = [
  {
    id: 'webctf-auto', category: 'Cybersecurity', title: 'WebCTF-Auto', kind: 'Learning project',
    summary: 'A Python tool for first-pass source review of web CTF challenges, helping identify routes and code worth investigating manually.',
    technologies: ['Python', 'Kali Linux', 'Web CTF'],
    scope: ['Analyze challenge ZIP files and Python web application source.', 'Produce Markdown and JSON reports for manual investigation.', 'Support practice in authorized CTF environments.'],
  },
  {
    id: 'studyhub', category: 'AI Automation', title: 'StudyHub', kind: 'Personal project',
    summary: 'An AI-assisted study app that turns uploaded learning materials into flashcards, quizzes, and key points.',
    technologies: ['React', 'TypeScript', 'Gemini', 'Node.js'],
    scope: ['Generate study materials from imported PDF, PowerPoint, and Word files.', 'Organize practice around flashcards, quizzes, and key points.', 'Improve generation reliability and handle malformed AI responses.'],
    source: 'https://github.com/achlys0165/studyhub',
  },
  {
    id: 'jsp', category: 'Web App', title: 'JSP Engineering Website', kind: 'Client project',
    summary: 'A responsive website for an electrical engineering startup, with consultation forms and automated email workflows.',
    technologies: ['React', 'Tailwind CSS', 'Node.js', 'Resend'],
    scope: ['Translate client requirements into a responsive company website.', 'Collect consultation requests and deliver email notifications.', 'Prefill customer addresses and consultation-specific email templates.'],
    source: 'https://github.com/achlys0165/JSP_engineeringServices',
  },
  {
    id: 'hymn', category: 'Web App', title: 'Hymn · Worship Presentation', kind: 'Church project',
    summary: 'A worship presentation system for TOP Church, with a web application and desktop client for lyrics, setlists, and slides.',
    technologies: ['Vue.js', 'Tauri', 'Tailwind CSS'],
    scope: ['Manage lyrics and scheduled setlists remotely.', 'Generate presentation slides from tagged plain-text lyrics.', 'Provide a desktop presentation client and slide editor.'],
  },
  {
    id: 'music-ministry', category: 'Web App', title: 'Music Ministry Management', kind: 'Church project',
    summary: 'A web application for musician schedules, setlists, song transposition, notifications, and user accounts.',
    technologies: ['Supabase', 'Authentication', 'Web Dashboards'],
    scope: ['Provide separate dashboards for musicians and administrators.', 'Coordinate musician schedules, setlists, and notifications.', 'Use Supabase for authentication and database management.'],
  },
  {
    id: 'nfc-attendance', category: 'Web App', title: 'NFC Attendance System', kind: 'Church project',
    summary: 'An NFC-based attendance system for a church ministry, paired with a web dashboard and cloud data storage.',
    technologies: ['NFC', 'Supabase', 'Web Dashboard'],
    scope: ['Record ministry attendance using NFC.', 'Monitor attendance records through a real-time web dashboard.', 'Store attendance data in Supabase.'],
  },
];

export const skillGroups = [
  { title: 'Cybersecurity & Networking', category: 'Cybersecurity', note: 'Coursework & practice', tags: ['Web CTF Practice', 'Information Security', 'Network Security', 'Networking Basics', 'Linux CLI', 'AWS Fundamentals'] },
  { title: 'AI & Automation', category: 'AI Automation', note: 'Projects & learning', tags: ['AI Study Material Generation', 'Gemini Integration', 'Workflow Automation', 'REST APIs', 'Python · Familiar', 'GitHub Actions · Familiar'] },
  { title: 'Web Application Development', category: 'Web App', note: 'Development stack', tags: ['Vue.js', 'React', 'Tailwind CSS', 'Node.js', 'HTML / CSS', 'Supabase', 'MySQL', 'Tauri'] },
];

export const experience = [
  { dates: 'May 2026 — Present', role: 'Freelance Web Developer', organization: 'JSP Engineering Services · Remote', description: 'Developing a responsive website for an electrical engineering startup, working directly with the client on requirements and turning business needs into web features.' },
  { dates: 'December 2025 — June 2026', role: 'Software Developer', organization: 'TOP Church · Remote', description: 'Designed and developed a cloud-based worship presentation system with a Vue.js web app and Tauri desktop client. Automated slide generation from tagged lyrics and supported remote setlist management.' },
];

export const securityActivities = [
  {
    dates: 'September 2026',
    role: 'JISSA–APC × Resecurity CTF Challenge',
    organization: 'JISSA–APC × Resecurity',
    achievement: '1st Runner-Up · Team',
    description: 'My team finished as 1st Runner-Up in the Capture the Flag challenge held in collaboration between JISSA–APC and Resecurity.',
  },
  {
    dates: '2026',
    role: 'Student Volunteer',
    organization: 'PhilSec 2026 · Pasay City',
    achievement: '',
    description: 'Assisted with registration, attendee support, and event operations at a Philippine cybersecurity conference. Interacted with cybersecurity professionals, industry leaders, and technology vendors while supporting conference logistics.',
  },
  {
    dates: '2025',
    role: 'SEEN 2025 CTF Challenge',
    organization: 'Google Developer Groups (GDG) & CyberPH',
    achievement: '9th Place',
    description: 'Placed 9th in the SEEN 2025 Capture the Flag Challenge, organized by Google Developer Groups and CyberPH.',
  },
  {
    dates: '',
    role: 'Hack the Beat CTF Competition',
    organization: 'Junior Information Systems Security Association (JISSA)',
    achievement: '10th Place',
    description: 'Placed 10th in the Hack the Beat JISSA Capture the Flag Competition.',
  },
];

export const courses = [
  { title: 'AWS Academy Cloud Architecting', provider: 'AWS Academy', description: 'Coursework in cloud architecture through the AWS Academy program.' },
  { title: 'AWS Academy Cloud Foundations', provider: 'AWS Academy', description: 'Foundational cloud computing coursework through AWS Academy.' },
  { title: 'Networking Basics', provider: 'Cisco Networking Academy', description: 'Coursework in networking fundamentals through Cisco Networking Academy.' },
];
