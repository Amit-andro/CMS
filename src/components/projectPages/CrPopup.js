import React, { useEffect, useState } from 'react';
import { Button, Flex, Input, Select, Radio, Form, notification } from 'antd';
import './styles.css';
import { contracts } from '../api';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import { handelDate } from '../other/usefulFunctions';
import { FileDoneOutlined } from '@ant-design/icons';
import decodedToken from '../../DecodedToken.utils';

const CrPopup = ({ hide, buttonText, clientId, status, clearForm, apiHit }) => {
  const [clientNameList, setClientNameList] = useState([]);
  const [projectDataDropDown, setProjectDataDropDown] = useState([]);
  const [sowDataDropDown, setSowDataDropDown] = useState([]);
  const [payloadStatus, setPayloadStatus] = useState(1);
  const [loadings, setLoadings] = useState(false);
  const [approvalLoadings, setApprovalLoadings] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('₹');
  const [search, setSearch] = useState('');
  const [initialValues, setInitialValues] = useState({
    seId: 1,
    clientId: null,
    projectId: null,
    sowNumber: null,
    crNumber: '',
    totalAmount: '',
    crExtendedNoOfDays: '',
  });

  const validate = (values) => {
    const errors = {};
    if (!values.clientId) {
      errors.clientId = 'error';
    }
    if (!values.projectId) {
      errors.projectId = 'error';
    }
    if (!values.sowNumber) {
      errors.sowNumber = 'error';
    }
    if (!values.crNumber) {
      errors.crNumber = 'error';
    }
    if (!values.totalAmount) {
      errors.totalAmount = 'error';
    }
    if (!values.crExtendedNoOfDays) {
      errors.crExtendedNoOfDays = 'error';
    }
    if (JSON.stringify(errors) !== '{}') {
      setApprovalLoadings(false);
    }
    return errors;
  };

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const postData = {
          cStatusId: payloadStatus,
          seId: Number(values.seId),
          clientId: values.clientId,
          projectId: values.projectId,
          sowNumber: String(values.sowNumber),
          contractTypeId: 4,
          crNumber: String(values.crNumber),
          totalAmount: selectedCurrency + values.totalAmount,
          crExtendedNoOfDays: values.crExtendedNoOfDays,
          createdBy: decodedToken.employeeNo,
        };

        if (clientId) {
          !approvalLoadings && setLoadings(true);
          contracts
            .updateContractsData(clientId, postData)
            .then((res) => {
              hide();
              openNotificationWithIcon(res.status, res.message);
              setLoadings(false);
              setApprovalLoadings(false);
            })
            .catch((err) => {
              console.log(err);
              openNotificationWithIcon('error', err.response.data.message);
              setLoadings(false);
              setApprovalLoadings(false);
            });
        } else {
          !approvalLoadings && setLoadings(true);
          contracts
            .addContractsData(postData)
            .then((res) => {
              hide();
              resetForm();
              openNotificationWithIcon(res.status, res.message);
              setLoadings(false);
              setApprovalLoadings(false);
            })
            .catch((err) => {
              console.log(err);
              openNotificationWithIcon('error', err.response.data.message);
              setLoadings(false);
              setApprovalLoadings(false);
            });
        }
      } catch (error) {
        console.error('API Error:', error);
        setLoadings(false);
        setApprovalLoadings(false);
      }
    },
  });

  const onClientChange = (value) => {
    console.log(`selected ${value}`);
  };
  const onclientIdSearch = (value) => {
    setSearch(value);
    console.log('search:', value);
  };

  const onSpanideaAuthorizorSearch = (value) => {
    console.log('search:', value);
  };

  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
      style: {
        padding: '9px 24px',
      },
    });
  };

  const handleApproval = (id) => {
    setApprovalLoadings(true);

    formik.setFieldTouched('seId', true);
    formik.setFieldTouched('clientId', true);
    formik.setFieldTouched('projectId', true);
    formik.setFieldTouched('sowNumber', true);
    formik.setFieldTouched('crNumber', true);
    formik.setFieldTouched('totalAmount', true);
    formik.setFieldTouched('crExtendedNoOfDays', true);
    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length === 0) {
        setApprovalLoadings(true);

        if (
          !formik.values.seId ||
          !formik.values.clientId ||
          !formik.values.projectId ||
          !formik.values.sowNumber ||
          !formik.values.crNumber ||
          !formik.values.totalAmount ||
          !formik.values.crExtendedNoOfDays
        ) {
          setApprovalLoadings(false);
          return;
        }
        if (buttonText === 'Save as Draft') {
          setPayloadStatus(2);
          formik.handleSubmit();
        } else {
          const formdata = new FormData();
          const obj = {
            seId: Number(formik.values.seId),
            clientId: formik.values.clientId,
            projectId: formik.values.projectId,
            sowNumber: String(formik.values.sowNumber),
            crNumber: formik.values.crNumber,
            contractTypeId: 4,
            totalAmount: selectedCurrency + formik.values.totalAmount,
            cStatusId: 2,
            createdBy: decodedToken.employeeNo,
          };

          formdata.append('obj', JSON.stringify(obj));
          contracts
            .updateContractsData(id, formdata)
            .then((res) => {
              if (res.statusCode === 200 || res.statusCode === 201) {
                openNotificationWithIcon('success', res?.message);
              }
              hide();
              setApprovalLoadings(false);
            })
            .catch((err) => {
              console.log(err);
              openNotificationWithIcon('error', err.response.data.message);
              setApprovalLoadings(false);
            });
        }
      } else {
        console.log('Form validation errors:', errors);
        setApprovalLoadings(false);
      }
    });
  };

  const handleSeIdChange = (value) => {
    if (value === 0) {
      formik.setFieldValue('clientId', null);
      formik.setFieldValue('projectId', null);
      formik.setFieldValue('sowNumber', null);
    } else {
      formik.setFieldValue('clientId', null);
      formik.setFieldValue('projectId', null);
      formik.setFieldValue('sowNumber', null);
    }
    formik.setFieldValue('seId', value);
  };

  const handleClientIdChange = (value) => {
    if (formik.values.clientId) {
      formik.setFieldValue('projectId', null);
      formik.setFieldValue('sowNumber', null);
    } else {
      formik.setFieldValue('projectId', null);
      formik.setFieldValue('sowNumber', null);
    }
    formik.setFieldValue('clientId', value);
  };

  const handleProjectIdChange = (value) => {
    if (formik.values.clientId) {
      formik.setFieldValue('sowNumber', null);
    } else {
      formik.setFieldValue('sowNumber', null);
    }
    formik.setFieldValue('projectId', value);
  };

  const handleCurrencyChange = (value) => {
    setSelectedCurrency(value);
  };

  const { Option } = Select;
  const selectAfter = (
    <Select
      defaultValue={'₹'}
      style={{ width: 50 }}
      onChange={handleCurrencyChange}
      value={selectedCurrency}
    >
      <Option value="₹">₹</Option>
      <Option value="$">$</Option>
    </Select>
  );

  useEffect(() => {
    const val_data = formik?.values?.seId;
    contracts
      .clientNameList(val_data === 0 ? 0 : 1 || 1, search)
      .then((res) => {
        setClientNameList(res.data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, [formik?.values?.seId, search]);

  useEffect(() => {
    if (clientId) {
      contracts
        .getContractsData(clientId)
        .then((res) => {
          const data = res.data[0];
          const str = data?.contractData?.totalAmount;
          const match = str?.match(/^(\D+)(\d+)$/);

          if (match) {
            const symbol = match[1];
            setSelectedCurrency(symbol);
            const totalAmount = parseInt(match[2]);

            let obj = {
              seId: Number(data?.contractData?.seId),
              clientId: data?.contractData?.client?.clientId,
              projectId: data?.contractData?.project?.projectId,
              sowNumber: data?.contractData?.sowNumber,
              crNumber: data?.contractData?.crNumber,
              totalAmount: totalAmount,
              crExtendedNoOfDays: data?.contractData?.crExtendedNoOfDays,
            };
            formik.setValues(obj);
            formik.validateForm().then(() => {
              console.log('Validation triggered');
            });
          } else {
            console.log('Invalid string format.');
          }
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [clientId, apiHit]);

  useEffect(() => {
    const val_data = formik.values.seId;
    contracts
      .clientNameList(val_data === 0 ? 0 : 1 || 1)
      .then((res) => {
        setClientNameList(res.data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, [formik.values.seId]);

  useEffect(() => {
    const getclientId = formik.values.clientId;
    if (getclientId) {
      contracts
        .getProjectDropDown(getclientId)
        .then((res) => {
          setProjectDataDropDown(res.data);
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [formik.values.clientId]);

  useEffect(() => {
    const getprojectId = formik.values.projectId;
    if (getprojectId) {
      contracts
        .getSowDropDown(getprojectId)
        .then((res) => {
          setSowDataDropDown(res.data);
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [formik.values.projectId]);

  useEffect(() => {
    formik.resetForm({ values: initialValues });
  }, [clearForm]);

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="popupDiv" style={{ height: '62vh', overflow: 'auto' }}>
          <Flex justify="center" style={{ paddingTop: '8px' }}>
            <Form.Item
              validateStatus={
                formik.errors.seId && formik.touched.seId ? 'error' : undefined
              }
            >
              <Radio.Group
                name="seId"
                value={formik.values.seId}
                onChange={(e) => handleSeIdChange(e.target.value)}
                // onBlur={formik.handleBlur}
                defaultValue={1}
              >
                <Radio.Button value={0}>Spanidea Systems LLC</Radio.Button>
                <Radio.Button value={1}>
                  Spanidea Systems Pvt. Ltd.
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Flex>
          <Flex vertical gap="" style={{}}>
            <span>
              Select Client
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.clientId && formik.touched.clientId
                  ? 'error'
                  : null
              }
            >
              <Select
                name="clientId"
                showSearch
                placeholder="Select Client"
                size="large"
                optionFilterProp="children"
                onSearch={onclientIdSearch}
                filterOption={filterOption}
                style={{ width: '100%' }}
                value={formik?.values?.clientId}
                // onBlur={() => formik.handleBlur('clientId')}
                onChange={(val) => {
                  {
                    formik.setFieldValue('clientId', val);
                    handleClientIdChange(val);
                  }
                }}
                options={
                  formik.values.seId === 0
                    ? clientNameList?.map((clientName, index) => ({
                        key: index,
                        value:
                          clientName && clientName.clientId
                            ? clientName.clientId
                            : '',
                        label:
                          clientName && clientName.legalEntityName
                            ? clientName.legalEntityName
                            : '',
                      }))
                    : clientNameList?.map((clientName, index) => ({
                        key: index,
                        value:
                          clientName && clientName.clientId
                            ? clientName.clientId
                            : '',
                        label:
                          clientName && clientName.legalEntityName
                            ? clientName.legalEntityName
                            : '',
                      }))
                }
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap="" style={{}}>
            <span>
              Project Name
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.projectId && formik.touched.projectId
                  ? 'error'
                  : null
              }
            >
              <Select
                showSearch
                name="projectId"
                placeholder="Project Name"
                size="large"
                optionFilterProp="children"
                onSearch={onSpanideaAuthorizorSearch}
                filterOption={filterOption}
                style={{ width: '100%' }}
                value={formik?.values?.projectId}
                onChange={(e) => {
                  formik.setFieldValue('projectId', e);
                  handleProjectIdChange(e);
                }}
                options={projectDataDropDown.map((projectData, index) => ({
                  key: index,
                  value: projectData.projectId,
                  label: projectData.projectName,
                }))}
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap="" style={{}}>
            <span>
              Select SOW
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.sowNumber && formik.touched.sowNumber
                  ? 'error'
                  : null
              }
            >
              <Select
                name="sowNumber"
                showSearch
                placeholder="Select SOW"
                size="large"
                optionFilterProp="children"
                onSearch={onclientIdSearch}
                filterOption={filterOption}
                style={{ width: '100%' }}
                value={formik?.values?.sowNumber}
                // onBlur={() => {
                //   formik.handleBlur('sowNumber');
                // }}
                onChange={(val) => {
                  formik.setFieldValue('sowNumber', val);
                }}
                options={sowDataDropDown.map((sowData, index) => ({
                  key: index,
                  value: sowData.sowNumber,
                  label: sowData.sowNumber,
                }))}
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap="" style={{ width: '100%' }}>
            <span>
              CR Number
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.crNumber && formik.touched.crNumber ? 'error' : ''
              }
            >
              <Input
                name="crNumber"
                value={formik.values.crNumber}
                onChange={(e) => {
                  const { name, value } = e.target;
                  const filteredValue = value.replace(/[^a-zA-Z0-9-#/]/g, '');
                  formik.handleChange({
                    target: {
                      name,
                      value: filteredValue,
                    },
                  });
                  formik.setFieldValue(name, filteredValue.toUpperCase());
                }}
                size="large"
                placeholder="CR Number (Alphanumeric)"
                // onBlur={formik.handleBlur}
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap="">
            <span>
              CR Amount
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.totalAmount && formik.touched.totalAmount
                  ? 'error'
                  : null
              }
            >
              <Input
                type="text"
                size="large"
                name="totalAmount"
                placeholder="Amount"
                onChange={formik.handleChange}
                value={formik?.values?.totalAmount}
                // onBlur={formik.handleBlur}
                addonBefore={selectAfter}
                onKeyDown={(e) => {
                  if (
                    !/[\d\b]/.test(e.key) &&
                    ![
                      'ArrowLeft',
                      'ArrowRight',
                      'Delete',
                      'Backspace',
                    ].includes(e.key) &&
                    !(e.ctrlKey && e.key === 'r') &&
                    !(e.ctrlKey && e.key === 'a')
                  )
                    e.preventDefault();
                }}
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap="">
            <span>
              Extended No. of Days
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.crExtendedNoOfDays &&
                formik.touched.crExtendedNoOfDays
                  ? 'error'
                  : null
              }
            >
              <Input
                type="text"
                size="large"
                minLength={0}
                name="crExtendedNoOfDays"
                placeholder="Extended No. of Days"
                onChange={formik.handleChange}
                value={formik?.values?.crExtendedNoOfDays}
                // onBlur={formik.handleBlur}
                onKeyDown={(e) => {
                  if (
                    !/[\d\b+]/.test(e.key) &&
                    ![
                      'ArrowLeft',
                      'ArrowRight',
                      'Delete',
                      'Backspace',
                    ].includes(e.key) &&
                    !(e.ctrlKey && e.key === 'r') &&
                    !(e.ctrlKey && e.key === 'a')
                  )
                    e.preventDefault();
                }}
              />
            </Form.Item>
          </Flex>
        </div>
        <Flex
          justify="end"
          gap={'10px'}
          style={{ marginRight: '17px', paddingTop: '18px' }}
        >
          <Button type="primary" loading={loadings} htmlType="submit">
            {buttonText}
          </Button>
          {status === 'draft' || buttonText === 'Save as Draft' ? (
            <Button
              loading={approvalLoadings}
              type="primary"
              icon={<FileDoneOutlined />}
              style={{ backgroundColor: '#52c41a', color: '#fff' }}
              onClick={() => handleApproval(clientId)}
            >
              Send for Approval
            </Button>
          ) : (
            <></>
          )}
        </Flex>
      </form>
    </>
  );
};

export default CrPopup;
