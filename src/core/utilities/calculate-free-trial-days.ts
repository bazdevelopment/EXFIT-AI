import dayjs from '../../lib/dayjs';

export const calculateFreeTrialDays = ({
  endDateISO,
}: {
  endDateISO: string;
}) => {
  const today = dayjs(); // current date
  const endDate = dayjs(endDateISO);

  // Calculate difference in days
  const remainingDays = endDate.diff(today, 'day');
  // Return remaining days, but not less than 0
  return Math.max(remainingDays, 0);
};
