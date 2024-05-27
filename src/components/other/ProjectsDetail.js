import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi } from '../api';
import { Flex, Button, Modal, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import ProjectPopup from '../projectPages/ProjectPopup';
import SowPopup from '../projectPages/SowPopup';
import SelectStatus from './SelectStatus';
import { extractContract, handlestatus } from './usefulFunctions';
import TableComponent from './TableComponent';
import { LinkOutlined } from '@ant-design/icons';
import PoPopup from '../projectPages/PoPopup';
import GetRole from '../../GetRole.utils';

const ProjectsDetail = () => {
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState({});
  const [visible, setVisible] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [totalRecords, setTotalRecords] = useState();
  const [pageLoading, setPageLoading] = useState(false);
  const navigate = useNavigate();
  // const [contractStatus, setContractStatus] = useState([3]);
  const [filterFields, setFilterFields] = useState({
    contractStatus: [3],
    page: 1,
    filterField: '',
    sorting: { field: '', order: '' },
    filterValue: '',
  });
  const { id } = useParams();
  const [clearForm, setClearForm] = useState(false);
  const [apiHit, setApiHit] = useState(false);

  const showSowModal = (popup) => {
    setVisible(popup);
    setIsModalOpen(true);
    setClearForm(!clearForm);
  };

  const handlePopupCancel = () => {
    setVisible(null);
    setIsModalOpen(false);
  };

  const handleContractStatus = (values) => {
    setFilterFields((prev) => ({
      ...prev,
      contractStatus: values,
    }));
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

  const columns = [
    {
      title: 'Contract Type',
      dataIndex: 'contractName',
      key: 'contractName',
      width: '10%',
      render: (_, { contractName }) => {
        return extractContract(contractName);
      },
    },
    {
      title: 'Start Date',
      dataIndex: 'activationDate',
      key: 'activationDate',
      width: '10%',
    },
    {
      title: 'End Date',
      dataIndex: 'expiryDate',
      width: '10%',
      key: 'expiryDate',
    },
    {
      title: 'Status',
      dataIndex: 'cStatus',
      key: 'cStatus',
      width: '10%',
      render: (_, { cStatus }) => {
        return handlestatus(cStatus);
      },
    },
    {
      title: 'SOW Number',
      dataIndex: 'sowNumber',
      key: 'sowNumber',
      width: '12%',
      render: (_, { sowNumber }) => (sowNumber ? sowNumber : '-'),
    },
    {
      title: 'CR Number',
      dataIndex: 'crNumber',
      key: 'crNumber',
      width: '12%',
      render: (_, { crNumber }) => (crNumber ? crNumber : '-'),
    },
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: '12%',
      render: (_, { poNumber }) => (poNumber ? poNumber : '-'),
    },
  ];

  useEffect(() => {
    fetchData();
  }, [filterFields, isModalOpen]);

  const fetchData = async () => {
    setLoading(true);
    setPageLoading(true);
    try {
      const response = await projectApi.getProjectData(
        id,
        filterFields.page,
        filterFields.contractStatus,
        filterFields.sorting.field,
        filterFields.sorting.order,
        filterFields.filterField,
        filterFields.filterValue
      );
      const data = response.data;
      setTotalRecords(data.totalCount);
      setContracts(data.contracts);
      const obj = {
        projectId: data.data[0].projectId,
        projectName: data.data[0].projectName,
        projectDescription: data.data[0].projectDescription,
        legalEntityName: data.data[0].client.legalEntityName,
        clientId: data?.data[0]?.client?.clientId,
        updated_at: data.data[0].updatedAt,
      };
      setProjectData(obj);
      setLoading(false);
      setPageLoading(false);
    } catch (error) {
      console.log('Error fetching data:', error);
      setLoading(false);
      setPageLoading(false);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    const container = document.querySelector('.description-container');
    if (container) {
      const lineHeight = parseFloat(
        window.getComputedStyle(container).lineHeight
      );
      const maxLines = 2;
      const maxHeight = lineHeight * maxLines;
      if (container.scrollHeight > maxHeight) {
        container.style.overflowY = 'scroll';
      }
    }
  }, []);

  return (
    <>
      {' '}
      {false ? (
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
        <Flex vertical gap={16}>
          <Flex vertical className="clientDetailTile" gap={10}>
            <Flex justify="space-between" align="center">
              <h3 style={{ margin: '10px 0' }}>Project Details</h3>
              <Flex gap={10}>
                {GetRole() !== 'finance' && (
                  <Button
                    onClick={() => showSowModal(id)}
                    type="primary"
                    icon={<EditOutlined />}
                  >
                    EDIT
                  </Button>
                )}
                <Modal
                  // title={getTitle()}
                  open={isModalOpen && visible === id}
                  onCancel={handlePopupCancel}
                  footer={null}
                >
                  <ProjectPopup
                    hide={setIsModalOpen}
                    buttonText={'Update'}
                    clientId={id}
                    apiHit={apiHit}
                  />
                </Modal>
                {GetRole() !== 'finance' && (
                  <Button onClick={() => showSowModal('SOW')} type="primary">
                    Add SOW
                  </Button>
                )}
                <Modal
                  title={'Statement of Work (SOW)'}
                  open={isModalOpen && visible === 'SOW'}
                  onCancel={handlePopupCancel}
                  footer={null}
                  width={680}
                >
                  <SowPopup
                    hide={setIsModalOpen}
                    buttonText={'Save as Draft'}
                    SaveisModalOpen={isModalOpen}
                    clearForm={clearForm}
                    legalEntityName={projectData.legalEntityName}
                    legalEntityId={projectData.clientId}
                    projectName={projectData.projectName}
                    projectId={projectData.projectId}
                  />
                </Modal>
                {GetRole() !== 'finance' && (
                  <Button onClick={() => showSowModal('PO')} type="primary">
                    Add PO
                  </Button>
                )}
                <Modal
                  title={'Purchase order (PO)'}
                  open={isModalOpen && visible === 'PO'}
                  onCancel={handlePopupCancel}
                  footer={null}
                >
                  <PoPopup
                    hide={setIsModalOpen}
                    buttonText={'Save as Draft'}
                    SaveisModalOpen={isModalOpen}
                    clearForm={clearForm}
                  />
                </Modal>
              </Flex>
            </Flex>
            <Flex>
              <span className="label">Entity Name : &nbsp;</span>{' '}
              <span
                onClick={() => navigate(`/clients/${projectData.clientId}`)}
                style={{ cursor: 'pointer', color: '#000000' }}
              >
                {projectData.legalEntityName} &nbsp;
              </span>
              <span>
                <a>
                  <LinkOutlined />
                </a>
              </span>
            </Flex>
            <Flex>
              <span className="label">Project Name : &nbsp;</span>{' '}
              <span>{projectData.projectName}</span>
            </Flex>
            <Flex style={{ overflowX: 'auto' }}>
              <span className="label" style={{ width: '11%' }}>
                Project Description : &nbsp;
              </span>{' '}
              <span
                className="description-container popupDiv"
                style={{
                  width: '50%',
                  maxHeight: '4em',
                  overflow: 'auto',
                  // padding: '10px 15px',
                  // marginLeft: '2px',
                  // boxShadow:
                  //   'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
                }}
              >
                {projectData.projectDescription}
              </span>{' '}
            </Flex>
            <Flex>
              <span className="label">Last Updated On : &nbsp;</span>{' '}
              <span>{projectData.updated_at}</span>{' '}
            </Flex>
          </Flex>
          <Flex vertical className="clientDetailTile" gap={10}>
            <Flex justify="space-between">
              <h3 style={{ margin: '10px 0' }}>Contracts</h3>
              <SelectStatus onStatusChange={handleContractStatus} />
            </Flex>
            <TableComponent
              loading={loading}
              data={contracts}
              columns={columns}
              scrollX={1200}
              totalPages={totalRecords}
              onFilters={handleFilters}
            />
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default ProjectsDetail;
