import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

const CircleCheck = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="lucide lucide-circle-check-icon lucide-circle-check"
    {...props}
  >
    <Circle cx={12} cy={12} r={10} />
    <Path d="m9 12 2 2 4-4" />
  </Svg>
);
export default CircleCheck;
