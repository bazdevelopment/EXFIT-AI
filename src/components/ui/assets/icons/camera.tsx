import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const Camera = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        fillRule="evenodd"
        d="M19.724 4a2 2 0 0 1 1.267.453l.147.134 2.082 2.08h3.447a2.667 2.667 0 0 1 2.66 2.466l.007.2v16a2.667 2.667 0 0 1-2.467 2.66l-.2.007H5.334a2.667 2.667 0 0 1-2.66-2.467l-.007-.2v-16a2.667 2.667 0 0 1 2.467-2.66l.2-.006h3.448l2.08-2.08a2 2 0 0 1 1.217-.578L12.276 4h7.448Zm-.276 2.667h-6.896l-2.08 2.08a2 2 0 0 1-1.217.577l-.197.01H5.334v16h21.333v-16h-3.724a2 2 0 0 1-1.267-.454l-.146-.133-2.082-2.08ZM16 10a6.667 6.667 0 1 1 0 13.334A6.667 6.667 0 0 1 16 10Zm0 2.667a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
        clipRule="evenodd"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h32v32H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
