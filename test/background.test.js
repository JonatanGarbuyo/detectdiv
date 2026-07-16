import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const backgroundSource = readFileSync(
	new URL("../public/background.js", import.meta.url),
	"utf8"
);

const flushMicrotasks = async () => {
	for (let index = 0; index < 4; index += 1) {
		await Promise.resolve();
	}
};

const createBackgroundHarness = ({ url = "https://example.com/", storage = {} } = {}) => {
	const tabId = 1;
	const tabs = new Map([[tabId, { id: tabId, url }]]);
	const storedValues = { ...storage };
	const tabUpdates = [];
	let onUpdated;
	let onRemoved;
	let onMessage;

	const chrome = {
		runtime: {
			lastError: null,
			onMessage: { addListener: (listener) => { onMessage = listener; } },
		},
		storage: {
			local: {
				get: (keys, callback) => {
					const result = Object.fromEntries(
						keys.filter((key) => key in storedValues).map((key) => [key, storedValues[key]])
					);
					queueMicrotask(() => callback(result));
				},
				set: (items, callback = () => {}) => {
					Object.assign(storedValues, items);
					queueMicrotask(callback);
				},
				remove: (keys, callback = () => {}) => {
					keys.forEach((key) => delete storedValues[key]);
					queueMicrotask(callback);
				},
			},
		},
		tabs: {
			onUpdated: { addListener: (listener) => { onUpdated = listener; } },
			onRemoved: { addListener: (listener) => { onRemoved = listener; } },
			get: (requestedTabId, callback) => {
				const tab = tabs.get(requestedTabId);
				queueMicrotask(() => callback(tab ? { ...tab } : undefined));
			},
			update: (requestedTabId, properties, callback = () => {}) => {
				const updatedTab = { ...tabs.get(requestedTabId), ...properties };
				tabs.set(requestedTabId, updatedTab);
				tabUpdates.push({ tabId: requestedTabId, properties: { ...properties } });
				queueMicrotask(() => callback({ ...updatedTab }));
			},
		},
	};

	vm.runInNewContext(backgroundSource, {
		chrome,
		console,
		Map,
		Object,
		Promise,
		URL,
	});

	const dispatchMessage = (request) => new Promise((resolve, reject) => {
		const keepsChannelOpen = onMessage(request, {}, resolve);
		if (keepsChannelOpen !== true) {
			reject(new Error(`Message was not handled: ${request.action}`));
		}
	});

	const dispatchTabUpdate = async (nextUrl = tabs.get(tabId).url) => {
		onUpdated(tabId, { status: "loading" }, { ...tabs.get(tabId), url: nextUrl });
		await flushMicrotasks();
	};

	const dispatchTabRemoval = async () => {
		onRemoved(tabId);
		await flushMicrotasks();
	};

	return {
		tabId,
		storedValues,
		tabUpdates,
		currentUrl: () => tabs.get(tabId).url,
		dispatchMessage,
		dispatchTabUpdate,
		dispatchTabRemoval,
	};
};

test("manual URL values take precedence and update per-tab storage", async () => {
	const harness = createBackgroundHarness({
		url: "https://example.com/?d=manual&outputType=article",
		storage: { deployment_1: "stored", outputType_1: "amp-type" },
	});

	await harness.dispatchTabUpdate();

	assert.equal(harness.storedValues.deployment_1, "manual");
	assert.equal(harness.storedValues.outputType_1, "article");
	assert.equal(harness.tabUpdates.length, 0);
});

test("stored values are restored when parameters are missing from the URL", async () => {
	const harness = createBackgroundHarness({
		url: "https://example.com/?unrelated=kept",
		storage: {
			deployment_1: "123",
			outputType_1: "amp-type",
			token_1: "token-value",
			mxId_1: "mx-value",
			googleConsole_1: "1",
		},
	});

	await harness.dispatchTabUpdate();

	const url = new URL(harness.currentUrl());
	assert.equal(url.searchParams.get("unrelated"), "kept");
	assert.equal(url.searchParams.get("d"), "123");
	assert.equal(url.searchParams.get("outputType"), "amp-type");
	assert.equal(url.searchParams.get("token"), "token-value");
	assert.equal(url.searchParams.get("mxId"), "mx-value");
	assert.equal(url.searchParams.get("google_console"), "1");
	assert.equal(harness.tabUpdates.length, 1);
});

test("an invalid stored Google Console value is not restored", async () => {
	const harness = createBackgroundHarness({ storage: { googleConsole_1: "0" } });

	await harness.dispatchTabUpdate();

	assert.equal(new URL(harness.currentUrl()).searchParams.has("google_console"), false);
	assert.equal(harness.tabUpdates.length, 0);
});

test("popup messages save values and apply parameters to the current URL", async () => {
	const harness = createBackgroundHarness({ url: "https://example.com/?existing=1" });

	const saveResponse = await harness.dispatchMessage({
		action: "saveOutputType",
		tabId: 1,
		outputType: "amp-type",
	});
	const updateResponse = await harness.dispatchMessage({
		action: "updateUrlParams",
		tabId: 1,
		params: { outputType: "amp-type" },
	});
	assert.equal(saveResponse.success, true);
	assert.equal(updateResponse.success, true);

	const url = new URL(harness.currentUrl());
	assert.equal(harness.storedValues.outputType_1, "amp-type");
	assert.equal(url.searchParams.get("existing"), "1");
	assert.equal(url.searchParams.get("outputType"), "amp-type");
});

test("concurrent URL updates are serialized without losing parameters", async () => {
	const harness = createBackgroundHarness();

	await Promise.all([
		harness.dispatchMessage({ action: "updateUrlParams", tabId: 1, params: { d: "123" } }),
		harness.dispatchMessage({ action: "updateUrlParams", tabId: 1, params: { outputType: "amp-type" } }),
		harness.dispatchMessage({ action: "updateUrlParams", tabId: 1, params: { google_console: "1" } }),
	]);

	const url = new URL(harness.currentUrl());
	assert.equal(url.searchParams.get("d"), "123");
	assert.equal(url.searchParams.get("outputType"), "amp-type");
	assert.equal(url.searchParams.get("google_console"), "1");
});

test("closing a tab removes all parameter storage keys", async () => {
	const harness = createBackgroundHarness({
		storage: {
			deployment_1: "123",
			outputType_1: "amp-type",
			token_1: "token-value",
			mxId_1: "mx-value",
			googleConsole_1: "1",
			outputTypes: ["amp-type"],
		},
	});

	await harness.dispatchTabRemoval();

	assert.deepEqual(harness.storedValues, { outputTypes: ["amp-type"] });
});
