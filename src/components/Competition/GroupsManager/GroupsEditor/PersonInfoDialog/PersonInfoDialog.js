import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Avatar, Box, Link, Tooltip, Typography } from '@material-ui/core';
import { age } from '../../../../../logic/competitors';
import {
  assignmentCodes,
  assignmentName,
  roleName,
} from '../../../../../logic/assignments';
import { WCA_ORIGIN } from '../../../../../logic/wca-env';
import { eventNameById } from '../../../../../logic/events';
import CubingIcon from '../../../../common/CubingIcon/CubingIcon';

const PersonInfoDialog = ({ person, onClose }) => {
  const assignmentsCount = code =>
    person.assignments?.filter(assignment =>
      assignment.assignmentCode.startsWith(code)
    ).length;

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <Avatar src={person.avatar?.thumbUrl} alt={person.name} />
          <Box display="flex" flexDirection="column" overflow="hidden">
            <Typography>
              {person.name}{' '}
              {person.wcaId && (
                <Link
                  href={`${WCA_ORIGIN}/persons/${person.wcaId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ({person.wcaId})
                </Link>
              )}
            </Typography>
            <Typography variant="subtitle2" noWrap>
              {person.roles?.length > 0 &&
                person.roles.map(role => roleName(role)).join(', ')}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            height: 'fit-content',
            mb: 2,
          }}
        >
          {person.registration?.eventIds?.length > 0 &&
            person.registration.eventIds.map(eventId => (
              <Tooltip
                key={eventId}
                title={eventNameById(eventId)}
                placement="top"
              >
                <Box>
                  <CubingIcon eventId={eventId} />
                </Box>
              </Tooltip>
            ))}
        </Box>
        {person.birthdate && (
          <Typography>
            Age: {age(person)} years old (
            {new Date(person.birthdate).toLocaleDateString()})
          </Typography>
        )}
        {person?.registration?.comments?.length > 0 && (
          <Typography>
            Registration comment: {person.registration.comments}
          </Typography>
        )}
        {person?.registration?.administrativeNotes?.length > 0 && (
          <Typography>
            Administrative notes: {person.registration.administrativeNotes}
          </Typography>
        )}
        <Typography>
          Total staff assignments: {assignmentsCount('staff-')}
        </Typography>
        {assignmentCodes.map(code => (
          <Typography key={code}>
            {assignmentName(code)}: {assignmentsCount(code)} times
          </Typography>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PersonInfoDialog;
