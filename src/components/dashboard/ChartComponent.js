import React from 'react';
import { Column } from '@ant-design/plots';

const ChartComponent = ({ data,yaxisData }) => {
  const config = {
    data,
    xField: 'date',
    yField: 'count',
    colorField: 'contractName',
    stack: true,
    scale:{
      y:{
        domain:yaxisData
      }
    }

  };


  return (
    <div style={{ height: '240px' }}>
      <Column {...config} />
    </div>
  );
};

export default ChartComponent;
