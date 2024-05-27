import React from 'react';
import { Dropdown } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';
import './styles.css'

const items = [
  {
    key: '1',
    label: (
      <ul className='notificationList'>
        <li>Notification 1</li>
        <li>Notification 2</li>
        <li>Notification 3</li>
      </ul>
    ),
  },
];

const Notification = () => {
  return (
    <Dropdown
      menu={{
        items,
      }}
      placement="bottom"
    >
      <NotificationOutlined
        style={{ color: '#fff', cursor: 'pointer', fontSize: '20px' }}
      />
    </Dropdown>
  );
};

export default Notification;
