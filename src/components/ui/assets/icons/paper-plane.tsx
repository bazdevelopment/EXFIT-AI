import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const PaperPlane = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        d="M23.12.497c.463.322.707.878.62 1.433L20.8 21.036a1.472 1.472 0 0 1-2.02 1.13l-5.494-2.282-3.146 3.403a1.47 1.47 0 0 1-2.549-1.001v-3.84c0-.184.069-.358.193-.491l7.698-8.4a.735.735 0 0 0-1.029-1.043L5.11 16.81l-4.055-2.03c-.487-.244-.8-.73-.813-1.272a1.48 1.48 0 0 1 .74-1.318L21.557.433a1.474 1.474 0 0 1 1.561.064Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h24v24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
