import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const PlusIcon = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        d="M2.4.16A2.242 2.242 0 0 0 .16 2.4v11.2a2.242 2.242 0 0 0 2.24 2.24h11.2a2.242 2.242 0 0 0 2.24-2.24V2.4A2.242 2.242 0 0 0 13.6.16H2.4Zm4.76 10.92V8.84H4.92A.838.838 0 0 1 4.08 8c0-.466.374-.84.84-.84h2.24V4.92c0-.466.374-.84.84-.84.465 0 .84.374.84.84v2.24h2.24c.466 0 .84.374.84.84 0 .465-.374.84-.84.84H8.84v2.24c0 .466-.375.84-.84.84a.838.838 0 0 1-.84-.84Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h16v16H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
