import React, { useState, useEffect } from 'react';
import { Button, Flex, Modal, notification, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined, FileDoneOutlined } from '@ant-design/icons';
import './styles.css';
import TableComponent from '../other/TableComponent';
import CrPopup from './CrPopup';
import { contracts } from '../api';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  handelDate,
  handlestatus,
  highlightSearchText,
} from '../other/usefulFunctions';
import Filter from '../other/Filter';
import GetRole from '../../GetRole.utils';
import decodedToken from '../../DecodedToken.utils';

const Cr = () => {
  const location = useLocation();
  const { state } = location;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(null);
  const [totalRecordCount, setTotalRecordCount] = useState();
  const [contractsData, setContractsData] = useState([]);
  const [contractFilters, setContractFilters] = useState({
    status: [1,2,3],
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

  const getTitle = () => {
    return selectedKey ? selectedKey : 'Change Request (CR)';
  };
  const columns = [
    {
      title: 'Engagements/Projects Name',
      dataIndex: 'projectName',
      key: 'projectName',
      width: '13%',
    },
    {
      title: 'SOW Number',
      dataIndex: 'sowNumber',
      key: 'sow',
      width: '10%',
    },
    {
      title: 'CR Number',
      dataIndex: 'crNumber',
      key: 'cr',
      width: '10%',
    },
    {
      title: 'Extended No. of Days',
      dataIndex: 'crExtendedNoOfDays',
      key: 'crExtendedNoOfDays',
      width: '10%',
      render: (text) => {
        if (text <= 1) {
          return `${text} day`;
        } else {
          return `${text} days`;
        }
      },
    },
    {
      title: 'Status',
      dataIndex: 'cStatus',
      key: 'cStatus',
      width: '8%',
      render: (_, record) => handlestatus(record.cStatus),
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
            <CrPopup
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
              onClick={() => navigate(`/contract/cr/${record.contractId}`)}
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
  }, [isModalOpen, contractFilters, filterFields, showBtn]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await contracts.contractsAllData(
        filterFields.page,
        'cr',
        contractFilters.status,
        filterFields.sorting.field,
        filterFields.sorting.order,
        filterFields.filterField,
        filterFields.filterValue,
        contractFilters.expiredDays
      );
      setContractsData(response.data.data);
      setTotalRecordCount(response.data.totalContractCount);
      console.log("fgfgfg", contractsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Flex justify="space-between" style={{ marginBottom: '30px' }}>
        <h2>Change Request (CR)</h2>
        {GetRole() !== 'finance' && (
          <Button onClick={() => showModal(null)} type="primary">
            Add CR
          </Button>
        )}
        <Modal
          title={getTitle()}
          visible={isModalOpen && !selectedKey}
          onCancel={handlePopupCancel}
          footer={null}
        >
          <CrPopup
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

export default Cr;
