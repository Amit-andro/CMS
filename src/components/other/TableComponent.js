import React, { useState, useEffect } from 'react';
import { Button, Input, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import '../clientPages/styles.css';

const TableComponent = ({
  data,
  columns,
  scrollX,
  loading,
  totalPages,
  onFilters,
}) => {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState(null);
  const [sorting, setSorting] = useState({ field: '', order: '' });
  const [filterFields, setFilterFields] = useState({
    page: 1,
    filterField: '',
    sorting: { field: '', order: '' },
    filterValue: '',
  });

  useEffect(() => {
    setCurrentPage(1);
    const nreArr = Object.entries(filters).find(
      ([key, value]) => value !== undefined
    );
    setFilterFields((prev) => ({
      ...prev,
      sorting,
      filterField: nreArr ? nreArr[0] : '',
      filterValue: nreArr ? nreArr[1] : '',
    }));
  }, [filters, sorting]);

  useEffect(() => {
    onFilters(filterFields);
  }, [filterFields]);

  const handleSort = (field) => {
    const isAsc = sorting.field === field && sorting.order === 'asc';
    const order = isAsc ? 'desc' : 'asc';
    setSorting({ field, order });
  };

  const handleSearch = (key, selectedKey, confirm) => {
    setActiveFilter(key);
    confirm();
    setFilters((prevFilters) => {
      const updatedFilters = Object.fromEntries(
        Object.keys(prevFilters).map((k) => [k, undefined])
      );

      updatedFilters[key] = selectedKey;

      return updatedFilters;
    });
  };

  const handleReset = (key, clearFilters, close) => {
    setActiveFilter(null);
    clearFilters();
    setFilters(() => ({
      [key]: '',
    }));
    close();
  };

  const getColumnSearchProps = (dataIndex, title) => {
    if (dataIndex === 'updatedAt') {
      return {};
    }

    return {
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search ${title}`}
            value={selectedKeys[0]}
            onChange={(e) => {
              setSearchText(e.target.value);
              setSelectedKeys(e.target.value ? [e.target.value] : []);
            }}
            onPressEnter={() =>
              handleSearch(dataIndex, selectedKeys[0], confirm)
            }
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(dataIndex, selectedKeys[0], confirm)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => handleReset(dataIndex, clearFilters, close)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: activeFilter === dataIndex && filtered ? '#1890ff' : 'grey',
          }}
        />
      ),
      onFilter: (value, record) => true,
      render: (text) =>
        searchText && dataIndex === activeFilter ? (
          <span>
            {text
              ? text
                  .toString()
                  .split(new RegExp(`(${searchText})`, 'gi'))
                  .map((part, i) =>
                    part.toLowerCase() === searchText.toLowerCase() ? (
                      <span key={i} style={{ backgroundColor: '#ffc069' }}>
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )
              : null}
          </span>
        ) : (
          text
        ),
    };
  };

  const newColumns = [];

  for (let i = 0; i < columns.length; i++) {
    let obj = {};

    if (columns[i].key === 'action' || columns[i].key === 'cStatus') {
      obj = { ...columns[i] };
    } else {
      obj = {
        ...columns[i],
        ...getColumnSearchProps(`${columns[i].dataIndex}`, columns[i].title),
        sorter: true,
        sortOrder:
          sorting.field === `${columns[i].dataIndex}` ? sorting.order : false,
        onHeaderCell: () => ({
          onClick: () => handleSort(`${columns[i].dataIndex}`),
        }),
      };
    }

    newColumns.push(obj);

  }

  return (
    <Table
      loading={loading}
      columns={newColumns}
      dataSource={data}
      pagination={{
        defaultCurrent: currentPage,
        pageSize: 10,
        total: totalPages,
        onChange: (page) => {
          setFilterFields((prev) => ({ ...prev, page: page }));
        },
        showLessItems: true,
        showSizeChanger: false,
      }}
      scroll={{
        x: scrollX,
      }}
    />
  );
};

export default TableComponent;
