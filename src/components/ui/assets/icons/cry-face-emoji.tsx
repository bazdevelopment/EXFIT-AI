import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const CryFaceEmoji = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill="#191A21"
        d="M0 10a10 10 0 1 0 20 0 10 10 0 0 0-20 0Zm9.375 3.125c0-.344.281-.625.625-.625 1.758 0 3.344.8 4.52 2.074a.624.624 0 1 1-.918.848c-.977-1.059-2.243-1.676-3.606-1.676a.627.627 0 0 1-.625-.625l.004.004ZM6.25 16.25c-1.035 0-1.875-.82-1.875-1.836 0-.781 1.117-2.36 1.625-3.035a.307.307 0 0 1 .5 0c.516.676 1.625 2.254 1.625 3.035 0 1.016-.84 1.836-1.875 1.836Zm8.11-8.125a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm-7.5-1.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h20v20H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
