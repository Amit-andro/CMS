import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flex, Button, Tooltip, Modal, Table, Spin } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { clientsApi } from '../api';
import TableComponent from '../other/TableComponent';
import {
  handelDate,
  handlestatus,
  extractContract,
} from './../other/usefulFunctions';
import SelectStatus from '../other/SelectStatus';
import './styles.css';
import PocPopup from './PocPopup';

const columnsPoc = [
  {
    title: 'Type',
    dataIndex: 'pocType',
    key: 'pocType',
    width: '20%',
  },
  {
    title: 'Name',
    dataIndex: 'pocName',
    key: 'pocName',
    width: '30%',
  },
  {
    title: 'Email',
    dataIndex: 'pocEmail',
    key: 'pocEmail',
    width: '30%',
  },
  {
    title: 'Contact Number',
    dataIndex: 'pocNumber',
    key: 'pocNumber',
    width: '25%',
  },
];

const columnsGSTIN = [
  {
    title: 'GSTIN',
    dataIndex: 'GSTIN',
    key: 'GSTIN',
    width: '10%',
    render: (_, record) => (
      record?.GSTIN ? record?.GSTIN : "-"
    ),
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    width: '35%',
  },
  {
    title: 'City',
    dataIndex: 'city',
    key: 'city',
    width: '15%',
  },
  {
    title: 'State',
    dataIndex: 'state',
    key: 'state',
    width: '15%',
  },
  {
    title: 'Country',
    dataIndex: 'country',
    key: 'country',
    width: '15%',
  },
];

