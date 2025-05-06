import { PrismaClient, Role, User, Prisma, RefreshToken } from '@prisma-client/client'
import { Request, Response } from "express";
import z from "zod"
import validateWithSchema from "../utils/validation";
import logger from "../utils/logger";
import jwt from "jsonwebtoken"
import { hashPassword, verifyPassword } from "../utils/hashPassword";
import dotenv from 'dotenv'
dotenv.config()


const secret = process.env.JWT_SECRET!

const NODE_ENV = process.env.NODE_ENV!


const prisma = new PrismaClient();


const sellerSignUpSchema = z.object({
  name: z.string().min(3, "Name Must Be Atleast 3 Digits Long"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must have at least 8 digits"),
  role: z.enum(["USER", "SELLER"] as const, {
    required_error: "Role is required",
    invalid_type_error: "Role must be either USER or SELLER"
  })
});


// type signUpInput = z.infer<typeof sellerSignUpSchema>

const createUser = async (req: Request, res: Response): Promise<void> => {

  logger.info("createSeller account endpoint hit.")

  try {

    const validateData = validateWithSchema(sellerSignUpSchema, req.body);

    const findExistingEmail = await prisma.user.findFirst({
      where: {
        email: validateData.email
      }
    })

    if (findExistingEmail) {

      res.status(409).json({
        success: false,
        message: "Dear user email already exist."
      })

      logger.warn("User trying to create account with existing email")
      return;

    }

    const hashedPassword = await hashPassword(validateData.password)

    const savedData = await prisma.user.create({
      data: {
        ...validateData,
        password: hashedPassword,
        role: validateData.role as Role
      }
    })

    res.json({
      sucess: true,
      message: "Acccount created successfully",
      userId: savedData.id,
      userName: savedData.name
    })

    logger.info("User created account successfully")

  } catch (error: unknown) {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`Prisma error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Database error happend. Please Try Again.'
      })
    }
    else if (error instanceof z.ZodError) {
      logger.error(`Validation error happend: ${error.message}`)
      res.status(400).json({
        success: false,
        message: 'Validation error happend.',
        error: error.errors
      })
    }
    else {
      logger.error(`Some unknown error happend: ${error}`)
      res.status(500).json({
        success: false,
        message: "Some unknown error happend at our side."
      })
      return;
    }

  }
}

const loginSellerSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(8, 'password must be 8 digits.')
})

type login = z.infer<typeof loginSellerSchema>


const loginUser = async (req: Request, res: Response): Promise<void> => {
  logger.info("logged in endpoint is hit.")
  try {

    const validatedLoginDetails = validateWithSchema(loginSellerSchema, req.body);

    const findExistingEmail = await prisma.user.findFirst({
      where: {
        email: validatedLoginDetails.email
      }
    })

    if (!findExistingEmail) {

      res.status(404).json({
        success: false,
        message: "No email could be found. Please create an account"
      })

      logger.warn("User trying to login in account with existing email")
      return;

    }

    const hashedDbpassword: string = findExistingEmail.password;

    const validateLogin: boolean = await verifyPassword(validatedLoginDetails.password, hashedDbpassword)

    if (!validateLogin) {
      logger.warn("Invalid password entered by user.");
      res.status(400).json({
        success: false,
        message: "Invalid password"
      })
      return;
    }

    // generate access and refreshTokens

    const { accessToken, refreshToken } = await generateTokens(req, findExistingEmail)

    res.cookie("refreshToken", refreshToken.id, {
      secure: NODE_ENV === 'production',
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    })

    res.json({
      success: true,
      message: "logged in successfully",
      accessToken: accessToken,
    })


  } catch (error: unknown) {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`Prisma error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Database error happend. Please Try Again.'
      })
    }
    else if (error instanceof z.ZodError) {
      logger.error(`Validation error happend: ${error.message}`)
      res.status(400).json({
        success: false,
        message: 'Validation error happend.',
        error: error.errors
      })
    }
    else {
      logger.error(`Some unknown error happend: ${error}`)
      res.status(500).json({
        success: false,
        message: "Some unknown error happend at our side."
      })
      return;
    }
  }
}

