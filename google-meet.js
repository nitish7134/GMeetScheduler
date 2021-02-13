// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra')
const awsPlugin = require('puppeteer-extra-plugin-aws');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())
puppeteer.use(awsPlugin());

class GoogleMeet {
    constructor(email, pass, head, strict) {
        this.email = email;
        this.pass = pass;
        this.head = head;
        this.strict = strict;
        this.browser;
        this.page;
    }
    async schedule(url) {
        try {
            // Open browser
            this.browser = await puppeteer.launch({
                headless: this.head,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--use-fake-ui-for-media-stream',
                    '--disable-audio-output'
                ],
            });
            this.page = await this.browser.newPage()
            await this.page.goto('https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin')

            await this.page.waitForTimeout(10000)

            // Login Start
            await this.page.type("input#identifierId", this.email, {
                delay: 0
            })
            await this.page.click("div#identifierNext")

            await this.page.waitForTimeout(4000)

            await this.page.type("input[name=password]", this.pass, {
                delay: 0
            })
            await this.page.click("div#passwordNext")

            await this.page.waitForTimeout(1500)

            await this.page.goto(url)

            console.log("inside meet page")

            await this.page.waitForTimeout(10000)
    
            console.log('clicking on join')
            await this.page.click("span.NPEfkd.RveJvd.snByac")

            console.log("Successfully joined/Sent join request")
        }
        catch(err) {
            console.log(err)
        }
    }

    async end() {
        await this.browser.close();
    }
}

module.exports = GoogleMeet;

