import { getProfileByUsername } from "./getProfileByUsername";
import { fetchTwitterFollowers } from "../twitter/fetchTwitterFollowers";
export const checkUsername = async (username: string) => {
    try {
        const twitterFollowers = await fetchTwitterFollowers(username);
        const hasTwitterFollowers = twitterFollowers > 0;
        console.log('Has followers:', hasTwitterFollowers);


        const profile = await getProfileByUsername(username);
        console.log('Has profile:', profile?.exist);

        if (profile?.exist) {
            console.log('Username', username, 'already exists in mongo or has no followers');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error checking username:', error);
        return false;
    }
};