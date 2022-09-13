![Docker build](https://github.com/tekks/weebly/actions/workflows/docker-publish.yml/badge.svg)

![logo](https://i.imgur.com/tCk8MvU.png)

# 🤖 weebly

> weebly is a Discord reccomendations Bot for multi Server environments built with TypeScript, discord.js & uses Command Handler from [discordjs.guide](https://discordjs.guide)

## Requirements

1. Discord Bot Token **[Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)**
2. JSON file somewhere online e.b github gists **[example](https://gist.github.com/Tekks/d13dab137a0eebd8ddcf43ef9531e075)**

## 🐬 Docker Configuration

For those who would prefer to use our [Docker container](https://hub.docker.com/repository/docker/eritislami/evobot), you may provide values from `config.json` as environment variables.

```shell
docker run --name="weebly" -e "DC_TOKEN=<discord-token>" ghcr.io/tekks/weebly:latest
```

## 📝 Features & Commands

> Note: The Bot uses only slash-commands {/}

- 🪄 sets up the bot for the text2img and reccomendations commands

`/setup <ai> <recommendations>`

- 📃 set up a list of recommended sereven based on the JSON file. Update will sync all servers.
- Needs the `setup <recommendations>` command to be run first

`/recommended <add> <remove> <update>`

- ✏ translate a message to weeb language using [uwufier](https://github.com/Schotsl/Uwuifier)

`/uwu <message>`

- 📷 load a randomized image of an anime girl from  [waifu.pics](https://waifu.pics/)

`/cat`

- 🤖 generates an text based image from kinda scratch with the models from [stable-diffusion](https://github.com/CompVis/stable-diffusion)
- Needs the `setup <ai>` command to be run first

`/text2img <text> <iterations>`
