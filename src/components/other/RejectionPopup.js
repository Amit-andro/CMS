import React, { useState } from 'react';
import { Button, Flex, Input, notification } from 'antd';
import { FileExcelOutlined, FileDoneOutlined } from '@ant-design/icons';
import { contracts } from '../api';
import { useNavigate } from 'react-router';
import decodedToken from '../../DecodedToken.utils';
import { convertDate } from './usefulFunctions';
const { TextArea } = Input;

const RejectionPopup = ({ id, activationDate, type }) => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [commentValue, setCommentValue] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
      style: {
        padding: '9px 24px',
      },
    });
  };

  const handleApproval = (status, succcessfulMessage) => {
    const postData = {
      comment: commentValue,
      contractId: id,
      cStatusId: status,
      activationDate: convertDate(activationDate),
      createdBy: decodedToken.employeeNo, 
    };
    setLoading(true);
    contracts
      .updateContractsData(id, postData)
      .then((res) => {
        openNotificationWithIcon('success', succcessfulMessage);
        setLoading(false);
        navigate('/pendingApprovals');
      })
      .catch((err) => {
        console.log(err);
        openNotificationWithIcon('error', err.response.data.message);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setCommentValue(value);
    setIsButtonDisabled(value.trim() === '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isButtonDisabled) {
      const message =
        type === 'Reject' ? 'Contract is Rejected' : 'Contract is Approved';
      const status = type === 'Reject' ? 1 : 5;
      handleApproval(status, message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex
        align="end"
        style={{
          marginRight: '19px',
          backgroundColor: '#F0F8FF',
          padding: '12px',
          borderRadius: '7px',
        }}
        gap={10}
      >
        <TextArea
          value={commentValue}
          onChange={handleChange}
          className="commentInput"
          variant="borderless"
          placeholder="Write a comment..."
          style={{
            height: 120,
            resize: 'none',
            background: '#FEFEFE',
          }}
        />
        <Button
          loading={loading}
          type="primary"
          htmlType="submit"
          icon={
            type === 'Reject' ? <FileExcelOutlined /> : <FileDoneOutlined />
          }
          style={{
            backgroundColor: isButtonDisabled
              ? '#f0f0f0'
              : type === 'Reject'
              ? '#f5222d'
              : '#13c2c2',
            color: isButtonDisabled ? 'grey' : 'white',
            marginLeft: '4px',
          }}
          disabled={isButtonDisabled}
        >
          {type}
        </Button>
      </Flex>
    </form>
  );
};

export default RejectionPopup;
