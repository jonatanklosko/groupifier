import React from 'react';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import red from '@material-ui/core/colors/red'

import './Footer.css';

const Footer = () => (
  <Grid container className="footer">
    <Grid item style={{ flexGrow: 1 }}>
      <Typography>
        Made with <Icon className="footer-icon" style={{ color: red[700] }}>favorite</Icon>
        {' '}by <a href="https://github.com/jonatanklosko" target="_blank" rel="noopener noreferrer">Jonatan Kłosko</a>
      </Typography>
    </Grid>
    <Grid item>
      <Typography>
        <a href="https://github.com/jonatanklosko/groupifier-next" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </Typography>
    </Grid>
    <Grid item style={{ marginLeft: 8 }}>
      <Typography>
        <a href="https://github.com/jonatanklosko/groupifier-next/wiki/Guide" target="_blank" rel="noopener noreferrer">
          Guide
        </a>
      </Typography>
    </Grid>
    <Grid item style={{ marginLeft: 8 }}>
      <Typography>
        <a href="mailto:jonatanklosko@gmail.com" target="_blank" rel="noopener noreferrer">
          Contact
        </a>
      </Typography>
    </Grid>
    <Grid item style={{ marginLeft: 8 }}>
      <Typography>
        <a href="https://github.com/jonatanklosko/groupifier-next" target="_blank" rel="noopener noreferrer">
          v1.1.1
        </a>
      </Typography>
    </Grid>
  </Grid>
);

export default Footer;
