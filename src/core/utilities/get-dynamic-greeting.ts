import { translate } from '../i18n';

// Function to get the appropriate greeting based on the current hour
export const getDynamicGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return translate('general.goodMorning');
  } else if (hour >= 12 && hour < 17) {
    return translate('general.goodAfternoon');
  } else {
    return translate('general.goodEvening');
  }
};
