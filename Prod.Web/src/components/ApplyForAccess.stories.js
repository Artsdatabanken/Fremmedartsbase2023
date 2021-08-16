import React from 'react';
import PropTypes from 'prop-types';

import ApplyForAccess from './ApplyForAccess';

export default {
  title: 'Components/ApplyForAccess',
  component: ApplyForAccess,
};

const Template = (args) => <ApplyForAccess {...args} />;

// export const LoggedIn = Template.bind({});
// LoggedIn.args = {
//   user: {},
// };

export const LoggedOut = Template.bind({});
LoggedOut.args = {};