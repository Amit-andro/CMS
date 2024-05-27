import React, { useEffect, useState } from 'react';
import { Button, Modal, notification, Flex, Spin } from 'antd';
import {
  EditOutlined,
  FileDoneOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { contracts } from '../api';
import ContractDetail from './ContractDetail';
import NdaPopup from '../clientPages/NdaPopup';
import { handelDate, extractContract } from './usefulFunctions';
import RejectionPopup from './RejectionPopup';
import GetRole from '../../GetRole.utils';
import decodedToken from '../../DecodedToken.utils';

const NdaDetail = ({ id }) => {
  const [ndaTitle, setNdaTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [contractStatus, setContractStatus] = useState();
  const [showBtn, setShowBtn] = useState(false);
  const [activationDate, setActivationDate] = useState();
  const [loading, setLoading] = useState(false);
  const [isRejectionModelOpen, setIsRejectionModelOpen] = useState(false);
  const [rejectionKey, setRejectionKey] = useState(null);
  const [apiHit, setApiHit] = useState(false);
  const [loadings, setLoadings] = useState(false);

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

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
      style: {
        padding: '9px 24px',
      },
    });
  };

  let ndaContractDetailArr = [
    {
      label: 'Contract Type :',
      labelValue: '',
      key: 'contractType',
    },
    {
      label: 'NDA File :',
      labelValue: '',
      labelUrl: '',
      key: 'fileName',
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

  const [ndaData, setNdaData] = useState(ndaContractDetailArr);

  useEffect(() => {
    setLoading(true);
    try {
      contracts
        .getContractsData(id)
        .then((res) => {
          const data = res.data[0];

          setNdaTitle({
            clientData: data?.contractData?.client,
            redirection: true,
          });
          setContractStatus(data.contractData.cStatus);
          setActivationDate(data.contractData.activationDate);

          const updatedNdaData = [...ndaData];
          for (let i = 0; i < updatedNdaData.length; i++) {
            if (data.contractData.hasOwnProperty(updatedNdaData[i].key)) {
              if (updatedNdaData[i].hasOwnProperty('labelUrl')) {
                updatedNdaData[i].labelValue =
                  data.contractData[updatedNdaData[i].key];
                updatedNdaData[i].labelUrl = data.contractData.fileUrl;
              } else if (updatedNdaData[i].key === 'updatedAt') {
                updatedNdaData[i].labelValue = handelDate(
                  data.contractData[updatedNdaData[i].key]
                );
              } else if (updatedNdaData[i].key === 'contractType') {
                updatedNdaData[i].labelValue = extractContract(
                  data.contractData[updatedNdaData[i].key]
                );
              } else {
                updatedNdaData[i].labelValue =
                  data.contractData[updatedNdaData[i].key];
              }
            }
          }

          setNdaData(updatedNdaData);
          setLoading(false);
        })
        .catch((error) => console.error('Error fetching data:', error));
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [isModalOpen, showBtn]);

  const handleApproval = (status, succcessfulMessage) => {
    const postData = {
      cStatusId: status,
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

  console.log("activationDate",activationDate);

  const approvalButtons = () => {
    switch (contractStatus) {
      case 'draft':
        return (
          <>
            {GetRole() !== 'finance' && (
              <Button
                type="primary"
                loading ={loadings}
                icon={<FileDoneOutlined />}
                style={{
                  backgroundColor: '#52c41a',
                  color: '#fff',
                }}
                onClick={() => handleApproval(2, 'Contract sent for Approval')}
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
          contractData={ndaData}
          title={ndaTitle}
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
                <NdaPopup
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

export default NdaDetail;