const generateTokens = async (req: Request, userDetails: User): Promise<{ accessToken: string, refreshToken: RefreshToken }> => {

  try {

    const accessToken = jwt.sign({ userId: userDetails.id, role: userDetails.role, email: userDetails.email }, secret, {
      algorithm: 'HS256',
      expiresIn: "15m"
    })



    const refreshToken = await prisma.$transaction(async (tx) => {
      const refreshToken = await tx.refreshToken.create({
        data: {
          userId: userDetails.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }
      })

      await tx.session.create({
        data: {
          refreshTokenId: refreshToken.id,
          expiredAt: refreshToken.expiresAt,
          ipAddress: req.ip || null,
          userAgent: req.headers['user-agent'] || null,
        }
      })

      return refreshToken;
    })

    return {
      refreshToken: refreshToken,
      accessToken: accessToken
    }

  } catch (error: unknown) {
    logger.error(`Error while creating tokens ${error}`)
    throw new Error(`Error while creating tokens ${error}`)
  }

}

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  logger.info("Logout endpoint is hit.")

  try {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "No refresh cookie could be found"
      })
      logger.warn("trying to logout without the refreshToken cookie.")
      return;
    }

    const validateRefreshToken = await prisma.refreshToken.findUnique({
      where: {
        id: refreshToken
      }
    })

    if (!validateRefreshToken) {
      res.status(400).json({
        success: false,
        message: "Invalid refresh token!"
      })
      logger.warn("Invalid Refresh token provided by user")
      return;
    }
    else if (validateRefreshToken.revoked == true || validateRefreshToken.expiresAt <= new Date()) {
      res.status(400).json({
        success: false,
        message: "Expired or already used refresh tokens"
      })
      logger.error("Expired/Used refreshToken provided by user.")
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: {
          id: validateRefreshToken.id
        },
        data: {
          revoked: true,
        }
      })
      await tx.session.update({
        where: {
          refreshTokenId: validateRefreshToken.id
        },
        data: {
          revoked: true,
          revokedAt: new Date()
        }
      })
    })

    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out successfully"
    })

  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`Prisma error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Database error happend. Please Try Again.'
      })
    }
    else {
      logger.error(`Some unknown error happend: ${error}`)
      res.status(500).json({
        success: false,
        message: "Some unknown error happend at our side."
      })
      return;
    }

  }
}


const generateNewAccessToken = async(req:Request, res:Response):Promise<void>=>{
    logger.info("generate new access token endpoint is hit.");
  try {

    const refreshTokenCookie:string|undefined = req.cookies.refreshToken;

    if(!refreshTokenCookie){
      res.status(404).json({
        success:false,
        message:"refresh token is missing to generate new tokens."
      })
      logger.warn("user is trying to create access tokens without providing refresh token.")
      return;
    }

    const validateRefreshToken = await prisma.refreshToken.findUniqueOrThrow({
      where:{
        id:refreshTokenCookie
      }
    })

    if(!validateRefreshToken){
      res.status(404).json({
        success:false,
        message:"could not find refreshTokens."
      })
      logger.warn("refresh token not found in db")
    }
    else if (validateRefreshToken.revoked == true || validateRefreshToken.expiresAt <= new Date()) {
      res.status(400).json({
        success: false,
        message: "Expired or already used refresh tokens. Please login again"
      })
      logger.error("Expired/Used refreshToken provided by user.")
      return;
    }

    const userDetails:User|null = await prisma.user.findUnique({
      where:{
        id:validateRefreshToken.userId
      }
    })

    if(!userDetails){

      res.status(409).json({
        success:false,
        message:"user id could not be found tied to refreshToken. ghost refresh token"
      })

      logger.warn("ghost refresh token")
      return;
      
    }


    const accessToken = jwt.sign({ userId: userDetails.id, role: userDetails.role, email: userDetails.email }, secret, {
      algorithm: 'HS256',
      expiresIn: "15m"
    })


    res.json({
      success:true,
      message:"Success access token generated",
      accessToken:accessToken
    })

    
  } catch (error:unknown) {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`Prisma error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Database error happend. Please Try Again.'
      })
    }
    else {
      logger.error(`Some unknown error happend: ${error}`)
      res.status(500).json({
        success: false,
        message: "Some unknown error happend at our side."
      })
      return;
    }
    
  }
}

export { loginUser, createUser , logoutUser, generateNewAccessToken}