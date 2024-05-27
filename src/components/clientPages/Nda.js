import React, { useEffect, useState } from 'react';
import { Button, Flex, Modal, Tooltip, notification } from 'antd';
import { EditOutlined, EyeOutlined, FileDoneOutlined } from '@ant-design/icons';
import './styles.css';
import TableComponent from '../other/TableComponent';
import NdaPopup from './NdaPopup';
import { contracts } from '../api';
import { useLocation, useNavigate } from 'react-router-dom';
import { handelDate, handlestatus } from '../other/usefulFunctions';
import Filter from '../other/Filter';
import GetRole from '../../GetRole.utils';
import decodedToken from '../../DecodedToken.utils';

const Nda = () => {
  const location = useLocation();
  const { state } = location;
  const [loadings, setLoadings] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [contractsData, setContractsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecordCount, setTotalRecordCount] = useState();
  const [contractFilters, setContractFilters] = useState({
    status: state?.status ? state?.status : [1, 2, 3],
    expiredDays: state?.expireyDays ? state?.expireyDays : '',
  });

  const [showBtn, setShowBtn] = useState(false);
  const [filterFields, setFilterFields] = useState({
    page: 1,
    filterField: '',
    sorting: { field: '', order: '' },
    filterValue: '',
  });
  const navigate = useNavigate();
  const [clearForm, setClearForm] = useState(false);
  const [apiHit, setApiHit] = useState(false);

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
      style: {
        padding: '9px 24px',
      },
    });
  };

  const handleFilters = (value) => {
    setFilterFields((prevState) => {
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
            order: value.sorting.order,
          },
          filterValue: value.filterValue,
        };
      } else {
        return prevState;
      }
    });
  };

  const handleContractStatus = (values) => {
    setContractFilters((prev) => {
      return { ...prev, status: values };
    });
  };

  const handleExpireDays = (values) => {
    setContractFilters((prev) => {
      return { ...prev, expiredDays: values };
    });
  };

  const showModal = (key) => {
    setSelectedKey(key);
    setIsModalOpen(true);
    setClearForm(!clearForm);
    setApiHit(!apiHit);
  };

  const handlePopupCancel = () => {
    setSelectedKey(null);
    setIsModalOpen(false);
  };

  const getTitle = () => {
    return selectedKey ? selectedKey : 'Non-Disclosure Agreement (NDA)';
  };

  const handleApproval = (id) => {
    const postData = {
      cStatusId: 2,
      createdBy: decodedToken.employeeNo,
    };
    setLoadings(id);
    contracts
      .updateContractsData(id, postData)
      .then((res) => {
        openNotificationWithIcon('success', 'Contract sent for Approval');
        setShowBtn((prev) => !prev);
        setLoadings(null);
      })
      .catch((err) => {
        console.log(err);
        openNotificationWithIcon('error', 'Error in Sending Approval.');
        setLoadings(null);
      });
  };

  const highlightSearchText = (text, searchText) => {
    if (!searchText) return text;
    const regex = new RegExp(`(${searchText})`, 'gi');
    return text.replace(
      regex,
      '<span style="background-color: yellow;">$1</span>'
    );
  };

  const columns = [
    {
      title: 'Client',
      dataIndex: 'legalEntityName',
      key: 'legalEntityName',
      width: '10%',
    },
    {
      title: 'File',
      dataIndex: 'fileName',
      key: 'fileName',
      width: '10%',
      render: (_, record) => (
        <a target="_blank" rel="noreferrer" href={record.fileUrl}>
          {record.fileName}
        </a>
      ),
    },
    {
      title: 'Last Updated On',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '8%',
      render: (_, record) => handelDate(record.updatedAt),
    },
    {
      title: 'Status',
      dataIndex: 'cStatus',
      key: 'cStatus',
      width: '5%',
      render: (_, { cStatus }) => {
        return handlestatus(cStatus);
      },
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
      width: '10%',
      fixed: 'right',
      render: (_, record) => (
        <>
          {(record.cStatus === 'draft' ||
            record.cStatus === 'pendingapproval' ||
            record.cStatus === 'inactive') &&
            GetRole() !== 'finance' && (
              <Tooltip title="Edit" key={'Edit'}>
                <Button
                  onClick={() => showModal(record.contractId)}
                  type="link"
                  style={{
                    color: '#003eb3',
                  }}
                >
                  <EditOutlined />
                </Button>
              </Tooltip>
            )}

          <Modal
            // title={getTitle()}
            visible={isModalOpen && selectedKey === record?.contractId}
            onCancel={handlePopupCancel}
            footer={null}
          >
            <NdaPopup
              hide={setIsModalOpen}
              buttonText={'Update'}
              clientId={record?.contractId}
              status={record.cStatus}
              apiHit={apiHit}
            />
          </Modal>
          <Tooltip title="View" key={'View'}>
            <Button
              type="link"
              style={{
                color: '#fa541c',
              }}
              onClick={() => navigate(`/contract/nda/${record.contractId}`)}
            >
              <EyeOutlined />
            </Button>
          </Tooltip>
          {record.cStatus === 'draft' && GetRole() !== 'finance' ? (
            <Tooltip title="Send for Approval" key={'Approval'}>
              <Button
                loading={loadings === record.contractId}
                type="link"
                style={{
                  color: '#52c41a',
                }}
                onClick={() => handleApproval(record.contractId)}
              >
                <FileDoneOutlined />
              </Button>
            </Tooltip>
          ) : (
            <></>
          )}
        </>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await contracts.contractsAllData(
        filterFields.page,
        'nda',
        contractFilters.status,
        filterFields.sorting.field,
        filterFields.sorting.order,
        filterFields.filterField,
        filterFields.filterValue,
        contractFilters.expiredDays
      );
      setContractsData(response.data.data);
      setTotalRecordCount(response.data.totalContractCount);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isModalOpen, contractFilters, filterFields, showBtn]);


  return (
    <>
      <Flex justify="space-between">
        <h2>Non-Disclosure Agreement (NDA)</h2>
        {GetRole() !== 'finance' && (
          <Button onClick={() => showModal(null)} type="primary">
            Add NDA
          </Button>
        )}

        <Modal
          title={getTitle()}
          open={isModalOpen && !selectedKey}
          onCancel={() => {
            handlePopupCancel();
          }}
          footer={null}
        >
          <NdaPopup
            hide={setIsModalOpen}
            buttonText={'Save as Draft'}
            clearForm={clearForm}
          />
        </Modal>
      </Flex>
      <Flex style={{ position: 'relative' }} justify="end">
        <Filter
          handleContractStatus={handleContractStatus}
          handleExpireDays={handleExpireDays}
          expiredDays={contractFilters.expiredDays}
          status={contractFilters.status}
        />
      </Flex>
      <TableComponent
        loading={loading}
        data={contractsData}
        columns={columns}
        scrollX={1200}
        totalPages={totalRecordCount}
        onFilters={handleFilters}
      />
    </>
  );
};

export default Nda;
