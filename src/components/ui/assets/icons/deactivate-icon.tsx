import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const DeactivateIcon = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="lucide lucide-user-x-icon lucide-user-x"
    {...props}
  >
    <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <Circle cx={9} cy={7} r={4} />
    <Path d="m17 8 5 5M22 8l-5 5" />
  </Svg>
);
