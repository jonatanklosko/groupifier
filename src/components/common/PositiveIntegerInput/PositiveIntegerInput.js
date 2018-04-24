import React, { PureComponent } from 'react';
import TextField from 'material-ui/TextField';

export default class PositiveIntegerInput extends PureComponent {
  constructor(props) {
    super(props);

    this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
  }

  handleTextFieldChange(event) {
    const newValue = event.target.value.length > 0 ? parseInt(event.target.value, 10) : null;
    if (newValue === null || (!Number.isNaN(newValue) && newValue >= 1)) {
      this.props.onChange(newValue, event);
    }
  }

  render() {
    const { value, onChange, ...props } = this.props;

    return (
      <TextField {...props} value={value === null ? '' : value} onChange={this.handleTextFieldChange} />
    );
  }
};
