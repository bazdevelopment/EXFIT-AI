import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const DeadFaceEmoji = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        d="M10 20a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-8.75a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.934 5.184a.627.627 0 0 1 .882 0L6.25 6.617l1.434-1.433a.627.627 0 0 1 .882 0 .627.627 0 0 1 0 .882L7.133 7.5l1.433 1.434a.627.627 0 0 1 0 .882.627.627 0 0 1-.882 0L6.25 8.383 4.816 9.816a.627.627 0 0 1-.882 0 .627.627 0 0 1 0-.882L5.367 7.5 3.934 6.066a.627.627 0 0 1 0-.882Zm7.5 0a.627.627 0 0 1 .882 0l1.434 1.433 1.434-1.433a.627.627 0 0 1 .882 0 .627.627 0 0 1 0 .882L14.633 7.5l1.433 1.434a.627.627 0 0 1 0 .882.627.627 0 0 1-.882 0L13.75 8.383l-1.434 1.433a.627.627 0 0 1-.882 0 .627.627 0 0 1 0-.882L12.867 7.5l-1.433-1.434a.627.627 0 0 1 0-.882Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h20v20H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
