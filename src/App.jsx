import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/Protected/ProtectedRoute.jsx"
import SignIn from './pages/Accounts/Sign-in/SignIn'
// import LogOut from './pages/Accounts/Log-out/LogOut.jsx';
import Layout from "./components/Layout/Layout.jsx"
import Dashboard from "./pages/Dashboard/Dashboard.jsx"
import Clients from './pages/Clients/Clients.jsx';
import Contacts from "./pages/Contacts/Contacts.jsx"
import AllProjects from './pages/Projects/AllProject.jsx';
import AllMembers from './pages/Team/Allmembers.jsx';
import AddMember from './pages/Team/AddMember.jsx';
import Tasks from './pages/Tasks/Tasks.jsx';
import Invoices from "./pages/Invoices/Invoices.jsx"
import Reports from './pages/Reports/Reports.jsx';
import SettingsPage from './pages/SettingsPage/SettingsPage.jsx'
import Roles from './pages/Team/Roles.jsx';
import CreateRole from './pages/Team/CreateRole.jsx';

import EditMember  from './pages/Team/EditMember.jsx'
import EditRole from './pages/Team/EditRole.jsx';
import AddDepartment from './pages/Team/AddDepartment.jsx';
import AddContact from "./pages/Contacts/AddContact.jsx"
import EditContact from "./pages/Contacts/EditContact.jsx"

import AddClient from "./pages/Clients/AddClient.jsx"
import EditClient from "./pages/Clients/EditClient.jsx"
import ClientPreview from "./pages/Clients/ClientPreview.jsx"

import NewProject from './pages/Projects/NewProject.jsx';
import EditProject from './pages/Projects/EditProject.jsx';

import AddTask from './pages/Tasks/AddTask.jsx';
import AddInvoice from './pages/Invoices/AddInvoice.jsx';
import PrintInvoice from './pages/Invoices/PrintInvoice.jsx';

import SingInProtected from './components/Protected/SingInProtected.jsx'

import { ToastContainer, Bounce } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


const ProtectedLayout = ({ children, allowedRoles = [] }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);


function App() {

  return (
    <>
    <Router>
      <Routes>
        {/* Admin-only Routes */}
        <Route path="/dashboard" element={<ProtectedLayout allowedRoles={['Administrator', 'Manager']}><Dashboard /></ProtectedLayout>} />
        <Route path="/reports" element={<ProtectedLayout allowedRoles={['Administrator', 'Manager']}><Reports /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout allowedRoles={['Administrator']}><SettingsPage /></ProtectedLayout>} />


        {/* Sales Routes */}
        <Route path="/contacts" element={<ProtectedLayout allowedRoles={['Sales']}><Contacts /></ProtectedLayout>} />
        <Route path="/contacts/add" element={<ProtectedLayout allowedRoles={['Sales']}><AddContact /></ProtectedLayout>} />
        <Route path="/contacts/edit/:id" element={<ProtectedLayout allowedRoles={['Sales']}><EditContact /></ProtectedLayout>} />
        <Route path="/clients" element={<ProtectedLayout allowedRoles={['Sales']}><Clients /></ProtectedLayout>} />
        <Route path="/clients/add" element={<ProtectedLayout allowedRoles={['Sales']}><AddClient /></ProtectedLayout>} />
        <Route path="/clients/add/:id" element={<ProtectedLayout allowedRoles={['Sales']}><AddClient /></ProtectedLayout>} />
        <Route path="/clients/edit" element={<ProtectedLayout allowedRoles={['Sales']}><EditClient /></ProtectedLayout>} />{/* remove /clients/edit/:id , bcz _id send through url "state"*/}
        <Route path="/clients/preview" element={<ProtectedLayout allowedRoles={['Sales']}><ClientPreview /></ProtectedLayout>} />


        {/* ProjectManager Routes */}
        <Route path="/tasks" element={<ProtectedLayout allowedRoles={['Project Manager']}><Tasks /></ProtectedLayout>} />
        <Route path="/tasks/add" element={<ProtectedLayout allowedRoles={['Project Manager']}><AddTask /></ProtectedLayout>} />
        <Route path="/invoices" element={<ProtectedLayout allowedRoles={['Project Manager']}><Invoices /></ProtectedLayout>} />
        <Route path="/invoices/add" element={<ProtectedLayout allowedRoles={['Project Manager']}><AddInvoice /></ProtectedLayout>} />
        <Route path="/invoices/:id/print" element={<ProtectedLayout allowedRoles={['Project Manager']}><PrintInvoice /></ProtectedLayout>} />
        
        <Route path="/projects" element={<ProtectedLayout allowedRoles={['Project Manager']}><AllProjects /></ProtectedLayout>} />
        <Route path="/projects/newproject" element={<ProtectedLayout allowedRoles={['Project Manager']}><NewProject /></ProtectedLayout>} />
        <Route path="/projects/editproject/:id" element={<ProtectedLayout allowedRoles={['Project Manager']}><EditProject /></ProtectedLayout>} />


        {/* Manager Routes */}
        <Route path="/team/add" element={<ProtectedLayout allowedRoles={['Administrator','Manager']}><AddMember /></ProtectedLayout>} />
        <Route path="/team/all-members" element={<ProtectedLayout allowedRoles={['Administrator','Manager']}><AllMembers /></ProtectedLayout>} />
        <Route path="/team/roles" element={<ProtectedLayout allowedRoles={['Administrator','Manager']}><Roles /></ProtectedLayout>} />
        <Route path="/team/roles/add" element={<ProtectedLayout allowedRoles={['Administrator','Manager']}><CreateRole /></ProtectedLayout>} />
        <Route path="/team/edit/:id" element={<ProtectedLayout allowedRoles={['Administrator','Manager']}><EditMember /></ProtectedLayout>} />
        <Route path="/team/roles/edit/:id" element={<ProtectedLayout allowedRoles={['Administrator','Manager']}><EditRole /></ProtectedLayout>} />
        <Route path="/team/departments/add" element={<ProtectedLayout allowedRoles={['Administrator','Manager']}><AddDepartment /></ProtectedLayout>} />




        <Route path='/' element={<SingInProtected><SignIn /></SingInProtected>} />
        <Route path='/signin' element={<SingInProtected><SignIn /></SingInProtected>} />
        {/* <Route path='/logout' element={<LogOut />} /> */}
      </Routes>
    </Router>


    {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />




    </>
  )
}

export default App
