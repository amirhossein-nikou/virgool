import { multerFile } from "src/common/utils/multer.utils"

export type ProfileImagesType = {
     profile_image: multerFile[],
     bg_image: multerFile[],
}