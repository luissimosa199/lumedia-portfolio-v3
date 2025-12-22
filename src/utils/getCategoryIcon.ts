const categoryIcons: Record<string, string> = {
  frontend: "🖥️",
  backend: "⚙️",
  cli: "💻",
};

const defaultIcon = "📁";

export const getCategoryIcon = (category: string): string => {
  return categoryIcons[category] || defaultIcon;
};
