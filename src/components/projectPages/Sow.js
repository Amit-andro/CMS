import React, { useEffect, useState } from 'react';
import { Button, Flex, Modal, Tag, Tooltip, notification } from 'antd';
import { EditOutlined, EyeOutlined, FileDoneOutlined } from '@ant-design/icons';
import './styles.css';
import TableComponent from '../other/TableComponent';
import SowPopup from './SowPopup';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { contracts } from '../api';
import { handlestatus, highlightSearchText } from '../other/usefulFunctions';
import { handelDate } from '../other/usefulFunctions';
import Filter from '../other/Filter';
import GetRole from '../../GetRole.utils';
import decodedToken from '../../DecodedToken.utils';

const Sow = () => {
  const location = useLocation();
  const { state } = location;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(null);
  const [totalRecordCount, setTotalRecordCount] = useState();
  const [contractsData, setContractsData] = useState([]);
  const [showBtn, setShowBtn] = useState(false);
  const [filterFields, setFilterFields] = useState({
    page: 1,
    filterField: '',
    sorting: { field: '', order: '' },
    filterValue: '',
  });
  const [contractFilters, setContractFilters] = useState({
    status: state?.status ? state?.status : [1, 2, 3],
    expiredDays: state?.expireyDays ? state?.expireyDays : '',
  });

  const navigate = useNavigate();
  const [clearForm, setClearForm] = useState(false);
  const [apiHit, setApiHit] = useState(false);

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

  const getTitle = () => {
    return selectedKey ? selectedKey : 'Statement of Work (SOW)';
  };

  const handleContractStatus = (values) => {
    setContractFilters((prev) => {
      return { ...prev, status: values };
    });
  };

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
      style: {
        padding: '9px 24px',
      },
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
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 120,
    },
    {
      title: 'Start Date',
      dataIndex: 'activationDate',
      key: 'activationDate',
      width: 130,
      render: (_, record) => handelDate(record.activationDate),
    },
    {
      title: 'End Date',
      dataIndex: 'expiryDate',
      width: 125,
      key: 'expiryDate',
      render: (_, record) => handelDate(record.expiryDate),
    },
    {
      title: 'Client Signatory',
      dataIndex: 'clientAuthorizerName',
      key: 'clientAuthorizerName',
      width: 170,
    },
    {
      title: 'Payment Type',
      dataIndex: 'paymentType',
      key: 'paymentType',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'cStatus',
      key: 'cStatus',
      width: 100,
      render: (_, { cStatus }) => handlestatus(cStatus),
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
      width: 140,
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
            width={680}
          >
            <SowPopup
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
              onClick={() => navigate(`/contract/sow/${record?.contractId}`)}
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
                onClick={() => handleApproval(record.contractId)}
                loading={loadingApproval === record.contractId}
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
  }, [isModalOpen, contractFilters, filterFields]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await contracts.contractsAllData(
        filterFields.page,
        'sow',
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

  return (
    <>
      <Flex justify="space-between" style={{ marginBottom: '30px' }}>
        <h2>Statement of Work (SOW)</h2>
        {GetRole() !== 'finance' && (
          <Button onClick={() => showModal(null)} type="primary">
            Add SOW
          </Button>
        )}
        <Modal
          title={getTitle()}
          open={isModalOpen && !selectedKey}
          onCancel={handlePopupCancel}
          footer={null}
          width={650}
        >
          <SowPopup
            hide={setIsModalOpen}
            buttonText={'Save as Draft'}
            SaveisModalOpen={isModalOpen}
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

export default Sow;
