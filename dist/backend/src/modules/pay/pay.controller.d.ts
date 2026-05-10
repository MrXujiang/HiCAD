import { PayService } from './pay.service';
import { CreateOrderDto } from './dto/pay.dto';
export declare class PayController {
    private readonly payService;
    constructor(payService: PayService);
    create(req: any, dto: CreateOrderDto): Promise<{
        codeUrl: string;
        orderNo: string;
        amount: number;
        planName: string;
    }>;
    status(orderNo: string): Promise<{
        status: any;
        transaction_id: any;
        activationCode: string | undefined;
    } | {
        status: string;
        activationCode: string | undefined;
        transaction_id?: undefined;
    }>;
    code(orderNo: string): Promise<{
        status: string;
        activationCode: string | null;
    }>;
    callback(body: any): Promise<{
        code: number;
    }>;
}
