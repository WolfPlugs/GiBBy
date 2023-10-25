import type { Credentials } from '../types/config.js';
import type { ImgurResponse, RawImgurResponse } from '../types/imgur.js';

import untypedCredentials from '../../config/credentials.json' assert { type: 'json' };
const credentials: Credentials = untypedCredentials as Credentials;

export async function imgurUpload(
    imageUrl: string,
): Promise<false | ImgurResponse> {
    const data = new FormData();
    data.append('image', imageUrl);
    try {
        return await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                Authorization: `Client-ID ${credentials.ImgurClientID}`,
            },
            body: data,
        })
            .then((response) => response.json())
            .then((data) => {
                return (data as RawImgurResponse).data;
            });
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function imgurDelete(imageHash: string): Promise<void> {
    try {
        await fetch(`https://api.imgur.com/3/image/${imageHash}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Client-ID ${credentials.ImgurClientID}`,
            },
        });
    } catch (error) {
        console.error(error);
    }
}
