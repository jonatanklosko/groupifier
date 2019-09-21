import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Link from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const Header = ({ isSignedIn, onSignIn, onSignOut }) => (
  <AppBar position="static" color="primary">
    <Toolbar>
      <Typography variant="h6" color="inherit">
        <RouterLink to={isSignedIn ? '/competitions' : '/'}>
          <Icon style={{ fontSize: '1.5em', verticalAlign: 'middle', marginRight: 10 }}>people</Icon>
          Groupifier
        </RouterLink>
      </Typography>
      <Typography style={{ flexGrow: 1, marginLeft: 16 }} variant="body2" color="inherit">
        {`This version is meant to be used with Cubecomps. Navigate `}
        <Link
          href="https://groupifier.jonatanklosko.com"
          color="inherit"
          style={{ fontWeight: 500 }}
        >
          {`here `}
          <span role="img" aria-label="rocket">🚀</span>
        </Link>
        {` if you're using WCA Live.`}
      </Typography>
      {isSignedIn
        ? <Button color="inherit" onClick={onSignOut}>Sign out</Button>
        : <Button color="inherit" onClick={onSignIn}>Sign in</Button>}
    </Toolbar>
  </AppBar>
);

export default Header;
