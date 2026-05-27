import crypto from "crypto";
import { PAYHERE } from "./constants";

export interface PayHerePayload {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
}

export function generatePayHereHash(
  orderId: string,
  amount: number,
  currency = "LKR"
): string {
  const amountFormatted = amount.toFixed(2);
  const secretHash = crypto
    .createHash("md5")
    .update(PAYHERE.merchantSecret)
    .digest("hex")
    .toUpperCase();

  const hashString = `${PAYHERE.merchantId}${orderId}${amountFormatted}${currency}${secretHash}`;
  return crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();
}

export function buildPayHerePayload(params: {
  invoiceId: string;
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  siteUrl: string;
}): PayHerePayload {
  const { invoiceId, amount, description, customerName, customerEmail, customerPhone, siteUrl } = params;
  const [firstName, ...rest] = customerName.trim().split(" ");
  const lastName = rest.join(" ") || "-";
  const currency = PAYHERE.currency;

  return {
    merchant_id: PAYHERE.merchantId,
    return_url: `${siteUrl}/invoice/${invoiceId}/success`,
    cancel_url: `${siteUrl}/invoice/${invoiceId}/failed`,
    notify_url: `${siteUrl}/api/payments/webhook`,
    order_id: invoiceId,
    items: description,
    currency,
    amount: amount.toFixed(2),
    first_name: firstName,
    last_name: lastName,
    email: customerEmail,
    phone: customerPhone.replace(/\D/g, ""),
    address: "Sri Lanka",
    city: "Galle",
    country: "Sri Lanka",
    hash: generatePayHereHash(invoiceId, amount, currency),
  };
}

export function verifyPayHereWebhook(params: {
  merchantId: string;
  orderId: string;
  payHereAmount: string;
  payHereCurrency: string;
  statusCode: string;
  md5sig: string;
}): boolean {
  const { merchantId, orderId, payHereAmount, payHereCurrency, statusCode, md5sig } = params;
  const secretHash = crypto
    .createHash("md5")
    .update(PAYHERE.merchantSecret)
    .digest("hex")
    .toUpperCase();

  const localSig = crypto
    .createHash("md5")
    .update(`${merchantId}${orderId}${payHereAmount}${payHereCurrency}${statusCode}${secretHash}`)
    .digest("hex")
    .toUpperCase();

  return localSig === md5sig.toUpperCase();
}
