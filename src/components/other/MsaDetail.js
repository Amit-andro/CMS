import React, { useEffect, useState } from 'react';
import { Button, Flex, Modal, notification, Spin } from 'antd';
import {
  EditOutlined,
  FileDoneOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { contracts } from '../api';
import ContractDetail from './ContractDetail';
import MsaPopup from '../clientPages/MsaPopup';
import { handelDate, extractContract } from './usefulFunctions';
import RejectionPopup from './RejectionPopup';
import GetRole from '../../GetRole.utils';
import decodedToken from '../../DecodedToken.utils';

const MsaDetail = ({ id }) => {
  const [msaTitle, setMsaTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [contractStatus, setContractStatus] = useState();
  const [showBtn, setShowBtn] = useState(false);
  const [activationDate, setActivationDate] = useState();
  const [isRejectionModelOpen, setIsRejectionModelOpen] = useState(false);
  const [rejectionKey, setRejectionKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const [apiHit, setApiHit] = useState(false);

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

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
      style: {
        padding: '9px 24px',
      },
    });
  };

  const handlePopupCancel = () => {
    setSelectedKey(null);
    setIsModalOpen(false);
  };

  let msaContractDetailArr = [
    {
      label: 'Contract Type :',
      labelValue: '',
      key: 'contractType',
    },
    {
      label: 'MSA File :',
      labelValue: '',
      labelUrl: '',
      key: 'fileName',
    },
    {
      label: 'Start Date :',
      labelValue: '',
      key: 'activationDate',
    },
    {
      label: 'End Date :',
      labelValue: '',
      key: 'expiryDate',
    },
    {
      label: 'Client Authorizer :',
      labelValue: '',
      key: 'clientAuthorizerName',
    },
    {
      label: 'Spanidea Authorizer :',
      labelValue: '',
      key: 'spanideaAuthorizerEmpName',
    },
    {
      label: 'Last Updated On :',
      labelValue: '',
      key: 'updatedAt',
    },
    {
      label: 'Status :',
      labelValue: '',
      key: 'cStatus',
    },
  ];

  const [msaData, setMsaData] = useState(msaContractDetailArr);

  useEffect(() => {
    setLoading(true);
    try {
      contracts
        .getContractsData(id)
        .then((res) => {
          const data = res.data[0];
          setMsaTitle({
            clientData: data?.contractData?.client,
            redirection: true,
          });
          setContractStatus(data.contractData.cStatus);
          setActivationDate(data.contractData.activationDate);

          const updatedMsaData = [...msaData];
          for (let i = 0; i < updatedMsaData.length; i++) {
            if (data.contractData.hasOwnProperty(updatedMsaData[i].key)) {
              if (updatedMsaData[i].hasOwnProperty('labelUrl')) {
                updatedMsaData[i].labelValue =
                  data.contractData[updatedMsaData[i].key];
                updatedMsaData[i].labelUrl = data.contractData.fileUrl;
              } else if (
                updatedMsaData[i].key === 'spanideaAuthorizerEmpName'
              ) {
                updatedMsaData[i].labelValue =
                  data.contractData.spanideaAuthorizerEmpName.empName;
              } else if (
                updatedMsaData[i].key === 'activationDate' ||
                updatedMsaData[i].key === 'expiryDate' ||
                updatedMsaData[i].key === 'updatedAt'
              ) {
                updatedMsaData[i].labelValue = handelDate(
                  data.contractData[updatedMsaData[i].key]
                );
              } else if (updatedMsaData[i].key === 'contractType') {
                updatedMsaData[i].labelValue = extractContract(
                  data.contractData[updatedMsaData[i].key]
                );
              } else {
                updatedMsaData[i].labelValue =
                  data.contractData[updatedMsaData[i].key];
              }
            }
          }
          

          setMsaData(updatedMsaData);
          setLoading(false);
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
      activationDate: activationDate,
      createdBy: decodedToken.employeeNo, 
    };
    setLoadings(true)
    contracts
      .updateContractsData(id, postData)
      .then((res) => {
        openNotificationWithIcon('success', succcessfulMessage);
        setShowBtn((prevshowBtn) => !prevshowBtn);
        setLoadings(false);
      })
      .catch((err) => {
        console.log(err);
        openNotificationWithIcon('error', err.response.data.message);
        setLoadings(false);
      });
  };

  const approvalButtons = () => {
    switch (contractStatus) {
      case 'draft':
        return (
          <>
            {GetRole() !== 'finance' && (
              <Button
                type="primary"
                icon={<FileDoneOutlined />}
                style={{
                  backgroundColor: '#52c41a',
                  color: '#fff',
                }}
                onClick={() => handleApproval(2, 'Contract sent for Approval')}
                loading={loadings}
              >
                Send for Approval
              </Button>
            )}
          </>
        );

      case 'pendingapproval':
        return (
          <>
            {GetRole() !== 'bdTeam' && (
              <>
                <Button
                  onClick={() => showRejectionModel('approve')}
                  type="primary"
                  icon={<FileDoneOutlined />}
                  style={{
                    backgroundColor: '#13c2c2',
                    color: '#fff',
                  }}
                >
                  Approve
                </Button>{' '}
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
                <Button
                  onClick={() => showRejectionModel('reject')}
                  type="primary"
                  icon={<FileExcelOutlined />}
                  style={{
                    backgroundColor: '#f5222d',
                    color: '#fff',
                  }}
                >
                  Reject
                </Button>{' '}
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
          contractData={msaData}
          title={msaTitle}
          popUpComponent={
            <Flex gap={5}>
              {(contractStatus === 'draft' ||
                contractStatus === 'pendingapproval' ||
                contractStatus === 'inactive') &&
                GetRole() !== 'finance' && (
                  <Button
                    onClick={() => showModal(id)}
                    type="primary"
                    icon={<EditOutlined />}
                  >
                    EDIT
                  </Button>
                )}

              <Modal
                visible={isModalOpen && selectedKey === id}
                onCancel={handlePopupCancel}
                footer={null}
              >
                <MsaPopup
                  hide={setIsModalOpen}
                  buttonText={'Update'}
                  clientId={id}
                  apiHit={apiHit}
                />
              </Modal>

              {approvalButtons()}
            </Flex>
          }
        />
      )}
    </>
  );
};

export default MsaDetail;
