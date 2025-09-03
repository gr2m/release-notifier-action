import test from "ava";
import { MockAgent, setGlobalDispatcher } from "undici";

test("release notification dispatch", async (t) => {
  // Setup MockAgent for undici
  const mockAgent = new MockAgent();
  setGlobalDispatcher(mockAgent);

  // Disable net connect
  mockAgent.disableNetConnect();

  // Get the mock pool for GitHub API
  const mockPool = mockAgent.get("https://api.github.com");

  // SETUP
  process.env.GITHUB_ACTION = "release-notification";
  process.env.GITHUB_EVENT_PATH = new URL(
    "./event.json",
    import.meta.url,
  ).pathname;
  process.env.GITHUB_REPOSITORY = "gr2m/Release-Notifier-Action";

  process.env.INPUT_APP_ID = 1;
  process.env.INPUT_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1c7+9z5Pad7OejecsQ0bu3aozN3tihPmljnnudb9G3HECdnH
lWu2/a1gB9JW5TBQ+AVpum9Okx7KfqkfBKL9mcHgSL0yWMdjMfNOqNtrQqKlN4kE
p6RD++7sGbzbfZ9arwrlD/HSDAWGdGGJTSOBM6pHehyLmSC3DJoR/CTu0vTGTWXQ
rO64Z8tyXQPtVPb/YXrcUhbBp8i72b9Xky0fD6PkEebOy0Ip58XVAn2UPNlNOSPS
ye+Qjtius0Md4Nie4+X8kwVI2Qjk3dSm0sw/720KJkdVDmrayeljtKBx6AtNQsSX
gzQbeMmiqFFkwrG1+zx6E7H7jqIQ9B6bvWKXGwIDAQABAoIBAD8kBBPL6PPhAqUB
K1r1/gycfDkUCQRP4DbZHt+458JlFHm8QL6VstKzkrp8mYDRhffY0WJnYJL98tr4
4tohsDbqFGwmw2mIaHjl24LuWXyyP4xpAGDpl9IcusjXBxLQLp2m4AKXbWpzb0OL
Ulrfc1ZooPck2uz7xlMIZOtLlOPjLz2DuejVe24JcwwHzrQWKOfA11R/9e50DVse
hnSH/w46Q763y4I0E3BIoUMsolEKzh2ydAAyzkgabGQBUuamZotNfvJoDXeCi1LD
8yNCWyTlYpJZJDDXooBU5EAsCvhN1sSRoaXWrlMSDB7r/E+aQyKua4KONqvmoJuC
21vSKeECgYEA7yW6wBkVoNhgXnk8XSZv3W+Q0xtdVpidJeNGBWnczlZrummt4xw3
xs6zV+rGUDy59yDkKwBKjMMa42Mni7T9Fx8+EKUuhVK3PVQyajoyQqFwT1GORJNz
c/eYQ6VYOCSC8OyZmsBM2p+0D4FF2/abwSPMmy0NgyFLCUFVc3OECpkCgYEA5OAm
I3wt5s+clg18qS7BKR2DuOFWrzNVcHYXhjx8vOSWV033Oy3yvdUBAhu9A1LUqpwy
Ma+unIgxmvmUMQEdyHQMcgBsVs10dR/g2xGjMLcwj6kn+xr3JVIZnbRT50YuPhf+
ns1ScdhP6upo9I0/sRsIuN96Gb65JJx94gQ4k9MCgYBO5V6gA2aMQvZAFLUicgzT
u/vGea+oYv7tQfaW0J8E/6PYwwaX93Y7Q3QNXCoCzJX5fsNnoFf36mIThGHGiHY6
y5bZPPWFDI3hUMa1Hu/35XS85kYOP6sGJjf4kTLyirEcNKJUWH7CXY+00cwvTkOC
S4Iz64Aas8AilIhRZ1m3eQKBgQCUW1s9azQRxgeZGFrzC3R340LL530aCeta/6FW
CQVOJ9nv84DLYohTVqvVowdNDTb+9Epw/JDxtDJ7Y0YU0cVtdxPOHcocJgdUGHrX
ZcJjRIt8w8g/s4X6MhKasBYm9s3owALzCuJjGzUKcDHiO2DKu1xXAb0SzRcTzUCn7daCswKBgQDOYPZ2JGmhibqKjjLFm0qzpcQ6RPvPK1/7g0NInmjPMebP0K6eSPx0
9/49J6WTD++EajN7FhktUSYxukdWaCocAQJTDNYP0K88G4rtC2IYy5JFn9SWz5oh
x//0u+zd/R/QRUzLOw4N72/Hu+UG6MNt5iDZFCtapRaKt6OvSBwy8w==
-----END RSA PRIVATE KEY-----`;
  process.env.INPUT_DISPATCH_EVENT_TYPE = "test-release";

  // set other env variables so action-toolkit is happy
  process.env.GITHUB_REF = "";
  process.env.GITHUB_WORKSPACE = "";
  process.env.GITHUB_WORKFLOW = "";
  process.env.GITHUB_ACTOR = "";
  process.env.GITHUB_SHA = "";

  // Mock GitHub API endpoints using undici
  mockPool
    .intercept({
      path: "/app/installations",
      method: "GET",
    })
    .reply(200, [{ id: 123 }], {
      headers: {
        "Content-Type": "application/json",
      },
    });

  mockPool
    .intercept({
      path: "/app/installations/123/access_tokens",
      method: "POST",
    })
    .reply(
      201,
      {
        token: "token123",
        expires_at: "2020-11-06T00:37:40Z",
        permissions: { contents: "write", metadata: "read" },
        repository_selection: "selected",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

  mockPool
    .intercept({
      path: "/installation/repositories",
      method: "GET",
    })
    .reply(
      200,
      [
        {
          id: 1,
          owner: { login: "gr2m" },
          name: "release-notifier-action",
          html_url: "https://github.com/gr2m/release-notifier-action",
          private: false,
        },
        {
          id: 1,
          owner: { login: "gr2m" },
          name: "release-notifier-action-private",
          html_url: "https://github.com/gr2m/release-notifier-action-private",
          private: true,
        },
        {
          id: 1,
          owner: { login: "gr2m" },
          name: "release-notifier-action-error",
          html_url: "https://github.com/gr2m/release-notifier-action-error",
          private: false,
        },
      ],
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

  mockPool
    .intercept({
      path: "/repos/gr2m/release-notifier-action/dispatches",
      method: "POST",
      body: JSON.stringify({
        event_type: "test-release",
        client_payload: { action: "published", release: { tag_name: "1.0.0" } },
      }),
    })
    .reply(204);

  mockPool
    .intercept({
      path: "/repos/gr2m/release-notifier-action-private/dispatches",
      method: "POST",
      body: JSON.stringify({
        event_type: "test-release",
        client_payload: { action: "published", release: { tag_name: "1.0.0" } },
      }),
    })
    .reply(204);

  mockPool
    .intercept({
      path: "/repos/gr2m/release-notifier-action-error/dispatches",
      method: "POST",
      body: JSON.stringify({
        event_type: "test-release",
        client_payload: { action: "published", release: { tag_name: "1.0.0" } },
      }),
    })
    .reply(500);

  console.log("Note: 1 Dispatch error is expected");

  try {
    const { default: promise } = await import("../../main.js");
    await promise;
    t.pass("Main module executed successfully");
  } catch (error) {
    t.fail(`Main module execution failed: ${error.message}`);
  }

  // Verify all interceptors were called
  t.true(
    mockAgent.pendingInterceptors().length === 0,
    "All HTTP interceptors should be called",
  );

  // Clean up
  await mockAgent.close();
});
