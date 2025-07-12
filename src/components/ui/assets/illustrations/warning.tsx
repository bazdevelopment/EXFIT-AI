import * as React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const WarningIllustration = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={268}
    height={262}
    fill="none"
    {...props}
  >
    <Path
      fill="url(#a)"
      fillOpacity={0.3}
      d="m134 0 116.047 65.5v131L134 262 17.953 196.5v-131L134 0Z"
    />
    <Path
      fill="url(#b)"
      fillOpacity={0.5}
      d="m134 20 96.129 55.5v111L134 242l-96.129-55.5v-111L134 20Z"
    />
    <Path
      fill="#3195FD"
      d="m134 47 72.746 42v84L134 215l-72.746-42V89L134 47Z"
    />
    <Path
      fill="#fff"
      fillRule="evenodd"
      d="M126.259 106.248c3.176-5.664 11.306-5.664 14.482 0l23.18 41.334c3.115 5.554-.887 12.418-7.241 12.418h-46.36c-6.354 0-10.356-6.864-7.241-12.418l23.18-41.334Zm11.395 41.253a4.16 4.16 0 0 1-4.154 4.166 4.16 4.16 0 0 1-4.154-4.166 4.16 4.16 0 0 1 4.154-4.167 4.16 4.16 0 0 1 4.154 4.167Zm-4.154-33.332a4.16 4.16 0 0 0-4.154 4.166v12.5a4.16 4.16 0 0 0 4.154 4.166 4.16 4.16 0 0 0 4.154-4.166v-12.5a4.16 4.16 0 0 0-4.154-4.166Z"
      clipRule="evenodd"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={134}
        x2={134}
        y1={0}
        y2={262}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3195FD" />
        <Stop offset={1} stopColor="#3195FD" stopOpacity={0} />
      </LinearGradient>
      <LinearGradient
        id="b"
        x1={134}
        x2={134}
        y1={20}
        y2={242}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3195FD" />
        <Stop offset={1} stopColor="#3195FD" stopOpacity={0} />
      </LinearGradient>
    </Defs>
  </Svg>
);
