import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';

import { saveWcifChanges } from '../../../logic/wca-api';

export default class SaveWcifButton extends Component {
  state = {
    saving: false,
    failed: false
  };

  handleSaveClick = () => {
    const { wcif, updatedWcif, onWcifUpdate, history } = this.props;
    this.setState({ saving: true, failed: false });
    saveWcifChanges(wcif, updatedWcif)
      .then(() => {
        onWcifUpdate(updatedWcif);
        history.push(`/competitions/${updatedWcif.id}`);
      })
      .catch(() => this.setState({ saving: false, failed: true }));
  };

  handleSnackbarClose = () => {
    this.setState({ failed: false });
  };

  render() {
    const { saving, failed } = this.state;
    const { wcif, updatedWcif, onWcifUpdate, history, disabled } = this.props;
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
          onClose={this.handleSnackbarClose}
        />
        <Button variant="contained" color="primary" onClick={this.handleSaveClick} disabled={disabled || saving}>
          <span style={saving ? { visibility: 'hidden' } : {}}>Save</span>
          {saving && <CircularProgress size={20} style={{ position: 'absolute' }} />}
        </Button>
      </Fragment>
    );
  }
}
