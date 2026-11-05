import QRCode from "qrcode";
import { CauHinhRepository } from "@/server/repositories/CauHinhRepository";

function tlv(id: string, value: string): string {
  const len = String(value.length).padStart(2, "0");
  return `${id}${len}${value}`;
}

export function sanitizeVietQRMessage(raw: string): string {
  const ascii = raw
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[-#]/g, "")
    .replace(/[^A-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (ascii || "SMARTTECH").slice(0, 25);
}

export class VietQRService {
  private settingsRepo = new CauHinhRepository();

  /**
   * Computes EMVCo CRC16-CCITT (polynomial 0x1021, initial value 0xFFFF).
   */
  computeCRC16(input: string): string {
    let crc = 0xffff;
    for (let i = 0; i < input.length; i++) {
      crc ^= input.charCodeAt(i) << 8;
      for (let bit = 0; bit < 8; bit++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xffff;
        } else {
          crc = (crc << 1) & 0xffff;
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  /**
   * Builds a compliant Napas 247 EMVCo payload string for Vietnam banking apps.
   */
  buildPayload(params: {
    bin: string;
    accountNo: string;
    amount: number;
    orderId: string;
  }): string {
    const cleanBin = params.bin.replace(/\D/g, "");
    const cleanAcc = params.accountNo.replace(/[^a-zA-Z0-9]/g, "");
    const intAmount = Math.max(0, Math.round(params.amount));
    const addInfo = sanitizeVietQRMessage(params.orderId);

    const beneficiaryOrg = tlv("00", cleanBin) + tlv("01", cleanAcc);
    const napasMerchantInfo =
      tlv("00", "A000000727") +
      tlv("01", beneficiaryOrg) +
      tlv("02", "QRIBFTTA");

    const parts: string[] = [
      tlv("00", "01"),
      tlv("01", intAmount > 0 ? "12" : "11"),
      tlv("38", napasMerchantInfo),
      tlv("53", "704"),
    ];

    if (intAmount > 0) {
      parts.push(tlv("54", String(intAmount)));
    }

    parts.push(tlv("58", "VN"));
    parts.push(tlv("62", tlv("08", addInfo)));

    const payloadWithoutCrc = parts.join("") + "6304";
    const crc = this.computeCRC16(payloadWithoutCrc);
    return payloadWithoutCrc + crc;
  }

  async generateQRDataUrl(params: {
    amount: number;
    orderId: string;
    bin?: string;
    accountNo?: string;
    accountName?: string;
    bankShortName?: string;
  }): Promise<{
    payload: string;
    qrDataUrl: string;
    bankBin: string;
    bankName: string;
    accountNo: string;
    accountName: string;
    amount: number;
    addInfo: string;
  }> {
    const saved = await this.settingsRepo.getSettings();
    const bankBin = params.bin ?? saved.bank_bin;
    const bankName = params.bankShortName ?? saved.bank_short_name;
    const accountNo = params.accountNo ?? saved.bank_account_no;
    const accountName = params.accountName ?? saved.bank_account_name;
    const intAmount = Math.max(0, Math.round(params.amount));
    const addInfo = sanitizeVietQRMessage(params.orderId);

    const payload = this.buildPayload({
      bin: bankBin,
      accountNo,
      amount: intAmount,
      orderId: params.orderId,
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 340,
      color: {
        dark: "#14294B",
        light: "#FFFFFF",
      },
    });

    return {
      payload,
      qrDataUrl,
      bankBin,
      bankName,
      accountNo,
      accountName,
      amount: intAmount,
      addInfo,
    };
  }
}
