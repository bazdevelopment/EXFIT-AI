export const avatars = {
  male: require('../../components/ui/assets/images/avatar-male.png'),
  female: require('../../components/ui/assets/images/avatar-female.png'),
  default: require('../../components/ui/assets/images/avatar-male.png'),
};

export type TAvatarGender = keyof typeof avatars;
