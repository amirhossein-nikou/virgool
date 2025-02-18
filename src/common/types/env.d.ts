
namespace NodeJS {
    interface ProcessEnv {
        //App
        PORT: number;
        //DB
        DB_PORT: number;
        DB_HOST: string
        DB_PASSWORD: string
        DB_USERNAME: string
        DB_DATABASE: string
        //secret
        COOKIE_SECRET: string
        TOKEN_SECRET: string
        ACCESS_TOKEN_SECRET: string
        EMAIL_TOKEN_SECRET: string
        MOBILE_TOKEN_SECRET: string
        SMS_API: string
        GOOGLE_CLIENT_ID: string,
        GOOGLE_CLIENT_SECRET: string
    }
}