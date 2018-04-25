import React, { PureComponent } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';
import Typography from 'material-ui/Typography';

import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
import Events from '../../../../logic/Events';
import { setIn } from '../../../../logic/helpers';

export default class EventConfig extends PureComponent {
  constructor(props) {
    super(props);

    const { eventId, wcifEvents = [] } = props;
    this.roundIds = wcifEvents
      .filter(wcifEvent => wcifEvent.id !== eventId)
      .reduce((roundIds, wcifEvent) =>
        roundIds.concat(wcifEvent.rounds.map(round => round.id))
      , []);
  }

  handleInputChange = (value, event) => {
    const { eventId, config, onChange } = this.props;
    onChange(
      setIn(config, event.target.name.split('.'), value),
      eventId
    );
  };

  handleCheckboxChangeNumerically = event => {
    this.handleInputChange(event.target.checked ? null : 0, event);
  };

  handleCheckboxChange = event => {
    this.handleInputChange(event.target.checked, event);
  };

  handleSeparateGroupsCheckboxChange = event => {
    this.handleInputChange(event.target.checked ? { roundId: this.roundIds[0], groups: null } : null, event);
  };

  handleSelectChange = event => {
    this.handleInputChange(event.target.value, event);
  };

  render() {
    const { config } = this.props;
    const { stations, scramblers, runners, generateJudges } = config;

    const roundIdToString = roundId => {
      const [, eventId, roundNumber] = roundId.match(/(\w+)-r(\d+)/);
      return `${Events.nameById(eventId)} Round ${roundNumber}`;
    }

    return (
      <Grid container>
        <Grid item xs={12} md={6}>
          <Grid container direction="column">
            <Grid item>
              <PositiveIntegerInput
                margin="normal"
                label="Timing stations"
                value={stations}
                name="stations"
                onChange={this.handleInputChange}
              />
            </Grid>
            <Grid item>
              <PositiveIntegerInput
                label="Scramblers"
                disabled={scramblers === 0}
                value={scramblers}
                name="scramblers"
                onChange={this.handleInputChange}
              />
              <Checkbox
                checked={scramblers !== 0}
                name="scramblers"
                onChange={this.handleCheckboxChangeNumerically}
              />
            </Grid>
            <Grid item>
              <PositiveIntegerInput
                label="Runners"
                disabled={runners === 0}
                value={runners}
                name="runners"
                onChange={this.handleInputChange}
              />
              <Checkbox
                checked={runners !== 0}
                name="runners"
                onChange={this.handleCheckboxChangeNumerically}
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox checked={generateJudges} name="generateJudges" onChange={this.handleCheckboxChange} />}
                label="Generate judges"
              />
            </Grid>
          </Grid>
        </Grid>
        {config.configByRound && (
          <Grid item xs={12} md={6}>
            <Grid container direction="column" spacing={16}>
              {Object.entries(config.configByRound).map(([roundId, roundConfig], index) =>
                <Grid item key={roundId}>
                  <Typography variant="body2">Round {index + 1}</Typography>
                  <PositiveIntegerInput
                    label="Groups"
                    helperText="X people in group"
                    value={roundConfig.groups}
                    name={`configByRound.${roundId}.groups`}
                    onChange={this.handleInputChange}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={roundConfig.separateGroups !== null}
                        name={`configByRound.${roundId}.separateGroups`}
                        onChange={this.handleSeparateGroupsCheckboxChange}
                      />
                    }
                    label="Separate groups for people participating in another event"
                  />
                  {roundConfig.separateGroups && (
                    <div>
                      <FormControl style={{width:201}}>
                        <InputLabel htmlFor="age-simple">Event</InputLabel>
                        <Select
                          value={roundConfig.separateGroups.roundId}
                          name={`configByRound.${roundId}.separateGroups.roundId`}
                          inputProps={{ id: 'round-id' }}
                          onChange={this.handleSelectChange}
                        >
                          {this.roundIds.map(roundId =>
                            <MenuItem key={roundId} value={roundId}>{roundIdToString(roundId)}</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                      <PositiveIntegerInput
                        label="Groups"
                        helperText="X people in group"
                        name={`configByRound.${roundId}.separateGroups.groups`}
                        value={roundConfig.separateGroups.groups}
                        onChange={this.handleInputChange}
                      />
                    </div>
                  )}
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    )
  }
}
