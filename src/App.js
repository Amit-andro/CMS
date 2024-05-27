import React, { useEffect } from 'react';
import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import {
  LaptopOutlined,
  ProjectOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme, Flex } from 'antd';
import AllClient from './components/clientPages/AllClient';
import Dashboard from './components/dashboard/Dashboard';
import Projects from './components/projectPages/Project';
import Nda from './components/clientPages/Nda';
import Msa from './components/clientPages/Msa';
import Sow from './components/projectPages/Sow';
import Cr from './components/projectPages/Cr';
import Po from './components/projectPages/Po';
import Notification from './components/headerItems/Notification';
import User from './components/headerItems/User';
import ClientDetail from './components/clientPages/ClientDetail';
import ContractDetailPage from './components/other/ContractDetailPage';
import PendingContracts from './components/contractPages/PendingContracts';
import ProjectsDetail from './components/other/ProjectsDetail';
import ProtectedRoute from './ProtectedRoute';
import GetRole from './GetRole.utils';

const { Header, Sider } = Layout;
const { SubMenu } = Menu;

const navMenuItems = [
  {
    key: `Dashboard`,
    icon: React.createElement(LaptopOutlined),
    label: `Dashboard`,
    path: '/',
  },
  {
    key: `Clients`,
    icon: React.createElement(UserOutlined),
    label: `Manage Clients`,
    children: [
      { key: 'clients', label: 'Clients', path: '/clients' },
      { key: 'nda', label: 'NDA', title: 'Non-Disclosure Agreement', path: '/nda' },
      { key: 'msa', label: 'MSA', title: 'Master Service Agreement', path: '/msa' },
    ],
  },
  {
    key: `Projects`,
    icon: React.createElement(ProjectOutlined),
    label: `Engagements`,
    children: [
      { key: 'Projects', label: 'Engagement/Projects', title: 'Engagement/Projects', path: '/projects' },
      { key: 'SOW', label: 'SOW', title: 'Statement of Work', path: '/sow' },
      { key: 'PO', label: 'PO', title: 'Purchase order', path: '/po' },
      { key: 'CR', label: 'CR', title: 'Change Request', path: '/cr' },
    ],
  },
];

if (GetRole() !== 'bdTeam') {
  navMenuItems.push({
    key: 'contracts',
    icon: React.createElement(FileTextOutlined),
    label: 'Manage Contracts',
    className: 'manage-contracts',
    children: [
      {
        key: 'pendingContracts',
        label: 'Pending Approvals',
        path: '/pendingApprovals',
      },
    ],
  });
}

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();

  const colorPath = () => {
    const splitUrl = location.pathname.split('/');
    const allEmpty = splitUrl.every((element) => element === '');
    if (!isNaN(splitUrl[splitUrl.length - 1]) && !allEmpty) {
      if (splitUrl[1] === 'contract') {
        splitUrl.splice(1, 1);
      }
      splitUrl.pop();
      return splitUrl.join('/');
    } else {
      return splitUrl.join('/');
    }
  };

  return (
    <Layout style={{ height: '100%' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 23px',
        }}
      >
        <Flex>
          <img
            src="https://spanidea.com/in/wp-content/uploads/2022/08/png-white-logo-300x53.png"
            alt="logo"
            style={{ height: '30px' }}
          />
        </Flex>
        <Flex gap="20px">
          <Notification />
          <User />
        </Flex>
      </Header>
      <Layout>
        <Sider
          width={200}
          style={{
            background: colorBgContainer,
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[colorPath()]}
            defaultOpenKeys={['Clients', 'Projects', 'contracts']}
            style={{
              height: '100%',
              borderRight: 0,
            }}
          >
            {navMenuItems.map((menuItem) => {
              if (menuItem.children) {
                return (
                  <SubMenu
                    key={menuItem.key}
                    icon={menuItem.icon}
                    title={menuItem.label}
                  >
                    {menuItem.children.map((child) => (
                      <Menu.Item key={child.path} title={child.title}>
                        <Link to={child.path}>{child.label}</Link>
                      </Menu.Item>
                    ))}
                  </SubMenu>
                );
              }  else {
                return (
                  <Menu.Item key={menuItem.path} icon={menuItem.icon} title={menuItem.title}>
                    <Link to={menuItem.path}>{menuItem.label}</Link>
                  </Menu.Item>
                );
              }
            })}
          </Menu>
        </Sider>
        <Layout className="contentWrapper">
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Routes>
              <Route
                path="/"
                element={<ProtectedRoute Component={Dashboard} />}
              />
              <Route path="/clients" element={<AllClient />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route
                path="/contract/:contractType/:id"
                element={<ContractDetailPage />}
              />
              <Route path="/nda" element={<Nda />} />
              <Route path="/msa" element={<Msa />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectsDetail />} />
              <Route path="/sow" element={<Sow />} />
              <Route path="/cr" element={<Cr />} />
              <Route path="/po" element={<Po />} />

              <Route
                path="/pendingApprovals"
                element={<ProtectedRoute Component={PendingContracts} />}
              />
            </Routes>
          </div>
        </Layout>
      </Layout>
    </Layout>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
