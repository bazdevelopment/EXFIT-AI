import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const HeartBreak = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={18}
    fill="none"
    {...props}
  >
    <Path
      fill={props.fill || '#fff'}
      d="M4.771.694a5.482 5.482 0 0 1 2.626.203l1.906 2.967L6.417 6.75a.297.297 0 0 0-.088.222c.004.084.038.161.1.218l4.287 3.982a.303.303 0 0 0 .402.011.307.307 0 0 0 .065-.398L8.871 7.03l3.472-2.894c.1-.08.134-.219.092-.337l-.873-2.427a5.462 5.462 0 0 1 3.664-.674A5.464 5.464 0 0 1 19.8 6.092v.222a5.727 5.727 0 0 1-1.822 4.192l-6.917 6.458a1.554 1.554 0 0 1-2.121 0l-6.918-6.458A5.727 5.727 0 0 1 .2 6.314v-.222A5.471 5.471 0 0 1 4.771.694Z"
    />
  </Svg>
);
