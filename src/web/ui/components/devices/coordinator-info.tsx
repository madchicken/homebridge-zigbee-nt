import { CoordinatorModel } from '../../../common/types';
import { Heading, Pane } from 'evergreen-ui';
import { sizes } from '../constants';
import React from 'react';

interface Props {
  device: CoordinatorModel;
}

export function CoordinatorInfo(props: Props) {
  const { device } = props;
  return (
    <React.Fragment>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>IEEE Address: {device.ieeeAddr}</Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>
          Version: {device.meta.majorrel}.{device.meta.minorrel} (rev. {device.meta.revision})
        </Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>
          Transport Version: {device.meta.maintrel} (rev. {device.meta.transportrev})
        </Heading>
      </Pane>
    </React.Fragment>
  );
}
