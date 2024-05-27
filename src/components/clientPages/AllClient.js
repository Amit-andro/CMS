import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  Flex,
  Modal,
  Tooltip,
  Radio,
  Space,
  Col,
  Row,
  Checkbox,
  Badge,
} from 'antd';
import './styles.css';
import TableComponent from '../other/TableComponent';
import {
  EditOutlined,
  EyeOutlined,
  FilterFilled,
  CloseOutlined,
} from '@ant-design/icons';
import AddClientPopup from './AddClientPopup';
import { clientsApi } from '../api';
import { useLocation, useNavigate } from 'react-router-dom';
import GetRole from '../../GetRole.utils';
import Item from 'antd/es/list/Item';

const AllClient = () => {
  const location = useLocation();
  const { state } = location;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [totalRecordCount, setTotalRecordCount] = useState();
  const [allClientDetails, setAllClientDetails] = useState();
  const [loading, setLoading] = useState(false);
  const [filterFields, setFilterFields] = useState({
    seId: '1',
    page: 1,
    filterField: '',
    sorting: { field: '', order: '' },
    filterValue: '',
  });
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(
    state?.withoutContract || state?.withoutContract === ''
      ? state?.withoutContract
      : ''
  );
  const [selectSpanideaEntity, setSelectSpanideaEntity] = useState(
    state?.withoutContract || state?.withoutContract === '' ? [0, 1] : [1]
  );
  const [filterCount, setFilterCount] = useState(1);
  const filterRef = useRef(null);
  const navigate = useNavigate();

  const [clearForm, setClearForm] = useState(false);
  const [apiHit, setApiHit] = useState(false);

  const toggleFilter = () => {
    setVisible((prev) => !prev);
  };

  const onContractCheckBoxSelection = (clientCheckedValues) => {
    if (clientCheckedValues.length === 0) {
      setValue([...value]);
    } else {
      setValue(clientCheckedValues);
      const statusCount = 1;
      const totalCount = statusCount + (clientCheckedValues ? 1 : 0);
      setFilterCount(totalCount);
    }
  };

  const onCheckboxSelection = (checkedValues) => {
    if (checkedValues.length === 0) {
      setSelectSpanideaEntity([...selectSpanideaEntity]);
    } else {
      const statusCount = 1;
      // const totalCount = statusCount + value ? 1 : 0;
      // setFilterCount(totalCount);
      setSelectSpanideaEntity(checkedValues);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        !event.target.closest('.filterBtn')
      ) {
        setVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilters = (value) => {
    setFilterFields((prevState) => {
      if (
        prevState.page !== value.page ||
        prevState.filterField !== value.filterField ||
        prevState.sorting.field !== value.sorting.field ||
        prevState.sorting.order !== value.sorting.order ||
        prevState.filterValue !== value.filterValue
      ) {
        return {
          page: value.page,
          filterField: value.filterField,
          sorting: {
            field: value.sorting.field,
            order: value.sorting.order,
          },
          filterValue: value.filterValue,
        };
      } else {
        return prevState;
      }
    });
  };

  const showModal = (key) => {
    setSelectedKey(key);
    setIsModalOpen(true);
    setClearForm(!clearForm);
    setApiHit(!apiHit);
  };
  const handlePopupCancel = () => {
    setSelectedKey(null);
    setIsModalOpen(false);
  };

  const getTitle = () => {
    return selectedKey ? selectedKey : 'New Client';
  };

  const columns = [
    {
      title: 'Legal Entity Name',
      dataIndex: 'legalEntityName',
      key: 'legalEntityName',
      width: '15%',
    },
    {
      title: 'Address',
      dataIndex:'address',
      key: 'address',
      width: '20%',
    },
    {
      title: 'Tax Id',
      dataIndex: 'TaxId',
      key: 'TaxId',
      width: '15%',
      render: (_, { TaxId }) => (TaxId ? TaxId : '-'),
    },
    {
      title: 'GSTIN',
      dataIndex: 'GSTIN',
      key: 'GSTIN',
      width: '15%',
      render: (_, { GSTIN }) => (GSTIN ? GSTIN : '-'),
    },

    {
      title: 'TAN Number',
      dataIndex: 'TANNumber',
      key: 'TANNumber',
      width: '12%',
      render: (_, { TANNumber }) => (TANNumber ? TANNumber : '-'),
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
      width: '10%',
      fixed: 'right',

      render: (_, record) => (
        <>
          <Tooltip title="Edit" key={'Edit'}>
            <Button
              onClick={() => showModal(record?.clientId)}
              type="link"
              style={{
                color: '#003eb3',
              }}
            >
              <EditOutlined />
            </Button>
          </Tooltip>{' '}
          <Modal
            // title={getTitle()}
            open={isModalOpen && selectedKey === record?.clientId}
            onCancel={handlePopupCancel}
            footer={null}
            width={680}
            SaveisModalOpen={isModalOpen}
          >
            <AddClientPopup
              hide={setIsModalOpen}
              buttonText={'Update'}
              clientId={record?.clientId}
            />
          </Modal>
          <Tooltip title="View" key={'View'}>
            <Button
              type="link"
              style={{
                color: '#fa541c',
              }}
              onClick={() => navigate(`/clients/${record.clientId}`)}
            >
              <EyeOutlined />
            </Button>
          </Tooltip>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, [isModalOpen, filterFields, value, selectSpanideaEntity]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await clientsApi.getAllClientData(
        selectSpanideaEntity,
        filterFields.page,
        filterFields.sorting.field,
        filterFields.sorting.order,
        filterFields.filterField,
        filterFields.filterValue,
        value
      );

      const data = response.data.data;

      const clientArr = [];
      
      for(let i=0;i<data.length;i++){
        const obj = {
          clientId:data[i].clientId,
          seId:data[i].seId,
          legalEntityName:data[i].legalEntityName,
          address:data[i].seId === 0 ? data[i].address : data[i].GSTINAddress,
          TANNumber:data[i].TANNumber,
          TaxId: data[i].TaxId,
          GSTIN:data[i].GSTIN
        }

        clientArr.push(obj)
      }
      setAllClientDetails(clientArr);
      setTotalRecordCount(response.data.totalClientCount);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log("==================",allClientDetails);

  return (
    <>
      <Flex justify="space-between">
        <h2>Client(s)</h2>
        {GetRole() !== 'finance' && (
          <Button onClick={() => showModal(null)} type="primary">
            Add Client
          </Button>
        )}

        <Modal
          title={getTitle()}
          open={isModalOpen && !selectedKey}
          onCancel={handlePopupCancel}
          footer={null}
          width={680}
        >
          <AddClientPopup
            hide={setIsModalOpen}
            buttonText={'Save'}
            SaveisModalOpen={isModalOpen}
            clearForm={clearForm}
          />
        </Modal>
      </Flex>
      <Flex style={{ position: 'relative' }} justify="end">
        <Button
          type="link"
          // icon={<FilterFilled />}
          onClick={toggleFilter}
          className="filterBtn"
        >
          <Badge size="small" count={filterCount}>
            <FilterFilled style={{ color: '#1677ff' }} />{' '}
          </Badge>
          &nbsp; Filter
        </Button>

        {visible && (
          <Flex
            ref={filterRef}
            vertical
            style={{
              boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
              padding: '10px 20px',
              borderRadius: '10px',
              width: '260px',
              position: 'absolute',
              zIndex: '10',
              backgroundColor: '#FFF',
              top: '100%',
              right: 0,
            }}
          >
            <Flex justify="space-between">
              <span style={{ fontSize: '16px', fontWeight: '700' }}>
                Filters
              </span>
              <Button
                type="link"
                style={{ color: '#8c8c8c', height: '16px', width: '16px' }}
                icon={<CloseOutlined />}
                onClick={toggleFilter}
              />
            </Flex>
            <Flex vertical style={{ marginTop: '16px' }} gap={16}>
              <Flex vertical>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span style={{ paddingLeft: '5px', fontWeight: '500' }}>
                    Clients Without
                  </span>
                  <span
                    style={{
                      fontWeight: '500',
                      color: '#1677ff',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setValue([]);
                      setFilterCount(1);
                    }}
                  >
                    Clear
                  </span>
                </div>
                <Checkbox.Group
                  style={{
                    width: '100%',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '5px 10px',
                  }}
                  onChange={onContractCheckBoxSelection}
                  value={value}
                >
                  <Row gutter={[8, 8]}>
                    <Col className="gutter-row" span={24}>
                      <Checkbox value={0}>NDA</Checkbox>
                    </Col>
                    <Col className="gutter-row" span={24}>
                      <Checkbox value={1}>MSA</Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Flex>
              <Flex vertical>
                <span style={{ paddingLeft: '5px', fontWeight: '500' }}>
                  Spanidea Entity
                </span>
                <Checkbox.Group
                  style={{
                    width: '100%',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '5px 10px',
                  }}
                  onChange={onCheckboxSelection}
                  value={selectSpanideaEntity}
                >
                  <Row gutter={[8, 8]}>
                    <Col className="gutter-row" span={24}>
                      <Checkbox value={0}>Spanidea Systems LLC</Checkbox>
                    </Col>
                    <Col className="gutter-row" span={24}>
                      <Checkbox value={1}>Spanidea Systems Pvt. Ltd.</Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Flex>
      <TableComponent
        loading={loading}
        data={allClientDetails}
        columns={columns}
        scrollX={1200}
        totalPages={totalRecordCount}
        onFilters={handleFilters}
      />
    </>
  );
};

export default AllClient;
