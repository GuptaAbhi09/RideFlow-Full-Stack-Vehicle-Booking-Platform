import React from 'react'
import { format } from 'date-fns'
import { MapPin, Navigation, IndianRupee } from 'lucide-react'

interface ReceiptPDFProps {
  booking: any;
}

const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ booking }) => {
  if (!booking) return null;

  const totalFare = booking.fare || 0;
  const baseFare = totalFare * 0.8; // Example: 80% is base fare
  const tax = totalFare * 0.2; // Example: 20% is tax

  return (
    <div id="receipt-pdf" className="w-[800px] bg-white text-black p-10 font-sans" style={{ position: 'absolute', top: 0, left: 0, zIndex: -50 }}>
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">RideFlow</h1>
          <p className="text-gray-500 mt-2 font-medium">Receipt for your ride on {format(new Date(booking.createdAt), 'MMM dd, yyyy')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 uppercase font-semibold tracking-wider">Total Amount</p>
          <p className="text-4xl font-bold text-gray-900 mt-1">₹{totalFare.toFixed(2)}</p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-2xl">
        <div>
          <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
          <p className="font-medium text-gray-900 font-mono text-sm">{booking.paymentId || booking._id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Payment Status</p>
          <p className="font-bold text-emerald-600 uppercase text-sm tracking-wider">{booking.paymentStatus || 'Pending'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Vehicle Type</p>
          <p className="font-medium text-gray-900 capitalize">{booking.vehicleType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Driver</p>
          <p className="font-medium text-gray-900">{booking.driverId?.name || 'Driver Name'}</p>
        </div>
      </div>

      {/* Route */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Trip Route</h3>
        <div className="flex flex-col gap-6 relative before:absolute before:left-[11px] before:top-8 before:bottom-8 before:w-0.5 before:bg-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup</p>
              <p className="text-gray-900 font-medium">{booking.pickup}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
              <MapPin size={12} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Drop-off</p>
              <p className="text-gray-900 font-medium">{booking.drop}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Breakdown */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Fare Breakdown</h3>
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <p className="text-gray-600">Base Fare</p>
          <p className="text-gray-900 font-medium">₹{baseFare.toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <p className="text-gray-600">Taxes & Fees (20%)</p>
          <p className="text-gray-900 font-medium">₹{tax.toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center py-4 mt-2">
          <p className="text-xl font-bold text-gray-900">Total Charged</p>
          <p className="text-2xl font-extrabold text-blue-600">₹{totalFare.toFixed(2)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
        <p>Thank you for riding with RideFlow.</p>
        <p className="mt-1">This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  )
}

export default ReceiptPDF
