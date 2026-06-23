// FCIA Academy — Mock data (Sprint 2, sem backend)
import {
  BookOpen, Award, Zap, Trophy, Flame, Star, Brain, Rocket,
  Code2, PenTool, Database, BarChart3, Briefcase, Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Level = "Iniciante" | "Intermediário" | "Avançado";

export interface Track {
  slug: string;
  title: string;
  description: string;
  category: string;
  level: Level;
  hours: number;
  courses: number;
  progress: number;
  tags: string[];
  icon: LucideIcon;
  color: string;
}

export interface Course {
  slug: string;
  trackSlug: string;
  title: string;
  description: string;
  category: string;
  level: Level;
  hours: number;
  modules: number;
  lessons: number;
  progress: number;
  instructor: string;
  instructorRole: string;
  rating: number;
  students: number;
  tags: string[];
  icon: LucideIcon;
}

export interface Module {
  slug: string;
  courseSlug: string;
  title: string;
  summary: string;
  lessons: Lesson[];
  durationMin: number;
  completed: boolean;
}

export interface Lesson {
  slug: string;
  moduleSlug: string;
  title: string;
  durationMin: number;
  type: "video" | "leitura" | "exercicio";
  completed: boolean;
}

export interface Certificate {
  id: string;
  code: string;
  courseTitle: string;
  issuedAt: string;
  hours: number;
  score: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  courseTitle: string;
  moduleTitle: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  xp: number;
}

export interface Activity {
  id: string;
  type: "aula" | "quiz" | "certificado" | "conquista";
  title: string;
  at: string;
  xp?: number;
}

export const CATEGORIES = [
  "Tecnologia", "Design", "Negócios", "Dados", "Carreira", "Saúde",
] as const;

export const LEVELS: Level[] = ["Iniciante", "Intermediário", "Avançado"];

export const TAGS = [
  "React", "TypeScript", "UI", "UX", "SQL", "Python", "Liderança",
  "Produto", "Figma", "Cloud", "IA", "Marketing",
];

export const TRACKS: Track[] = [
  {
    slug: "frontend-moderno", title: "Frontend Moderno",
    description: "React, TypeScript e design systems do zero ao avançado.",
    category: "Tecnologia", level: "Intermediário", hours: 64, courses: 8,
    progress: 42, tags: ["React", "TypeScript", "UI"], icon: Code2, color: "from-primary to-accent",
  },
  {
    slug: "produto-digital", title: "Produto Digital",
    description: "Descoberta, métricas, discovery e delivery em produtos digitais.",
    category: "Negócios", level: "Iniciante", hours: 48, courses: 6,
    progress: 18, tags: ["Produto", "UX"], icon: Rocket, color: "from-primary to-accent",
  },
  {
    slug: "dados-analytics", title: "Dados & Analytics",
    description: "SQL, modelagem, dashboards e storytelling com dados.",
    category: "Dados", level: "Intermediário", hours: 72, courses: 9,
    progress: 0, tags: ["SQL", "Python"], icon: Database, color: "from-primary to-accent",
  },
  {
    slug: "design-systems", title: "Design Systems",
    description: "Tokens, componentes, governança e Figma avançado.",
    category: "Design", level: "Avançado", hours: 40, courses: 5,
    progress: 67, tags: ["Figma", "UI"], icon: PenTool, color: "from-primary to-accent",
  },
  {
    slug: "lideranca", title: "Liderança Técnica",
    description: "Da senioridade ao staff: comunicação, mentoria e impacto.",
    category: "Carreira", level: "Avançado", hours: 32, courses: 4,
    progress: 0, tags: ["Liderança"], icon: Briefcase, color: "from-primary to-accent",
  },
  {
    slug: "saude-mental-tech", title: "Saúde Mental em Tech",
    description: "Hábitos, energia e foco para profissionais de alta performance.",
    category: "Saúde", level: "Iniciante", hours: 16, courses: 3,
    progress: 88, tags: ["Carreira"], icon: Heart, color: "from-primary to-accent",
  },
];

export const COURSES: Course[] = [
  {
    slug: "react-fundamentos", trackSlug: "frontend-moderno",
    title: "React Fundamentos", description: "Componentes, estado, hooks e padrões essenciais.",
    category: "Tecnologia", level: "Iniciante", hours: 12, modules: 6, lessons: 32,
    progress: 60, instructor: "Marina Souza", instructorRole: "Staff Engineer",
    rating: 4.9, students: 8421, tags: ["React"], icon: Code2,
  },
  {
    slug: "typescript-pro", trackSlug: "frontend-moderno",
    title: "TypeScript Pro", description: "Tipagem avançada, generics e patterns de domínio.",
    category: "Tecnologia", level: "Intermediário", hours: 10, modules: 5, lessons: 24,
    progress: 25, instructor: "Diego Lima", instructorRole: "Tech Lead",
    rating: 4.8, students: 5210, tags: ["TypeScript"], icon: Code2,
  },
  {
    slug: "design-tokens", trackSlug: "design-systems",
    title: "Design Tokens na prática", description: "Da semântica à automação de tokens.",
    category: "Design", level: "Avançado", hours: 8, modules: 4, lessons: 18,
    progress: 80, instructor: "Aline Pires", instructorRole: "Design Systems Lead",
    rating: 4.9, students: 3120, tags: ["Figma", "UI"], icon: PenTool,
  },
  {
    slug: "sql-do-zero", trackSlug: "dados-analytics",
    title: "SQL do zero ao avançado", description: "Consultas, joins, performance e modelagem.",
    category: "Dados", level: "Iniciante", hours: 14, modules: 7, lessons: 36,
    progress: 0, instructor: "Rafael Nunes", instructorRole: "Data Engineer",
    rating: 4.7, students: 9410, tags: ["SQL"], icon: Database,
  },
  {
    slug: "dashboards-storytelling", trackSlug: "dados-analytics",
    title: "Dashboards com storytelling", description: "Visualizações que comunicam decisão.",
    category: "Dados", level: "Intermediário", hours: 9, modules: 5, lessons: 22,
    progress: 0, instructor: "Bruna Tavares", instructorRole: "Analytics Manager",
    rating: 4.8, students: 4011, tags: ["UX"], icon: BarChart3,
  },
  {
    slug: "produto-discovery", trackSlug: "produto-digital",
    title: "Discovery de Produto", description: "Entrevistas, hipóteses e validação.",
    category: "Negócios", level: "Iniciante", hours: 8, modules: 4, lessons: 16,
    progress: 40, instructor: "Caio Mendes", instructorRole: "Group PM",
    rating: 4.7, students: 6230, tags: ["Produto"], icon: Rocket,
  },
  {
    slug: "lideranca-staff", trackSlug: "lideranca",
    title: "Caminho para Staff", description: "Influência, escopo e impacto técnico.",
    category: "Carreira", level: "Avançado", hours: 7, modules: 4, lessons: 14,
    progress: 0, instructor: "Helena Costa", instructorRole: "Engineering Director",
    rating: 4.9, students: 1830, tags: ["Liderança"], icon: Briefcase,
  },
  {
    slug: "foco-energia", trackSlug: "saude-mental-tech",
    title: "Foco & Energia", description: "Rotina, sono e gestão de energia.",
    category: "Saúde", level: "Iniciante", hours: 5, modules: 3, lessons: 10,
    progress: 100, instructor: "Dr. André Vidal", instructorRole: "Psiquiatra",
    rating: 4.9, students: 7820, tags: ["Carreira"], icon: Heart,
  },
];

export const MODULES: Module[] = [
  {
    slug: "react-introducao", courseSlug: "react-fundamentos",
    title: "Introdução ao React", summary: "JSX, componentes e props.",
    durationMin: 90, completed: true,
    lessons: [
      { slug: "o-que-e-react", moduleSlug: "react-introducao", title: "O que é React?", durationMin: 12, type: "video", completed: true },
      { slug: "jsx-basico", moduleSlug: "react-introducao", title: "JSX básico", durationMin: 18, type: "video", completed: true },
      { slug: "componentes-e-props", moduleSlug: "react-introducao", title: "Componentes e props", durationMin: 22, type: "video", completed: true },
      { slug: "exercicio-1", moduleSlug: "react-introducao", title: "Exercício prático", durationMin: 30, type: "exercicio", completed: true },
    ],
  },
  {
    slug: "react-estado-hooks", courseSlug: "react-fundamentos",
    title: "Estado e Hooks", summary: "useState, useEffect e padrões.",
    durationMin: 120, completed: false,
    lessons: [
      { slug: "use-state", moduleSlug: "react-estado-hooks", title: "useState a fundo", durationMin: 24, type: "video", completed: true },
      { slug: "use-effect", moduleSlug: "react-estado-hooks", title: "useEffect e ciclo de vida", durationMin: 28, type: "video", completed: false },
      { slug: "custom-hooks", moduleSlug: "react-estado-hooks", title: "Criando custom hooks", durationMin: 32, type: "video", completed: false },
      { slug: "quiz-hooks", moduleSlug: "react-estado-hooks", title: "Quiz: Hooks", durationMin: 10, type: "exercicio", completed: false },
    ],
  },
];

export const CERTIFICATES: Certificate[] = [
  { id: "c-001", code: "FCIA-A4F2-9X10", courseTitle: "Foco & Energia", issuedAt: "2025-09-12", hours: 5, score: 96 },
  { id: "c-002", code: "FCIA-B7K1-7T22", courseTitle: "Design Tokens na prática", issuedAt: "2025-08-30", hours: 8, score: 91 },
  { id: "c-003", code: "FCIA-D2M9-5R03", courseTitle: "Discovery de Produto", issuedAt: "2025-07-18", hours: 8, score: 84 },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", title: "Primeiro passo", description: "Conclua sua primeira aula", icon: Star, unlocked: true, xp: 50 },
  { id: "a2", title: "Streak de 7 dias", description: "7 dias seguidos estudando", icon: Flame, unlocked: true, xp: 150 },
  { id: "a3", title: "Certificado conquistado", description: "Emita seu 1º certificado", icon: Award, unlocked: true, xp: 300 },
  { id: "a4", title: "Maratonista", description: "10 horas em uma semana", icon: Trophy, unlocked: false, xp: 500 },
  { id: "a5", title: "Mente afiada", description: "Acerte 100% em 5 quizzes", icon: Brain, unlocked: false, xp: 400 },
  { id: "a6", title: "Foguete", description: "Conclua uma trilha completa", icon: Rocket, unlocked: false, xp: 1000 },
];

export const ACTIVITIES: Activity[] = [
  { id: "ac1", type: "aula", title: "Concluiu 'useState a fundo'", at: "hoje, 09:42", xp: 25 },
  { id: "ac2", type: "quiz", title: "Acertou 9/10 no quiz de JSX", at: "ontem, 22:10", xp: 80 },
  { id: "ac3", type: "conquista", title: "Desbloqueou 'Streak de 7 dias'", at: "ontem, 08:00", xp: 150 },
  { id: "ac4", type: "certificado", title: "Certificado de 'Foco & Energia'", at: "12/09/2025", xp: 300 },
];

export const UPCOMING = [
  { id: "u1", title: "useEffect e ciclo de vida", course: "React Fundamentos", durationMin: 28 },
  { id: "u2", title: "Generics avançados", course: "TypeScript Pro", durationMin: 35 },
  { id: "u3", title: "Tokens semânticos", course: "Design Tokens", durationMin: 22 },
];

export const NOTIFICATIONS = [
  { id: "n1", title: "Nova aula disponível", body: "‘Generics avançados’ foi liberada.", at: "há 2h", read: false },
  { id: "n2", title: "Você ganhou +150 XP", body: "Streak de 7 dias concluído.", at: "há 1d", read: false },
  { id: "n3", title: "Certificado emitido", body: "Foco & Energia — código FCIA-A4F2-9X10.", at: "há 3d", read: true },
];

export const ADMIN_USERS = [
  { id: "u1", name: "Marina Souza", email: "marina@fcia.io", role: "Aluno", xp: 4820, status: "ativo" },
  { id: "u2", name: "Diego Lima", email: "diego@fcia.io", role: "Instrutor", xp: 12440, status: "ativo" },
  { id: "u3", name: "Aline Pires", email: "aline@fcia.io", role: "Admin", xp: 18030, status: "ativo" },
  { id: "u4", name: "Rafael Nunes", email: "rafael@fcia.io", role: "Aluno", xp: 920, status: "inativo" },
  { id: "u5", name: "Bruna Tavares", email: "bruna@fcia.io", role: "Aluno", xp: 3210, status: "ativo" },
];

export const QUIZ_BANK: Record<string, Quiz> = {
  "q-react-hooks": {
    id: "q-react-hooks", courseTitle: "React Fundamentos",
    moduleTitle: "Estado e Hooks", passingScore: 70,
    questions: [
      { id: "1", prompt: "Qual hook gerencia estado local?", options: ["useEffect", "useState", "useMemo", "useRef"], correctIndex: 1 },
      { id: "2", prompt: "useEffect executa quando?", options: ["Apenas na montagem", "Após renderizar", "Antes de renderizar", "Nunca"], correctIndex: 1 },
      { id: "3", prompt: "Custom hooks devem começar com…", options: ["custom", "use", "react", "qualquer"], correctIndex: 1 },
    ],
  },
};

export const STUDENT_PROFILE = {
  name: "Marina Souza", email: "marina@fcia.io", role: "Aluno",
  level: 14, xp: 4820, xpToNext: 6000, streak: 12, hoursThisWeek: 6.4,
};

export const STUDENT_STATS = [
  { label: "XP total", value: "4.820", icon: Zap, hint: "+150 hoje" },
  { label: "Nível atual", value: "14", icon: Trophy, hint: "1.180 p/ nível 15" },
  { label: "Streak", value: "12 dias", icon: Flame, hint: "recorde: 18" },
  { label: "Certificados", value: "3", icon: Award, hint: "todos validáveis" },
];

export const ADMIN_STATS = [
  { label: "Alunos ativos", value: "12.430", hint: "+8,4% no mês" },
  { label: "Cursos publicados", value: "84", hint: "12 em rascunho" },
  { label: "Certificados emitidos", value: "9.812", hint: "+312 esta semana" },
  { label: "Conclusão média", value: "67%", hint: "+3pp vs trimestre" },
];

export const FAQS = [
  { q: "Como funciona a emissão de certificados?", a: "Após concluir o curso e o quiz com nota mínima de 70%, o certificado é emitido automaticamente com código público de validação." },
  { q: "Posso usar a FCIA na minha empresa?", a: "Sim — temos plano Empresarial com gestão de turmas, relatórios e SSO." },
  { q: "Quanto custa o plano Pro?", a: "R$ 49/mês com acesso completo a trilhas, cursos e certificados." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem multa. O acesso permanece até o fim do ciclo pago." },
  { q: "Os cursos têm validade?", a: "Não. Uma vez concluído, o certificado é vitalício e sempre validável." },
];

export const PLANS = [
  { name: "Free", price: "R$ 0", features: ["3 cursos abertos", "Comunidade", "Sem certificados"], cta: "Começar grátis", highlighted: false },
  { name: "Pro", price: "R$ 49", features: ["Todas as trilhas", "Certificados validáveis", "Suporte prioritário", "AI Studio limitado"], cta: "Assinar Pro", highlighted: true },
  { name: "Empresarial", price: "Sob consulta", features: ["Turmas e relatórios", "SSO + integrações", "AI Studio ilimitado", "Onboarding dedicado"], cta: "Falar com vendas", highlighted: false },
];

export const ADMIN_RESOURCES = {
  trilhas: TRACKS.map((t) => ({ id: t.slug, name: t.title, level: t.level, courses: t.courses, status: "Publicado" })),
  cursos: COURSES.map((c) => ({ id: c.slug, name: c.title, instructor: c.instructor, level: c.level, students: c.students, status: "Publicado" })),
  modulos: MODULES.map((m) => ({ id: m.slug, name: m.title, course: m.courseSlug, lessons: m.lessons.length, durationMin: m.durationMin })),
  questoes: [
    { id: "q1", course: "react-fundamentos", module: "Estado e Hooks", prompt: "Qual hook gerencia estado local?", level: "Iniciante" },
    { id: "q2", course: "react-fundamentos", module: "Estado e Hooks", prompt: "useEffect executa quando?", level: "Iniciante" },
    { id: "q3", course: "typescript-pro", module: "Generics", prompt: "Quando usar generics?", level: "Intermediário" },
  ],
};

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  delta: number;
  isYou?: boolean;
}

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Aline Pires", xp: 18030, level: 28, delta: 0 },
  { rank: 2, name: "Diego Lima", xp: 12440, level: 22, delta: 1 },
  { rank: 3, name: "Helena Costa", xp: 9870, level: 19, delta: -1 },
  { rank: 4, name: "Bruna Tavares", xp: 7210, level: 17, delta: 2 },
  { rank: 5, name: "Marina Souza", xp: 4820, level: 14, delta: 3, isYou: true },
  { rank: 6, name: "Rafael Nunes", xp: 920, level: 5, delta: -2 },
];

