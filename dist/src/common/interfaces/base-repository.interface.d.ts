export interface PaginationParams {
    skip?: number;
    take?: number;
    cursor?: string;
}
export interface PaginatedResult<T> {
    data: T[];
    total?: number;
    nextCursor: string | null;
    hasMore?: boolean;
    page?: number;
    limit?: number;
    totalPages?: number;
}
export interface ICacheRepository {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    invalidate(pattern: string): Promise<void>;
    wrap<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T>;
}
export interface IAuditRepository {
    log(params: {
        userId: string;
        userName: string;
        role: string;
        action: string;
        entity: string;
        entityId?: string;
        beforeState?: Record<string, unknown>;
        afterState?: Record<string, unknown>;
        integrityHash?: string;
        ipAddress: string;
        userAgent?: string;
        severity?: string;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
}
