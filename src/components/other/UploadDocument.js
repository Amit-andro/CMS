import React, { useEffect, useState } from 'react';
import { Upload, message } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import _debounce from 'lodash/debounce';

const UploadDocument = ({
  uploadDocument,
  receiveFileData,
  error,
  resetUpload,
  fileValue,
  setUploadError
}) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = _debounce(async ({ fileList }) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const newFileList = fileList
      .map((file) => {
        const isFileTypeAllowed = allowedTypes.includes(file.type);
        const isLt2M = file.size / 1024 / 1024 < 10;

        if (!isFileTypeAllowed || !isLt2M) {
          message.error(
            'You can only upload PDF and document files that are smaller than 10MB!'
          );
          return null;
        } else {
          file.status = 'success';
        }

        return file;
      })
      .filter(Boolean);
    setFileList(newFileList);
  }, 300);

  const uploadButton = (
    <div
      style={{
        width: '100%',
        padding: '8px',
        border: error ? '1px solid red' : '',
        borderRadius: '5px',
      }}
    >
      <div>
        {fileValue ? (
          <>{fileValue}</>
        ) : (
          <>
            <UploadOutlined/> &nbsp; Browse file
          </>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    receiveFileData(fileList);
  }, [fileList]);

  useEffect(() => {
    if (resetUpload) {
      setFileList([]);
      setUploadError(false);
    }
  }, [resetUpload]);

  console.log("fgvcdvdfbdg",fileList);

  return (
    <Upload
      action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
      listType="picture-card"
      fileList={fileList}
      onChange={(e) => handleChange(e)}
      onRemove={() => setFileList([])}
      beforeUpload={() => false}
      enctype="multipart/form-data"
      disabled={uploading}
      loading={uploading}
      iconRender={uploading ? () => <LoadingOutlined /> : undefined}
    >
      {fileList.length >= 1 ? null : uploadButton}
    </Upload>
  );
};

UploadDocument.propTypes = {
  uploadDocument: PropTypes.string.isRequired,
  error: PropTypes.bool.isRequired,
  onSaveButtonClick: PropTypes.func.isRequired,
  resetUpload: PropTypes.bool.isRequired,
};

export default UploadDocument;
