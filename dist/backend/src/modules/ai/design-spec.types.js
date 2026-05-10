"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ARM_FEATURES = exports.DEFAULT_ARM_PARAMS = exports.DEFAULT_TANK_FEATURES = exports.DEFAULT_TANK_PARAMS = void 0;
exports.getDefaultTankSpec = getDefaultTankSpec;
exports.normalizeTankSpec = normalizeTankSpec;
exports.getDefaultArmSpec = getDefaultArmSpec;
exports.normalizeArmSpec = normalizeArmSpec;
exports.DEFAULT_TANK_PARAMS = {
    hullLength: 160,
    hullWidth: 80,
    hullHeight: 30,
    turretDiam: 56,
    turretHeight: 22,
    gunLength: 100,
    gunRadius: 5,
    trackWidth: 14,
    trackHeight: 18,
    wheelCount: 5,
};
exports.DEFAULT_TANK_FEATURES = {
    slopeArmor: true,
    cupola: true,
    exhaustPipe: true,
    antennas: false,
};
function getDefaultTankSpec() {
    return {
        type: 'tank',
        material: 'metal',
        params: { ...exports.DEFAULT_TANK_PARAMS },
        features: { ...exports.DEFAULT_TANK_FEATURES },
    };
}
function normalizeTankSpec(raw) {
    const def = getDefaultTankSpec();
    const clamp = (v, min, max, fb) => typeof v === 'number' && !isNaN(v) ? Math.min(max, Math.max(min, v)) : fb;
    const rawP = raw?.params || {};
    const rawF = raw?.features || {};
    return {
        type: 'tank',
        material: ['metal', 'carbon', 'titanium', 'obsidian'].includes(raw?.material)
            ? raw.material : def.material,
        params: {
            hullLength: clamp(rawP.hullLength, 60, 250, def.params.hullLength),
            hullWidth: clamp(rawP.hullWidth, 40, 150, def.params.hullWidth),
            hullHeight: clamp(rawP.hullHeight, 15, 60, def.params.hullHeight),
            turretDiam: clamp(rawP.turretDiam, 25, 100, def.params.turretDiam),
            turretHeight: clamp(rawP.turretHeight, 10, 45, def.params.turretHeight),
            gunLength: clamp(rawP.gunLength, 40, 180, def.params.gunLength),
            gunRadius: clamp(rawP.gunRadius, 2, 12, def.params.gunRadius),
            trackWidth: clamp(rawP.trackWidth, 6, 30, def.params.trackWidth),
            trackHeight: clamp(rawP.trackHeight, 8, 30, def.params.trackHeight),
            wheelCount: clamp(rawP.wheelCount, 3, 8, def.params.wheelCount),
        },
        features: {
            slopeArmor: rawF.slopeArmor !== false,
            cupola: rawF.cupola !== false,
            exhaustPipe: rawF.exhaustPipe !== false,
            antennas: rawF.antennas === true,
        },
    };
}
exports.DEFAULT_ARM_PARAMS = {
    baseWidth: 100,
    waistRadius: 32,
    waistHeight: 40,
    upperArmLength: 95,
    upperArmRadius: 13,
    elbowRadius: 18,
    foreArmLength: 70,
    foreArmRadius: 9,
    wristRadius: 12,
    toolLength: 32,
};
exports.DEFAULT_ARM_FEATURES = {
    flanges: true,
    ribs: true,
    wingJoints: true,
    cornerPillars: true,
    toolType: 'cone',
};
function getDefaultArmSpec() {
    return {
        type: 'mechanical_arm',
        material: 'silver',
        style: 'industrial',
        params: { ...exports.DEFAULT_ARM_PARAMS },
        features: { ...exports.DEFAULT_ARM_FEATURES },
    };
}
function normalizeArmSpec(raw) {
    const def = getDefaultArmSpec();
    const clamp = (v, min, max, fallback) => typeof v === 'number' && !isNaN(v) ? Math.min(max, Math.max(min, v)) : fallback;
    const rawP = raw?.params || {};
    const rawF = raw?.features || {};
    return {
        type: 'mechanical_arm',
        material: ['silver', 'titanium', 'carbon', 'gold', 'copper', 'obsidian'].includes(raw?.material)
            ? raw.material : def.material,
        style: raw?.style === 'colorful' ? 'colorful' : 'industrial',
        params: {
            baseWidth: clamp(rawP.baseWidth, 60, 180, def.params.baseWidth),
            waistRadius: clamp(rawP.waistRadius, 20, 55, def.params.waistRadius),
            waistHeight: clamp(rawP.waistHeight, 25, 80, def.params.waistHeight),
            upperArmLength: clamp(rawP.upperArmLength, 60, 180, def.params.upperArmLength),
            upperArmRadius: clamp(rawP.upperArmRadius, 8, 22, def.params.upperArmRadius),
            elbowRadius: clamp(rawP.elbowRadius, 12, 30, def.params.elbowRadius),
            foreArmLength: clamp(rawP.foreArmLength, 40, 130, def.params.foreArmLength),
            foreArmRadius: clamp(rawP.foreArmRadius, 5, 16, def.params.foreArmRadius),
            wristRadius: clamp(rawP.wristRadius, 8, 20, def.params.wristRadius),
            toolLength: clamp(rawP.toolLength, 15, 55, def.params.toolLength),
        },
        features: {
            flanges: rawF.flanges !== false,
            ribs: rawF.ribs !== false,
            wingJoints: rawF.wingJoints !== false,
            cornerPillars: rawF.cornerPillars !== false,
            toolType: ['cone', 'cylinder', 'gripper'].includes(rawF.toolType)
                ? rawF.toolType : def.features.toolType,
        },
    };
}
//# sourceMappingURL=design-spec.types.js.map