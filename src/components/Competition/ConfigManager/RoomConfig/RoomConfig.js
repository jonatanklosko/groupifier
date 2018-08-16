import React, { Component } from 'react';

import RoomName from '../../../common/RoomName/RoomName';
import ZeroablePositiveIntegerInput from '../../../common/ZeroablePositiveIntegerInput/ZeroablePositiveIntegerInput';
import { setIn } from '../../../../logic/helpers';
import { getGroupifierData, setGroupifierData } from '../../../../logic/wcifExtensions';

export default class RoomConfig extends Component {
  get roomData() {
    return getGroupifierData(this.props.room) || { stations: null };
  }

  handleInputChange = (event, value) => {
    const { room, onChange } = this.props;
    onChange(
      setGroupifierData('Room', room, setIn(
        this.roomData, [event.target.name], value)
      )
    );
  };

  render() {
    const { room, disabled } = this.props;

    return (
      <div>
        <RoomName room={room} />
        <ZeroablePositiveIntegerInput
          label="Timing stations"
          value={this.roomData.stations}
          name="stations"
          onChange={this.handleInputChange}
          disabled={disabled}
        />
      </div>
    );
  }
}
