import type { InStatement } from "@libsql/client";
import { ensureDatabaseInitialized, getDbClient } from "@/server/db/client";
import { ThietBiIMEIRepository } from "@/server/repositories/ThietBiIMEIRepository";
import { SanPhamRepository } from "@/server/repositories/SanPhamRepository";
import { PhieuDieuChuyenRepository } from "@/server/repositories/PhieuDieuChuyenRepository";
import { ChiNhanhRepository } from "@/server/repositories/ChiNhanhRepository";
import type { TransferTicket } from "@/types/domain";

export interface CrossBranchMatrixItem {
  ma_san_pham: string;
  ten_san_pham: string;
  thuong_hieu: string;
  loai_san_pham: string;
  cau_hinh_tom_tat: string;
  gia_hien_hanh: number;
  stockByBranch: Record<string, number>;
  availableImeisByBranch: Record<string, string[]>;
  totalChainStock: number;
}

export class InventoryService {
  private imeiRepo = new ThietBiIMEIRepository();
  private spRepo = new SanPhamRepository();
  private transferRepo = new PhieuDieuChuyenRepository();
  private branchRepo = new ChiNhanhRepository();

  async importIMEIBatch(params: {
    productId: string;
    branchId: string;
    rawImeis: string[];
    importPrice: number;
  }): Promise<{
    importedCount: number;
    validImeis: string[];
    rejected: Array<{ imei: string; reason: string }>;
  }> {
    await ensureDatabaseInitialized();
    const product = await this.spRepo.findById(params.productId);
    if (!product || product.loai_san_pham === "PhuKien") {
      throw new Error("Sản phẩm không hợp lệ hoặc là phụ kiện (phụ kiện nhập theo số lượng SKU).");
    }

    const db = getDbClient();
    const existingRes = await db.execute("SELECT ma_imei FROM tbl_ThietBi_IMEI");
    const existingSet = new Set(existingRes.rows.map((r) => String(r.ma_imei)));

    const batchSeen = new Set<string>();
    const validImeis: string[] = [];
    const rejected: Array<{ imei: string; reason: string }> = [];

    for (const raw of params.rawImeis) {
      const candidate = raw.trim();
      if (!candidate) continue;

      if (!/^\d{15}$/.test(candidate)) {
        rejected.push({ imei: candidate, reason: "Sai định dạng (bắt buộc đúng 15 chữ số)" });
        continue;
      }
      if (batchSeen.has(candidate)) {
        rejected.push({ imei: candidate, reason: "Trùng lặp ngay trong danh sách đang nhập" });
        continue;
      }
      if (existingSet.has(candidate)) {
        rejected.push({ imei: candidate, reason: "Mã IMEI đã tồn tại trong CSDL toàn chuỗi" });
        continue;
      }

      batchSeen.add(candidate);
      validImeis.push(candidate);
    }

    if (validImeis.length > 0) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const statements: InStatement[] = validImeis.map((imei) => ({
        sql: `INSERT INTO tbl_ThietBi_IMEI (
                ma_imei, ma_san_pham, ma_chi_nhanh, so_serial, trang_thai, ngay_nhap_kho, gia_nhap, locked_by, locked_until
              ) VALUES (?, ?, ?, ?, 'SanSangBan', ?, ?, NULL, NULL)`,
        args: [
          imei,
          params.productId,
          params.branchId,
          `SN-${imei.slice(-6)}`,
          todayStr,
          params.importPrice,
        ],
      }));
      await db.batch(statements, "write");
    }

