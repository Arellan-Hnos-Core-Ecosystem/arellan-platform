import { PrismaService } from "../../common/prisma/prisma.service";
export declare class SettingsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAll(): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }[]>;
    getByCategory(category: string): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }[]>;
    get(key: string): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }>;
    set(key: string, value: string, userId?: string): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }>;
    create(key: string, value: string, category?: string, isPublic?: boolean, userId?: string): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }>;
    update(key: string, value: string, userId?: string): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }>;
    delete(key: string): Promise<{
        message: string;
    }>;
}
