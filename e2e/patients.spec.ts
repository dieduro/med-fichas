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
  const unnamed = {...patient, id: "c507b775-00d5-49ba-9a0d-46823d0f2c74", full_name: ""};
  const records = new Map([
    [patient.id, patient],
    [unnamed.id, unnamed],
  ]);
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
  await expect(page.getByRole("link", {name: "Paciente sin nombre", exact: true})).toBeVisible();
  await page.getByRole("link", {name: "Paciente sin nombre", exact: true}).click();
  await expect(page.getByLabel("Nombre", {exact: true})).toHaveValue("");
  await expect(page.getByLabel("Historia clínica")).toHaveValue(patient.notes);
  expect(records.get(unnamed.id)?.full_name).toBe("");
  await page.getByRole("link", {name: "Volver", exact: true}).click();

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

  await page.getByRole("link", {name: "Volver", exact: true}).click();
  await page.getByRole("link", {name: "Paciente sin nombre", exact: true}).click();
  await page.getByLabel("Nombre", {exact: true}).fill("Paciente recuperado");
  await page.getByRole("button", {name: "Guardar", exact: true}).click();
  await expect.poll(() => records.get(unnamed.id)?.full_name).toBe("Paciente recuperado");
  await page.getByRole("link", {name: "Volver", exact: true}).click();
  await expect(page.getByRole("link", {name: "Paciente recuperado", exact: true})).toBeVisible();

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

test("unreadable responses show a friendly retry instead of JSON or an empty registry", async ({
  page,
  context,
}) => {
  let corrected = false;

  await context.route("https://patients.example.test/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/auth/v1/user") return route.fulfill({json: user});

    return route.fulfill({
      json: url.searchParams.has("id")
        ? []
        : [{...patient, id: corrected ? patient.id : "invalid-id"}],
    });
  });
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), {timeout: 15000})
    .toBe(true);
  await context.addCookies([sessionCookie(user)]);
  await page.reload();
  await expect(
    page.getByText(
      "No se pudieron cargar los pacientes porque algunos datos tienen un formato incompatible.",
      {exact: true},
    ),
  ).toBeVisible();
  await expect(page.getByText("No hay pacientes registrados", {exact: true})).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText('"code"');
  await expect(page.locator("body")).not.toContainText("invalid-id");
  corrected = true;
  await page.getByRole("button", {name: "Reintentar", exact: true}).click();
  await expect(page.getByRole("link", {name: patient.full_name, exact: true})).toBeVisible();
  await expect(page.getByRole("button", {name: "Reintentar", exact: true})).toHaveCount(0);
});

test("mobile list supports accented search, insurance search and clear without losing navigation", async ({
  page,
  context,
}) => {
  const mobilePatient = {...patient, full_name: "María González", health_insurance: "OSDE"};

  await context.route("https://patients.example.test/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/auth/v1/user") return route.fulfill({json: user});

    return route.fulfill({json: url.searchParams.has("id") ? [] : [mobilePatient]});
  });
  await page.setViewportSize({width: 390, height: 844});
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), {timeout: 15000})
    .toBe(true);
  await context.addCookies([sessionCookie(user)]);
  await page.reload();
  const patientLink = page.getByRole("link", {name: mobilePatient.full_name, exact: true});
  const search = page.getByRole("searchbox", {name: "Buscar pacientes por nombre u obra social"});

  await expect(patientLink).toBeVisible();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({width, height: 844});
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    if (width < 640) {
      const bounds = await patientLink.boundingBox();

      expect(bounds?.height).toBeGreaterThanOrEqual(64);
      expect(bounds?.x).toBeLessThanOrEqual(30);
      await expect(page.getByRole("columnheader", {name: "Obra Social"})).toBeHidden();
    } else {
      await expect(page.getByRole("columnheader", {name: "Obra Social"})).toBeVisible();
    }
  }
  await page.setViewportSize({width: 390, height: 844});
  await search.fill("  maria gonzalez  ");
  await expect(patientLink).toBeVisible();
  await search.press("Enter");
  await expect(search).toHaveValue("  maria gonzalez  ");
  await search.fill("osde");
  await expect(patientLink).toBeVisible();
  await search.fill("sin coincidencias");
  await expect(page.getByRole("heading", {name: "No encontramos pacientes"})).toBeVisible();
  await expect(patientLink).toHaveCount(0);
  await page.getByRole("button", {name: "Limpiar búsqueda"}).click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("");
  await expect(patientLink).toBeVisible();
  await patientLink.click();
  await expect(page.getByLabel("Nombre", {exact: true})).toHaveValue(mobilePatient.full_name);
});

