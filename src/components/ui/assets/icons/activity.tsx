import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

const SvgComponent = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={800}
    height={800}
    fill="none"
    stroke="#000"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="feather feather-activity"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      stroke={props.color}
      strokeWidth={2.4}
      d="M22 12h-4l-3 9L9 3l-3 9H2"
    />
  </Svg>
);
export default SvgComponent;
