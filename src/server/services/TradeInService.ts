import type { TradeInEvaluationInput, TradeInEvaluationResult } from "@/types/domain";

export const TRADE_IN_CATALOG: Array<{ code: string; name: string; ceilingPrice: number }> = [
  { code: "IP15PM-256", name: "iPhone 15 Pro Max 256GB", ceilingPrice: 21500000 },
  { code: "IP14PM-128", name: "iPhone 14 Pro Max 128GB", ceilingPrice: 14500000 },
  { code: "IP13-128", name: "iPhone 13 128GB Quốc tế", ceilingPrice: 8200000 },
  { code: "IP12-64", name: "iPhone 12 64GB Quốc tế", ceilingPrice: 5500000 },
  { code: "SS-S23U", name: "Samsung Galaxy S23 Ultra 256GB", ceilingPrice: 13800000 },
  { code: "MB-AIR-M1", name: "MacBook Air M1 8GB/256GB", ceilingPrice: 11200000 },
];

export class TradeInService {
  getSupportedModels() {
    return TRADE_IN_CATALOG;
  }

  evaluateTradeIn(input: TradeInEvaluationInput): TradeInEvaluationResult {
    const model = TRADE_IN_CATALOG.find((m) => m.code === input.modelCode);
    if (!model) {
      throw new Error(`Model thu cũ '${input.modelCode}' không nằm trong danh mục hỗ trợ.`);
    }

    if (!input.biometricsAndAccountClean) {
      return {
        modelCode: model.code,
        modelName: model.name,
        baseCeilingPrice: model.ceilingPrice,
        deductionAmount: model.ceilingPrice,
        finalTradeInValue: 0,
        conditionGrade: "Tu choi thu mua",
        eligible: false,
        notes: ["Từ chối thu mua: Máy còn dính tài khoản iCloud/Google/MDM hoặc mất FaceID/TouchID."],
      };
    }

    let deductionRatio = 0;
    const notes: string[] = [];

    if (!input.screenIntact) {
      deductionRatio += 0.25;
      notes.push("Màn hình trầy sâu / ám ố / đã ép kính (-25%)");
    }
    if (!input.batteryAbove85) {
      deductionRatio += 0.08;
      notes.push("Dung lượng pin dưới 85% cần thay pin (-8%)");
    }
    if (!input.bodyNoMajorDents) {
      deductionRatio += 0.10;
      notes.push("Viền vỏ trầy xước / cấn móp (-10%)");
    }

    if (notes.length === 0) {
      notes.push("Máy nguyên bản đẹp keng, đầy đủ chức năng (Trợ giá tối đa 100%)");
    }

    const deductionAmount = Math.round((model.ceilingPrice * deductionRatio) / 10000) * 10000;
    const finalTradeInValue = Math.max(0, model.ceilingPrice - deductionAmount);

    let conditionGrade: TradeInEvaluationResult["conditionGrade"] = "Loai A (Dep keng)";
    if (deductionRatio > 0 && deductionRatio <= 0.18) {
      conditionGrade = "Loai B (Tray nhe)";
    } else if (deductionRatio > 0.18) {
      conditionGrade = "Loai C (Can sua chua)";
    }

    return {
      modelCode: model.code,
      modelName: model.name,
      baseCeilingPrice: model.ceilingPrice,
      deductionAmount,
      finalTradeInValue,
      conditionGrade,
      eligible: true,
      notes,
    };
  }
}
