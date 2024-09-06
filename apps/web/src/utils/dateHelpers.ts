/**
 * Format the date according to designs in Figma.
 * @param date Date object to format
 * @returns Date in format of 'dd mth yyyy'
 */
export function formatDate(date?: Date) {
  if (!date) {
    return "";
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Extract the year, month, and day components
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const month = months[monthIndex];
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits for the day

  // Return the formatted date string
  return `${day} ${month} ${year}`;
}
