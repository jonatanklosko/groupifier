import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableHead, TableRow, TablePagination } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import Toolbar from 'material-ui/Toolbar';

const roles = [
  { id: 'scrambler', name: 'Scrambler' },
  { id: 'judge', name: 'Judge' },
  { id: 'runner', name: 'Runner' },
  { id: 'dataentry', name: 'Data entry' },
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

    const includeElement = (element, include, array) =>
      include ? [...array, element] : array.filter(x => x !== element);

    this.setState({
      localWcif: {
        ...localWcif,
        persons: localWcif.persons.map(person =>
          person.wcaUserId === personWcaUserId
            ? { ...person, roles: includeElement(roleId, event.target.checked, person.roles) }
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

    const people = localWcif.persons
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
          <Button variant="raised" component={Link} to={`/competitions/${localWcif.id}`}>
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="raised"
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
