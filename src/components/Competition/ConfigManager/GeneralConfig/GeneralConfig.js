import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import {
  getExtensionData,
  setExtensionData,
} from '../../../../logic/wcif-extensions';
import { setIn } from '../../../../logic/utils';

const competitorsSortingRules = [
  {
    id: 'ranks',
    name: 'Official rankings',
    description: 'Sort competitors by their official rankings.',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description:
      'Sort competitors in 3x3x3 (any variation), 2x2x2, Pyraminx, Skewb, Square-1 and Clock by their official rankings. For other events put best people in different groups, so that there are good scramblers for each group.',
  },
  {
    id: 'symmetric',
    name: 'Symmetric',
    description:
      'Put best people in different groups, so that there are good scramblers for each group.',
  },
  {
    id: 'name-optimised',
    name: 'Name-optimised',
    description:
      'Sort competitors by their official rankings, but also minimize the number of people with the same name in each group. Use it when many competitors have the same name.',
  },
];

const scorecardPaperSizes = [
  {
    id: 'a4',
    name: 'Four scorecards per page (A4 paper)',
  },
  {
    id: 'letter',
    name: 'Four scorecards per page (Letter paper, used in North America)',
  },
  {
    id: 'a6',
    name: 'One scorecard per page (A6 paper)',
  },
];

const scorecardSortingRules = [
  {
    id: 'natural',
    name:
      'Scorecards are arranged by row, page by page (1/2/3/4 5/6/7/8 9/10/11/12)',
  },
  {
    id: 'stacked',
    name:
      'Scorecards are arranged such that each stack of scorecards is sorted (1/4/7/10 2/5/8/11 3/6/9/12)',
  },
];

const GeneralConfig = ({ wcif, onWcifChange }) => {
  const handlePropertyChange = (property, value) => {
    onWcifChange(
      setExtensionData(
        'CompetitionConfig',
        wcif,
        setIn(getExtensionData('CompetitionConfig', wcif), [property], value)
      )
    );
  };

  const handleCheckboxChange = event => {
    const { name, checked } = event.target;
    handlePropertyChange(name, checked);
  };

  const handleTextFieldChange = event => {
    const { name, value } = event.target;
    handlePropertyChange(name, value);
  };

  const {
    competitorsSortingRule,
    noTasksForNewcomers,
    tasksForOwnEventsOnly,
    noRunningForForeigners,
    localNamesFirst,
    printOneName,
    scorecardsBackgroundUrl,
    printStations,
    scorecardPaperSize,
    scorecardOrder,
    printScorecardsCoverSheets,
    printScrambleCheckerForTopRankedCompetitors,
    printScrambleCheckerForFinalRounds,
    printScrambleCheckerForBlankScorecards,
  } = getExtensionData('CompetitionConfig', wcif);

  return (
    <Paper style={{ padding: 16 }}>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h5" gutterBottom>
            Assignments
          </Typography>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <FormControl fullWidth>
                <InputLabel htmlFor="competitors-sorting-rule">
                  Competitors sorting rule
                </InputLabel>
                <Select
                  value={competitorsSortingRule}
                  onChange={handleTextFieldChange}
                  inputProps={{
                    name: 'competitorsSortingRule',
                    id: 'competitors-sorting-rule',
                  }}
                >
                  {competitorsSortingRules.map(({ id, name }) => (
                    <MenuItem value={id} key={id}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {competitorsSortingRules.find(
                    ({ id }) => id === competitorsSortingRule
                  ).description + ' Note: this applies to first rounds only.'}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    name="noTasksForNewcomers"
                    checked={noTasksForNewcomers}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Don't assign tasks to newcomers"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    name="tasksForOwnEventsOnly"
                    checked={tasksForOwnEventsOnly}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Assign tasks to competitors only in events they registered for"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    name="noRunningForForeigners"
                    checked={noRunningForForeigners}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Don't assign running to foreigners"
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Typography variant="h5" gutterBottom>
            Printing
          </Typography>
          <Grid item>
            <FormControl fullWidth>
              <InputLabel htmlFor="scorecard-paper-size">
                Scorecard Paper Size
              </InputLabel>
              <Select
                value={scorecardPaperSize}
                onChange={handleTextFieldChange}
                inputProps={{
                  name: 'scorecardPaperSize',
                  id: 'scorecard-paper-size',
                }}
              >
                {scorecardPaperSizes.map(({ id, name }) => (
                  <MenuItem value={id} key={id}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl fullWidth>
              <InputLabel htmlFor="scorecard-sort-order">
                Scorecard order
              </InputLabel>
              <Select
                value={scorecardOrder}
                onChange={handleTextFieldChange}
                inputProps={{
                  name: 'scorecardOrder',
                  id: 'scorecard-order',
                }}
              >
                {scorecardSortingRules.map(({ id, name }) => (
                  <MenuItem value={id} key={id}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  name="printScorecardsCoverSheets"
                  checked={printScorecardsCoverSheets}
                  onChange={handleCheckboxChange}
                />
              }
              label="Print cover sheets for scorecards"
            />
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  name="localNamesFirst"
                  checked={localNamesFirst}
                  onChange={handleCheckboxChange}
                />
              }
              label="Swap latin names with local ones"
            />
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  name="printOneName"
                  checked={printOneName}
                  onChange={handleCheckboxChange}
                />
              }
              label="Only one name (does not put local/latin name in parentheses)"
            />
          </Grid>
          <Grid>
            <FormControlLabel
              control={
                <Checkbox
                  name="printScrambleCheckerForTopRankedCompetitors"
                  checked={printScrambleCheckerForTopRankedCompetitors}
                  onChange={handleCheckboxChange}
                />
              }
              label="Print out scramble checker sign box for top ranked competitors (WR100 in single or WR50/NR15 in average)"
            />
          </Grid>
          <Grid>
            <FormControlLabel
              control={
                <Checkbox
                  name="printScrambleCheckerForFinalRounds"
                  checked={printScrambleCheckerForFinalRounds}
                  onChange={handleCheckboxChange}
                />
              }
              label="Print out scramble checker sign box for final rounds"
            />
          </Grid>
          <Grid>
            <FormControlLabel
              control={
                <Checkbox
                  name="printScrambleCheckerForBlankScorecards"
                  checked={printScrambleCheckerForBlankScorecards}
                  onChange={handleCheckboxChange}
                />
              }
              label="Print out scrambler checker sign box for blank scorecards"
            />
          </Grid>
          <Grid>
            <FormControlLabel
              control={
                <Checkbox
                  name="printStations"
                  checked={printStations}
                  onChange={handleCheckboxChange}
                />
              }
              label="Print out station number"
            />
            <FormHelperText>
              Note that this is printing only, you have to control if there is
              enough stations for everyone manually
            </FormHelperText>
          </Grid>
          <TextField
            fullWidth
            label="Scorecards background image URL"
            name="scorecardsBackgroundUrl"
            value={scorecardsBackgroundUrl}
            onChange={handleTextFieldChange}
            helperText="The image is placed at the center of each scorecard."
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GeneralConfig;
