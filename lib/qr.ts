import QRCode from "qrcode";

/** PNG data URL of a QR code (server-side). Error-correction M survives print / screen glare. */
export function qrPngDataUrl(text: string, size = 480): Promise<string> {
  return QRCode.toDataURL(text, { errorCorrectionLevel: "M", margin: 2, width: size, color: { dark: "#0b1437", light: "#ffffff" } });
}
