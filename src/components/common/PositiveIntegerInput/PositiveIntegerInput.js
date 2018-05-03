import React, { PureComponent } from 'react';
import TextField from 'material-ui/TextField';

export default class PositiveIntegerInput extends PureComponent {
  /* Prevent from entering characters like minus, plus and dot.
     These don't trigger the change event for numeric input. */
  handleKeyPress = event => {
    if (event.key.match(/\D/)) event.preventDefault();
  };

  handleTextFieldChange = event => {
    const newValue = event.target.value.length > 0 ? parseInt(event.target.value, 10) : null;
    if (newValue === null || (!Number.isNaN(newValue) && newValue >= 1)) {
      this.props.onChange(event, newValue);
    }
  };

  render() {
    const { value, onChange, ...props } = this.props;

    return (
      <TextField
        {...props}
        type="number"
        value={value === null ? '' : value}
        onKeyPress={this.handleKeyPress}
        onChange={this.handleTextFieldChange}
      />
    );
  }
};
