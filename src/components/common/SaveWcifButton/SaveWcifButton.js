import React, { Fragment, useState } from 'react';
import { withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';

import { saveWcifChanges } from '../../../logic/wca-api';

const SaveWcifButton = ({
  wcif,
  updatedWcif,
  onWcifUpdate,
  disabled,
  history,
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSaveClick = () => {
    setSaving(true);
    setError(null);
    saveWcifChanges(wcif, updatedWcif)
      .then(() => {
        onWcifUpdate(updatedWcif);
        history.push(`/competitions/${updatedWcif.id}`);
      })
      .catch(error => {
        setSaving(false);
        setError(error);
      });
  };

  return (
    <Fragment>
      <Snackbar
        open={error !== null}
        message={`Failed to save data to the WCA website.${
          error && error.message ? ` Reason: ${error.message}` : ''
        }`}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        autoHideDuration={5000}
        onClose={() => setError(null)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveClick}
        disabled={disabled || saving}
      >
        <span style={saving ? { visibility: 'hidden' } : {}}>Save</span>
        {saving && (
          <CircularProgress size={20} style={{ position: 'absolute' }} />
        )}
      </Button>
    </Fragment>
  );
};

export default withRouter(SaveWcifButton);
