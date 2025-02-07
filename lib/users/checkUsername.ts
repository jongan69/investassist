import { getProfileByUsername } from "./getProfileByUsername";

export const checkUsername = async (username: string) => {
    try {
        const profile = await getProfileByUsername(username);
        if (profile && profile.exists) {
            
            return false;
        }
       
        return true;
    } catch (error) {
        console.error('Error checking username:', error);
       
        return false;
    }
};