import React from 'react';
import Icon from 'material-ui/Icon';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';

import './Footer.css';

const Footer = () => (
  <Grid container className="footer">
    <Grid item style={{ flexGrow: 1 }}>
      <Typography>
        Made with <Icon className="footer-icon">favorite</Icon>
        {' '}by <a href="https://github.com/jonatanklosko" target="_blank" rel="noopener noreferrer">Jonatan Kłosko</a>
      </Typography>
    </Grid>
    <Grid item>
      <Typography>
        <a href="https://github.com/jonatanklosko/groupifier" target="_blank" rel="noopener noreferrer">
          GitHub
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
  </Grid>
);

export default Footer;
