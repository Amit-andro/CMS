import axios from 'axios';
import Cookies from 'js-cookie';

const getToken = Cookies.get('token');

const instance = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE}/`,
  headers: {
    // 'ngrok-skip-browser-warning': true,
    Authorization: `Bearer ${getToken && JSON.parse(getToken.split('j:')[1]).token}`,
  },
  // timeout: 15000,
});

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
      }
    }
    return Promise.reject(error);
  }
);

const responseBody = (response) => response.data;

const requests = {
  get: (url) => instance.get(url).then(responseBody),
  post: (url, body) =>
    instance
      .post(url, body)
      .then(responseBody),

  put: (url, body) => instance.put(url, body, {}).then(responseBody),
};

export const dashboardApi = {
  getContracts: (day) => {
    const params = new URLSearchParams();
    if (day) params.append('day', day);
    return requests.get(`api/dashboard/get?${params}`);
  },
  getGraphData: (day) => {
    const params = new URLSearchParams();
    if (day) params.append('day', day);
    return requests.get(`api/dashboard/graph/get?${params}`);
  },

  getGraphDataForExpired: (day) => {
    const params = new URLSearchParams();
    if (day) params.append('day', day);
    return requests.get(`/api/dashboard//graph/last-expiry/get?${params}`);
  },
};

export const clientsApi = {
  getAllClientData: (
    seId,
    page,
    sortField,
    sortOrder,
    filter,
    search,
    withoutContract
  ) => {
    const params = new URLSearchParams();

    if (seId) params.append('seId', seId);
    if (page) params.append('page', page);
    if (sortField) params.append('sortField', sortField);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (filter) params.append('filterField', filter);
    if (search) params.append('search', search);
    if (withoutContract) params.append('withoutContract', withoutContract);

    return requests.get(`/api/client/get/all?${params.toString()}`);
  },
  getClientData: (
    clientId,
    page,
    status,
    sortField,
    sortOrder,
    filter,
    search
  ) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (status) params.append('status', status);
    if (sortField) params.append('sortField', sortField);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (filter) params.append('filterField', filter);
    if (search) params.append('search', search);

    return requests.get(`api/client/get/${clientId}?${params.toString()}`);
  },
  getClientOtherContracts: (
    clientId,
    page,
    status,
    sortField,
    sortOrder,
    filter,
    search
  ) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (status) params.append('status', status);
    if (sortField) params.append('sortField', sortField);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (filter) params.append('filterField', filter);
    if (search) params.append('search', search);

    return requests.get(
      `api/client/get/othercontract/${clientId}?${params.toString()}`
    );
  },
  getEmployeeName: (data) => requests.get('/api/employee/get/all', data),
  addClientData: (data) => requests.post('/api/client/create', data),
  updateClientData: (clientId, data) =>
    requests.put(`/api/client/update/${clientId}`, data),
};

export const contracts = {
  clientNameList: (typeId, search) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);

    return requests.get(`/api/client/get/list/${typeId}?${params.toString()}`)
  },
  contractsAllData: (
    page,
    file,
    status,
    sortField,
    sortOrder,
    filterField,
    search,
    expiredDays
  ) => {
    const params = new URLSearchParams();

    if (page) params.append('page', page);
    if (file) params.append('name', file);
    if (status) params.append('status', status);
    if (sortField) params.append('sortField', sortField);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (filterField) params.append('filterField', filterField);
    if (search) params.append('search', search);
    if (expiredDays) params.append('expiredDays', expiredDays);

    return requests.get(`/api/contract/get/all?${params.toString()}`);
  },
  getContractsData: (clientId) => requests.get(`/api/contract/get/${clientId}`),
  getActivityData: (contractId) =>
    requests.get(`/api/contract/get/activity/${contractId}`),
  getProjectName: (data) => requests.get('/api/project/get/list', data),
  getBusinessUnitData: (data) =>
    requests.get('/api/businessunit/get/all', data),
  addContractsData: (data) => requests.post('/api/contract/create', data),
  updateContractsData: (clientId, data) =>
    requests.put(`/api/contract/update/${clientId}`, data),
  pendingContracts: (page, sortField, sortOrder, filterField, search) => {
    const params = new URLSearchParams();

    if (page) params.append('page', page);
    if (sortField) params.append('sortField', sortField);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (filterField) params.append('filterField', filterField);
    if (search) params.append('search', search);

    return requests.get(`/api/contract/get/pending?${params.toString()}`);
  },
  FileDataAPI: (data) => requests.post('/api/contract/fileupload', data),
  getProjectDropDown: (clientId) =>
    requests.get(`/api/project/get/list/${clientId}`),
  getSowDropDown: (projectId) =>
    requests.get(`/api/contract/get/sow/list/${projectId}`),
  getpocDropDown: (pocId) =>
    requests.get(`/api/contract/get/poc/list/${pocId}`),
};

export const projectApi = {
  getAllProjectData: (page, sortField, sortOrder, filterField, search) => {
    const params = new URLSearchParams();

    if (page) params.append('page', page);
    if (sortField) params.append('sortField', sortField);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (filterField) params.append('filterField', filterField);
    if (search) params.append('search', search);

    return requests.get(`/api/project/get/all?${params.toString()}`);
  },
  getProjectData: (
    clientId,
    page,
    status,
    sortField,
    sortOrder,
    filterField,
    search
  ) => {
    const params = new URLSearchParams();

    if (page) params.append('page', page);
    if (status) params.append('status', status);
    if (sortField) params.append('sortField', sortField);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (filterField) params.append('filterField', filterField);
    if (search) params.append('search', search);
    console.log("params", params)

    return requests.get(`/api/project/get/${clientId}/?${params.toString()}`);
  },
  getEmployeeName: (data) => requests.get('/api/employee/get', data),
  addProjectData: (data) => requests.post('/api/project/create', data),
  updateProjectData: (clientId, data) =>
    requests.put(`/api/project/update/${clientId}`, data),
};

export const commentsApi = {
  getAllComments: (contractId) =>
    requests.get(`/api/comment/get/${contractId}`),
  addComments: (data) => requests.post(`/api/comment/create`, data),
};
