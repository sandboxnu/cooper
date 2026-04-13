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
  return `${month} ${day}, ${year}`;
}

export const formatLastEditedDate = (
  updatedAt?: Date | null,
  createdAt?: Date,
): string => {
  const date = updatedAt ?? createdAt;

  if (!date) {
    return "";
  }

  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const msPerHour = 1000 * 60 * 60;
  const msPerMin = 1000 * 60;
  const timeDifference = now.getTime() - date.getTime();
  const daysDifference = Math.floor(timeDifference / msPerDay);
  const hoursDifference = Math.floor(timeDifference / msPerHour);
  const minutesDifference = Math.floor(timeDifference / msPerMin);

  if (minutesDifference <= 59) {
    return `Last edited ${minutesDifference} minutes ago`;
  }
  if (hoursDifference <= 23) {
    return `Last edited ${hoursDifference} hours ago`;
  }
  if (daysDifference == 1) {
    return `Last edited ${daysDifference} day ago`;
  }
  if (daysDifference <= 6) {
    return `Last edited ${daysDifference} days ago`;
  } else {
    return `Last edited ${formatDate(date)}`;
  }
};
