import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Flex,
  Input,
  Select,
  DatePicker,
  Form,
  notification,
  Radio,
  Checkbox,
} from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import './styles.css';
import { contracts } from '../api';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import UploadDocument from '../other/UploadDocument';
import { FileDoneOutlined } from '@ant-design/icons';
import { values } from '@ant-design/plots/es/core/utils';
import decodedToken from '../../DecodedToken.utils';
import GetRole from '../../GetRole.utils';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const PoPopup = ({
  hide,
  buttonText,
  clientId,
  status,
  clearForm,
  apiHit,
  selectRef,
}) => {
  const formRef = useRef(null);
  const [ndaDates, setNdaDates] = useState([]);
  const [uploadError, setUploadError] = useState(false);
  const [clientNameList, setClientNameList] = useState([]);
  const [projectDataDropDown, setProjectDataDropDown] = useState([]);
  const [sowDataDropDown, setSowDataDropDown] = useState([]);
  const [FileDoc, setFileDoc] = useState(null);
  const [payloadStatus, setPayloadStatus] = useState(1);
  const [datesState, setDatesState] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const [approvalLoadings, setApprovalLoadings] = useState(false);
  const [resetUpload, setResetUpload] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('₹');
  const [checked, setChecked] = useState(true);
  const [search, setSearch] = useState('');
  const [initialValues, setInitialValues] = useState({
    seId: 1,
    clientId: null,
    projectId: null,
    sowNumber: null,
    spanideaVendorNo: '',
    poNumber: '',
    shipTo: '',
    billTo: '',
    totalAmount: '',
    activationDate: '',
    expiryDate: '',
  });

  const validate = (values) => {
    const errors = {};
    if (!values.poNumber) {
      errors.poNumber = 'error';
    }
    if (!values.clientId) {
      errors.clientId = 'error';
    }
    if (!values.projectId) {
      errors.projectId = 'error';
    }
    if (checked) {
      if (!values.sowNumber) {
        errors.sowNumber = 'error';
      }
    }
    if (!values.spanideaVendorNo) {
      errors.spanideaVendorNo = 'error';
    }
    if (!values.poNumber) {
      errors.poNumber = 'error';
    }
    if (!values.shipTo) {
      errors.shipTo = 'error';
    }
    if (!values.billTo) {
      errors.billTo = 'error';
    }
    if (!values.totalAmount) {
      errors.totalAmount = 'error';
    }
    if (JSON.stringify(errors) !== '{}') {
      setApprovalLoadings(false);
    }
    return errors;
  };

  useEffect(() => {
    formRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

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

  const onClientChange = (value) => {
    console.log(`selected ${value}`);
  };

  const onSearch = (value) => {
    console.log('search:', value);
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
          cStatusId: payloadStatus,
          seId: Number(values.seId),
          clientId: values.clientId,
          projectId: values.projectId,
          sowNumber: String(values.sowNumber),
          poNumber: values.poNumber,
          spanideaVendorNo: String(values.spanideaVendorNo),
          contractTypeId: 3,
          shipTo: values.shipTo,
          billTo: values.billTo,
          totalAmount: selectedCurrency + values.totalAmount,
          createdBy: decodedToken.employeeNo,
        };

        if (values.activationDate && values.expiryDate) {
          obj.activationDate = values.activationDate;
          obj.expiryDate = values.expiryDate;
        }

        if (FileDoc && FileDoc.originFileObj) {
          formdata.append('file', FileDoc.originFileObj);
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
              approvalLoadings
                ? setApprovalLoadings(false)
                : setLoadings(false);
            })
            .catch((err) => {
              console.log(err);
              openNotificationWithIcon('error', err.response.data.message);
              approvalLoadings
                ? setApprovalLoadings(false)
                : setLoadings(false);
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
                openNotificationWithIcon(res.status, res.message);
              }
              approvalLoadings
                ? setApprovalLoadings(false)
                : setLoadings(false);
            })
            .catch((err) => {
              console.log(err);
              openNotificationWithIcon('error', err.response.data.message);
              approvalLoadings
                ? setApprovalLoadings(false)
                : setLoadings(false);
            });
        }
      } catch (error) {
        console.error('API Error:', error);
      }
    },
  });

  const receiveFileData = (data) => {
    const file = data[0];
    setFileDoc(file);
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

      setApprovalLoadings(true);
      const formdata = new FormData();

      const obj = {
        seId: Number(formik.values.seId),
        clientId: formik.values.clientId,
        projectId: formik.values.projectId,
        sowNumber: String(formik.values.sowNumber),
        poNumber: formik.values.poNumber,
        spanideaVendorNo: String(formik.values.spanideaVendorNo),
        contractTypeId: 3,
        shipTo: formik.values.shipTo,
        billTo: formik.values.billTo,
        totalAmount: selectedCurrency + formik.values.totalAmount,
        cStatusId: 2,
        createdBy: decodedToken.employeeNo,
      };

      if (formik.values.activationDate && formik.values.expiryDate) {
        obj.expiryDate = formik.values.expiryDate;
        obj.activationDate = formik.values.activationDate;
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
          setFileDoc('');
          setApprovalLoadings(false);
        })
        .catch((err) => {
          console.log(err);
          openNotificationWithIcon('error', 'Error in Sending Approval.');
          setApprovalLoadings(false);
        });
    }
    if (!formik.values.fileName || formik.values.fileName.length === 0) {
      setUploadError(true);
      return;
    }
  };

  const handlePrimaryButtonClick = () => {
    if (!formik.values.fileName || formik.values.fileName.length === 0) {
      setUploadError(true);
      return;
    }
  };

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
      style: {
        padding: '9px 24px',
      },
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

  const handleChecked = (e) => {
    setChecked(e.target.checked);
    if (!e.target.checked) {
      formik.setFieldValue('sowNumber', 'null');
    } else {
      formik.setFieldValue('sowNumber', '');
    }
  };

  const handleSelectSow = (val) => {
    formik.setFieldValue('sowNumber', val);
    if (val !== 'null') {
      setChecked(true);
    }
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
    setChecked(formik?.values?.sowNumber !== 'null');
  }, [formik?.values?.sowNumber]);

  function convertDate(dateString) {
    var parts = dateString.split('/');
    var newDateString = parts[2] + '/' + parts[1] + '/' + parts[0];
    return newDateString;
  }

  useEffect(() => {
    if (clientId) {
      contracts
        .getContractsData(clientId)
        .then((res) => {
          const data = res.data[0];
          const str = data?.contractData?.totalAmount;
          const match = str.match(/^(\D+)(\d+)$/);

          if (match) {
            const symbol = match[1];
            setSelectedCurrency(symbol);
            const totalAmount = match ? parseInt(match[2]) : '';

            let obj = {
              seId: Number(data?.contractData?.seId),
              clientId: data?.contractData?.client?.clientId,
              projectId: data?.contractData?.project?.projectId,
              sowNumber: data?.contractData?.sowNumber,
              spanideaVendorNo: data?.contractData?.spanideaVendorNo,
              poNumber: data?.contractData?.poNumber,
              shipTo: data?.contractData?.shipTo,
              billTo: data?.contractData?.billTo,
              totalAmount: totalAmount ? totalAmount : '',
              activationDate: convertDate(data?.contractData?.activationDate),
              expiryDate: data?.contractData?.expiryDate
                ? convertDate(data?.contractData?.expiryDate)
                : '',
              fileName: data?.contractData?.fileName,
              fileUrl: data?.contractData?.fileUrl,
            };
            formik.setValues({ ...obj });
            setFileDoc(data?.contractData?.fileName);
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
    window.scrollTo(0, 0);
  }, [clearForm]);

  return (
    <>
      <form ref={formRef} onSubmit={formik.handleSubmit}>
        <div className="popupDiv" style={{ height: '60vh', overflow: 'auto' }}>
          {/* <Flex vertical gap="" style={{}}> */}
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
                  formik.setFieldValue('clientId', val);
                  handleClientIdChange(val);
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
            <Flex horizontal gap="" style={{ justifyContent: 'space-between' }}>
              <span>Select SOW</span>
              <span>
                Is sow required{' '}
                <Checkbox
                  value={formik?.values?.sowNumber}
                  checked={checked}
                  onChange={(e) => handleChecked(e)}
                ></Checkbox>
              </span>
            </Flex>
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
                onChange={(val) => handleSelectSow(val)}
                options={sowDataDropDown.map((sowData, index) => ({
                  key: index,
                  value: sowData.sowNumber,
                  label: sowData.sowNumber,
                }))}
                disabled={!checked}
              />
            </Form.Item>
          </Flex>

          <Flex vertical gap="" style={{ width: '100%' }}>
            <span>
              PO Number
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.poNumber && formik.touched.poNumber ? 'error' : ''
              }
            >
              <Input
                type="text"
                name="poNumber"
                value={formik.values.poNumber}
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
                placeholder="PO Number (Alphanumeric)"
                // onBlur={formik.handleBlur}
              />
            </Form.Item>
          </Flex>

          <Flex vertical gap="">
            <span>
              Spanidea Vendor No.
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.spanideaVendorNo &&
                formik.touched.spanideaVendorNo
                  ? 'error'
                  : null
              }
            >
              <Input
                type="text"
                size="large"
                name="spanideaVendorNo"
                placeholder="Spanidea Vendor No. (Alphanumeric)"
                onChange={(e) => {
                  const { name, value } = e.target;
                  const filteredValue = value.replace(/[^\w\s]/gi, '');
                  formik.handleChange({
                    target: {
                      name,
                      value: filteredValue,
                    },
                  });
                  formik.setFieldValue(name, filteredValue.toUpperCase());
                }}
                value={formik?.values?.spanideaVendorNo}
                // onBlur={formik.handleBlur}
              />
            </Form.Item>
          </Flex>

          <Flex vertical style={{ width: '100%' }}>
            <span>
              Shipping Address
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              style={{ width: '100%' }}
              validateStatus={
                formik.errors.shipTo && formik.touched.shipTo ? 'error' : ''
              }
            >
              <TextArea
                className="popupDiv"
                style={{ overflow: 'auto' }}
                name="shipTo"
                value={formik.values.shipTo}
                onChange={(e) => {
                  const { value } = e.target;
                  const capitalizedValue = value
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  formik.handleChange(e);
                  formik.setFieldValue('shipTo', capitalizedValue);
                }}
                placeholder="Shipping Address"
                autosize={{ minRows: 2, maxRows: 6 }}
              />
              {/* <Input
                size="large"
                name="shipTo"
                value={formik.values.shipTo}
                onChange={(e) => {
                  const { value } = e.target;
                  const capitalizedValue = value
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  formik.handleChange(e);
                  formik.setFieldValue('shipTo', capitalizedValue);
                }}
                placeholder="Shipping Address"
              /> */}
            </Form.Item>
          </Flex>

          <Flex vertical style={{ width: '100%' }}>
            <span>
              Billing Address
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              style={{ width: '100%' }}
              validateStatus={
                formik.errors.billTo && formik.touched.billTo ? 'error' : ''
              }
            >
              <TextArea
                className="popupDiv"
                style={{ overflow: 'auto' }}
                placeholder="Billing Address"
                autosize={{ minRows: 2, maxRows: 6 }}
                name="billTo"
                value={formik.values.billTo}
                onChange={(e) => {
                  const { value } = e.target;
                  const capitalizedValue = value
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  formik.handleChange(e);
                  formik.setFieldValue('billTo', capitalizedValue);
                }}
              />
              {/* <Input
                size="large"
                name="billTo"
                value={formik.values.billTo}
                onChange={(e) => {
                  const { value } = e.target;
                  const capitalizedValue = value
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  formik.handleChange(e);
                  formik.setFieldValue('billTo', capitalizedValue);
                }}
                placeholder="Billing Address"
              /> */}
            </Form.Item>
          </Flex>

          <Flex vertical gap="">
            <span>
              PO Amount
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
                uploadDocument={'PO'}
                receiveFileData={receiveFileData}
                error={uploadError}
                resetUpload={resetUpload}
                fileValue={FileDoc?.name ? FileDoc.name : FileDoc}
                fileUrl={formik.values.fileUrl}
                setUploadError={setUploadError}
              />
            </Form.Item>
          </Flex>
        </div>
        <Flex
          justify="end"
          gap={'10px'}
          style={{ paddingRight: '24px', paddingTop: '18px' }}
        >
          <Button
            type="primary"
            htmlType="submit"
            onClick={handlePrimaryButtonClick}
            loading={loadings}
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
      </form>
    </>
  );
};

export default PoPopup;
