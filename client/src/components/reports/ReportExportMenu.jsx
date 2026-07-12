import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Table, Printer, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import { useFleet } from '../../context/FleetContext';
import api from '../../services/api';

const ReportExportMenu = ({ onExportCsv, isExportingCsv, filters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { triggerToast } = useFleet();
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPdf = async () => {
    setIsOpen(false);
    setExportingPdf(true);
    triggerToast('Generating PDF report...', 'info');
    
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const response = await api.get(`/reports/export/pdf?${params.toString()}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TransitOps_Filtered_Report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      triggerToast('PDF export completed', 'success');
    } catch (err) {
      triggerToast('Failed to export PDF', 'danger');
    } finally {
      setExportingPdf(false);
    }
  };

  const handlePrint = () => {
    setIsOpen(false);
    window.print();
  };

  const isExporting = isExportingCsv || exportingPdf;

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="primary"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="gap-2 pr-2"
      >
        {isExporting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </span>
        )}
        <div className="pl-2 border-l border-white/20 ml-1">
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </Button>

      {isOpen && !isExporting && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-brand-slate-900 border border-brand-slate-200 dark:border-brand-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                if(onExportCsv) onExportCsv();
              }}
              className="w-full px-4 py-2 text-left text-sm text-brand-slate-700 dark:text-brand-slate-300 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-800 flex items-center gap-2 transition-colors"
            >
              <Table className="w-4 h-4 text-brand-green" />
              Export as CSV
            </button>
            <button
              onClick={handleExportPdf}
              className="w-full px-4 py-2 text-left text-sm text-brand-slate-700 dark:text-brand-slate-300 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-800 flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-brand-red" />
              Export as PDF
            </button>
            <div className="h-px bg-brand-slate-100 dark:bg-brand-slate-800 my-1" />
            <button
              onClick={handlePrint}
              className="w-full px-4 py-2 text-left text-sm text-brand-slate-700 dark:text-brand-slate-300 hover:bg-brand-slate-50 dark:hover:bg-brand-slate-800 flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-brand-slate-500" />
              Print Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportExportMenu;
