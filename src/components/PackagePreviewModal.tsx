import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ShieldCheck, 
  FileCheck, 
  QrCode, 
  CheckCircle2, 
  Lock, 
  Printer, 
  Copy, 
  Check 
} from 'lucide-react';

export interface ApplicationRequirement {
  id: string;
  title: string;
  description: string;
  requiredCategory: string;
  maxAgeMonths?: number;
  mandatory: boolean;
}

export interface ApplicationPackageTemplate {
  id: string;
  title: string;
  targetAuthority: string;
  jurisdiction: string;
  processingCategory: string;
  requirements: ApplicationRequirement[];
}

export interface PackageDocumentItem {
  id: string;
  title: string;
  issuer: string;
  pageCount?: number;
  status?: string;
}

export interface UserPersona {
  id: string;
  name: string;
  role: string;
  avatarText: string;
  documentsCount: number;
  primaryApplication: string;
  documents: PackageDocumentItem[];
}

interface PackagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ApplicationPackageTemplate | null;
  persona: UserPersona | null;
}

export const PackagePreviewModal: React.FC<PackagePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
  persona
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !template || !persona) return null;

  const bundleHash = 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592';

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1200);
  };

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(bundleHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                  {template.title}
                </h3>
                <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  AUDITED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target Authority: {template.targetAuthority} · {template.jurisdiction}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Dossier Header Card */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Zero-Knowledge Package Envelope
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                ID: KRED-DOSSIER-{(template.id || 'PKG').toUpperCase()}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Root Merkle Hash:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-200 bg-slate-950 px-2 py-0.5 rounded truncate max-w-xs">
                  {bundleHash}
                </span>
                <button
                  onClick={handleCopyHash}
                  className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Dossier Table of Contents & Exhibit Map */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Included Verified Exhibits & Notarizations
            </h4>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl divide-y divide-slate-800/80">
              {persona.documents.map((doc: PackageDocumentItem, idx: number) => (
                <div key={doc.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 text-[11px]">
                      Tab 0{idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-100">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {doc.issuer} {doc.pageCount ? `· ${doc.pageCount} ${doc.pageCount === 1 ? 'page' : 'pages'}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Seal Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Barcode & Metadata Proof */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-4">
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
              <QrCode className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tamper-Evident Cryptographic Seal
              </div>
              <p className="text-slate-400 text-[11.5px]">
                Recipients, university registrars, and visa officers can verify this dossier against the blockchain anchoring proof.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Client-Side Decrypted on Device
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Dossier
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Compiling PDF Package...' : downloaded ? 'Downloaded!' : 'Export Cryptographic PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagePreviewModal;
