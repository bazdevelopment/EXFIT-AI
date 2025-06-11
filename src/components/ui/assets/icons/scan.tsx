import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

const ScanIcon = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    className="icon glyph"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill={props.color}
      d="M3 8a1 1 0 0 1-1-1V4a2 2 0 0 1 2-2h3a1 1 0 0 1 0 2H4v3a1 1 0 0 1-1 1ZM21 8a1 1 0 0 1-1-1V4h-3a1 1 0 0 1 0-2h3a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1ZM7 22H4a2 2 0 0 1-2-2v-3a1 1 0 0 1 2 0v3h3a1 1 0 0 1 0 2ZM20 22h-3a1 1 0 0 1 0-2h3v-3a1 1 0 0 1 2 0v3a2 2 0 0 1-2 2ZM21 13H3a1 1 0 0 1 0-2h18a1 1 0 0 1 0 2Z"
    />
  </Svg>
);
export default ScanIcon;
