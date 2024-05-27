import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Flex,
  Row,
  Col,
  Input,
  Button,
  Avatar,
  notification,
  Table,
  Spin,
} from 'antd';
import { ClockCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { capitalizeWords, handlestatus, } from './usefulFunctions';
import './styles.css';
import { useEffect } from 'react';
import { commentsApi, contracts } from '../api';
import './styles.css';
import decodedToken from '../../DecodedToken.utils';

const { TextArea } = Input;

const ContractDetail = ({ contractData, title, popUpComponent }) => {
  const { id } = useParams();
  const [contractComments, setContractComments] = useState([]);
  const [commentValue, setCommentValue] = useState('');
  const [activity, setActivity] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [addCommentsLoading, setAddCommentsLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const navigate = useNavigate();
  function stringToColor(string) {
    let hash = 0;
    let i;

    for (i = 0; i < string?.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  }

  function avtarString(str) {
    const words = str?.split(' ');
    const capitalizedWords = words?.map((word) => word.charAt(0).toUpperCase());
    const capitalizedString = capitalizedWords?.join('');
    return capitalizedString;
  }

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
      style: {
        padding: '9px 24px',
      },
    });
  };
  useEffect(() => {
    fetchActivity();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await commentsApi.getAllComments(id);
      setContractComments(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      setActivityLoading(true);
      const response = await contracts.getActivityData(id);
      const data = response.data;
      setActivity(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleComment = () => {
    const obj = {
      comment: commentValue,
      contractId: id,
      empCode: decodedToken.employeeNo,  
    };
    
    setAddCommentsLoading(true);
    commentsApi
      .addComments(obj)
      .then((res) => {
        setCommentValue('');
        const newObj = {
          comment: obj.comment,
          name: decodedToken.name,
          contractId: id,
          createdAt: new Date().toString(),
          cStatusId: null,
        };
        setContractComments((prevComment) => [...prevComment, newObj]);
        openNotificationWithIcon('success', 'Comment added successfully.');
        setAddCommentsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        openNotificationWithIcon('error', 'Error in Adding Comment');
        setAddCommentsLoading(false);
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
      handleComment();
    }
  };

  const dateTimeFormatter = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;

    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() < 12 ? 'AM' : 'PM';
    const formattedTime = `${hours}:${minutes}${ampm}`;

    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <Flex style={{ width: '100%' }} justify="space-between" gap={20}>
      <Flex vertical style={{ width: '70%' }} gap={20}>
        <Flex vertical className="clientDetailTile">
          <Flex justify="space-between" align="center">
            <h3
              style={{ cursor: title?.redirection ? 'pointer' : 'default' }}
              onClick={() =>
                title?.redirection &&
                navigate(`/clients/${title?.clientData?.clientId}`)
              }
            >
              {title?.redirection ? title?.clientData?.legalEntityName : title} {title?.redirection && <LinkOutlined style={{color:'#1677ff'}}/>}
            </h3>
            <div>{popUpComponent}</div>
          </Flex>
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            {contractData.map((data, index) => {
              switch (data.type) {
                case 'table':
                  return (
                    <Col className="gutter-row" span={24} key={index}>
                      <Table
                        columns={data.columns}
                        dataSource={data.labelValue}
                        pagination={false} // Disable pagination
                      />
                    </Col>
                  );

                case 'singleTable':
                  return (
                    <Col className="gutter-row" span={12} key={index}>
                      <span className="label" style={{ marginBottom: '10px' }}>
                        {data.label}
                      </span>
                      <Row
                        gutter={[4, 4]}
                        style={{
                          width: '100%',
                          marginTop: '4px',
                          marginLeft: '10px',
                        }}
                      >
                        {Object.entries(data.labelValue).map(([key, value]) => (
                          <Col span={24}>
                            <span className="label">
                              {capitalizeWords(key)} : &nbsp;
                            </span>
                            <span>{value}</span>
                          </Col>
                        ))}
                      </Row>
                    </Col>
                  );

                default:
                  return (
                    <Col className="gutter-row" span={12} key={index}>
                      <div>
                        <span className="label">{data.label} &nbsp;</span>
                        {data.labelUrl ? (
                          <span>
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href={data.labelUrl}
                            >
                              {data.labelValue}
                            </a>
                          </span>
                        ) : data.key === 'cStatus' ? (
                          handlestatus(data.labelValue)
                        ) : (
                          <span
                            style={{
                              cursor: data?.redirection ? 'pointer' : 'default',
                            }}
                            onClick={() =>
                              data?.redirection &&
                              navigate(data?.redirectionURL)
                            }
                          >
                            {data.labelValue} {data?.redirection && <LinkOutlined style={{color: '#1677ff'}}/>}
                          </span>
                        )}
                      </div>
                    </Col>
                  );
              }
            })}
          </Row>
        </Flex>

        <Flex vertical className="clientDetailTile" style={{ height: '100%' }}>
          <h3>Activity</h3>
          {activityLoading ? (
            <Spin />
          ) : (
            <Flex vertical>
              {activity.length > 0 ? (
                activity.map((act, index) => (
                  <Flex gap={16}>
                    <Flex vertical align="center" justify="center">
                      <Flex
                        justify="center"
                        align="center"
                        style={{
                          height: '40px',
                          width: '40px',
                          fontSize: '20px',
                          borderRadius: '50%',
                          color: '#595959',
                          backgroundColor: '#f0f0f0',
                        }}
                      >
                        <ClockCircleOutlined />
                      </Flex>
                      {index === activity.length - 1 ? (
                        <></>
                      ) : (
                        <div
                          style={{
                            height: '75px',
                            width: '5px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '5px',
                          }}
                        ></div>
                      )}
                    </Flex>
                    <Flex vertical style={{ marginTop: '10px' }}>
                      <span
                        style={{
                          color: '#434343',
                          fontSize: '10px',
                        }}
                      >
                        {dateTimeFormatter(act.createdAt)}
                      </span>
                      <span
                        style={{
                          fontSize: '14px',
                        }}
                      >
                        {act.notes}
                      </span>
                    </Flex>
                  </Flex>
                ))
              ) : (
                <div className="noActivity">No Activity</div>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
      <Flex
        vertical
        gap={'10px'}
        style={{ width: '30%', paddingRight: '3px' }}
        className="clientDetailTile"
        justify="space-between"
      >
        <h3 style={{ margin: 0 }}>Comments</h3>
        {loading ? (
          <div
            style={{
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin />
          </div>
        ) : (
          <Flex vertical gap={'15px'} className="commentsDiv">
            {contractComments.length > 0 ? (
              contractComments.map((contractComment, i) => (
                <Flex
                  vertical
                  gap={'10px'}
                  style={{
                    border:
                      contractComment.cStatusId === null
                        ? '1px solid #91caff'
                        : contractComment.cStatusId === 1
                        ? '1px solid #ffa39e'
                        : '1px solid #b7eb8f',
                    borderRadius: '5px',
                    padding: '10px 20px',
                    backgroundColor:
                      contractComment.cStatusId === null
                        ? '#fff'
                        : contractComment.cStatusId === 1
                        ? '#fff1f0'
                        : '#f6ffed',
                  }}
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    style={{ fontSize: '10px' }}
                  >
                    <Flex
                      align="center"
                      gap={'5px'}
                      style={{ fontSize: '12px', fontWeight: '500' }}
                    >
                      <Avatar
                        style={{
                          backgroundColor: stringToColor(contractComment.name),
                        }}
                      >
                        {avtarString(contractComment.name)}
                      </Avatar>
                      <span>{contractComment.name}</span>
                    </Flex>
                    <span>{dateTimeFormatter(contractComment.createdAt)}</span>
                  </Flex>
                  <div className="commentText">{contractComment.comment}</div>
                </Flex>
              ))
            ) : (
              <div className="noCommentText">No Comments</div>
            )}
          </Flex>
        )}
        <form onSubmit={handleSubmit}>
          <Flex
            gap={10}
            align="end"
            style={{
              background: '#fff',
              padding: '7px 15px',
              borderRadius: '8px',
              marginRight: '32px',
            }}
          >
            <TextArea
              className="commentInput"
              value={commentValue}
              onChange={handleChange}
              autoSize={{
                minRows: 1,
                maxRows: 6,
              }}
              required
              variant="borderless"
              placeholder="Write a comment..."
            />
            <Button
              loading={addCommentsLoading}
              type="primary"
              htmlType="submit"
              disabled={isButtonDisabled}
            >
              Send
            </Button>
          </Flex>
        </form>
      </Flex>
    </Flex>
  );
};

export default ContractDetail;
