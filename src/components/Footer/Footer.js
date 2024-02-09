import React from 'react';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import red from '@material-ui/core/colors/red';
import grey from '@material-ui/core/colors/grey';
import { makeStyles } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';

import { version } from '../../../package.json';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
  icon: {
    verticalAlign: 'middle',
    color: red[700],
  },
  grow: {
    flexGrow: 1,
  },
  link: {
    verticalAlign: 'middle',
    fontWeight: 500,
    color: grey['900'],
    '&:hover': {
      textDecoration: 'none',
      opacity: 0.7,
    },
  },
}));

const links = [
  {
    text: 'Guide',
    url: 'https://github.com/jonatanklosko/groupifier/wiki/Guide',
  },
  { text: 'GitHub', url: 'https://github.com/jonatanklosko/groupifier' },
  { text: 'Contact', url: 'mailto:jonatanklosko@gmail.com' },
  {
    text: `v${version}`,
    url: 'https://github.com/jonatanklosko/groupifier',
  },
];

const Footer = () => {
  const classes = useStyles();
  return (
    <Grid container className={classes.root}>
      <Grid item>
        <Typography variant="body2">
          Made with <FavoriteIcon className={classes.icon} /> by{' '}
          <Link
            className={classes.link}
            href="https://github.com/jonatanklosko"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jonatan Kłosko
          </Link>
        </Typography>
      </Grid>
      <Grid item className={classes.grow} />
      <Grid item>
        <Grid container spacing={1}>
          {links.map(({ text, url }) => (
            <Grid item key={text}>
              <Link
                className={classes.link}
                variant="body2"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {text}
              </Link>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Footer;
