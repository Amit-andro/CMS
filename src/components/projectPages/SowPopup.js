import React, { useEffect, useState } from 'react';
import {
  Button,
  Flex,
  Input,
  Select,
  DatePicker,
  Form,
  Radio,
  notification,
  Space,
} from 'antd';
import './styles.css';
import { clientsApi, contracts } from '../api';
import { useFormik } from 'formik';
import { handelDate } from '../other/usefulFunctions';
import {
  PlusOutlined,
  DeleteOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import UploadDocument from '../other/UploadDocument';
import { values } from '@ant-design/plots/es/core/utils';
import decodedToken from '../../DecodedToken.utils';
import GetRole from '../../GetRole.utils';

const { RangePicker } = DatePicker;

const SowPopup = ({
  hide,
  buttonText,
  clientId,
  SaveisModalOpen,
  status,
  clearForm,
  legalEntityName,
  projectName,
  legalEntityId,
  projectId,
  apiHit,
}) => {
  const [search, setSearch] = useState('');
  const [ndaDates, setNdaDates] = useState([]);
  const [datesState, setDatesState] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [suggestedInvoiceDate, setSuggestedInvoiceDate] = useState(
    dayjs(new Date()).format('YYYY/MM/DD')
  );
  const [showFields, setShowFields] = useState(true);
  const [pocDataDropDown, setPocDataDropDown] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [payloadStatus, setPayloadStatus] = useState(1);
  const [clientNameList, setClientNameList] = useState([]);
  const [projectData, setprojectData] = useState([]);
  const [authorizerData, setAuthorizerData] = useState([]);
  const [milestoneDetails, setMilestoneDetails] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [uploadError, setUploadError] = useState(false);
  const [FileDoc, setFileDoc] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('₹');
  const [resetUpload, setResetUpload] = useState(false);
  const [initialValues, setInitialValues] = useState({
    seId: 1,
    clientId: null,
    projectId: null,
    sowNumber: '',
    activationDate: '',
    expiryDate: '',
    clientAuthorizerName: '',
    clientAuthorizerEmail: '',
    clientAuthorizerMobile: '',
    spanideaAuthorizer: null,
    pocName: '',
    pocEmail: '',
    pocNumber: '',
    paymentTerm: null,
    otherPaymentTerm: '',
    leavesTerm: 'Monthly',
    leavesAllowed: '',
    totalAmount: '',
    paymentType: 'T&M',
    invoiceTenure: 'Monthly',
    suggestedInvoiceDate: '',
    milestones: [],
    milestoneName: '',
    milestonePercentage: '',
    milestoneDate: '',
  });
  const [loadings, setLoadings] = useState(false);
  const [approvalLoadings, setApprovalLoadings] = useState(false);

  const hasMilestoneDetails = milestoneDetails.length > 0;

  function convertDate(dateString) {
    var parts = dateString.split('/');
    var newDateString = parts[2] + '/' + parts[1] + '/' + parts[0];
    return newDateString;
  }

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
    if (!values.activationDate) {
      errors.activationDate = 'error';
    }
    if (!values.expiryDate) {
      errors.expiryDate = 'error';
    }
    if (!values.clientAuthorizerName) {
      errors.clientAuthorizerName = 'error';
    }
    if (!values.clientAuthorizerEmail) {
      errors.clientAuthorizerEmail = 'error';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.clientAuthorizerEmail)
    ) {
      errors.clientAuthorizerEmail = 'error';
    }
    if (!values.clientAuthorizerMobile) {
      errors.clientAuthorizerMobile = 'error';
    } else if (!/^[0-9]{10}$/.test(values.clientAuthorizerMobile)) {
      errors.clientAuthorizerMobile = 'error';
    }
    if (!values.spanideaAuthorizer) {
      errors.spanideaAuthorizer = 'error';
    }
    if (!values.paymentTerm) {
      errors.paymentTerm = 'error';
    }
    if (formik.values.paymentTerm === 'other') {
      if (!values.otherPaymentTerm) {
        errors.otherPaymentTerm = 'error';
      }
    }
    if (!values.leavesTerm) {
      errors.leavesTerm = 'error';
    }
    if (!values.leavesAllowed) {
      errors.leavesAllowed = 'error';
    } else if (!/^[1-9][0-9]*$/.test(values.leavesAllowed)) {
      errors.leavesAllowed = 'error';
    }
    if (formik.values.paymentType === 'T&M' && !formik.values.invoiceTenure) {
      errors.invoiceTenure = 'error';
    }

    if (
      formik.values.paymentType === 'Milestones' &&
      !formik.values.totalAmount
    ) {
      errors.totalAmount = 'error';
    }
    if (formik.values.paymentType === 'Milestones' && !hasMilestoneDetails) {
      if (!formik.values.milestoneName) {
        errors.milestoneName = 'error';
      }
      if (!formik.values.milestoneDate) {
        errors.milestoneDate = 'error';
      }
      if (!formik.values.milestonePercentage) {
        errors.milestonePercentage = 'error';
      } else if (
        parseInt(formik.values.milestonePercentage) <= 0 ||
        parseInt(formik.values.milestonePercentage) > 100
      ) {
        errors.milestonePercentage = 'error';
      }
    }

    if (pocDataDropDown.length > 0) {
      if (!values.pocName) errors.pocName = 'POC Name is required';
      if (!values.pocEmail) {
        errors.pocEmail = 'error';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.pocEmail)) {
        errors.pocEmail = 'error';
      }
      if (!values.pocNumber) {
        errors.pocNumber = 'error';
      } else if (!/^[0-9]{10}$/.test(values.pocNumber)) {
        errors.pocNumber = 'error';
      }
    }

    if (pocDataDropDown.length === 0) {
      if (!values.pocName) errors.pocName = 'POC Name is required';
      if (!values.pocEmail) {
        errors.pocEmail = 'error';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.pocEmail)) {
        errors.pocEmail = 'error';
      }
      if (!values.pocNumber) {
        errors.pocNumber = 'error';
      } else if (!/^[0-9]{10}$/.test(values.pocNumber)) {
        errors.pocNumber = 'error';
      }
    }

    if (JSON.stringify(errors) !== '{}') {
      setApprovalLoadings(false);
    }
    return errors;
  };

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
      style: {
        padding: '9px 24px',
      },
    });
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validate,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formdata = new FormData();

        if (!FileDoc) {
          setUploadError(true);
          return;
        } else {
          setUploadError(false);
        }

        const milestoneData = {
          milestoneName: formik.values.milestones,
          milestonePercentage: formik.values.milestonePercentage,
          milestoneDate: formik.values.milestones,
        };

        if (values.paymentType === 'Milestones') {
          let totalPercentage = 0;
          for (let i = 0; i < milestoneDetails.length; i++) {
            totalPercentage += parseInt(
              milestoneDetails[i].milestonePercentage,
              10
            );
          }

          if (totalPercentage < 100) {
            openNotificationWithIcon('error', 'Total percentage must be 100%.');
            return;
          }
        }

        if (selectedOption === null) {
          throw new Error('Please select a point of contact.');
        }

        const obj = {
          seId: Number(values.seId),
          clientId: values.clientId,
          contractTypeId: 2,
          cStatusId: payloadStatus,
          projectId: values.projectId,
          sowNumber: String(values.sowNumber),
          activationDate: values.activationDate,
          expiryDate: values.expiryDate,
          clientAuthorizerName: values.clientAuthorizerName,
          clientAuthorizerEmail: values.clientAuthorizerEmail,
          clientAuthorizerMobile: String(values.clientAuthorizerMobile),
          spanideaAuthorizerEmpCode: values.spanideaAuthorizer,
          pocName: pocDataDropDown[selectedOption].pocName,
          pocEmail: pocDataDropDown[selectedOption].pocEmail,
          pocNumber: pocDataDropDown[selectedOption].pocNumber,
          paymentTerm: values.paymentTerm,
          leavesAllowed: values.leavesAllowed,
          leavesTerm: values.leavesTerm,
          tentativeInvoiceDate: suggestedInvoiceDate,
          paymentType: String(values.paymentType),
          createdBy: decodedToken.employeeNo,
        };

        if (values.paymentType === 'T&M') {
          obj.invoiceTenure = values.invoiceTenure;
        }

        if (values.paymentType === 'T&M') {
          obj.tentativeInvoiceDate = suggestedInvoiceDate;
        }

        if (values.paymentType === 'Milestones') {
          obj.milestone =
            milestoneDetails.length > 0 ? milestoneDetails : [milestoneData];
        }

        if (values.paymentType === 'Milestones') {
          obj.totalAmount = selectedCurrency + values.totalAmount;
        }

        if (values.paymentTerm === 'other') {
          const numericValue = parseInt(values.paymentTerm.split(' ')[1]);
          if (paymentermFilterArr.includes(values.paymentTerm)) {
            obj.paymentTerm = numericValue;
          }
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
              openNotificationWithIcon('success', res?.message);
              approvalLoadings
                ? setApprovalLoadings(false)
                : setLoadings(false);
            })
            .catch((err) => {
              console.error(err);
              openNotificationWithIcon('error', err?.response?.data?.message);
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
                setPocDataDropDown('');
                openNotificationWithIcon(res.status, res.message);
              }
              approvalLoadings
                ? setApprovalLoadings(false)
                : setLoadings(false);
            })
            .catch((err) => {
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

  const handleSubmit = () => {
    setSubmitClicked(true);
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

      const milestoneData = {
        milestoneName: formik.values.milestones,
        milestonePercentage: formik.values.milestonePercentage,
        milestoneDate: formik.values.milestones,
      };

      if (values.paymentType === 'Milestones') {
        let totalPercentage = 0;
        for (let i = 0; i < milestoneDetails.length; i++) {
          totalPercentage += parseInt(
            milestoneDetails[i].milestonePercentage,
            10
          );
        }

        if (totalPercentage < 100) {
          openNotificationWithIcon('error', 'Total percentage must be 100%.');
          return;
        }
      }

      const obj = {
        seId: Number(formik.values.seId),
        clientId: formik.values.clientId,
        contractTypeId: 2,
        projectId: formik.values.projectId,
        sowNumber: String(formik.values.sowNumber),
        activationDate: formik.values.activationDate,
        expiryDate: formik.values.expiryDate,
        clientAuthorizerName: formik.values.clientAuthorizerName,
        clientAuthorizerEmail: formik.values.clientAuthorizerEmail,
        clientAuthorizerMobile: String(formik.values.clientAuthorizerMobile),
        spanideaAuthorizerEmpCode: formik.values.spanideaAuthorizer,
        pocName: pocDataDropDown[selectedOption].pocName,
        pocEmail: pocDataDropDown[selectedOption].pocEmail,
        pocNumber: pocDataDropDown[selectedOption].pocNumber,
        paymentTerm: parseInt(formik.values.paymentTerm),
        leavesAllowed: formik.values.leavesAllowed,
        leavesTerm: formik.values.leavesTerm,
        paymentType: String(formik.values.paymentType),
        cStatusId: 2,
        createdBy: decodedToken.employeeNo,
      };

      if (formik.values.paymentType === 'T&M') {
        obj.invoiceTenure = formik.values.invoiceTenure;
      }

      if (formik.values.paymentType === 'T&M') {
        obj.tentativeInvoiceDate = suggestedInvoiceDate;
      }

      if (formik.values.paymentType === 'Milestones') {
        obj.milestone =
          milestoneDetails.length > 0 ? milestoneDetails : [milestoneData];
      }

      if (formik.values.paymentTerm === 'other') {
        const numericValue = parseInt(formik.values.paymentTerm.split(' ')[1]);
        if (paymentermFilterArr.includes(formik.values.paymentTerm)) {
          obj.paymentTerm = numericValue;
        }
      }

      if (formik.values.paymentType === 'Milestones') {
        obj.totalAmount = selectedCurrency + formik.values.totalAmount;
      }

      if (FileDoc && FileDoc.originFileObj) {
        formdata.append('file', FileDoc.originFileObj);
      }

      formdata.append('obj', JSON.stringify(obj));

      setApprovalLoadings(true);
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
    if (!formik.values.fileName || formik.values.fileName.length === 0) {
      setUploadError(true);
      return;
    }
  };

  const onclientIdSearch = (value) => {
    setSearch(value);
    console.log('search:', value);
  };

  const onClientChange = (value) => {
    console.log(`selected ${value}`);
  };

  const onSearch = (value) => {
    console.log('search:', value);
  };

  const onSpanideaAuthorizorSearch = (value) => {
    console.log('search:', value);
  };

  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const resetMilestoneFields = () => {
    formik.setFieldValue('milestoneName', '');
    formik.setFieldValue('milestonePercentage', '');
    formik.setFieldValue('milestoneDate', null);
  };

  const handleMilestoneDetails = () => {
    const { milestoneName, milestonePercentage, milestoneDate } = formik.values;

    if (milestoneName && milestonePercentage && milestoneDate) {
      const milestoneData = {
        milestoneName: milestoneName.trim(),
        milestonePercentage: milestonePercentage,
        milestoneDate: milestoneDate,
      };

      const totalPercentage = milestoneDetails.reduce(
        (acc, curr) => acc + parseInt(curr.milestonePercentage, 10),
        0
      );

      const newTotalPercentage =
        totalPercentage + parseInt(milestoneData.milestonePercentage, 10);

      if (newTotalPercentage > 100) {
        openNotificationWithIcon('error', 'Total percentage exceeds 100%.');
        return;
      }

      const existingMilestone = milestoneDetails.find(
        (milestone) => milestone.milestoneName === milestoneData.milestoneName
      );

      if (!existingMilestone) {
        const updatedMilestoneDetails = [...milestoneDetails, milestoneData];
        setMilestoneDetails(updatedMilestoneDetails);

        const updatedTotalPercentage = milestoneDetails.reduce(
          (acc, curr) => acc + parseInt(curr.milestonePercentage, 10),
          milestoneData.milestonePercentage
        );

        if (updatedTotalPercentage < 100) {
          openNotificationWithIcon(
            'error',
            'Total percentage is less than 100%.'
          );
          return;
        }
      } else {
        openNotificationWithIcon('error', 'Milestone already exists.');
      }
      resetMilestoneFields();
    } else {
      formik.setTouched({
        milestoneName: true,
        milestonePercentage: true,
        milestoneDate: true,
      });
      formik.validateForm();
    }
  };

  const handleMilestoneDelete = (index) => {
    setMilestoneDetails((prev) => prev.filter((_, i) => i !== index));
    if (editIndex === index) setEditIndex(null);
  };

  const handleMilestoneChange = (e, index, field) => {
    const updatedMilestoneDetails = [...milestoneDetails];
    const oldValue = parseInt(updatedMilestoneDetails[index][field]);
    const newValue = parseInt(e.target.value);
    const difference = newValue - oldValue;

    updatedMilestoneDetails[index] = {
      ...updatedMilestoneDetails[index],
      [field]: e.target.value,
    };

    const totalPercentage = updatedMilestoneDetails.reduce((acc, curr, idx) => {
      if (idx !== index) {
        return acc + parseInt(curr.milestonePercentage);
      }
      return acc + newValue;
    }, 0);

    if (totalPercentage > 100) {
      updatedMilestoneDetails[index][field] = oldValue.toString();
      openNotificationWithIcon('error', 'Total percentage exceeds 100%.');
      console.error('');
    }

    setMilestoneDetails(updatedMilestoneDetails);
  };

  const handlePaymentTypeChange = (value) => {
    if (value === 'Milestones') {
      formik.setFieldValue('invoiceTenure', null);
      formik.setFieldValue('suggestedInvoiceDate', null);
    } else {
      setMilestoneDetails([]);
      formik.setFieldValue('milestoneName', '');
      formik.setFieldValue('milestonePercentage', '');
      formik.setFieldValue('milestoneDate', null);
    }
    formik.setFieldValue('paymentType', value);
  };

  const receiveFileData = (data) => {
    const file = data[0];
    setFileDoc(file);
  };

  const handleSeIdChange = (value) => {
    if (value === 0) {
      formik.setFieldValue('clientId', null);
      formik.setFieldValue('projectId', null);
      setPocDataDropDown([]);
    } else {
      formik.setFieldValue('clientId', null);
      formik.setFieldValue('projectId', null);
      setPocDataDropDown([]);
    }
    formik.setFieldValue('seId', value);
  };

  const handleClientIdChange = (value) => {
    if (formik.values.clientId) {
      formik.setFieldValue('projectId', null);
      formik.setFieldValue('pocName', null);
      formik.setFieldValue('pocEmail', null);
      formik.setFieldValue('pocNumber', null);
    } else {
      formik.setFieldValue('projectId', null);
      formik.setFieldValue('pocName', null);
      formik.setFieldValue('pocEmail', null);
      formik.setFieldValue('pocNumber', null);
    }
    formik.setFieldValue('clientId', value);
  };

  const handlePocChange = (value, index, field) => {
    setPocDataDropDown((prevPocDetails) =>
      prevPocDetails.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
    const fieldName = `poc[${index}].${field}`;
    formik.setFieldTouched(fieldName, true);
  };

  const resetPocForm = () => {
    formik.setValues({
      ...formik.values,
      pocName: '',
      pocEmail: '',
      pocNumber: '',
    });
  };

  const handlePocDetails = (event) => {
    const { pocName, pocEmail, pocNumber } = formik.values;
    const areAllFieldsFilled = pocName && pocEmail && pocNumber;

    if (!areAllFieldsFilled) {
      const filledFields = ['pocName', 'pocEmail', 'pocNumber'];
      const emptyFields = filledFields.filter((field) => !formik.values[field]);
      emptyFields.forEach((field) => {
        formik.setFieldError(field, 'This field is required.');
        formik.setFieldTouched(field, true);
      });
    } else if (areAllFieldsFilled) {
      if (
        pocName !== '' &&
        pocEmail !== '' &&
        pocNumber !== '' &&
        String(pocNumber).length <= 10 &&
        /\S+@\S+\.\S+/.test(pocEmail)
      ) {
        const obj = {
          pocName: pocName,
          pocEmail: pocEmail,
          pocNumber: String(pocNumber),
        };
        const isDuplicate = pocDataDropDown.some(
          (item) =>
            item.pocName === obj.pocName &&
            item.pocEmail === obj.pocEmail &&
            item.pocNumber === obj.pocNumber
        );
        if (!isDuplicate) {
          setPocDataDropDown((prev) => [...prev, obj]);
          resetPocForm();
        }
      } else {
        if (!formik.values.pocName) {
          formik.setFieldError('pocName', '');
        }
        if (
          !formik.values.pocEmail ||
          !/\S+@\S+\.\S+/.test(formik.values.pocEmail)
        ) {
          formik.setFieldError(
            'pocEmail',
            'Please enter a valid email address.'
          );
        }
        if (!formik.values.pocNumber || formik.values.pocNumber.length > 10) {
          formik.setFieldError(
            'pocNumber',
            'Please enter a valid mobile number with a maximum of 10 digits.'
          );
        }
        formik.setTouched({
          ...formik.touched,
          pocName: true,
          pocEmail: true,
          pocNumber: true,
        });
      }
    }
    event.preventDefault();
    setSelectedOption(pocDataDropDown.length);
  };

  const handlePocSelect = (e) => {
    setSelectedOption(e.target.value);
    const selectedPocData = pocDataDropDown[e.target.value];
    formik.setValues({ ...formik.values, selectedPocData });
    //   console.log("index", e.target.value);
    // console.log("selectedPocData", selectedPocData);
  };

  const handleToggleFields = () => {
    const { pocName, pocEmail, pocNumber } = formik.values;
    if (!pocName || !pocEmail || !pocNumber) {
      return;
    } else if (!pocName || !pocEmail || !pocNumber || pocDataDropDown > 1) {
      return;
    } else {
      setShowFields(!showFields);
    }
  };

  function convertDateFormat(dateString) {
    const parts = dateString.split('/');
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    const convertedDate = `${year}/${month}/${day}`;
    return convertedDate;
  }

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

  const handlePrimaryButtonClick = () => {
    if (!formik.values.fileName || formik.values.fileName.length === 0) {
      setUploadError(true);
      return;
    }
    if (!FileDoc) {
      return;
    }
  };

  useEffect(() => {
    const getPocId = legalEntityName ? legalEntityId : formik.values.clientId;
    if (getPocId) {
      contracts
        .getpocDropDown(getPocId)
        .then((res) => {
          setPocDataDropDown(res?.data?.pocList);
          setSuggestedInvoiceDate(convertDate(res?.data?.suggestedInvoiceDate));
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [formik.values.clientId]);

  useEffect(() => {
    if (selectedOption && selectedOption.value !== 'other') {
      formik.setValues({
        ...formik.values,
        pocEmail: selectedOption.pocEmail,
        pocNumber: selectedOption.pocNumber,
      });
    } else {
      formik.setValues({
        ...formik.values,
        pocEmail: '',
        pocNumber: '',
      });
    }
  }, [selectedOption]);

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
          const match = str?.match(/^(\D+)(\d+)$/);

          let obj = {
            seId: Number(data?.contractData?.seId),
            clientId: data?.contractData?.client?.clientId,
            projectId: data?.contractData?.project?.projectId,
            sowNumber: data?.contractData?.sowNumber,
            activationDate: convertDate(data?.contractData?.activationDate),
            expiryDate: data?.contractData?.expiryDate
              ? convertDate(data?.contractData?.expiryDate)
              : '',
            clientAuthorizerName: data?.contractData?.clientAuthorizer.name,
            clientAuthorizerEmail: data?.contractData?.clientAuthorizer.email,
            clientAuthorizerMobile: data?.contractData?.clientAuthorizer.number,
            spanideaAuthorizer:
              data?.contractData?.spanideaAuthorizerEmpName?.empCode,
            pocName: data?.contractData?.pocDetail.name,
            pocEmail: data?.contractData?.pocDetail.email,
            pocNumber: data?.contractData?.pocDetail.number,
            paymentTerm: data?.contractData?.paymentTerm,
            leavesTerm: data?.contractData?.leavesTerm,
            leavesAllowed: data?.contractData?.leavesAllowed,
            paymentType: data?.contractData?.paymentType,
            invoiceTenure: data?.contractData?.invoiceTenure,
            suggestedInvoiceDate: data?.contractData?.tentativeInvoiceDate,
            fileName: data?.contractData?.fileName,
            milestone: data?.contractData?.milestone?.map((milestone) => ({
              milestoneName: milestone.milestoneName,
              milestonePercentage: milestone.milestonePercentage,
              milestoneDate: convertDate(milestone.milestoneDate),
            })),
          };

          if (match) {
            const symbol = match[1];
            setSelectedCurrency(symbol);
            const totalAmount = parseInt(match[2]);
            obj = { ...obj, totalAmount };
          } else {
            console.log('Invalid string format.');
          }

          const selectedOptionIndex = pocDataDropDown.findIndex((obj) => {
            return obj.pocEmail === data?.contractData?.pocDetail.email;
          });
          console.log('objselectedOptionIndexect', selectedOptionIndex);

          setSelectedOption(
            selectedOptionIndex == -1
              ? pocDataDropDown.length
              : selectedOptionIndex
          );

          setInitialValues({ ...obj });
          setFileDoc(data?.contractData?.fileName);
          console.log('obj of selected option', obj);
          formik.setValues(obj);

          setMilestoneDetails([...obj.milestone]);
          formik.validateForm().then(() => {
            console.log('Validation triggered');
          });
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [clientId, apiHit, pocDataDropDown]);

  useEffect(() => {
    const getclientId = formik.values.clientId;
    if (getclientId) {
      contracts
        .getProjectDropDown(getclientId)
        .then((res) => {
          setprojectData(res.data);
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [formik.values.clientId]);

  useEffect(() => {
    clientsApi
      .getEmployeeName()
      .then((res) => {
        setAuthorizerData(res.data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

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
    setSubmitClicked(false);
    setMilestoneDetails([]);
    setPocDataDropDown([]);
  }, [clearForm]);

  const paymentermFilterArr = [
    'Net 30 Days',
    'Net 45 Days',
    'Net 60 Days',
    'Net 90 Days',
    '30',
    '45',
    '60',
    '90',
    30,
    45,
    60,
    90,
    null,
  ];

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
              <span style={{ color: 'red', fontSize: '15px' }}>*</span>
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
                value={formik.values.clientId}
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
              {/* )} */}
            </Form.Item>
          </Flex>
          <Flex vertical gap="" style={{}}>
            <span>
              Project Name
              <span style={{ color: 'red', fontSize: '15px' }}>*</span>
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
                onChange={(e) => formik.setFieldValue('projectId', e)}
                options={projectData.map((projectData, index) => ({
                  key: index,
                  value: projectData.projectId,
                  label: projectData.projectName,
                }))}
              />
              {/* )} */}
            </Form.Item>
          </Flex>
          <Flex vertical gap="" style={{ width: '100%' }}>
            <span>
              SOW Number
              <span style={{ color: 'red', fontSize: '15px' }}>*</span>
            </span>
            <Form.Item
              validateStatus={
                formik.errors.sowNumber && formik.touched.sowNumber
                  ? 'error'
                  : ''
              }
            >
              <Input
                type="text"
                name="sowNumber"
                min={0}
                value={formik?.values?.sowNumber}
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
                placeholder="SOW Number (Alphanumeric)"
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

          <Flex vertical gap="">
            <span>
              Client Signatory
              <span style={{ color: 'red', fontSize: '15px' }}>*</span>
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
                  type="email"
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
                  onChange={formik.handleChange}
                  placeholder="Mobile"
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
          </Flex>
          <Flex vertical gap="" style={{}}>
            <span>
              Spanidea Signatory
              <span style={{ color: 'red', fontSize: '15px' }}>*</span>
            </span>
            <Form.Item
              validateStatus={
                formik.errors.spanideaAuthorizer &&
                formik.touched.spanideaAuthorizer
                  ? 'error'
                  : null
              }
            >
              <Select
                showSearch
                name="spanideaAuthorizerEmpCode"
                placeholder="Spanidea Signatory"
                size="large"
                optionFilterProp="children"
                onSearch={onSpanideaAuthorizorSearch}
                filterOption={filterOption}
                style={{ width: '100%' }}
                value={formik?.values?.spanideaAuthorizer}
                onChange={(e) => formik.setFieldValue('spanideaAuthorizer', e)}
                options={authorizerData.map((authorizer, index) => ({
                  key: index,
                  value: authorizer.empCode,
                  label: authorizer.name,
                }))}
              />
            </Form.Item>
          </Flex>
          <Flex
            vertical
            style={{
              padding: '15px',
              marginLeft: '2px',
              boxShadow:
                submitClicked && selectedOption == null
                  ? 'rgba(255, 0, 0, 0.5) 0px 0px 0px 1px'
                  : 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
            }}
          >
            <span>
              Client Point of Contact
              <span style={{ color: 'red', fontSize: '15px' }}>*</span>
            </span>

            {pocDataDropDown?.length >= 1 ? (
              <>
                <Radio.Group
                  style={{
                    width: '100%',
                    paddingTop: pocDataDropDown?.length > 0 ? '10px' : '',
                  }}
                  onChange={handlePocSelect}
                  value={selectedOption}
                >
                  <Flex vertical gap="10px">
                    {pocDataDropDown?.map((pocDetail, index) => (
                      <Flex
                        vertical
                        gap="10px"
                        style={{
                          padding: '15px',
                          marginLeft: '2px',
                          boxShadow:
                            'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
                        }}
                        key={index}
                      >
                        <Radio
                          key={index}
                          value={index}
                          style={{ width: '100%' }}
                          // onChange={() => handlePocSelect(index)}
                        >
                          <Space direction="vertical">
                            <Flex
                              horizontal
                              gap="10px"
                              style={{ width: '100%' }}
                            >
                              <Input
                                disabled={pocDetail.hasOwnProperty('pocType')}
                                size="large"
                                value={pocDetail.pocName}
                                placeholder="Name"
                                onChange={(e) =>
                                  handlePocChange(
                                    e.target.value,
                                    index,
                                    'pocName'
                                  )
                                }
                              />
                              <Input
                                disabled={pocDetail.hasOwnProperty('pocType')}
                                type="email"
                                value={pocDetail.pocEmail}
                                size="large"
                                placeholder="Email"
                                onChange={(e) =>
                                  handlePocChange(
                                    e.target.value,
                                    index,
                                    'pocEmail'
                                  )
                                }
                              />
                              <Input
                                disabled={pocDetail.hasOwnProperty('pocType')}
                                type="text"
                                value={pocDetail.pocNumber}
                                size="large"
                                placeholder="Mobile No."
                                onChange={(e) =>
                                  handlePocChange(
                                    parseInt(e.target.value) >= 0
                                      ? e.target.value
                                      : '',
                                    index,
                                    'pocNumber'
                                  )
                                }
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
                            </Flex>
                          </Space>
                        </Radio>
                      </Flex>
                    ))}
                  </Flex>
                </Radio.Group>
              </>
            ) : (
              <></>
            )}
            {showFields && (
              <Flex vertical gap="" style={{ marginTop: '10px' }}>
                <Flex gap="10px" style={{ width: '100%' }}>
                  <Form.Item
                    style={{ width: '100%' }}
                    validateStatus={
                      formik.errors.pocName && formik.touched.pocName
                        ? 'error'
                        : ''
                    }
                  >
                    <Input
                      size="large"
                      name="pocName"
                      onChange={(e) => {
                        const { name, value } = e.target;
                        const filteredValue = value.replace(/[^\w\s]/gi, '');
                        const capitalizedValue = filteredValue.replace(
                          /\b\w/g,
                          (c) => c.toUpperCase()
                        );
                        formik.handleChange({
                          target: {
                            name,
                            value: capitalizedValue,
                          },
                        });
                        formik.setFieldValue(name, capitalizedValue);
                      }}
                      placeholder="Name"
                    />
                  </Form.Item>
                  <Form.Item
                    style={{ width: '100%' }}
                    validateStatus={
                      formik.errors.pocEmail && formik.touched.pocEmail
                        ? 'error'
                        : ''
                    }
                  >
                    <Input
                      size="large"
                      name="pocEmail"
                      onChange={formik.handleChange}
                      placeholder="Email"
                    />
                  </Form.Item>
                  <Form.Item
                    style={{ width: '100%' }}
                    validateStatus={
                      formik.errors.pocNumber && formik.touched.pocNumber
                        ? 'error'
                        : ''
                    }
                  >
                    <Input
                      size="large"
                      name="pocNumber"
                      type="text"
                      min={0}
                      onChange={formik.handleChange}
                      placeholder="Mobile"
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
                  <Button
                    type="link"
                    size="large"
                    style={{ padding: '0' }}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePocDetails(e);
                      handleToggleFields();
                    }}
                  >
                    <PlusOutlined />
                  </Button>
                </Flex>
              </Flex>
            )}
          </Flex>

          <Flex gap="10px" style={{ width: '100%', marginTop: '20px' }}>
            <Flex vertical style={{ width: '50%' }}>
              <span>
                Payment Term (No. of Days)
                <span style={{ color: 'red', fontSize: '15px' }}>*</span>
              </span>
              <Form.Item
                validateStatus={
                  formik.errors.paymentTerm && formik.touched.paymentTerm
                    ? 'error'
                    : ''
                }
              >
                <Select
                  // style={{ width: '50%' }}
                  size="large"
                  name="paymentTerm"
                  placeholder="Payment Term (No. of Days)"
                  optionFilterProp="children"
                  value={
                    formik.values.paymentTerm
                      ? paymentermFilterArr.includes(formik.values.paymentTerm)
                        ? formik.values.paymentTerm
                        : 'Other'
                      : formik.values.paymentTerm
                  }
                  onChange={(value) => {
                    formik.setFieldValue('paymentTerm', value);
                  }}
                  // onBlur={() => formik.handleBlur('paymentTerm')}
                  options={[
                    {
                      value: 30,
                      label: 'Net 30 Days',
                    },
                    {
                      value: 45,
                      label: 'Net 45 Days',
                    },
                    {
                      value: 60,
                      label: 'Net 60 Days',
                    },
                    {
                      value: 90,
                      label: 'Net 90 Days',
                    },
                    {
                      value: 'other',
                      label: 'Other',
                    },
                  ]}
                />
              </Form.Item>
            </Flex>

            {(formik.values.paymentTerm === 'other' ||
              !paymentermFilterArr.includes(formik.values.paymentTerm)) && (
              <Flex vertical style={{ width: '50%' }}>
                <span>‎</span>
                <Form.Item
                  validateStatus={
                    formik.errors.paymentTerm && formik.touched.paymentTerm
                      ? 'error'
                      : null
                  }
                >
                  <Input
                    size="large"
                    type="number"
                    min={0}
                    max={365}
                    name="paymentTerm"
                    placeholder="Payment Term"
                    onChange={formik.handleChange}
                    value={
                      typeof formik?.values?.paymentTerm == 'number'
                        ? formik?.values?.paymentTerm
                        : formik?.values?.paymentTerm &&
                          Number(formik?.values?.paymentTerm.split(' ')[1])
                    }
                  />
                </Form.Item>
              </Flex>
            )}
          </Flex>

          <Flex justify="center" style={{ width: '100%' }} gap={10}>
            <Flex vertical style={{ width: '100%' }}>
              <span>
                Leave Term
                <span style={{ color: 'red', fontSize: '15px' }}>*</span>
              </span>
              <Form.Item
                style={{ width: '100%' }}
                validateStatus={
                  formik.errors.leavesTerm && formik.touched.leavesTerm
                    ? 'error'
                    : ''
                }
              >
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  name="leavesTerm"
                  placeholder="Leave Term"
                  optionFilterProp="children"
                  defaultValue="Monthly"
                  value={formik.values.leavesTerm}
                  onChange={(value, data) => {
                    formik.setFieldValue('leavesTerm', data.label);
                  }}
                  // onBlur={() => formik.handleBlur('leavesTerm')}
                  options={[
                    {
                      value: '1',
                      label: 'Monthly',
                    },
                    {
                      value: '2',
                      label: 'Quarterly',
                    },
                    {
                      value: '3',
                      label: 'Yearly',
                    },
                  ]}
                />
              </Form.Item>
            </Flex>
            <Flex vertical gap="" style={{ width: '100%' }}>
              <span>
                PTO/Vacation/Leaves Allowed (In Days)
                <span style={{ color: 'red', fontSize: '15px' }}>*</span>
              </span>
              <Form.Item
                style={{ width: '100%' }}
                validateStatus={
                  formik.errors.leavesAllowed && formik.touched.leavesAllowed
                    ? 'error'
                    : ''
                }
              >
                <Input
                  type="text"
                  min={0}
                  name="leavesAllowed"
                  value={formik.values.leavesAllowed}
                  onChange={formik.handleChange}
                  size="large"
                  placeholder="PTO/Vacation/Leaves Allowed (In Days)"
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
          </Flex>
          <div>
            <Flex vertical style={{}}>
              <span>
                Engagement/Project(s)
                <span style={{ color: 'red', fontSize: '15px' }}>*</span>
              </span>
              <Flex justify="center" style={{ marginBottom: '20px' }}>
                <Radio.Group
                  name="paymentType"
                  value={formik?.values?.paymentType}
                  onChange={(e) => handlePaymentTypeChange(e.target.value)}
                  defaultValue={'T&M'}
                  style={{ display: 'flex', width: '100%' }}
                >
                  <Radio.Button
                    value={'T&M'}
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    T&M
                  </Radio.Button>
                  <Radio.Button
                    value={'Milestones'}
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    ODC
                  </Radio.Button>
                </Radio.Group>
              </Flex>
              {formik.values.paymentType === 'T&M' && (
                <Flex justify="center" style={{ width: '100%' }} gap={10}>
                  <Flex vertical style={{ width: '100%' }}>
                    <span>
                      Invoice Tenure
                      <span style={{ color: 'red', fontSize: '15px' }}>*</span>
                    </span>
                    <Form.Item
                      style={{ width: '100%' }}
                      validateStatus={
                        formik.errors.invoiceTenure &&
                        formik.touched.invoiceTenure
                          ? 'error'
                          : ''
                      }
                    >
                      <Select
                        style={{ width: '100%' }}
                        size="large"
                        name="invoiceTenure"
                        placeholder="Invoice Tenure"
                        optionFilterProp="children"
                        defaultValue="Monthly"
                        value={formik?.values?.invoiceTenure}
                        onChange={(value, data) => {
                          formik.setFieldValue('invoiceTenure', data.label);
                        }}
                        // onBlur={() => formik.handleBlur('invoiceTenure')}
                        options={[
                          {
                            value: '1',
                            label: 'Monthly',
                          },
                          {
                            value: '2',
                            label: 'Quarterly',
                          },
                          {
                            value: '3',
                            label: 'Half Yearly',
                          },
                          {
                            value: '4',
                            label: 'Yearly',
                          },
                        ]}
                      />
                    </Form.Item>
                  </Flex>
                  <Flex vertical style={{ width: '100%' }}>
                    <span>
                      Tentative Invoice Date (DD)
                      <span style={{ color: 'red', fontSize: '15px' }}>*</span>
                    </span>
                    <Form.Item
                      validateStatus={
                        formik.errors.suggestedInvoiceDate &&
                        formik.touched.suggestedInvoiceDate
                          ? 'error'
                          : ''
                      }
                    >
                      <div>
                        <DatePicker
                          className="no-clear-button"
                          value={dayjs(suggestedInvoiceDate)}
                          onChange={(dates) => {
                            setSuggestedInvoiceDate(
                              dayjs(dates) || suggestedInvoiceDate
                            );
                            formik.setFieldValue(
                              'suggestedInvoiceDate',
                              dayjs(dates)
                            );
                          }}
                          format={'DD'}
                          size="large"
                          style={{ width: '100%' }}
                          allowClear={false}
                          inputReadOnly={true}
                        />
                      </div>
                    </Form.Item>
                  </Flex>
                </Flex>
              )}

              {formik.values.paymentType === 'Milestones' && (
                <Flex vertical gap="10px" style={{ width: '100%' }}>
                  <Flex vertical gap="">
                    <span>
                      SOW Amount
                      <span style={{ color: 'red', fontSize: '15px' }}>*</span>
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
                  {/* Heading Row */}
                  <Flex
                    horizontal
                    gap="10px"
                    style={{
                      // width: '97%',
                      backgroundColor: '#f0f0f0',
                      padding: '10px',
                      borderRadius: '5px',
                      marginBottom: '10px',
                      // justifyContent: 'space-between',
                    }}
                  >
                    {/* Milestone Serial number */}
                    <span style={{ width: '10%' }}>M. No.</span>
                    {/* Milestone Name Heading */}
                    <div
                      style={{
                        width: '40%',
                      }}
                    >
                      Deliverable Name
                    </div>
                    {/* Payment Percentage Heading */}
                    <div style={{ width: '12%' }}>Payment %</div>
                    {/* Payment Date Heading */}
                    <div style={{ width: '25%' }}>Tentative Invoice Date</div>
                  </Flex>
                  {/* <div style={{padding:"0 10px"}}> */}
                  {milestoneDetails.length >= 1 ? (
                    // <Flex vertical gap="10px" style={{ width: '100%' }}>
                    milestoneDetails.map((milestoneDetail, index) => (
                      <Flex
                        horizontal
                        gap="10px"
                        style={{ padding: '0 10px' }}
                        key={index}
                      >
                        <span
                          style={{
                            textAlign: 'center``',
                            // fontWeight: 'bold',
                            width: '10%',
                            paddingTop: '6px',
                          }}
                        >
                          {index + 1}.
                        </span>
                        <Input
                          style={{ width: '40%' }}
                          size="large"
                          value={milestoneDetail.milestoneName}
                          placeholder="Name"
                          onChange={(e) =>
                            handleMilestoneChange(e, index, 'milestoneName')
                          }
                        />
                        <Input
                          style={{ width: '11%' }}
                          value={
                            milestoneDetail &&
                            milestoneDetail.milestonePercentage
                          }
                          size="large"
                          placeholder="%"
                          suffix={'%'}
                          type="text"
                          onChange={(e) =>
                            handleMilestoneChange(
                              e,
                              index,
                              'milestonePercentage'
                            )
                          }
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
                        <DatePicker
                          size="large"
                          style={{ width: '25%' }}
                          value={
                            milestoneDetail.milestoneDate
                              ? dayjs(milestoneDetail.milestoneDate)
                              : null
                          }
                          onChange={(date) =>
                            handleMilestoneChange(
                              { target: { value: date } },
                              index,
                              'milestoneDate'
                            )
                          }
                          format={'DD/MM/YYYY'}
                        />

                        <Button
                          type="link"
                          size="large"
                          style={{ padding: '0' }}
                          onClick={() => handleMilestoneDelete(index)}
                          danger
                        >
                          <DeleteOutlined />
                        </Button>
                      </Flex>
                    ))
                  ) : (
                    // </Flex>
                    <></>
                  )}
                  {/* </div> */}

                  <Flex
                    horizontal
                    gap="10px"
                    style={{ padding: '0 10px 20px' }}
                  >
                    <div
                      id="milestoneData"
                      style={{ width: '10%', paddingTop: '6px' }}
                    >
                      {milestoneDetails.length + 1}.
                    </div>
                    <Form.Item
                      style={{ margin: '0', width: '40%' }}
                      validateStatus={
                        formik.errors.milestoneName &&
                        formik.touched.milestoneName
                          ? 'error'
                          : ''
                      }
                    >
                      <Input
                        size="large"
                        name="milestoneName"
                        onChange={(e) => {
                          const { name, value } = e.target;
                          const filteredValue = value.replace(/[^\w\s]/gi, '');
                          const capitalizedValue = filteredValue.replace(
                            /\b\w/g,
                            (c) => c.toUpperCase()
                          );
                          formik.handleChange({
                            target: {
                              name,
                              value: capitalizedValue,
                            },
                          });
                          formik.setFieldValue(name, capitalizedValue);
                        }}
                        placeholder="Name"
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ margin: '0', width: '11%' }}
                      validateStatus={
                        formik.errors.milestonePercentage &&
                        formik.touched.milestonePercentage
                          ? 'error'
                          : ''
                      }
                    >
                      <Input
                        type="text"
                        min={0}
                        max={100}
                        name="milestonePercentage"
                        onChange={(e) => {
                          if (parseInt(e.target.value) < 0) {
                            e.target.value = '';
                          }
                          formik.handleChange(e);
                        }}
                        size="large"
                        placeholder="%"
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
                    <Form.Item
                      style={{ margin: '0', width: '25%' }}
                      validateStatus={
                        formik.errors.milestoneDate &&
                        formik.touched.milestoneDate
                          ? 'error'
                          : ''
                      }
                    >
                      <DatePicker
                        className="no-clear-button"
                        onChange={(dates) => {
                          formik.setFieldValue('milestoneDate', dates);
                        }}
                        size="large"
                        style={{}}
                        format={'DD/MM/YYYY'}
                        allowClear={false}
                        inputReadOnly={true}
                      />
                    </Form.Item>

                    <Button
                      type="link"
                      size="large"
                      style={{ padding: '0' }}
                      onClick={handleMilestoneDetails}
                    >
                      <PlusOutlined />
                    </Button>
                  </Flex>
                </Flex>
              )}
            </Flex>
          </div>
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
                uploadDocument={'SOW'}
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
            loading={loadings}
            htmlType="submit"
            onClick={() => {
              handleSubmit();
              handlePrimaryButtonClick();
            }}
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

export default SowPopup;
