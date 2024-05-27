import React, { useEffect, useLayoutEffect, useState } from 'react';
import { clientsApi } from '../api';
import { useFormik } from 'formik';
import {
  Button,
  Flex,
  Radio,
  Input,
  Form,
  notification,
  Select,
  DatePicker,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import './styles.css';
import dayjs from 'dayjs';
import GetRole from '../../GetRole.utils';
import { convertDate } from '../other/usefulFunctions';

const { TextArea } = Input;

const AddClientPopup = ({
  hide,
  buttonText,
  clientId,
  SaveisModalOpen,
  clearForm,
  apiHit,
}) => {
  const [GSTINDetails, setGSTINDetails] = useState([]);
  const [pocDetails, setPocDetails] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loadings, setLoadings] = useState(false);
  const [initialValues, setInitialValues] = useState({
    seId: 1,
    legalEntityName: '',
    location: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    zipCode: '',
    GSTINDetails: [],
    TANNumber: '',
    TaxId: '',
    suggestedInvoiceDate: '',
    pocName:'',
    pocEmail:'',
    pocNumber:'',
    poc: [],
    pocType: 'Finance',
  });
  const hasPocDetails = pocDetails?.length > 0; 
  const hasGSTINDetails = GSTINDetails?.length > 0;

  const validate = (values) => {
    const errors = {};

    if (![0, 1, ''].includes(values.seId)) {
      errors.seId = 'Invalid SE ID';
    }

    if (!values.legalEntityName) {
      errors.legalEntityName = 'Legal Entity Name is required';
    }

    if (
      values.seId === 1 &&
      (!values.TANNumber || !/^[A-Z]{4}\d{5}[A-Z]{1}$/.test(values.TANNumber))
    ) {
      errors.TANNumber = 'Invalid TAN number format';
    }

    if (!hasGSTINDetails && values.seId === 1) {
      if (!values.address) errors.address = 'Address is required';
      if (
        values.GSTIN &&
        !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/.test(
          values.GSTIN
        )
      ) {
        errors.GSTIN = 'Invalid GSTIN format';
      }
      if (!values.location) errors.location = 'Location is required';
      if (!values.city) errors.city = 'City is required';
      if (!values.state) errors.state = 'State is required';
      if (!values.country) errors.country = 'Country is required';
      if (!values.pinCode) errors.pinCode = 'pinCode is required';
    }

    if (values.seId === 0) {
      if (!values.TaxId) errors.TaxId = 'Tax ID is required';
      if (!values.address) errors.address = 'Address is required';
      if (!values.city) errors.city = 'City is required';
      if (!values.state) errors.state = 'State is required';
      if (!values.country) errors.country = 'Country is required';
      if (!values.zipCode) errors.zipCode = 'Zip Code is required';
    }

    if (!values.suggestedInvoiceDate) {
      errors.suggestedInvoiceDate = 'Suggested Invoice Date is required';
    }

    if (!hasPocDetails) {
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

  const resetPocForm = () => {
    formik.setValues({
      ...formik.values,
      pocName: '',
      pocEmail: '',
      pocNumber: '',
    });
    formik.setErrors({
      ...formik.errors,
      pocName: '',
      pocEmail: '',
      pocNumber: '',
    });
  };

  const handlePocDetails = (event) => {
    const { pocType, pocName, pocEmail, pocNumber } = formik.values;
    const areAllFieldsFilled = pocType && pocName && pocEmail && pocNumber;
    if (!areAllFieldsFilled) {
      const filledFields = ['pocType', 'pocName', 'pocEmail', 'pocNumber'];
      const emptyFields = filledFields.filter((field) => !formik.values[field]);
      emptyFields.forEach((field) => {
        formik.setFieldError(field, 'This field is required.');
        formik.setFieldTouched(field, true);
      });
    } else if (areAllFieldsFilled) {
      if (
        pocType !== '' &&
        pocName !== '' &&
        pocEmail !== '' &&
        pocNumber !== '' &&
        String(pocNumber).length === 10 &&
        /\S+@\S+\.\S+/.test(pocEmail)
      ) {
        const obj = {
          pocType: pocType,
          pocName: pocName,
          pocEmail: pocEmail,
          pocNumber: String(pocNumber),
        };
        const isDuplicate = pocDetails.some(
          (item) =>
            item.pocType === obj.pocType &&
            item.pocName === obj.pocName &&
            item.pocEmail === obj.pocEmail &&
            item.pocNumber === obj.pocNumber
        );

        if (!isDuplicate) {
          setPocDetails((prev) => [...prev, obj]);
          resetPocForm();
        }
      } else {
        if (!formik.values.pocType) {
          formik.setFieldError('pocType', '');
        }
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
        if (!formik.values.pocNumber || formik.values.pocNumber.length === 10) {
          formik.setFieldError(
            'pocNumber',
            'Please enter a valid mobile number with a maximum of 10 digits.'
          );
        }
        formik.setTouched({
          ...formik.touched,
          pocType: true,
          pocName: true,
          pocEmail: true,
          pocNumber: true,
        });
      }
    }
    event.preventDefault();
  };

  const resetAddressForm = () => {
    formik.setValues({
      ...formik.values,
      location: '',
      address: '',
      GSTIN: '',
      city: '',
      state: '',
      country: '',
      pinCode: '',
    });
    formik.setErrors({
      ...formik.errors,
      location: '',
      address: '',  
      GSTIN: '',
      city: '',
      state: '',
      country: '',
      pinCode: '',
    });
  };

  const handleGSTINDetails = (event) => {
    const { location, address, GSTIN, city, state, country, pinCode } =
      formik.values;
    const areAllFieldsFilledOfAddress =
      location && address && city && state && country && pinCode;

    if (!areAllFieldsFilledOfAddress) {
      const filledFieldsOfAddress = [
        'location',
        'address',
        'city',
        'state',
        'country',
        'pinCode',
      ];
      const emptyFieldsOfAddress = filledFieldsOfAddress.filter(
        (field) => !formik.values[field]
      );
      emptyFieldsOfAddress.forEach((field) => {
        formik.setFieldError(field, 'This field is required.');
        formik.setFieldTouched(field, true);
      });
    } else if (areAllFieldsFilledOfAddress) {
      if (
        location &&
        // GSTIN &&
        address &&
        city &&
        state &&
        country &&
        pinCode &&
        !(
          location.trim() === '' &&
          GSTIN.trim() === '' &&
          address.trim() === '' &&
          city.trim() === '' &&
          state.trim() === '' &&
          country.trim() === '' &&
          pinCode === ''
        )
      ) {
        const GSTINobj = {
          location: location,
          address: address,
          GSTIN: String(GSTIN),
          city: city,
          state: state,
          country: country,
          pinCode: pinCode,
        };
        setGSTINDetails((prevGSTINDetails) => [...prevGSTINDetails, GSTINobj]);
        resetAddressForm();
        scrollToAddress();
      } else {
        if (!formik.values.address) {
          formik.setFieldError('address', '');
        }
        if (!formik.values.city) {
          formik.setFieldError('city', '');
        }
        if (!formik.values.state) {
          formik.setFieldError('state', '');
        }
        if (!formik.values.country) {
          formik.setFieldError('country', '');
        }
        if (!formik.values.pinCode) {
          formik.setFieldError('pinCode', '');
        }
        formik.setTouched({
          ...formik.touched,
          address: true,
          GSTIN: true,
          city: true,
          state: true,
          country: true,
        });
      }
    }
    if (event) {
      event.preventDefault();
    }
  };

  const handleGSTINChange = (value, index, field) => {
    setGSTINDetails((prevGSTINDetails) =>
      prevGSTINDetails.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
    const fieldName = `poc[${index}].${field}`;
    formik.setFieldTouched(fieldName, true);
  };

  const handlePocDelete = (index) => {
    setPocDetails((prev) => prev.filter((_, i) => i !== index));
    if (editIndex === index) setEditIndex(null);
  };

  const handleGSTINDelete = (index) => {
    setGSTINDetails((prev) => prev.filter((_, i) => i !== index));
    if (editIndex === index) setEditIndex(null);
  };

  const handlePocChange = (value, index, field) => {
    setPocDetails((prevPocDetails) =>
      prevPocDetails.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
    const fieldName = `poc[${index}].${field}`;
    formik.setFieldTouched(fieldName, true);
  };

  const handleSeIdChange = (value) => {
    if (value === 0) {
      formik.setFieldValue('TaxId', null);
      formik.setFieldValue('address', null);
      formik.setFieldValue('city', null);
      formik.setFieldValue('state', null);
      formik.setFieldValue('country', null);
      formik.setFieldValue('zipCode', null);
    } else {
      formik.setFieldValue('location', null);
      formik.setFieldValue('address', null);
      formik.setFieldValue('city', null);
      formik.setFieldValue('state', null);
      formik.setFieldValue('country', null);
      formik.setFieldValue('pinCode', null);
      formik.setFieldValue('GSTIN', '');
      formik.setFieldValue('TANNumber', '');
    }
    formik.setFieldValue('seId', value);
  };

  function scrollToAddress() {
    const addressSpan = document.getElementById('addressSpan');
    if (addressSpan) {
      addressSpan.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validate,
    onSubmit: async (values, { resetForm }) => {
      try {
        const obj = {
          pocType: values.pocType,
          pocName: values.pocName,
          pocEmail: values.pocEmail,
          pocNumber: String(values.pocNumber),
        };
        const GSTINobj = {
          GSTIN: values.GSTIN,
          address: values.address,
          location: values.location,
          city: values.city,
          state: values.state,
          country: values.country,
          pinCode: values.pinCode,
        };

        const postData = {
          seId: Number(values.seId),
          legalEntityName: values.legalEntityName.trim(),
          suggestedInvoiceDate: values.suggestedInvoiceDate,
          poc: pocDetails.length > 0 ? pocDetails : [obj],
        };

        if (values.seId === 0) {
          postData.address = values?.address?.trim();
          postData.city = values?.city?.trim();
          postData.state = values?.state?.trim();
          postData.country = values?.country?.trim();
          postData.pinCode = values?.zipCode;
          postData.TaxId = String(values.TaxId);
        }
        if (values.seId === 1 || values.GSTIN) {
          postData.GSTINDetails =
            GSTINDetails?.length > 0 ? GSTINDetails : [GSTINobj];
          postData.TANNumber = String(values.TANNumber);
          postData.GSTINDetails.forEach((val) => {
            delete val.cGSTId;
            if (
              val.GSTIN == null ||
              val.GSTIN == '' ||
              val.GSTIN == undefined ||
              val.GSTIN == 'undefined'
            )
              delete val.GSTIN;
          });
        }

        postData.poc.map((val) => {
          delete val.pocId;
          delete val.contractId;
          return;
        });

        if (clientId) {
          setLoadings(true);
          clientsApi
            .updateClientData(clientId, postData)
            .then((res) => {
              console.log(res);
              hide();
              openNotificationWithIcon('success', res?.message);
              setLoadings(false);
            })
            .catch((err) => {
              console.log(err);
              openNotificationWithIcon('error', err?.response?.data?.message);
              setLoadings(false);
            });
        } else {
          setLoadings(true);
          clientsApi
            .addClientData(postData)
            .then((res) => {
              hide();
              resetForm();
              openNotificationWithIcon('success', res?.message);
              setLoadings(false);
            })
            .catch((err) => {
              console.log(err);
              openNotificationWithIcon('error', err?.response?.data?.message);
              setLoadings(false);
            });
        }
      } catch (error) {
        console.error('API Error:', error);
      }
    },
  });

  useEffect(() => {
    formik.resetForm({ values: initialValues });
    setPocDetails([]);
    setGSTINDetails([]);
  }, [clearForm]);

  useEffect(() => {
    if (clientId) {
      clientsApi
        .getClientData(clientId, '')
        .then((res) => {
          const data = res.data.data[0];
          console.log('data', data.seId);
          let obj = {
            seId: data.seId,
            legalEntityName: data.legalEntityName,
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country,
            zipCode: data.pinCode,
            TANNumber: data.TANNumber,
            TaxId: data.TaxId,
            GSTINDetails:
              data.GSTINDetails == null
                ? ''
                : data.GSTINDetails.map((GSTINDetail) => ({
                    address: GSTINDetail.address,
                    GSTIN: GSTINDetail.GSTIN,
                    location: GSTINDetail.location,
                    city: GSTINDetail.city,
                    state: GSTINDetail.state,
                    country: GSTINDetail.country,
                    pinCode: GSTINDetails.pinCode,
                  })),
            suggestedInvoiceDate: convertDate(data.suggestedInvoiceDate),
            poc: data.poc.map((poc) => ({
              pocType: poc.pocType,
              pocName: poc.pocName,
              pocEmail: poc.pocEmail,
              pocNumber: poc.pocNumber,
            })),
          };

          setInitialValues({ ...obj });
          setGSTINDetails(data.GSTINDetails);
          setPocDetails(data.poc);
          formik.validateForm().then(() => {
            console.log('Validation triggered');
          });
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [clientId, SaveisModalOpen, apiHit]);

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
              {console.log('object', formik.values.seId)}
              <Radio.Group
                name="seId"
                value={formik.values.seId}
                onBlur={formik.handleBlur}
                onChange={(e) => handleSeIdChange(e.target.value)}
              >
                <Radio.Button value={0}>Spanidea Systems LLC</Radio.Button>
                <Radio.Button value={1}>
                  Spanidea Systems Pvt. Ltd.
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Flex>
          <Flex vertical gap="" style={{ width: '100%' }}>
            <span>
              Legal Entity Name
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.legalEntityName && formik.touched.legalEntityName
                  ? 'error'
                  : ''
              }
            >
              <Input
                size="large"
                name="legalEntityName"
                value={formik.values.legalEntityName}
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
                placeholder="Legal Entity Name"
              />
            </Form.Item>
          </Flex>
          {formik.values.seId === 1 ? (
            <>
              {GSTINDetails?.length >= 1 ? (
                <Flex vertical gap="10px" style={{}}>
                  {GSTINDetails.map((GSTINDetail, index) => (
                    <Flex
                      vertical
                      gap="10px"
                      style={{
                        padding: '4px 15px',
                        marginLeft: '2px',
                        boxShadow:
                          'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
                      }}
                      key={index}
                    >
                      <Flex
                        vertical
                        gap="10px"
                        style={{ width: '100%', paddingBottom: '10px' }}
                      >
                        <Flex
                          horizontal
                          style={{
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>
                            Location {index + 1}
                            {
                              <span style={{ color: 'red', fontSize: '15px' }}>
                                *
                              </span>
                            }
                          </span>

                          {index > 0 && (
                            <Button
                              type="link"
                              size="large"
                              style={{ padding: '0' }}
                              onClick={() => handleGSTINDelete(index)}
                              danger
                            >
                              <DeleteOutlined />
                            </Button>
                          )}
                        </Flex>
                        <Flex
                          gap="10px"
                          style={{
                            width: '100%',
                            marginTop: '-10px',
                            paddingTop: '13px',
                          }}
                        >
                          <Input
                            value={GSTINDetail.location}
                            size="large"
                            placeholder="Location"
                            onChange={(e) =>
                              handleGSTINChange(
                                e.target.value,
                                index,
                                'location'
                              )
                            }
                          />
                          <Input
                            value={
                              GSTINDetail.GSTIN === undefined
                                ? GSTINDetail.GSTIN
                                : ''
                            }
                            size="large"
                            placeholder="GSTIN (e.g. 08AAPCS5825D1Z0)"
                            onChange={(e) =>
                              handleGSTINChange(
                                e.target.value.toUpperCase(),
                                index,
                                'GSTIN'
                              )
                            }
                          />
                        </Flex>
                        <TextArea
                          className="popupDiv"
                          style={{ overflow: 'auto' }}
                          autosize={{ minRows: 2, maxRows: 6 }}
                          value={GSTINDetail.address}
                          placeholder="Address"
                          onChange={(e) => {
                            const { value } = e.target;
                            const capitalizedValue = value
                              .split(' ')
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(' ');
                            handleGSTINChange(
                              capitalizedValue,
                              index,
                              'address'
                            );
                          }}
                        />
                        <Flex
                          gap="10px"
                          style={{
                            width: '100%',
                            marginTop: '-10px',
                            paddingTop: '13px',
                          }}
                        >
                          <Input
                            value={GSTINDetail.city}
                            size="large"
                            placeholder="City"
                            onChange={(e) => {
                              const { value } = e.target;
                              const capitalizedValue = value
                                .split(' ')
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(' ');
                              handleGSTINChange(
                                capitalizedValue,
                                index,
                                'city'
                              );
                            }}
                          />
                          <Input
                            value={GSTINDetail.state}
                            size="large"
                            placeholder="State"
                            onChange={(e) => {
                              const { value } = e.target;
                              const capitalizedValue = value
                                .split(' ')
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(' ');
                              handleGSTINChange(
                                capitalizedValue,
                                index,
                                'state'
                              );
                            }}
                          />
                        </Flex>
                        <Flex
                          gap="10px"
                          style={{
                            width: '100%',
                            marginTop: '-10px',
                            paddingTop: '13px',
                          }}
                        >
                          <Input
                            value={GSTINDetail.country}
                            size="large"
                            placeholder="Country"
                            onChange={(e) =>
                              handleGSTINChange(
                                e.target.value,
                                index,
                                'country'
                              )
                            }
                          />
                          <Input
                            value={GSTINDetail.pinCode}
                            size="large"
                            minLength={6}
                            maxLength={6}
                            placeholder="pinCode"
                            onChange={(e) =>
                              handleGSTINChange(
                                parseInt(e.target.value) >= 0
                                  ? e.target.value
                                  : '',
                                index,
                                'pinCode'
                              )
                            }
                          />
                        </Flex>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              ) : (
                <></>
              )}

              <Flex
                vertical
                gap=""
                style={{
                  width: '100%',
                  paddingBottom: '10px',
                  paddingTop: GSTINDetails?.length > 0 ? '15px' : '',
                  alignItems: 'end',
                }}
              >
                <Button
                  type="link"
                  style={{ padding: '0', border: '1px solid', width: '20%' }}
                  onClick={(event) => {
                    handleGSTINDetails(event);
                    // handleAddLocation();
                  }}
                >
                  <PlusOutlined />
                  Add Location
                </Button>
              </Flex>
              {/* {!hideLocationButton ? ( */}
              <Flex vertical gap="10px" style={{ width: '100%' }}>
                <Flex
                  style={{
                    padding: '10px 15px',
                    marginLeft: '2px',
                    boxShadow:
                      'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
                  }}
                >
                  <Flex style={{ width: '100%' }} vertical>
                    <span style={{ paddingBottom: '10px' }}>
                      Location {GSTINDetails?.length + 1}
                      <span style={{ color: 'red', fontSize: '15px' }}>*</span>
                    </span>

                    <Flex
                      gap="10px"
                      style={{ width: '100%', marginTop: '5px' }}
                    >
                      <Form.Item
                        style={{ width: '50%' }}
                        validateStatus={
                          formik.errors.location && formik.touched.location
                            ? 'error'
                            : ''
                        }
                      >
                        <Input
                          size="large"
                          name="location"
                          value={formik.values.location}
                          onChange={(e) => {
                            const { name, value } = e.target;
                            const filteredValue = value.replace(
                              /[^\w\s]/gi,
                              ''
                            );
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
                          placeholder="Location Name"
                        />
                      </Form.Item>

                      <Form.Item
                        style={{ width: '50%' }}
                        validateStatus={
                          formik.errors.GSTIN &&
                          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/.test(
                            formik.values.GSTIN
                          )
                            ? 'error'
                            : ''
                        }
                      >
                        <Input
                          size="large"
                          name="GSTIN"
                          value={formik.values.GSTIN}
                          onChange={(e) => {
                            let { value } = e.target;
                            value = value.replace(/[^a-zA-Z0-9]/g, '');
                            formik.handleChange(e);
                            formik.setFieldValue('GSTIN', value.toUpperCase());
                          }}
                          placeholder="GSTIN (e.g. 08AAPCS5825D1Z0)"
                        />
                      </Form.Item>
                    </Flex>

                    <Form.Item
                      style={{ marginTop: '-10px' }}
                      validateStatus={
                        formik.errors.address && formik.touched.address
                          ? 'error'
                          : ''
                      }
                    >
                      <TextArea
                        className="popupDiv"
                        style={{ overflow: 'auto' }}
                        autosize={{ minRows: 2, maxRows: 6 }}
                        name="address"
                        value={formik.values.address}
                        onChange={(e) => {
                          const { value } = e.target;
                          const capitalizedValue = value.replace(/\b\w/g, (c) =>
                            c.toUpperCase()
                          );
                          formik.handleChange(e);
                          formik.setFieldValue('address', capitalizedValue);
                        }}
                        placeholder="Address"
                      />
                    </Form.Item>

                    <Flex
                      gap="10px"
                      style={{ width: '100%', marginTop: '-10px' }}
                    >
                      <Form.Item
                        style={{ width: '50%' }}
                        validateStatus={
                          formik.errors.city && formik.touched.city
                            ? 'error'
                            : ''
                        }
                      >
                        <Input
                          size="large"
                          name="city"
                          value={formik.values.city}
                          onChange={(e) => {
                            const { name, value } = e.target;
                            const filteredValue = value.replace(
                              /[^\w\s]/gi,
                              ''
                            );
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
                          placeholder="City"
                        />
                      </Form.Item>

                      <Form.Item
                        style={{ width: '50%' }}
                        validateStatus={
                          formik.errors.state && formik.touched.state
                            ? 'error'
                            : ''
                        }
                      >
                        <Input
                          size="large"
                          name="state"
                          value={formik.values.state}
                          onChange={(e) => {
                            const { name, value } = e.target;
                            const filteredValue = value.replace(
                              /[^\w\s]/gi,
                              ''
                            );
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
                          placeholder="State"
                        />
                      </Form.Item>
                    </Flex>

                    <Flex
                      gap="10px"
                      style={{ width: '100%', marginTop: '-10px' }}
                    >
                      <Form.Item
                        style={{ width: '50%' }}
                        validateStatus={
                          formik.errors.country && formik.touched.country
                            ? 'error'
                            : ''
                        }
                      >
                        <Input
                          size="large"
                          name="country"
                          value={formik.values.country}
                          onChange={(e) => {
                            const { name, value } = e.target;
                            const filteredValue = value.replace(
                              /[^\w\s]/gi,
                              ''
                            );
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
                          placeholder="Country"
                        />
                      </Form.Item>

                      <Form.Item
                        style={{ width: '50%' }}
                        validateStatus={
                          formik.errors.pinCode && formik.touched.pinCode
                            ? 'error'
                            : ''
                        }
                      >
                        <Input
                          id="addressSpan"
                          size="large"
                          type="text"
                          minLength={6}
                          maxLength={6}
                          name="pinCode"
                          value={formik.values.pinCode}
                          onChange={(e) => {
                            if (parseInt(e.target.value) < 0) {
                              e.target.value = '';
                            }
                            formik.handleChange(e);
                          }}
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
                          placeholder="Pincode"
                        />
                      </Form.Item>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              {/* ) : (
                <></>
              )} */}
            </>
          ) : (
            <Flex vertical style={{ width: '100%' }}>
              <span>
                Address
                {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
              </span>
              <Form.Item
                style={{ margin: 0 }}
                validateStatus={
                  formik.errors.address && formik.touched.address ? 'error' : ''
                }
              >
                <TextArea
                  className="popupDiv"
                  style={{ overflow: 'auto' }}
                  autosize={{ minRows: 2, maxRows: 6 }}
                  name="address"
                  value={formik.values.address}
                  onChange={(e) => {
                    const { value } = e.target;
                    const capitalizedValue = value.replace(/\b\w/g, (c) =>
                      c.toUpperCase()
                    );
                    formik.handleChange(e);
                    formik.setFieldValue('address', capitalizedValue);
                  }}
                  placeholder="Address"
                />
              </Form.Item>
              <Flex gap="10px" style={{ width: '100%', marginTop: '20px' }}>
                <Form.Item
                  style={{ width: '100%', margin: 0 }}
                  validateStatus={
                    formik.errors.city && formik.touched.city ? 'error' : ''
                  }
                >
                  <Input
                    size="large"
                    name="city"
                    value={formik.values.city}
                    // onBlur={() => formik.handleBlur('city')}
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
                    placeholder="City"
                  />
                </Form.Item>
                <Form.Item
                  style={{ width: '100%', margin: 0 }}
                  validateStatus={
                    formik.errors.state && formik.touched.state ? 'error' : ''
                  }
                >
                  <Input
                    size="large"
                    name="state"
                    value={formik.values.state}
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
                    placeholder="State"
                  />
                </Form.Item>
              </Flex>
              <Flex gap="10px" style={{ width: '100%', marginTop: '20px' }}>
                <Form.Item
                  style={{ width: '100%', margin: 0 }}
                  validateStatus={
                    formik.errors.country && formik.touched.country
                      ? 'error'
                      : ''
                  }
                >
                  <Input
                    size="large"
                    name="country"
                    value={formik.values.country}
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
                    placeholder="Country"
                  />
                </Form.Item>
                <Form.Item
                  style={{ width: '100%' }}
                  validateStatus={
                    formik.errors.zipCode && formik.touched.zipCode
                      ? 'error'
                      : ''
                  }
                >
                  <Input
                    size="large"
                    type="number"
                    minLength={6}
                    maxLength={6}
                    name="zipCode"
                    value={formik.values.zipCode}
                    onChange={(e) => {
                      if (parseInt(e.target.value) < 0) {
                        e.target.value = '';
                      }
                      formik.handleChange(e);
                    }}
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
                    placeholder="Zip Code"
                  />
                </Form.Item>
              </Flex>
            </Flex>
          )}
          <Flex style={{ width: '100%', marginTop: '20px' }} gap={10}>
            {formik.values.seId === 1 ? (
              <Flex vertical style={{ width: '100%' }}>
                <span>
                  TAN Number
                  {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
                </span>
                <Form.Item
                  validateStatus={
                    formik.errors.TANNumber && formik.touched.TANNumber
                      ? 'error'
                      : ''
                  }
                >
                  <Input
                    size="large"
                    name="TANNumber"
                    value={formik.values.TANNumber}
                    onChange={(e) => {
                      let { value } = e.target;
                      value = value.replace(/[^a-zA-Z0-9]/g, '');
                      formik.handleChange(e);
                      formik.setFieldValue('TANNumber', value.toUpperCase());
                    }}
                    placeholder="TAN Number (e.g. PNEA18234G)"
                  />
                </Form.Item>
              </Flex>
            ) : (
              <>
                <Flex vertical style={{ width: '100%' }}>
                  <span>
                    Tax ID
                    {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
                  </span>
                  <Form.Item
                    validateStatus={
                      formik.errors.TaxId && formik.touched.TaxId
                        ? 'error'
                        : null
                    }
                  >
                    <Input
                      size="large"
                      name="TaxId"
                      value={formik.values.TaxId}
                      onChange={(e) => {
                        let { value } = e.target;
                        value = value.replace(/[^a-zA-Z0-9]/g, '');
                        formik.handleChange(e);
                        formik.setFieldValue('TaxId', value.toUpperCase());
                      }}
                      placeholder="Tax ID"
                    />
                  </Form.Item>
                </Flex>
              </>
            )}
            <Flex vertical style={{ width: '100%' }}>
              <span>
                Suggested Invoice Date (DD)
                {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
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
                    value={
                      formik.values.suggestedInvoiceDate
                        ? dayjs(formik.values.suggestedInvoiceDate)
                        : null
                    }
                    onChange={(dates) => {
                      formik.setFieldValue(
                        'suggestedInvoiceDate',
                        dates ? dayjs(dates) : null
                      );
                    }}
                    size="large"
                    style={{ width: '100%' }}
                    format={'DD'}
                    allowClear={false}
                    inputReadOnly={true}
                  />
                </div>
              </Form.Item>
            </Flex>
          </Flex>

          <Flex
            vertical
            justify="space-between"
            gap="10px"
            style={{ width: '100%', paddingBottom: '20px' }}
          >
            <span style={{ width: '100%' }}>
              Point Of Contact(s)
              {<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Flex vertical gap="10px" style={{ width: '100%' }}>
              {pocDetails.length >= 1 ? (
                <Flex vertical gap="10px" style={{ width: '100%' }}>
                  {pocDetails.map((pocDetail, index) => (
                    <Flex
                      horizontal
                      gap="10px"
                      style={{ width: '100%' }}
                      key={index}
                    >
                      <Select
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="Type"
                        value={pocDetail.pocType}
                        onChange={(value) =>
                          handlePocChange(value, index, 'pocType')
                        }
                        options={[
                          {
                            value: '1',
                            label: 'Finance',
                          },
                          {
                            value: '2',
                            label: 'Technical',
                          },
                          {
                            value: '3',
                            label: 'Sales',
                          },
                          {
                            value: '4',
                            label: 'Other',
                          },
                        ]}
                      />
                      <Input
                        size="large"
                        value={pocDetail.pocName}
                        placeholder="Name"
                        onChange={(e) => {
                          let { value } = e.target;
                          value = value.replace(/[^\w\s]/gi, '');
                          const capitalizedValue = value
                            .split(' ')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(' ');
                          handlePocChange(capitalizedValue, index, 'pocName');
                        }}
                      />

                      <Input
                        type="email"
                        value={pocDetail.pocEmail}
                        size="large"
                        placeholder="Email"
                        onChange={(e) =>
                          handlePocChange(e.target.value, index, 'pocEmail')
                        }
                      />

                      <Input
                        type="number"
                        value={pocDetail.pocNumber}
                        size="large"
                        placeholder="Mobile No."
                        onChange={(e) =>
                          handlePocChange(
                            parseInt(e.target.value) >= 0 ? e.target.value : '',
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

                      <Button
                        type="link"
                        size="large"
                        style={{ padding: '0' }}
                        onClick={() => handlePocDelete(index)}
                        danger
                      >
                        <DeleteOutlined />
                      </Button>
                    </Flex>
                  ))}
                </Flex>
              ) : (
                <></>
              )}

              <Flex horizontal gap="10px" style={{ width: '100%' }}>
                <Form.Item
                  style={{ width: '88%' }}
                  validateStatus={
                    formik.errors.pocType && formik.touched.pocType
                      ? 'error'
                      : null
                  }
                >
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    defaultValue={'Finance'}
                    name="pocType"
                    placeholder="Type"
                    optionFilterProp="children"
                    value={formik?.values?.pocType}
                    onChange={(value, data) => {
                      formik.setFieldValue('pocType', data.label);
                    }}
                    // onBlur={() => formik.handleBlur('pocType')}
                    options={[
                      {
                        value: '1',
                        label: 'Finance',
                      },
                      {
                        value: '2',
                        label: 'Sales',
                      },
                      {
                        value: '3',
                        label: 'Admin',
                      },
                      {
                        value: '4',
                        label: 'Other',
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  style={{ margin: '0', width: '100%' }}
                  validateStatus={
                    formik.errors.pocName && formik.touched.pocName
                      ? 'error'
                      : null
                  }
                >
                  <Input
                    size="large"
                    name="pocName"
                    value={formik?.values?.pocName}
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
                    // onBlur={formik.handleBlur}
                  />
                </Form.Item>
                <Form.Item
                  style={{ margin: '0', width: '100%' }}
                  validateStatus={
                    formik.errors.pocEmail && formik.touched.pocEmail
                      ? 'error'
                      : null
                  }
                >
                  <Input
                    type="email"
                    name="pocEmail"
                    value={formik.values.pocEmail}
                    onChange={formik.handleChange}
                    size="large"
                    placeholder="Email"
                    // onBlur={formik.handleBlur}
                  />
                </Form.Item>
                <Form.Item
                  style={{ margin: '0', width: '100%' }}
                  validateStatus={
                    formik.errors.pocNumber && formik.touched.pocNumber
                      ? 'error'
                      : null
                  }
                >
                  <Input
                    type="text"
                    name="pocNumber"
                    value={formik.values.pocNumber}
                    onChange={(e) => {
                      formik.setFieldValue('pocNumber', e.target.value);
                    }}
                    size="large"
                    placeholder="Mobile No."
                    minLength={10}
                    maxLength={15}
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

                    // onPaste={(e) => {
                    //   const clipboardData =
                    //     e.clipboardData || window.clipboardData;
                    //   const pastedData = clipboardData.getData('text/plain');
                    //   if (!/^\d+$/.test(pastedData)) e.preventDefault();
                    // }}
                  />
                </Form.Item>
                <Button
                  type="link"
                  size="large"
                  style={{ padding: '0' }}
                  onClick={handlePocDetails}
                >
                  <PlusOutlined />
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </div>
        <Flex justify="end" style={{ marginRight: '17px', paddingTop: '18px' }}>
          <Button loading={loadings} type="primary" htmlType="submit">
            {buttonText}
          </Button>
        </Flex>
      </form>
    </>
  );
};

export default AddClientPopup;
