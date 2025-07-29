import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// components
import Layout from "./components/Layout/Layout.jsx"
import ProtectedRoute from "./components/Protected/ProtectedRoute.jsx"
import SingInProtected from './components/Protected/SingInProtected.jsx'

// Account
import SignIn from './pages/Accounts/Sign-in/SignIn'

// Admin
import Dashboard from "./pages/Admin/Dashboard/Dashboard.jsx"
import Reports from './pages/Admin/Reports/Reports.jsx';
import SettingsPage from './pages/Admin/SettingsPage/SettingsPage.jsx'
import AllMembers from './pages/Admin/Team/Allmembers.jsx';
import AddMember from './pages/Admin/Team/AddMember.jsx';
import CreateRole from './pages/Admin/Team/CreateRole.jsx';
import Roles from './pages/Admin/Team/Roles.jsx';
import EditMember  from './pages/Admin/Team/EditMember.jsx'
import EditRole from './pages/Admin/Team/EditRole.jsx';
import AddDepartment from './pages/Admin/Team/AddDepartment.jsx';

// Project Manager
import AllProjects from './pages/Project_Manager/Projects/AllProject.jsx';
import NewProject from './pages/Project_Manager/Projects/NewProject.jsx';
import EditProject from './pages/Project_Manager/Projects/EditProject.jsx';
import Tasks from './pages/Project_Manager/Tasks/Tasks.jsx';
import AddTask from './pages/Project_Manager/Tasks/AddTask.jsx';
import Invoices from "./pages/Project_Manager/Invoices/Invoices.jsx"
import AddInvoice from './pages/Project_Manager/Invoices/AddInvoice.jsx';
import PrintInvoice from './pages/Project_Manager/Invoices/PrintInvoice.jsx';

// Sales
import Contacts from "./pages/Sales/Contacts/Contacts.jsx"
import AddContact from "./pages/Sales/Contacts/AddContact.jsx"
import EditContact from "./pages/Sales/Contacts/EditContact.jsx"
import Clients from './pages/Sales/Clients/Clients.jsx';
import AddClient from "./pages/Sales/Clients/AddClient.jsx"
import EditClient from "./pages/Sales/Clients/EditClient.jsx"
import ClientPreview from "./pages/Sales/Clients/ClientPreview.jsx"

// Production Team
import MyTasks from './pages/Production_Team/Developers/MyTasks.jsx'
import MyProjects from './pages/Production_Team/Developers/MyProjects.jsx'


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

        {/*Production Team Routes */}
        <Route path="/mytasks/alltasks" element={<ProtectedLayout allowedRoles={['Developer','Designer']}><MyTasks /></ProtectedLayout>} />
        <Route path="/myprojects/allprojects" element={<ProtectedLayout allowedRoles={['Developer','Designer']}><MyProjects/></ProtectedLayout>} />


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
