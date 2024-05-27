import React, { useEffect, useState } from 'react';
import { contracts } from '../api';
import { Button, Modal, notification, Tooltip, Flex, Spin } from 'antd';
import {
  EditOutlined,
  FileDoneOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import ContractDetail from './ContractDetail';
import RejectionPopup from './RejectionPopup';
import { convertDate, extractContract } from './usefulFunctions';
import SowPopup from '../projectPages/SowPopup';
import PoPopup from '../projectPages/PoPopup';
import CrPopup from '../projectPages/CrPopup';
import { useNavigate } from 'react-router-dom';
import GetRole from '../../GetRole.utils';
import decodedToken from '../../DecodedToken.utils';

const SowDetail = ({ id }) => {
  const navigate = useNavigate();
  const [sowContractDetailArr, setSowContractDeatilArr] = useState([]);
  const [contractStatus, setContractStatus] = useState();
  const [activationDate, setActivationDate] = useState();
  const [showBtn, setShowBtn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isRejectionModelOpen, setIsRejectionModelOpen] = useState(false);
  const [rejectionKey, setRejectionKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sowNo, setSowNo] = useState('N/A');
  const [clientId, setClientId] = useState();
  const [apiHit, setApiHit] = useState(false);

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
      style: {
        padding: '9px 24px',
      },
    });
  };

  const showRejectionModel = (key) => {
    setRejectionKey(key);
    setIsRejectionModelOpen(true);
  };

  const handleRejectionPopupCanacel = () => {
    setRejectionKey(null);
    setIsRejectionModelOpen(false);
  };

  const showModal = (key) => {
    setSelectedKey(key);
    setIsModalOpen(true);
    setApiHit(!apiHit);
  };

  const handlePopupCancel = () => {
    setSelectedKey(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    setLoading(true);
    try {
      contracts
        .getContractsData(id)
        .then((res) => {
          const data = res.data[0].contractData;
          setClientId(data?.client?.clientId);
          setSowNo(data?.sowNumber);
          setContractStatus(data.cStatus);
          setActivationDate(data.activationDate);

          const arr = [
            {
              label: 'Client Name :',
              labelValue: data.client.legalEntityName,
              key: 'client',
              redirection: true,
              redirectionURL: `/clients/${data.client.clientId}`,
            },
            {
              label: 'Contract Type :',
              labelValue: extractContract(data.contractType),
              key: 'contractType',
            },
            {
              label: 'Start Date :',
              labelValue: data.activationDate,
              key: 'activationDate',
            },
            {
              label: 'End Date :',
              labelValue: data.expiryDate,
              key: 'expiryDate',
            },
            {
              label: 'Project Name :',
              labelValue: data.project.projectName,
              key: 'project',
              redirection: true,
              redirectionURL: `/projects/${data.project.projectId}`,
            },
            {
              label: 'Spanidea Signatory :',
              labelValue: data.spanideaAuthorizerEmpName.empName,
              key: 'spanideaAuthorizerEmpName',
            },
            {
              label: 'Client Signatory -',
              labelValue: data.clientAuthorizer,
              type: 'singleTable',
              key: 'clientAuthorizer',
            },
            {
              label: 'Client Point Of Contact -',
              labelValue:
                data.pocDetail.flag == null
                  ? {
                      name: data.pocDetail.name,
                      email: data.pocDetail.email,
                      number: data.pocDetail.number,
                    }
                  : '',
              type: 'singleTable',
              key: 'pocDetail',
            },
            {
              label: 'Leaves Term :',
              labelValue: data.leavesTerm,
              key: 'leavesTerm',
            },
            {
              label: 'Leaves Allowed :',
              labelValue: data.leavesAllowed,
              key: 'leavesAllowed',
            },
            {
              label: 'Payment Term :',
              labelValue: `Net ${data.paymentTerm} Days`,
              key: 'paymentTerm',
            },
            {
              label: 'Payment Type:',
              labelValue: data.paymentType,
              key: 'paymentType',
            },
            {
              label: 'Last Upated On :',
              labelValue: data.updatedAt,
              key: 'updatedAt',
            },
            {
              label: 'Status :',
              labelValue: data.cStatus,
              key: 'cStatus',
            },
          ];

          if (data.paymentType === 'Milestones') {
            const obj = {
              label: '',
              labelValue: data.milestone,
              type: 'table',
              columns: [
                {
                  title: 'Milestone No.',
                  dataIndex: 'index',
                  key: 'index',
                  width: '13%',
                  render: (_, __, index) => `${index + 1}.`,
                },
                {
                  title: 'Deliverable Name',
                  dataIndex: 'milestoneName',
                  key: 'milestoneName',
                  width: '29%',
                },
                {
                  title: 'Payment %',
                  dataIndex: 'milestonePercentage',
                  key: 'milestonePercentage',
                  width: '29%',
                  render: (_, record) => `${record.milestonePercentage}%`,
                },
                {
                  title: 'Invoice Date',
                  dataIndex: 'milestoneDate',
                  key: 'milestoneDate',
                  width: '29%',
                },
              ],
              key: 'milestone',
            };
            arr.splice(12, 0, obj);
          } else {
            const obj = {
              label: 'Invoice Tenure:',
              labelValue: data.invoiceTenure,
              key: 'invoiceTenure',
            };
            arr.splice(12, 0, obj);
          }

          setSowContractDeatilArr(arr);
          setLoading(false);
          console.log(arr);
        })
        .catch((error) => console.error('Error fetching data:', error));
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [isModalOpen, showBtn]);

  const handleApproval = (status, succcessfulMessage) => {
    const postData = {
      cStatusId: status,
      activationDate: convertDate(activationDate),
      createdBy: decodedToken.employeeNo,
    };
    contracts
      .updateContractsData(id, postData)
      .then((res) => {
        openNotificationWithIcon('success', succcessfulMessage);
        setShowBtn((prevshowBtn) => !prevshowBtn);
      })
      .catch((err) => {
        console.log(err);
        openNotificationWithIcon('error', err.response.data.message);
      });
  };

  const approvalButtons = () => {
    switch (contractStatus) {
      case 'draft':
        return (
          <>
            {GetRole() !== 'finance' && (
              <Tooltip title="Send For Approval" key={'Send For Approval'}>
                <Button
                  type="link"
                  icon={<FileDoneOutlined />}
                  style={{
                    // backgroundColor: '#52c41a',
                    color: '#52c41a',
                  }}
                  onClick={() =>
                    handleApproval(2, 'Contract sent for Approval')
                  }
                ></Button>
              </Tooltip>
            )}
          </>
        );

      case 'pendingapproval':
        return (
          <>
            {GetRole() !== 'bdTeam' && (
              <>
                <Tooltip title="Approve" key={'Approve'}>
                  <Button
                    onClick={() => showRejectionModel('approve')}
                    type="link"
                    icon={<FileDoneOutlined />}
                    style={{
                      // backgroundColor: '#13c2c2',
                      color: '#13c2c2',
                    }}
                  >
                    {/* Approve */}
                  </Button>
                </Tooltip>{' '}
                <Modal
                  title={'Add Comment'}
                  visible={isRejectionModelOpen && rejectionKey === 'approve'}
                  onCancel={handleRejectionPopupCanacel}
                  footer={null}
                >
                  <RejectionPopup
                    type={'Approve'}
                    id={id}
                    activationDate={activationDate}
                  />
                </Modal>
                <Tooltip title="Reject" key={'Reject'}>
                  <Button
                    onClick={() => showRejectionModel('reject')}
                    type="link"
                    icon={<FileExcelOutlined />}
                    style={{
                      // backgroundColor: '#f5222d',
                      color: '#f5222d',
                    }}
                  >
                    {/* Reject */}
                  </Button>
                </Tooltip>{' '}
                <Modal
                  title={'Add Comment'}
                  visible={isRejectionModelOpen && rejectionKey === 'reject'}
                  onCancel={handleRejectionPopupCanacel}
                  footer={null}
                >
                  <RejectionPopup
                    type={'Reject'}
                    id={id}
                    activationDate={activationDate}
                  />
                </Modal>
              </>
            )}
          </>
        );

      default:
        return <></>;
    }
  };

  return (
    <>
      {loading ? (
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
        <ContractDetail
          contractData={sowContractDetailArr}
          title={
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/clients/${clientId}`)}
            >
              SOW Number: {sowNo ? sowNo : 'N/A'}
            </span>
          }
          popUpComponent={
            <Flex gap={5}>
              {(contractStatus === 'draft' ||
                contractStatus === 'pendingapproval' ||
                contractStatus === 'inactive') &&
                GetRole() !== 'finance' && (
                  <>
                    <Tooltip title="Edit" key={'Edit'}>
                      <Button
                        onClick={() => showModal(id)}
                        type="link"
                        icon={<EditOutlined />}
                        style={{ color: '#1677ff' }}
                      >
                        {/* EDIT */}
                      </Button>
                    </Tooltip>
                    <Modal
                      visible={isModalOpen && selectedKey === id}
                      onCancel={handlePopupCancel}
                      footer={null}
                      width={650}
                    >
                      <SowPopup
                        hide={setIsModalOpen}
                        buttonText={'Update'}
                        clientId={id}
                        apiHit={apiHit}
                      />
                    </Modal>
                  </>
                )}
              {GetRole() !== 'finance' && (
                <Tooltip title="Add PO" key={'Add PO'}>
                  <Button
                    onClick={() => showRejectionModel('PO')}
                    type="link"
                    icon={<FilePptOutlined />}
                    style={{
                      // backgroundColor: '#f5222d',
                      color: '#fa8c16',
                    }}
                  >
                    {/* Reject */}
                  </Button>
                </Tooltip>
              )}
              <Modal
                title={'Purchase order (PO)'}
                visible={isRejectionModelOpen && rejectionKey === 'PO'}
                onCancel={handleRejectionPopupCanacel}
                footer={null}
              >
                <PoPopup hide={setIsRejectionModelOpen} buttonText={'Save'} />
              </Modal>
              {GetRole() !== 'finance' && (
              <Tooltip title="Add CR" key={'Add CR'}>
                <Button
                  onClick={() => showRejectionModel('CR')}
                  type="link"
                  icon={<FileTextOutlined />}
                  style={{
                    // backgroundColor: '#f5222d',
                    color: '#eb2f96',
                  }}
                >
                  {/* Reject */}
                </Button>
              </Tooltip>
              )}
              <Modal
                title={'Change Request (CR)'}
                visible={isRejectionModelOpen && rejectionKey === 'CR'}
                onCancel={handleRejectionPopupCanacel}
                footer={null}
              >
                <CrPopup hide={setIsRejectionModelOpen} buttonText={'Save'} />
              </Modal>
              {approvalButtons()}
            </Flex>
          }
        />
      )}
    </>
  );
};

export default SowDetail;
