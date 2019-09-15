import React from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { downloadCompetitorCards } from '../../../../logic/documents/competitor-cards';

const CompetitorCards = ({ wcif }) => {
  return (
    <Paper style={{ padding: 16 }}>
      <Typography variant="body1">
        First round task assignments for every competitor. Useful to be
        distributed along with name tags.
      </Typography>
      <Button onClick={() => downloadCompetitorCards(wcif)}>Download</Button>
    </Paper>
  );
};

export default CompetitorCards;
