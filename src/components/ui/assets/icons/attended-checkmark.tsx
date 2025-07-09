import * as React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const AttendedCheckMark = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <Path
      fill="url(#a)"
      d="M10 20a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4.414-11.836-5 5a.934.934 0 0 1-1.324 0l-2.5-2.5A.937.937 0 0 1 6.914 9.34l1.836 1.836 4.336-4.34A.937.937 0 0 1 14.41 8.16l.004.004Z"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={10}
        x2={10}
        y1={0}
        y2={20}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#FC9003" />
        <Stop offset={1} stopColor="#FF530C" />
      </LinearGradient>
    </Defs>
  </Svg>
);
