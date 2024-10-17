import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError"
import { User } from "../models/User.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

//method called registerUser
const registerUser = asyncHandler(async (req, res) => {
  /* 
        TODO Steps : 
         1. get user details from the frontend.
         2. validation - (making sure they are !empty)
         3. check if user already exists. (username/email)
         4. check for images, check for avatar
         5. upload them to cloudinary, avatar
         6. create user object - create entry in DB. 
         7. remove password and refresh token field from response. 
         8. check for user creation 
         9. return response (if success else return error)
    */

    // ! Getting User Details From the Frontend.
    const {fullName, email, username, password} = req.body
    console.log(fullName, email);

    // ! Validating the user from the details passed from the frontend.
    //can also use map but more code, and here using some method on array we are getting boolean as return type. If true that means there is an empty field in the array of fields that we passed.
    if(
      [fullName, email, username,password].some((field) => field?.trim() == "")
    ){
      throw new ApiError(400, "All Fields are required")
    }
    // in production grade code we have a seperate file for validations and then we call the methods from that file like (email Validation or password validation) and we add it here to check if the passed data is correct as per the validation or not.

    // ! Check if the user is an exisiting user or not
    const existingUser = User.findOne({
      $or : [{ username }, { email }]
    })

    if(existingUser){
      throw new ApiError(409, "User with email or username already exists.")
    }

    // ! Check if the user is having avatar & coverImages or not when registering.
    // if uploaded onto the server get the local path of both the images so that they can be uploaded to the cloudinary later.
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    if(!avatarLocalPath){
      throw new ApiError(400, "Avatar Is Required")
    }
  
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
      throw new ApiError(400, "Avatar Is Required")
    }

   const user = User.create({
      fullName,
      avatar : avatar.url,
      coverImage : coverImage?.url || "",
      email,
      password,
      username : username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
   }

   return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
   )

  });

export { registerUser };
