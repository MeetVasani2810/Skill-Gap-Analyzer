import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface SkillResult {
    skill: string;
    similarity?: number;
}

export interface AnalysisResult {
    match_percentage: number;
    missing_skills: SkillResult[];
    covered_skills: SkillResult[];
    roadmap: string;
}

export const generateSkills = async (role: string, experienceLevel: string): Promise<string[]> => {
    const response = await api.post('/generate-skills', { role, experience_level: experienceLevel });
    return response.data.skills;
};

export const analyzeGap = async (
    resume: File,
    jobDescription?: string,
    skillsList?: string[]
): Promise<AnalysisResult> => {
    const formData = new FormData();
    formData.append('resume', resume);

    if (jobDescription) {
        formData.append('job_description', jobDescription);
    }

    if (skillsList && skillsList.length > 0) {
        formData.append('skills_list', JSON.stringify(skillsList));
    }

    const response = await api.post('/analyze', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const extractResumeData = async (resume: File): Promise<{ text: string; skills: string[] }> => {
    const formData = new FormData();
    formData.append('resume', resume);

    const response = await api.post('/extract-resume-data', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const analyzeGapLists = async (
    resumeSkills: string[],
    targetRole: string,
    experienceLevel: string
): Promise<AnalysisResultList> => {
    const response = await api.post('/analyze-gap-lists', {
        resume_skills: resumeSkills,
        target_role: targetRole,
        experience_level: experienceLevel
    });
    return response.data;
};

export interface SkillGapItem {
    skill: string;
    status: "missing" | "covered";
}

export interface AnalysisResultList {
    match_percentage: number;
    missing_skills: SkillGapItem[];
    covered_skills: SkillGapItem[];
    target_skills_full: string[];
    roadmap: string;
}

export interface DeadlineResponse {
    roadmap_id: string;
    deadline: string;
    days_remaining: number;
    created_at: string;
    updated_at: string;
}

export const setDeadline = async (roadmapId: string, deadline: string): Promise<DeadlineResponse> => {
    const response = await api.post('/roadmap/deadline', {
        roadmap_id: roadmapId,
        deadline: deadline
    });
    return response.data;
};

export const getDeadline = async (roadmapId: string): Promise<DeadlineResponse> => {
    const response = await api.get(`/roadmap/${roadmapId}/deadline`);
    return response.data;
};

export const deleteDeadline = async (roadmapId: string): Promise<void> => {
    await api.delete(`/roadmap/${roadmapId}/deadline`);
};
