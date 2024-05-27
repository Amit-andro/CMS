import React, { useState, useEffect, useRef } from 'react';
import { Button, Checkbox, Radio, Space, Col, Row, Badge } from 'antd';
import { FilterFilled, CloseOutlined } from '@ant-design/icons';
import './styles.css';

const Filter = ({ handleContractStatus, handleExpireDays, expiredDays, status }) => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(expiredDays ? Number(expiredDays) : '');
  const [selectedStatus, setSelectedStatus] = useState(status || [1,2,3]);
  const filterRef = useRef(null);
  const [filterCount, setFilterCount] = useState(1);

  const allFilters = [
    { label: 'Draft', value: 1, color: '#1677ff' },
    { label: 'Pending Approval', value: 2, color: '#faad14' },
    { label: 'Active', value: 3, color: '#52c41a' },
    { label: 'Inactive', value: 4, color: '#f5222d' },
    { label: 'Approval', value: 5, color: '#13c2c2' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target) && !event.target.closest('.filterBtn')) {
        setVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

 

  useEffect(() => {
    handleExpireDays(value);
    if (value > 0) {
      setSelectedStatus([3]);
    } else {
      setSelectedStatus(status || [1,2,3]);
    }
  }, [value]);

  useEffect(() => {
    handleContractStatus(selectedStatus);
    setSelectedStatus(selectedStatus);
  }, [selectedStatus]);

  const onChange = (e) => {
    setValue(e.target.value);
    updateFilterCount(e.target.value, selectedStatus);
  };

  const onCheckboxSelection = (checkedValues) => {
    setSelectedStatus(checkedValues);
    updateFilterCount(value, checkedValues);
  };

  const updateFilterCount = (expireDaysValue, statusValues) => {
    const totalCount = (expireDaysValue ? 1 : 0) + (statusValues.length > 0 ? 1 : 0);
    setFilterCount(totalCount);
  };

  const toggleFilter = () => {
    setVisible((prev) => !prev);
  };

  const clearFilters = () => {
    setValue('');
    setSelectedStatus([1, 2, 3]);
    setFilterCount(1);
  };



  console.log("status", status, value);

  return (
    <>
      <Button type="link" onClick={toggleFilter} className="filterBtn">
        <Badge size="small" count={filterCount}>
          <FilterFilled style={{ color: '#1677ff' }} />{' '}
        </Badge>
        &nbsp; Filter
      </Button>

      {visible && (
        <div
          ref={filterRef}
          style={{
            boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
            padding: '10px 20px',
            borderRadius: '10px',
            width: '250px',
            position: 'absolute',
            zIndex: '10',
            backgroundColor: '#FFF',
            top: '100%',
            right: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '16px', fontWeight: '700' }}>Filters</span>
            <Button
              type="link"
              style={{ color: '#8c8c8c', height: '16px', width: '16px' }}
              icon={<CloseOutlined />}
              onClick={toggleFilter}
            />
          </div>
          <div style={{ marginTop: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ paddingLeft: '5px', fontWeight: '500' }}>Expire In</span>
                <span
                  style={{ fontWeight: '500', color: '#1677ff', cursor: 'pointer' }}
                  onClick={clearFilters}
                >
                  Clear
                </span>
              </div>
              <Radio.Group
                style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '5px 10px', width: '100%' }}
                onChange={onChange}
                value={value}
              >
                <Space direction="vertical">
                  <Radio value={7}>7 Days</Radio>
                  <Radio value={15}>15 Days</Radio>
                  <Radio value={30}>30 Days</Radio>
                </Space>
              </Radio.Group>
            </div>
            <div style={{ marginTop: '16px' }}>
              <span style={{ paddingLeft: '5px',
                fontWeight: '500' }}>
                Status
              </span>
              <Checkbox.Group
                style={{
                  width: '100%',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  padding: '5px 10px',
                }}
                onChange={onCheckboxSelection}
                value={selectedStatus}
              >
                <Row gutter={[8, 8]}>
                  {allFilters.map((filter) => (
                    <Col key={filter.value} className="gutter-row" span={24}>
                      <Checkbox
                        value={filter.value}
                        disabled={value > 0 && filter.label !== 'Active'}
                        style={{ color: filter.color }}
                      >
                        {filter.label}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Filter;
