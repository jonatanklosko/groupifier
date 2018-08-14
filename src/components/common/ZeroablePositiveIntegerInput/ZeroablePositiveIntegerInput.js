import React, { PureComponent, Fragment } from 'react';
import Checkbox from 'material-ui/Checkbox';

import PositiveIntegerInput from '../PositiveIntegerInput/PositiveIntegerInput';

export default class ZeroablePositiveIntegerInput extends PureComponent {
  handleCheckboxChange = event => {
    const { checked } = event.target;
    this.props.onChange(event, checked ? null : 0);
  };

  componentDidUpdate(prevProps) {
    if (prevProps.value === 0 && this.props.value !== 0) {
      document.querySelector(`input[type="number"][name="${this.props.name}"]`).focus();
    }
  }

  render() {
    const { value, disabled, ...props } = this.props;

    return (
      <Fragment>
        <PositiveIntegerInput {...props} value={value} disabled={value === 0 || disabled} />
        <Checkbox name={props.name} checked={value !== 0} onChange={this.handleCheckboxChange} disabled={disabled} />
      </Fragment>
    );
  }
};