export interface XPLevel {
  level: number;
  required: number;
  title: string;
}

export const XP_LEVELS: XPLevel[] = [
  { level: 12, required: 3200, title: "Aprendiz" },
  { level: 13, required: 4000, title: "Praticante" },
  { level: 14, required: 4820, title: "Estudante Dedicado" },
  { level: 15, required: 6000, title: "Especialista Jr." },
  { level: 16, required: 7500, title: "Especialista" },
];

export interface AIStudioTool {
  slug: "quiz" | "resumo" | "objetivos" | "exercicios" | "curso" | "copy" | "certificado";
  title: string;
  description: string;
  inputs: { label: string; placeholder: string; type: "text" | "textarea" | "select"; options?: string[] }[];
  outputLabel: string;
}

export const AI_STUDIO_TOOLS: AIStudioTool[] = [
  {
    slug: "quiz", title: "Gerar Quiz", description: "Crie banco de questões a partir de um tema ou aula.",
    inputs: [
      { label: "Tema/Aula", placeholder: "Ex: React Hooks — useEffect", type: "text" },
      { label: "Nível", placeholder: "", type: "select", options: ["Iniciante", "Intermediário", "Avançado"] },
      { label: "Nº de questões", placeholder: "10", type: "text" },
    ],
    outputLabel: "Questões geradas",
  },
  {
    slug: "resumo", title: "Gerar Resumo", description: "Sintetize uma aula longa em pontos-chave acionáveis.",
    inputs: [
      { label: "Conteúdo bruto", placeholder: "Cole transcrição ou texto…", type: "textarea" },
      { label: "Formato", placeholder: "", type: "select", options: ["Bullets", "Parágrafo", "Mapa mental"] },
    ],
    outputLabel: "Resumo",
  },
  {
    slug: "objetivos", title: "Gerar Objetivos", description: "Liste objetivos de aprendizagem mensuráveis.",
    inputs: [
      { label: "Tópico", placeholder: "Ex: SQL Joins", type: "text" },
      { label: "Público-alvo", placeholder: "Ex: devs juniores", type: "text" },
    ],
    outputLabel: "Objetivos",
  },
  {
    slug: "exercicios", title: "Gerar Exercícios", description: "Práticas guiadas com critérios de aceite.",
    inputs: [
      { label: "Tópico", placeholder: "Ex: Generics em TypeScript", type: "text" },
      { label: "Tipo", placeholder: "", type: "select", options: ["Coding", "Case", "Reflexão"] },
    ],
    outputLabel: "Exercícios",
  },
  {
    slug: "curso", title: "Gerar Curso Completo", description: "Esqueleto de curso com módulos e aulas.",
    inputs: [
      { label: "Título proposto", placeholder: "Ex: Liderança Técnica Sênior", type: "text" },
      { label: "Briefing", placeholder: "Descreva escopo, público e duração…", type: "textarea" },
    ],
    outputLabel: "Estrutura do curso",
  },
  {
    slug: "copy", title: "Gerar Copy", description: "Headlines, descrições e CTAs para landing e catálogo.",
    inputs: [
      { label: "Produto/Curso", placeholder: "Ex: Plano Pro", type: "text" },
      { label: "Tom", placeholder: "", type: "select", options: ["Direto", "Inspirador", "Técnico"] },
    ],
    outputLabel: "Copy",
  },
  {
    slug: "certificado", title: "Gerar Certificado", description: "Template de certificado com selo e validação.",
    inputs: [
      { label: "Nome do curso", placeholder: "Ex: React Fundamentos", type: "text" },
      { label: "Carga horária", placeholder: "Ex: 12h", type: "text" },
    ],
    outputLabel: "Pré-visualização",
  },
];

