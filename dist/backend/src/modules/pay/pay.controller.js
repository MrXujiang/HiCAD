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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayController = void 0;
const common_1 = require("@nestjs/common");
const pay_service_1 = require("./pay.service");
const optional_jwt_guard_1 = require("../../common/guards/optional-jwt.guard");
const pay_dto_1 = require("./dto/pay.dto");
let PayController = class PayController {
    constructor(payService) {
        this.payService = payService;
    }
    async create(req, dto) {
        const userId = req.user?.id;
        return this.payService.createOrder(userId, dto.plan);
    }
    async status(orderNo) {
        return this.payService.getOrderStatus(orderNo);
    }
    async code(orderNo) {
        return this.payService.getActivationCode(orderNo);
    }
    async callback(body) {
        return this.payService.handleCallback(body);
    }
};
exports.PayController = PayController;
__decorate([
    (0, common_1.UseGuards)(optional_jwt_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pay_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('status/:orderNo'),
    __param(0, (0, common_1.Param)('orderNo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "status", null);
__decorate([
    (0, common_1.Get)('code/:orderNo'),
    __param(0, (0, common_1.Param)('orderNo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "code", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "callback", null);
exports.PayController = PayController = __decorate([
    (0, common_1.Controller)('pay'),
    __metadata("design:paramtypes", [pay_service_1.PayService])
], PayController);
//# sourceMappingURL=pay.controller.js.map