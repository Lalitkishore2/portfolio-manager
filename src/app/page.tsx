import { getContentJSON } from "@/lib/github";
import App from "@/components/cms/App";

export const dynamic = "force-dynamic";

export default async function Page() {
  let initialProjects: any[] = [];
  let initialProjectsSha = "";
  
  let initialProfile: any = null;
  let initialProfileSha = "";
  
  let initialSkills: any[] = [];
  let initialSkillsSha = "";
  
  let initialExperience: any[] = [];
  let initialExperienceSha = "";
  
  let initialChatbot: any = null;
  let initialChatbotSha = "";

  try {
    const { data, sha } = await getContentJSON("projects.json");
    const projects = data as any[];
    initialProjects = projects.map((p: any) => ({ ...p, id: p.slug }));
    initialProjectsSha = sha;
  } catch (e) {
    console.error("Failed to load projects", e);
  }

  try {
    const { data, sha } = await getContentJSON("profile.json");
    initialProfile = data;
    initialProfileSha = sha;
  } catch (e) {
    console.error("Failed to load profile", e);
  }

  try {
    const { data, sha } = await getContentJSON("skills.json");
    initialSkills = data as any[];
    initialSkillsSha = sha;
  } catch (e) {
    console.error("Failed to load skills", e);
  }

  try {
    const { data, sha } = await getContentJSON("experience.json");
    initialExperience = data as any[];
    initialExperienceSha = sha;
  } catch (e) {
    console.error("Failed to load experience", e);
  }

  try {
    const { data, sha } = await getContentJSON("chatbot.json");
    initialChatbot = data;
    initialChatbotSha = sha;
  } catch (e) {
    console.error("Failed to load chatbot", e);
  }

  return (
    <App
      initialProjects={initialProjects}
      initialProjectsSha={initialProjectsSha}
      initialProfile={initialProfile}
      initialProfileSha={initialProfileSha}
      initialSkills={initialSkills}
      initialSkillsSha={initialSkillsSha}
      initialExperience={initialExperience}
      initialExperienceSha={initialExperienceSha}
      initialChatbot={initialChatbot}
      initialChatbotSha={initialChatbotSha}
    />
  );
}
