import { SanPhamRepository } from "@/server/repositories/SanPhamRepository";
import type { AccessoryRecommendation } from "@/types/domain";

export class RecommendationService {
  private spRepo = new SanPhamRepository();

  async getRecommendationsForCart(
    mainProductIds: string[],
    branchId: string
  ): Promise<AccessoryRecommendation[]> {
    const uniqueIds = Array.from(new Set(mainProductIds.filter(Boolean)));
    return this.spRepo.findCompatibleAccessories(uniqueIds, branchId);
  }
}