// ===== Sprint 4: Monetização & Conversão =====

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  initials: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  { id: "t1", name: "Marina Souza", role: "Frontend Engineer", company: "Nubank", initials: "MS", rating: 5,
    quote: "A FCIA mudou minha rotina de estudos. A trilha de Frontend Moderno me preparou para uma promoção em 3 meses." },
  { id: "t2", name: "Diego Lima", role: "Tech Lead", company: "iFood", initials: "DL", rating: 5,
    quote: "Os certificados são reconhecidos pelo meu time. Já indiquei a plataforma para 12 colegas." },
  { id: "t3", name: "Aline Pires", role: "Design Systems Lead", company: "Globo", initials: "AP", rating: 5,
    quote: "O AI Studio acelerou em 4x a produção de conteúdo do meu squad de educação interna." },
  { id: "t4", name: "Caio Mendes", role: "Group Product Manager", company: "Mercado Livre", initials: "CM", rating: 5,
    quote: "Conteúdo denso, gamificação que engaja e suporte humano. Pago Pro sem pensar duas vezes." },
];

export interface SuccessCase {
  id: string;
  company: string;
  logo: string;
  metric: string;
  label: string;
  story: string;
}

export const SUCCESS_CASES: SuccessCase[] = [
  { id: "s1", company: "Banco Atlas", logo: "BA", metric: "92%", label: "conclusão de trilhas", story: "Onboarding técnico cortado de 12 para 4 semanas." },
  { id: "s2", company: "Lumen Health", logo: "LH", metric: "3.4x", label: "engajamento", story: "Equipe de dados certificada em SQL e dashboards em 60 dias." },
  { id: "s3", company: "Norte Pay", logo: "NP", metric: "+47%", label: "satisfação interna", story: "Trilha de Liderança Técnica adotada por 100% dos staff." },
];

