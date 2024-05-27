import React, { useEffect, useState } from 'react';
import './styles.css';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { contracts } from '../api';

const Upload = ({ uploadDocument, receiveFileData, error }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const onChangeHandler = async(event) => {
    const selectedFile = event.target.files[0];
       if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile?.name); 
    }
  };

  const onSubmitHandler = async event => {
    event.preventDefault();
  };

  const uploadFile = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        receiveFileData(file);
        resolve();
      }, 2000); 
    });
  };

  useEffect(() => {
    if (file) {
      receiveFileData(file);
    }
  }, [file]);

  return (
    <form onSubmit={onSubmitHandler}>
      <div className='file-upload-button'>
        <label htmlFor="fileInput" className="custom-file-upload">
          {fileName ? (
            <span>{fileName}</span>
          ) : (
            <>
              <PlusOutlined />  &nbsp; Upload {uploadDocument}
            </>
          )}
        </label>
        <input id="fileInput" type="file" name="file" onChange={onChangeHandler} style={{ display: 'none' }}/>
        <button style={{ display: 'none' }} type="submit">Upload NDA</button>
      </div>
    </form>
  );
};

export default Upload;
