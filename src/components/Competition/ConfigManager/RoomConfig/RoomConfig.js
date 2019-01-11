import React, { Component } from 'react';

import RoomName from '../../../common/RoomName/RoomName';
import ZeroablePositiveIntegerInput from '../../../common/ZeroablePositiveIntegerInput/ZeroablePositiveIntegerInput';
import { setIn } from '../../../../logic/utils';
import { getExtensionData, setExtensionData } from '../../../../logic/wcif-extensions';

export default class RoomConfig extends Component {
  handleInputChange = (event, value) => {
    const { room, onChange } = this.props;
    onChange(
      setExtensionData('RoomConfig', room, setIn(
        getExtensionData('RoomConfig', room), [event.target.name], value)
      )
    );
  };

  render() {
    const { room, disabled } = this.props;
    const { stations } = getExtensionData('RoomConfig', room);

    return (
      <div>
        <RoomName room={room} />
        <ZeroablePositiveIntegerInput
          label="Timing stations"
          value={stations}
          name="stations"
          onChange={this.handleInputChange}
          disabled={disabled}
        />
      </div>
    );
  }
}
