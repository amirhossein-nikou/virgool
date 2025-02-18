import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { isDate } from 'class-validator';
import { Request, Response } from 'express';
import { CookieName } from 'src/common/enums/cookie.enum';
import { AuthMessage, BadRequestMessage, ConflictExceptionMessage, NotFoundMessage, PublicMessages } from 'src/common/enums/message.enum';
import { cookieOptionsUtil } from 'src/common/utils/cookie.utils';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { AuthMethodEnum } from '../auth/authEnums/auth-method.enum';
import { TokenService } from '../auth/token.service';
import { ChangeDto, ProfileDto } from './dto/profile.dto';
import { OtpEntity } from './entities/otp.entity';
import { ProfileEntity } from './entities/profile.entity';
import { UserEntity } from './entities/user.entity';
import { Genders } from './enum/gender.enum';
import { ChangeResultType } from './types/change-result.type';
import { ProfileImagesType } from './types/files.type';
import { ChangeMethodEnum } from './enum/change.enum';
import { FollowEntity } from './entities/follow.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { BlockDto } from '../auth/dto/auth.dto';
import { UserStatus } from './enum/status.enum';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    @InjectRepository(FollowEntity) private followRepository: Repository<FollowEntity>,
    @Inject(REQUEST) private request: Request,
    private authService: AuthService,
    private tokenService: TokenService,
  ) { }


  async changeProfile(files: ProfileImagesType, profileDto: ProfileDto) {
    if (files?.profile_image?.length > 0) {
      let [image] = files?.profile_image
      profileDto.profile_image = image.path.slice(7);
    }
    if (files?.bg_image?.length > 0) {
      let [image] = files?.bg_image
      profileDto.bg_image = image.path.slice(7);
    }
    const { id: userId, profileId } = this.request.user;
    if (!userId) throw new UnauthorizedException(AuthMessage.LogIn)
    let profile = await this.profileRepository.findOneBy({ userId: userId })
    const { bio, birthday, gender, linkedIn_profile, nik_name, x_profile, bg_image, profile_image } = profileDto
    if (profile) {
      if (bio) profile.bio = bio
      if (birthday && isDate(new Date(birthday))) profile.birthday = birthday
      if (gender && Object.values(Genders).includes(gender as Genders)) profile.gender = gender;
      if (linkedIn_profile) profile.linkedIn_profile = linkedIn_profile;
      if (x_profile) profile.x_profile = x_profile;
      if (nik_name) profile.nik_name = nik_name;
      if (profile_image) profile.profile_image = profile_image
      if (bg_image) profile.bg_image = bg_image
    } else {
      profile = this.profileRepository.create({
        bio,
        birthday,
        gender,
        linkedIn_profile,
        nik_name,
        x_profile,
        userId,
        profile_image,
        bg_image
      })

    }
    profile = await this.profileRepository.save(profile)
    if (!profileId) {
      await this.userRepository.update({ id: userId }, { profileId: profile.id })
    }
  }

  showProfile() {
    const { id: userId } = this.request.user;
    return this.userRepository.createQueryBuilder(EntityName.User)
      .where({ id: userId })
      .leftJoinAndSelect("user.profile", "profile")
      .loadRelationCountAndMap("user.followers", "user.followers")
      .loadRelationCountAndMap("user.followings", "user.followings")
      .getOne()
  }
  async getFollowers(paginationDto: PaginationDto) {
    const { id: userId } = this.request?.user
    const { limit, page, skip } = paginationSolver(paginationDto)
    const [followers, count] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: {
        follower: {
          profile: true
        }
      },
      select: {
        id: true,
        follower: {
          id: true,
          username: true,
          profile: {
            id: true,
            nik_name: true,
            bio: true,
            bg_image: true,
            profile_image: true,
          }
        }
      },
      take: limit,
      skip
    })
    return {
      pagination: paginationGenerator(limit, page, count),
      followers
    }
  }
  async getFollowings(paginationDto: PaginationDto) {
    const { id: userId } = this.request?.user
    const { limit, page, skip } = paginationSolver(paginationDto)
    const [following, count] = await this.followRepository.findAndCount({
      where: { followerId: userId },
      relations: {
        following: {
          profile: true
        }
      },
      select: {
        id: true,
        following: {
          id: true,
          username: true,
          profile: {
            id: true,
            nik_name: true,
            bio: true,
            bg_image: true,
            profile_image: true,
          }
        }
      },
      take: limit,
      skip
    })
    return {
      pagination: paginationGenerator(limit, page, count),
      following
    }
  }
  async changeEmail(email: string) {
    const { id } = this.request.user;
    let user = await this.userRepository.findOneBy({ email })
    if (user && user.id !== id) {
      throw new ConflictException(ConflictExceptionMessage.Email)
    } else if (user && user.id == id) {
      return {
        message: PublicMessages.Update
      }
    }
    this.userRepository.update({ id }, { new_email: email })
    const otp = await this.authService.saveOtp(id, AuthMethodEnum.Email, CookieName.EmailOtp);
    const token = this.tokenService.createEmailToken({ email })
    return {
      code: otp.code,
      token
    }

  }
  async changeMobile(mobile: string) {
    const { id } = this.request.user;
    let user = await this.userRepository.findOneBy({ mobile })
    if (user && user.id !== id) {
      throw new ConflictException(ConflictExceptionMessage.Mobile)
    } else if (user && user.id == id) {
      return {
        message: PublicMessages.Update
      }
    }
    this.userRepository.update({ id }, { new_mobile: mobile })
    const otp = await this.authService.saveOtp(id, AuthMethodEnum.Mobile, CookieName.MobileOtp);
    const token = this.tokenService.createMobileToken({ mobile })
    return {
      code: otp.code,
      token
    }

  }
  async changeUsername(username: string) {
    const { id } = this.request.user;
    let user = await this.userRepository.findOneBy({ username })
    if (user && user.id !== id) {
      throw new ConflictException(ConflictExceptionMessage.Username)
    } else if (user && user.id == id) {
      return {
        message: PublicMessages.Update
      }
    }
    this.userRepository.update({ id }, { username })
  }
  async saveCookies(response: Response, changeDto: ChangeDto) {
    let result: ChangeResultType;
    const { username, method } = changeDto
    if (method === ChangeMethodEnum.Email) {
      if (!username) throw new UnauthorizedException(BadRequestMessage.SomethingWrong)
      this.authService.usernameValidator(method, username)
      result = await this.changeEmail(username);
      const { code, message, token } = result
      if (message) return response.json({ message })
      response.cookie(CookieName.EmailOtp, token, cookieOptionsUtil())
      response.json({
        message: PublicMessages.SendCode,
        code: code
      })
    }
    if (method === ChangeMethodEnum.Mobile) {
      if (!username) throw new UnauthorizedException(BadRequestMessage.SomethingWrong)
      this.authService.usernameValidator(method, username)
      result = await this.changeMobile(username);
      const { code, message, token } = result
      if (message) return response.json({ message })
      response.cookie(CookieName.MobileOtp, token, cookieOptionsUtil())
      response.json({
        message: PublicMessages.SendCode,
        code: code
      })
    }
  }


  async verifyEmail(code: string) {
    const { id, new_email } = this.request?.user
    const token = this.request.cookies?.[CookieName.EmailOtp]
    if (!token) throw new UnauthorizedException(AuthMessage.TokenNotFound);
    const { email } = this.tokenService.verifyEmailToken(token)
    if (email !== new_email) throw new BadRequestException(BadRequestMessage.SomethingWrong)
    const otp = await this.checkOtp(id, code);
    if (otp.method !== AuthMethodEnum.Email) {
      throw new BadRequestException(BadRequestMessage.SomethingWrong)
    }
    await this.userRepository.update({ id }, {
      email: new_email,
      verify_email: true,
      new_email: null
    })
    return {
      message: PublicMessages.Update
    }
  }

  async verifyMobile(code: string) {
    const { id, new_mobile } = this.request?.user
    const token = this.request.cookies?.[CookieName.MobileOtp]
    if (!token) throw new UnauthorizedException(AuthMessage.TokenNotFound);
    const { mobile } = this.tokenService.verifyMobileToken(token)
    if (mobile !== new_mobile) throw new BadRequestException(BadRequestMessage.SomethingWrong)
    const otp = await this.checkOtp(id, code);
    if (otp.method !== AuthMethodEnum.Mobile) {
      throw new BadRequestException(BadRequestMessage.SomethingWrong)
    }
    await this.userRepository.update({ id }, {
      mobile: new_mobile,
      verify_mobile: true,
      new_mobile: null
    })
    return {
      message: PublicMessages.Update
    }
  }

  async checkOtp(userId: number, code: string) {
    const otp = await this.otpRepository.findOneBy({ userId })
    if (!otp) throw new NotFoundException(NotFoundMessage.NotFoundOTP)
    if (otp.expiresIn < new Date()) throw new BadRequestException(BadRequestMessage.CodeNotExpires)
    if (otp.code !== code) throw new BadRequestException(AuthMessage.WrongCode)
    return otp
  }
  async followToggle(followingId: number) {
    const { id: userId } = this.request?.user
    const user = await this.userRepository.findOneBy({ id: followingId })
    if (!user || userId === user.id) throw new NotFoundException(NotFoundMessage.NotFoundUser)
    const isFollowed = await this.followRepository.findOneBy({ followingId, followerId: userId })
    let message: string = ""
    if (isFollowed) {
      await this.followRepository.remove(isFollowed)
      message = PublicMessages.UnFollow
    } else {
      await this.followRepository.insert({ followingId, followerId: userId })
      message = PublicMessages.Follow
    }
    return {
      message
    }
  }
  async blockToggle(blockDto: BlockDto) {
    const { userId } = blockDto
    const user = await this.userRepository.findOneBy({ id: userId })
    if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser)
    let message: string = ""
    if (user.status == UserStatus.Block) {
      await this.userRepository.update({ id: userId }, { status: null })
      message = PublicMessages.UnBlock
    }
    if (user.status === null) {
      await this.userRepository.update({ id: userId }, { status: UserStatus.Block })
      message = PublicMessages.Block
    }
    return {
      message
    }
  }
}

