import { Tag } from 'antd';
import moment from 'moment';
export const handelDate = (dateString) => {
  return dateString;
};

// function to show status tile
export const handlestatus = (status) => {
  const colors = {
    inactive: 'error',
    NO: 'error',
    draft: 'processing',
    pendingapproval: 'warning',
    YES: 'success',
    approved: 'cyan',
  };
  const color = colors[status] || 'success';
  return (
    <Tag color={color}>
      {status === 'pendingapproval'
        ? 'Pending Approval'
        : status.charAt(0).toUpperCase() + status.slice(1)}
    </Tag>
  );
};

export const capitalizeWords = (str) => {
  const words = str.split(' ');
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  const capitalizedString = capitalizedWords.join(' ');
  return capitalizedString;
};

export const extractContract = (contract) => {
  return contract.substring(contract.indexOf('(') + 1, contract.indexOf(')'));
};


export function convertDate(dateString) {
  var parts = dateString.split('/');
  var newDateString = parts[2] + '/' + parts[1] + '/' + parts[0];
  return newDateString;
}

