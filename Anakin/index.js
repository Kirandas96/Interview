const puppeteer = require('puppeteer');
const PuppeteerHar = require('puppeteer-har');




 

 



(async () => {
//     const browser =  await puppeteer.launch({ headless: true});
// const page = await browser.newPage();
// await page.tracing.start({ categories: ['devtools.timeline'], path: "./tracing.json" });

// await page.goto("https://food.grab.com/sg/en/restaurant/mcdonald-s-siglap-delivery/SGDD04950");
// var tracing = JSON.parse(await page.tracing.stop());
// console.log(tracing);

    const browser = await puppeteer.launch();
    const [page] = await browser.pages();

    const results = []; // collects all results

    let paused = false;
    let pausedRequests = [];

    const nextRequest = () => { // continue the next request or "unpause"
        if (pausedRequests.length === 0) {
            paused = false;
        } else {
            // continue first request in "queue"
            (pausedRequests.shift())(); // calls the request.continue function
        }
    };

    await page.setRequestInterception(true);
    page.on('request', request => {
        if (paused) {
            pausedRequests.push(() => request.continue());
        } else {
            paused = true; // pause, as we are processing a request now
            request.continue();
        }
    });

    page.on('requestfinished', async (request) => {
        const response = await request.response();

        const responseHeaders = response.headers();
        let responseBody;
        if (request.redirectChain().length === 0) {
            // body can only be access for non-redirect responses
            responseBody = await response.buffer();
        }

        const information = {
            url: request.url(),
            data:page.tracing,
            payload:request.postData(),
            requestHeaders: request.headers(),
            requestPostData: request.postData(),
            responseHeaders: responseHeaders,
            responseSize: responseHeaders['content-length'],
            responseBody,
        };
        results.push(information);

        nextRequest(); // continue with next request
    });
    page.on('requestfailed', (request) => {
        // handle failed request
        nextRequest();
    });

   

    await page.goto('https://food.grab.com/sg/en/restaurant/paradise-dynasty-funan-delivery/4-CYUTT6CDRUXXL6', { waitUntil:"networkidle0" });
    console.log(results)
    let performanceTiming = JSON.parse(
        await page.evaluate(() => JSON.stringify(window.performance.getEntries()))
    );

    console.log(performanceTiming);

    await browser.close();
})();







// ####################################

// const URL="https://food.grab.com/sg/en/restaurant/mcdonald-s-siglap-delivery/SGDD04950"

// async function Scraping(){
//     await puppeteer.launch({
//         headless:false
//     })

//     .then(async(browser)=>{
//         const page=await browser.newPage()

//         page.on("response",(response)=>{
//             console.log(response.status());
//         })

//         await page.goto(URL,{
//             waitUntil:"load",
//         })
        
//     })
// }

// Scraping()