import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { downloadCompetitorCards } from '../../../../logic/documents/competitor-cards';

const CompetitorCards = ({ wcif }) => {
  const [evenlySpaced, setEvenlySpaced] = useState(false);

  return (
    <Paper style={{ padding: 16 }}>
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <Typography variant="body1">
            First round task assignments for every competitor. Useful to be
            distributed along with name tags.
          </Typography>
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                name="evenlySpaced"
                checked={evenlySpaced}
                onChange={() => setEvenlySpaced(!evenlySpaced)}
              />
            }
            label="Evenly distribute cards (4 per page)"
          />
        </Grid>
        <Grid item>
          <Button onClick={() => downloadCompetitorCards(wcif, evenlySpaced)}>
            Download
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CompetitorCards;
