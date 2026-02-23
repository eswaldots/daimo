export const parseToLocaleString = (date: number) => {
  return new Date(date).toLocaleDateString("es", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const parseMillisecondsUsage = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
};
