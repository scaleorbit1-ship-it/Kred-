import React from 'react';

export interface VectorIconProps {
  className?: string;
  size?: number;
}

/**
 * Hand holding a sovereign biometric ID card with cryptographic chip & verified badge.
 * Matches KRED sovereign identity & instant verifiable ID theme.
 */
export const IconHandId: React.FC<VectorIconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Soft Drop Ambient Glow */}
    <rect x="30" y="14" width="42" height="58" rx="8" fill="#10C77A" fillOpacity="0.12" />

    {/* Smart Sovereign Credential Card */}
    <rect
      x="28"
      y="16"
      width="44"
      height="60"
      rx="7"
      fill="#FFFFFF"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Top Lanyard Slot / Chip Notch */}
    <rect x="42" y="21" width="16" height="3" rx="1.5" fill="#18181B" />

    {/* Biometric Avatar & Frame */}
    <rect x="34" y="28" width="16" height="18" rx="4" fill="#F8F7F2" stroke="#18181B" strokeWidth="1.5" />
    <circle cx="42" cy="34" r="3.5" fill="#18181B" />
    <path
      d="M37 43 C37 39 47 39 47 43"
      stroke="#18181B"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Cryptographic Gold/Emerald Microchip */}
    <rect x="54" y="28" width="12" height="10" rx="2.5" fill="#10C77A" stroke="#18181B" strokeWidth="1.5" />
    <line x1="57" y1="28" x2="57" y2="38" stroke="#18181B" strokeWidth="1" />
    <line x1="60" y1="28" x2="60" y2="38" stroke="#18181B" strokeWidth="1" />
    <line x1="54" y1="33" x2="66" y2="33" stroke="#18181B" strokeWidth="1" />

    {/* Credential Data Fields */}
    <line x1="34" y1="52" x2="66" y2="52" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    <line x1="34" y1="58" x2="56" y2="58" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    <line x1="34" y1="64" x2="48" y2="64" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />

    {/* Verified Sovereign Seal Badge */}
    <circle cx="61" cy="63" r="5" fill="#10C77A" stroke="#18181B" strokeWidth="1.5" />
    <path d="M58.5 63 L60.2 64.7 L63.5 61.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

    {/* Hand Holding Sovereign Card */}
    {/* Left Fingers wrapping cleanly around */}
    <path
      d="M28 32 C22 32 21 37 28 38"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M28 40 C21 40 20 45 28 46"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M28 48 C21 48 20 53 28 54"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M28 56 C22 56 21 61 28 62"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Thumb & Palm Contour */}
    <path
      d="M72 50 C78 50 75 60 70 66 C65 72 61 78 61 88"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Wrist base */}
    <path
      d="M40 78 C36 82 38 88 42 92"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Sovereign Credential Vault & Automated Ingestion (Capabilities: Store & Organize).
 * Features layered credential cards sliding into an encrypted vault with optical scanner beam.
 */
export const IconVaultStore: React.FC<VectorIconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Ambient Glow */}
    <circle cx="50" cy="50" r="36" fill="#10C77A" fillOpacity="0.08" />

    {/* Back Credential Card (Degree / Academic) */}
    <rect
      x="28"
      y="18"
      width="44"
      height="32"
      rx="6"
      fill="#FFFFFF"
      stroke="#18181B"
      strokeWidth="2.2"
      transform="rotate(-8 50 34)"
    />
    <line x1="33" y1="28" x2="52" y2="25" stroke="#18181B" strokeWidth="1.5" strokeOpacity="0.5" transform="rotate(-8 50 34)" />

    {/* Middle Credential Card (Passport / ID) */}
    <rect
      x="28"
      y="26"
      width="44"
      height="34"
      rx="6"
      fill="#F8F7F2"
      stroke="#18181B"
      strokeWidth="2.2"
      transform="rotate(6 50 43)"
    />
    <circle cx="36" cy="40" r="3.5" fill="#10C77A" transform="rotate(6 50 43)" />

    {/* Front Vault Sleeve / Container */}
    <rect
      x="20"
      y="42"
      width="60"
      height="44"
      rx="10"
      fill="#FFFFFF"
      stroke="#18181B"
      strokeWidth="2.5"
    />

    {/* Vault Ingestion Scanning Beam */}
    <rect x="24" y="48" width="52" height="6" rx="3" fill="#10C77A" fillOpacity="0.2" />
    <line x1="28" y1="51" x2="72" y2="51" stroke="#10C77A" strokeWidth="2.5" strokeLinecap="round" />

    {/* Front Encrypted Clasp & Keyhole */}
    <circle cx="50" cy="68" r="9" fill="#18181B" stroke="#18181B" strokeWidth="1.5" />
    <circle cx="50" cy="68" r="4" fill="#10C77A" />
    <path d="M49 67 L51 67 L51.5 71 L48.5 71 Z" fill="#18181B" />

    {/* Floating Verified Indicators */}
    <circle cx="76" cy="30" r="4" fill="#10C77A" stroke="#18181B" strokeWidth="1.5" />
    <path d="M74.5 30 L75.5 31 L77.5 29" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * AI Cross-Document Reasoning Engine (Capabilities: Understand & Query).
 * Connected document nodes with synaptic reasoning pulses & verified answer spark.
 */