export interface StudentReview {
  id: string;
  course: string;
  name: string;
  initials: string;
  rating: number;
  comment: string;
  at: string;
}

export const STUDENT_REVIEWS: StudentReview[] = [
  { id: "r1", course: "React Fundamentos", name: "Helena Costa", initials: "HC", rating: 5, comment: "Didática impecável, exercícios práticos e mentoria que faz diferença.", at: "há 2 semanas" },
  { id: "r2", course: "SQL do zero ao avançado", name: "Rafael Nunes", initials: "RN", rating: 5, comment: "Saí do básico para resolver problemas reais em produção.", at: "há 1 mês" },
  { id: "r3", course: "Design Tokens na prática", name: "Bruna Tavares", initials: "BT", rating: 4, comment: "Excelente para times que querem padronizar.", at: "há 3 semanas" },
  { id: "r4", course: "Discovery de Produto", name: "Pedro Alves", initials: "PA", rating: 5, comment: "Mudou minha forma de conduzir entrevistas com clientes.", at: "há 1 semana" },
];

export interface Instructor {
  slug: string;
  name: string;
  initials: string;
  role: string;
  bio: string;
  students: number;
  courses: number;
  rating: number;
  reviews: number;
  socials: { linkedin?: string; twitter?: string; site?: string };
  certifications: string[];
}

