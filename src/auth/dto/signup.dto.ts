import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator"


export class SignUpDto{

    @IsNotEmpty()
    @IsString()
    readonly name : string
    
    @IsNotEmpty()
    @IsEmail({}, {message:"Please enter correct mail"})
    readonly email : string

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly password : string

    
}