import React from 'react';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Icon from 'material-ui/Icon';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { Link } from 'react-router-dom';

const Header = ({ isSignedIn, onSignIn, onSignOut }) => (
  <AppBar position="static" color="primary">
    <Toolbar>
      <Typography variant="title" color="inherit" style={{ flexGrow: 1 }}>
        <Link to={isSignedIn ? '/competitions' : '/'}>
          <Icon style={{ fontSize: '1.5em', verticalAlign: 'middle', marginRight: 10 }}>people</Icon>
          Groupifier
        </Link>
      </Typography>
      {isSignedIn
        ? <Button color="inherit" onClick={onSignOut}>Sign out</Button>
        : <Button color="inherit" onClick={onSignIn}>Sign in</Button>}
    </Toolbar>
  </AppBar>
);

export default Header;
