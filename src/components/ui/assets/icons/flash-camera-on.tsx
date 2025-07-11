import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const FlashCameraOn = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        fillRule="evenodd"
        d="M13.232 1.36c.632-.758 1.863-.24 1.763.742L14.289 9h5.71a1 1 0 0 1 .769 1.64l-10 12c-.632.758-1.863.24-1.763-.742L9.71 15H4a1 1 0 0 1-.768-1.64l10-12ZM6.135 13h5.348a.4.4 0 0 1 .398.44l-.553 5.405L17.865 11h-5.348a.4.4 0 0 1-.398-.44l.553-5.404L6.135 13Z"
        clipRule="evenodd"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h24v24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
