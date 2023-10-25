export interface ImgurResponse {
    deletehash: string;
    link: string;
}

export interface RawImgurResponse {
    data: ImgurResponse;
    success: boolean;
}
