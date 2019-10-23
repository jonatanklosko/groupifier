import React, { useState } from 'react';
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
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/Info';

import SaveWcifButton from '../../common/SaveWcifButton/SaveWcifButton';
import { acceptedPeople } from '../../../logic/competitors';
import { difference, sortBy } from '../../../logic/utils';

const roles = [
  { id: 'staff-scrambler', name: 'Scrambler' },
  { id: 'staff-judge', name: 'Judge' },
  { id: 'staff-runner', name: 'Runner' },
  { id: 'staff-dataentry', name: 'Data entry' },
];

const rowsPerPage = 5;
const rowsPerPageOptions = [5];

const RolesManager = ({ wcif, onWcifUpdate }) => {
  const [localWcif, setLocalWcif] = useState(wcif);
  const [page, setPage] = useState(0);
  const [searchString, setSearchString] = useState('');

  const allSortedPeople = sortBy(
    acceptedPeople(localWcif),
    person => person.name
  );
  const people = !searchString
    ? allSortedPeople
    : allSortedPeople.filter(person =>
        searchString
          .split(/\s*,\s*/)
          .some(
            searchPart =>
              searchPart && person.name.match(new RegExp(searchPart, 'i'))
          )
      );

  const handleSearchStringChange = event => {
    setSearchString(event.target.value);
    setPage(0);
  };

  const handleRoleChange = (roleId, personWcaUserId, event) => {
    const { checked } = event.target;
    setLocalWcif({
      ...localWcif,
      persons: localWcif.persons.map(person =>
        person.wcaUserId === personWcaUserId
          ? {
              ...person,
              roles: checked
                ? [...person.roles, roleId]
                : difference(person.roles, [roleId]),
            }
          : person
      ),
    });
  };

  const clearRoles = () => {
    const roleIds = roles.map(role => role.id);
    setLocalWcif({
      ...localWcif,
      persons: localWcif.persons.map(person => ({
        ...person,
        roles: difference(person.roles, roleIds),
      })),
    });
  };

  return (
    <Grid container spacing={1} justify="flex-end">
      <Grid item xs={12}>
        <Paper>
          <Toolbar>
            <Grid container spacing={1} alignItems="flex-end">
              <Grid item>
                <TextField
                  label="Search"
                  value={searchString}
                  onChange={event => handleSearchStringChange(event)}
                />
              </Grid>
              <Grid item>
                <Tooltip
                  title="If you separate search phrases with a comma, anyone matching either of them will show up."
                  placement="right"
                >
                  <InfoIcon color="action" />
                </Tooltip>
              </Grid>
            </Grid>
          </Toolbar>
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow style={{ whiteSpace: 'nowrap' }}>
                  <TableCell>Person</TableCell>
                  {roles.map(role => (
                    <TableCell
                      key={role.id}
                      padding="none"
                      align="center"
                      style={{ minWidth: 100 }}
                    >
                      {role.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {people
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(person => (
                    <TableRow key={person.wcaUserId} hover>
                      <TableCell>{person.name}</TableCell>
                      {roles.map(role => (
                        <TableCell
                          key={role.id}
                          padding="checkbox"
                          align="center"
                        >
                          <Checkbox
                            checked={person.roles.includes(role.id)}
                            onChange={handleRoleChange.bind(
                              this,
                              role.id,
                              person.wcaUserId
                            )}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            component="div"
            count={people.length}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            page={page}
            onChangePage={(event, page) => setPage(page)}
          />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="caption" component="div">
          {`Use this section only if you have a group of staff among competitors.
            People with the given role will be prioritized during task assignment.`}
        </Typography>
        <Typography variant="caption">
          {`Note: if you don't set any roles, people will still be assigned tasks if configured to.`}
        </Typography>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          component={Link}
          to={`/competitions/${localWcif.id}`}
        >
          Cancel
        </Button>
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={clearRoles}>
          Clear
        </Button>
      </Grid>
      <Grid item>
        <SaveWcifButton
          wcif={wcif}
          updatedWcif={localWcif}
          onWcifUpdate={onWcifUpdate}
        />
      </Grid>
    </Grid>
  );
};

export default RolesManager;
