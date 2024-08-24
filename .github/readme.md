# GiBBy

> GlobalBadgeBot (GiBBy for short) is an internally used bot for Global Badges

## Hosting

1. Create a discord bot with the following permissions ([Detailed guide from Discord.JS](https://discordjs.guide/preparations/setting-up-a-bot-application.html)):
    - Send Messages (To send messages in the request channel)
    - `application.commands` (To create commands)
2. Add the bot to your server
3. Clone this repository (`git clone https://github.com/WolfPlugs/GiBBy`)
4. Set configs in `.env` (copy `.env.example` and rename the copy to `.env`)
    - `DISCORD_TOKEN`: The bot's Discord token
    - `MONGO_DB`: The MongoDB connection string (default: `mongodb://localhost:27017`)
    - `CLIENT_ID`: The bot's Discord ID
    - `DATABASE_NAME`: The name of the MongoDB database
    - `COLLECTION_NAME`: The collection name of the MongoDB database
    - `MAX_BADGES`: The maximum badges a user can have (default: `5`)
    - `EXTRA_BOOST_BADGES`: The amount of badges added to booster's allowance (default: `5`)
    - `MAX_BADGE_SIZE`: The maximum badge size, in binary bytes. (default: `5242880` 5mb)
    - `PROMPT_CHANNEL`: The channel to send the badge requests to
    - `VERIFIER_ROLE`: The role ID of people who can approve requests
    - `BUCKET_ENDPOINT`: The URL to upload to the bucket
    - `BUCKET_PORT`: The port to upload to the bucket. (default: `443`)
    - `BUCKET_SSL`: Whether or not to use SSL. (default: `true`)
    - `BUCKET_ACCESS_KEY`: The bucket's access key
    - `BUCKET_SECRET_KEY`: The bucket's secret key
    - `BUCKET_NAME`: The bucket's name
    - `BUCKET_DOMAIN`: The bucket's public facing URL. (default: `https://s3.example.com`)
    - `BLACKLISTED_WORDS`: List of strings the badge name cannot contain
5. Install packages using a node package manager (I suggest [PNPM](https://pnpm.io/)): `pnpm i`
6. Build: `pnpm build`
7. Run: `pnpm start`
