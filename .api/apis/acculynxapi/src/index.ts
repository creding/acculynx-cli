import SDK from './sdk.js';

/**
 * AccuLynx API V2
 *
 * If you are experiencing issues integrating with this API, please work with your web
 * developer to review your programming before reaching out to us with an issue as we do
 * not provide web development consulting services.
 *
 * API keys are for our customers only. If you are a business that is looking to integrate
 * with AccuLynx, either on behalf of our customers or on your own, please [click
 * here](https://docs.google.com/forms/d/e/1FAIpQLSeTvS614N9crtmFR4PVjgetlTKEhhjVGCFaodP8QLdFG_Qb8Q/viewform)
 * to request access. Failure to do so can result in suspension of the AccuLynx account.
 *
 * The AccuLynx API provides customers programmatic access to their data within AccuLynx.
 *
 * The base url for these endpoints: is <b>https://api.acculynx.com/api/v2</b>
 *
 * Using SwaggerHub, you have the ability to test against a virtual server or you can test
 * against the API itself. The virtual server is a mock server that allows you to test your
 * calls without affecting your production data. Testing against the virtual server will
 * always respond with a fixed response regardless of your inputs. It is provided to give
 * you a production model of the information returned.
 *
 * Testing against the API requires an API Key and will affect your real production data.
 * Get your API key from your [AccuLynx API page](https://my.acculynx.com/apikeys). From
 * the Servers list box below, select the api.acculynx.com site. When you click on green
 * Authorize button next to the Servers list box, you will be prompted for a Bearer token.
 * Enter your API Key and click Authorize again.
 *
 * To make it easier to connect AccuLynx to other applications you use, we have made our
 * Zapier integration publicly available. Instead of contacting us to help you enable the
 * use of Zapier to integrate additional applications with AccuLynx, you can now get
 * started by going to the Zapier website ([https://zapier.com](https://zapier.com)) and
 * searching for the AccuLynx application. Zaps are automated tasks that you run over and
 * over again between AccuLynx and other online applications. We have an action that allows
 * you to pair with a trigger to create leads in AccuLynx and a trigger as well as other
 * actions and triggers coming in the near future! To get started search for AccuLynx on
 * the Zapier website!
 *
 * If you don’t already have a Zapier account, create one or log into your
 * [https://zapier.com/account](https://zapier.com/account).
 *
 * AccuLynx Action ZAP basic documentation:
 * [https://support.acculynx.com/hc/en-us/articles/360034839751-Creating-a-Zap-with-Zapier](https://support.acculynx.com/hc/en-us/articles/360034839751-Creating-a-Zap-with-Zapier)
 *
 * @author <api@acculynx.com>
 * @see {@link https://api.acculynx.com/}
 * @see {@link https://my.acculynx.com/signin/TermsView Terms of Service}
 * @license Proprietary
 * @see {@link https://my.acculynx.com/signin/TermsView}
 */
const createSDK = (() => { return new SDK(); })();

export default createSDK;
