import React, { useEffect, useState } from 'react';
import { Flex, Tooltip, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { contracts } from '../api';
import { extractContract, handelDate } from '../other/usefulFunctions';
import TableComponent from '../other/TableComponent';

const PendingContracts = () => {
  const [pendingContractsData, setPendingContractsData] = useState();
  const [loading, setLoading] = useState(false);
  const [totalRecordCount, setTotalRecordCount] = useState();
  const [filterFields, setFilterFields] = useState({
    page: 1,
    filterField: '',
    sorting :{ field: '', order: '' },
    filterValue: '',
  });
  const navigate = useNavigate();
  const [apiHit, setApiHit] = useState(false);


  const handleFilters = (value) => {
    setFilterFields(prevState => {
      if (
        prevState.page !== value.page ||
        prevState.filterField !== value.filterField ||
        prevState.sorting.field !== value.sorting.field ||
        prevState.sorting.order !== value.sorting.order ||
        prevState.filterValue !== value.filterValue
      ) {
        return {
          page: value.page,
          filterField: value.filterField,
          sorting: { 
            field: value.sorting.field,
            order: value.sorting.order
          },
          filterValue: value.filterValue
        };
      } else {
        return prevState;
      }
    });
    
  }

  const columns = [
    {
      title: 'Contract',
      dataIndex: 'contractName',
      key: 'contractName',
      width: '15%',
      render: (_, record) => extractContract(record.contractName),
    },
    {
      title: 'Client',
      dataIndex: 'legalEntityName',
      key: 'legalEntityName',
      width: '15%',
      render: (_, record) =>
        record.legalEntityName ? record.legalEntityName : '-',
    },
    {
      title: 'Business Owner',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (_, record) =>
        record.name ? record.name : '-',
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
      width: '15%',
      render: (_, record) => (record.projectName ? record.projectName : '-'),
    },
    {
      title: 'File',
      dataIndex: 'fileName',
      key: 'fileName',
      width: '20%',
      render: (_, record) => (
        <a target="_blank" rel="noreferrer" href={record.fileUrl}>
          {record.fileName}
        </a>
      ),
    },

    // {
    //   title: 'Start Date',
    //   dataIndex: 'activationDate',
    //   key: 'activationDate',
    //   width: '12%',
    //   render: (_, record) => handelDate(record.activationDate),
    // },
    // {
    //   title: 'End Date',
    //   dataIndex: 'expiryDate',
    //   width: '12%',
    //   key: 'expiryDate',
    //   render: (_, record) => handelDate(record.expiryDate),
    // },

    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '15%',
      fixed: 'right',
      render: (_, record) => (
        <>
          <Tooltip>
            <Button
              type="link"
              style={{
                color: '#fa541c',
              }}
              onClick={() => navigate(`/contract/${extractContract(record.contractName).toLowerCase()}/${record.contractId}`)}
            >
              <EyeOutlined />
            </Button>
          </Tooltip>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, [filterFields]);

  const fetchData = async () => {
    setLoading(true);
    try {
 
      const response = await contracts.pendingContracts(
        filterFields.page,
        filterFields.sorting.field,
        filterFields.sorting.order,
        filterFields.filterField,
        filterFields.filterValue);
      setTotalRecordCount(response.data.totalContractCount);
      setPendingContractsData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Flex vertical>
      <h2>Pending Approvals</h2>
      <TableComponent
        loading={loading}
        data={pendingContractsData}
        columns={columns}
        scrollX={1200}
        totalPages={totalRecordCount}
        onFilters={handleFilters}
      />
    </Flex>
  );
};

export default PendingContracts;
