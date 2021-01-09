import { SidebarTab, Tablist } from 'evergreen-ui';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { sizes } from './constants';

enum Page {
  HOME = 'home',
  DEVICES = 'devices',
  COORDINATOR = 'coordinator',
}

const CONFIGURED_PAGES = [
  {
    label: Page.HOME,
    value: Page.HOME,
  },
  {
    label: Page.DEVICES,
    value: Page.DEVICES,
  },
  {
    label: Page.COORDINATOR,
    value: Page.COORDINATOR,
  },
];

export function NavBar() {
  const history = useHistory();
  const location = useLocation();
  return (
    <Tablist marginBottom={sizes.margin.large} marginRight={sizes.margin.large} flexBasis={240}>
      {CONFIGURED_PAGES.map(tab => (
        <SidebarTab
          key={tab.label}
          id={tab.value}
          onSelect={() => history.push(`${tab.value}`)}
          isSelected={location.pathname.includes(tab.value)}
          aria-controls={`panel-${tab.value}`}
        >
          {tab.label}
        </SidebarTab>
      ))}
    </Tablist>
  );
}
