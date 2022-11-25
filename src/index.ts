//? Dependencies

import fs from 'fs'

import express from 'express'
import bodyParser from 'body-parser'

import * as Discord from 'discord.js'


//? Config

const Config: { port: number, token: string, verification: string, channel: string } = JSON.parse(fs.readFileSync('config.json', 'utf8'))



//? Initialize

//! Express
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))

app.listen(Config.port, () => console.log(`Listening on port ${Config.port}`))


//! Discord
const client = new Discord.Client({ intents: [Discord.IntentsBitField.Flags.GuildMessages] })
client.login(Config.token)

client.on('ready', () => console.log(`Logged in as ${client.user ? client.user.tag : '"UNKNOWN"'}`))



//? Webhooks

app.post('/donation', async (req, res) => {

    const Data = JSON.parse(req.body.data)

    if (Data.verification_token !== Config.verification) return res.status(403).send('Invalid verification token!')


    //! Prep Discord Channel

    const Channel = await client.channels.fetch(Config.channel)
    if (!Channel?.isTextBased()) return res.status(500).send('Text Channel not found!'), console.log('Text Channel not found!')



    let Embed: Discord.EmbedBuilder | undefined = undefined


    if (Data.type === 'Donation') {

        Embed = new Discord.EmbedBuilder()
            .setTitle(`${Data.from_name} donated $${Data.amount} ${Data.currency}!`)
            .setColor(Discord.resolveColor('#41e049'))
            .setThumbnail('https://yt3.ggpht.com/SFThBPrdZzhrnNqBfmV3ImP3xLxgRBeD9eaSi8pQUisSJfOzl0c8gQ3EqyQykEewsnQEkanp=s900-c-k-c0x00ffffff-no-rj')
            .setDescription(Data.message ? `>>> ${Data.message}\n[Donate to Horizons](https://ko-fi.com/horizons)` : `[Donate to Horizons](https://ko-fi.com/horizons)`)
            .setFooter({
                text: `Thankyou for Donating 🥰`
            })

    }

    if (Data.type === 'Subscription' && Data.is_first_subscription_payment === true) {

        Embed = new Discord.EmbedBuilder()
            .setTitle(`${Data.from_name} subscribed with $${Data.amount} ${Data.currency} per month!`)
            .setColor(Discord.resolveColor('#34c3eb'))
            .setThumbnail('https://yt3.ggpht.com/SFThBPrdZzhrnNqBfmV3ImP3xLxgRBeD9eaSi8pQUisSJfOzl0c8gQ3EqyQykEewsnQEkanp=s900-c-k-c0x00ffffff-no-rj')
            .setDescription(Data.message ? `>>> ${Data.message}\n[Donate to Horizons](https://ko-fi.com/horizons)` : `[Donate to Horizons](https://ko-fi.com/horizons)`)
            .setFooter({
                text: `Thankyou for Donating 🥰`
            })

    }





    if (!Embed) return res.status(500).send('Invalid Embed!'), console.log('Invalid Embed!')

    return Channel.send({ embeds: [Embed] })
        .then(() => res.status(200).send('Success!'))
        .catch(() => res.status(500).send('Failed to send message!'))


})