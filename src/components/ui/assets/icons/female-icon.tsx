import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

const FemaleIcon = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v7M6.545 6.273a3.477 3.477 0 0 1 2.728-2.728c1.8-.36 3.654-.36 5.454 0a3.477 3.477 0 0 1 2.727 2.728c.36 1.8.36 3.654 0 5.454a3.476 3.476 0 0 1-2.727 2.727c-1.8.36-3.654.36-5.454 0a3.477 3.477 0 0 1-2.728-2.727c-.36-1.8-.36-3.654 0-5.454ZM8 19h8"
    />
  </Svg>
);
export default FemaleIcon;
