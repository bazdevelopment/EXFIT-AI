import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const BackRoundedIcon = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="#D7D8D9"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m17 3-6.335 2.715a2.433 2.433 0 0 0-1.066.887 9.732 9.732 0 0 0 0 10.796c.262.393.632.701 1.066.887L17 21"
    />
  </Svg>
);
