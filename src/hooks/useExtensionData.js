import { useState, useEffect, useCallback } from "react";
import {
  sendMessage,
  getActiveTab,
  getTab,
  updateTab,
  getStorageLocal,
  setStorageLocal,
} from "../utils/chrome";

export const useExtensionData = () => {
  const [deploymentNumber, setDeploymentNumber] = useState("");
  const [currentTabId, setCurrentTabId] = useState(null);
  const [outputTypes, setOutputTypes] = useState(["amp-type"]);
  const [selectedOutputType, setSelectedOutputType] = useState("");
  const [mxIds, setMxIds] = useState([]);
  const [selectedMxId, setSelectedMxId] = useState("");

  const [token, setToken] = useState("");

  const updateUrlParam = useCallback(async (tabId, param, value) => {
    const tab = await getTab(tabId);
    if (tab?.url) {
      try {
        const url = new URL(tab.url);
        if (!url.protocol.startsWith("http")) {
          return;
        }

        url.searchParams.delete(param);
        if (value && value.trim() !== "") {
          url.searchParams.set(param, value);
        }

        await updateTab(tabId, { url: url.toString() });
      } catch (error) {
        console.error("Error updating URL:", error);
      }
    }
  }, []);

  const saveDeployment = useCallback(
    async (tabId, deployment) => {
      const response = await sendMessage({
        action: "saveDeployment",
        tabId: tabId,
        deployment: deployment,
      });

      if (response?.success) {
        updateUrlParam(tabId, "d", deployment);
      }
    },
    [updateUrlParam]
  );

  const saveOutputType = useCallback(
    async (tabId, outputType) => {
      const response = await sendMessage({
        action: "saveOutputType",
        tabId: tabId,
        outputType: outputType,
      });

      if (response?.success) {
        updateUrlParam(tabId, "outputType", outputType);
      }
    },
    [updateUrlParam]
  );

  const saveMxId = useCallback(
    async (tabId, mxId) => {
      const response = await sendMessage({
        action: "saveMxId",
        tabId: tabId,
        mxId: mxId,
      });

      if (response?.success) {
        updateUrlParam(tabId, "mxId", mxId);
      }
    },
    [updateUrlParam]
  );

  const saveToken = useCallback(
    async (tabId, tokenValue) => {
      console.log("saveToken called", { tabId, tokenValue });
      const response = await sendMessage({
        action: "saveToken",
        tabId: tabId,
        token: tokenValue,
      });
      console.log("saveToken response", response);

      if (response?.success) {
        console.log("saveToken success, updating URL");
        updateUrlParam(tabId, "token", tokenValue);
      } else {
        console.error("saveToken failed or no response");
      }
    },
    [updateUrlParam]
  );

  useEffect(() => {
    const init = async () => {
      const tab = await getActiveTab();
      if (tab?.id) {
        const tabId = tab.id;
        setCurrentTabId(tabId);

        // Load saved deployment number
        const deploymentResponse = await sendMessage({
          action: "getDeployment",
          tabId: tabId,
        });

        if (deploymentResponse?.deployment) {
          setDeploymentNumber(deploymentResponse.deployment);
        } else if (tab.url) {
          try {
            const url = new URL(tab.url);
            const existingDeployment = url.searchParams.get("d");
            if (existingDeployment) {
              setDeploymentNumber(existingDeployment);
              saveDeployment(tabId, existingDeployment);
            }
          } catch (error) {
            console.error("Error parsing URL:", error);
          }
        }

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

        // Load saved outputType for this tab
        const outputTypeResponse = await sendMessage({
          action: "getOutputType",
          tabId: tabId,
        });

        if (outputTypeResponse?.outputType) {
          setSelectedOutputType(outputTypeResponse.outputType);
        } else if (tab.url) {
          try {
            const url = new URL(tab.url);
            const existingOutputType = url.searchParams.get("outputType");
            if (existingOutputType) {
              setSelectedOutputType(existingOutputType);
              saveOutputType(tabId, existingOutputType);
            }
          } catch (error) {
            console.error("Error parsing URL:", error);
          }
        }

        // Load saved token for this tab
        const tokenResponse = await sendMessage({
          action: "getToken",
          tabId: tabId,
        });

        if (tokenResponse?.token) {
          setToken(tokenResponse.token);
        } else if (tab.url) {
          try {
            const url = new URL(tab.url);
            const existingToken = url.searchParams.get("token");
            if (existingToken) {
              setToken(existingToken);
              saveToken(tabId, existingToken);
            }
          } catch (error) {
            console.error("Error parsing URL:", error);
          }
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

        // Load saved mxId for this tab
        const mxIdResponse = await sendMessage({
          action: "getMxId",
          tabId: tabId,
        });

        if (mxIdResponse?.mxId) {
          setSelectedMxId(mxIdResponse.mxId);
        } else if (tab.url) {
          try {
            const url = new URL(tab.url);
            const existingMxId = url.searchParams.get("mxId");
            if (existingMxId) {
              setSelectedMxId(existingMxId);
              saveMxId(tabId, existingMxId);
            }
          } catch (error) {
            console.error("Error parsing URL:", error);
          }
        }
      }
    };

    init();
  }, [saveDeployment, saveOutputType, saveToken, saveMxId]);

  const handleDeploymentChange = (value) => {
    setDeploymentNumber(value);
    if (currentTabId !== null) {
      saveDeployment(currentTabId, value);
    }
  };

  const handleOutputTypeChange = (value) => {
    setSelectedOutputType(value);
    if (currentTabId !== null) {
      saveOutputType(currentTabId, value);
    }
  };

  const handleMxIdChange = (value) => {
    setSelectedMxId(value);
    if (currentTabId !== null) {
      saveMxId(currentTabId, value);
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
      saveToken(currentTabId, newToken);
    } else {
      console.log("Clearing token");
      setToken("");
      saveToken(currentTabId, "");
    }
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
      saveOutputType(currentTabId, "");
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
      saveMxId(currentTabId, "");
    }

    setStorageLocal({ mxIds: updatedMxIds });
  };

  const clearAll = async () => {
    setDeploymentNumber("");
    setSelectedOutputType("");
    setToken("");
    if (currentTabId !== null) {
      await sendMessage({
        action: "saveDeployment",
        tabId: currentTabId,
        deployment: "",
      });
      await sendMessage({
        action: "saveOutputType",
        tabId: currentTabId,
        outputType: "",
      });
      await sendMessage({
        action: "saveToken",
        tabId: currentTabId,
        token: "",
      });
      await sendMessage({
        action: "saveMxId",
        tabId: currentTabId,
        mxId: "",
      });
      
      setSelectedMxId("");
      
      const tab = await getTab(currentTabId);
      if (tab?.url) {
        try {
            const url = new URL(tab.url);
            if (!url.protocol.startsWith("http")) return;
            
            url.searchParams.delete("d");
            url.searchParams.delete("outputType");
            url.searchParams.delete("token");
            url.searchParams.delete("mxId");
            
            await updateTab(currentTabId, { url: url.toString() });
        } catch (error) {
            console.error("Error updating URL:", error);
        }
      }
    }
  };

  return {
    deploymentNumber,
    outputTypes,
    selectedOutputType,
    token,
    handleDeploymentChange,
    handleOutputTypeChange,
    toggleToken,
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
