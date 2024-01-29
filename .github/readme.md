# GiBBy

> GlobalBadgeBot (GiBBy for short) is an internally used bot for Global Badges

## Hosting

1. Create a discord bot with the following permissions ([Detailed guide from Discord.JS](https://discordjs.guide/preparations/setting-up-a-bot-application.html)):
    - Send Messages (To send messages in the request channel)
    - `application.commands` (To create commands)
2. Add the bot to your server
3. Clone this repository (`git clone https://github.com/WolfPlugs/GiBBy`)
4. Set configs in `config/config.json` (copy `config.example.json` and rename the copy to `config.json`)
    - `DiscordToken`: The bot's Discord token
    - `MongoDB`: The MongoDB connection string (default: `mongodb://localhost:27017`)
    - `ClientId`: The bot's Discord ID
    - `DatabaseName`: The name of the MongoDB database
    - `CollectionName`: The collection name of the MongoDB database
    - `MaxBadges`: The maximum badges a user can have (default: `5`)
    - `ExtraBoostBadges`: The amount of badges added to booster's allowance (default: `5`)
    - `PromptChannel`: The channel to send the badge requests to
    - `VerifierRole`: The role ID of people who can approve requests
    - `Domains`: An array of whitelisted domains for badges
    - `BucketEndpoint`: The URL to upload to the bucket
    - `BucketPort`: The port to upload to the bucket. (default: `443`)
    - `BucketAccessKey`: The bucket's access key
    - `BucketSecretKey`: The bucket's secret key
    - `BucketName`: The bucket's name
    - `BucketDomain`: The bucket's public facing URL
5. Install packages using a node package manager (I suggest [PNPM](https://pnpm.io/)): `pnpm i`
6. Build: `pnpm build`
7. Run: `pnpm start`
