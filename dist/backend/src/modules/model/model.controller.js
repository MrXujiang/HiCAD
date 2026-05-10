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
exports.ModelController = void 0;
const common_1 = require("@nestjs/common");
const model_service_1 = require("./model.service");
const model_dto_1 = require("./dto/model.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const optional_jwt_guard_1 = require("../../common/guards/optional-jwt.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ModelController = class ModelController {
    constructor(modelService) {
        this.modelService = modelService;
    }
    async getMarket(page = '1', limit = '20', type = 'all', category = '', search = '', sort = 'latest') {
        return this.modelService.getMarketItems(parseInt(page), parseInt(limit), type, category, search, sort);
    }
    likeModel(id) {
        return this.modelService.likeModel(id);
    }
    async findAll(user, page = '1', limit = '20') {
        return this.modelService.findByUser(user.id, parseInt(page), parseInt(limit));
    }
    async create(user, dto) {
        return this.modelService.create(user.id, dto);
    }
    async getByShareToken(token) {
        return this.modelService.findByShareToken(token);
    }
    async publish(id, user, dto) {
        return this.modelService.publish(id, user.id, user.tier, dto, user.email);
    }
    async unpublish(id, user) {
        return this.modelService.unpublish(id, user.id);
    }
    async findOne(id, user) {
        return this.modelService.findOne(id, user.id);
    }
    async update(id, user, dto) {
        return this.modelService.update(id, user.id, dto);
    }
    async remove(id, user) {
        return this.modelService.remove(id, user.id);
    }
    async share(id, user) {
        return this.modelService.createShareToken(id, user.id);
    }
};
exports.ModelController = ModelController;
__decorate([
    (0, common_1.Get)('market'),
    (0, common_1.UseGuards)(optional_jwt_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('sort')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "getMarket", null);
__decorate([
    (0, common_1.Post)('market/:id/like'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ModelController.prototype, "likeModel", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, model_dto_1.CreateModelDto]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('share/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "getByShareToken", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, model_dto_1.PublishModelDto]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/unpublish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, model_dto_1.UpdateModelDto]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "share", null);
exports.ModelController = ModelController = __decorate([
    (0, common_1.Controller)('models'),
    __metadata("design:paramtypes", [model_service_1.ModelService])
], ModelController);
//# sourceMappingURL=model.controller.js.map