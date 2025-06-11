import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

const MaleIcon = (props: ISvgProps) => (
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
      d="M3.545 12.273a3.477 3.477 0 0 1 2.728-2.728c1.8-.36 3.654-.36 5.454 0a3.477 3.477 0 0 1 2.727 2.728c.36 1.8.36 3.654 0 5.454a3.476 3.476 0 0 1-2.727 2.727c-1.8.36-3.654.36-5.454 0a3.477 3.477 0 0 1-2.728-2.727c-.36-1.8-.36-3.654 0-5.454ZM13 11l7-7M14 4l3.529-.882c.304-.076.625-.041.905.1a5.251 5.251 0 0 1 2.349 2.348c.14.28.175.601.1.905L20 10"
    />
  </Svg>
);
export default MaleIcon;
