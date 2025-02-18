import { BadRequestException } from "@nestjs/common";
import { Request } from "express";
import { mkdirSync } from "fs";
import { extname, join } from "path";
import { BadRequestMessage } from "../enums/message.enum";
import { diskStorage } from "multer";

export type callbackDestination = (err: Error | null, destination: string) => (void)
export type callbackFilename = (err: Error | null, filename: string) => (void)
export type multerFile = Express.Multer.File
export function destinationUtils(filename: string) {
    return function (req: Request, file: multerFile, callback: callbackDestination): void {
        const path = join("public", "uploads", filename)
        mkdirSync(path, { recursive: true })
        callback(null, path)
    }
}
export function filenameUtils(req: Request, file: multerFile, callback: callbackFilename): void {
    const ext = extname(file.originalname).toLocaleLowerCase(); // get format like .png
    if (!validateImageFileFormat(ext)) {
        callback(new BadRequestException(BadRequestMessage.InvalidImageFormat), null)
    } else {
        const filename = `${Date.now()}${ext}`
        callback(null, filename)
    }
}
function validateImageFileFormat(ext: string) {
    return [".png", ".jpg", ".jpeg", ".jfif"].includes(ext);
}
export function multerStorageDisc(folderName : string){
    return diskStorage({
        destination: destinationUtils(folderName),
        filename: filenameUtils
      })
}