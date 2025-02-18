import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { uploadedFilesOptional } from 'src/common/decorators/uploaded-file.decorator';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { multerStorageDisc } from 'src/common/utils/multer.utils';
import { BlockDto, CheckOtpDto } from '../auth/dto/auth.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ChangeDto, ChangeUsernameDto, ProfileDto } from './dto/profile.dto';
import { ProfileImagesType } from './types/files.type';
import { UserService } from './user.service';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';

@Controller('user')
@ApiTags("User")
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Put("/profile")
  @ApiConsumes(SwaggerConsumes.MultiPartData)
  @UseInterceptors(FileFieldsInterceptor([
    { name: "profile_image", maxCount: 1 },
    { name: "bg_image", maxCount: 1 }
  ], {
    storage: multerStorageDisc("user-profile")
  }))
  changeProfile(
    @uploadedFilesOptional() files: ProfileImagesType,
    @Body() profileDto: ProfileDto) {
    return this.userService.changeProfile(files, profileDto);
  }

  @Get("show-profile")
  showProfile() {
    return this.userService.showProfile()
  }
  @Patch("change-Email-Or-Mobile")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  changeEmail(@Body() changeDto: ChangeDto, @Res() res: Response) {
    return this.userService.saveCookies(res, changeDto)
  }
  @Patch("change-username")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  changeUsername(@Body() changeUsernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(changeUsernameDto.username)
  }
  @Post("verify-email")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  verifyEmail(@Body() checkOtpDto: CheckOtpDto) {
    return this.userService.verifyEmail(checkOtpDto.code)
  }
  @Post("verify-mobile")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  verifyMobile(@Body() checkOtpDto: CheckOtpDto) {
    return this.userService.verifyMobile(checkOtpDto.code)
  }
  @Get("/follow/:id")
  followToggle(@Param("id", ParseIntPipe) followingId: number) {
    return this.userService.followToggle(followingId)
  }
  @Get("/all-followers/")
  @PaginationDec()
  getFollowers(@Query() paginationDto: PaginationDto) {
    return this.userService.getFollowers(paginationDto)
  }
  @Get("/all-following/")
  @PaginationDec()
  getFollowings(@Query() paginationDto: PaginationDto) {
    return this.userService.getFollowings(paginationDto)
  }
  @Post("/blockUser/")
  @CanAccess(RolesEnum.Admin)
  @ApiConsumes(SwaggerConsumes.UrlEncoded,SwaggerConsumes.Json)
  blockToggle(@Body() blockDto: BlockDto) {
    return this.userService.blockToggle(blockDto)
  }




  /* @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  } */
}
