import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Smartphone, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface MobileQRModalProps {
  onClose: () => void;
  onToggleMobileSimulator?: () => void;
  isSimulatorActive?: boolean;
}

export const MobileQRModal: React.FC<MobileQRModalProps> = ({
  onClose,
  onToggleMobileSimulator,
  isSimulatorActive
}) => {
  const sharedUrl = 'https://ais-pre-u2m5ejhllxj3tbibqinf3m-904250411153.asia-east1.run.app';
  const devUrl = 'https://ais-dev-u2m5ejhllxj3tbibqinf3m-904250411153.asia-east1.run.app';

  const [activeUrlType, setActiveUrlType] = useState<'shared' | 'dev'>('shared');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const selectedUrl = activeUrlType === 'shared' ? sharedUrl : devUrl;

  useEffect(() => {
    QRCode.toDataURL(selectedUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [selectedUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(selectedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Open Diploma Rankers MSBTE platform on your phone: ${selectedUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/10">
          <Smartphone className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-white">Open on Your Mobile Phone</h3>
          <p className="text-xs text-slate-400">
            Scan with your iPhone or Android camera to access notes, courses, and PDFs directly on your mobile browser.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-3 rounded-2xl shadow-xl inline-block mx-auto border-4 border-amber-400/30">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Scan QR code for mobile view"
              className="w-48 h-48 mx-auto rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-500 text-xs">
              Generating QR code...
            </div>
          )}
        </div>

        {/* URL switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
          <button
            onClick={() => setActiveUrlType('shared')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              activeUrlType === 'shared' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Public Preview URL
          </button>
          <button
            onClick={() => setActiveUrlType('dev')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              activeUrlType === 'dev' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dev Studio URL
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span className="truncate max-w-[190px] text-[10px] font-mono text-slate-400">
              {selectedUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px] shrink-0 ml-2"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <span>💬 Send Link to My Phone via WhatsApp</span>
          </a>

          {onToggleMobileSimulator && (
            <button
              onClick={() => {
                onToggleMobileSimulator();
                onClose();
              }}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isSimulatorActive ? 'Exit Phone Simulator Frame' : '📱 Simulate Mobile Frame On-Screen'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
