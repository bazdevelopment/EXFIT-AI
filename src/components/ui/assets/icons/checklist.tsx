import * as React from 'react';
import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const CheckListIcon = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill="url(#b)"
        d="M12 24a12 12 0 1 0 0-24 12 12 0 0 0 0 24Zm5.297-14.203-6 6a1.12 1.12 0 0 1-1.59 0l-3-3a1.125 1.125 0 0 1 1.59-1.59l2.203 2.204 5.203-5.208a1.125 1.125 0 0 1 1.59 1.59l.004.004Z"
      />
    </G>
    <Defs>
      <LinearGradient
        id="b"
        x1={12.032}
        x2={12.032}
        y1={0}
        y2={24}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.78} stopColor="#01B763" />
        <Stop offset={1} stopColor="#047C59" />
      </LinearGradient>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h24v24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
