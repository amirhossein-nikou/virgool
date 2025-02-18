import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import QueryString from "qs";
import { SmsTemplates } from "../enum/sms-template.enum";
import { catchError, lastValueFrom, map } from "rxjs";

@Injectable()
export class KavenegarService {
    constructor(private httpService: HttpService) { }

    async sendVerificationSms(receptor: string, code: string) {
        const params: string = QueryString.stringify({
            receptor,
            token: code,
            template: SmsTemplates.Verify
        })
        console.log(params);
        const {SMS_API} = process.env
        const result = await lastValueFrom(
            this.httpService.get(`${SMS_API}?${params}`)
            .pipe(
                map(res => res.data)
            )
            .pipe(
                catchError(err => {
                    console.log(err);
                    throw new InternalServerErrorException("Kavenegar")
                })
            )
        )

    }
}