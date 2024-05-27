import './styles.css';
import dayjs from 'dayjs';
import { contracts } from '../api';
import { useFormik } from 'formik';
import { clientsApi } from '../api';
import React, { useEffect, useState } from 'react';
import UploadDocument from '../other/UploadDocument';
import {
  Button,
  Flex,
  Input,
  Select,
  DatePicker,
  Form,
  notification,
  Radio,
} from 'antd';
import { FileDoneOutlined } from '@ant-design/icons';
import moment from 'moment';
import decodedToken from '../../DecodedToken.utils';
import GetRole from '../../GetRole.utils';

const { RangePicker } = DatePicker;

const MsaPopup = ({
  hide,
  buttonText,
  clientId,
  status,
  clearForm,
  apiHit,
}) => {
  const [search, setSearch] = useState('');
  const [uploadError, setUploadError] = useState(false);
  const [FileDoc, setFileDoc] = useState(null);
  const [payloadStatus, setPayloadStatus] = useState(1);
  const [authorizerData, setAuthorizerData] = useState([]);
  const [clientNameList, setClientNameList] = useState([]);
  const [businessUnitList, setBusinessUnitList] = useState([]);
  const [msaDates, setMsaDates] = useState([]);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(false);
  const [resetUpload, setResetUpload] = useState(false);
  const [initialValues, setInitialValues] = useState({
    seId: 1,
    clientId: null,
    activationDate: '',
    expiryDate: '',
    clientAuthorizerName: '',
    clientAuthorizerEmail: '',
    clientAuthorizerMobile: '',
    businessOwner: null,
    spanideaBusinessUnit: null,
    fileName: null,
  });

  const validate = (values) => {
    const errors = {};
    if (!values.clientId) {
      errors.clientId = 'error';
    }
    if (!values.activationDate) {
      errors.activationDate = 'error';
    }
    if (!values.expiryDate) {
      errors.expiryDate = 'error';
    }
    if (!values.clientAuthorizerName) {
      errors.clientAuthorizerName = 'error';
    }
    if (!values.businessOwner) {
      errors.businessOwner = 'error';
    }
    if (!values.spanideaBusinessUnit) {
      errors.spanideaBusinessUnit = 'error';
    }
    if (!values.clientAuthorizerEmail) {
      errors.clientAuthorizerEmail = 'error';
    } else if (!/^\S+@\S+\.\S+$/.test(values.clientAuthorizerEmail)) {
      errors.clientAuthorizerEmail = 'error';
    }
    if (!values.clientAuthorizerMobile) {
      errors.clientAuthorizerMobile = 'error';
    } else if (!/^[0-9]{10}$/.test(values.clientAuthorizerMobile)) {
      errors.clientAuthorizerMobile = 'error';
    }
    // if (!values.fileName) {
    //   errors.fileName = 'error';
    // }
    if (JSON.stringify(errors) !== '{}') {
      setLoadingApproval(false);
    }
    return errors;
  };

  const handleResetUpload = () => {
    setResetUpload(true);
  };

  function convertDateFormat(dateString) {
    const parts = dateString.split('/');
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    const convertedDate = `${year}/${month}/${day}`;
    return convertedDate;
  }

  function convertDate(dateString) {
    var parts = dateString.split('/');
    var newDateString = parts[2] + '/' + parts[1] + '/' + parts[0];
    return newDateString;
  }

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formdata = new FormData();

        if (!FileDoc) {
          setUploadError(true);
          return;
        } else {
          setUploadError(false);
        }

        const obj = {
          seId: values.seId,
          clientId: values.clientId,
          cStatusId: payloadStatus,
          contractTypeId: 1,
          activationDate: values.activationDate,
          clientAuthorizerName: values.clientAuthorizerName,
          clientAuthorizerEmail: values.clientAuthorizerEmail,
          clientAuthorizerMobile: values.clientAuthorizerMobile,
          spanideaBusinessUnit: values.spanideaBusinessUnit,
          spanideaAuthorizerEmpCode: values.businessOwner,
          createdBy: decodedToken.employeeNo,
        };

        if (values.expiryDate) {
          obj.expiryDate = values.expiryDate;
        }

        if (FileDoc && FileDoc.originFileObj) {
          formdata.append('file', FileDoc.originFileObj);
        }

        formdata.append('obj', JSON.stringify(obj));

        if (clientId) {
          payloadStatus === 1 ? setLoadingSave(true) : setLoadingApproval(true);
          contracts
            .updateContractsData(clientId, formdata)
            .then((res) => {
              hide();
              if (res.statusCode === 200 || res.statusCode === 201) {
                openNotificationWithIcon('success', res?.message);
              }
              loadingApproval
                ? setLoadingApproval(false)
                : setLoadingSave(false);
            })
            .catch((err) => {
              console.log(err);
              openNotificationWithIcon('error', err.response.data.message);
              loadingApproval
                ? setLoadingApproval(false)
                : setLoadingSave(false);
            });
        } else {
          payloadStatus === 1 ? setLoadingSave(true) : setLoadingApproval(true);
          contracts
            .addContractsData(formdata)
            .then((res) => {
              hide();
              if (res.statusCode === 201) {
                resetForm();
                setFileDoc(null);
                openNotificationWithIcon(res.status, res.message);
              }
              loadingApproval
                ? setLoadingApproval(false)
                : setLoadingSave(false);
            })
            .catch((err) => {
              console.log(err);
              openNotificationWithIcon('error', 'Error creating contract.');
              loadingApproval
                ? setLoadingApproval(false)
                : setLoadingSave(false);
            });
        }
      } catch (error) {
        console.error('API Error:', error);
        // loadingApproval ? setLoadingApproval(false) : setLoadingSave(false);
      }
    },
  });

  const onSearch = (value) => {
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

  const onclientIdSearch = (value) => {
    setSearch(value);
    console.log('search:', value);
  };

  const receiveFileData = (data) => {
    const file = data[0];
    setFileDoc(file);
  };

  const handlePrimaryButtonClick = () => {
    if (!formik.values.fileName || formik.values.fileName.length === 0) {
      setUploadError(true);
      return;
    }
  };

  const handleSeIdChange = (value) => {
    if (value === 0) {
      formik.setFieldValue('clientId', null);
    } else {
      formik.setFieldValue('clientId', null);
    }
    formik.setFieldValue('seId', value);
  };

  const handleApproval = (id) => {
    if (buttonText === 'Save as Draft') {
      setPayloadStatus(2);
      formik.handleSubmit();
    } else {
      if (!FileDoc) {
        setUploadError(true);
        return;
      } else {
        setUploadError(false);
      }
      
      setLoadingApproval(true);
      const formdata = new FormData();

      const obj = {
        seId: formik.values.seId,
        clientId: formik.values.clientId,
        contractTypeId: 1,
        activationDate: formik.values.activationDate,
        clientAuthorizerName: formik.values.clientAuthorizerName,
        clientAuthorizerEmail: formik.values.clientAuthorizerEmail,
        clientAuthorizerMobile: formik.values.clientAuthorizerMobile,
        spanideaBusinessUnit: formik.values.spanideaBusinessUnit,
        spanideaAuthorizerEmpCode: formik.values.businessOwner,
        cStatusId: 2,
        createdBy: decodedToken.employeeNo,
      };

      if (formik.values.expiryDate) {
        obj.expiryDate = formik.values.expiryDate;
      }

      if (FileDoc && FileDoc.originFileObj) {
        formdata.append('file', FileDoc.originFileObj);
      }
      formdata.append('obj', JSON.stringify(obj));

      contracts
        .updateContractsData(id, formdata)
        .then((res) => {
          openNotificationWithIcon('success', 'Contract sent for Approval');
          hide();
          setLoadingApproval(false);
        })
        .catch((err) => {
          console.log(err);
          openNotificationWithIcon('error', 'Error in Sending Approval.');
          setLoadingApproval(false);
        });
    }
    if (!formik.values.fileName || formik.values.fileName.length === 0) {
      setUploadError(true);
      return;
    }
  };
  useEffect(() => {
    clientsApi
      .getEmployeeName()
      .then((res) => {
        setAuthorizerData(res.data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    contracts
      .getBusinessUnitData()
      .then((res) => {
        setBusinessUnitList(res.data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    if (clientId) {
      contracts
        .getContractsData(clientId)
        .then((res) => {
          const data = res.data[0];
          let obj = {
            seId: Number(data?.contractData?.seId),
            clientId: data?.contractData?.client?.clientId,
            activationDate: convertDate(data?.contractData?.activationDate),
            expiryDate: data?.contractData?.expiryDate
              ? convertDate(data?.contractData?.expiryDate)
              : '',
            clientAuthorizerName: data?.contractData?.clientAuthorizerName,
            clientAuthorizerEmail: data?.contractData?.clientAuthorizerEmail,
            clientAuthorizerMobile: data?.contractData?.clientAuthorizerMobile,
            businessOwner:
              data?.contractData?.spanideaAuthorizerEmpName?.empCode,
            spanideaBusinessUnit:
              data?.contractData?.spanideaBusinessUnit?.businessUnitId,
            fileName: data?.contractData?.fileName,
          };
          setFileDoc(data?.contractData?.fileName);
          formik.setValues(obj);
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [clientId, apiHit]);

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
    setMsaDates([
      formik?.values?.activationDate?.$d
        ? formik?.values?.activationDate.format('YYYY/MM/DD')
        : formik?.values?.activationDate
        ? convertDateFormat(formik?.values?.activationDate)
        : dayjs(new Date()).format('YYYY/MM/DD'),
      formik?.values?.expiryDate?.$d
        ? formik?.values?.expiryDate.format('YYYY/MM/DD')
        : formik?.values?.expiryDate
        ? convertDateFormat(formik?.values?.expiryDate)
        : dayjs(new Date()).format('YYYY/MM/DD'),
    ]);
  }, [formik?.values?.activationDate, formik?.values?.expiryDate]);

  useEffect(() => {
    formik.resetForm({ values: initialValues });
    setResetUpload([]);
    setUploadError(false);
  }, [clearForm]);

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="popupDiv" style={{ height: '60vh', overflow: 'auto' }}>
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
                onBlur={formik.handleBlur}
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
                onBlur={() => formik.handleBlur('clientId')}
                onChange={(val) => {
                  formik.setFieldValue('clientId', val);
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
          {/* <Flex vertical gap="" style={{ width: '100%' }}>
            <span>
              Select Dates
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              name="dateRange"
              validateStatus={
                (formik.errors.activationDate &&
                  formik.touched.activationDate) ||
                (formik.errors.expiryDate && formik.touched.expiryDate)
                  ? 'error'
                  : null
              }
            >
              <div>
                <RangePicker
                  size="large"
                  style={{ width: '100%' }}
                  value={[
                    dayjs(msaDates?.[0], 'YYYY/MM/DD'),
                    dayjs(msaDates?.[1], 'YYYY/MM/DD'),
                  ]}
                  onChange={(dates) => {
                    formik.setFieldValue('activationDate', dates[0]);
                    formik.setFieldValue('expiryDate', dates[1]);
                  }}
                  format={'DD/MM/YYYY'}
                  className="no-clear-button"
                />
              </div>
            </Form.Item>
          </Flex> */}

          <Flex justify="center" style={{ width: '100%' }} gap={10}>
            <Flex vertical style={{ width: '100%' }}>
              <span>
                Start Date
                {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
              </span>
              <Form.Item
                validateStatus={
                  formik.errors.activationDate && formik.touched.activationDate
                    ? 'error'
                    : ''
                }
              >
                <div>
                  <DatePicker
                    className="no-clear-button"
                    value={
                      formik.values.activationDate
                        ? dayjs(formik.values.activationDate)
                        : null
                    }
                    onChange={(dates) => {
                      formik.setFieldValue(
                        'activationDate',
                        dates ? dayjs(dates) : null
                      );
                      formik.setFieldValue('expiryDate', null);
                    }}
                    size="large"
                    style={{ width: '100%' }}
                    format={'DD/MM/YYYY'}
                    allowClear={false}
                    inputReadOnly={true}
                  />
                </div>
              </Form.Item>
            </Flex>
            <Flex vertical style={{ width: '100%' }}>
              <span>
                End Date
                {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
              </span>
              <Form.Item
                validateStatus={
                  formik.errors.expiryDate && formik.touched.expiryDate
                    ? 'error'
                    : ''
                }
              >
                <div>
                  <DatePicker
                    disabled={formik.values.activationDate ? false : true}
                    className="no-clear-button"
                    value={
                      formik.values.expiryDate
                        ? dayjs(formik.values.expiryDate)
                        : null
                    }
                    onChange={(dates) => {
                      formik.setFieldValue(
                        'expiryDate',
                        dates ? dayjs(dates) : null
                      );
                    }}
                    minDate={
                      formik.values.activationDate
                        ? dayjs(formik.values.activationDate)
                        : null
                    }
                    disabledDate={(current) =>
                      formik.values.activationDate
                        ? dayjs(current).isSame(
                            formik.values.activationDate,
                            'day'
                          )
                        : false
                    }
                    size="large"
                    style={{ width: '100%' }}
                    format={'DD/MM/YYYY'}
                    allowClear={false}
                    inputReadOnly={true}
                  />
                </div>
              </Form.Item>
            </Flex>
          </Flex>

          <Flex vertical gap="">
            <span>
              Client Signatory
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.clientAuthorizerName &&
                formik.touched.clientAuthorizerName
                  ? 'error'
                  : ''
              }
            >
              <Input
                size="large"
                name="clientAuthorizerName"
                placeholder="Name"
                onChange={(e) => {
                  const { name, value } = e.target;
                  const filteredValue = value.replace(/[^\w\s]/gi, '');
                  const capitalizedValue = filteredValue.replace(/\b\w/g, (c) =>
                    c.toUpperCase()
                  );
                  formik.handleChange({
                    target: {
                      name,
                      value: capitalizedValue,
                    },
                  });
                  formik.setFieldValue(name, capitalizedValue);
                }}
                value={formik?.values?.clientAuthorizerName}
              />
            </Form.Item>
            <Flex gap="10px" style={{ width: '100%', marginTop: '-10px' }}>
              <Form.Item
                style={{ width: '100%' }}
                validateStatus={
                  formik.errors.clientAuthorizerEmail &&
                  formik.touched.clientAuthorizerEmail
                    ? 'error'
                    : ''
                }
              >
                <Input
                  size="large"
                  name="clientAuthorizerEmail"
                  value={formik.values.clientAuthorizerEmail}
                  onChange={formik.handleChange}
                  placeholder="Email"
                />
              </Form.Item>
              <Form.Item
                style={{ width: '100%' }}
                validateStatus={
                  formik.errors.clientAuthorizerMobile &&
                  formik.touched.clientAuthorizerMobile
                    ? 'error'
                    : ''
                }
              >
                <Input
                  size="large"
                  type="text"
                  min={0}
                  name="clientAuthorizerMobile"
                  value={formik.values.clientAuthorizerMobile}
                  onChange={(e) => {
                    if (parseInt(e.target.value) < 0) {
                      e.target.value = '';
                    }
                    formik.handleChange(e);
                  }}
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
                  placeholder="Mobile"
                />
              </Form.Item>
            </Flex>
          </Flex>

          <Flex vertical>
            <span>
              Business Unit
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.spanideaBusinessUnit &&
                formik.touched.spanideaBusinessUnit
                  ? 'error'
                  : null
              }
            >
              <Select
                showSearch
                name="spanideaBusinessUnit"
                placeholder="Business Unit"
                size="large"
                optionFilterProp="children"
                onSearch={onSpanideaAuthorizorSearch}
                filterOption={filterOption}
                style={{ width: '100%' }}
                value={formik?.values?.spanideaBusinessUnit}
                onChange={(e) =>
                  formik.setFieldValue('spanideaBusinessUnit', e)
                }
                options={businessUnitList.map((authorizer, index) => ({
                  key: index,
                  value: authorizer.businessUnitId,
                  label: authorizer.businessUnitName,
                }))}
              />
            </Form.Item>
          </Flex>

          <Flex vertical gap="">
            <span>
              Business Owner
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.businessOwner && formik.touched.businessOwner
                  ? 'error'
                  : null
              }
            >
              <Select
                showSearch
                name="businessOwner"
                placeholder="Business Owner"
                size="large"
                optionFilterProp="children"
                onSearch={onSpanideaAuthorizorSearch}
                filterOption={filterOption}
                style={{ width: '100%' }}
                value={formik?.values?.businessOwner}
                onChange={(e) => formik.setFieldValue('businessOwner', e)}
                options={authorizerData.map((authorizer, index) => ({
                  key: index,
                  value: authorizer.empCode,
                  label: authorizer.name,
                }))}
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap="" style={{ width: '100%' }}>
            <span>
              Upload file
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              style={{ width: '100%', marginBottom: '20px' }}
              validateStatus={
                formik.errors.upload && formik.touched.upload ? 'error' : null
              }
            >
              <UploadDocument
                uploadDocument={'MSA'}
                receiveFileData={receiveFileData}
                error={uploadError}
                resetUpload={resetUpload}
                fileValue={FileDoc?.name ? FileDoc.name : FileDoc}
                fileUrl={formik.values.fileUrl}
                clientId={clientId}
                setUploadError={setUploadError}
              />
            </Form.Item>
          </Flex>
        </div>
        <Flex justify="end" gap={'10px'} style={{ marginRight: '17px' }}>
          <Button
            loading={loadingSave}
            type="primary"
            htmlType="submit"
            onClick={handlePrimaryButtonClick}
          >
            {buttonText}
          </Button>
          {GetRole() !== 'finance' &&
          (status === 'draft' || buttonText === 'Save as Draft') ? (
            <Button
              type="primary"
              loading={loadingApproval}
              icon={<FileDoneOutlined />}
              style={{ backgroundColor: '#52c41a', color: '#fff' }}
              onClick={() => handleApproval(clientId)}
            >
              Send for Approval
            </Button>
          ) : null}
        </Flex>
      </form>
    </>
  );
};

export default MsaPopup;
