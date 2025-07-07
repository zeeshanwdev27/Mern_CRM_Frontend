import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/Protected/ProtectedRoute.jsx"
import SignIn from './pages/Accounts/Sign-in/SignIn'
import LogOut from './pages/Accounts/Log-out/LogOut.jsx';
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


const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);


function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/contacts" element={<ProtectedLayout><Contacts /></ProtectedLayout>} />
        <Route path="/team/all-members" element={<ProtectedLayout><AllMembers /></ProtectedLayout>} />
        <Route path="/team/add" element={<ProtectedLayout><AddMember /></ProtectedLayout>} />
        <Route path="/team/roles" element={<ProtectedLayout><Roles /></ProtectedLayout>} />
        <Route path="/team/roles/add" element={<ProtectedLayout><CreateRole /></ProtectedLayout>} />
        <Route path="/team/edit/:id" element={<ProtectedLayout><EditMember /></ProtectedLayout>} />
        <Route path="/team/roles/edit/:id" element={<ProtectedLayout><EditRole /></ProtectedLayout>} />
        <Route path="/team/departments/add" element={<ProtectedLayout><AddDepartment /></ProtectedLayout>} />
        <Route path="/contacts/add" element={<ProtectedLayout><AddContact /></ProtectedLayout>} />
        <Route path="/contacts/edit/:id" element={<ProtectedLayout><EditContact /></ProtectedLayout>} />
        <Route path="/clients" element={<ProtectedLayout><Clients /></ProtectedLayout>} />
        <Route path="/clients/add" element={<ProtectedLayout><AddClient /></ProtectedLayout>} />
        <Route path="/clients/add/:id" element={<ProtectedLayout><AddClient /></ProtectedLayout>} />
        <Route path="/clients/edit" element={<ProtectedLayout><EditClient /></ProtectedLayout>} />{/* remove /clients/edit/:id , bcz _id send through url "state"*/}
        <Route path="/clients/preview" element={<ProtectedLayout><ClientPreview /></ProtectedLayout>} />
        <Route path="/projects" element={<ProtectedLayout><AllProjects /></ProtectedLayout>} />
        <Route path="/projects/newproject" element={<ProtectedLayout><NewProject /></ProtectedLayout>} />
        <Route path="/projects/editproject/:id" element={<ProtectedLayout><EditProject /></ProtectedLayout>} />
        <Route path="/tasks/add" element={<ProtectedLayout><AddTask /></ProtectedLayout>} />




        <Route path="/tasks" element={<ProtectedLayout><Tasks /></ProtectedLayout>} />
        <Route path="/invoices" element={<ProtectedLayout><Invoices /></ProtectedLayout>} />
        <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />


        <Route path='/' element={<SignIn />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/logout' element={<LogOut />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
