import { useState } from "react";
import { Github, Linkedin, Globe, ExternalLink, Plus, Trash2, GripVertical } from "lucide-react";
import type { SelectedElement, DirtyRecord, EditableField } from "./editor-types";

/* --- Data shapes ---------------------------------------------- */

interface ProfileData {
  name: string;
  tagline: string;
  bio: string;
  github: string;
  linkedin: string;
  website: string;
}

interface ProjectData {
  id: string;
  title: string;
  overview: string;
  tags: string[];
  role: string;
  outcomes: string[];
  link: string;
}

interface SkillGroup {
  id: string;
  category: string;
  color: string;
  skills: string[];
}

interface TimelineEntry {
  id: string;
  year: string;
  org: string;
  title: string;
  description: string;
  type: "work" | "education" | "project";
}

/* --- Default data --------------------------------------------- */

const DEFAULT_PROFILE: ProfileData = {
  name: "Lalit Kishore",
  tagline: "ECE + Data Science Engineer — Building at the edge of hardware and intelligence.",
  bio: "Passionate engineer at the intersection of embedded systems and machine learning. I design IoT systems that think for themselves and full-stack products that ship fast. Currently exploring ML inference on constrained hardware and real-time data pipelines.",
  github: "github.com/Lalitkishore2",
  linkedin: "linkedin.com/in/lalitkishore",
  website: "lalitkishore.dev",
};

const DEFAULT_PROJECTS: ProjectData[] = [
  {
    id: "aquadot",
    title: "AquaDot",
    overview: "Real-time IoT water quality monitoring for aquaculture. Sensor node with edge ML inference, reducing manual testing cost by 60%.",
    tags: ["ESP32", "TensorFlow Lite", "React", "MQTT", "Python"],
    role: "Sole Engineer",
    outcomes: [
      "Reduced testing cost by 60%",
      "Achieved 94% anomaly detection accuracy",
      "Deployed in 3 commercial fish farms",
    ],
    link: "https://github.com/Lalitkishore2/aquadot",
  },
  {
    id: "careersight",
    title: "CareerSight",
    overview: "Resume-to-JD semantic matching engine using transformer embeddings. Provides skill gap analysis and interview readiness scores.",
    tags: ["Python", "FastAPI", "React", "BERT", "Supabase"],
    role: "Lead Engineer",
    outcomes: [
      "Built semantic match pipeline with 89% precision",
      "Processed 2,400 resumes in beta",
      "Reduced average job search time by 35%",
    ],
    link: "https://careersight.dev",
  },
  {
    id: "smartflow",
    title: "SmartFlow IV",
    overview: "Automated intravenous drip monitor using ultrasonic sensing and a real-time React dashboard for ward nurses.",
    tags: ["Arduino", "C++", "React", "Node.js", "WebSockets"],
    role: "Embedded + Frontend",
    outcomes: [
      "Eliminated manual drip monitoring in pilot ward",
      "Reduced IV-related adverse events by 40%",
      "Deployed in 2 hospitals",
    ],
    link: "https://github.com/Lalitkishore2/smartflow-iv",
  },
];

const DEFAULT_SKILLS: SkillGroup[] = [
  { id: "lang", category: "Languages", color: "#3b82f6", skills: ["Python", "C++", "TypeScript", "Go", "SQL"] },
  { id: "fw", category: "Frameworks", color: "#10b981", skills: ["React", "Node.js", "FastAPI", "TensorFlow", "Next.js"] },
  { id: "tools", category: "Tools & Platforms", color: "#a78bfa", skills: ["Docker", "GitHub Actions", "Supabase", "Vercel", "MQTT"] },
  { id: "hw", category: "Hardware / Embedded", color: "#f59e0b", skills: ["ESP32", "Arduino", "FreeRTOS", "UART/SPI/I2C", "KiCad"] },
];

const DEFAULT_TIMELINE: TimelineEntry[] = [
  { id: "t1", year: "2025–Present", org: "Startup XYZ", title: "Software Engineering Intern", description: "Developed ML-powered inventory features reducing overstock by 18%. Automated 4 manual reporting workflows and led TypeScript migration.", type: "work" },
  { id: "t2", year: "2024", org: "National Institute of Technology", title: "B.Tech, ECE + Data Science", description: "Graduated with distinction. Capstone: AquaDot IoT platform for aquaculture monitoring.", type: "education" },
  { id: "t3", year: "2023", org: "Open Source", title: "Freelance Full-Stack Developer", description: "Built 3 production web apps for clients across healthcare and logistics verticals.", type: "project" },
];

