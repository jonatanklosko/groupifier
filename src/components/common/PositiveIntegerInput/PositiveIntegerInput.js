import React from 'react';
import TextField from '@material-ui/core/TextField';

const PositiveIntegerInput = React.memo(({ value, onChange, ...props }) => {
  /* Prevent from entering characters like minus, plus and dot.
     These don't trigger the change event for numeric input. */
  const handleKeyPress = event => {
    if (event.key.match(/\D/)) event.preventDefault();
  };

  const handleTextFieldChange = event => {
    const { value } = event.target;
    const newValue = value.length > 0 ? parseInt(value, 10) : null;
    if (newValue === null || (!Number.isNaN(newValue) && newValue >= 1)) {
      onChange(event, newValue);
    }
  };

  return (
    <TextField
      {...props}
      type="number"
      value={value === null ? '' : value}
      onKeyPress={handleKeyPress}
      onChange={handleTextFieldChange}
    />
  );
});

export default PositiveIntegerInput;
