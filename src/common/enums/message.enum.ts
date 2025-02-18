
export enum BadRequestMessage{
    InvalidLoginData = "the data is invalid for login",
    InvalidRegisterData = "the data is invalid for register",
    CodeNotExpires = "Code not expired yet. you cant get new code",
    ValueIsNull = "You cant set null to this Value",
    InvalidImageFormat = "the image format is invalid image must be .png or .jpg(.jpeg) formats",
    InvalidEmailFormat = "Email format is invalid",
    InvalidMobileFormat = "mobile format is invalid",
    SomethingWrong = "Something went wrong please try again",
    InvalidCategoryFormat = "Category format most be string or string array ",
    AlreadyAccepted = "This comment is Already Accepted ",
    AlreadyRejected = "This comment is Already Rejected ",
}
export enum AuthMessage{
    ExistAccount = "Account is already exists",
    NotFoundAccount = "Cant find your account please register first",
    CodeExpires = "Code expires please send new code",
    TokenNotFound = "Please log in again (token not found)",
    CodeNotExist = "Code not found",
    WrongCode = "Code incorrect please try again",
    LogInAgain = "LogInAgain",
    LogIn = "LogIn to your account",
    
}

export enum PublicMessages{
    SendCode = "OTP code sends successfully",
    LoggedIn = "You logged in successfully !",
    LogInAgain = "something went wrong login again",
    Create = "Create Successfully",
    Update = "Update Successfully",
    Delete = "Delete Successfully",
    Like = "Like Successfully",
    DisLike = "Like removed Successfully",
    Bookmark = "Bookmark Successfully",
    UnBookmark = "Bookmark removed Successfully",
    Comment = "comment create Successfully",
    AcceptComment = "comment accepted Successfully",
    RejectComment = "comment rejected Successfully",
    Follow = "Follow user Successfully",
    UnFollow = "UnFollow user Successfully",
    Block = "Block user Successfully",
    UnBlock = "UnBlock user Successfully",
}
export enum ConflictExceptionMessage{
    ExistsTitle = "Title is already exists",
}
export enum NotFoundMessage{
    GeneralNotFound = "Can not find any data",
    NotFoundCategory = "Category not found",
    NotFoundOTP = "OTP not found",
    NotFoundBlog = "Blog not found",
    NotFoundComment = "Comment not found",
    NotFoundImage = "Image not found",
    NotFoundUser = "User not found",
}
export enum ConflictExceptionMessage{
    Email = "Email is using by another user",
    Mobile = "Mobile is using by another user",
    Username = "username is already exists",
}

export enum ForbiddenMessage{
    BlockedUser = "You are blocked by admin please contact us for more details"
}

