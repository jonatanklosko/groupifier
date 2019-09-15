import React from 'react';

import RoomName from '../../../common/RoomName/RoomName';
import ZeroablePositiveIntegerInput from '../../../common/ZeroablePositiveIntegerInput/ZeroablePositiveIntegerInput';
import { setIn } from '../../../../logic/utils';
import {
  getExtensionData,
  setExtensionData,
} from '../../../../logic/wcif-extensions';

const RoomConfig = ({ room, onChange, disabled }) => {
  const handleInputChange = (event, value) => {
    onChange(
      setExtensionData(
        'RoomConfig',
        room,
        setIn(getExtensionData('RoomConfig', room), [event.target.name], value)
      )
    );
  };

  const { stations } = getExtensionData('RoomConfig', room);

  return (
    <div>
      <RoomName room={room} />
      <ZeroablePositiveIntegerInput
        label="Timing stations"
        value={stations}
        name="stations"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  );
};

export default RoomConfig;
