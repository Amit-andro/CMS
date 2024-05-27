import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  Flex,
  Form,
  Select,
  DatePicker,
  notification,
  Radio,
} from 'antd';
import { FileDoneOutlined } from '@ant-design/icons';
import './styles.css';
import UploadDocument from '../other/UploadDocument';
import { useFormik } from 'formik';
import { contracts } from '../api';
import GetRole from '../../GetRole.utils';
import decodedToken from '../../DecodedToken.utils';

const NdaPopup = ({
  hide,
  buttonText,
  clientId,
  status,
  clearForm,
  apiHit,
}) => {
  const { RangePicker } = DatePicker;
  const [FileDoc, setFileDoc] = useState(null);
  const [ndaDates, setNdaDates] = useState([]);
  const [datesState, setDatesState] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [payloadStatus, setPayloadStatus] = useState(1);
  const [resetUpload, setResetUpload] = useState(false);
  const [clientNameList, setClientNameList] = useState([]);
  const [loadings, setLoadings] = useState(false);
  const [approvalLoadings, setApprovalLoadings] = useState(false);
  const [initialValues, setInitialValues] = useState({
    seId: 1,
    clientId: null,
    activationDate: null,
    expiryDate: '',
    fileName: '',
  });
  const [search, setSearch] = useState('');

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
    if (JSON.stringify(errors) !== '{}') {
      setApprovalLoadings(false);
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

  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validate,
    onSubmit: async (values, { resetForm }) => {
      try {
        let formdata = new FormData();

        if (!FileDoc) {
          setUploadError(true);
          return;
        } else {
          setUploadError(false);
        }

        let obj = {
          seId: values.seId,
          clientId: values.clientId,
          contractTypeId: 0,
          activationDate: values.activationDate,
          cStatusId: payloadStatus,
          createdBy: decodedToken.employeeNo,
        };

        if (values.expiryDate) {
          obj.expiryDate = values.expiryDate;
        }

        if (FileDoc && FileDoc?.originFileObj) {
          formdata.append('file', FileDoc?.originFileObj || '');
        }

        formdata.append('obj', JSON.stringify(obj));

        if (clientId) {
          payloadStatus === 1 ? setLoadings(true) : setApprovalLoadings(true);
          contracts
            .updateContractsData(clientId, formdata)
            .then((res) => {
              hide();
              if (res.statusCode === 200 || res.statusCode === 201) {
                openNotificationWithIcon('success', res?.message);
              }
              payloadStatus === 1
                ? setLoadings(false)
                : setApprovalLoadings(false);
            })
            .catch((err) => {
              console.log(err);
              openNotificationWithIcon('error', err.response.data.message);
              payloadStatus === 1
                ? setLoadings(false)
                : setApprovalLoadings(false);
            });
        } else {
          payloadStatus === 1 ? setLoadings(true) : setApprovalLoadings(true);
          contracts
            .addContractsData(formdata)
            .then((res) => {
              hide();
              if (res.statusCode === 201) {
                resetForm();
                setFileDoc(null);
                setUploadError(false);
                openNotificationWithIcon(res.status, res.message);
              }
              payloadStatus === 1
                ? setLoadings(false)
                : setApprovalLoadings(false);
            })
            .catch((err) => {
              console.log(err);
              openNotificationWithIcon('error', err.response.data.message);
              payloadStatus === 1
                ? setLoadings(false)
                : setApprovalLoadings(false);
            });
        }
      } catch (error) {
        console.error('API Error:', error);
      }
    },
  });

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

      setApprovalLoadings(true);
      const formdata = new FormData();

      const obj = {
        seId: formik.values.seId,
        clientId: formik.values.clientId,
        contractTypeId: 0,
        activationDate: formik.values.activationDate,
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
          setApprovalLoadings(false);
        })
        .catch((err) => {
          console.log(err);
          openNotificationWithIcon('error', 'Error in Sending Approval.');
          setApprovalLoadings(false);
        });
    }
  };

  const handlePrimaryButtonClick = () => {
    if (!formik.values.fileName || formik.values.fileName.length === 0) {
      setUploadError(true);
      return;
    }
  };

  const receiveFileData = (data) => {
    const file = data[0];
    setFileDoc(file);
  };

  const handleSeIdChange = (value) => {
    if (value === 0) {
      formik.setFieldValue('clientId', null);
    } else {
      formik.setFieldValue('clientId', null);
    }
    formik.setFieldValue('seId', value);
  };

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
          let obj = {
            seId: Number(data?.contractData?.seId),
            clientId: data?.contractData?.client?.clientId,
            activationDate: convertDate(data?.contractData?.activationDate),
            expiryDate: data?.contractData?.expiryDate
              ? convertDate(data?.contractData?.expiryDate)
              : '',
            fileName: data?.contractData?.fileName,
          };
          setFileDoc(data?.contractData?.fileName);
          formik.setValues(obj);
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [clientId, apiHit]);

  useEffect(() => {
    setNdaDates([
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
    setDatesState(true);
  }, [formik?.values?.activationDate, formik?.values?.expiryDate]);

  useEffect(() => {
    formik.resetForm({ values: initialValues });
    setResetUpload([]);
    setUploadError(false);
  }, [clearForm]);

  console.log('fileDoc', FileDoc);

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="popupDiv">
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
                onBlur={() => {
                  formik.handleBlur('clientId');
                }}
                onChange={(val) => {
                  formik.setFieldValue('clientId', val);
                  formik.handleBlur('clientId');
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
            {datesState ? (
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
                      dayjs(ndaDates?.[0], 'YYYY/MM/DD'),
                      dayjs(ndaDates?.[1], 'YYYY/MM/DD'),
                    ]}
                    format={'DD/MM/YYYY'}
                    onChange={(dates) => {
                      formik.setFieldValue('activationDate', dates[0]);
                      formik.setFieldValue('expiryDate', dates[1]);
                    }}
                    className="no-clear-button"
                  />
                </div>
              </Form.Item>
            ) : (
              <></>
            )}
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
                uploadDocument={'NDA'}
                receiveFileData={receiveFileData}
                error={uploadError}
                resetUpload={resetUpload}
                fileValue={FileDoc?.name ? FileDoc.name : FileDoc}
                fileUrl={formik.values.fileUrl}
                setUploadError={setUploadError}
              />
            </Form.Item>
          </Flex>
          <Flex justify="end" gap={'10px'}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadings}
              onClick={handlePrimaryButtonClick}
            >
              {buttonText}
            </Button>
            {GetRole() !== 'finance' &&
            (status === 'draft' || buttonText === 'Save as Draft') ? (
              <Button
                type="primary"
                loading={approvalLoadings}
                icon={<FileDoneOutlined />}
                style={{ backgroundColor: '#52c41a', color: '#fff' }}
                onClick={() => handleApproval(clientId)}
              >
                Send for Approval
              </Button>
            ) : null}
          </Flex>
        </div>
      </form>
    </>
  );
};

export default NdaPopup;
