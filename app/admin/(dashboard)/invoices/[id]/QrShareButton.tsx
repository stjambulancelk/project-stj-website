"use client";

import { useState } from "react";
import { HiQrcode, HiDownload, HiPrinter } from "react-icons/hi";

interface Props {
  invoiceId: string;
  url: string;
  amount: string;     // formatted balance due
  customer: string;
  pngDataUrl: string; // generated server-side
}

/** Shows a scannable QR of the public invoice link — download PNG or print a pay card. */
export default function QrShareButton({ invoiceId, url, amount, customer, pngDataUrl }: Props) {
  const [open, setOpen] = useState(false);

  function printCard() {
    const w = window.open("", "_blank", "width=420,height=640");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${invoiceId}</title>
      <style>body{font-family:system-ui,sans-serif;text-align:center;padding:24px;color:#0b1437}
      h1{font-size:18px;margin:0 0 4px}p{margin:4px 0;font-size:13px}.amt{font-size:22px;font-weight:700;color:#059669}
      img{width:260px;height:260px;margin:16px auto;display:block}.url{font-size:10px;color:#555;word-break:break-all}</style>
      </head><body>
      <h1>STJ Southern Ambulance</h1><p>Invoice <strong>${invoiceId}</strong></p><p>${customer.replace(/</g, "&lt;")}</p>
      <p class="amt">${amount}</p><img src="${pngDataUrl}" alt="QR"/>
      <p>Scan with your phone camera to view &amp; pay securely</p><p class="url">${url}</p>
      <script>window.onload=()=>{window.print()}</script></body></html>`);
    w.document.close();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
      >
        <HiQrcode /> QR Code
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4" onClick={() => setOpen(false)}>
          <div className="bg-navy-950 border border-navy-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-sm max-h-[92dvh] overflow-y-auto shadow-2xl text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-white font-bold">Scan to Pay</h2>
              <p className="text-slate-400 text-xs font-mono">{invoiceId} · {amount}</p>
            </div>
            <div className="bg-white rounded-xl p-3 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pngDataUrl} alt={`QR code for invoice ${invoiceId}`} width={240} height={240} />
            </div>
            <p className="text-slate-400 text-xs">Customer scans with phone camera → opens invoice → pays via PayHere.</p>
            <div className="flex gap-2">
              <a
                href={pngDataUrl}
                download={`${invoiceId}-qr.png`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                <HiDownload /> Download PNG
              </a>
              <button
                onClick={printCard}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-semibold"
              >
                <HiPrinter /> Print Card
              </button>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 text-xs">Close</button>
          </div>
        </div>
      )}
    </>
  );
}
