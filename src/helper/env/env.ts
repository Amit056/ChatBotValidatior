import * as dotenv from 'dotenv';

export const getEnv =() => {
    const env = process.env.ENV || 'qa';
    dotenv.config({ path: `src/helper/env/.env.${env}` });      
    return process.env;
}