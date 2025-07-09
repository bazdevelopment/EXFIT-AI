import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const FlashIcon = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={512}
    height={512}
    style={{
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision',
      imageRendering: 'optimizeQuality',
      fillRule: 'evenodd',
      clipRule: 'evenodd',
    }}
    viewBox="0 0 512 512"
    {...props}
  >
    <Path
      fill="#fea632"
      d="M326.5 47.5c10.238 4.475 14.071 12.142 11.5 23a9363.622 9363.622 0 0 1-69.5 110 213.708 213.708 0 0 0 41 0c6.813.991 13.813 1.325 21 1 12.587 5.182 16.421 14.182 11.5 27a60722.863 60722.863 0 0 1-201.5 211 11355.621 11355.621 0 0 1 74-174.5c-22.05-.043-44.05-.71-66-2-9.835-5.495-13.002-13.662-9.5-24.5a17135.553 17135.553 0 0 0 82-155c5.128-7.982 12.295-13.149 21.5-15.5 27.998-.5 55.998-.667 84-.5Z"
      style={{
        opacity: 0.994,
      }}
    />
    <Path
      fill="#e6972e"
      d="M326.5 47.5c14.739-.45 29.405.05 44 1.5 7.306 4.905 10.139 11.739 8.5 20.5a4747.917 4747.917 0 0 1-69.5 111 213.708 213.708 0 0 1-41 0 9363.622 9363.622 0 0 0 69.5-110c2.571-10.858-1.262-18.525-11.5-23Z"
      style={{
        opacity: 0.994,
      }}
    />
    <Path
      fill="#e6972e"
      d="M330.5 181.5c14.004-.167 28.004 0 42 .5 12.135 6.071 15.301 15.237 9.5 27.5A43379.19 43379.19 0 0 1 139.5 463c-7.84 2.319-12.507-.515-14-8.5a371.94 371.94 0 0 1 15-35 60722.863 60722.863 0 0 0 201.5-211c4.921-12.818 1.087-21.818-11.5-27Z"
      style={{
        opacity: 0.992,
      }}
    />
  </Svg>
);
