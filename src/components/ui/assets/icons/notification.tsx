import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const Notification = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    right={-3}
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12.702 17.56c0 .764-.336 1.497-.934 2.037-.599.54-1.41.843-2.256.843a3.373 3.373 0 0 1-2.256-.843c-.598-.54-.935-1.273-.935-2.037M2.685 16.6c-.52-.1-.98-.372-1.29-.763a1.78 1.78 0 0 1-.38-1.349L2.08 6.703c.272-1.6 1.174-3.06 2.542-4.107C5.99 1.548 7.73.982 9.524 1c1.793-.018 3.534.548 4.902 1.596 1.368 1.048 2.27 2.506 2.542 4.107l1.063 7.785a1.78 1.78 0 0 1-.375 1.347c-.307.39-.765.663-1.284.765a33.062 33.062 0 0 1-13.687 0Z"
    />
  </Svg>
);
