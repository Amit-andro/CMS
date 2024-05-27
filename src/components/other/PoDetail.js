import React, { useEffect, useState } from 'react';
import { Button, Modal, notification, Flex, Spin } from 'antd';
import {
  EditOutlined,
  FileDoneOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { contracts } from '../api';
import { extractContract } from './usefulFunctions';
import ContractDetail from './ContractDetail';
import PoPopup from '../projectPages/PoPopup';
import RejectionPopup from './RejectionPopup';
import GetRole from '../../GetRole.utils';
import decodedToken from '../../DecodedToken.utils';

const PoDetail = ({ id }) => {
  const [poData, setPoData] = useState([]);
  const [title, setTitle] = useState('');
  const [showBtn, setShowBtn] = useState(false);
  const [contractStatus, setContractStatus] = useState();
  const [activationDate, setActivationDate] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isRejectionModelOpen, setIsRejectionModelOpen] = useState(false);
  const [rejectionKey, setRejectionKey] = useState(null);
  const [loading, setLoading] = useState(false);
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
          setTitle(data?.poNumber);
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
              label: 'SOW Number :',
              labelValue: data?.sowNumber,
              key: 'sowNumber',
            },
            {
              label: 'Project Name :',
              labelValue: data.project.projectName,
              key: 'project',
              redirection: true,
              redirectionURL: `/projects/${data.project.projectId}`,
            },
            {
              label: 'Shipping Address :',
              labelValue: data.shipTo,
              key: 'shipTo',
            },
            {
              label: 'Billing Address :',
              labelValue: data.billTo,
              key: 'billTo',
            },
            {
              label: 'Total Amount :',
              labelValue: data.totalAmount,
              key: 'totalAmount',
            },
            {
              label: 'PO File :',
              labelValue: data.fileName,
              labelUrl: data?.fileUrl,
              key: 'fileName',
            },
            {
              label: 'Start Date :',
              labelValue: data.activationDate ? data.activationDate : '-',
              key: 'activationDate',
            },
            {
              label: 'End Date :',
              labelValue: data.expiryDate ? data.expiryDate : '-',
              key: 'expiryDate',
            },
            {
              label: 'Last Updated On :',
              labelValue: data.updatedAt,
              key: 'updatedAt',
            },
            {
              label: 'Status :',
              labelValue: data.cStatus,
              key: 'cStatus',
            },
          ];
          setPoData(arr);
          setLoading(false);
        })
        .catch((error) => console.error('Error fetching data:', error));
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [showBtn, isModalOpen]);

  const handleApproval = (status, succcessfulMessage) => {
    const postData = {
      cStatusId: status,
      activationDate: activationDate,
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
              <Button
                type="primary"
                icon={<FileDoneOutlined />}
                style={{
                  backgroundColor: '#52c41a',
                }}
                onClick={() => handleApproval(2, 'Contract sent for Approval')}
              >
                Send For Approval
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
                  }}
                >
                  Approve
                </Button>
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
                  }}
                >
                  Reject
                </Button>
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
          contractData={poData}
          title={`PO Number : ${title ? title : 'N/A'}`}
          popUpComponent={
            <Flex gap={5}>
              {(contractStatus === 'draft' ||
                contractStatus === 'pendingapproval' ||
                contractStatus === 'inactive') &&
                GetRole() !== 'finance' && (
                <>
                  <Button
                    onClick={() => showModal(id)}
                    type="primary"
                    icon={<EditOutlined />}
                  >
                    EDIT
                  </Button>
                  <Modal
                    visible={isModalOpen && selectedKey === id}
                    onCancel={handlePopupCancel}
                    footer={null}
                  >
                    <PoPopup
                      hide={setIsModalOpen}
                      buttonText={'Update'}
                      clientId={id}
                      apiHit={apiHit}
                    />
                  </Modal>
                </>
              )}
              {approvalButtons()}
            </Flex>
          }
        />
      )}
    </>
  );
};

export default PoDetail;
