"use client"

import React, { useEffect, useState } from 'react'
import { Navigation, MapPin, IndianRupee, Download, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import ReceiptPDF from '@/components/ReceiptPDF'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'
import { toast } from 'react-hot-toast'

export default function RideHistoryPage() {
  const [rides, setRides] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activePdfBooking, setActivePdfBooking] = useState<any | null>(null)
  const [isDownloading, setIsDownloading] = useState<string | null>(null) // Stores booking ID currently downloading

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/bookings/history')
      const data = await res.json()
      if (data.success) {
        setRides(data.data)
      }
    } catch (e) {
      toast.error("Failed to fetch history")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async (booking: any) => {
    setIsDownloading(booking._id)
    
    // 1. Temporarily mount the active booking to the hidden PDF component
    setActivePdfBooking(booking)

    // 2. Wait a bit for React to render the hidden component to the DOM and for fonts to load
    setTimeout(async () => {
      try {
        const element = document.getElementById('receipt-pdf');
        if (!element) throw new Error("PDF Template not found");

        // 3. Take a high-quality snapshot of the HTML using html-to-image
        // Workaround for the "Blank Image" bug: Call it once to trigger layout/fonts, then again to capture
        await toPng(element); 
        const imgData = await toPng(element, { 
            pixelRatio: 2,
            backgroundColor: '#ffffff'
        });

        // 4. Create the PDF and fit the image
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        // Since we don't have canvas height natively, we estimate ratio from element dimensions
        const ratio = element.offsetHeight / element.offsetWidth;
        const pdfHeight = pdfWidth * ratio;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // 5. Download it!
        pdf.save(`RideFlow_Invoice_${booking.paymentId || booking._id}.pdf`);
        toast.success("Invoice downloaded successfully!");
      } catch (error) {
        console.error("PDF Gen Error:", error);
        toast.error("Failed to generate PDF");
      } finally {
        setIsDownloading(null)
        setActivePdfBooking(null)
      }
    }, 300); // 300ms delay gives DOM time to paint
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      
      {/* Hidden PDF Renderer */}
      <ReceiptPDF booking={activePdfBooking} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-8">My Rides</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-20 bg-[#121212] rounded-2xl border border-white/5">
            <Navigation className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No past rides</h3>
            <p className="text-gray-400">You haven't taken any trips yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {rides.map((ride) => (
              <div key={ride._id} className="bg-[#121212] border border-white/5 rounded-2xl p-6 transition-all hover:border-white/10">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white capitalize">{ride.vehicleType} Ride</h3>
                    <p className="text-sm text-gray-400">{format(new Date(ride.createdAt), 'MMMM dd, yyyy • h:mm a')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
                      ride.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {ride.status === 'completed' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span className="capitalize">{ride.status}</span>
                    </div>
                    <span className="text-2xl font-extrabold text-white">₹{ride.fare}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 relative before:absolute before:left-[11px] before:top-6 before:bottom-6 before:w-0.5 before:bg-white/10 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 z-10 ring-4 ring-[#121212]">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <p className="text-gray-300 font-medium text-sm pt-0.5">{ride.pickup}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 z-10 ring-4 ring-[#121212]">
                      <MapPin size={12} className="text-emerald-500" />
                    </div>
                    <p className="text-gray-300 font-medium text-sm pt-0.5">{ride.drop}</p>
                  </div>
                </div>

                {/* Only allow downloading invoice if it was completed AND paid */}
                {ride.status === 'completed' && ride.paymentStatus === 'completed' && (
                  <div className="pt-6 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => handleDownloadPDF(ride)}
                      disabled={isDownloading === ride._id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                    >
                      {isDownloading === ride._id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Download size={18} />
                          Download Invoice
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
