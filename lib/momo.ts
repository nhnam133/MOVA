import { env } from 'cloudflare:workers';

type MomoPaymentInput = {
  orderCode: string;
  amount: number;
  origin: string;
};

export type MomoIpnPayload = {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
};

function config() {
  const partnerCode = env.MOMO_PARTNER_CODE;
  const accessKey = env.MOMO_ACCESS_KEY;
  const secretKey = env.MOMO_SECRET_KEY;
  if (!partnerCode || !accessKey || !secretKey) {
    throw new Error('MoMo UAT chưa được cấu hình trên môi trường chạy website.');
  }
  return { partnerCode, accessKey, secretKey };
}

async function hmacSha256(message: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signed)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function createMomoPayment({ orderCode, amount, origin }: MomoPaymentInput) {
  const { partnerCode, accessKey, secretKey } = config();
  const requestId = `${orderCode}-${Date.now()}`;
  const requestType = 'captureWallet';
  const orderInfo = `Thanh toan don hang ${orderCode}`;
  const extraData = '';
  const siteOrigin = env.SITE_URL || origin;
  const redirectUrl = `${siteOrigin}/thanh-toan/ket-qua?orderCode=${encodeURIComponent(orderCode)}`;
  const ipnUrl = `${siteOrigin}/api/momo/ipn`;
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderCode}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = await hmacSha256(rawSignature, secretKey);
  const response = await fetch('https://test-payment.momo.vn/v2/gateway/api/create', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ partnerCode, partnerName: 'MOVA', storeId: 'MOVAStore', requestType, ipnUrl, redirectUrl, orderId: orderCode, amount, lang: 'vi', orderInfo, requestId, extraData, signature, autoCapture: true }),
  });
  const result = await response.json() as { resultCode: number; message: string; payUrl?: string };
  if (!response.ok || result.resultCode !== 0 || !result.payUrl) throw new Error(result.message || 'Không tạo được giao dịch MoMo UAT.');
  return { payUrl: result.payUrl, requestId };
}

export async function verifyMomoIpn(payload: MomoIpnPayload) {
  const { partnerCode, accessKey, secretKey } = config();
  if (payload.partnerCode !== partnerCode) return false;
  const rawSignature = `accessKey=${accessKey}&amount=${payload.amount}&extraData=${payload.extraData}&message=${payload.message}&orderId=${payload.orderId}&orderInfo=${payload.orderInfo}&orderType=${payload.orderType}&partnerCode=${payload.partnerCode}&payType=${payload.payType}&requestId=${payload.requestId}&responseTime=${payload.responseTime}&resultCode=${payload.resultCode}&transId=${payload.transId}`;
  const expected = await hmacSha256(rawSignature, secretKey);
  return expected === payload.signature;
}
