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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const admin_guard_1 = require("../../common/guards/admin.guard");
const feedback_service_1 = require("../feedback/feedback.service");
let AdminController = class AdminController {
    constructor(adminService, feedbackService) {
        this.adminService = adminService;
        this.feedbackService = feedbackService;
    }
    getStats() {
        return this.adminService.getStats();
    }
    getUsers() {
        return this.adminService.getUsers();
    }
    getOrders() {
        return this.adminService.getOrders();
    }
    setTier(id, body) {
        return this.adminService.setUserTier(id, body.tier);
    }
    deleteUser(id) {
        return this.adminService.deleteUser(id);
    }
    resetQuota(id) {
        return this.adminService.resetUserQuota(id);
    }
    getAllModels(page = '1', limit = '50', search = '') {
        return this.adminService.getAllModels(parseInt(page), parseInt(limit), search);
    }
    getModelDetail(id) {
        return this.adminService.adminGetModelDetail(id);
    }
    ensureShare(id) {
        return this.adminService.adminEnsureShare(id);
    }
    deleteModel(id) {
        return this.adminService.adminDeleteModel(id);
    }
    deleteTemplate(id) {
        return this.adminService.adminDeleteTemplate(id);
    }
    getFeedbacks() {
        return this.feedbackService.findAll();
    }
    deleteFeedback(id) {
        return this.feedbackService.remove(id);
    }
    getTemplates() {
        return this.adminService.getAdminTemplates();
    }
    toggleFeatured(id, body) {
        return this.adminService.toggleTemplateFeatured(id, body?.source ?? 'template');
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('orders'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Put)('users/:id/tier'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "setTier", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Put)('users/:id/reset-quota'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "resetQuota", null);
__decorate([
    (0, common_1.Get)('models'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllModels", null);
__decorate([
    (0, common_1.Get)('models/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getModelDetail", null);
__decorate([
    (0, common_1.Post)('models/:id/share'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "ensureShare", null);
__decorate([
    (0, common_1.Delete)('models/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteModel", null);
__decorate([
    (0, common_1.Delete)('templates/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Get)('feedbacks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getFeedbacks", null);
__decorate([
    (0, common_1.Delete)('feedbacks/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteFeedback", null);
__decorate([
    (0, common_1.Get)('templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Put)('templates/:id/featured'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleFeatured", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        feedback_service_1.FeedbackService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map