import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

import colors from '../../colors';

export const ArrowRight = ({
  fill = colors.white,
  style,
  ...props
}: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    className="lucide lucide-arrow-right-icon lucide-arrow-right"
    {...props}
  >
    <Path d="M5 12h14M12 5l7 7-7 7" />
  </Svg>
);
