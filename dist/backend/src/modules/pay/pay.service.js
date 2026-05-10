"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayService = exports.PLAN_CONFIG = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const json_db_service_1 = require("../../database/json-db.service");
const crypto = require("crypto");
const https = require("https");
const http = require("http");
const uuid_1 = require("uuid");
exports.PLAN_CONFIG = {
    basic: { amount: 200, name: 'HiCAD 体验版会员', tier: 'basic', label: '体验版 ¥2 永久' },
    pro: { amount: 2990, name: 'HiCAD 高级会员月度', tier: 'pro', label: '高级会员 ¥29.9/月' },
    enterprise: { amount: 99900, name: 'HiCAD 专业版源码授权', tier: 'enterprise', label: '专业版 ¥999 永久' },
};
let PayService = PayService_1 = class PayService {
    constructor(db, config) {
        this.db = db;
        this.config = config;
        this.logger = new common_1.Logger(PayService_1.name);
        this.appKey = this.config.get('JITPAY_KEY') || '';
        this.appSecret = this.config.get('JITPAY_SECRET') || '';
        this.baseUrl = this.config.get('JITPAY_BASE_URL') || 'https://pay.pxcharts.com';
    }
    buildHeaders(method, path, body) {
        const timestamp = String(Math.floor(Date.now() / 1000));
        const nonce = crypto.randomBytes(16).toString('hex');
        const bodyStr = body ? JSON.stringify(body) : '';
        const bodyHash = crypto.createHash('sha256').update(bodyStr, 'utf8').digest('hex');
        const signStr = `${method}\n${path}\n${timestamp}\n${nonce}\n${bodyHash}\n`;
        const signature = crypto.createHmac('sha256', this.appSecret).update(signStr).digest('hex');
        return {
            'Content-Type': 'application/json',
            'X-App-Key': this.appKey,
            'X-Timestamp': timestamp,
            'X-Nonce': nonce,
            'X-Signature': signature,
        };
    }
    request(method, path, body) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.baseUrl + path);
            const headers = this.buildHeaders(method, path, body);
            const postData = body ? JSON.stringify(body) : '';
            if (postData)
                headers['Content-Length'] = String(Buffer.byteLength(postData));
            const mod = url.protocol === 'https:' ? https : http;
            const req = mod.request({
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname + url.search,
                method,
                headers,
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch {
                        reject(new Error(`Invalid JSON: ${data}`));
                    }
                });
            });
            req.on('error', reject);
            if (postData)
                req.write(postData);
            req.end();
        });
    }
    generateActivationCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        return `HICAD-${seg()}-${seg()}-${seg()}`;
    }
    async createOrder(userId, plan) {
        const planCfg = exports.PLAN_CONFIG[plan];
        if (!planCfg)
            throw new common_1.BadRequestException('无效的套餐类型');
        const suffix = userId ? userId.substring(0, 8) : crypto.randomBytes(4).toString('hex');
        const outTradeNo = `hicad_${Date.now()}_${suffix}`;
        let codeUrl = '';
        let orderNo = '';
        try {
            const result = await this.request('POST', '/v1/pay/create', {
                pay_type: 'NATIVE',
                out_trade_no: outTradeNo,
                amount: planCfg.amount,
                description: planCfg.name,
            });
            codeUrl = result.code_url || result.data?.code_url || '';
            orderNo = result.order_no || result.data?.order_no || outTradeNo;
        }
        catch (err) {
            this.logger.error(`JitPay create order failed: ${err.message}`);
            codeUrl = `weixin://wxpay/bizpayurl?pr=${outTradeNo}`;
            orderNo = outTradeNo;
        }
        const store = this.db.get('orders');
        store.orders.push({
            id: (0, uuid_1.v4)(),
            outTradeNo,
            orderNo,
            ...(userId ? { userId } : {}),
            plan,
            amount: planCfg.amount,
            status: 'pending',
            createdAt: new Date().toISOString(),
        });
        this.db.set('orders', store);
        return { codeUrl, orderNo, amount: planCfg.amount, planName: planCfg.label };
    }
    async getOrderStatus(orderNo) {
        try {
            const result = await this.request('GET', `/v1/pay/status/${orderNo}`);
            const status = result.status || result.data?.status;
            if (status === 'paid') {
                const txId = result.transaction_id || result.data?.transaction_id || '';
                await this.activateOrder(orderNo, txId);
            }
            const store = this.db.get('orders');
            const order = store.orders.find((o) => o.orderNo === orderNo || o.outTradeNo === orderNo);
            return {
                status,
                transaction_id: result.transaction_id,
                activationCode: order?.activationCode,
            };
        }
        catch (err) {
            this.logger.error(`JitPay status query failed: ${err.message}`);
            const store = this.db.get('orders');
            const order = store.orders.find((o) => o.orderNo === orderNo || o.outTradeNo === orderNo);
            return {
                status: order?.status === 'paid' ? 'paid' : 'pending',
                activationCode: order?.activationCode,
            };
        }
    }
    async getActivationCode(orderNo) {
        const store = this.db.get('orders');
        const order = store.orders.find((o) => o.orderNo === orderNo || o.outTradeNo === orderNo);
        if (!order)
            throw new common_1.BadRequestException('订单不存在');
        if (order.status !== 'paid')
            return { status: order.status, activationCode: null };
        return { status: 'paid', activationCode: order.activationCode || null };
    }
    async handleCallback(body) {
        const { order_no, status, transaction_id } = body;
        if (status === 'paid') {
            await this.activateOrder(order_no, transaction_id || '');
        }
        return { code: 0 };
    }
    async activateOrder(orderNo, transactionId) {
        const store = this.db.get('orders');
        const order = store.orders.find((o) => o.orderNo === orderNo || o.outTradeNo === orderNo);
        if (!order || order.status === 'paid')
            return;
        const now = new Date().toISOString();
        order.status = 'paid';
        order.transactionId = transactionId;
        order.paidAt = now;
        order.activationCode = this.generateActivationCode();
        this.db.set('orders', store);
        this.logger.log(`Order ${orderNo} paid, activation code: ${order.activationCode}`);
    }
};
exports.PayService = PayService;
exports.PayService = PayService = PayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        config_1.ConfigService])
], PayService);
//# sourceMappingURL=pay.service.js.map