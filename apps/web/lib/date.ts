export const parseToLocaleString = (date: number) => {
  return new Date(date).toLocaleDateString("es", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
