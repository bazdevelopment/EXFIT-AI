import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const ClockIcon = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <Path
      fill="#fff"
      d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm-.75 3.75V8c0 .25.125.484.334.625l3 2a.748.748 0 0 0 1.041-.21.748.748 0 0 0-.21-1.04L8.75 7.6V3.75A.748.748 0 0 0 8 3a.748.748 0 0 0-.75.75Z"
    />
  </Svg>
);
