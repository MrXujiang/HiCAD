import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(user: {
        id: string;
    }): import("@hicad/shared").UserPublic;
}
