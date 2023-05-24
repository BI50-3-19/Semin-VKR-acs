import { FastifyRequest } from "fastify";

const ERRORS = {
    0: "Internal Server Error",
    1: "Method not found",
    2: "One of the required parameters is not transmitted or invalid",
    3: "Rate limit exceeded, retry in 1 minute",
    4: "Invalid auth data",
    5: "Need OTP code",
    6: "Invalid OTP code",
    7: "User not found",
    8: "Not enough rights to perform the action",
    9: "Role not found",
    10: "Role already exist",
    11: "All users with this role must be deleted",
    12: "Group not found",
    13: "Group already exist",
    14: "All users with this group must be deleted",
    15: "Schedule not found",
    16: "Schedule already exist",
    17: "All groups with this schedule must be deleted",
    18: "Area not found",
    19: "Area already exist",
    20: "All devices, groups and passes with this area must be deleted",
} as const;

type TAPIErrorCode = keyof typeof ERRORS;

interface IAdditionalErrorParams {
	code?: never;
	message?: never;
	request_params?: never;
	[prop: string]: unknown;
}

class APIError<
	Code extends TAPIErrorCode,
	Message extends typeof ERRORS[Code] | string = typeof ERRORS[Code],
	Additional extends IAdditionalErrorParams = IAdditionalErrorParams,
> {
    public readonly code: Code;
    public readonly message: Message;
    public readonly request: FastifyRequest<{
		Body: {
			[prop: string]: string;
		};
	}>;
    public readonly additional: Additional;

    constructor({
        code,
        request,
        additional = {} as Additional,
        message = ERRORS[code] as unknown as Message,
    }: {
		code: Code;
		request: FastifyRequest;
		additional?: Additional;
		message?: Message;
	}) {
        this.code = code;
        this.message = message;
        this.request = request as FastifyRequest<{
			Body: {
				[prop: string]: string;
			};
		}>;
        this.request.body = this.request.body || {};
        this.additional = additional;
    }

    public toJSON(): {
		code: Code;
		message: Message;
		request_params: { key: string; value: string }[];
	} & Additional {
        return {
            code: this.code,
            message: this.message,
            request_params: Object.keys(this.request.body).map((key) => {
                return {
                    key,
                    value: this.request.body[key]
                };
            }),
            ...this.additional,
        };
    }
}

export { ERRORS };

export default APIError;