/* --- Editable element wrapper --------------------------------- */

function EditableEl({
  children,
  fieldPath,
  label,
  isSelected,
  diffState,
  onClick,
}: {
  children: React.ReactNode;
  fieldPath: string;
  label: string;
  isSelected: boolean;
  diffState?: "added" | "modified" | "deleted" | "clean";
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const borderColor = isSelected
    ? "var(--cms-accent-cobalt)"
    : diffState === "modified"
    ? "#f59e0b"
    : diffState === "added"
    ? "var(--cms-accent-emerald)"
    : diffState === "deleted"
    ? "var(--cms-accent-rose)"
    : hovered
    ? "var(--cms-accent-cobalt)"
    : "transparent";

  const borderStyle = isSelected ? "solid" : "dashed";
  const borderWidth = isSelected ? 2 : 1.5;

  const badgeLabel =
    diffState === "modified"
      ? "Edited"
      : diffState === "added"
      ? "Added"
      : diffState === "deleted"
      ? "Deleted"
      : null;

  const badgeColor =
    diffState === "modified"
      ? { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", text: "#f59e0b" }
      : diffState === "added"
      ? { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)", text: "var(--cms-accent-emerald)" }
      : diffState === "deleted"
      ? { bg: "rgba(244,63,94,0.15)", border: "rgba(244,63,94,0.3)", text: "var(--cms-accent-rose)" }
      : null;

  return (
    <div
      data-editable="true"
      data-field-path={fieldPath}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        position: "relative",
        cursor: "pointer",
        border: `${borderWidth}px ${borderStyle} ${borderColor}`,
        borderRadius: 6,
        padding: 4,
        transition: "border-color 80ms ease-in-out",
        opacity: diffState === "deleted" ? 0.35 : 1,
      }}
    >
      {/* Hover schema label */}
      {(hovered || isSelected) && (
        <div
          style={{
            position: "absolute",
            top: -22,
            left: 0,
            background: "rgba(9,9,11,0.9)",
            border: "1px solid var(--cms-border-glass)",
            borderRadius: 4,
            padding: "2px 7px",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            color: isSelected ? "var(--cms-accent-cobalt)" : "var(--cms-text-secondary)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {fieldPath}
        </div>
      )}

      {/* Corner handles when selected */}
      {isSelected && (
        <>
          {[
            { top: -4, left: -4 },
            { top: -4, right: -4 },
            { bottom: -4, left: -4 },
            { bottom: -4, right: -4 },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 6,
                height: 6,
                background: "var(--cms-accent-cobalt)",
                borderRadius: 1,
                pointerEvents: "none",
                ...pos,
              }}
            />
          ))}
        </>
      )}

      {/* Diff badge */}
      {badgeLabel && badgeColor && (
        <div
          style={{
            position: "absolute",
            top: -1,
            left: -1,
            padding: "1px 7px",
            background: badgeColor.bg,
            border: `1px solid ${badgeColor.border}`,
            borderRadius: "4px 4px 4px 0",
            fontSize: 10,
            color: badgeColor.text,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {badgeLabel}
        </div>
      )}

      {children}
    </div>
  );
}

/* --- Main canvas sections ------------------------------------- */

interface CanvasEditorProps {
  section: "profile" | "projects" | "arsenal" | "timeline";
  selectedId: string | null;
  dirtyRecords: DirtyRecord[];
  onSelectElement: (el: SelectedElement) => void;
  onDeselect: () => void;
  profileData: ProfileData;
  projectsData: ProjectData[];
  skillsData: SkillGroup[];
  timelineData: TimelineEntry[];
  onAddProject: () => void;
  onDeleteProject: (id: string) => void;
}

function getDiffState(dirtyRecords: DirtyRecord[], sectionId: string, recordId: string) {
  const rec = dirtyRecords.find((d) => d.sectionId === sectionId && d.recordId === recordId);
  return rec?.state ?? "clean";
}

export function CanvasEditor({
  section,
  selectedId,
  dirtyRecords,
  onSelectElement,
  onDeselect,
  profileData,
  projectsData,
  skillsData,
  timelineData,
  onAddProject,
  onDeleteProject,
}: CanvasEditorProps) {
  return (
    <div
      style={{ width: "100%", height: "100%", overflowY: "auto", padding: "40px 48px" }}
      onClick={onDeselect}
    >
      {section === "profile" && (
        <ProfileCanvas
          data={profileData}
          selectedId={selectedId}
          dirtyRecords={dirtyRecords}
          onSelect={onSelectElement}
        />
      )}
      {section === "projects" && (
        <ProjectsCanvas
          data={projectsData}
          selectedId={selectedId}
          dirtyRecords={dirtyRecords}
          onSelect={onSelectElement}
          onAdd={onAddProject}
          onDelete={onDeleteProject}
        />
      )}
      {section === "arsenal" && (
        <ArsenalCanvas
          data={skillsData}
          selectedId={selectedId}
          dirtyRecords={dirtyRecords}
          onSelect={onSelectElement}
        />
      )}
      {section === "timeline" && (
        <TimelineCanvas
          data={timelineData}
          selectedId={selectedId}
          dirtyRecords={dirtyRecords}
          onSelect={onSelectElement}
        />
      )}
    </div>
  );
}

/* --- Profile Canvas -------------------------------------------- */

function ProfileCanvas({
  data,
  selectedId,
  dirtyRecords,
  onSelect,
}: {
  data: ProfileData;
  selectedId: string | null;
  dirtyRecords: DirtyRecord[];
  onSelect: (el: SelectedElement) => void;
}) {
  function makeFields(fields: EditableField[]): EditableField[] {
    return fields;
  }

  const nameFields = makeFields([
    { key: "name", label: "Full Name", type: "text", value: data.name, constraint: "4–60 chars" },
    { key: "tagline", label: "Tagline", type: "textarea", value: data.tagline, constraint: "20–120 chars", aiCapable: true },
  ]);

  const bioFields = makeFields([
    { key: "bio", label: "Biography", type: "textarea", value: data.bio, constraint: "40–400 chars", aiCapable: true },
  ]);

  const socialFields = makeFields([
    { key: "github", label: "GitHub URL", type: "text", value: data.github },
    { key: "linkedin", label: "LinkedIn URL", type: "text", value: data.linkedin },
    { key: "website", label: "Website", type: "text", value: data.website },
  ]);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      {/* Section label */}
      <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 32 }}>
        content/profile.json · Profile / Hero
      </div>

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(24,24,27,0.9), rgba(9,9,11,0.95))",
          border: "1px solid var(--cms-border-glass)",
          borderRadius: 16,
          padding: "48px 52px",
          marginBottom: 24,
        }}
      >
        <EditableEl
          fieldPath="profile.name + profile.tagline"
          label="Name & Tagline"
          isSelected={selectedId === "profile-hero"}
          diffState={getDiffState(dirtyRecords, "profile", "hero")}
          onClick={() =>
            onSelect({
              sectionId: "profile",
              recordId: "hero",
              fieldPath: "profile / name + tagline",
              label: "Hero — Name & Tagline",
              fields: nameFields,
              diffState: getDiffState(dirtyRecords, "profile", "hero"),
            })
          }
        >
          <h1
            style={{
              color: "var(--cms-text-primary)",
              fontSize: 44,
              fontWeight: 700,
              lineHeight: "52px",
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            {data.name}
          </h1>
          <p
            style={{
              color: "var(--cms-accent-cobalt)",
              fontSize: 18,
              lineHeight: "28px",
              margin: 0,
            }}
          >
            {data.tagline}
          </p>
        </EditableEl>

        <div style={{ marginTop: 28 }}>
          <EditableEl
            fieldPath="profile.bio"
            label="Biography"
            isSelected={selectedId === "profile-bio"}
            diffState={getDiffState(dirtyRecords, "profile", "bio")}
            onClick={() =>
              onSelect({
                sectionId: "profile",
                recordId: "bio",
                fieldPath: "profile / bio",
                label: "Biography",
                fields: bioFields,
                diffState: getDiffState(dirtyRecords, "profile", "bio"),
              })
            }
          >
            <p
              style={{
                color: "var(--cms-text-secondary)",
                fontSize: 16,
                lineHeight: "26px",
                margin: 0,
                maxWidth: 640,
              }}
            >
              {data.bio}
            </p>
          </EditableEl>
        </div>

        <div style={{ marginTop: 28 }}>
          <EditableEl
            fieldPath="profile.social"
            label="Social Links"
            isSelected={selectedId === "profile-social"}
            diffState={getDiffState(dirtyRecords, "profile", "social")}
            onClick={() =>
              onSelect({
                sectionId: "profile",
                recordId: "social",
                fieldPath: "profile / social links",
                label: "Social Links",
                fields: socialFields,
                diffState: getDiffState(dirtyRecords, "profile", "social"),
              })
            }
          >
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {[
                { icon: Github, label: data.github },
                { icon: Linkedin, label: data.linkedin },
                { icon: Globe, label: data.website },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cms-text-secondary)", fontSize: 13 }}>
                  <Icon size={14} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </EditableEl>
        </div>
      </div>
    </div>
  );
}

/* --- Projects Canvas ------------------------------------------- */

function ProjectsCanvas({
  data,
  selectedId,
  dirtyRecords,
  onSelect,
  onAdd,
  onDelete,
}: {
  data: ProjectData[];
  selectedId: string | null;
  dirtyRecords: DirtyRecord[];
  onSelect: (el: SelectedElement) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          content/projects.json · {data.length} projects
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: 8,
            color: "var(--cms-accent-cobalt)",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Plus size={13} />
          New Project
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {data.map((project) => {
          const diff = getDiffState(dirtyRecords, "projects", project.id);
          return (
            <EditableEl
              key={project.id}
              fieldPath={`projects/${project.id}`}
              label={project.title}
              isSelected={selectedId === `project-${project.id}`}
              diffState={diff}
              onClick={() =>
                onSelect({
                  sectionId: "projects",
                  recordId: project.id,
                  fieldPath: `projects/${project.id}`,
                  label: project.title,
                  fields: [
                    { key: "title", label: "Title", type: "text", value: project.title, constraint: "8–80 chars" },
                    { key: "overview", label: "Overview", type: "textarea", value: project.overview, constraint: "40–400 chars", aiCapable: true },
                    { key: "role", label: "Role", type: "text", value: project.role },
                    { key: "tags", label: "Technologies", type: "tags", value: project.tags },
                    { key: "outcomes", label: "Outcomes", type: "list", value: project.outcomes, constraint: "20–120 chars, past-tense verb", aiCapable: true },
                    { key: "link", label: "Project URL", type: "text", value: project.link },
                  ],
                  diffState: diff,
                })
              }
            >
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(24,24,27,0.9), rgba(9,9,11,0.95))",
                  border: "1px solid var(--cms-border-glass)",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <h3
                    style={{
                      color: "var(--cms-text-primary)",
                      fontSize: 18,
                      fontWeight: 600,
                      margin: 0,
                      lineHeight: "26px",
                    }}
                  >
                    {project.title}
                  </h3>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ color: "var(--cms-text-secondary)", fontSize: 11 }}>{project.role}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--cms-text-secondary)",
                        padding: 4,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="hover:text-rose-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p style={{ color: "var(--cms-text-secondary)", fontSize: 13, lineHeight: "21px", margin: "0 0 14px" }}>
                  {project.overview}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                  {project.tags.map((t) => (
                    <span key={t} style={{ padding: "2px 8px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, fontSize: 11, color: "var(--cms-accent-cobalt)" }}>
                      {t}
                    </span>
                  ))}
                </div>

                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                  {project.outcomes.map((o, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "var(--cms-text-secondary)" }}>
                      <span style={{ color: "var(--cms-accent-emerald)", marginTop: 2, flexShrink: 0 }}>▸</span>
                      {o}
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, color: "var(--cms-accent-cobalt)", fontSize: 12 }}>
                  <ExternalLink size={11} />
                  <span>{project.link.replace("https://", "")}</span>
                </div>
              </div>
            </EditableEl>
          );
        })}
      </div>
    </div>
  );
}

