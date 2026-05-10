import { FeedbackService } from './feedback.service';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    submit(body: {
        content: string;
        page?: string;
    }, user: any): {
        success: boolean;
        id: string;
    };
}
