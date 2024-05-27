import './styles.css';
import { projectApi } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectPopup from './ProjectPopup';
import { Button, Flex, Modal, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import TableComponent from '../other/TableComponent';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { getRoles } from '@testing-library/react';
import GetRole from '../../GetRole.utils';
import { highlightSearchText } from '../other/usefulFunctions';

const Project = () => {
  // const { totalRecordCount, page } = useParams();
  const [totalRecordCount, setTotalRecords] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allProjectData, setAllProjectData] = useState([]);
  const [filterFields, setFilterFields] = useState({
    page: 1,
    filterField: '',
    sorting: { field: '', order: '' },
    filterValue: '',
  });

  const navigate = useNavigate();

  const [clearForm, setClearForm] = useState(false);
  const [apiHit, setApiHit] = useState(false);

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
    return selectedKey ? selectedKey : 'New Engagement/Project';
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'projectName',
      key: 'projectName',
      width: '15%',
    },
    {
      title: 'Description',
      dataIndex: 'projectDescription',
      key: 'projectDescription',
      width: '20%',
      render: (text, record) => {
        const projectDescription = `${record.projectDescription}`;
        const shouldShowTooltip = projectDescription.length > 50;
        const truncatedprojectDescription = projectDescription.slice(0, 50);

        return (
          <div
            style={{
              maxHeight: '3em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
            }}
          >
            {shouldShowTooltip ? (
              <Tooltip title={projectDescription}>
                <span>{truncatedprojectDescription}...</span>
              </Tooltip>
            ) : (
              <>{truncatedprojectDescription}</>
            )}
          </div>
        );
      },
    },
    {
      title: 'Client',
      dataIndex: 'legalEntityName',
      key: 'legalEntityName',
      width: '15%',
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
      width: '12%',
      fixed: 'right',
      render: (_, record) => (
        <>
          {GetRole() !== 'finance' && (
            <Button
              onClick={() => showModal(record?.projectId)}
              type="link"
              style={{
                color: '#003eb3',
              }}
            >
              <EditOutlined />
            </Button>
          )}
          <Modal
            // title={getTitle()}
            visible={isModalOpen && selectedKey === record?.projectId}
            onCancel={handlePopupCancel}
            footer={null}
          >
            <ProjectPopup
              hide={setIsModalOpen}
              buttonText={'Update'}
              clientId={record?.projectId}
              apiHit={apiHit}
            />
          </Modal>
          <Button
            type="link"
            style={{
              color: '#fa541c',
            }}
            onClick={() => navigate(`/projects/${record?.projectId}`)}
          >
            <EyeOutlined />
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, [isModalOpen, filterFields]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await projectApi.getAllProjectData(
        filterFields.page,
        filterFields.sorting.field,
        filterFields.sorting.order,
        filterFields.filterField,
        filterFields.filterValue
      );
      setAllProjectData(response.data.data);
      setTotalRecords(response.data.totalProjectCount);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Flex justify="space-between" style={{ marginBottom: '30px' }}>
        <h2>Engagement/Project(s)</h2>
        {GetRole() !== 'finance' && (
          <Button onClick={() => showModal(null)} type="primary">
            Add Engagement/Project
          </Button>
        )}
        <Modal
          title={getTitle()}
          visible={isModalOpen && !selectedKey}
          onCancel={handlePopupCancel}
          footer={null}
        >
          <ProjectPopup
            hide={setIsModalOpen}
            buttonText={'Save'}
            clearForm={clearForm}
          />
        </Modal>
      </Flex>

      <TableComponent
        loading={loading}
        data={allProjectData}
        columns={columns}
        scrollX={1200}
        totalPages={totalRecordCount}
        onFilters={handleFilters}
      />
    </>
  );
};

export default Project;
