import React, { useState, useEffect } from 'react';
import { Button, Flex, Modal, Tag, Tooltip, notification } from 'antd';
import { EditOutlined, EyeOutlined, FileDoneOutlined } from '@ant-design/icons';
import './styles.css';
import TableComponent from '../other/TableComponent';
import PoPopup from './PoPopup';
import { contracts } from '../api';
import { handlestatus, highlightSearchText } from '../other/usefulFunctions';
import SelectStatus from '../other/SelectStatus';
import { useLocation, useNavigate } from 'react-router-dom';
import Filter from '../other/Filter';
import GetRole from '../../GetRole.utils';
import decodedToken from '../../DecodedToken.utils';

const Po = () => {
  const location = useLocation();
  const { state } = location;
  const [contractData, setContractData] = useState([]);
  const [totalRecords, setTotalRecords] = useState([]);
  const [showBtn, setShowBtn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  // const [contractsData, setContractsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(null);
  const [filterFields, setFilterFields] = useState({
    page: 1,
    filterField: '',
    sorting: { field: '', order: '' },
    filterValue: '',
  });
  const [contractFilters, setContractFilters] = useState({
    status: state?.status ? state?.status : [1,2,3],
    expiredDays: state?.expireyDays ? state?.expireyDays : '',
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
    return selectedKey ? selectedKey : 'Purchase order (PO)';
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

  const handleApproval = (id) => {
    const postData = {
      cStatusId: 2,
      createdBy: decodedToken.employeeNo,
    };
    setLoadingApproval(id);
    contracts
      .updateContractsData(id, postData)
      .then((res) => {
        openNotificationWithIcon('success', 'Contract sent for Approval');
        setShowBtn((prev) => !prev);
        setLoadingApproval(null);
      })
      .catch((err) => {
        console.log(err);
        openNotificationWithIcon('error', err.response.data.message);
        setLoadingApproval(null);
      });
  };


  const columns = [
    {
      title: 'Legal Entity Name',
      dataIndex: 'legalEntityName',
      key: 'legalEntityName',
      width: '15%',
    },
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: '15%',
    },
    {
      title: 'End Date',
      dataIndex: 'expiryDate',
      width: '15%',
      key: 'expiryDate',
    },
    {
      title: 'Status',
      dataIndex: 'cStatus',
      key: 'cStatus',
      width: '15%',
      render: (_, record) => handlestatus(record.cStatus),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '15%',
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
                >
                  <EditOutlined />
                </Button>{' '}
                <Modal
                  // title={getTitle()}
                  visible={isModalOpen && selectedKey === record?.contractId}
                  onCancel={handlePopupCancel}
                  footer={null}
                >
                  <PoPopup
                    hide={setIsModalOpen}
                    buttonText={'Update'}
                    clientId={record?.contractId}
                    status={record.cStatus}
                    apiHit={apiHit}
                  />
                </Modal>
              </Tooltip>
            )}

          <Tooltip title="View" key={'View'}>
            <Button
              type="link"
              style={{
                color: '#fa541c',
              }}
              onClick={() => navigate(`/contract/po/${record?.contractId}`)}
            >
              <EyeOutlined />
            </Button>
          </Tooltip>
          {record.cStatus === 'draft' && GetRole() !== 'finance' ? (
            <Tooltip title="Send for Approval" key={'Approval'}>
              <Button
                type="link"
                style={{
                  color: '#52c41a',
                }}
                onClick={() => handleApproval(record?.contractId)}
                loading={loadingApproval === record?.contractId}
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

  useEffect(() => {
    fetchData();
  }, [isModalOpen, showBtn, filterFields, contractFilters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await contracts.contractsAllData(
        filterFields.page,
        'po',
        contractFilters.status,
        filterFields.sorting.field,
        filterFields.sorting.order,
        filterFields.filterField,
        filterFields.filterValue,
        contractFilters.expiredDays
      );
      const data = response.data;

      setContractData(data.data);
      setTotalRecords(data.totalContractCount);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Flex justify="space-between" style={{ marginBottom: '30px' }}>
        <h2>Purchase order (PO)</h2>
        {GetRole() !== 'finance' && (
          <Button onClick={() => showModal(null)} type="primary">
            Add PO
          </Button>
        )}
        <Modal
          title={getTitle()}
          visible={isModalOpen && !selectedKey}
          onCancel={handlePopupCancel}
          footer={null}
        >
          <PoPopup
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
        data={contractData}
        columns={columns}
        scrollX={1200}
        totalPages={totalRecords}
        onFilters={handleFilters}
      />
    </>
  );
};

export default Po;