    return {
      importedCount: validImeis.length,
      validImeis,
      rejected,
    };
  }

  async importAccessoryStock(params: {
    productId: string;
    branchId: string;
    quantity: number;
  }): Promise<{ ma_san_pham: string; ma_chi_nhanh: string; so_luong_ton: number }> {
    await ensureDatabaseInitialized();
    if (params.quantity <= 0) {
      throw new Error("Số lượng nhập kho phải lớn hơn 0.");
    }
    const product = await this.spRepo.findById(params.productId);
    if (!product || product.loai_san_pham !== "PhuKien") {
      throw new Error("Mã sản phẩm không phải là phụ kiện quản lý theo SKU.");
    }

    const db = getDbClient();
    await db.execute({
      sql: `INSERT INTO tbl_TonKho_PhuKien (ma_san_pham, ma_chi_nhanh, so_luong_ton, muc_ton_an_toan)
            VALUES (?, ?, ?, 10)
            ON CONFLICT(ma_san_pham, ma_chi_nhanh)
            DO UPDATE SET so_luong_ton = so_luong_ton + excluded.so_luong_ton`,
      args: [params.productId, params.branchId, Math.floor(params.quantity)],
    });

    const updated = await db.execute({
      sql: "SELECT so_luong_ton FROM tbl_TonKho_PhuKien WHERE ma_san_pham = ? AND ma_chi_nhanh = ?",
      args: [params.productId, params.branchId],
    });

    return {
      ma_san_pham: params.productId,
      ma_chi_nhanh: params.branchId,
      so_luong_ton: Number(updated.rows[0]?.so_luong_ton ?? 0),
    };
  }

  async getCrossBranchMatrix(keyword?: string): Promise<CrossBranchMatrixItem[]> {
    await this.imeiRepo.releaseExpiredLocks();
    const branches = await this.branchRepo.findAllBranches();
    const allProducts = await this.spRepo.findAll();
    const deviceModels = allProducts.filter((p) => p.loai_san_pham !== "PhuKien");
    const availableDevices = await this.imeiRepo.findByFilter({ status: "SanSangBan" });

    const q = keyword?.trim().toLowerCase() ?? "";
    const filteredModels = q
      ? deviceModels.filter(
          (m) =>
            m.ten_san_pham.toLowerCase().includes(q) ||
            m.ma_san_pham.toLowerCase().includes(q) ||
            m.thuong_hieu.toLowerCase().includes(q)
        )
      : deviceModels;

    return filteredModels.map((m) => {
      const stockByBranch: Record<string, number> = {};
      const availableImeisByBranch: Record<string, string[]> = {};
      for (const b of branches) {
        stockByBranch[b.ma_chi_nhanh] = 0;
        availableImeisByBranch[b.ma_chi_nhanh] = [];
      }

      let total = 0;
      for (const dev of availableDevices) {
        if (dev.ma_san_pham === m.ma_san_pham) {
          stockByBranch[dev.ma_chi_nhanh] = (stockByBranch[dev.ma_chi_nhanh] ?? 0) + 1;
          availableImeisByBranch[dev.ma_chi_nhanh] = [
            ...(availableImeisByBranch[dev.ma_chi_nhanh] ?? []),
            dev.ma_imei,
          ];
          total += 1;
        }
      }

      return {
        ma_san_pham: m.ma_san_pham,
        ten_san_pham: m.ten_san_pham,
        thuong_hieu: m.thuong_hieu,
        loai_san_pham: m.loai_san_pham,
        cau_hinh_tom_tat: m.cau_hinh_tom_tat,
        gia_hien_hanh: m.gia_khuyen_mai ?? m.gia_niem_yet,
        stockByBranch,
        availableImeisByBranch,
        totalChainStock: total,
      };
    });
  }

  async listTransfers(branchId?: string): Promise<TransferTicket[]> {
    return this.transferRepo.findAll(branchId);
  }

  async createTransferRequest(params: {
    fromBranchId: string;
    toBranchId: string;
    productId: string;
    requesterName: string;
    note?: string;
  }): Promise<TransferTicket> {
    await ensureDatabaseInitialized();
    if (params.fromBranchId === params.toBranchId) {
      throw new Error("Chi nhánh xuất và chi nhánh nhận không được trùng nhau.");
    }

    const availableAtSource = await this.imeiRepo.findByFilter({
      branchId: params.fromBranchId,
      productId: params.productId,
      status: "SanSangBan",
    });
    if (availableAtSource.length === 0) {
      throw new Error("Chi nhánh được yêu cầu hiện không còn máy 'Sẵn sàng bán' cho model này.");
    }

    const db = getDbClient();
    const nowIso = new Date().toISOString();
    const ticketId = `TRF-${Date.now().toString().slice(-6)}`;

    await db.execute({
      sql: `INSERT INTO tbl_PhieuDieuChuyen (
              ma_phieu_chuyen, ma_chi_nhanh_xuat, ma_chi_nhanh_nhap, ma_san_pham,
              ma_imei, nguoi_yeu_cau, nguoi_duyet, ngay_tao, ngay_cap_nhat, trang_thai, ghi_chu
            ) VALUES (?, ?, ?, ?, NULL, ?, NULL, ?, ?, 'Pending', ?)`,
      args: [
        ticketId,
        params.fromBranchId,
        params.toBranchId,
        params.productId,
        params.requesterName.trim() || "Nhân viên chi nhánh",
        nowIso,
        nowIso,
        params.note?.trim() || null,
      ],
    });

    const created = await this.transferRepo.findById(ticketId);
    if (!created) throw new Error("Không thể khởi tạo phiếu điều chuyển.");
    return created;
  }

  async approveAndExportTransfer(params: {
    ticketId: string;
    exportImei: string;
    approverName: string;
  }): Promise<TransferTicket> {
    await ensureDatabaseInitialized();
    const ticket = await this.transferRepo.findById(params.ticketId);
    if (!ticket) throw new Error("Không tìm thấy phiếu điều chuyển.");
    if (ticket.trang_thai !== "Pending") {
      throw new Error(`Phiếu điều chuyển không ở trạng thái chờ duyệt (${ticket.trang_thai}).`);
    }

    const cleanImei = params.exportImei.trim();
    const device = await this.imeiRepo.findByIMEI(cleanImei);
    if (!device) {
      throw new Error(`Mã IMEI ${cleanImei} không tồn tại.`);
    }
    if (device.ma_chi_nhanh !== ticket.ma_chi_nhanh_xuat) {
      throw new Error("Mã IMEI không thuộc kho xuất của phiếu điều chuyển này.");
    }
    if (device.ma_san_pham !== ticket.ma_san_pham) {
      throw new Error("Mã IMEI không đúng dòng sản phẩm yêu cầu trên phiếu.");
    }
    if (device.trang_thai !== "SanSangBan") {
      throw new Error(`Thiết bị ${cleanImei} hiện không sẵn sàng xuất kho (${device.trang_thai}).`);
    }

    const db = getDbClient();
    const nowIso = new Date().toISOString();
    await db.batch(
      [
        {
          sql: "UPDATE tbl_ThietBi_IMEI SET trang_thai = 'DangLuanChuyen', locked_by = NULL, locked_until = NULL WHERE ma_imei = ?",
          args: [cleanImei],
        },
        {
          sql: `UPDATE tbl_PhieuDieuChuyen
                SET ma_imei = ?, nguoi_duyet = ?, ngay_cap_nhat = ?, trang_thai = 'InTransit'
                WHERE ma_phieu_chuyen = ?`,
          args: [cleanImei, params.approverName.trim() || "Quản lý kho xuất", nowIso, params.ticketId],
        },
      ],
      "write"
    );

    const updated = await this.transferRepo.findById(params.ticketId);
    if (!updated) throw new Error("Lỗi cập nhật phiếu xuất điều chuyển.");
    return updated;
  }

  async confirmReceiveTransfer(params: {
    ticketId: string;
    scannedImei: string;
  }): Promise<TransferTicket> {
    await ensureDatabaseInitialized();
    const ticket = await this.transferRepo.findById(params.ticketId);
    if (!ticket) throw new Error("Không tìm thấy phiếu điều chuyển.");
    if (ticket.trang_thai !== "InTransit") {
      throw new Error("Phiếu điều chuyển chưa ở trạng thái Đang vận chuyển (InTransit).");
    }

    const cleanScanned = params.scannedImei.trim();
    if (cleanScanned !== ticket.ma_imei) {
      throw new Error(
        `Mã IMEI quét nhận (${cleanScanned}) không khớp với mã IMEI xuất trên phiếu (${ticket.ma_imei})! Vui lòng kiểm tra đối soát.`
      );
    }

    const db = getDbClient();
    const nowIso = new Date().toISOString();
    await db.batch(
      [
        {
          sql: `UPDATE tbl_ThietBi_IMEI
                SET ma_chi_nhanh = ?, trang_thai = 'SanSangBan', locked_by = NULL, locked_until = NULL
                WHERE ma_imei = ?`,
          args: [ticket.ma_chi_nhanh_nhap, cleanScanned],
        },
        {
          sql: `UPDATE tbl_PhieuDieuChuyen
                SET ngay_cap_nhat = ?, trang_thai = 'Completed'
                WHERE ma_phieu_chuyen = ?`,
          args: [nowIso, params.ticketId],
        },
      ],
      "write"
    );

    const updated = await this.transferRepo.findById(params.ticketId);
    if (!updated) throw new Error("Lỗi hoàn tất nhận điều chuyển.");
    return updated;
  }

  async rejectTransfer(ticketId: string, reason?: string): Promise<TransferTicket> {
    await ensureDatabaseInitialized();
    const ticket = await this.transferRepo.findById(ticketId);
    if (!ticket) throw new Error("Không tìm thấy phiếu điều chuyển.");
    if (ticket.trang_thai !== "Pending") {
      throw new Error("Chỉ có thể từ chối phiếu đang ở trạng thái Chờ duyệt.");
    }

    const db = getDbClient();
    const nowIso = new Date().toISOString();
    await db.execute({
      sql: `UPDATE tbl_PhieuDieuChuyen
            SET trang_thai = 'Rejected', ngay_cap_nhat = ?, ghi_chu = COALESCE(?, ghi_chu)
            WHERE ma_phieu_chuyen = ?`,
      args: [nowIso, reason?.trim() || null, ticketId],
    });

    const updated = await this.transferRepo.findById(ticketId);
    if (!updated) throw new Error("Lỗi cập nhật từ chối phiếu.");
    return updated;
  }
}
