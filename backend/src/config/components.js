const componentsConfig = {
  temperature: { type: 'Number', unit: "°C", min: -50, max: 150 },
  humidity: { type: 'Number', unit: "%", min: 0, max: 100 },
  smoke_density: { type: 'Number', unit: "ppm", min: 0, max: 1000 },
  light_intensity: { type: 'Number', unit: "lux", min: 0, max: 10000 },
  motion: { type: 'Boolean', unit: "state", min: 0, max: 1 },
};

module.exports = {
  componentsConfig,
  COMPONENT_KEYS: Object.keys(componentsConfig),
};
