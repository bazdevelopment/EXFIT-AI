import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const ShoppingCart = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill="#fff"
      d="M9.06 5.385A2.943 2.943 0 0 1 12 2.445a2.943 2.943 0 0 1 2.94 2.94V7.59H9.06V5.385ZM6.855 7.59h-2.94A2.206 2.206 0 0 0 1.71 9.795v9.555a4.411 4.411 0 0 0 4.41 4.41h11.76a4.411 4.411 0 0 0 4.41-4.41V9.795a2.206 2.206 0 0 0-2.205-2.205h-2.94V5.385A5.142 5.142 0 0 0 12 .24a5.142 5.142 0 0 0-5.145 5.145V7.59Zm1.102 2.205a1.102 1.102 0 1 1 0 2.205 1.102 1.102 0 0 1 0-2.205Zm6.983 1.103a1.102 1.102 0 1 1 2.205 0 1.102 1.102 0 0 1-2.205 0Z"
    />
  </Svg>
);
