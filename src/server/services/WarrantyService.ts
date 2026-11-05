import { BaoHanhRepository } from "@/server/repositories/BaoHanhRepository";
import type { EWarrantyRecord } from "@/types/domain";

export class WarrantyService {
  private warrantyRepo = new BaoHanhRepository();

  async lookupWarranty(query: string): Promise<EWarrantyRecord[]> {
    return this.warrantyRepo.findByIMEIOrPhone(query);
  }

  async createServiceIntake(
    maImei: string,
    issueDescription: string,
    technicianName: string
  ): Promise<EWarrantyRecord> {
    if (!issueDescription.trim()) {
      throw new Error("Vui lòng nhập mô tả tình trạng lỗi tiếp nhận bảo hành.");
    }
    const cleanImei = maImei.trim();
    const todayStr = new Date().toISOString().slice(0, 10);

    await this.warrantyRepo.appendServiceHistory(
      cleanImei,
      {
        ngay_tiep_nhan: todayStr,
        mo_ta_loi: issueDescription.trim(),
        ky_thuat_vien: technicianName.trim() || "Kỹ thuật viên chi nhánh",
        ket_qua_xu_ly: "Đang kiểm tra & xử lý bảo hành tại trung tâm kỹ thuật",
      },
      "DangTiepNhan"
    );

    const updated = await this.warrantyRepo.findByIMEIOrPhone(cleanImei);
    return updated[0];
  }

  async completeServiceReturn(
    maImei: string,
    resolutionNote: string,
    technicianName: string
  ): Promise<EWarrantyRecord> {
    const cleanImei = maImei.trim();
    const todayStr = new Date().toISOString().slice(0, 10);

    await this.warrantyRepo.appendServiceHistory(
      cleanImei,
      {
        ngay_tiep_nhan: todayStr,
        mo_ta_loi: "Hoàn tất bảo hành & bàn giao máy",
        ky_thuat_vien: technicianName.trim() || "Kỹ thuật viên chi nhánh",
        ket_qua_xu_ly: resolutionNote.trim() || "Đã sửa chữa hoàn tất, bàn giao khách hàng",
      },
      "ConHan"
    );

    const updated = await this.warrantyRepo.findByIMEIOrPhone(cleanImei);
    return updated[0];
  }
}
