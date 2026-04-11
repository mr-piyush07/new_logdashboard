#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h> // Ensure you install ArduinoJson v7 in your IDE

// --- Configuration ---
// Wi-Fi
#define WIFI_SSID "oppoF17"
#define WIFI_PASSWORD "123456789"

// MQTT - HiveMQ Cloud
#define MQTT_HOST "dd2850a79b434dd99693c51b23d03f8d.s1.eu.hivemq.cloud"
#define MQTT_PORT 8883
#define MQTT_USERNAME "esp32_user_01"
#define MQTT_PASSWORD "Piyush@123"
#define MQTT_TOPIC "devices/esp32_01/telemetry"

// Data Payload
#define DEVICE_ID "esp32_01"

// --- Global Objects ---
WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

unsigned long lastMsgTime = 0;
const unsigned long MSG_INTERVAL = 2000; // 2 seconds

// --- State Variables ---
bool systemPower = false;
int currentServoAngle = 0;

// --- Function Prototypes ---
void setupWiFi();
void connectMQTT();
void publishTelemetry();
void mqttCallback(char* topic, byte* payload, unsigned int length);

void setup() {
  Serial.begin(115200);
  delay(100);
  
  // Seed random generator - kept for other uses if needed, but removed from periodic telemetry
  randomSeed(analogRead(0));

  setupWiFi();

  // Option A (Development Mode): Bypass SSL Certificate Verification
  secureClient.setInsecure();

  // Set MQTT server and callback
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  // Non-blocking timer for telemetry publish
  unsigned long now = millis();
  if (now - lastMsgTime > MSG_INTERVAL) {
    lastMsgTime = now;
    publishTelemetry();
  }
}

void setupWiFi() {
  delay(10);
  Serial.println("\n--- Wi-Fi Setup ---");
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Generate a random Client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);

    // Attempt to connect over TLS
    if (mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("SUCCESS - Connected to HiveMQ Cloud");
      
      // Subscribe to control topic
      String controlTopic = "devices/";
      controlTopic += DEVICE_ID;
      controlTopic += "/control";
      mqttClient.subscribe(controlTopic.c_str());
      Serial.print("Subscribed to: ");
      Serial.println(controlTopic);
    } else {
      Serial.print("FAILED, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" - Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.println(topic);

  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Payload: ");
  Serial.println(message);

  // Parse JSON command
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }

  // Handle Power Command
  if (doc["command"] == "power") {
    String state = doc["state"];
    if (state == "ON") {
      systemPower = true;
      Serial.println("SYSTEM POWER: ON");
    } else if (state == "OFF") {
      systemPower = false;
      Serial.println("SYSTEM POWER: OFF");
    }
  }
}

void publishTelemetry() {
  // Use ArduinoJson v7 syntax
  JsonDocument doc;
  
  // Populate JSON payload
  doc["device_id"] = DEVICE_ID;
  doc["servo_angle"] = currentServoAngle; // No longer random
  doc["status"] = systemPower ? "active" : "standby";
  doc["uptime"] = millis();

  // Serialize to a string
  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);

  // Publish
  Serial.print("Publishing telemetry: ");
  Serial.println(jsonBuffer);
  
  // Publish payload to Topic
  mqttClient.publish(MQTT_TOPIC, jsonBuffer);
}

