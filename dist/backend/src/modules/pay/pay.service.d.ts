import { ConfigService } from '@nestjs/config';
import { JsonDbService } from '../../database/json-db.service';
import { PlanType } from './dto/pay.dto';
export interface Order {
    id: string;
    outTradeNo: string;
    orderNo?: string;
    userId?: string;
    plan: PlanType;
    amount: number;
    status: 'pending' | 'paid' | 'closed' | 'failed';
    transactionId?: string;
    activationCode?: string;
    activationUsedAt?: string;
    activationUsedBy?: string;
    createdAt: string;
    paidAt?: string;
}
export declare const PLAN_CONFIG: Record<PlanType, {
    amount: number;
    name: string;
    tier: string;
    label: string;
}>;
export declare class PayService {
    private readonly db;
    private readonly config;
    private readonly logger;
    private readonly appKey;
    private readonly appSecret;
    private readonly baseUrl;
    constructor(db: JsonDbService, config: ConfigService);
    private buildHeaders;
    private request;
    private generateActivationCode;
    createOrder(userId: string | undefined, plan: PlanType): Promise<{
        codeUrl: string;
        orderNo: string;
        amount: number;
        planName: string;
    }>;
    getOrderStatus(orderNo: string): Promise<{
        status: any;
        transaction_id: any;
        activationCode: string | undefined;
    } | {
        status: string;
        activationCode: string | undefined;
        transaction_id?: undefined;
    }>;
    getActivationCode(orderNo: string): Promise<{
        status: string;
        activationCode: string | null;
    }>;
    handleCallback(body: any): Promise<{
        code: number;
    }>;
    private activateOrder;
}
