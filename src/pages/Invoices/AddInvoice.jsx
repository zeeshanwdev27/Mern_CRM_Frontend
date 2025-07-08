import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiMinus,
  FiTrash2,
  FiChevronDown,
  FiCalendar,
  FiSave,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiEdit
} from 'react-icons/fi';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AddInvoice = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [customInvoiceId, setCustomInvoiceId] = useState('');
  const [useCustomId, setUseCustomId] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'Pending',
    selectedProjects: [],
    items: [],
    notes: '',
    terms: 'Payment due within 30 days',
    taxRate: 10, // Default tax rate
  });

  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get("http://localhost:3000/api/clients/getclients", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data && response.data.data.getClients) {
          setClients(response.data.data.getClients);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Calculate totals whenever items or tax rate changes
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const tax = subtotal * (formData.taxRate / 100);
    const total = subtotal + tax;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  }, [formData.items, formData.taxRate]);

  // Handle client selection
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      clientId: client._id,
      selectedProjects: [],
      items: []
    }));
    setShowClientDropdown(false);
  };

  // Handle project selection
  const toggleProjectSelection = (project) => {
    setFormData(prev => {
      const isSelected = prev.selectedProjects.includes(project._id);
      let newSelectedProjects;
      let newItems;

      if (isSelected) {
        // Remove project
        newSelectedProjects = prev.selectedProjects.filter(id => id !== project._id);
        newItems = prev.items.filter(item => item.projectId !== project._id);
      } else {
        // Add project
        newSelectedProjects = [...prev.selectedProjects, project._id];
        newItems = [
          ...prev.items,
          {
            projectId: project._id,
            description: project.name,
            quantity: 1,
            price: project.value,
            taxRate: formData.taxRate, // Default to global tax rate
            amount: project.value * (1 + (formData.taxRate / 100)) // Include tax in line total
          }
        ];
      }

      return {
        ...prev,
        selectedProjects: newSelectedProjects,
        items: newItems
      };
    });
  };

  // Handle item quantity change
  const handleQuantityChange = (projectId, quantity) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.projectId === projectId 
          ? { 
              ...item, 
              quantity: quantity || 1,
              amount: (quantity || 1) * item.price * (1 + (item.taxRate / 100))
            } 
          : item
      )
    }));
  };

  // Handle item tax rate change
  const handleItemTaxChange = (projectId, taxRate) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.projectId === projectId 
          ? { 
              ...item, 
              taxRate: taxRate || 0,
              amount: item.quantity * item.price * (1 + ((taxRate || 0) / 100))
            } 
          : item
      )
    }));
  };

  // Handle global tax rate change
  const handleGlobalTaxChange = (taxRate) => {
    setFormData(prev => ({
      ...prev,
      taxRate: taxRate || 0,
      items: prev.items.map(item => ({
        ...item,
        taxRate: taxRate || 0,
        amount: item.quantity * item.price * (1 + ((taxRate || 0) / 100))
      }))
    }));
  };

  // Handle status selection
  const handleStatusSelect = (status) => {
    setFormData(prev => ({
      ...prev,
      status
    }));
    setShowStatusDropdown(false);
  };

  // Toggle custom invoice ID
  const toggleCustomInvoiceId = () => {
    setUseCustomId(!useCustomId);
    if (!useCustomId) {
      setCustomInvoiceId(generateInvoiceNumber(selectedClient, formData.selectedProjects.length));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        // Use custom ID if provided, otherwise generate one
        const invoiceNumber = useCustomId ? customInvoiceId : generateInvoiceNumber(selectedClient, formData.selectedProjects.length);
        
        const invoiceData = {
            ...formData,
            invoiceNumber,
            invoiceDate: formData.invoiceDate.toISOString(),
            dueDate: formData.dueDate.toISOString(),
            customInvoiceId: useCustomId ? customInvoiceId : null
        };
        
        console.log(invoiceData);

      const response = await axios.post(
        "http://localhost:3000/api/invoices/create",
        invoiceData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      

      if (response.data.success) {
        setSuccessMessage("Invoice created successfully!");
        setSuccess(true);
        setTimeout(() => {
          navigate('/invoices');
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate invoice number
  const generateInvoiceNumber = (client, projectCount) => {
    if (!client) return 'INV-0001';
    const now = new Date();
    const prefix = client.company.substring(0, 4).toUpperCase().replace(/\s/g, '');
    const year = now.getFullYear();
    const seq = (projectCount + 1).toString().padStart(4, '0');
    return `${prefix}-${year}-${seq}`;
  };

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-700">Loading client data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-lg font-medium text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Invoice</h1>
          <button
            onClick={() => navigate('/invoices')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={18} />
            Cancel
          </button>
        </div>

        {success && (
          <div className="mb-6 p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-3 border border-emerald-200">
            <div className="font-medium text-sm">{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Invoice ID Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
              <button
                type="button"
                onClick={toggleCustomInvoiceId}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <FiEdit size={14} />
                {useCustomId ? 'Use Auto-generated' : 'Set Custom ID'}
              </button>
            </div>
            
            {useCustomId ? (
              <input
                type="text"
                value={customInvoiceId}
                onChange={(e) => setCustomInvoiceId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                placeholder="Enter custom invoice number"
                required
              />
            ) : (
              <div className="px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                {generateInvoiceNumber(selectedClient, formData.selectedProjects.length)}
              </div>
            )}
          </div>

          {/* Client Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowClientDropdown(!showClientDropdown)}
                className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left text-gray-700"
              >
                {selectedClient ? (
                  <div>
                    <div className="font-medium">{selectedClient.name}</div>
                    <div className="text-sm text-gray-500">{selectedClient.company}</div>
                  </div>
                ) : (
                  <span className="text-gray-400">Select a client</span>
                )}
                <FiChevronDown className="text-gray-400" />
              </button>
              
              {showClientDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-auto">
                  {clients.map(client => (
                    <div
                      key={client._id}
                      onClick={() => handleClientSelect(client)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.company}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {client.projects.length} projects
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Global Tax Rate */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Tax Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.taxRate}
              onChange={(e) => handleGlobalTaxChange(parseFloat(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Project Selection */}
          {selectedClient && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Projects</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
                  className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left text-gray-700"
                >
                  <span>
                    {formData.selectedProjects.length > 0 
                      ? `${formData.selectedProjects.length} projects selected`
                      : 'Select projects to include'}
                  </span>
                  <FiChevronDown className="text-gray-400" />
                </button>
                
                {showProjectsDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-auto">
                    {selectedClient.projects.map(project => (
                      <div
                        key={project._id}
                        onClick={() => toggleProjectSelection(project)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            }).format(project.value)}
                          </div>
                        </div>
                        {formData.selectedProjects.includes(project._id) && (
                          <FiCheck className="text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
              <DatePicker
                selected={formData.invoiceDate}
                onChange={(date) => setFormData(prev => ({ ...prev, invoiceDate: date }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                dateFormat="MMMM d, yyyy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <DatePicker
                selected={formData.dueDate}
                onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                dateFormat="MMMM d, yyyy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left text-gray-700"
                >
                  {formData.status}
                  <FiChevronDown className="text-gray-400" />
                </button>
                
                {showStatusDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200">
                    {['Draft', 'Pending', 'Paid', 'Overdue'].map(status => (
                      <div
                        key={status}
                        onClick={() => handleStatusSelect(status)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Projects Table */}
          {formData.selectedProjects.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Items</label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 bg-gray-50 px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-4">Project</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-2">Tax (%)</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-1"></div>
                </div>

                {formData.items.map((item) => {
                  const project = selectedClient?.projects.find(p => p._id === item.projectId);
                  return (
                    <div key={item.projectId} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200 last:border-0">
                      {/* Project Name */}
                      <div className="col-span-4 flex items-center">
                        <div>
                          <div className="font-medium">{project?.name}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-1">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.projectId, parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-center"
                        />
                      </div>
                      
                      {/* Unit Price */}
                      <div className="col-span-2 flex items-center">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(item.price)}
                      </div>
                      
                      {/* Tax Rate */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={item.taxRate}
                          onChange={(e) => handleItemTaxChange(item.projectId, parseFloat(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      {/* Amount (including tax) */}
                      <div className="col-span-2 flex items-center">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(item.amount)}
                      </div>
                      
                      {/* Remove button */}
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => toggleProjectSelection(project)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg h-32"
                placeholder="Any additional notes..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms</label>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg h-32"
                placeholder="Payment terms..."
              />
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(formData.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(formData.tax || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 font-bold">Total:</span>
                <span className="font-bold text-lg">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(formData.total || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedClient || formData.selectedProjects.length === 0 || loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              <FiSave size={18} />
              {loading ? 'Creating Invoice...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInvoice;