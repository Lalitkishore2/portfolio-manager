"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import dynamic from "next/dynamic";
import { CMSSidebar, type CMSView } from "./CMSSidebar";
import { ProjectList } from "./ProjectList";
import { CommandPalette } from "./ui/CommandPalette";
import { PublishModal } from "./ui/PublishModal";

// Dynamically import heavy views
const ProjectEditor = dynamic(() => import("./ProjectEditor").then((mod) => mod.ProjectEditor), { ssr: false });
const AnalyticsDashboard = dynamic(() => import("./AnalyticsDashboard").then((mod) => mod.AnalyticsDashboard), { ssr: false });
const ChatbotAuditorScreen = dynamic(() => import("./ChatbotAuditorScreen").then((mod) => mod.ChatbotAuditorScreen), { ssr: false });
const FormspreeMailsScreen = dynamic(() => import("./FormspreeMailsScreen").then((mod) => mod.FormspreeMailsScreen), { ssr: false });
const MakePage = dynamic(() => import("./MakePage").then((mod) => mod.MakePage), { ssr: false });
const ProfilePage = dynamic(() => import("./ProfilePage").then((mod) => mod.ProfilePage), { ssr: false });
const ExperiencePage = dynamic(() => import("./ExperiencePage").then((mod) => mod.ExperiencePage), { ssr: false });
const SkillsPage = dynamic(() => import("./SkillsPage").then((mod) => mod.SkillsPage), { ssr: false });
const SettingsPage = dynamic(() => import("./SettingsPage").then((mod) => mod.SettingsPage), { ssr: false });
const TokensPage = dynamic(() => import("./TokensPage").then((mod) => mod.TokensPage), { ssr: false });
import { type Project } from "./cms-types";
import { useMakeStore } from "../../store/makeStore";
import { useEffect } from "react";

/* --- App ------------------------------------------------------- */

