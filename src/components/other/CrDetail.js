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
import RejectionPopup from './RejectionPopup';
import CrPopup from '../projectPages/CrPopup';
import GetRole from '../../GetRole.utils';
import decodedToken from '../../DecodedToken.utils';

const CrDetail = ({ id }) => {
  const [crDeatilArr, setCrDetailArr] = useState([]);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [contractStatus, setContractStatus] = useState();
  const [showBtn, setShowBtn] = useState(false);
  const [activationDate, setActivationDate] = useState();

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
        openNotificationWithIcon('error', 'Error in Sending Approval');
      });
  };

  useEffect(() => {
    setLoading(true);
    try {
      contracts
        .getContractsData(id)
        .then((res) => {
          const data = res.data[0].contractData;
          setTitle(data?.crNumber);
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
              label: 'Project Name :',
              labelValue: data.project.projectName,
              key: 'projectName',
              redirection: true,
              redirectionURL: `/projects/${data.project.projectId}`,
            },
            {
              label: 'SOW Number :',
              labelValue: data.sowNumber,
              key: 'sowNumber',
              // redirection: true,
              // redirectionURL: `/contract/sow/${data?.contractId}`,
            },
            {
              label: 'CR Extended No. Of Days :',
              labelValue: `${data.crExtendedNoOfDays} days`,
              key: 'crExtendedNoOfDays',
            },
            {
              label: 'Last Updated On :',
              labelValue: data.updatedAt,
              key: 'updatedAt',
            },
            {
              label: 'Total Amount :',
              labelValue: data.totalAmount,
              key: 'totalAmount',
            },
            {
              label: 'Status :',
              labelValue: data.cStatus,
              key: 'cStatus',
            },
          ];

          setCrDetailArr(arr);
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
          contractData={crDeatilArr}
          title={`CR Number : ${title ? title : 'N/A'}`}
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
                <CrPopup
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

export default CrDetail;
