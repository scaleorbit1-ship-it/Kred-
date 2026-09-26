import React, { useState } from 'react';
import { FileText, Plus, Sparkles } from 'lucide-react';

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  score: string;
  fileSize: string;
  schema: Record<string, any>;
}

interface InteractiveVaultSandboxProps {
  onShowToast: (msg: string) => void;
  onOpenDocModal?: (doc: DocumentItem) => void;
}

export const InteractiveVaultSandbox: React.FC<InteractiveVaultSandboxProps> = ({
  onShowToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-1');
  const [isUploading, setIsUploading] = useState(false);

  const initialDocs: DocumentItem[] = [
    {
      id: 'doc-1',
      title: 'Degree Transcript',
      category: 'academic',
      issuer: 'MIT',
      issueDate: 'May 2024',
      expiryDate: 'Permanent',
      status: 'verified',
      score: 'GPA 4.8 / 5.0 (Summa Cum Laude)',
      fileSize: '1.8 MB',
      schema: {
        major: 'B.S. Computer Science & AI',
        creditsCompleted: '180 credits',
        honors: 'Tau Beta Pi National Engineering Honor',
        cryptographicProof: '0x8f9a2e3...b71c (SHA-256)',
      },
    },
    {
      id: 'doc-2',
      title: 'National Passport & ID',
      category: 'id',
      issuer: 'Department of State / Passport Agency',
      issueDate: 'Jan 2019',
      expiryDate: 'Jan 2029 (4 years remaining)',
      status: 'verified',
      score: 'Biometrics Authenticated',
      fileSize: '3.2 MB',
      schema: {
        documentNumber: '•••••••• 9842',
        biometrics: 'e-Chip Verified',
        securityTier: 'AES-256 Enclave Protected',
        mrzChecksum: 'VALID (ICAO 9303 Compliant)',
      },
    },
    {
      id: 'doc-3',
      title: 'AWS Solutions Architect',
      category: 'cert',
      issuer: 'Amazon Web Services Training & Cert',
      issueDate: 'March 2023',
      expiryDate: 'Renews in 45 days',
      status: 'expiring',
      score: 'Verification ID: AWS-092834-PRO',
      fileSize: '850 KB',
      schema: {
        certificationLevel: 'Professional Level 3',
        credentialId: 'AWS-CERT-9921',
        renewalRequirement: 'Recertification Exam or 40 CEU credits',
        status: 'Active (45-day window)',
      },
    },
    {
      id: 'doc-4',
      title: 'IELTS Academic English Test',
      category: 'academic',
      issuer: 'British Council & Cambridge',
      issueDate: 'Dec 2024',
      expiryDate: 'Dec 2026',
      status: 'verified',
      score: 'Overall Band 8.0 (C1/C2 Level)',
      fileSize: '1.1 MB',
      schema: {
        listening: '8.5',
        reading: '8.5',
        writing: '7.5',
        speaking: '8.0',
        cryptographicProof: '0x334bc09...11de (SHA-256)',
      },
    },
    {
      id: 'doc-5',
      title: 'Faculty Recommendation Letter',
      category: 'letters',
      issuer: 'MIT CSAIL Research Laboratory',
      issueDate: 'April 2024',
      expiryDate: 'Permanent',
      status: 'verified',
      score: 'Cryptographically Signed',
      fileSize: '620 KB',
      schema: {
        facultyAdvisor: 'Prof. R. Vance (Director)',
        scope: 'AI Systems & Autonomous Decision Architectures',
        endorsementLevel: 'Top 1% of Graduating Class',
        cryptographicProof: '0x9920aa1...f328 (SHA-256)',
      },
    },
  ];

  const [docs, setDocs] = useState<DocumentItem[]>(initialDocs);

  const filteredDocs =
    activeFilter === 'all'
      ? docs
      : docs.filter((d) => d.category === activeFilter);

  const selectedDoc = docs.find((d) => d.id === selectedDocId) || docs[0];

  const handleSimulateUpload = () => {
    setIsUploading(true);
    onShowToast('Parsing document layout and extracting metadata fields...');
    setTimeout(() => {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        title: 'Stanford Machine Learning Specialization',
        category: 'cert',
        issuer: 'Stanford Online',
        issueDate: 'Just now',
        expiryDate: 'Permanent',
        status: 'verified',
        score: 'Grade 99.4%',
        fileSize: '1.4 MB',
        schema: {
          instructor: 'Prof. Andrew Ng',
          verificationUrl: 'stanford.edu/verify/ml-992',
          skills: 'Deep Learning, Transformers, Convex Optimization',
          cryptographicProof: '0xaa44e91...99bc (SHA-256)',
        },
      };
      setDocs((prev) => [newDoc, ...prev]);
      setSelectedDocId(newDoc.id);
      setIsUploading(false);
      onShowToast('Document parsed and added to sovereign vault!');
    }, 1000);
  };

  return (
    <section id="sandbox" className="py-20 md:py-28 bg-[#F8F7F2]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex h-6 px-2.5 rounded-full bg-white text-[11px] font-medium tracking-[0.06em] uppercase text-[#18181B]/70 items-center mb-2.5 shadow-2xs">
              Live Vault Sandbox
            </div>
            <h2 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.035em] leading-[1.1] text-[#18181B]">
              Explore structured credential schemas
            </h2>
          </div>
          <p className="text-[14px] leading-[1.6] font-normal text-[#18181B]/65 max-w-[360px]">
            Inspect how KRED indexes transcripts, licenses, and passports into clean, machine-readable metadata.
          </p>
        </div>

        {/* Filter Tabs & Action */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-white p-1 rounded-xl overflow-x-auto shadow-2xs">
            {[
              { id: 'all', label: 'All Records' },
              { id: 'academic', label: 'Transcripts & Tests' },
              { id: 'cert', label: 'Certifications' },
              { id: 'id', label: 'Government IDs' },
              { id: 'letters', label: 'Recommendations' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`h-8 px-3.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-[#18181B] text-white shadow-2xs'
                    : 'text-[#18181B]/60 hover:text-[#18181B]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleSimulateUpload}
            disabled={isUploading}
            className="h-9 px-4 rounded-lg bg-[#10C77A] text-[#18181B] text-[12.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 hover:bg-[#10C77A]/90 transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Ingesting...' : 'Add test document'}</span>
          </button>
        </div>

        {/* Split Sandbox Display */}
        <div className="mt-6 grid lg:grid-cols-[1fr_1.1fr] gap-6">
          {/* Document List */}
          <div className="space-y-3">
            {filteredDocs.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-4 rounded-2xl transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-[#18181B] text-white'
                      : 'bg-white text-[#18181B] hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${
                          isSelected ? 'bg-white/10 text-[#10C77A]' : 'bg-[#F8F7F2] text-[#18181B]'
                        }`}
                      >
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-medium truncate">{doc.title}</div>
                        <div
                          className={`text-[11.5px] truncate mt-0.5 ${
                            isSelected ? 'text-white/60' : 'text-[#18181B]/55'
                          }`}
                        >
                          {doc.issuer}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 font-medium ${
                        doc.status === 'verified'
                          ? isSelected
                            ? 'bg-[#10C77A] text-[#18181B]'
                            : 'bg-[#10C77A]/15 text-[#10C77A]'
                          : isSelected
                          ? 'bg-amber-400 text-[#18181B]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {doc.status === 'verified' ? '✓ Verified' : 'Expiring'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className={isSelected ? 'text-white/50' : 'text-[#18181B]/45'}>
                      {doc.fileSize}
                    </span>
                    <span
                      className={`font-medium ${
                        isSelected ? 'text-[#10C77A]' : 'text-[#10C77A]'
                      }`}
                    >
                      {doc.score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Schema Inspector Panel */}
          <div className="rounded-[24px] bg-[#18181B] text-white p-6 sm:p-7 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#10C77A]" />
                  <span className="text-[12.5px] font-medium text-white">Extracted Metadata Schema</span>
                </div>
                <span className="text-[10.5px] font-mono text-white/40">JSON-LD Standard</span>
              </div>

              <div className="mt-3 font-mono text-[11.5px] leading-[1.8] bg-white/5 p-4.5 rounded-xl overflow-x-auto text-white/80">
                <div>{'{'}</div>
                <div className="pl-4 text-white/50">// Document Identifiers</div>
                <div className="pl-4">
                  <span className="text-[#10C77A]">"document_title"</span>:{' '}
                  <span className="text-white">"{selectedDoc.title}"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-[#10C77A]">"issuing_authority"</span>:{' '}
                  <span className="text-white">"{selectedDoc.issuer}"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-[#10C77A]">"issue_date"</span>:{' '}
                  <span className="text-white">"{selectedDoc.issueDate}"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-[#10C77A]">"validity_expiry"</span>:{' '}
                  <span className="text-white">"{selectedDoc.expiryDate}"</span>,
                </div>
                <div className="pl-4 text-white/50 mt-1">// Structured Key-Value Fields</div>
                {Object.entries(selectedDoc.schema).map(([key, val]) => (
                  <div key={key} className="pl-4">
                    <span className="text-[#10C77A]">"{key}"</span>:{' '}
                    <span className="text-white">"{String(val)}"</span>,
                  </div>
                ))}
                <div className="pl-4">
                  <span className="text-[#10C77A]">"encryption_status"</span>:{' '}
                  <span className="text-[#10C77A]">"AES-256-GCM (Enclave Sealed)"</span>
                </div>
                <div>{'}'}</div>
              </div>
            </div>

            <div className="mt-5 pt-3 flex items-center justify-between text-[11.5px] text-white/50">
              <span>Client-side parsed via WebAssembly neural OCR</span>
              <span className="text-[#10C77A] font-mono">0.02ms Query Speed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveVaultSandbox;