export const INSTRUCTORS: Instructor[] = [
  { slug: "marina-souza", name: "Marina Souza", initials: "MS", role: "Staff Engineer · React",
    bio: "10 anos construindo produtos de larga escala. Autora do livro 'React em Profundidade'.",
    students: 12420, courses: 4, rating: 4.9, reviews: 1840,
    socials: { linkedin: "marinasouza", twitter: "marinadev" },
    certifications: ["AWS Solutions Architect", "GoogleCloud Professional"] },
  { slug: "diego-lima", name: "Diego Lima", initials: "DL", role: "Tech Lead · TypeScript",
    bio: "Especialista em tipagem avançada e arquitetura de sistemas distribuídos.",
    students: 8210, courses: 3, rating: 4.8, reviews: 1120,
    socials: { linkedin: "diegolima" },
    certifications: ["TypeScript Mentor"] },
  { slug: "aline-pires", name: "Aline Pires", initials: "AP", role: "Design Systems Lead",
    bio: "Construiu design systems em Globo, iFood e startups B2B.",
    students: 5430, courses: 2, rating: 4.9, reviews: 620,
    socials: { linkedin: "alinepires", site: "alinepires.design" },
    certifications: ["Figma Advanced", "Tokens Studio Pro"] },
];

export interface PlanFull {
  slug: "free" | "pro" | "premium" | "enterprise";
  name: string;
  price: string;
  priceHint: string;
  description: string;
  highlighted?: boolean;
  features: string[];
  notIncluded?: string[];
  cta: string;
}

