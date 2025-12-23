import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

const Plus = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/Svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="lucide lucide-plus-icon lucide-plus"
    {...props}
  >
    <Path d="M5 12h14M12 5v14" />
  </Svg>
);
export default Plus;
