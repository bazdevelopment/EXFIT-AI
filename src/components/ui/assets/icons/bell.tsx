import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ISvgProps } from '@/types/svg-types';

export const BellIcon = (props: ISvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      fill="#fff"
      d="M12 .24c-.814 0-1.47.657-1.47 1.47v.882a7.353 7.353 0 0 0-5.88 7.203v.864c0 2.159-.796 4.244-2.229 5.861l-.34.381a1.476 1.476 0 0 0-.243 1.58c.234.53.762.869 1.341.869h17.64a1.473 1.473 0 0 0 1.098-2.449l-.34-.38a8.833 8.833 0 0 1-2.228-5.862v-.864a7.353 7.353 0 0 0-5.88-7.203V1.71c0-.813-.657-1.47-1.47-1.47Zm2.08 22.661c.551-.551.86-1.3.86-2.081H9.06c0 .78.307 1.53.858 2.081.551.551 1.3.859 2.081.859.781 0 1.53-.308 2.081-.859Z"
    />
  </Svg>
);
