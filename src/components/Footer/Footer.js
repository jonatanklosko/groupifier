import React from 'react';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import red from '@material-ui/core/colors/red'

import './Footer.css';

const links = [
  { text: 'Donate', url: 'https://ko-fi.com/jonatanklosko' },
  { text: 'Guide', url: 'https://github.com/jonatanklosko/groupifier-next/wiki/Guide' },
  { text: 'GitHub', url: 'https://github.com/jonatanklosko/groupifier-next' },
  { text: 'Contact', url: 'mailto:jonatanklosko@gmail.com' },
  { text: 'v1.3.0', url: 'https://github.com/jonatanklosko/groupifier-next' }
];

const Footer = () => (
  <Grid container className="footer">
    <Grid item style={{ flexGrow: 1 }}>
      <Typography>
        Made with <Icon className="footer-icon" style={{ color: red[700] }}>favorite</Icon>
        {' '}by <a href="https://github.com/jonatanklosko" target="_blank" rel="noopener noreferrer">Jonatan Kłosko</a>
      </Typography>
    </Grid>
    <Grid item>
      <Grid container spacing={8}>
        {links.map(({ text, url }) => (
          <Grid item key={text}>
            <Typography>
              <a href={url} target="_blank" rel="noopener noreferrer">{text}</a>
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Grid>
  </Grid>
);

export default Footer;
