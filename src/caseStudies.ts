import { projects } from './profile';

export const caseStudies = [
  {
    project: projects.find(project => project.id === 'hymn')!,
    label: 'Church software', title: 'From tagged lyrics to the worship setlist.',
    role: 'Software developer · TOP Church', dates: 'December 2025 to June 2026',
    problem: 'TOP Church needed to prepare worship lyrics and manage setlists remotely, with a desktop client for presentation.',
    contribution: 'I built a Vue web app and Tauri desktop client, with slide generation from tagged lyrics and remote setlist management.',
    decision: 'Decision note pending: the tradeoffs behind the web and desktop split.',
    outcome: 'The system includes generated slides, a slide editor, and scheduled setlists. Usage and outcome evidence is pending.',
    flow: ['Tagged lyrics', 'Generated slides', 'Desktop presentation'],
    caption: 'Scope diagram · Vue web app and Tauri desktop client. Project screenshots pending.',
  },
  {
    project: projects.find(project => project.id === 'webctf-auto')!,
    label: 'Security tooling', title: 'A first pass through unfamiliar challenge source.',
    role: 'Personal project · Python development', dates: 'Project date pending',
    problem: 'A web CTF challenge can arrive as a ZIP of unfamiliar source. I wanted a first pass that points me toward code to investigate.',
    contribution: 'I built WebCTF-Auto to review Python web challenge source and produce Markdown and JSON reports for manual investigation.',
    decision: 'Decision note pending: what I automate and what I leave for manual review.',
    outcome: 'The tool produces reports from challenge source. A worked example and findings are pending documentation.',
    flow: ['Challenge source', 'First-pass review', 'Markdown + JSON'],
    caption: 'Scope diagram · authorized CTF practice. Sample report pending.',
  },
  {
    project: projects.find(project => project.id === 'jsp')!,
    label: 'Freelance client work', title: 'A consultation website for an engineering startup.',
    role: 'Freelance web developer · JSP Engineering Services', dates: 'May 2026 to present',
    problem: 'JSP Engineering Services needed a responsive company website and a way to collect consultation requests.',
    contribution: 'I work directly with the client on requirements and build the website, consultation forms, and email workflows.',
    decision: 'Decision note pending: how client requirements shaped the consultation flow.',
    outcome: 'The project includes consultation forms and automated email notifications. Client feedback and launch evidence are pending.',
    flow: ['Consultation form', 'Request details', 'Email notification'],
    caption: 'Scope diagram · client website and consultation workflow. Approved screenshots pending.',
  },
  {
    project: projects.find(project => project.id === 'studyhub')!,
    label: 'Personal software', title: 'Turning study materials into practice questions.',
    role: 'Personal project · web development', dates: 'Project date pending',
    problem: 'I wanted a way to turn uploaded learning materials into flashcards, quizzes, and key points for study.',
    contribution: 'I built StudyHub with React, TypeScript, Node.js, and Gemini to generate study materials from imported documents.',
    decision: 'Decision note pending: how I check generated material and handle malformed model responses.',
    outcome: 'The app generates flashcards, quizzes, and key points. A documented example and evaluation are pending.',
    flow: ['Learning materials', 'Gemini generation', 'Study exercises'],
    caption: 'Scope diagram · AI-assisted study workflow. Project screenshots pending.',
  },
];

export const appliedSkills = [
  { tools: 'Vue.js + Tauri', context: 'Web and desktop development for the TOP Church worship presentation system.' },
  { tools: 'React + TypeScript', context: 'The StudyHub interface, with Gemini and Node.js for study material generation.' },
  { tools: 'Tailwind CSS + Node.js + Resend', context: 'The JSP Engineering Services website, consultation forms, and email workflows.' },
  { tools: 'Python', context: 'Source review and Markdown / JSON reports in WebCTF-Auto.' },
  { tools: 'Supabase', context: 'Authentication, ministry dashboards, schedules, and attendance records in church projects.' },
];
