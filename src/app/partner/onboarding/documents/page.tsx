"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ChevronLeft, UploadCloud, CheckCircle2, FileText, Check, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DocumentOnboardingStep2() {
  const router = useRouter()
  
  const [documents, setDocuments] = useState({
    aadhar: null as File | null,
    license: null as File | null,
    rc: null as File | null
  })
  const [existingDocs, setExistingDocs] = useState({
    aadhar: '',
    license: '',
    rc: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const res = await fetch('/api/partner/onboarding/documents')
        if (res.ok) {
          const data = await res.json()
          if (data.documents) {
            setExistingDocs({
              aadhar: data.documents.aadharUrl || '',
              license: data.documents.licenseUrl || '',
              rc: data.documents.rcUrl || ''
            })
          }
        }
      } catch (err) {
        console.error("Failed to fetch documents", err)
      }
    }
    fetchExistingData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'aadhar' | 'license' | 'rc') => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({
        ...prev,
        [type]: e.target.files![0]
      }))
    }
  }

  const handleSubmit = async () => {
    const hasAadhar = documents.aadhar || existingDocs.aadhar
    const hasLicense = documents.license || existingDocs.license
    const hasRc = documents.rc || existingDocs.rc

    if (!hasAadhar || !hasLicense || !hasRc) {
      toast.error("Please upload all required documents")
      return
    }

    // If they already have docs and uploaded NO new ones, skip the upload process
    if (!documents.aadhar && !documents.license && !documents.rc) {
      router.push('/partner/onboarding/bank')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (documents.aadhar) formData.append('aadhar', documents.aadhar)
      if (documents.license) formData.append('license', documents.license)
      if (documents.rc) formData.append('rc', documents.rc)

      const response = await fetch('/api/partner/onboarding/documents', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload documents')
      }

      toast.success("Documents uploaded securely!")
      router.push('/partner/onboarding/bank') 
    } catch (error: any) {
      toast.error(error.message || "Failed to process documents.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const docTypes = [
    { id: 'aadhar' as const, label: 'Aadhar Card', desc: 'Front and back side of your Aadhar' },
    { id: 'license' as const, label: 'Driving License', desc: 'Valid Indian Driving License' },
    { id: 'rc' as const, label: 'Vehicle RC', desc: 'Registration Certificate of the vehicle' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-12 px-6 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 border border-blue-500/30 font-bold text-sm">
            <Check size={16} />
          </div>
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-full" />
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
            2
          </div>
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-1/3" />
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-gray-500 font-bold text-sm">
            3
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-2">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-3xl font-extrabold text-white">Upload Documents</h1>
          </div>
          <p className="text-gray-400 mb-8 ml-14">We need these to verify your identity and vehicle legality.</p>

          <div className="space-y-6">
            {docTypes.map((doc) => {
              const file = documents[doc.id]
              const hasExisting = existingDocs[doc.id]
              const isDone = file || hasExisting

              return (
                <div key={doc.id} className="relative group">
                  <input
                    type="file"
                    id={doc.id}
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, doc.id)}
                    className="hidden"
                  />
                  <label
                    htmlFor={doc.id}
                    className={`block w-full border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                      isDone 
                        ? 'bg-blue-600/10 border-blue-500/50 hover:bg-blue-600/20' 
                        : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-colors ${isDone ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-400 group-hover:text-white'}`}>
                          {isDone ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-lg transition-colors ${isDone ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                            {doc.label}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {file ? file.name : hasExisting ? "Previously Uploaded ✓" : doc.desc}
                          </p>
                        </div>
                      </div>
                      
                      {!isDone && (
                        <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                          <UploadCloud size={24} className="mb-1" />
                          <span className="text-xs font-medium">Browse</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              )
            })}
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex justify-between items-center">
            <p className="text-xs text-gray-500 max-w-[200px]">
              Formats allowed: JPG, PNG, PDF. Max size: 5MB per file.
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isSubmitting 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20'
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
              {!isSubmitting && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
