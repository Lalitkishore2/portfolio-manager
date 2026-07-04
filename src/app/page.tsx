import { getContentJSON } from "@/lib/github";
import App from "@/components/cms/App";

export const dynamic = "force-dynamic"; // Always fetch fresh data from GitHub

export default async function Page() {
  // Load all content from GitHub repository via API
  let initialProjects: any[] = [];
  let initialProfile: any = null;
  let initialSkills: any[] = [];
  let initialExperience: any[] = [];
  let initialChatbot: any = null;

  try {
    const { data } = await getContentJSON("projects.json");
    const projects = data as any[];
    initialProjects = projects.map((p: any) => ({ ...p, id: p.slug }));
  } catch (e) {
    console.error("Failed to load projects from GitHub", e);
  }

  try {
    const { data } = await getContentJSON("profile.json");
    initialProfile = data;
  } catch (e) {
    console.error("Failed to load profile from GitHub", e);
  }

  try {
    const { data } = await getContentJSON("skills.json");
    initialSkills = data as any[];
  } catch (e) {
    console.error("Failed to load skills from GitHub", e);
  }

  try {
    const { data } = await getContentJSON("experience.json");
    initialExperience = data as any[];
  } catch (e) {
    console.error("Failed to load experience from GitHub", e);
  }

  try {
    const { data } = await getContentJSON("chatbot.json");
    initialChatbot = data;
  } catch (e) {
    console.error("Failed to load chatbot from GitHub", e);
  }

  return (
    <App
      initialProjects={initialProjects}
      initialProfile={initialProfile}
      initialSkills={initialSkills}
      initialExperience={initialExperience}
      initialChatbot={initialChatbot}
    />
  );
}
