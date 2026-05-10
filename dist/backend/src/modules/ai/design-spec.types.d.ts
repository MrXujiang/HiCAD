export interface MechanicalArmParams {
    baseWidth: number;
    waistRadius: number;
    waistHeight: number;
    upperArmLength: number;
    upperArmRadius: number;
    elbowRadius: number;
    foreArmLength: number;
    foreArmRadius: number;
    wristRadius: number;
    toolLength: number;
}
export interface MechanicalArmFeatures {
    flanges: boolean;
    ribs: boolean;
    wingJoints: boolean;
    cornerPillars: boolean;
    toolType: 'cone' | 'cylinder' | 'gripper';
}
export interface MechanicalArmSpec {
    type: 'mechanical_arm';
    material: string;
    style: 'industrial' | 'colorful';
    params: MechanicalArmParams;
    features: MechanicalArmFeatures;
}
export interface TankParams {
    hullLength: number;
    hullWidth: number;
    hullHeight: number;
    turretDiam: number;
    turretHeight: number;
    gunLength: number;
    gunRadius: number;
    trackWidth: number;
    trackHeight: number;
    wheelCount: number;
}
export interface TankFeatures {
    slopeArmor: boolean;
    cupola: boolean;
    exhaustPipe: boolean;
    antennas: boolean;
}
export interface TankSpec {
    type: 'tank';
    material: string;
    params: TankParams;
    features: TankFeatures;
}
export declare const DEFAULT_TANK_PARAMS: TankParams;
export declare const DEFAULT_TANK_FEATURES: TankFeatures;
export declare function getDefaultTankSpec(): TankSpec;
export declare function normalizeTankSpec(raw: any): TankSpec;
export type DesignSpec = MechanicalArmSpec | TankSpec;
export declare const DEFAULT_ARM_PARAMS: MechanicalArmParams;
export declare const DEFAULT_ARM_FEATURES: MechanicalArmFeatures;
export declare function getDefaultArmSpec(): MechanicalArmSpec;
export declare function normalizeArmSpec(raw: any): MechanicalArmSpec;
