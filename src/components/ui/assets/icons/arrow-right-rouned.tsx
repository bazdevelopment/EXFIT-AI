import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const ArrowRightRounded = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/Svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 12h16M12 5l5.273 2.636c.472.236.855.62 1.09 1.091a7.317 7.317 0 0 1 0 6.546 2.439 2.439 0 0 1-1.09 1.09L12 19"
    />
  </Svg>
);