export const IconReasoningEngine: React.FC<VectorIconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Central Hexagonal / Circular Reasoning Core */}
    <circle cx="50" cy="50" r="28" fill="#10C77A" fillOpacity="0.1" stroke="#18181B" strokeWidth="2.5" />

    {/* Synaptic Knowledge Graph Connecting Beams */}
    <line x1="50" y1="22" x2="50" y2="36" stroke="#18181B" strokeWidth="2" strokeDasharray="2 3" />
    <line x1="74" y1="64" x2="62" y2="57" stroke="#18181B" strokeWidth="2" strokeDasharray="2 3" />
    <line x1="26" y1="64" x2="38" y2="57" stroke="#18181B" strokeWidth="2" strokeDasharray="2 3" />

    {/* Peripheral Document Node 1 (Top: Degree) */}
    <rect x="42" y="12" width="16" height="14" rx="3.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
    <line x1="45" y1="16" x2="55" y2="16" stroke="#18181B" strokeWidth="1.2" />
    <line x1="45" y1="20" x2="52" y2="20" stroke="#10C77A" strokeWidth="1.2" />

    {/* Peripheral Document Node 2 (Bottom Left: Passport) */}
    <rect x="18" y="60" width="16" height="14" rx="3.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
    <circle cx="26" cy="67" r="2.5" fill="#10C77A" />

    {/* Peripheral Document Node 3 (Bottom Right: License) */}
    <rect x="66" y="60" width="16" height="14" rx="3.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
    <line x1="69" y1="65" x2="79" y2="65" stroke="#18181B" strokeWidth="1.2" />
    <line x1="69" y1="69" x2="75" y2="69" stroke="#18181B" strokeWidth="1.2" />

    {/* Central AI Reasoning Core & Sparkle */}
    <circle cx="50" cy="50" r="14" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
    <path
      d="M50 41 C50 46 54 50 59 50 C54 50 50 54 50 59 C50 54 46 50 41 50 C46 50 50 46 50 41 Z"
      fill="#10C77A"
      stroke="#18181B"
      strokeWidth="1.2"
    />

    {/* Small ambient reasoning sparks */}
    <circle cx="34" cy="34" r="2" fill="#10C77A" />
    <circle cx="66" cy="34" r="2.5" fill="#18181B" />
  </svg>
);

/**
 * Verified Credential Dossier & Expiring Secure Dispatch (Capabilities: Assemble & Share).
 * Application folder with cryptographic wax seal & time-limited share token.
 */
export const IconVerifiedDossier: React.FC<VectorIconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Back Folder Tab */}
    <path
      d="M20 32 C20 28 23 26 27 26 L42 26 L48 32 L75 32 C79 32 82 35 82 39 L82 46 L20 46 Z"
      fill="#F8F7F2"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Extracted Verified Document Inside */}
    <rect
      x="30"
      y="20"
      width="40"
      height="38"
      rx="5"
      fill="#FFFFFF"
      stroke="#18181B"
      strokeWidth="2"
    />
    <line x1="36" y1="28" x2="64" y2="28" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="36" y1="34" x2="56" y2="34" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="36" y1="40" x2="48" y2="40" stroke="#10C77A" strokeWidth="1.5" strokeLinecap="round" />

    {/* Front Folder Pocket */}
    <path
      d="M18 42 C18 38 21 36 25 36 L75 36 C79 36 82 38 82 42 L82 72 C82 76 79 80 75 80 L25 80 C21 80 18 76 18 72 Z"
      fill="#FFFFFF"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Front Folder Design Ribs */}
    <line x1="26" y1="48" x2="48" y2="48" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
    <line x1="26" y1="54" x2="42" y2="54" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3" />

    {/* Cryptographic Verified Shield & Share Token */}
    <rect x="52" y="52" width="22" height="20" rx="6" fill="#18181B" stroke="#18181B" strokeWidth="1.5" />
    <circle cx="63" cy="62" r="5" fill="#10C77A" />
    <path d="M60.5 62 L62.2 63.5 L65.5 60.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

    {/* Expiring Share Arc & Beam */}
    <path
      d="M74 30 C82 34 86 42 86 52"
      stroke="#10C77A"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path d="M84 28 L88 32 L82 34" stroke="#10C77A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/**
 * Hardware Security Enclave & 256-Bit Cryptographic Vault (Security & Architecture).
 * Isometric secure hardware enclave with AES-256 GCM key matrix & emerald verification core.
 */