export default function App({
  initialProjects, initialProjectsSha,
  initialProfile, initialProfileSha,
  initialSkills, initialSkillsSha,
  initialExperience, initialExperienceSha,
  initialChatbot, initialChatbotSha,
}: {
  initialProjects: Project[]; initialProjectsSha: string;
  initialProfile: any; initialProfileSha: string;
  initialSkills: any[]; initialSkillsSha: string;
  initialExperience: any[]; initialExperienceSha: string;
  initialChatbot: any; initialChatbotSha: string;
}) {
  const { siteDocument, setSiteDocument, addVersion, versions } = useMakeStore();

  const [activeView, setActiveView] = useState<CMSView>("projects");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectsSha, setProjectsSha] = useState(initialProjectsSha);
  const [profileSha, setProfileSha] = useState(initialProfileSha);
  const [skillsSha, setSkillsSha] = useState(initialSkillsSha);
  const [experienceSha, setExperienceSha] = useState(initialExperienceSha);
  const [chatbot, setChatbot] = useState(initialChatbot);
  const [chatbotSha, setChatbotSha] = useState(initialChatbotSha);
  
  const currentDoc = siteDocument?.projects ? siteDocument : {
    projects: initialProjects,
    profile: initialProfile,
    skills: initialSkills,
    experience: initialExperience
  };

  useEffect(() => {
    // Only initialize if the store is empty (e.g. first load) to prevent overwriting AI drafts
    if (!siteDocument?.projects) {
      setSiteDocument(currentDoc);
      if (useMakeStore.getState().versions.length === 0) {
        addVersion("Initial Load", currentDoc);
      }
    }
  }, []);

  const projects = currentDoc.projects || [];
  const profile = currentDoc.profile || {};
  const skills = currentDoc.skills || [];
  const experience = currentDoc.experience || [];
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  function handleNavigate(view: CMSView) {
    setActiveView(view);
    if (view !== "project-editor") setSelectedProjectId(null);
  }

  function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    setActiveView("project-editor");
  }

  async function handleNewProject() {
    const uid = () => Math.random().toString(36).substring(2, 9);
    const newProj: Project = {
      id: uid(),
      title: "Untitled Project",
      tagline: "A new portfolio project",
      slug: `new-project-${Date.now()}`,
      index: "00/",
      year: `${new Date().getFullYear()}`,
      accentColor: "#3B82F6",
      overview: "",
      problem: "",
      description: "A new project",
      tags: [],
      metric: "",
      rotation: 0,
      architecture: [],
      techStack: [],
      role: [],
      challenges: [],
      status: "prototype",
      category: "WEB",
      nextSlug: "",
      prevSlug: "",
      stats: [],
      updatedAt: new Date().toISOString(),
    };
    const newProjects = [newProj, ...projects];
    setSiteDocument({ ...currentDoc, projects: newProjects });
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newProjects, sha: projectsSha }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error");
      }
      const { sha } = await response.json();
      setProjectsSha(sha);
      handleSelectProject(newProj.id);
      toast.success("New project created!");
    } catch (e) {
      console.error("Failed to create project", e);
      toast.error("Failed to create new project");
    }
  }

  async function handleSaveProject(updated: Project) {
    const newProjects = projects.map((p: Project) => p.id === updated.id ? updated : p);
    setSiteDocument({ ...currentDoc, projects: newProjects });
    
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: newProjects, sha: projectsSha }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save project changes");
    }
    
    const { sha } = await response.json();
    setProjectsSha(sha);
  }

  async function handleDeleteProject(id: string) {
    const deletedProject = projects.find((p: Project) => p.id === id);
    if (!deletedProject) return;
    
    const remainingProjects = projects.filter((p: Project) => p.id !== id);
    
    const prevSlug = deletedProject.prevSlug;
    const nextSlug = deletedProject.nextSlug;
    const slug = deletedProject.slug;
    
    const newProjects = remainingProjects.map((p: Project) => {
      let updated = { ...p };
      if (updated.nextSlug === slug) updated.nextSlug = nextSlug;
      if (updated.prevSlug === slug) updated.prevSlug = prevSlug;
      return updated;
    });
    
    setSiteDocument({ ...currentDoc, projects: newProjects });
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newProjects, sha: projectsSha }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error");
      }
      const { sha } = await response.json();
      setProjectsSha(sha);
      handleNavigate("projects");
      toast.success("Project deleted successfully", { description: `${deletedProject.title} was removed` });
    } catch (e) {
      console.error("Failed to delete project", e);
      toast.error("Failed to delete project");
    }
  }

  async function handleSaveProfile(updatedProfile: any) {
    setSiteDocument({ ...currentDoc, profile: updatedProfile });
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedProfile, sha: profileSha }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error");
      }
      const { sha } = await response.json();
      setProfileSha(sha);
    } catch (e) {
      console.error("Failed to save profile", e);
      throw e;
    }
  }

  async function handleSaveSkills(updatedSkills: any[]) {
    setSiteDocument({ ...currentDoc, skills: updatedSkills });
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedSkills, sha: skillsSha }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error");
      }
      const { sha } = await response.json();
      setSkillsSha(sha);
    } catch (e) {
      console.error("Failed to save skills", e);
      throw e;
    }
  }

  async function handleSaveExperience(updatedExperience: any[]) {
    setSiteDocument({ ...currentDoc, experience: updatedExperience });
    try {
      const response = await fetch('/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedExperience, sha: experienceSha }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error");
      }
      const { sha } = await response.json();
      setExperienceSha(sha);
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
        body: JSON.stringify({ data: updatedChatbot, sha: chatbotSha }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error");
      }
      const { sha } = await response.json();
      setChatbotSha(sha);
    } catch (e) {
      console.error("Failed to save chatbot", e);
      throw e;
    }
  }

  function handlePublish() {
    setPublishModalOpen(true);
  }

  async function confirmPublish(message: string) {
    setPublishing(true);
    try {
      const response = await fetch("/api/publish", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to push to GitHub");
      }
      setPublished(true);
      toast.success(data.message || `Changes pushed: ${message}`);
      setTimeout(() => setPublished(false), 3000);
    } catch (e: any) {
      console.error("Git publish failed", e);
      toast.error(e.message || "Failed to push to GitHub");
    } finally {
      setPublishing(false);
    }
  }

  const selectedProject = projects.find((p: Project) => p.id === selectedProjectId) ?? null;

  function renderMain() {
    switch (activeView) {
      case "projects":
        return (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
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
        return <AnalyticsDashboard onNavigate={handleNavigate} />;
      case "chatbot":
      case "formspree":
        return <ChatbotAuditorScreen chatbotData={chatbot} onSave={handleSaveChatbot} />;
      case "make":
        return <MakePage onBack={() => handleNavigate("projects")} />;
      case "profile":
        return <ProfilePage initialData={profile} onSave={handleSaveProfile} />;
      case "experience":
        return <ExperiencePage initialData={experience} onSave={handleSaveExperience} />;
      case "skills":
        return <SkillsPage initialData={skills} onSave={handleSaveSkills} />;
      case "tokens":
        return <TokensPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return null;
    }
  }

  return (
    <div
      className="cms-app-container"
      style={{
        width: "100dvw",
        height: "100dvh",
        display: "flex",
        overflow: "hidden",
        background: "#09090b",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {activeView !== "make" && (
        <CMSSidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          onPublish={handlePublish}
          publishing={publishing}
          published={published}
        />
      )}

      {/* Main content */}
      <div className="cms-main-viewport" style={{ flex: 1, display: "flex", overflow: "hidden", width: activeView === "make" ? "100dvw" : "auto" }}>
        {renderMain()}
      </div>

      <CommandPalette onNavigate={handleNavigate} onSelectProject={handleSelectProject} />
      <PublishModal isOpen={publishModalOpen} onClose={() => setPublishModalOpen(false)} onConfirmPublish={confirmPublish} />

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