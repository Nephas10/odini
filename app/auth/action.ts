"use server"
import {createClient} from "@/lib/supabase/server"
type SignupData = {
    name: string
    email: string
    phone: string
    password: string
}

export async function signupAction(data: SignupData) {
    const supabase = await createClient()

    const { name, email, phone, password } = data

    // Create authentication user
    const { data: authData, error: authError } =
        await supabase.auth.signUp({
            email,
            password,
        })

    if (authError) {
        return {
            success: false,
            error: authError.message,
        }
    }

    if (!authData.user) {
        return {
            success: false,
            error: "Unable to create user.",
        }
    }

    // Create profile
    const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
            id: authData.user.id,
            firstname: name,
            phone_number: phone,
        })

    if (profileError) {
        return {
            success: false,
            error: profileError.message,
        }
    }

    return {
        success: true,
    }
}

type LoginData = {
    email: string
    password: string
}

export async function loginAction(data: LoginData){
    const supabase = await createClient()

    const {email, password} = data
    
    const {error} = await supabase.auth.signInWithPassword({
        email,
        password
    })
     if (error) {
    return {
      success: false,
      error: error.message,
    }
    }

    return {
        success: true,
    }
}