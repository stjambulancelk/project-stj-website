import { PAYHERE } from "./constants";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PaymentSearchResult {
  id: string;          // PayHere internal payment_id
  order_id: string;
  status: number;
  payhere_amount: string;
  payhere_currency: string;
  method: string;
  // additional fields omitted
}

export async function getPayHereAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${PAYHERE.appId}:${PAYHERE.appSecret}`).toString("base64");

  const res = await fetch(`${PAYHERE.apiBase}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PayHere OAuth failed (${res.status}): ${text}`);
  }

  const data: TokenResponse = await res.json();
  return data.access_token;
}

export async function getPayHerePaymentByOrderId(orderId: string): Promise<PaymentSearchResult | null> {
  const token = await getPayHereAccessToken();

  const res = await fetch(`${PAYHERE.apiBase}/payment/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order_id: orderId }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data?.data?.[0]) return null;
  return data.data[0] as PaymentSearchResult;
}

export async function refundPayHerePayment(
  payherePaymentId: string,
  description: string
): Promise<{ ok: boolean; message?: string }> {
  const token = await getPayHereAccessToken();

  const res = await fetch(`${PAYHERE.apiBase}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payment_id: payherePaymentId, description }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, message: data?.msg ?? data?.message ?? `PayHere refund failed (${res.status})` };
  }

  return { ok: true };
}