const ClientDetail = () => {
  const [contractTableData, setContractTableData] = useState([]);
  const [contractAvailability, setContractAvailability] = useState({
    nda: 'NO',
    msa: 'NO',
  });
  const [clientData, setClientData] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [totalRecordCount, setTotalRecordCount] = useState();
  const [contractStatus, setContractStatus] = useState([3]);
  const [filterFields, setFilterFields] = useState({
    page: 1,
    filterField: '',
    sorting: { field: '', order: '' },
    filterValue: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  // states for other contracts
  const [otherContractsFilters, setOtherContractFilters] = useState({
    page: 1,
    filterField: '',
    sorting: { field: '', order: '' },
    filterValue: '',
  });
  const [otherContractTableData, setOtherContractTableData] = useState([]);
  const [otherContractsLoading, setOtherContractsLoading] = useState(false);
  const [otherContractsTotalCount, setOtherContractsTotalCount] = useState();
  const [otherContractStatus, setOtherContractStatus] = useState([3]);
  const [selectedKey, setSelectedKey] = useState('');

  const navigate = useNavigate();

  const { id } = useParams();
  const clientId = id;

  const showModal = (key) => {
    setIsModalOpen(true);
    setSelectedKey(key);
  };

  const handlePopupCancel = () => {
    setIsModalOpen(false);
    setSelectedKey(null);
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

  const handleOtherContractFilters = (value) => {
    setOtherContractFilters((prevState) => {
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
    setContractStatus(values);
    setContractTableData([]);
  };

  const handleOtherContractStatus = (value) => {
    setOtherContractStatus(value);
    setOtherContractTableData([]);
  };

  useEffect(() => {
    setLoading(true);
    setPageLoading(true);
    try {
      clientsApi
        .getClientData(
          clientId,
          filterFields.page,
          contractStatus,
          filterFields.sorting.field,
          filterFields.sorting.order,
          filterFields.filterField,
          filterFields.filterValue
        )
        .then((res) => {
          const data = res.data;
          const contractData = data.mContracts;
          setTotalRecordCount(data.totalCount);
          const newObj = {
            nda: data.availability[0]?.ndaAvailability || 'NO',
            msa: data.availability[0]?.msaAvailability || 'NO',
          };
          setContractAvailability(newObj);
          setClientData(data.data[0]);

          for (let i = 0; i < contractData?.length; i++) {
            const obj = {
              key: contractData[i].contractId,
              contractName: extractContract(contractData[i]?.contractName),
              fileName: contractData[i].fileName,
              fileUrl: contractData[i].fileUrl,
              activationDate: handelDate(contractData[i].activationDate),
              expiryDate: handelDate(contractData[i].expiryDate),
              cStatus: contractData[i].cStatus,
              contractTypeForUrl: extractContract(
                contractData[i].contractName
              ).toLowerCase(),
            };
            contractTableData.push(obj);
          }
          setContractTableData([...contractTableData]);
          setLoading(false);
          setPageLoading(false);
        })
        .catch((error) => console.error('Error fetching data:', error));
    } catch {
      setLoading(false);
      setPageLoading(false);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [contractStatus, filterFields]);

  useEffect(() => {
    setOtherContractsLoading(true);
    try {
      clientsApi
        .getClientOtherContracts(
          clientId,
          otherContractsFilters.page,
          otherContractStatus,
          otherContractsFilters.sorting.field,
          otherContractsFilters.sorting.order,
          otherContractsFilters.filterField,
          otherContractsFilters.filterValue
        )
        .then((res) => {
          const data = res.data;
          const otherContracts = data.mContracts;
          setOtherContractsTotalCount(data.totalCount);

          for (let i = 0; i < otherContracts.length; i++) {
            const obj = {
              key: otherContracts[i].contractId,
              contractName: extractContract(otherContracts[i].contractName),
              activationDate: handelDate(otherContracts[i].activationDate),
              expiryDate: handelDate(otherContracts[i].expiryDate),
              projectName: otherContracts[i].projectName,
              cStatus: otherContracts[i].cStatus,
              contractTypeForUrl: extractContract(
                otherContracts[i].contractName
              ).toLowerCase(),
            };
            otherContractTableData.push(obj);
          }
          setOtherContractTableData([...otherContractTableData]);
          setOtherContractsLoading(false);
        })
        .catch((error) => console.error('Error fetching data:', error));
    } catch (error) {
      setOtherContractsLoading(false);
    } finally {
      setOtherContractsLoading(false);
    }
  }, [otherContractStatus, otherContractsFilters]);

  const columns = [
    {
      title: 'Contract Type',
      dataIndex: 'contractName',
      key: 'contractName',
      width: '13%',
    },
    {
      title: 'File',
      dataIndex: 'fileUrl',
      key: 'fileUrl',
      width: '25%',
      render: (_, record) => (
        <>
          <a target="_blank" rel="noreferrer" href={record.fileUrl}>
            {record.fileName}
          </a>
        </>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'activationDate',
      key: 'activationDate',
      width: '15%',
    },
    {
      title: 'End Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: '15%',
    },
    {
      title: 'Status',
      dataIndex: 'cStatus',
      key: 'cStatus',
      width: '15%',
      render: (_, { cStatus }) => {
        return handlestatus(cStatus);
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '10%',
      fixed: 'right',
      render: (_, record) => (
        <>
          <Tooltip title="View" key={'View'}>
            <Button
              type="link"
              style={{
                color: '#fa541c',
              }}
              onClick={() =>
                navigate(`/contract/${record.contractTypeForUrl}/${record.key}`)
              }
            >
              <EyeOutlined />
            </Button>
          </Tooltip>
        </>
      ),
    },
  ];

  const columnsOtherContracts = [
    {
      title: 'Contract Type',
      dataIndex: 'contractName',
      key: 'contractName',
      width: '13%',
    },
    {
      title: 'Engagement/Projects',
      dataIndex: 'projectName',
      key: 'projectName',
      width: '25%',
    },
    {
      title: 'Start Date',
      dataIndex: 'activationDate',
      key: 'activationDate',
      width: '15%',
      render: (_, record) => (
        record?.activationDate ? record?.activationDate : "-"
      ),
    },
    {
      title: 'End Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: '15%',
      render: (_, record) => (
        record?.expiryDate ? record?.expiryDate : "-"
      ),
    },
    {
      title: 'Status',
      dataIndex: 'cStatus',
      key: 'cStatus',
      width: '15%',
      render: (_, { cStatus }) => {
        return handlestatus(cStatus);
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '10%',
      fixed: 'right',
      render: (_, record) => (
        <>
          <Tooltip title="View" key={'View'}>
            <Button
              type="link"
              style={{
                color: '#fa541c',
              }}
              onClick={() =>
                navigate(`/contract/${record.contractTypeForUrl}/${record.key}`)
              }
            >
              <EyeOutlined />
            </Button>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <>
      {pageLoading ? (
        <div
          style={{
            height: '540px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spin />
        </div>
      ) : (
        <Flex vertical gap="25px">
          <Flex className="clientDetailTile" style={{ width: '100%' }}>
            <Flex vertical style={{ width: '100%' }} gap={'10px'}>
              <div className="siEntity">
                {clientData?.seId === 0
                  ? 'Spanidea Systems LLC'
                  : 'Spanidea Systems Pvt. Ltd.'}
              </div>
              <div>
                <span className="label">Legal Entity Name :</span>{' '}
                <span>{clientData?.legalEntityName}</span>
              </div>
              <Flex vertical style={{ width: '100%' }} gap={'8px'}>
                {clientData?.seId === 1 ? (
                  <div>
                    <span className="label">Primary Address :</span>{' '}
                    <span>
                      {clientData?.GSTINDetails?.[0]?.address},{' '}
                      {clientData?.GSTINDetails?.[0]?.city},{' '}
                      {clientData?.GSTINDetails?.[0]?.state},{' '}
                      {clientData?.GSTINDetails?.[0]?.country},{' '}
                      {clientData?.GSTINDetails?.[0]?.pinCode}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="label">Address :</span>{' '}
                    <span>
                      {clientData?.address}, {clientData?.city},{' '}
                      {clientData?.state}, {clientData?.country}
                      {clientData?.pinCode}
                    </span>
                  </div>
                )}
                {clientData?.seId === 0 ? (
                  <>
                    <div>
                      <span className="label">Tax Id :</span>{' '}
                      <span>{clientData?.TaxId}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="label">Primary GSTIN :</span>{' '}
                      <span>{clientData?.GSTINDetails?.[0]?.GSTIN ? clientData?.GSTINDetails?.[0]?.GSTIN : 'N/A'}</span>
                      <Button
                        onClick={() => showModal('gst')}
                        type="link"
                        style={{ width: 'fit-content' }}
                      >
                        View All
                      </Button>
                    </div>

                    <Modal
                      title={' '}
                      visible={isModalOpen && selectedKey === 'gst'}
                      onCancel={handlePopupCancel}
                      footer={null}
                      width={800}
                    >
                      <PocPopup
                        columns={columnsGSTIN}
                        clintPoc={clientData?.GSTINDetails}
                      />
                    </Modal>
                    <div>
                      <span className="label">TAN Number :</span>{' '}
                      <span>{clientData?.TANNumber}</span>
                    </div>
                  </>
                )}
              </Flex>
              <div>
                <span className="label">NDA Availability :</span>{' '}
                <span>{handlestatus(contractAvailability?.nda)}</span>
              </div>
              <div>
                <span className="label">MSA Availability :</span>{' '}
                <span>{handlestatus(contractAvailability?.msa)}</span>
              </div>
            </Flex>
            <Flex vertical style={{ width: '100%' }} gap={'15px'}>
              <div style={{ fontWeight: '500', textDecoration: 'underline' }}>
                Point Of Contact(s)
              </div>
              <Flex vertical gap={'10px'} style={{ marginLeft: '15px' }}>
                <Flex>
                  <span className="label">Type :&nbsp;</span>
                  <span>{clientData?.poc?.[0]?.pocType || 'N/A'}</span>
                </Flex>
                <Flex>
                  <span className="label">Name :&nbsp;</span>
                  <span>{clientData?.poc?.[0]?.pocName || 'N/A'}</span>
                </Flex>
                <Flex>
                  <span className="label">Email :&nbsp;</span>
                  <span>{clientData?.poc?.[0]?.pocEmail || 'N/A'}</span>
                </Flex>
                <Flex>
                  <span className="label">Contact No. :&nbsp;</span>
                  <span>{clientData?.poc?.[0]?.pocNumber || 'N/A'}</span>
                </Flex>
              </Flex>

              <Button
                onClick={() => showModal('poc')}
                type="link"
                style={{ width: 'fit-content' }}
              >
                View All
              </Button>
              <Modal
                title={'Point Of Contact(s)'}
                visible={isModalOpen && selectedKey === 'poc'}
                onCancel={handlePopupCancel}
                footer={null}
                width={800}
              >
                <PocPopup columns={columnsPoc} clintPoc={clientData?.poc} />
              </Modal>
            </Flex>
          </Flex>

          <Flex vertical className="clientDetailTile" gap="10px">
            <Flex justify="space-between" align="center">
              <h2 className="contactHeading">Master Contracts</h2>
              <div>
                <SelectStatus onStatusChange={handleContractStatus} />
              </div>
            </Flex>
            <TableComponent
              loading={loading}
              data={contractTableData}
              columns={columns}
              scrollX={1100}
              totalPages={totalRecordCount}
              onFilters={handleFilters}
            />
          </Flex>

          <Flex vertical className="clientDetailTile" gap="10px">
            <Flex justify="space-between" align="center">
              <h2 className="contactHeading">Other Contracts</h2>
              <div>
                <SelectStatus onStatusChange={handleOtherContractStatus} />
              </div>
            </Flex>
            <TableComponent
              loading={otherContractsLoading}
              data={otherContractTableData}
              columns={columnsOtherContracts}
              scrollX={1100}
              totalPages={otherContractsTotalCount}
              onFilters={handleOtherContractFilters}
            />
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default ClientDetail;
