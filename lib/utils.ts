export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert("Markdown copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy!", err);
  }
};

export const generateMarkdown = (date: string, logs: any[]) => {
  let md = `# Workout Log: ${date}\n\n`;
  const lifting = logs.filter((l) => l.type === "lifting");
  const cardio = logs.filter((l) => l.type === "cardio");

  if (lifting.length > 0) {
    md += `## Lifting\n`;
    lifting.forEach((l) => {
      md += `- **${l.exercise}**: ${l.sets} sets x ${l.reps} reps @ ${l.weight}lbs. _Note: ${l.notes || "N/A"}_\n`;
    });
  }
  if (cardio.length > 0) {
    md += `\n## Cardio\n`;
    cardio.forEach((c) => {
      md += `- **${c.activity}**: ${c.duration} mins | ${c.distance} miles | Avg HR: ${c.heartRate} bpm. _Note: ${c.notes || "N/A"}_\n`;
    });
  }
  return md;
};
