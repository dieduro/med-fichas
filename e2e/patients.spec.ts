import {test, expect} from "@playwright/test";

const userId = "63ec1aa8-07fe-4c01-8f3b-7e6da32b5a16";
const user = {
  id: userId,
  aud: "authenticated",
  app_metadata: {},
  user_metadata: {},
  email: "patient-test@example.test",
  created_at: "2026-01-01",
};
const patient = {
  id: "6413203a-ab73-43dc-b92a-466c2282c99f",
  full_name: "Paciente remoto",
  email: "",
  phone_number: "",
  gender: "other",
  dob: null,
  notes: "Historia inicial",
  health_insurance: "",
  user_id: "system",
};

function sessionCookie(account: typeof user) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const token = [
    Buffer.from(JSON.stringify({alg: "HS256", typ: "JWT"})).toString("base64url"),
    Buffer.from(JSON.stringify({sub: account.id, exp})).toString("base64url"),
    "test-signature",
  ].join(".");
  const session = {
    access_token: token,
    refresh_token: "test-refresh-token",
    expires_in: 3600,
    expires_at: exp,
    token_type: "bearer",
    user: account,
  };

  return {
    name: "sb-patients-auth-token",
    value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
    domain: "localhost",
    path: "/",
  };
}

test("patient navigation, durable edits and reload work offline; reconnect sends the latest edit", async ({
  page,
  context,
}) => {
  let activeUser = user;
  const records = new Map([[patient.id, patient]]);
  const writes: Record<string, unknown>[] = [];

  await context.route("https://patients.example.test/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === "/auth/v1/user") return route.fulfill({json: activeUser});
    if (url.pathname === "/auth/v1/logout") return route.fulfill({status: 204});
    if (request.method() === "POST") {
      const data: typeof patient = request.postDataJSON();

      records.set(data.id, data);
      writes.push(data);

      return route.fulfill({json: {id: data.id}});
    }

    return route.fulfill({
      json: url.searchParams.has("id")
        ? []
        : [...records.values()].filter(
            (record) =>
              !url.searchParams.has("user_id") ||
              url.searchParams.get("user_id") === `eq.${record.user_id}`,
          ),
    });
  });
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), {timeout: 15000})
    .toBe(true);
  await context.addCookies([sessionCookie(user)]);
  await page.reload();
  await expect(page.getByRole("link", {name: patient.full_name, exact: true})).toBeVisible();

  await context.setOffline(true);
  await page.getByRole("button", {name: "Nuevo Paciente", exact: true}).first().click();
  await expect(page).toHaveURL(/\/patient\/new$/);
  await page.getByLabel("Nombre", {exact: true}).fill("Paciente offline");
  await page.getByLabel("Historia clínica").fill("Edición uno");
  await page.getByRole("button", {name: "Guardar", exact: true}).click();
  await expect(page.locator('input[name="id"]')).not.toHaveValue("");
  const id = await page.locator('input[name="id"]').inputValue();

  await page.getByRole("link", {name: "Volver", exact: true}).click();
  await expect(page.getByRole("link", {name: "Paciente offline", exact: true})).toBeVisible();
  await page.getByRole("link", {name: "Paciente offline", exact: true}).click();
  await expect(page).toHaveURL(new RegExp(`/patient/${id}$`));
  await expect(page.getByLabel("Historia clínica")).toHaveValue("Edición uno");
  await page.getByLabel("Historia clínica").fill("Edición final");
  await page.getByRole("button", {name: "Guardar", exact: true}).click();
  await expect(page.getByRole("button", {name: "Guardar", exact: true})).toBeEnabled();
  await page.reload();
  await expect(page.getByLabel("Historia clínica")).toHaveValue("Edición final");
  expect(writes).toHaveLength(0);
  await context.setOffline(false);
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0]).toMatchObject({id, notes: "Edición final", user_id: "system"});

  await page.getByRole("button", {name: "Logout", exact: true}).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/");
  await expect(
    page.getByRole("link", {name: "Iniciá sesión para ver tus pacientes"}),
  ).toBeVisible();
  await expect(page.getByRole("link", {name: "Paciente offline", exact: true})).toHaveCount(0);

  activeUser = {
    ...user,
    id: "f086aa09-87d0-4444-8b3b-8b07397ec1e1",
    email: "second-account@example.test",
  };
  await context.addCookies([sessionCookie(activeUser)]);
  await page.reload();
  await expect(page.getByRole("link", {name: patient.full_name, exact: true})).toBeVisible();
  await expect(page.getByRole("link", {name: "Paciente offline", exact: true})).toBeVisible();
});
