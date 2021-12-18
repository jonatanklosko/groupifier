import React, { useEffect, useRef } from 'react';
import Checkbox from '@material-ui/core/Checkbox';

import PositiveIntegerInput from '../PositiveIntegerInput/PositiveIntegerInput';

const ZeroablePositiveIntegerInput = React.memo(
  React.forwardRef(({ value, disabled, ...props }, ref) => {
    const inputRef = useRef(null);
    const shouldFocusRef = useRef(false);

    const handleCheckboxChange = event => {
      const { checked } = event.target;
      props.onChange(event, checked ? null : 0);
      if (checked) {
        shouldFocusRef.current = true;
      }
    };

    useEffect(() => {
      if (value === null && shouldFocusRef.current) {
        inputRef.current.focus();
        shouldFocusRef.current = false;
      }
    }, [value]);

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <PositiveIntegerInput
          {...props}
          ref={ref}
          value={value}
          disabled={value === 0 || disabled}
          inputRef={inputRef}
        />
        <Checkbox
          name={props.name}
          checked={value !== 0}
          onChange={handleCheckboxChange}
          disabled={disabled}
        />
      </div>
    );
  })
);

export default ZeroablePositiveIntegerInput;
