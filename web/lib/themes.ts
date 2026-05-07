export type ThemeKey = "dark" | "light" | "blue" | "yellow";

export interface ThemeConfig {
  label: string;
  g6Theme: "light" | "dark";
  background: string;
  nodeLabelFill: string;
  edgeStroke: string;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  dark: {
    label: "暗黑",
    g6Theme: "dark",
    background: "#18181b",
    nodeLabelFill: "#e2e8f0",
    edgeStroke: "#94A3B8",
  },
  light: {
    label: "明亮",
    g6Theme: "light",
    background: "#ffffff",
    nodeLabelFill: "#1f2937",
    edgeStroke: "#64748B",
  },
  blue: {
    label: "蓝色",
    g6Theme: "light",
    background: "#f0f4ff",
    nodeLabelFill: "#1e3a5f",
    edgeStroke: "#6B7280",
  },
  yellow: {
    label: "暖黄",
    g6Theme: "light",
    background: "#fefce8",
    nodeLabelFill: "#4a3f1f",
    edgeStroke: "#78716C",
  },
};

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];
