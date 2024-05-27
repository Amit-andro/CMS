import React from 'react';
import Cookies from 'js-cookie';
import { Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import decodedToken from '../../DecodedToken.utils';

const handleLogOut = () => {
  Cookies.remove('token');
  window.location.href = 'http://stagingapps.spanidea.com/login';
};

const items = [
  {
    key: '1',
    label: <span>{decodedToken.name}</span>,
  },
  {
    key: '2',
    label: (  
      <a rel="noopener noreferrer" onClick={handleLogOut}>
        Log Out
      </a>
    ),
  },
];

const User = () => {
  return (
    <Dropdown
      menu={{
        items,
      }}
      placement="bottom"
    >
      <UserOutlined
        style={{ color: '#fff', cursor: 'pointer', fontSize: '20px' }}
      />
    </Dropdown>
  );
};

export default User;
