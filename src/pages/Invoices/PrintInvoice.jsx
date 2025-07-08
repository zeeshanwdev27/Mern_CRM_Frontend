import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPrinter, FiDownload, FiChevronLeft } from "react-icons/fi";

const PrintInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/api/invoices/${id}/print`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setInvoice(response.data.data);
        } else {
          throw new Error("Failed to fetch invoice");
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  // const handleDownload = () => {
  //   const content = document.querySelector('.border.border-gray-200.rounded-lg.p-8').outerHTML;
  //   const blob = new Blob([content], { type: 'text/html' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `Invoice_${invoice.invoiceNumber}.html`;
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  // };

  if (loading) return <div>Loading invoice...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white print:p-0 print:max-w-none">
      <style>
        {`
          @media print {
            .print-hidden { display: none !important; }
            @page { margin: 0; }
            footer { display: none !important; }
            header { display: none !important; }
            nav { display: none !important; }
            .search-bar { display: none !important; }
          }
        `}
      </style>
      {/* Print controls (hidden when printing) */}
      <div className="flex justify-between mb-6 print-hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
        >
          <FiChevronLeft /> Back
        </button>
        <div className="flex gap-1">
          {/* <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg mr-2"
          >
            <FiDownload /> Download
          </button> */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <FiPrinter /> Print
          </button>
        </div>
      </div>

      {/* Invoice content */}
      <div className="border border-gray-200 rounded-lg p-8 print:border-0 print:p-0">
        {/* Invoice header */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Invoice #{invoice.invoiceNumber}
            </h1>
            <p className="text-gray-500">
              Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
            </p>
          </div>

          {/* Removed Invoice "Status" */}
          {/* <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
            invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {invoice.status}
          </div> */}
        </div>

        {/* Client and company info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="font-medium mb-2">From</h2>
            <p>Your Company Name</p>
            <p>123 Business Street</p>
            <p>City, State ZIP</p>
          </div>
          <div>
            <h2 className="font-medium mb-2">To</h2>
            <p>{invoice.client?.name || "N/A"}</p>
            <p>{invoice.client?.company || ""}</p>
            <p>{invoice.client?.address || ""}</p>
            <p>
              {invoice.client?.city}, {invoice.client?.state}{" "}
              {invoice.client?.zip}
            </p>
          </div>
        </div>

        {/* Invoice details */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-medium">Invoice Date</p>
              <p>{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-medium">Due Date</p>
              <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          {invoice.paidDate && (
            <div>
              <p className="font-medium">Paid Date</p>
              <p>{new Date(invoice.paidDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Items table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-2">Description</th>
                <th className="text-right pb-2">Qty</th>
                <th className="text-right pb-2">Price</th>
                <th className="text-right pb-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">${item.price.toFixed(2)}</td>
                  <td className="py-3 text-right">
                    ${(item.quantity * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax ({invoice.taxRate}%):</span>
              <span>${invoice.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
              <span>Total:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes and terms */}
        {invoice.notes && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h2 className="font-medium mb-2">Notes</h2>
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        )}

        {invoice.terms && (
          <div className="mt-4">
            <h2 className="font-medium mb-2">Terms</h2>
            <p className="text-gray-700">{invoice.terms}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintInvoice;
