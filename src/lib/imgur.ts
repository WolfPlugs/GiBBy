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

// await imgurUpload(
//     'https://cdn.discordapp.com/attachments/964256299909013574/1160401713803563079/image.png?ex=6534874f&is=6522124f&hm=a6e88f8a0b3191969157c944cdf9574039c09ca65b48b0acee6ba15ca29b55a3&',
// );