export const PLANS_FULL: PlanFull[] = [
  { slug: "free", name: "Free", price: "R$ 0", priceHint: "para sempre",
    description: "Ideal para experimentar a plataforma.",
    features: ["3 cursos abertos", "Comunidade", "Acesso ao app mobile"],
    notIncluded: ["Certificados", "Trilhas guiadas", "AI Studio"],
    cta: "Começar grátis" },
  { slug: "pro", name: "Pro", price: "R$ 49", priceHint: "/mês",
    description: "Para quem quer evoluir todo mês.",
    features: ["Todas as trilhas e cursos", "Certificados validáveis", "Gamificação completa", "AI Studio (limitado)", "Suporte prioritário"],
    cta: "Assinar Pro", highlighted: true },
  { slug: "premium", name: "Premium", price: "R$ 119", priceHint: "/mês",
    description: "Mentoria humana e experiência completa.",
    features: ["Tudo do Pro", "Mentoria 1:1 mensal", "Code reviews ilimitados", "AI Studio ilimitado", "Acesso antecipado a lançamentos"],
    cta: "Assinar Premium" },
  { slug: "enterprise", name: "Enterprise", price: "Sob consulta", priceHint: "anual",
    description: "Times e empresas em escala.",
    features: ["Turmas privadas e SSO", "Relatórios executivos", "AI Studio ilimitado", "Onboarding e CSM dedicado", "SLA contratual"],
    cta: "Falar com vendas" },
];

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  count: number;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  { slug: "engenharia", name: "Engenharia", description: "Boas práticas, arquitetura e padrões.", count: 18 },
  { slug: "carreira", name: "Carreira", description: "Crescimento, senioridade e mentoria.", count: 12 },
  { slug: "ia-educacao", name: "IA na Educação", description: "Como a IA acelera o aprendizado.", count: 9 },
  { slug: "produto", name: "Produto", description: "Discovery, métricas e delivery.", count: 7 },
];

