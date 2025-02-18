import { UploadedFiles, ParseFilePipe } from "@nestjs/common";

export function uploadedFilesOptional() {
    return UploadedFiles(new ParseFilePipe({
        fileIsRequired: false
    }))
}