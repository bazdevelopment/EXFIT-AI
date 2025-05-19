import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

const ProgressIcon = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={800}
    height={800}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 21v-4m6 4v-8m6 8v-6m6 6V11M8.44 5.56a1.495 1.495 0 0 0 2.121 0m-2.122 0a1.5 1.5 0 1 1 2.121 0m-2.12 0L5.56 8.44m0 0A1.5 1.5 0 1 0 3.44 10.56a1.5 1.5 0 0 0 2.122-2.122Zm5-2.88 2.88 2.88m0 0a1.5 1.5 0 1 0 2.121 0m-2.122 0a1.496 1.496 0 0 1 2.121 0m0 0 2.88-2.88m0 0A1.5 1.5 0 1 0 20.56 3.44a1.5 1.5 0 0 0-2.122 2.122Z"
    />
  </Svg>
);
export default ProgressIcon;
