import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  summary: string
  linkedin: string
  github: string
  additionalLinks: { id: string; label: string; url: string }[]
}

// Section item interface for Redux
export interface SectionItem {
  id: string
  title?: string
  description?: string
  achievements?: string[]
  [key: string]: any
}

// Dynamic section for storing in Redux (serializable)
export interface DynamicSection {
  id: string
  title: string
  template: string // 'experience', 'education', 'skills', etc.
  hasDuration?: boolean
  hasAchievements?: boolean
  isPersonal: boolean
  items: SectionItem[]
}

// Formatting options interface
export interface FormattingOptions {
  header: {
    nameAlignment: 'left' | 'center' | 'right'
    contactAlignment: 'left' | 'center' | 'right'
    showDivider: boolean
  }
}


export interface ResumeState {
  personalInfo: PersonalInfo
  dynamicSections: DynamicSection[]
  activeSection: string
  formatting: FormattingOptions
}

const initialState: ResumeState = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    linkedin: '',
    github: '',
    additionalLinks: []
  },
  formatting: {
    header: {
      nameAlignment: 'left',
      contactAlignment: 'left',
      showDivider: true
    }
  },
  dynamicSections: [
    {
      id: 'personal_info',
      title: 'Personal Information',
      template: 'personal_info',
      isPersonal: true,
      items: []
    },
    // {
    //   id: 'experience_1',
    //   title: 'Work Experience',
    //   template: 'experience',
    //   hasDuration: true,
    //   hasAchievements: true,
    //   isPersonal: false,
    //   items: [
    //     {
    //       id: 'exp_1',
    //       title: 'Senior Full Stack Developer',
    //       company: 'TechCorp Solutions Inc.',
    //       duration: 'Jan 2022 - Present',
    //       description: 'Lead development of enterprise web applications',
    //       achievements: [
    //         'Led a team of 5 developers in building a customer portal that increased user engagement by 40%',
    //         'Implemented microservices architecture using Node.js and Docker, improving system scalability by 60%',
    //         'Optimized database queries and API responses, reducing average page load time from 3.2s to 1.1s',
    //         'Established CI/CD pipelines using GitHub Actions and AWS, reducing deployment time by 75%',
    //         'Mentored junior developers and conducted code reviews, improving team code quality metrics by 30%'
    //       ]
    //     },
    //     {
    //       id: 'exp_2',
    //       title: 'Full Stack Developer',
    //       company: 'Digital Innovations LLC',
    //       duration: 'Mar 2020 - Dec 2021',
    //       description: 'Developed and maintained multiple client web applications',
    //       achievements: [
    //         'Built 8+ responsive web applications using React, Redux, and Material-UI',
    //         'Developed RESTful APIs using Python Flask and PostgreSQL for data management',
    //         'Implemented real-time features using WebSocket connections and Redis caching',
    //         'Collaborated with UI/UX designers to improve user experience and accessibility compliance',
    //         'Reduced bug reports by 45% through comprehensive unit testing and code reviews'
    //       ]
    //     },
    //     {
    //       id: 'exp_3',
    //       title: 'Software Engineer',
    //       company: 'StartupXYZ',
    //       duration: 'Jun 2019 - Feb 2020',
    //       description: 'Full-stack development for early-stage startup',
    //       achievements: [
    //         'Developed MVP web application from scratch using React and Node.js',
    //         'Implemented user authentication and authorization using JWT and OAuth2',
    //         'Built automated testing suite with Jest and Cypress, achieving 85% code coverage',
    //         'Optimized application performance resulting in 50% faster load times',
    //         'Participated in product planning and technical architecture decisions'
    //       ]
    //     }
    //   ]
    // },
    // {
    //   id: 'education_1',
    //   title: 'Education',
    //   template: 'education',
    //   hasDuration: true,
    //   hasAchievements: false,
    //   isPersonal: false,
    //   items: [
    //     {
    //       id: 'edu_1',
    //       title: 'Bachelor of Science in Computer Science',
    //       institution: 'University of California, Berkeley',
    //       duration: '2015 - 2019',
    //       description: 'Graduated Magna Cum Laude with GPA 3.8/4.0. Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems, Computer Networks'
    //     },
    //     {
    //       id: 'edu_2',
    //       title: 'Full Stack Web Development Bootcamp',
    //       institution: 'General Assembly',
    //       duration: '2019',
    //       description: 'Intensive 12-week program covering modern web development technologies including React, Node.js, Express, and MongoDB'
    //     }
    //   ]
    // },
    // {
    //   id: 'skills_1',
    //   title: 'Technical Skills',
    //   template: 'skills',
    //   hasDuration: false,
    //   hasAchievements: false,
    //   isPersonal: false,
    //   items: [
    //     {
    //       id: 'skill_1',
    //       title: 'Frontend Technologies',
    //       description: 'React, Vue.js, Angular, TypeScript, JavaScript (ES6+), HTML5, CSS3, SASS, Tailwind CSS, Bootstrap'
    //     },
    //     {
    //       id: 'skill_2',
    //       title: 'Backend Technologies',
    //       description: 'Node.js, Python, Java, Express.js, Flask, Django, RESTful APIs, GraphQL, Microservices'
    //     },
    //     {
    //       id: 'skill_3',
    //       title: 'Databases',
    //       description: 'PostgreSQL, MongoDB, MySQL, Redis, DynamoDB, Elasticsearch'
    //     },
    //     {
    //       id: 'skill_4',
    //       title: 'Cloud & DevOps',
    //       description: 'AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes, CI/CD, GitHub Actions, Jenkins, Terraform'
    //     },
    //     {
    //       id: 'skill_5',
    //       title: 'Development Tools',
    //       description: 'Git, VSCode, WebStorm, Postman, Figma, Jira, Slack, Linear'
    //     },
    //     {
    //       id: 'skill_6',
    //       title: 'Mobile Development',
    //       description: 'React Native, Flutter, iOS (Swift), Android (Kotlin)'
    //     },
    //     {
    //       id: 'skill_7',
    //       title: 'Testing & QA',
    //       description: 'Jest, Cypress, Mocha, Selenium, TDD, Unit Testing, Integration Testing, E2E Testing'
    //     },
    //     {
    //       id: 'skill_8',
    //       title: 'Data Science & ML',
    //       description: 'Python (NumPy, Pandas, scikit-learn), TensorFlow, Data Visualization, Statistical Analysis'
    //     },
    //      {
    //       id: 'skill_9',
    //       title: 'Data Science & ML',
    //       description: 'Python (NumPy, Pandas, scikit-learn), TensorFlow, Data Visualization, Statistical Analysis'
    //     },
    //      {
    //       id: 'skill_10',
    //       title: 'Data Science & ML',
    //       description: 'Python (NumPy, Pandas, scikit-learn), TensorFlow, Data Visualization, Statistical Analysis'
    //     }
    //   ]
    // },
    // {
    //   id: 'projects_1',
    //   title: 'Projects',
    //   template: 'projects',
    //   hasDuration: true,
    //   hasAchievements: true,
    //   isPersonal: false,
    //   items: [
    //     {
    //       id: 'proj_1',
    //       title: 'E-commerce Platform',
    //       duration: '2023',
    //       description: 'Full-stack e-commerce solution with payment processing',
    //       achievements: [
    //         'Built using React, Node.js, Express, and PostgreSQL',
    //         'Integrated Stripe payment processing and inventory management',
    //         'Implemented admin dashboard with real-time analytics',
    //         'Deployed on AWS with auto-scaling and load balancing'
    //       ]
    //     },
    //     {
    //       id: 'proj_2',
    //       title: 'Task Management App',
    //       duration: '2022',
    //       description: 'Collaborative project management tool',
    //       achievements: [
    //         'Developed with React, Redux, and Material-UI for frontend',
    //         'Built REST API using Python Flask and SQLAlchemy',
    //         'Real-time updates using WebSocket connections',
    //         'Implemented drag-and-drop Kanban board interface'
    //       ]
    //     }
    //   ]
    // },
    // {
    //   id: 'certifications_1',
    //   title: 'Certifications',
    //   template: 'certifications',
    //   hasDuration: true,
    //   hasAchievements: false,
    //   isPersonal: false,
    //   items: [
    //     {
    //       id: 'cert_1',
    //       title: 'AWS Certified Solutions Architect - Associate',
    //       issuer: 'Amazon Web Services',
    //       duration: '2023 - 2026',
    //       description: 'Validates expertise in designing distributed systems on AWS'
    //     },
    //     {
    //       id: 'cert_2',
    //       title: 'Google Cloud Professional Developer',
    //       issuer: 'Google Cloud Platform',
    //       duration: '2022 - 2025',
    //       description: 'Demonstrates proficiency in developing applications on Google Cloud'
    //     },
    //     {
    //       id: 'cert_3',
    //       title: 'Certified Kubernetes Administrator (CKA)',
    //       issuer: 'Cloud Native Computing Foundation',
    //       duration: '2023 - 2026',
    //       description: 'Validates skills in Kubernetes cluster administration'
    //     }
    //   ]
    // }
  ],
  activeSection: 'builder'
}

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    updatePersonalInfo: (state, action: PayloadAction<Partial<PersonalInfo>>) => {
        console.log('Updating personal info with:', action.payload);
      state.personalInfo = { ...state.personalInfo, ...action.payload }
    },
    addLink: (state, action: PayloadAction<{ id: string; label: string; url: string }>) => {
      state.personalInfo.additionalLinks.push(action.payload)
    },
    removeLink: (state, action: PayloadAction<string>) => {
      state.personalInfo.additionalLinks = state.personalInfo.additionalLinks.filter(link => link.id !== action.payload)
    },
    updateSections: (state, action: PayloadAction<DynamicSection[]>) => {
      state.dynamicSections = action.payload
    },
    addDynamicSection: (state, action: PayloadAction<DynamicSection>) => {
      state.dynamicSections.push(action.payload)
    },
    updateDynamicSection: (state, action: PayloadAction<{ id: string; data: Partial<DynamicSection> }>) => {
      const index = state.dynamicSections.findIndex(section => section.id === action.payload.id)
      if (index !== -1) {
        state.dynamicSections[index] = { ...state.dynamicSections[index], ...action.payload.data }
      }
    },
    removeDynamicSection: (state, action: PayloadAction<string>) => {
      state.dynamicSections = state.dynamicSections.filter(section => section.id !== action.payload)
    },
    addSectionItem: (state, action: PayloadAction<{ sectionId: string; item: SectionItem }>) => {
      const section = state.dynamicSections.find(s => s.id === action.payload.sectionId)
      if (section) {
        section.items.push(action.payload.item)
      }
    },
    updateSectionItem: (state, action: PayloadAction<{ sectionId: string; itemId: string; data: Partial<SectionItem> }>) => {
      const section = state.dynamicSections.find(s => s.id === action.payload.sectionId)
      if (section) {
        const itemIndex = section.items.findIndex(item => item.id === action.payload.itemId)
        if (itemIndex !== -1) {
          section.items[itemIndex] = { ...section.items[itemIndex], ...action.payload.data }
        }
      }
    },
    removeSectionItem: (state, action: PayloadAction<{ sectionId: string; itemId: string }>) => {
      const section = state.dynamicSections.find(s => s.id === action.payload.sectionId)
      if (section) {
        section.items = section.items.filter(item => item.id !== action.payload.itemId)
      }
    },
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSection = action.payload
    },
    updateFormatting: (state, action: PayloadAction<Partial<FormattingOptions>>) => {
      state.formatting = { ...state.formatting, ...action.payload }
    },
    updateFormattingSection: (state, action: PayloadAction<{ section: keyof FormattingOptions; data: any }>) => {
      (state.formatting as any)[action.payload.section] = { 
        ...(state.formatting as any)[action.payload.section], 
        ...action.payload.data 
      }
    }
  }
})

export const {
  updatePersonalInfo,
  addLink,
  removeLink,
  updateSections,
  addDynamicSection,
  updateDynamicSection,
  removeDynamicSection,
  addSectionItem,
  updateSectionItem,
  removeSectionItem,
  setActiveSection,
  updateFormatting,
  updateFormattingSection
} = resumeSlice.actions

// Types are already exported above
export default resumeSlice.reducer