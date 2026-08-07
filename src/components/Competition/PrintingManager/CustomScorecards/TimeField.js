import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';

/* Logic adapted from thewca/wca-live client/src/components/admin/AttemptResultField/TimeField.jsx */

function reformatInput(input) {
  const number = parseInt(input.replace(/\D/g, ''), 10) || 0;
  if (number === 0) return '';
  const str = '00000000' + number.toString().slice(0, 8);
  const [, hh, mm, ss, cc] = str.match(/(\d\d)(\d\d)(\d\d)(\d\d)$/);
  return `${hh}:${mm}:${ss}.${cc}`.replace(/^[0:]*(?!\.)/g, '');
}

function inputToCs(input) {
  if (input === '') return 0;
  const num = parseInt(input.replace(/\D/g, ''), 10) || 0;
  return (
    Math.floor(num / 1000000) * 360000 +
    Math.floor((num % 1000000) / 10000) * 6000 +
    Math.floor((num % 10000) / 100) * 100 +
    (num % 100)
  );
}

function csToInput(cs) {
  if (!cs) return '';
  return new Date(cs * 10)
    .toISOString()
    .substr(11, 11)
    .replace(/^[0:]*(?!\.)/g, '');
}

function isValid(input) {
  return input === csToInput(inputToCs(input));
}

const TimeField = ({ value, onChange, ...textFieldProps }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [draft, setDraft] = useState(csToInput(value));

  if (prevValue !== value) {
    setDraft(csToInput(value));
    setPrevValue(value);
  }

  function handleChange(event) {
    setDraft(reformatInput(event.target.value));
  }

  function handleBlur() {
    const cs = isValid(draft) ? inputToCs(draft) : 0;
    onChange(cs);
    setDraft(csToInput(value));
  }

  return (
    <TextField
      {...textFieldProps}
      type="tel"
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

export default TimeField;