export const IconHardwareEnclave: React.FC<VectorIconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Surrounding Cryptographic Circuit Shield */}
    <rect x="18" y="18" width="64" height="64" rx="16" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />

    {/* Security Chip Pins / Contact Traces */}
    {/* Top Pins */}
    <line x1="36" y1="12" x2="36" y2="18" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="12" x2="50" y2="18" stroke="#10C77A" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="64" y1="12" x2="64" y2="18" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Bottom Pins */}
    <line x1="36" y1="82" x2="36" y2="88" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="82" x2="50" y2="88" stroke="#10C77A" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="64" y1="82" x2="64" y2="88" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Left Pins */}
    <line x1="12" y1="36" x2="18" y2="36" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12" y1="50" x2="18" y2="50" stroke="#10C77A" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12" y1="64" x2="18" y2="64" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Right Pins */}
    <line x1="82" y1="36" x2="88" y2="36" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="82" y1="50" x2="88" y2="50" stroke="#10C77A" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="82" y1="64" x2="88" y2="64" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

    {/* Inner Hardware Enclave Core */}
    <rect x="28" y="28" width="44" height="44" rx="10" fill="#18181B" stroke="#18181B" strokeWidth="2" />

    {/* Cryptographic Keyhole & Enclave Lock */}
    <path
      d="M50 36 C45 36 41 40 41 45 C41 48.5 43 51.5 46 53 L45 61 C45 62 46 63 47 63 L53 63 C54 63 55 62 55 61 L54 53 C57 51.5 59 48.5 59 45 C59 40 55 36 50 36 Z"
      fill="#10C77A"
      stroke="#18181B"
      strokeWidth="1.5"
    />
    <circle cx="50" cy="44" r="2.5" fill="#18181B" />

    {/* Micro Encryption Pulse Rings */}
    <circle cx="34" cy="34" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
    <circle cx="66" cy="34" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
    <circle cx="34" cy="66" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
    <circle cx="66" cy="66" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
  </svg>
);

/**
 * Professional Licensing & Board Certifications (RoleStacks: Working Professionals).
 * Verified license card with security chip, biometric validation, and emerald check.
 */
export const IconProfessionalLicense: React.FC<VectorIconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Base License Card */}
    <rect
      x="18"
      y="22"
      width="64"
      height="46"
      rx="8"
      fill="#FFFFFF"
      stroke="#18181B"
      strokeWidth="2.5"
    />

    {/* Header Security Stripe */}
    <path d="M18 30 C18 25.5 21.5 22 26 22 L74 22 C78.5 22 82 25.5 82 30 L82 32 L18 32 Z" fill="#18181B" />
    <circle cx="26" cy="27" r="2" fill="#10C77A" />
    <circle cx="32" cy="27" r="2" fill="#FFFFFF" fillOpacity="0.6" />

    {/* Microchip */}
    <rect x="26" y="38" width="14" height="11" rx="2.5" fill="#10C77A" stroke="#18181B" strokeWidth="1.5" />
    <line x1="33" y1="38" x2="33" y2="49" stroke="#18181B" strokeWidth="1" />
    <line x1="26" y1="43.5" x2="40" y2="43.5" stroke="#18181B" strokeWidth="1" />

    {/* Licensee Info Lines */}
    <line x1="46" y1="40" x2="74" y2="40" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    <line x1="46" y1="46" x2="68" y2="46" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
    <line x1="46" y1="52" x2="62" y2="52" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3" />

    {/* Front Floating Verified Seal Badge */}
    <g transform="translate(46, 52)">
      <rect x="0" y="0" width="38" height="26" rx="7" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
      <rect x="3" y="3" width="32" height="20" rx="5" fill="#F8F7F2" />
      <circle cx="12" cy="13" r="5.5" fill="#10C77A" stroke="#18181B" strokeWidth="1.2" />
      <path d="M9.5 13 L11.2 14.7 L14.5 11.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="20" y="16.5" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#18181B">
        PE-9X
      </text>
    </g>
  </svg>
);