export interface BlogAuthor {
  slug: string;
  name: string;
  initials: string;
  role: string;
  bio: string;
  posts: number;
}

export const BLOG_AUTHORS: BlogAuthor[] = [
  { slug: "marina-souza", name: "Marina Souza", initials: "MS", role: "Staff Engineer", bio: "Escrevo sobre React, performance e DX.", posts: 14 },
  { slug: "aline-pires", name: "Aline Pires", initials: "AP", role: "Design Systems Lead", bio: "Design tokens, Figma e governança.", posts: 9 },
  { slug: "diego-lima", name: "Diego Lima", initials: "DL", role: "Tech Lead", bio: "TypeScript, arquitetura e mentoria.", posts: 11 },
];

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorSlug: string;
  publishedAt: string;
  readingMin: number;
  featured?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  { slug: "design-tokens-na-pratica", title: "Design Tokens na prática: do Figma ao código",
    excerpt: "Como estruturar tokens semânticos que sobrevivem a redesigns.",
    category: "engenharia", authorSlug: "aline-pires", publishedAt: "2025-10-12", readingMin: 8, featured: true },
  { slug: "ia-acelera-aprendizado", title: "Como a IA acelera o aprendizado técnico",
    excerpt: "Tutores personalizados, quizzes adaptativos e novos formatos.",
    category: "ia-educacao", authorSlug: "marina-souza", publishedAt: "2025-10-04", readingMin: 6 },
  { slug: "caminho-staff", title: "O caminho até Staff Engineer",
    excerpt: "Influência, escopo e o que muda quando você passa de senior para staff.",
    category: "carreira", authorSlug: "diego-lima", publishedAt: "2025-09-22", readingMin: 11 },
  { slug: "typescript-generics", title: "Generics em TypeScript sem dor",
    excerpt: "Mentais para usar generics com clareza e ergonomia.",
    category: "engenharia", authorSlug: "diego-lima", publishedAt: "2025-09-10", readingMin: 7 },
  { slug: "discovery-rapido", title: "Discovery em 5 dias: o atalho realista",
    excerpt: "Adaptando design sprints para times pequenos.",
    category: "produto", authorSlug: "marina-souza", publishedAt: "2025-08-29", readingMin: 9 },
];

