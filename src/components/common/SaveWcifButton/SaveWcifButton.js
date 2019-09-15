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
  const [failed, setFailed] = useState(false);

  const handleSaveClick = () => {
    setSaving(true);
    setFailed(false);
    saveWcifChanges(wcif, updatedWcif)
      .then(() => {
        onWcifUpdate(updatedWcif);
        history.push(`/competitions/${updatedWcif.id}`);
      })
      .catch(() => {
        setSaving(false);
        setFailed(true);
      });
  };

  return (
    <Fragment>
      <Snackbar
        open={failed}
        message="Failed to save data to the WCA website."
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        autoHideDuration={5000}
        onClose={() => setFailed(false)}
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
