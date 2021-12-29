import { Card, Tab, Tablist } from 'evergreen-ui';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { sizes } from './constants';
import { capitalize } from 'lodash';

enum Page {
  HOME = 'home',
  DEVICES = 'devices',
  COORDINATOR = 'coordinator',
}

const CONFIGURED_PAGES = [
  {
    label: capitalize(Page.HOME),
    value: Page.HOME,
  },
  {
    label: capitalize(Page.DEVICES),
    value: Page.DEVICES,
  },
  {
    label: capitalize(Page.COORDINATOR),
    value: Page.COORDINATOR,
  },
];

export function NavBar() {
  const history = useHistory();
  const location = useLocation();
  return (
    <Card
      display="flex"
      alignItems="stretch"
      justifyContent="stretch"
      borderTop
      borderRight
      borderLeft
      borderBottom
      elevation={2}
      height="100%"
    >
      <Tablist margin={sizes.margin.large} display="flex" flexDirection="column" height={240}>
        {CONFIGURED_PAGES.map(tab => (
          <Tab
            key={tab.label}
            id={tab.value}
            onSelect={() => history.push(`${tab.value}`)}
            isSelected={location.pathname.includes(tab.value)}
            aria-controls={`panel-${tab.value}`}
          >
            {tab.label}
          </Tab>
        ))}
      </Tablist>
    </Card>
  );
}
