import React, { useEffect, useState } from 'react';
import './styles.css';
import { Flex, Select, Radio, Statistic, Row, Col, Spin } from 'antd';
import { ContainerOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import CountUp from 'react-countup';
import { dashboardApi } from '../api';
import ChartComponent from '../dashboard/ChartComponent';
import { extractContract } from '../other/usefulFunctions';
import { useNavigate } from 'react-router-dom';

const formatter = (value) => {
  return value > 0 ? <CountUp end={value} separator="," /> : '-';
};
const Dashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState({});
  const [graphData, setGraphData] = useState([]);
  const [graphDataForExpired, setGraphDataForExpired] = useState([]);
  const [expireDays, setExpiryDays] = useState('7');
  const [graphExpiryDays, setGraphExpiryDays] = useState('7');
  const [graphExpiryDaysForExpired, setGraphExpiryDaysForExpired] =
    useState('7');
  const [graphDataLoading, setGraphDataLoading] = useState(false);
  const [graphDataExpiredLoading, setGraphDataExpiredLoading] = useState(false);
  const [expiringContractYaxis, setExpiringContractYaxis] = useState([]);
  const [expiredContractYaxis, setExpiredContractYaxis] = useState([]);
  const navigate = useNavigate();

  const handleChange = (value) => {
    setExpiryDays(value);
  };
  const optionsarr = [
    {
      value: 7,
      label: '7',
    },
    {
      value: 15,
      label: '15',
    },
    {
      value: 30,
      label: '30',
    },
  ];

  const onPeridChange = (e) => {
    setGraphExpiryDays(e.target.value);
  };

  const onPeridChangeForExpired = (e) => {
    setGraphExpiryDaysForExpired(e.target.value);
  };

  function formatDate(isoDateString) {
    const date = new Date(isoDateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  }

  useEffect(() => {
    fetchData();
  }, [expireDays]);

  const fetchGraphData = async () => {
    setGraphDataLoading(true);
    try {
      const response = await dashboardApi.getGraphData(graphExpiryDays);
      const data = response.data;
      const newGraphData = data.graphResp;
      for (let i = 0; i < newGraphData.length; i++) {
        newGraphData[i].date = formatDate(newGraphData[i].date);
        newGraphData[i].contractName = extractContract(
          newGraphData[i].contractName
        );
        newGraphData[i].count = Number(newGraphData[i].count);
      }
      setGraphData(newGraphData);

      const maxCount = Number(data.maxCount.totalCount);

      if(maxCount === 0) {
        setExpiringContractYaxis([2,1,0])
      }

      else if (maxCount < 6) {
        const arr = [];
        for (let i = maxCount + 1; i >= 0; i--) {
          arr.push(i);
        }
        setExpiringContractYaxis(arr);
      } else {
        const arr = [];
        const celiValue = Math.ceil(maxCount / 6);
        const remaning = maxCount % 6;
        for (let i = remaning != 0 ? celiValue*6 : celiValue*6 + 1; i >= 0; i--) {
          arr.push(i);
        }
        // for (let i = maxCount + 1; i >= 0; i--) {
        //   arr.push(i);
        // }
        setExpiringContractYaxis(arr);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setGraphDataLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [graphExpiryDays]);

  const fetchGraphDataForExpired = async () => {
    setGraphDataExpiredLoading(true);
    try {
      const response = await dashboardApi.getGraphDataForExpired(
        graphExpiryDaysForExpired
      );
      const data = response.data;
      const newGraphData = data.graphResp;
      for (let i = 0; i < newGraphData.length; i++) {
        newGraphData[i].date = formatDate(newGraphData[i].date);
        newGraphData[i].contractName = extractContract(
          newGraphData[i].contractName
        );
        newGraphData[i].count = Number(newGraphData[i].count);
      }
  
      setGraphDataForExpired(newGraphData);

      const maxCount = Number(data.maxCount.totalCount);

      if(maxCount === 0){
        setExpiredContractYaxis([2,1,0])
      }
      else if (maxCount < 6) {
        const arr = [];
        for (let i = maxCount + 1; i >= 0; i--) {
          arr.push(i);
        }
        setExpiredContractYaxis(arr);
      } 
      else {
        const arr = [];
        const celiValue = Math.ceil(maxCount / 6);
        const remaning = maxCount % 6;
        for (let i = remaning != 0 ? celiValue*6 : celiValue*6 + 1; i >= 0; i--) {
          arr.push(i);
        }
        // for (let i = maxCount + 1; i >= 0; i--) {
        //   arr.push(i);
        // }
        setExpiredContractYaxis(arr);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setGraphDataExpiredLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphDataForExpired();
  }, [graphExpiryDaysForExpired]);

  const fetchData = async () => {
    try {
      const response = await dashboardApi.getContracts(expireDays);
      const data = response.data;
      setClients(response.data.activeClient);
      const arr = [
        {
          type: 'NDA',
          count: {
            active: data.activeContract['nondisclosureagreement(NDA)']?.active,
            expiring: data.expiredContract['nondisclosureagreement(NDA)'],
            pending:
              data.activeContract['nondisclosureagreement(NDA)']
                ?.pendingapproval,
            inactive:
              data.activeContract['nondisclosureagreement(NDA)']?.inactive,
            draft: data.activeContract['nondisclosureagreement(NDA)']?.draft,
          },
        },
        {
          type: 'MSA',
          count: {
            active: data.activeContract['masterserviceagreement(MSA)']?.active,
            expiring: data.expiredContract['masterserviceagreement(MSA)'],
            pending:
              data.activeContract['masterserviceagreement(MSA)']
                ?.pendingapproval,
            inactive:
              data.activeContract['masterserviceagreement(MSA)']?.inactive,
            draft: data.activeContract['masterserviceagreement(MSA)']?.draft,
          },
        },
        {
          type: 'SOW',
          count: {
            active: data.activeContract['statementofwork(SOW)']?.active,
            expiring: data.expiredContract['statementofwork(SOW)'],
            pending:
              data.activeContract['statementofwork(SOW)']?.pendingapproval,
            inactive: data.activeContract['statementofwork(SOW)']?.inactive,
            draft: data.activeContract['statementofwork(SOW)']?.draft,
          },
        },
        {
          type: 'PO',
          count: {
            active: data.activeContract['purchaseorder(PO)']?.active,
            expiring: data.expiredContract['purchaseorder(PO)'],
            pending: data.activeContract['purchaseorder(PO)']?.pendingapproval,
            inactive: data.activeContract['purchaseorder(PO)']?.inactive,
            draft: data.activeContract['purchaseorder(PO)']?.draft,
          },
        },
      ];

      setContracts(arr);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
    }
  };


  return (
    <>
      <Row gutter={[16, 16]} style={{ height: '100%' }}>
        <Col className="gutter-row" span={24}>
          <Flex vertical gap={16} className="tiles">
            <Flex justify="space-between">
              <span className="tileHeading">Contracts</span>
            </Flex>
            <Flex gap={16}>
              {contracts.map((contract, index) => (
                <>
                  <Flex
                    className="subTiles"
                    style={{
                      width: '100%',
                    }}
                    gap={10}
                    vertical
                    key={index}
                  >
                    <span className="subHeading">{contract.type}</span>
                    <Flex justify="space-between" className="subFooterDiv">
                      <div className="subFooterDiv1">
                        <Flex vertical>
                          <div
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              navigate(`/${contract.type.toLowerCase()}`, {
                                state: { status: [3] },
                              })
                            }
                          >
                            <Statistic
                              className="count"
                              valueStyle={{
                                color: '#a0d911',
                              }}
                              value={contract.count.active}
                              formatter={formatter}
                            />
                          </div>
                          <span className="counthead">Active</span>
                        </Flex>

                        <Flex vertical>
                          <div
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              navigate(`/${contract.type.toLowerCase()}`, {
                                state: { status: [1] },
                              })
                            }
                          >
                            <Statistic
                              className="count"
                              valueStyle={{
                                color: '#1677ff',
                              }}
                              value={contract.count.draft}
                              formatter={formatter}
                            />
                          </div>
                          <span className="counthead">Draft</span>
                        </Flex>
                        <Flex vertical>
                          <div
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              navigate(`/${contract.type.toLowerCase()}`, {
                                state: { status: [4] },
                              })
                            }
                          >
                            <Statistic
                              className="count"
                              valueStyle={{
                                color: '#f5222d',
                              }}
                              value={contract.count.inactive}
                              formatter={formatter}
                            />
                          </div>
                          <span className="counthead">Inactive</span>
                        </Flex>
                      </div>
                      <div className="subFooterDiv2">
                        <Flex vertical>
                          <div
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              navigate(`/${contract.type.toLowerCase()}`, {
                                state: { status: [2] },
                              })
                            }
                          >
                            <Statistic
                              className="count"
                              valueStyle={{
                                color: '#faad14',
                              }}
                              value={contract.count.pending}
                              formatter={formatter}
                            />
                          </div>
                          <span className="counthead">Pending Approval</span>
                        </Flex>
                        <Flex vertical>
                          <div
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              navigate(`/${contract.type.toLowerCase()}`, {
                                state: { status: [3], expireyDays: expireDays },
                              })
                            }
                          >
                            <Statistic
                              className="count"
                              valueStyle={{
                                color: '#ffd666',
                              }}
                              value={contract.count.expiring}
                              formatter={formatter}
                            />
                          </div>
                          <span className="counthead">Expire in (7 days)</span>
                        </Flex>
                      </div>
                    </Flex>
                  </Flex>
                </>
              ))}
            </Flex>
          </Flex>
        </Col>

        <Col className="gutter-row" span={8}>
          <Flex className="tiles" vertical gap={16}>
            <Flex justify="space-between" style={{ width: '100%' }}>
              <span className="tileHeading">Clients</span>
              {/* <div className="iconDiv clientIconDiv">
                <UsergroupAddOutlined />
              </div> */}
            </Flex>
            <Flex justify="space-between" gap={10} style={{ width: '100%' }}>
              <div
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  navigate(`/clients`, {
                    state: { withoutContract: '' },
                  })
                }
              >
                <Statistic
                  className="subTiles"
                  valueStyle={{
                    color: '#a0d911',
                    fontSize: '86px',
                    width: '100%',
                    width: '14vw',
                    textAlign: 'center',
                  }}
                  value={clients.activeClient}
                  formatter={formatter}
                />
              </div>
              <Flex vertical gap={16} style={{ height: '100%', width: '100%' }}>
                <Flex
                  vertical
                  className="subTiles"
                  style={{ height: '100%', width: '100%' }}
                >
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      navigate(`/clients`, {
                        state: { withoutContract: '0' },
                      })
                    }
                  >
                    <Statistic
                      className="count"
                      valueStyle={{
                        color: '#f5222d',
                      }}
                      value={clients.clientWithoutNDA}
                      formatter={formatter}
                    />
                  </div>
                  <span className="counthead">Without NDA</span>
                </Flex>
                <Flex
                  vertical
                  className="subTiles"
                  style={{ height: '100%', width: '100%' }}
                >
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      navigate(`/clients`, {
                        state: { withoutContract: '1' },
                      })
                    }
                  >
                    <Statistic
                      className="count"
                      valueStyle={{
                        color: '#f5222d',
                      }}
                      value={clients.clientWithoutMSA}
                      formatter={formatter}
                    />
                  </div>
                  <span className="counthead">Without MSA</span>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Col>

        <Col className="gutter-row" span={24}>
          <Flex vertical className="tiles" gap={16}>
            <Flex align="center" justify="space-between">
              <span className="tileHeading">Expiring Contracts</span>
              <Radio.Group
                onChange={onPeridChange}
                defaultValue={'7'}
                size="samll"
              >
                <Radio.Button value={'7'}>7d</Radio.Button>
                <Radio.Button value={'15'}>15d</Radio.Button>
                <Radio.Button value={'30'}>30d</Radio.Button>
              </Radio.Group>
            </Flex>
            <div>
              {graphDataLoading ? (
                <div
                  style={{
                    height: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Spin />
                </div>
              ) : (
                <ChartComponent  yaxisData={expiringContractYaxis} data={graphData} />
              )}
            </div>
          </Flex>
        </Col>

        <Col className="gutter-row" span={24}>
          <Flex vertical className="tiles" gap={16}>
            <Flex align="center" justify="space-between">
              <span className="tileHeading">Expired Contracts</span>
              <Radio.Group
                onChange={onPeridChangeForExpired}
                defaultValue={'7'}
                size="samll"
              >
                <Radio.Button value={'7'}>7d</Radio.Button>
                <Radio.Button value={'15'}>15d</Radio.Button>
                <Radio.Button value={'30'}>30d</Radio.Button>
              </Radio.Group>
            </Flex>
            <div>
              {graphDataExpiredLoading ? (
                <div
                  style={{
                    height: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Spin />
                </div>
              ) : (
                <ChartComponent
                yaxisData={expiredContractYaxis}
                  data={graphDataForExpired}
                  // roundedMaxCount={''}
                />
              )}
            </div>
          </Flex>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