/* --- Arsenal Canvas -------------------------------------------- */

function ArsenalCanvas({
  data,
  selectedId,
  dirtyRecords,
  onSelect,
}: {
  data: SkillGroup[];
  selectedId: string | null;
  dirtyRecords: DirtyRecord[];
  onSelect: (el: SelectedElement) => void;
}) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 32 }}>
        content/skills.json · Technical Arsenal
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {data.map((group) => {
          const diff = getDiffState(dirtyRecords, "arsenal", group.id);
          return (
            <EditableEl
              key={group.id}
              fieldPath={`skills/${group.id}`}
              label={group.category}
              isSelected={selectedId === `arsenal-${group.id}`}
              diffState={diff}
              onClick={() =>
                onSelect({
                  sectionId: "arsenal",
                  recordId: group.id,
                  fieldPath: `skills/${group.id}`,
                  label: group.category,
                  fields: [
                    { key: "category", label: "Category Label", type: "text", value: group.category, constraint: "2–30 chars" },
                    { key: "skills", label: "Skills", type: "list", value: group.skills, constraint: "2–30 chars each" },
                  ],
                  diffState: diff,
                })
              }
            >
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(24,24,27,0.9), rgba(9,9,11,0.95))",
                  border: "1px solid var(--cms-border-glass)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: group.color }} />
                  <span style={{ color: "var(--cms-text-primary)", fontSize: 15, fontWeight: 600 }}>{group.category}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        padding: "4px 10px",
                        background: `${group.color}12`,
                        border: `1px solid ${group.color}30`,
                        borderRadius: 8,
                        fontSize: 12,
                        color: group.color,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </EditableEl>
          );
        })}
      </div>
    </div>
  );
}