test("patient form fits phones and saves personal, contact and clinical details", async ({
  page,
  context,
}) => {
  let storedPatient = {...patient};

  await context.route("https://patients.example.test/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === "/auth/v1/user") return route.fulfill({json: user});
    if (request.method() === "POST") {
      storedPatient = request.postDataJSON();

      return route.fulfill({json: {id: storedPatient.id}});
    }

    return route.fulfill({json: url.searchParams.has("id") ? [] : [storedPatient]});
  });
  await page.setViewportSize({width: 390, height: 844});
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), {timeout: 15000})
    .toBe(true);
  await context.addCookies([sessionCookie(user)]);
  await page.reload();
  await page.getByRole("link", {name: patient.full_name, exact: true}).click();
  await expect(page.getByRole("heading", {name: patient.full_name, exact: true})).toBeVisible();

  for (const width of [320, 390, 640, 1280]) {
    await page.setViewportSize({width, height: 844});
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    for (const label of [
      "Nombre",
      "Fecha de nacimiento",
      "Género",
      "Teléfono",
      "Email",
      "Obra Social",
      "Historia clínica",
    ]) {
      const control = page.getByLabel(label, {exact: true});
      const bounds = await control.boundingBox();

      expect(bounds?.height).toBeGreaterThanOrEqual(44);
      expect(bounds?.x).toBeGreaterThanOrEqual(0);
      expect((bounds?.x ?? width) + (bounds?.width ?? width)).toBeLessThanOrEqual(width);
    }
    const dob = await page.getByLabel("Fecha de nacimiento").boundingBox();
    const gender = await page.getByRole("combobox", {name: "Género"}).boundingBox();

    if (width < 640) {
      expect(gender?.y).toBeGreaterThan((dob?.y ?? 0) + (dob?.height ?? 0));
    } else {
      expect(gender?.y).toBe(dob?.y);
    }
  }
  await page.setViewportSize({width: 390, height: 844});
  const save = page.getByRole("button", {name: "Guardar", exact: true});

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(save).toBeInViewport();
  await page.getByLabel("Nombre", {exact: true}).fill("María González");
  await page.getByLabel("Fecha de nacimiento").fill("1990-05-14");
  await page.getByRole("combobox", {name: "Género"}).click();
  await page.getByRole("option", {name: "Femenino"}).click();
  await page.getByLabel("Teléfono").fill("11 5555 1234");
  await page.getByLabel("Email", {exact: true}).fill("maria@example.test");
  await page.getByLabel("Obra Social").fill("OSDE");
  await page.getByLabel("Historia clínica").fill("Consulta de seguimiento.\nEvolución favorable.");
  await expect(save).toBeInViewport();
  await save.click();
  await expect.poll(() => storedPatient.full_name).toBe("María González");
  expect(storedPatient).toMatchObject({
    dob: "1990-05-14",
    gender: "female",
    phone_number: "11 5555 1234",
    email: "maria@example.test",
    health_insurance: "OSDE",
    notes: "Consulta de seguimiento.\nEvolución favorable.",
  });
  await page.reload();
  await expect(page.getByLabel("Nombre", {exact: true})).toHaveValue("María González");
  await expect(page.getByLabel("Historia clínica")).toHaveValue(storedPatient.notes);
  await page.getByRole("link", {name: "Volver", exact: true}).click();
  await page.getByRole("button", {name: "Nuevo Paciente", exact: true}).click();
  await expect(page.getByRole("heading", {name: "Nuevo paciente", exact: true})).toBeVisible();
  await expect(page.getByLabel("Nombre", {exact: true})).toBeEmpty();
  await expect(page.getByLabel("Nombre", {exact: true})).toHaveAttribute("required", "");
});
