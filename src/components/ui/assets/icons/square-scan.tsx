import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const SquareScan = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={336}
    height={558}
    fill="none"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="square"
      strokeWidth={8}
      d="M84 4H51.722C25.366 4 4 25.366 4 51.722V84M84 554H51.722C25.366 554 4 532.634 4 506.278V474M252 4h32.278C310.634 4 332 25.366 332 51.722V84M252 554h32.278C310.634 554 332 532.634 332 506.278V474"
    />
  </Svg>
);
