import React, { PureComponent } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';
import Typography from 'material-ui/Typography';

import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
import { setIn } from '../../../../logic/helpers';
import { roundIdToName } from '../../../../logic/formatters';

export default class RoundConfig extends PureComponent {
  handlePropertyChange = (propertyPath, value) => {
    const { roundId, config, onChange } = this.props;
    onChange(setIn(config, propertyPath, value), roundId);
  };

  handleInputChange = (event, value) => {
    this.handlePropertyChange(event.target.name.split('.'), value);
  };

  handleSeparateGroupsCheckboxChange = event => {
    const { name, checked } = event.target;
    this.handlePropertyChange(name.split('.'), checked ? { roundId: this.props.roundIds[0], groups: null } : null);
  };

  handleSelectChange = event => {
    const { name, value } = event.target;
    this.handlePropertyChange(name.split('.'), value);
  };

  groupSizeText(competitors, groups) {
    return groups ? `${Math.ceil(competitors.length / groups)} people in group` : '';
  }

  render() {
    const { config, label, roundIds, competitorsByRound, roundId } = this.props;
    const { groups, separateGroups } = config;

    const separateGroupsCompetitors = separateGroups ? competitorsByRound[separateGroups.roundId] : [];
    const competitors = competitorsByRound[roundId]
      .filter(person => !separateGroupsCompetitors.includes(person));

    return (
      <div>
        <Typography variant="body2">{label}</Typography>
        <PositiveIntegerInput
          label="Groups"
          helperText={this.groupSizeText(competitors, groups)}
          value={groups}
          name="groups"
          onChange={this.handleInputChange}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={separateGroups !== null}
              name="separateGroups"
              onChange={this.handleSeparateGroupsCheckboxChange}
            />
          }
          label="Separate groups for people participating in another event"
        />
        {separateGroups && (
          <div>
            <FormControl style={{width:201}}>
              <InputLabel htmlFor="round-id">Event</InputLabel>
              <Select
                inputProps={{ id: 'round-id' }}
                value={separateGroups.roundId}
                name="separateGroups.roundId"
                onChange={this.handleSelectChange}
              >
                {roundIds.map(roundId =>
                  <MenuItem key={roundId} value={roundId}>{roundIdToName(roundId)}</MenuItem>
                )}
              </Select>
            </FormControl>
            <PositiveIntegerInput
              label="Groups"
              helperText={this.groupSizeText(separateGroupsCompetitors, separateGroups.groups)}
              name="separateGroups.groups"
              value={separateGroups.groups}
              onChange={this.handleInputChange}
            />
          </div>
        )}
      </div>
    );
  }
}