/* --- Timeline Canvas ------------------------------------------- */

const TYPE_COLORS: Record<string, string> = {
  work: "var(--cms-accent-cobalt)",
  education: "var(--cms-accent-emerald)",
  project: "#a78bfa",
};

function TimelineCanvas({
  data,
  selectedId,
  dirtyRecords,
  onSelect,
}: {
  data: TimelineEntry[];
  selectedId: string | null;
  dirtyRecords: DirtyRecord[];
  onSelect: (el: SelectedElement) => void;
}) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 32 }}>
        content/experience.json · Timeline
      </div>

      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 10,
            bottom: 0,
            width: 1,
            background: "var(--cms-border-dark)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {data.map((entry) => {
            const color = TYPE_COLORS[entry.type];
            const diff = getDiffState(dirtyRecords, "timeline", entry.id);
            return (
              <div key={entry.id} style={{ display: "flex", gap: 20 }}>
                {/* Timeline dot */}
                <div
                  style={{
                    flexShrink: 0,
                    width: 48,
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: 12,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: color,
                      border: "2px solid var(--cms-bg-obsidian)",
                      boxShadow: `0 0 0 4px ${color}20`,
                    }}
                  />
                </div>

                <div style={{ flex: 1, paddingBottom: 4 }}>
                  <EditableEl
                    fieldPath={`experience/${entry.id}`}
                    label={entry.title}
                    isSelected={selectedId === `timeline-${entry.id}`}
                    diffState={diff}
                    onClick={() =>
                      onSelect({
                        sectionId: "timeline",
                        recordId: entry.id,
                        fieldPath: `experience/${entry.id}`,
                        label: `${entry.title} @ ${entry.org}`,
                        fields: [
                          { key: "year", label: "Year / Period", type: "text", value: entry.year },
                          { key: "org", label: "Organisation", type: "text", value: entry.org },
                          { key: "title", label: "Role / Title", type: "text", value: entry.title, constraint: "8–80 chars" },
                          { key: "description", label: "Description", type: "textarea", value: entry.description, constraint: "30–200 chars", aiCapable: true },
                        ],
                        diffState: diff,
                      })
                    }
                  >
                    <div
                      style={{
                        background: "linear-gradient(135deg, rgba(24,24,27,0.9), rgba(9,9,11,0.95))",
                        border: "1px solid var(--cms-border-glass)",
                        borderRadius: 10,
                        padding: "16px 20px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                        <div>
                          <div style={{ color: "var(--cms-text-primary)", fontSize: 15, fontWeight: 600 }}>{entry.title}</div>
                          <div style={{ color: color, fontSize: 12, marginTop: 2 }}>{entry.org}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              background: `${color}15`,
                              border: `1px solid ${color}30`,
                              borderRadius: 12,
                              fontSize: 11,
                              color,
                            }}
                          >
                            {entry.type}
                          </span>
                          <span style={{ color: "var(--cms-text-secondary)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                            {entry.year}
                          </span>
                        </div>
                      </div>
                      <p style={{ color: "var(--cms-text-secondary)", fontSize: 13, lineHeight: "21px", margin: 0 }}>
                        {entry.description}
                      </p>
                    </div>
                  </EditableEl>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --- Export data defaults for App.tsx -------------------------- */

export { DEFAULT_PROFILE, DEFAULT_PROJECTS, DEFAULT_SKILLS, DEFAULT_TIMELINE };
export type { ProfileData, ProjectData, SkillGroup, TimelineEntry };
