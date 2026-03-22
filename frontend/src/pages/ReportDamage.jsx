import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Upload, CheckCircle, Loader, Download, Send, FileText, Calendar, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { indianStates, stateDistricts, districtCities, getDefaultCities } from '../data/indianLocations';
import jsPDF from 'jspdf';

const ReportDamage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    image: null,
    state: '',
    district: '',
    city: '',
    gpsLocation: '',
    description: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [sendToWard, setSendToWard] = useState(false);
  const [selectedWardMember, setSelectedWardMember] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [wardMembers, setWardMembers] = useState([]);
  const [loadingWardMembers, setLoadingWardMembers] = useState(false);
  const fileInputRef = useRef(null);

  // Get available districts for selected state
  const getAvailableDistricts = () => {
    return stateDistricts[formData.state] || [];
  };

  // Get available cities for selected district
  const getAvailableCities = () => {
    if (!formData.district) return [];
    return districtCities[formData.district] || getDefaultCities(formData.district);
  };

  // Set current date and time on component mount
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setCurrentDateTime(formatted);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);
  // Fetch ward members from database
  const fetchWardMembers = async (ward) => {
    if (!ward) return;
    
    setLoadingWardMembers(true);
    try {
      const token = localStorage.getItem('roadfix_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/ward-members/${encodeURIComponent(ward)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setWardMembers(result.data.wardMembers);
      } else {
        console.error('Failed to fetch ward members:', result.message);
        setWardMembers([]);
      }
    } catch (error) {
      console.error('Error fetching ward members:', error);
      setWardMembers([]);
    } finally {
      setLoadingWardMembers(false);
    }
  };

  // Fetch ward members when user ward changes
  useEffect(() => {
    if (user?.ward) {
      fetchWardMembers(user.ward);
    }
  }, [user?.ward]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      const errors = { ...validationErrors };
      errors.image = 'Please upload only JPG, JPEG, or PNG images';
      setValidationErrors(errors);
      return;
    }

    // Validate file size (2MB max for better compression)
    if (file.size > 2 * 1024 * 1024) {
      const errors = { ...validationErrors };
      errors.image = 'Image size must be less than 2MB';
      setValidationErrors(errors);
      return;
    }

    // Clear any previous errors
    const errors = { ...validationErrors };
    delete errors.image;
    setValidationErrors(errors);

    console.log('📷 Image selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setFormData({ ...formData, image: file });
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // Capture from camera
  const captureFromCamera = () => {
    fileInputRef.current.click();
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLocation({ latitude, longitude });
        setFormData({
          ...formData,
          gpsLocation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        });
        setGpsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enter GPS coordinates manually.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };
  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.image) {
      errors.image = 'Road damage photo is required';
    }

    if (!formData.state) {
      errors.state = 'State is required';
    }

    if (!formData.district) {
      errors.district = 'District is required';
    }

    if (!formData.city) {
      errors.city = 'City/Area is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate report
  const generateReport = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user is logged in
      const token = localStorage.getItem('roadfix_token');
      if (!token) {
        throw new Error('Please login to submit a report');
      }

      console.log('🔄 Submitting report...', { user: user?.email, hasToken: !!token });

      // Simulate AI analysis
      const aiAnalysis = {
        confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
        damageType: ['Pothole', 'Crack', 'Surface Damage', 'Road Collapse'][Math.floor(Math.random() * 4)],
        severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        estimatedCost: `₹${(Math.random() * 50000 + 5000).toFixed(0)}`,
        estimatedRepairTime: ['1-2 Days', '3-5 Days', '1 Week', '2 Weeks'][Math.floor(Math.random() * 4)],
        riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
      };

      // Convert image to base64 with compression
      let imageData = null;
      if (formData.image) {
        // Create a canvas to compress the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        imageData = await new Promise((resolve) => {
          img.onload = () => {
            // Calculate new dimensions (max 800px width/height)
            const maxSize = 800;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            // Set canvas size and draw compressed image
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with compression (0.7 quality)
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            console.log('🖼️ Image compressed:', {
              originalSize: formData.image.size,
              compressedSize: compressedDataUrl.length,
              dimensions: `${width}x${height}`
            });
            resolve(compressedDataUrl);
          };
          
          // Create object URL for the image
          img.src = URL.createObjectURL(formData.image);
        });
      }

      // Prepare report data
      const reportPayload = {
        locationAddress: `${formData.city}, ${formData.district}, ${formData.state}`,
        state: formData.state,
        district: formData.district,
        city: formData.city,
        latitude: gpsLocation?.latitude || null,
        longitude: gpsLocation?.longitude || null,
        gpsCoordinates: formData.gpsLocation,
        damageType: aiAnalysis.damageType,
        severity: aiAnalysis.severity.toLowerCase(),
        description: formData.description || `${aiAnalysis.damageType} detected with ${aiAnalysis.severity.toLowerCase()} severity`,
        aiAnalysis: aiAnalysis,
        priority: aiAnalysis.severity === 'High' ? 'High' : aiAnalysis.severity === 'Medium' ? 'Medium' : 'Low',
        imageData: imageData,
        assignedTo: sendToWard && selectedWardMember ? selectedWardMember : null,
        sendToWard: sendToWard
      };

      console.log('📤 Report payload:', { 
        locationAddress: reportPayload.locationAddress,
        damageType: reportPayload.damageType,
        severity: reportPayload.severity,
        assignedTo: reportPayload.assignedTo
      });

      // Submit to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('🌐 API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportPayload)
      });

      console.log('📡 Response status:', response.status);
      
      const result = await response.json();
      console.log('📋 Response data:', result);

      if (result.success) {
        console.log('✅ Report created successfully:', result.data.complaintId);
        setReportData({
          ...result.data.report,
          complaintId: result.data.complaintId,
          aiAnalysis: aiAnalysis
        });
        setSubmitted(true);
      } else {
        console.error('❌ Backend error:', result.message);
        throw new Error(result.message || 'Failed to create report');
      }

    } catch (error) {
      console.error('❌ Error submitting report:', error);
      alert(`Failed to submit report: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate PDF report
  const generatePDFReport = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Header
    pdf.setFillColor(240, 248, 255);
    pdf.rect(0, 0, pageWidth, 45, 'F');
    pdf.setDrawColor(0, 0, 139);
    pdf.setLineWidth(2);
    pdf.line(0, 45, pageWidth, 45);
    
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 139);
    pdf.text('ROAD DAMAGE REPORT', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('AI-Powered Road Damage Assessment', pageWidth / 2, 28, { align: 'center' });
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 36, { align: 'center' });
    
    let yPos = 60;
    
    // Report Information
    pdf.setFillColor(250, 250, 250);
    pdf.rect(15, yPos - 5, pageWidth - 30, 25, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(15, yPos - 5, pageWidth - 30, 25);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`Complaint ID: ${reportData?.complaintId}`, 20, yPos + 5);
    pdf.text(`Status: Submitted`, 20, yPos + 12);
    pdf.text(`Priority: ${reportData?.priority || 'Medium'}`, pageWidth - 80, yPos + 5);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 80, yPos + 12);
    
    yPos += 35;
    
    // Add uploaded image if available
    if (imagePreview) {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(15, yPos, pageWidth - 30, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('UPLOADED DAMAGE IMAGE', 20, yPos + 6);
      yPos += 15;
      
      try {
        // Calculate image dimensions to fit within PDF
        const maxWidth = pageWidth - 40; // Leave 20mm margin on each side
        const maxHeight = 80; // Maximum height for image
        
        // Add image to PDF
        pdf.addImage(
          imagePreview, 
          'JPEG', 
          20, // x position
          yPos, // y position
          maxWidth, // width
          maxHeight, // height
          undefined, // alias
          'MEDIUM' // compression
        );
        
        yPos += maxHeight + 15; // Move position after image
        
        // Add image caption
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Road damage image uploaded by citizen', 20, yPos);
        yPos += 10;
        
      } catch (error) {
        console.error('Error adding image to PDF:', error);
        // If image fails to load, add a placeholder text
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Image could not be included in PDF', 20, yPos);
        yPos += 15;
      }
    }
    
    // Report Details
    const reportDetails = [
      ['Submitted By', `${user?.firstName} ${user?.lastName}`],
      ['Email', user?.email || 'N/A'],
      ['Phone', user?.phone || 'N/A'],
      ['Location', `${formData.city}, ${formData.district}, ${formData.state}`],
      ['GPS Coordinates', formData.gpsLocation || 'Not provided'],
      ['Damage Type', reportData?.aiAnalysis?.damageType || 'N/A'],
      ['Severity', reportData?.aiAnalysis?.severity || 'N/A'],
      ['Description', formData.description || 'No additional description provided'],
      ['Submission Date', new Date().toLocaleDateString()],
      ['AI Confidence', reportData?.aiAnalysis?.confidence ? `${reportData.aiAnalysis.confidence}%` : 'N/A'],
      ['Estimated Cost', reportData?.aiAnalysis?.estimatedCost || 'N/A'],
      ['Estimated Repair Time', reportData?.aiAnalysis?.estimatedRepairTime || 'N/A']
    ];
    
    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPos, pageWidth - 30, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('REPORT DETAILS', 20, yPos + 6);
    yPos += 15;
    
    reportDetails.forEach((detail) => {
      // Check if we need a new page
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`${detail[0]}:`, 20, yPos);
      
      const valueText = detail[1].toString();
      if (valueText.length > 50) {
        const splitText = pdf.splitTextToSize(valueText, pageWidth - 90);
        pdf.text(splitText, 70, yPos);
        yPos += splitText.length * 5;
      } else {
        pdf.text(valueText, 70, yPos);
        yPos += 8;
      }
    });
    
    // AI Analysis Section
    yPos += 15;
    
    // Check if we need a new page
    if (yPos > 220) {
      pdf.addPage();
      yPos = 20;
    }
    
    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPos, pageWidth - 30, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('AI ANALYSIS RESULTS', 20, yPos + 6);
    yPos += 15;
    
    const aiDetails = [
      ['Damage Detection', reportData?.aiAnalysis?.damageType || 'N/A'],
      ['Severity Assessment', reportData?.aiAnalysis?.severity || 'N/A'],
      ['Confidence Level', reportData?.aiAnalysis?.confidence ? `${reportData.aiAnalysis.confidence}%` : 'N/A'],
      ['Risk Level', reportData?.aiAnalysis?.riskLevel || 'N/A'],
      ['Estimated Repair Cost', reportData?.aiAnalysis?.estimatedCost || 'N/A'],
      ['Estimated Repair Time', reportData?.aiAnalysis?.estimatedRepairTime || 'N/A']
    ];
    
    aiDetails.forEach((detail) => {
      // Check if we need a new page
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`${detail[0]}:`, 20, yPos);
      pdf.text(detail[1], 70, yPos);
      yPos += 8;
    });
    
    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 40;
    pdf.setDrawColor(0, 0, 139);
    pdf.setLineWidth(1);
    pdf.line(15, footerY, pageWidth - 15, footerY);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Road Damage Reporting System - AI-Powered Assessment', 20, footerY + 8);
    pdf.text(`Complaint ID: ${reportData?.complaintId} | Generated: ${new Date().toLocaleString()}`, 20, footerY + 15);
    pdf.text('This is an official road damage report', 20, footerY + 22);
    
    // Save PDF
    pdf.save(`Road_Damage_Report_${reportData?.complaintId}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Reset form for new report
  const resetForm = () => {
    setFormData({
      image: null,
      state: '',
      district: '',
      city: '',
      gpsLocation: '',
      description: ''
    });
    setImagePreview(null);
    setGpsLocation(null);
    setSendToWard(false);
    setSelectedWardMember('');
    setValidationErrors({});
    setSubmitted(false);
    setReportData(null);
  };

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen py-12" style={{ 
        background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 50%, #eff6ff 100%)' 
      }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="card p-8 text-center shadow-2xl" style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(10px)' 
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#22c55e', 
              borderRadius: '50%', 
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle style={{ width: '48px', height: '48px', color: 'white' }} />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Report Submitted Successfully!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Your road damage report has been recorded and will be processed by municipal authorities.
            </p>
            
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Your Complaint ID</p>
              <p className="text-2xl font-bold text-blue-600">{reportData?.complaintId}</p>
              <p className="text-sm text-gray-500 mt-2">Save this ID to track your complaint status</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">AI Confidence</p>
                <p className="text-xl font-bold text-gray-900">{reportData?.aiAnalysis?.confidence}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Damage Type</p>
                <p className="text-xl font-bold text-gray-900">{reportData?.aiAnalysis?.damageType}</p>
              </div>
            </div>

            {/* AI Analysis Results */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🤖 AI Analysis Results
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Estimated Cost</p>
                  <p className="text-lg font-bold text-blue-600">{reportData?.aiAnalysis?.estimatedCost}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Repair Time</p>
                  <p className="text-lg font-bold text-purple-600">{reportData?.aiAnalysis?.estimatedRepairTime}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Risk Level</p>
                  <p className="text-lg font-bold text-orange-600">{reportData?.aiAnalysis?.riskLevel}</p>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
              <button
                onClick={generatePDFReport}
                className="btn btn-secondary"
                style={{ 
                  width: '100%', 
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                <Download style={{ width: '20px', height: '20px' }} />
                Download PDF Report
              </button>
              
              <button
                onClick={resetForm}
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px' }}
              >
                Report Another Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ 
      background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f5f3ff 100%)' 
    }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="text-center mb-12 fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 mb-6">
            <Camera style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            AI-Powered Detection
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Report Road Damage</h1>
          <p className="text-xl text-gray-600 mx-auto" style={{ maxWidth: '600px' }}>
            Help improve your community by reporting road damage. Our advanced AI will analyze and process your report automatically.
          </p>
        </div>

        <form onSubmit={generateReport} className="card p-8 shadow-2xl" style={{ 
          background: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(10px)' 
        }}>
          {/* Image Upload Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Road Damage Photo *
            </label>
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center" style={{
                borderColor: validationErrors.image ? '#dc2626' : '#d1d5db',
                borderStyle: 'dashed',
                borderWidth: '2px',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                backgroundColor: '#f9fafb'
              }}
              onMouseOver={(e) => e.target.style.borderColor = validationErrors.image ? '#dc2626' : '#2563eb'}
              onMouseOut={(e) => e.target.style.borderColor = validationErrors.image ? '#dc2626' : '#d1d5db'}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '8px', 
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ImageIcon style={{ width: '40px', height: '40px', color: '#9ca3af' }} />
                </div>
                <p className="text-gray-600 mb-2 font-medium">Upload Road Image</p>
                <p className="text-sm text-gray-500 mb-4">JPG, JPEG, PNG • Max 2MB</p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={captureFromCamera}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Camera style={{ width: '16px', height: '16px' }} />
                    Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Upload style={{ width: '16px', height: '16px' }} />
                    Upload Image
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  capture="environment"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <img
                  src={imagePreview}
                  alt="Road damage preview"
                  style={{ 
                    width: '100%', 
                    height: '256px', 
                    objectFit: 'cover', 
                    borderRadius: '12px' 
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, image: null });
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Image Validation Error */}
          {validationErrors.image && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{validationErrors.image}</p>
            </div>
          )}
          {/* Road Location Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin style={{ width: '20px', height: '20px' }} />
              Road Location Details
            </h3>
            
            {/* State */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value, district: '', city: '' })}
                className="input-field"
                style={{ borderColor: validationErrors.state ? '#dc2626' : undefined }}
              >
                <option value="">Select State</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {validationErrors.state && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.state}</p>
              )}
            </div>

            {/* District */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District *
              </label>
              {formData.state && getAvailableDistricts().length > 0 ? (
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value, city: '' })}
                  className="input-field"
                  style={{ borderColor: validationErrors.district ? '#dc2626' : undefined }}
                >
                  <option value="">Select District</option>
                  {getAvailableDistricts().map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value, city: '' })}
                  placeholder="Enter District"
                  className="input-field"
                  style={{ borderColor: validationErrors.district ? '#dc2626' : undefined }}
                />
              )}
              {validationErrors.district && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.district}</p>
              )}
            </div>

            {/* City/Area */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City / Area *
              </label>
              {formData.district && getAvailableCities().length > 0 ? (
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                  style={{ borderColor: validationErrors.city ? '#dc2626' : undefined }}
                >
                  <option value="">Select City/Area</option>
                  {getAvailableCities().map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter City or Area name"
                  className="input-field"
                  style={{ borderColor: validationErrors.city ? '#dc2626' : undefined }}
                />
              )}
              {validationErrors.city && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.city}</p>
              )}
            </div>

            {/* GPS Location Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPS Location
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <input
                  type="text"
                  value={formData.gpsLocation}
                  onChange={(e) => setFormData({ ...formData, gpsLocation: e.target.value })}
                  placeholder="Enter GPS coordinates or capture automatically"
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gpsLoading}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                >
                  {gpsLoading ? (
                    <Loader style={{ width: '16px', height: '16px' }} className="loading-spinner" />
                  ) : (
                    <MapPin style={{ width: '16px', height: '16px' }} />
                  )}
                  Capture GPS
                </button>
              </div>
              {gpsLocation && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ GPS coordinates captured: {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Upload Date & Time */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar style={{ width: '16px', height: '16px' }} />
              Upload Date & Time
            </label>
            <input
              type="text"
              value={currentDateTime}
              readOnly
              className="input-field bg-gray-50"
              style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
            />
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide any additional details about the road damage..."
              rows={4}
              className="input-field"
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
          </div>

          {/* Send to Ward Member Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="sendToWard"
                checked={sendToWard}
                onChange={(e) => setSendToWard(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="sendToWard" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Send style={{ width: '16px', height: '16px' }} />
                Send to Ward Member
              </label>
            </div>
            
            {sendToWard && (
              <div className="ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Ward Member *
                </label>
                {loadingWardMembers ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Loader style={{ width: '16px', height: '16px' }} className="loading-spinner" />
                    <span className="text-sm text-gray-600">Loading ward members...</span>
                  </div>
                ) : wardMembers.length > 0 ? (
                  <select
                    value={selectedWardMember}
                    onChange={(e) => setSelectedWardMember(e.target.value)}
                    className="input-field"
                    required={sendToWard}
                  >
                    <option value="">Select Ward Member</option>
                    {wardMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} - {member.email} ({member.ward})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      No ward members found for your area ({user?.ward}). The report will be sent to general municipal authorities.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              padding: '16px 24px', 
              fontSize: '18px', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader style={{ width: '24px', height: '24px' }} className="loading-spinner" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText style={{ width: '24px', height: '24px' }} />
                Generate Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportDamage;