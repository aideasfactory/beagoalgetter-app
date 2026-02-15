const { withEntitlementsPlist, createRunOncePlugin } = require("expo/config-plugins");

const withInAppPurchases = (config) => {
  return withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.in-app-purchase"] = true;
    return config;
  });
};

module.exports = createRunOncePlugin(withInAppPurchases, "withInAppPurchases", "1.0.0");
