import { PrismaService } from "../../../common/prisma/prisma.service";
import type { ExecutiveSummaryReport } from "@arellan-hnos/business-intelligence-lab";
export declare class GetExecutiveSummaryUseCase {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(): Promise<Omit<ExecutiveSummaryReport, "cached">>;
    private getMechanicCycleTime;
    private getQuoteConversion;
    private getInventoryValuation;
    private getCashMargin;
}
