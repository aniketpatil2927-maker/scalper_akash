import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  Award, 
  ShieldCheck, 
  Printer, 
  Share2, 
  Check, 
  ArrowLeft,
  Calendar,
  User,
  BookOpen
} from 'lucide-react';

export const CertificateVerificationPage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { apiGet } = useAuth();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const data = await apiGet(`/courses/certificates/${certificateId}`);
      setCert(data);
    } catch (err: any) {
      console.error('Failed to verify certificate:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        <span>Verifying certificate credentials on blockchain ledger...</span>
      </div>
    );
  }

  if (!cert || !cert.valid) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-6">
        <div className="h-16 w-16 rounded-full bg-accent-rose/20 border border-accent-rose flex items-center justify-center text-accent-rose mb-4">
          ✕
        </div>
        <h2 className="text-xl font-black text-white">Invalid Certificate ID</h2>
        <p className="text-xs text-gray-400 mt-1 max-w-sm">
          No verified student certificate exists with identifier "{certificateId}".
        </p>
        <Link to="/courses" className="mt-4 px-4 py-2 rounded-xl bg-dark-800 text-xs font-bold text-gray-200">
          Return to Academy
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 py-10 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between no-print">
        <Link to="/dashboard/courses" className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Learning</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-dark-900 border border-dark-700 text-xs font-bold text-gray-300 hover:text-white"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            <span>{copied ? 'Link Copied' : 'Share URL'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-accent-cyan text-dark-950 font-black text-xs hover:bg-accent-cyan/90 shadow-lg"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Frame */}
      <div className="relative bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 border-4 border-accent-gold/40 rounded-3xl p-8 sm:p-14 shadow-2xl overflow-hidden text-center space-y-8 print:border-black print:bg-white print:text-black">
        {/* Seal watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Award className="h-96 w-96 text-accent-gold" />
        </div>

        {/* Certificate Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2 text-accent-gold font-black tracking-widest text-xs uppercase">
            <Award className="h-4 w-4" />
            <span>OFFICIAL SCALPER AKASH ACADEMY CREDENTIAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-serif uppercase">
            Certificate of Completion
          </h1>
          <p className="text-xs text-gray-400 font-medium">This is proudly and formally conferred upon</p>
        </div>

        {/* Student Name */}
        <div className="py-2">
          <span className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 tracking-wide font-serif">
            {cert.studentName}
          </span>
          <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-accent-gold to-transparent mx-auto mt-2" />
        </div>

        {/* Course Description */}
        <div className="space-y-2 max-w-xl mx-auto">
          <p className="text-xs text-gray-300 leading-relaxed">
            for successfully mastering the curriculum, institutional setups, and risk controls in
          </p>
          <h2 className="text-lg sm:text-xl font-black text-white">
            {cert.courseTitle}
          </h2>
        </div>

        {/* Signatures & Seal Footer */}
        <div className="pt-8 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-400">
          <div className="text-left space-y-1">
            <span className="text-gray-500 font-bold uppercase text-[10px] block">Instructor Signature</span>
            <span className="text-sm font-bold text-accent-cyan font-serif">{cert.instructor}</span>
            <span className="text-[10px] text-gray-500 block">Lead Market Analyst & Trader</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-accent-gold/10 border-2 border-accent-gold/40 flex items-center justify-center text-accent-gold font-black text-xs shadow-lg">
              VERIFIED
            </div>
            <span className="text-[9px] text-gray-500 mt-1 font-mono">{cert.certificateId}</span>
          </div>

          <div className="text-right space-y-1">
            <span className="text-gray-500 font-bold uppercase text-[10px] block">Date Conferred</span>
            <span className="text-xs font-bold text-white">
              {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[10px] text-emerald-400 block font-semibold">✓ Digitally Signed & Authentic</span>
          </div>
        </div>
      </div>
    </div>
  );
};
