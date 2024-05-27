import { projectApi } from '../api';
import { clientsApi } from '../api';
import { contracts } from '../api';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Button, Flex, Radio, Input, Form, Select, notification } from 'antd';
import decodedToken from '../../DecodedToken.utils';

const { TextArea } = Input;
const validate = (values) => {
  const errors = {};
  if (!values.projectName) {
    errors.projectName = 'error';
  }
  // if (!values.projectDescription) {
  //   errors.projectDescription = 'error';
  // }
  if (!values.clientId) {
    errors.clientId = 'error';
  }
  // if (!values.deliveryManager) {
  //   errors.deliveryManager = 'error';
  // }
  return errors;
};

const ProjectPopup = ({ hide, buttonText, clientId, clearForm, apiHit }) => {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientNameList, setClientNameList] = useState([]);
  const [authorizerData, setAuthorizerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [initialValues, setInitialValues] = useState({
    seId: 1,
    projectName: '',
    projectDescription: '',
    clientId: null,
  });

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const errors = validate(values);
        if (Object.keys(errors).length === 0) {
          const postData = {
            seId: Number(values.seId),
            clientId: values.clientId,
            projectName: values.projectName,
            projectDescription: values.projectDescription,
            createdBy: decodedToken.employeeNo,
          };

          if (clientId) {
            setLoading(true);
            projectApi
              .updateProjectData(clientId, postData)
              .then((res) => {
                resetForm();
                hide();
                openNotificationWithIcon(
                  'success',
                  'Project updated successfully.'
                );
                setLoading(false);
                // setRealTimeDataUpdate(formik.values);
              })
              .catch((err) => {
                console.log(err);
                openNotificationWithIcon('error', 'Error updating Project.');
                setLoading(false);
              });
          } else {
            setLoading(true);
            projectApi
              .addProjectData(postData)
              .then((res) => {
                console.log('addprojectApiData', res.data);
                hide();
                resetForm();
                if (res.statusCode === 200 || res.statusCode === 201) {
                  openNotificationWithIcon('success', res?.message);
                }
                setLoading(false);
              })
              .catch((err) => {
                console.log(err);
                openNotificationWithIcon('error', err.response.data.message);
                setLoading(false);
              });
          }
        } else {
          console.error('Validation Error:', errors);
        }
      } catch (error) {
        console.error('API Error:', error);
        setLoading(false);
      }
    },
  });

  const onclientIdSearch = (value) => {
    setSearch(value);
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

  const onSpanideaAuthorizorSearch = (value) => {
    console.log('search:', value);
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
    clientsApi
      .getEmployeeName()
      .then((res) => {
        setAuthorizerData(res.data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    if (clientId) {
      projectApi
        .getProjectData(clientId)
        .then((res) => {
          const data = res.data.data[0];
          let obj = {
            seId: Number(data?.seId),
            clientId: data?.client?.clientId,
            projectName: data?.projectName,
            projectDescription: data?.projectDescription,
          };
          formik.setValues({ ...obj });
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
    formik.resetForm({ values: initialValues });
  }, [clearForm]);

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="popupDiv">
          <Flex justify="center" style={{ marginTop: '8px' }}>
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
                value={formik.values.clientId}
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
          <Flex vertical gap="" style={{ width: '100%' }}>
            <span>
              Name{<span style={{ color: 'red', fontSize: '15px' }}>*</span>}
            </span>
            <Form.Item
              validateStatus={
                formik.errors.projectName && formik.touched.projectName
                  ? 'error'
                  : ''
              }
            >
              <Input
                size="large"
                name="projectName"
                value={formik.values.projectName}
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
                placeholder="Name"
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap="" style={{ width: '100%' }}>
            <span>Description</span>
            <Form.Item
              validateStatus={
                formik.errors.projectDescription &&
                formik.touched.projectDescription
                  ? 'error'
                  : ''
              }
            >
              <TextArea
                className="popupDiv"
                style={{ overflow: 'auto' }}
                autosize={{ minRows: 2, maxRows: 6 }}
                name="projectDescription"
                value={formik.values.projectDescription}
                onChange={(e) => {
                  const { value } = e.target;
                  const capitalizedValue = value
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  formik.handleChange(e);
                  formik.setFieldValue('projectDescription', capitalizedValue);
                }}
                placeholder="Description"
              />
            </Form.Item>
          </Flex>
          <Flex justify="end">
            <Button type="primary" loading={loading} htmlType="submit">
              {buttonText}
            </Button>
          </Flex>
        </div>
      </form>
    </>
  );
};

export default ProjectPopup;
