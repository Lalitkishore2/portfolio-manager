export interface CanvasField {
  key: string;
  label: string;
  type: "text" | "textarea" | "tags";
  value: string | string[];
  placeholder?: string;
  constraint?: string;
}

export interface CanvasSelection {
  id: string;           // unique element id, e.g. "project-aquadot"
  schemaPath: string;   // e.g. "projects.aquadot"
  label: string;        // human label, e.g. "AquaDot"
  fields: CanvasField[];
}

export interface CanvasData {
  projects: {
    id: string;
    title: string;
    overview: string;
    tags: string[];
    role: string;
    outcomes: string[];
  }[];
  profile: {
    name: string;
    tagline: string;
    bio: string;
  };
  skills: {
    id: string;
    category: string;
    color: string;
    skills: string[];
  }[];
  timeline: {
    id: string;
    year: string;
    org: string;
    title: string;
    description: string;
    type: string;
  }[];
}

export const DEFAULT_CANVAS_DATA: CanvasData = {
  projects: [
    {
      id: "aquadot",
      title: "AquaDot",
      overview: "Real-time IoT water quality monitoring leveraging ESP32 edge ML inference — anomaly detection runs entirely on-device, enabling sub-second alerting without cloud round-trips. Deployed across 3 aquaculture farms.",
      tags: ["ESP32", "TensorFlow Lite", "React", "MQTT"],
      role: "Sole Engineer",
      outcomes: ["Reduced testing cost by 60%", "Maintained 99.8% edge runtime uptime", "94% anomaly detection accuracy"],
    },
    {
      id: "careersight",
      title: "CareerSight",
      overview: "Resume-to-JD semantic matching engine using transformer embeddings. Provides skill gap analysis and interview readiness scores for job seekers.",
      tags: ["Python", "FastAPI", "BERT", "React"],
      role: "Lead Engineer",
      outcomes: ["89% semantic match precision", "2,400 resumes processed in beta", "35% faster job search"],
    },
    {
      id: "smartflow",
      title: "SmartFlow IV",
      overview: "Automated intravenous drip monitor using ultrasonic sensing with WebSocket-powered dashboards for ward nurses.",
      tags: ["Arduino", "C++", "React", "WebSockets"],
      role: "Embedded + Frontend",
      outcomes: ["Eliminated manual monitoring in pilot ward", "Reduced IV adverse events by 40%"],
    },
  ],
  profile: {
    name: "Lalit Kishore",
    tagline: "ECE + Data Science Engineer — Building at the edge of hardware and intelligence.",
    bio: "Passionate engineer at the intersection of embedded systems and machine learning. I design IoT systems that think for themselves and full-stack products that ship fast.",
  },
  skills: [
    { id: "lang", category: "Languages", color: "#3b82f6", skills: ["Python", "C++", "TypeScript", "Go"] },
    { id: "fw", category: "Frameworks", color: "#10b981", skills: ["React", "FastAPI", "Node.js", "TensorFlow"] },
    { id: "tools", category: "Tools", color: "#a78bfa", skills: ["Docker", "GitHub Actions", "Supabase", "Vercel"] },
    { id: "hw", category: "Hardware", color: "#f59e0b", skills: ["ESP32", "Arduino", "FreeRTOS", "KiCad"] },
  ],
  timeline: [
    { id: "t1", year: "2025–Present", org: "Startup XYZ", title: "Software Engineering Intern", description: "Developed ML-powered inventory features reducing overstock by 18%.", type: "work" },
    { id: "t2", year: "2024", org: "NIT", title: "B.Tech ECE + Data Science", description: "Graduated with distinction. Capstone: AquaDot IoT platform.", type: "education" },
  ],
};
