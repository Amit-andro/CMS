import { contracts } from '../api';

function handleContractAction(
  clientId,
  postData,
  resetForm,
  hide,
  notification
) {
  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
      style: {
        padding: '9px 24px',
      },
    });
  };

  const handleSuccess = (action) => {
    console.log(`${action} success`);
    if (action === 'create') {
      resetForm();
    }
    hide();
    openNotificationWithIcon(
      'success',
      `Contract ${action === 'update' ? 'updated' : 'created'} successfully.`
    );
  };

  const handleError = (action, err) => {
    console.log(err);
    openNotificationWithIcon(
      'error',
      `Error ${action === 'update' ? 'updating' : 'creating'} contract.`
    );
  };

  if (clientId) {
    contracts
      .updateContractsData(clientId, postData)
      .then((res) => handleSuccess('update'))
      .catch((err) => handleError('update', err));
  } else {
    contracts
      .addContractsData(postData)
      .then((res) => handleSuccess('add'))
      .catch((err) => handleError('add', err));
  }
}

export default handleContractAction;
