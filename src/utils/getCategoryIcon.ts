export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "frontend":
      return `🖥️`;

    case "backend":
      return `⚙️`;
    default:
      return null;
  }
};
