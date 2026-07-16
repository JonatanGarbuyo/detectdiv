import { useState, useEffect, useCallback } from "react";
import {
  sendMessage,
  getActiveTab,
  getStorageLocal,
  setStorageLocal,
} from "../utils/chrome";

const PARAMETERS = {
  deployment: { param: "d", saveAction: "saveDeployment", getAction: "getDeployment", field: "deployment" },
  outputType: { param: "outputType", saveAction: "saveOutputType", getAction: "getOutputType", field: "outputType" },
  token: { param: "token", saveAction: "saveToken", getAction: "getToken", field: "token" },
  mxId: { param: "mxId", saveAction: "saveMxId", getAction: "getMxId", field: "mxId" },
  googleConsole: { param: "google_console", saveAction: "saveGoogleConsole", getAction: "getGoogleConsole", field: "googleConsole", isValid: (value) => value === "1" },
};

const isParameterValueValid = (definition, value) =>
  definition.isValid ? definition.isValid(value) : typeof value === "string" && value.trim() !== "";

export const useExtensionData = () => {
  const [deploymentNumber, setDeploymentNumber] = useState("");
  const [currentTabId, setCurrentTabId] = useState(null);
  const [outputTypes, setOutputTypes] = useState(["amp-type"]);
  const [selectedOutputType, setSelectedOutputType] = useState("");
  const [mxIds, setMxIds] = useState([]);
  const [selectedMxId, setSelectedMxId] = useState("");

  const [token, setToken] = useState("");
  const [googleConsoleEnabled, setGoogleConsoleEnabled] = useState(false);

  const updateUrlParam = useCallback(async (tabId, param, value) => {
    await sendMessage({
      action: "updateUrlParams",
      tabId: tabId,
      params: { [param]: value },
    });
  }, []);

  const saveParameter = useCallback(
    async (tabId, definition, value, updateUrl = true) => {
      const response = await sendMessage({
        action: definition.saveAction,
        tabId: tabId,
        [definition.field]: value,
      });

      if (response?.success && updateUrl) {
        await updateUrlParam(tabId, definition.param, value);
      }

      return response;
    },
    [updateUrlParam]
  );

  useEffect(() => {
    const init = async () => {
      const tab = await getActiveTab();
      if (tab?.id) {
        const tabId = tab.id;
        setCurrentTabId(tabId);

        let url = null;
        try {
          url = tab.url ? new URL(tab.url) : null;
        } catch (error) {
          console.error("Error parsing URL:", error);
        }

        const stateParameters = [
          { definition: PARAMETERS.deployment, setValue: setDeploymentNumber },
          { definition: PARAMETERS.outputType, setValue: setSelectedOutputType },
          { definition: PARAMETERS.token, setValue: setToken },
          { definition: PARAMETERS.mxId, setValue: setSelectedMxId },
          { definition: PARAMETERS.googleConsole, setValue: (value) => setGoogleConsoleEnabled(value === "1") },
        ];

        await Promise.all(stateParameters.map(async ({ definition, setValue }) => {
          const response = await sendMessage({ action: definition.getAction, tabId: tabId });
          const storedValue = response?.[definition.field];
          const urlValue = url?.searchParams.get(definition.param);
          const value = isParameterValueValid(definition, storedValue) ? storedValue : urlValue;

          if (isParameterValueValid(definition, value)) {
            setValue(value);
            if (!isParameterValueValid(definition, storedValue)) {
              await saveParameter(tabId, definition, value, false);
            }
          }
        }));

        // Load saved outputTypes
        const storageResult = await getStorageLocal(["outputTypes"]);
        if (
          storageResult.outputTypes &&
          Array.isArray(storageResult.outputTypes) &&
          storageResult.outputTypes.length > 0
        ) {
          setOutputTypes(storageResult.outputTypes);
        } else {
          const defaultTypes = ["amp-type"];
          setOutputTypes(defaultTypes);
          setStorageLocal({ outputTypes: defaultTypes });
        }

        // Load saved mxIds
        const mxIdsResult = await getStorageLocal(["mxIds"]);
        if (
          mxIdsResult.mxIds &&
          Array.isArray(mxIdsResult.mxIds) &&
          mxIdsResult.mxIds.length > 0
        ) {
          setMxIds(mxIdsResult.mxIds);
        }

      }
    };

    init();
  }, [saveParameter]);

  const handleDeploymentChange = (value) => {
    setDeploymentNumber(value);
    if (currentTabId !== null) {
      saveParameter(currentTabId, PARAMETERS.deployment, value);
    }
  };

  const handleOutputTypeChange = (value) => {
    setSelectedOutputType(value);
    if (currentTabId !== null) {
      saveParameter(currentTabId, PARAMETERS.outputType, value);
    }
  };

  const handleMxIdChange = (value) => {
    setSelectedMxId(value);
    if (currentTabId !== null) {
      saveParameter(currentTabId, PARAMETERS.mxId, value);
    }
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const toggleToken = (enabled) => {
    console.log("toggleToken called", { enabled, currentTabId });
    if (currentTabId === null) return;

    if (enabled) {
      const newToken = generateToken();
      console.log("Generated new token", newToken);
      setToken(newToken);
      saveParameter(currentTabId, PARAMETERS.token, newToken);
    } else {
      console.log("Clearing token");
      setToken("");
      saveParameter(currentTabId, PARAMETERS.token, "");
    }
  };

  const toggleGoogleConsole = (enabled) => {
    if (currentTabId === null) return;

    setGoogleConsoleEnabled(enabled);
    saveParameter(currentTabId, PARAMETERS.googleConsole, enabled ? "1" : "");
  };

  const addOutputType = (newType) => {
    const trimmedValue = newType.trim();
    if (trimmedValue && !outputTypes.includes(trimmedValue)) {
      const updatedTypes = [...outputTypes, trimmedValue];
      setOutputTypes(updatedTypes);
      setStorageLocal({ outputTypes: updatedTypes });
    }
  };

  const deleteOutputType = (typeToDelete) => {
    if (outputTypes.length <= 1) return;

    const updatedTypes = outputTypes.filter((type) => type !== typeToDelete);
    setOutputTypes(updatedTypes);

    if (selectedOutputType === typeToDelete && currentTabId !== null) {
      setSelectedOutputType("");
      saveParameter(currentTabId, PARAMETERS.outputType, "");
    }

    setStorageLocal({ outputTypes: updatedTypes });
  };

  const addMxId = (newMxId) => {
    if (newMxId && newMxId.id && !mxIds.some((item) => item.id === newMxId.id)) {
      const updatedMxIds = [...mxIds, newMxId];
      setMxIds(updatedMxIds);
      setStorageLocal({ mxIds: updatedMxIds });
    }
  };

  const deleteMxId = (idToDelete) => {
    const updatedMxIds = mxIds.filter((item) => item.id !== idToDelete);
    setMxIds(updatedMxIds);

    if (selectedMxId === idToDelete && currentTabId !== null) {
      setSelectedMxId("");
      saveParameter(currentTabId, PARAMETERS.mxId, "");
    }

    setStorageLocal({ mxIds: updatedMxIds });
  };

  const clearAll = async () => {
    setDeploymentNumber("");
    setSelectedOutputType("");
    setToken("");
    setGoogleConsoleEnabled(false);
    setSelectedMxId("");
    if (currentTabId !== null) {
      const definitions = Object.values(PARAMETERS);
      await Promise.all(definitions.map((definition) =>
        saveParameter(currentTabId, definition, "", false)
      ));

      await sendMessage({
        action: "updateUrlParams",
        tabId: currentTabId,
        params: Object.fromEntries(definitions.map((definition) => [definition.param, ""])),
      });
    }
  };

  return {
    deploymentNumber,
    outputTypes,
    selectedOutputType,
    token,
    googleConsoleEnabled,
    handleDeploymentChange,
    handleOutputTypeChange,
    toggleToken,
    toggleGoogleConsole,
    addOutputType,
    deleteOutputType,
    clearAll,
    mxIds,
    selectedMxId,
    handleMxIdChange,
    addMxId,
    deleteMxId,
  };
};