/**
 * Multi-Document Verified Credential Stack / Diploma & Transcripts (HowItWorks 03 / GetStarted).
 * Stacked academic degrees & verified transcripts with verified checklist ribbons.
 */
export const IconDocStack: React.FC<VectorIconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Back Document (Transcript) */}
    <rect
      x="26"
      y="18"
      width="48"
      height="52"
      rx="7"
      fill="#F8F7F2"
      stroke="#18181B"
      strokeWidth="2.2"
      transform="rotate(-8 50 44)"
    />
    <line x1="32" y1="28" x2="60" y2="28" stroke="#18181B" strokeWidth="1.5" strokeOpacity="0.4" transform="rotate(-8 50 44)" />
    <line x1="32" y1="34" x2="52" y2="34" stroke="#18181B" strokeWidth="1.5" strokeOpacity="0.4" transform="rotate(-8 50 44)" />

    {/* Front Document (Degree / Diploma) */}
    <rect
      x="30"
      y="24"
      width="48"
      height="54"
      rx="7"
      fill="#FFFFFF"
      stroke="#18181B"
      strokeWidth="2.5"
    />

    {/* Academic Header Seal */}
    <circle cx="54" cy="38" r="6" fill="#10C77A" fillOpacity="0.2" stroke="#18181B" strokeWidth="1.5" />
    <circle cx="54" cy="38" r="2.5" fill="#10C77A" />

    {/* Transcript Lines */}
    <line x1="38" y1="50" x2="70" y2="50" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    <line x1="38" y1="56" x2="64" y2="56" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    <line x1="38" y1="62" x2="54" y2="62" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />

    {/* Bottom Verified Registrar Ribbon */}
    <path
      d="M62 66 L72 66 L72 78 L67 74 L62 78 Z"
      fill="#10C77A"
      stroke="#18181B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Expiration & Renewal Notification Bell.
 * Alerts users before professional licenses or passports expire.
 */
export const IconAlertBell: React.FC<VectorIconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Top Ring / Crown */}
    <circle cx="50" cy="20" r="4.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />

    {/* Bell Body */}
    <path
      d="M50 24 C38 24 34 36 32 54 C30 62 24 64 24 68 L76 68 C76 64 70 62 68 54 C66 36 62 24 50 24 Z"
      fill="#FFFFFF"
      stroke="#18181B"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Bell Base & Clapper */}
    <ellipse cx="50" cy="68" rx="26" ry="4" fill="#F8F7F2" stroke="#18181B" strokeWidth="2.5" />
    <path d="M46 72 C46 76 54 76 54 72" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

    {/* Emerald Notification Active Badge */}
    <circle cx="68" cy="26" r="6.5" fill="#10C77A" stroke="#18181B" strokeWidth="2" />
    <path d="M66 26 L67.5 27.5 L70.5 24.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

    {/* Acoustic Resonance Waves */}
    <path d="M18 42 C15 47 15 55 18 60" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
    <path d="M82 42 C85 47 85 55 82 60" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Career & Credential Progression Trajectory.
 */
export const IconTrajectory: React.FC<VectorIconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Flowing Path */}
    <path
      d="M20 78 C20 54 36 30 64 26 C82 22 84 50 64 64 C46 74 38 64 46 48 C52 38 68 32 82 24"
      stroke="#10C77A"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Milestone Nodes */}
    <circle cx="24" cy="74" r="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
    <circle cx="24" cy="74" r="2" fill="#10C77A" />

    <circle cx="64" cy="26" r="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
    <circle cx="64" cy="26" r="2" fill="#10C77A" />

    <circle cx="64" cy="64" r="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
    <circle cx="64" cy="64" r="2" fill="#18181B" />

    {/* Directional Arrow */}
    <path d="M78 20 L86 23 L82 31 Z" fill="#18181B" stroke="#18181B" strokeWidth="1.5" />
  </svg>
);

// Backward compatibility alias exports matching the previous names
export const IconWalletCoins = IconVaultStore;
export const IconHandCheck = IconReasoningEngine;
export const IconFastDelivery = IconVerifiedDossier;
export const IconEnclaveCanister = IconHardwareEnclave;
export const IconCardSecurity = IconProfessionalLicense;
export const IconDocPhotos = IconDocStack;

export default {
  IconHandId,
  IconVaultStore,
  IconReasoningEngine,
  IconVerifiedDossier,
  IconHardwareEnclave,
  IconProfessionalLicense,
  IconDocStack,
  IconAlertBell,
  IconTrajectory,
  IconWalletCoins,
  IconHandCheck,
  IconFastDelivery,
  IconEnclaveCanister,
  IconCardSecurity,
  IconDocPhotos,
};
