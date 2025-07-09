import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';
export const GemIcon = (props: ISvgProps) => (
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
      fill="#a0eafe"
      d="M194.5 41.5a13791.822 13791.822 0 0 1-78 137H-.5v-5a247.715 247.715 0 0 1 12.5-15A9183.427 9183.427 0 0 0 125.5 44l4-2c21.664-.5 43.331-.667 65-.5Z"
      style={{
        opacity: 0.994,
      }}
    />
    <Path
      fill="#d1effe"
      d="M194.5 41.5h61v137h-139a13791.822 13791.822 0 0 0 78-137Z"
      style={{
        opacity: 1,
      }}
    />
    <Path
      fill="#41b4e6"
      d="M255.5 41.5h61a6845.189 6845.189 0 0 0 77 136c-45.995 1-91.995 1.333-138 1v-137Z"
      style={{
        opacity: 1,
      }}
    />
    <Path
      fill="#41b4e6"
      d="M-.5 178.5h117a75780.203 75780.203 0 0 1 126 284 23901.374 23901.374 0 0 1-243-278v-6Z"
      style={{
        opacity: 0.993,
      }}
    />
    <Path
      fill="#9feafe"
      d="M116.5 178.5h139v291c-5.983.469-10.317-1.865-13-7a75780.203 75780.203 0 0 0-126-284Z"
      style={{
        opacity: 1,
      }}
    />
    <Path
      fill="#72c7ef"
      d="M316.5 41.5c21.669-.167 43.336 0 65 .5l4 2A9028.419 9028.419 0 0 0 498 157.5a286.142 286.142 0 0 1 13.5 16v5c-39.239-.33-78.406.003-117.5 1a52559.484 52559.484 0 0 0-124.5 282c-2.919 5.561-7.586 8.228-14 8v-291c46.005.333 92.005 0 138-1a6845.189 6845.189 0 0 1-77-136Z"
      style={{
        opacity: 1,
      }}
    />
    <Path
      fill="#0073aa"
      d="M511.5 178.5v6a23713.126 23713.126 0 0 1-242 277 52559.484 52559.484 0 0 1 124.5-282c39.094-.997 78.261-1.33 117.5-1Z"
      style={{
        opacity: 0.992,
      }}
    />
  </Svg>
);
