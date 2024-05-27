import React, { useEffect, useState } from 'react';
import { Flex, Tag, Select } from 'antd';

const SelectStatus = ({ onStatusChange }) => {
  const [selectedStatusValues, setSelectedStatusValues] = useState(['success']);
  const [paramsStatus, setParamsStatus] = useState([3]);

  const options = [
    {
      label: 'Draft',
      value: 'processing',
    },
    {
      label: 'Pending Approval',
      value: 'warning',
    },
    {
      label: 'Active',
      value: 'success',
    },
    {
      label: 'Inactive',
      value: 'error',
    },
    {
      label: 'Approved',
      value: 'cyan',
    },
  ];

  const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        color={value}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{
          marginInlineEnd: 4,
        }}
      >
        {label}
      </Tag>
    );
  };

  const handleSelectChange = (selectedItems) => {
    setSelectedStatusValues(selectedItems);
  };

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < selectedStatusValues.length; i++) {
      switch (selectedStatusValues[i]) {
        case 'processing':
          arr.push(1);
          break;
        case 'warning':
          arr.push(2);
          break;
        case 'success':
          arr.push(3);
          break;
        case 'error':
          arr.push(4);
          break;
        default:
          arr.push(5);
      }
    }
    setParamsStatus(arr);
  }, [selectedStatusValues]);

  useEffect(() => {
    onStatusChange(paramsStatus);
  }, [paramsStatus]);



  return (
    <Flex justify="end" style={{ marginBottom: '24px' }}>
      <Flex
        vertical
        style={{
          minWidth: '150px',

        }}
      >
        <span>Select status &nbsp;</span>
        <Select
          mode="multiple"
          tagRender={tagRender}
          value={selectedStatusValues}
          onChange={handleSelectChange}
          style={{
            width: '100%',
          }}
          options={options.map((option) => ({
            ...option,
            disabled:
              selectedStatusValues.length === 1 &&
              selectedStatusValues.includes(option.value),
          }))}
          showSearch={false}
        />
      </Flex>
    </Flex>
  );
};

export default SelectStatus;
