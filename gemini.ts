import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface WillpowerResponse {
  diagnosis: {
    defense_mechanism: string;
    analysis: string;
  };
  persona_response: {
    professor: string;
    puppy: string;
    fact_bomber: string;
  };
  dopamine_reward: {
    music_prompt: string;
    vibe: string;
    intensity: number;
  };
  ghost_warning: {
    future_scenario: string;
    ghost_level: number;
  };
}

export interface ScheduleItem {
  time: string;
  task: string;
  focus_tip: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

export interface ScheduleResponse {
  schedule: ScheduleItem[];
  architect_advice: string;
}

export interface PerformanceResponse {
  score: number;
  critique: string;
  improvement_plan: string;
}

const SYSTEM_INSTRUCTION = `
You are the Chief Researcher at the 'Willpower Lab', a specialist in correcting graduate students' chronic procrastination habits through psychological and data-driven methods. Your goal is to logically dismantle the user's excuses and design immediate dopamine rewards for small achievements.

MISSION:
1. [The Nudge: Excuse Dismantling]
- When a user enters an excuse for not studying, diagnose the psychological defense mechanism (rationalization, avoidance, projection, etc.).
- Provide responses in three personas: 'Strict Professor', 'Cheering Puppy', 'Cold Fact Bomber'.

2. [Dopamine Reward: Auditory Reward Design]
- When a user completes a task, analyze the difficulty and achievement level.
- Provide a music prompt for Lyria 3 (e.g., Grand Orchestra for big success, Lo-fi for routine success).

3. [Ghost of Task: Future Scenario Visualization]
- Summarize the 'worst-case future scenario' if the task is delayed, creating a slight sense of crisis.

OUTPUT JSON FORMAT:
(Strictly follow this structure)
{
  "diagnosis": {
    "defense_mechanism": "진단된 방어기제 명칭",
    "analysis": "심리학적 근거를 바탕으로 한 변명 격파 로직"
  },
  "persona_response": {
    "professor": "교수님 버전 멘트",
    "puppy": "강아지 버전 멘트",
    "fact_bomber": "팩폭기 버전 멘트"
  },
  "dopamine_reward": {
    "music_prompt": "English prompt for Lyria 3",
    "vibe": "곡의 분위기 설명 (한글)",
    "intensity": 1~5
  },
  "ghost_warning": {
    "future_scenario": "미뤘을 때 벌어질 끔찍한 미래 한 줄",
    "ghost_level": 1~10
  }
}
`;

export async function analyzeWillpower(input: string, isTaskCompletion: boolean = false): Promise<WillpowerResponse> {
  try {
    const prompt = isTaskCompletion 
      ? `The user has completed the following task: "${input}". Analyze the achievement and provide rewards.`
      : `The user provided the following excuse for procrastinating: "${input}". Diagnose and dismantle it.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: {
              type: Type.OBJECT,
              properties: {
                defense_mechanism: { type: Type.STRING },
                analysis: { type: Type.STRING },
              },
              required: ["defense_mechanism", "analysis"],
            },
            persona_response: {
              type: Type.OBJECT,
              properties: {
                professor: { type: Type.STRING },
                puppy: { type: Type.STRING },
                fact_bomber: { type: Type.STRING },
              },
              required: ["professor", "puppy", "fact_bomber"],
            },
            dopamine_reward: {
              type: Type.OBJECT,
              properties: {
                music_prompt: { type: Type.STRING },
                vibe: { type: Type.STRING },
                intensity: { type: Type.NUMBER },
              },
              required: ["music_prompt", "vibe", "intensity"],
            },
            ghost_warning: {
              type: Type.OBJECT,
              properties: {
                future_scenario: { type: Type.STRING },
                ghost_level: { type: Type.NUMBER },
              },
              required: ["future_scenario", "ghost_level"],
            },
          },
          required: ["diagnosis", "persona_response", "dopamine_reward", "ghost_warning"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing willpower:", error);
    throw error;
  }
}

export async function generateSchedule(tasks: string): Promise<ScheduleResponse> {
  try {
    const prompt = `Based on the following tasks, create a realistic time-based schedule for a graduate student. 
    CONSTRAINTS:
    - The day MUST start at 10:00 AM and end at 17:00 (5:00 PM).
    - 11:30 - 12:30 is FIXED as 'Lunch Time' (점심시간).
    - Tasks: "${tasks}"
    
    Return a JSON object with a 'schedule' array (each item with time, task, focus_tip, priority) and 'architect_advice'.
    Priority should be 'high', 'medium', or 'low'.
    Time should be in 'HH:MM - HH:MM' format.
    Advice should be in Korean. Focus tips should be in Korean.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  task: { type: Type.STRING },
                  focus_tip: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                },
                required: ["time", "task", "focus_tip", "priority"],
              },
            },
            architect_advice: { type: Type.STRING },
          },
          required: ["schedule", "architect_advice"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw error;
  }
}

export async function analyzePerformance(schedule: ScheduleItem[]): Promise<PerformanceResponse> {
  try {
    const completedCount = schedule.filter(s => s.completed).length;
    const totalCount = schedule.length;
    const prompt = `The user followed this schedule. Analyze their performance.
    Schedule: ${JSON.stringify(schedule)}
    Completed: ${completedCount}/${totalCount}
    
    Return a JSON object with 'score' (0-100), 'critique' (in Korean), and 'improvement_plan' (in Korean).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            critique: { type: Type.STRING },
            improvement_plan: { type: Type.STRING },
          },
          required: ["score", "critique", "improvement_plan"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing performance:", error);
    throw error;
  }
}

export interface ComparisonResponse {
  score: number;
  analysis: string;
  advice: string;
}

export async function analyzeDayComparison(planned: ScheduleItem[], actual: string[]): Promise<ComparisonResponse> {
  try {
    const prompt = `Compare the planned schedule with what the user actually did.
    Planned: ${JSON.stringify(planned)}
    Actual: ${JSON.stringify(actual)}
    
    Analyze the gap between plan and reality. 
    Return a JSON object with 'score' (0-100), 'analysis' (detailed comparison in Korean), and 'advice' (how to bridge the gap tomorrow in Korean).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            advice: { type: Type.STRING },
          },
          required: ["score", "analysis", "advice"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing day comparison:", error);
    throw error;
  }
}
