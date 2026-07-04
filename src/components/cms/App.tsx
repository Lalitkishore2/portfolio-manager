"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import { CMSSidebar, type CMSView } from "./CMSSidebar";
import { ProjectList } from "./ProjectList";
import { ProjectEditor } from "./ProjectEditor";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { ChatbotAuditorScreen } from "./ChatbotAuditorScreen";
import { MakePage } from "./MakePage";
import { ProfilePage } from "./ProfilePage";
import { ExperiencePage } from "./ExperiencePage";
import { SkillsPage } from "./SkillsPage";
import { SettingsPage } from "./SettingsPage";
import { type Project } from "./cms-types";

/* --- App ------------------------------------------------------- */

export default function App({
  initialProjects,
  initialProfile,
  initialSkills,
  initialExperience,
  initialChatbot,
}: {
  initialProjects: Project[];
  initialProfile: any;
  initialSkills: any[];
  initialExperience: any[];
  initialChatbot: any;
}) {
  const [activeView, setActiveView] = useState<CMSView>("projects");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [profile, setProfile] = useState(initialProfile);
  const [skills, setSkills] = useState<any[]>(initialSkills);
  const [experience, setExperience] = useState<any[]>(initialExperience);
  const [chatbot, setChatbot] = useState(initialChatbot);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  function handleNavigate(view: CMSView) {
    setActiveView(view);
    if (view !== "project-editor") setSelectedProjectId(null);
  }

  function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    setActiveView("project-editor");
  }

  async function handleSaveProject(updated: Project) {
    const newProjects = projects.map((p) => p.id === updated.id ? updated : p);
    setProjects(newProjects);
    
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProjects),
    });
    if (!response.ok) {
      throw new Error("Failed to save project changes");
    }
  }

  async function handleDeleteProject(id: string) {
    const deletedProject = projects.find((p) => p.id === id);
    if (!deletedProject) return;
    
    const remainingProjects = projects.filter((p) => p.id !== id);
    
    // Update nextSlug/prevSlug link structure
    const prevSlug = deletedProject.prevSlug;
    const nextSlug = deletedProject.nextSlug;
    const slug = deletedProject.slug;
    
    const newProjects = remainingProjects.map((p) => {
      let updated = { ...p };
      if (updated.nextSlug === slug) {
        updated.nextSlug = nextSlug;
      }
      if (updated.prevSlug === slug) {
        updated.prevSlug = prevSlug;
      }
      return updated;
    });
    
    setProjects(newProjects);
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjects),
      });
      if (!response.ok) throw new Error("Server error");
      handleNavigate("projects");
      toast.success("Project deleted successfully", { description: `${deletedProject.title} was removed` });
    } catch (e) {
      console.error("Failed to delete project", e);
      toast.error("Failed to delete project");
    }
  }

  async function handleSaveProfile(updatedProfile: any) {
    setProfile(updatedProfile);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });
      if (!response.ok) throw new Error("Server error");
    } catch (e) {
      console.error("Failed to save profile", e);
      throw e;
    }
  }

  async function handleSaveSkills(updatedSkills: any[]) {
    setSkills(updatedSkills);
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSkills),
      });
      if (!response.ok) throw new Error("Server error");
    } catch (e) {
      console.error("Failed to save skills", e);
      throw e;
    }
  }

  async function handleSaveExperience(updatedExperience: any[]) {
    setExperience(updatedExperience);
    try {
      const response = await fetch('/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExperience),
      });
      if (!response.ok) throw new Error("Server error");
    } catch (e) {
      console.error("Failed to save experience", e);
      throw e;
    }
  }

  async function handleSaveChatbot(updatedChatbot: any) {
    setChatbot(updatedChatbot);
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedChatbot),
      });
      if (!response.ok) throw new Error("Server error");
    } catch (e) {
      console.error("Failed to save chatbot", e);
      throw e;
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const response = await fetch("/api/publish", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to push to GitHub");
      }
      setPublished(true);
      toast.success(data.message || "Changes pushed to GitHub successfully!");
      setTimeout(() => setPublished(false), 3000);
    } catch (e: any) {
      console.error("Git publish failed", e);
      toast.error(e.message || "Failed to push to GitHub");
    } finally {
      setPublishing(false);
    }
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  function renderMain() {
    switch (activeView) {
      case "projects":
        return (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            onNewProject={() => {}}
          />
        );
      case "project-editor":
        if (!selectedProject) {
          handleNavigate("projects");
          return null;
        }
        return (
          <ProjectEditor
            project={selectedProject}
            onBack={() => handleNavigate("projects")}
            onSave={handleSaveProject}
            onDelete={handleDeleteProject}
          />
        );
      case "analytics":
        return <AnalyticsDashboard />;
      case "chatbot":
        return <ChatbotAuditorScreen chatbotData={chatbot} onSave={handleSaveChatbot} />;
      case "make":
        return <MakePage onBack={() => handleNavigate("projects")} />;
      case "profile":
        return <ProfilePage initialData={profile} onSave={handleSaveProfile} />;
      case "experience":
        return <ExperiencePage initialData={experience} onSave={handleSaveExperience} />;
      case "skills":
        return <SkillsPage initialData={skills} onSave={handleSaveSkills} />;
      case "settings":
        return <SettingsPage />;
      default:
        return null;
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        background: "#09090b",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <CMSSidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        onPublish={handlePublish}
        publishing={publishing}
        published={published}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {renderMain()}
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fafafa",
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
          },
        }}
      />
    </div>
  );
}