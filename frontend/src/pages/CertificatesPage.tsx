import React, { useState, useEffect } from 'react';
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  QrCode,
  FileCheck,
} from 'lucide-react';

interface Certificate {
  id: number;
  certificateId: string;
  courseTitle: string;
  studentName: string;
  instructor: string;
  issueDate: string;
}

export const CertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/courses/my-certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      }
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyVerifyLink = (certId: string) => {
    const url = `${window.location.origin}/verify-certificate/${certId}`;
    navigator.clipboard.writeText(url);
    alert('Public verification link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Credentials Vault
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              My Trading Certificates
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Official verifiable course completion and trading masterclass certifications issued by Scalper Akash.
            </p>
          </div>
        </div>

        {/* Certificate Cards */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading credentials...</div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No certificates earned yet</h3>
            <p className="text-slate-400 text-xs mt-1">Complete 100% of any course curriculum to automatically unlock your credential.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase tracking-wider">
                      Verified Credential
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 font-mono mb-1">CERTIFICATE ID: {cert.certificateId}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{cert.courseTitle}</h3>
                  <div className="text-xs text-slate-400">Awarded to: <strong className="text-slate-200">{cert.studentName}</strong></div>
                  <div className="text-xs text-slate-400 mt-1">Instructor: <strong className="text-slate-200">{cert.instructor}</strong></div>
                  <div className="text-[10px] text-slate-500 mt-1">Issued On: {new Date(cert.issueDate).toLocaleDateString()}</div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex gap-3">
                  <button
                    onClick={() => copyVerifyLink(cert.certificateId)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share Proof
                  </button>
                  <a
                    href={`/verify-certificate/${cert.certificateId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Verify Online
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
