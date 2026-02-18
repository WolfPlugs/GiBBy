import { createHash } from "node:crypto";
import { Client } from "minio";

const minioClient = new Client({
	endPoint: process.env.BUCKET_ENDPOINT!,
	port: Number(process.env.BUCKET_PORT),
	useSSL: process.env.BUCKET_SSL === "true",
	accessKey: process.env.BUCKET_ACCESS_KEY!,
	secretKey: process.env.BUCKET_SECRET_KEY!,
});

function mimeToExt(extension: string | null) {
	switch (extension) {
		case "image/webp":
			return ".webp";
		case "image/png":
			return ".png";
		case "image/jpeg":
			return ".jpg";
		case "image/gif":
			return ".gif";
		case "image/apng":
			return ".apng";
		default:
			throw new TypeError("Unacceptable MIME");
	}
}

export async function BucketUpload(url: string): Promise<string> {
	const name = createHash("sha1")
		.update((Math.random() + 1).toString(36).substring(2) + url)
		.digest("hex");
	return await fetch(url).then(async (data) => {
		const ext = mimeToExt(data.headers.get("Content-Type"));
		await minioClient.putObject(
			process.env.BUCKET_NAME!,
			name + ext,
			Buffer.from(await data.arrayBuffer()),
		); // Don't ask me how this buffer thing works, I don't know yet
		return `${process.env.BUCKET_DOMAIN!}/${name + ext}`;
	});
}

export async function BucketDelete(url: string) {
	const obj = url.split(`${process.env.BUCKET_DOMAIN!}/`)[1];
	if (!obj) {
		throw new URIError("URL does not seem to contain an object");
	}
	await minioClient.removeObject(process.env.BUCKET_NAME!, obj);
}
