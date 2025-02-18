import { FileInterceptor } from "@nestjs/platform-express";
import { multerStorageDisc } from "../utils/multer.utils";

export function UploadImage(filedName: string, folderName: string = "images") {
    return class UploadUtility extends FileInterceptor(filedName,{
            storage: multerStorageDisc(folderName)
        }
    ){}
}