export interface AchievementCategory {
  slug: "cursos" | "trilhas" | "xp" | "certificacoes" | "eventos";
  name: string;
  description: string;
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  { slug: "cursos", name: "Cursos", description: "Conquistas por aulas e cursos concluídos." },
  { slug: "trilhas", name: "Trilhas", description: "Marcos ao completar trilhas de aprendizagem." },
  { slug: "xp", name: "XP", description: "Marcos de XP acumulado." },
  { slug: "certificacoes", name: "Certificações", description: "Selo por cada certificado emitido." },
  { slug: "eventos", name: "Eventos especiais", description: "Conquistas sazonais e desafios." },
];

export interface CategorizedAchievement {
  id: string;
  category: AchievementCategory["slug"];
  title: string;
  description: string;
  xp: number;
  unlocked: boolean;
  rarity: "comum" | "raro" | "épico" | "lendário";
}

export const CATEGORIZED_ACHIEVEMENTS: CategorizedAchievement[] = [
  { id: "ca1", category: "cursos", title: "Primeiro Curso", description: "Conclua seu primeiro curso", xp: 200, unlocked: true, rarity: "comum" },
  { id: "ca2", category: "cursos", title: "Maratonista", description: "Conclua 10 cursos", xp: 800, unlocked: false, rarity: "raro" },
  { id: "ca3", category: "trilhas", title: "Pioneiro", description: "Conclua sua primeira trilha", xp: 500, unlocked: false, rarity: "raro" },
  { id: "ca4", category: "trilhas", title: "Tri-tracker", description: "Conclua 3 trilhas", xp: 1500, unlocked: false, rarity: "épico" },
  { id: "ca5", category: "xp", title: "100 XP", description: "Acumule 100 XP", xp: 0, unlocked: true, rarity: "comum" },
  { id: "ca6", category: "xp", title: "500 XP", description: "Acumule 500 XP", xp: 0, unlocked: true, rarity: "comum" },
  { id: "ca7", category: "xp", title: "1.000 XP", description: "Acumule 1.000 XP", xp: 0, unlocked: true, rarity: "raro" },
  { id: "ca8", category: "xp", title: "10.000 XP", description: "Acumule 10.000 XP", xp: 0, unlocked: false, rarity: "lendário" },
  { id: "ca9", category: "certificacoes", title: "Primeiro Certificado", description: "Emita seu primeiro certificado", xp: 300, unlocked: true, rarity: "raro" },
  { id: "ca10", category: "certificacoes", title: "Coleção +5", description: "Emita 5 certificados", xp: 1200, unlocked: false, rarity: "épico" },
  { id: "ca11", category: "eventos", title: "Black Friday Scholar", description: "Conclua o desafio sazonal", xp: 1000, unlocked: false, rarity: "lendário" },
  { id: "ca12", category: "eventos", title: "Aniversário FCIA", description: "Participe do evento anual", xp: 250, unlocked: false, rarity: "épico" },
];

export const EXEC_DASHBOARD = {
  kpis: [
    { label: "Alunos ativos", value: "12.430", delta: "+8,4%", trend: "up" as const },
    { label: "Vendas (MRR)", value: "R$ 412k", delta: "+12,1%", trend: "up" as const },
    { label: "Certificados emitidos", value: "9.812", delta: "+312", trend: "up" as const },
    { label: "Cursos publicados", value: "84", delta: "+6", trend: "up" as const },
    { label: "Retenção mensal", value: "87%", delta: "+2pp", trend: "up" as const },
    { label: "Conclusão média", value: "67%", delta: "-1pp", trend: "down" as const },
  ],
  topCourses: [
    { name: "React Fundamentos", students: 8421, completion: 71 },
    { name: "SQL do zero ao avançado", students: 9410, completion: 64 },
    { name: "TypeScript Pro", students: 5210, completion: 58 },
    { name: "Design Tokens na prática", students: 3120, completion: 82 },
  ],
};
