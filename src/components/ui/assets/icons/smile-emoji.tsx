import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const SmileEmoji = (props: ISvgProps) => (
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
        d="M10 20a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm5.16-7.781c.48-.149.95.27.754.73-.976 2.309-3.25 3.926-5.902 3.926a6.406 6.406 0 0 1-5.903-3.926c-.195-.46.274-.879.754-.73 1.551.476 3.301.742 5.149.742 1.847 0 3.597-.266 5.148-.742ZM8.125 7.5c0 1.379-.559 2.5-1.25 2.5s-1.25-1.121-1.25-2.5S6.184 5 6.875 5s1.25 1.121 1.25 2.5Zm5 2.5c-.691 0-1.25-1.121-1.25-2.5s.559-2.5 1.25-2.5 1.25 1.121 1.25 2.5-.559 2.5-1.25 2.5Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h20v20H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
