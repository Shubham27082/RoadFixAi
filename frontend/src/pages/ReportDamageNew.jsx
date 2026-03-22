import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Upload, AlertCircle, CheckCircle, Loader, Download, Send, FileText, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { indianStates, stateDistricts, districtCities, getDefaultCities } from '../data/indianLocations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
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