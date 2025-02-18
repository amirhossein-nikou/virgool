import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function SwaggerConfigInit(app: INestApplication): void {
    const document = new DocumentBuilder()
        .setTitle("Virgool")
        .setDescription("this project is backend of virgool website")
        .setVersion("v.0.0.1")
        .addBearerAuth(swaggerAuthConfig(),"Authorization")
        .build()
    const swaggerDocument = SwaggerModule.createDocument(app, document)
    SwaggerModule.setup("/swagger", app, swaggerDocument)
}
function swaggerAuthConfig(): SecuritySchemeObject{
    return {
        type: "http",
        in: "header",
        bearerFormat: "JWT",
        scheme: "bearer"
    }
}