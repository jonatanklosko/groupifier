import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';

import { acceptedPeople } from '../../../logic/competitors';
import { difference } from '../../../logic/utils';

const roles = [
  { id: 'staff-scrambler', name: 'Scrambler' },
  { id: 'staff-judge', name: 'Judge' },
  { id: 'staff-runner', name: 'Runner' },
  { id: 'staff-dataentry', name: 'Data entry' },
];

export default class RolesManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localWcif: props.wcif,
      page: 0,
      searchString: ''
    }
  }

  handleSearchChange = event => {
    this.setState({ searchString: event.target.value });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleRoleChange(roleId, personWcaUserId, event) {
    const { localWcif } = this.state;
    const { checked } = event.target;

    this.setState({
      localWcif: {
        ...localWcif,
        persons: localWcif.persons.map(person =>
          person.wcaUserId === personWcaUserId
            ? { ...person, roles: checked ? [...person.roles, roleId] : difference(person.roles, [roleId]) }
            : person
        )
      }
    });
  }

  render() {
    const { page, searchString, localWcif } = this.state;
    const { onWcifUpdate } = this.props;
    const rowsPerPage = 5;
    const rowsPerPageOptions = [5];

    const people = acceptedPeople(localWcif)
      .filter(person => person.name.match(new RegExp(searchString, 'i')));

    return (
      <Grid container spacing={8} justify="flex-end">
        <Grid item xs={12}>
          <Paper>
            <Toolbar>
              <TextField label="Search" value={searchString} onChange={this.handleSearchChange} />
            </Toolbar>
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Person</TableCell>
                    {roles.map(role =>
                      <TableCell key={role.id} padding="none" style={{ textAlign: 'center' }}>{role.name}</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {people.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(person =>
                    <TableRow key={person.wcaUserId} hover>
                      <TableCell>{person.name}</TableCell>
                      {roles.map(role =>
                        <TableCell key={role.id} padding="checkbox" style={{ textAlign: 'center' }}>
                          <Checkbox
                            checked={person.roles.includes(role.id)}
                            onChange={this.handleRoleChange.bind(this, role.id, person.wcaUserId)}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              component="div"
              count={people.length}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              page={page}
              onChangePage={this.handleChangePage}
            />
          </Paper>
        </Grid>
        <Grid item>
          <Button variant="contained" component={Link} to={`/competitions/${localWcif.id}`}>
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onWcifUpdate(localWcif)}
            component={Link}
            to={`/competitions/${localWcif.id}`}
          >
            Done
          </Button>
        </Grid>
      </Grid>
    );
  }
}
