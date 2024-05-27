import React from 'react';
import { Table } from 'antd';


const PocPopup = ({ clintPoc,columns }) => {
  return (
    <Table
      dataSource={clintPoc}
      columns={columns}
      pagination={{ pageSize: 5 }}
    />
  );
};

export default PocPopup;
