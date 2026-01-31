const BASE_URL = import.meta.env.DEV ? "http://localhost/" : "https://timepad.tturna.com/"
const API_URL = BASE_URL + "api/"
const CAL_URL = API_URL + "calendar/"
const AUTH_URL = BASE_URL + "auth/"
const REALM_URL = AUTH_URL + "realms/timemanager/"

export const URLS = {
    makeGetEventsUrl: (queryParams?: string) => CAL_URL + "events" + (queryParams ? queryParams : ""),
    makeGetEventTypesUrl: () => CAL_URL + "eventtypes",
    makeAddEventUrl: () => CAL_URL + "addevent",
    makeEditEventUrl: (id: string) => CAL_URL + "editevent/" + id,
    makeDeleteEventUrl: (id: string) => CAL_URL + "deleteevent/" + id,

    makeAuthorityUrl: () => REALM_URL + "protocol/openid-connect/auth",
    makeMetadataUrl: () => REALM_URL + ".well-known/openid-configuration",
    makePostLoginRedirectUrl: () => BASE_URL + "openid/callback",
    makePostLogoutRedirectUrl: () => BASE_URL,
}
